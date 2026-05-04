// src/lib/mirakl/sync-inventory.ts
// Pushes inventory + price changes from our DB to Mirakl Connect.
// Only pushes variants where the values have changed since last sync.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DRY_RUN = process.env.MIRAKL_DRY_RUN !== 'false';
const AUTH_URL = process.env.MIRAKL_AUTH_URL || 'https://auth.mirakl.net/oauth/token';
const BASE_URL = process.env.MIRAKL_CONNECT_BASE_URL || 'https://miraklconnect.com/api';

interface InventoryUpdate {
  sku: string;
  variantId: string;
  inventory: number;
  price: number;
  reason: 'new' | 'inventory_changed' | 'price_changed';
}

interface InventorySyncReport {
  variantId: string;
  sku: string;
  decision: 'pushed' | 'unchanged' | 'failed' | 'dry_run';
  inventory: number;
  price: number;
  reason?: string;
  error?: string;
}

async function getMiraklToken(): Promise<string> {
  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.MIRAKL_CONNECT_CLIENT_ID!,
      client_secret: process.env.MIRAKL_CONNECT_CLIENT_SECRET!,
    }).toString(),
  });
  if (!res.ok) throw new Error(`Auth failed: ${res.status}`);
  const { access_token } = await res.json();
  return access_token;
}

/**
 * Push inventory updates to Mirakl Connect.
 *
 * NOTE: The exact endpoint/payload for inventory push depends on your
 * Mirakl Connect setup (offers vs catalog endpoint). We start with a
 * conservative approach that just logs the intent in dry-run, and uses
 * a placeholder endpoint in real mode that you can confirm with Mirakl.
 */
async function pushToMirakl(
  token: string,
  updates: InventoryUpdate[],
): Promise<{ ok: boolean; error?: string }> {
  // TODO: Confirm correct endpoint with Mirakl support. The Connect API
  // for inventory updates may use offers endpoint or a dedicated stock endpoint.
  // For now, this builds the payload and sends; we'll adjust based on first real test.
  const payload = {
    offers: updates.map((u) => ({
      shop_sku: u.sku,
      quantity: u.inventory,
      price: u.price,
    })),
  };

  try {
    const res = await fetch(`${BASE_URL}/v2/offers`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `${res.status}: ${body.slice(0, 300)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function syncInventory(): Promise<{
  processed: number;
  pushed: number;
  unchanged: number;
  failed: number;
  reports: InventorySyncReport[];
  durationMs: number;
}> {
  const startedAt = Date.now();
  const reports: InventorySyncReport[] = [];

  // Fetch all active variants with their product price
  const variants = await prisma.productVariant.findMany({
    include: {
      product: { select: { price: true, isActive: true } },
      miraklInventoryState: true,
    },
    where: {
      product: { isActive: true },
    },
  });

  const toPush: InventoryUpdate[] = [];

  for (const v of variants) {
    const currentInventory = v.inventory;
    const currentPrice = Number(v.product.price);
    const state = v.miraklInventoryState;

    let reason: InventoryUpdate['reason'] | null = null;
    if (!state) {
      reason = 'new';
    } else if (state.lastPushedInventory !== currentInventory) {
      reason = 'inventory_changed';
    } else if (Number(state.lastPushedPrice) !== currentPrice) {
      reason = 'price_changed';
    }

    if (reason) {
      toPush.push({
        sku: v.sku,
        variantId: v.id,
        inventory: currentInventory,
        price: currentPrice,
        reason,
      });
    } else {
      reports.push({
        variantId: v.id,
        sku: v.sku,
        decision: 'unchanged',
        inventory: currentInventory,
        price: currentPrice,
      });
    }
  }

  let pushed = 0;
  let failed = 0;

  if (toPush.length > 0) {
    if (DRY_RUN) {
      for (const u of toPush) {
        reports.push({
          variantId: u.variantId,
          sku: u.sku,
          decision: 'dry_run',
          inventory: u.inventory,
          price: u.price,
          reason: u.reason,
        });
      }
    } else {
      // Push in batches of 100
      const token = await getMiraklToken();
      const BATCH = 100;
      for (let i = 0; i < toPush.length; i += BATCH) {
        const batch = toPush.slice(i, i + BATCH);
        const result = await pushToMirakl(token, batch);

        for (const u of batch) {
          if (result.ok) {
            await prisma.miraklInventoryState.upsert({
              where: { variantId: u.variantId },
              create: {
                variantId: u.variantId,
                lastPushedInventory: u.inventory,
                lastPushedPrice: u.price,
                lastSyncedAt: new Date(),
                isSynced: true,
              },
              update: {
                lastPushedInventory: u.inventory,
                lastPushedPrice: u.price,
                lastSyncedAt: new Date(),
                lastError: null,
                isSynced: true,
              },
            });
            reports.push({
              variantId: u.variantId,
              sku: u.sku,
              decision: 'pushed',
              inventory: u.inventory,
              price: u.price,
              reason: u.reason,
            });
            pushed++;
          } else {
            await prisma.miraklInventoryState.upsert({
              where: { variantId: u.variantId },
              create: {
                variantId: u.variantId,
                lastPushedInventory: null,
                lastSyncedAt: new Date(),
                lastError: result.error,
                isSynced: false,
              },
              update: {
                lastSyncedAt: new Date(),
                lastError: result.error,
                isSynced: false,
              },
            });
            reports.push({
              variantId: u.variantId,
              sku: u.sku,
              decision: 'failed',
              inventory: u.inventory,
              price: u.price,
              error: result.error,
            });
            failed++;
          }
        }
      }
    }
  }

  const durationMs = Date.now() - startedAt;

  await prisma.miraklSyncLog.create({
    data: {
      syncType: 'inventory',
      status: failed > 0 ? (pushed > 0 ? 'partial' : 'error') : 'success',
      itemsProcessed: variants.length,
      itemsSucceeded: pushed,
      itemsFailed: failed,
      durationMs,
      details: { reports } as object,
      wasDryRun: DRY_RUN,
      completedAt: new Date(),
    },
  });

  return {
    processed: variants.length,
    pushed,
    unchanged: variants.length - toPush.length,
    failed,
    reports,
    durationMs,
  };
}