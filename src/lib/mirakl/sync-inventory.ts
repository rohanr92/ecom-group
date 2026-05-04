// src/lib/mirakl/sync-inventory.ts
// Pushes inventory + price changes from our DB to Mirakl Connect.
// Only pushes variants where the values have changed since last sync.

import { prisma } from '@/lib/prisma';
import { callMiraklApi } from './client';

const DRY_RUN = process.env.MIRAKL_DRY_RUN !== 'false';

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

/**
 * Push inventory updates to Mirakl Connect.
 * Uses callMiraklApi which handles auth + auto-retry on 401.
 */
async function pushToMirakl(
  updates: InventoryUpdate[],
): Promise<{ ok: boolean; error?: string }> {
  const payload = {
    offers: updates.map((u) => ({
      shop_sku: u.sku,
      quantity: u.inventory,
      price: u.price,
    })),
  };

  try {
    await callMiraklApi('/v2/offers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
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
      const BATCH = 100;
      for (let i = 0; i < toPush.length; i += BATCH) {
        const batch = toPush.slice(i, i + BATCH);
        const result = await pushToMirakl(batch);

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
