// src/lib/mirakl/sync-orders.ts
// Pulls orders from Mirakl Connect → creates them in our DB.
// Auto-accepts orders that pass all safety guards (stock + clean SKU match).

import { OrderStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  listOrders,
  listOrderDocuments,
  callMiraklApi,
  MiraklError,
} from './client';
import type { MiraklOrder, MiraklOrderLine } from './types';

const DRY_RUN = process.env.MIRAKL_DRY_RUN !== 'false';
const AUTH_URL = process.env.MIRAKL_AUTH_URL || 'https://auth.mirakl.net/oauth/token';
const BASE_URL = process.env.MIRAKL_CONNECT_BASE_URL || 'https://miraklconnect.com/api';

interface VariantMatch {
  variantId: string;
  productId: string;
  productName: string;
  size: string;
  color: string;
  image: string;
  sku: string;
  inventory: number;
  matchedBy: 'sku' | 'upc';
}

interface SyncReport {
  miraklOrderId: string;
  miraklStatus: string;
  channel: string;
  decision:
    | 'created_and_accepted'
    | 'created_needs_review'
    | 'already_synced'
    | 'no_match'
    | 'insufficient_stock'
    | 'dry_run';
  reason?: string;
  matched: Array<{ line_id: string; sku: string; matched_by: 'sku' | 'upc' }>;
  unmatched: Array<{ line_id: string; sku: string; upc?: string }>;
}

/**
 * Match a Mirakl order line to one of our variants.
 * Strategy: SKU first, fall back to looking up by `upc` field.
 * Mirakl might use shop_sku, offer_sku, or product_sku — try all.
 */
async function findVariant(line: MiraklOrderLine): Promise<VariantMatch | null> {
  const candidateSkus = [line.shop_sku, line.offer_sku, line.product_sku].filter(
    Boolean,
  ) as string[];

  // Try SKU match first
  for (const sku of candidateSkus) {
    const v = await prisma.productVariant.findUnique({
      where: { sku },
      include: { product: { select: { id: true, name: true, images: true } } },
    });
    if (v) {
      return {
        variantId: v.id,
        productId: v.productId,
        productName: v.product.name,
        size: v.size,
        color: v.color,
        image: v.images[0] || v.product.images[0] || '',
        sku: v.sku,
        inventory: v.inventory,
        matchedBy: 'sku',
      };
    }
  }

  // Fallback: try UPC if any SKU candidate looks like a UPC (12+ digits)
  for (const candidate of candidateSkus) {
    if (/^\d{12,14}$/.test(candidate)) {
      const v = await prisma.productVariant.findFirst({
        where: { upc: candidate },
        include: { product: { select: { id: true, name: true, images: true } } },
      });
      if (v) {
        return {
          variantId: v.id,
          productId: v.productId,
          productName: v.product.name,
          size: v.size,
          color: v.color,
          image: v.images[0] || v.product.images[0] || '',
          sku: v.sku,
          inventory: v.inventory,
          matchedBy: 'upc',
        };
      }
    }
  }

  return null;
}

/**
 * Call Mirakl's accept endpoint for a single order.
 */
async function acceptOrderOnMirakl(
  miraklOrderId: string,
  lineIds: string[],
): Promise<void> {
  await callMiraklApi(`/v2/orders/${miraklOrderId}/accept`, {
    method: 'PUT',
    body: JSON.stringify({
      order_lines: lineIds.map((id) => ({ id, accepted: true })),
    }),
  });
}

/**
 * Process one Mirakl order: match variants, decide auto-accept eligibility,
 * write to DB (or log decisions in dry-run), accept on Mirakl, save packing slip.
 */
async function processOrder(order: MiraklOrder): Promise<SyncReport> {
  const miraklOrderId = (order.id || order.order_id || order.commercial_id) as string;
  const channel = order.channel?.name || order.channel_type || 'unknown';

  // Skip if already synced
  const existing = await prisma.order.findUnique({
    where: { miraklOrderId },
    select: { id: true },
  });
  if (existing) {
    return {
      miraklOrderId,
      miraklStatus: order.status,
      channel,
      decision: 'already_synced',
      matched: [],
      unmatched: [],
    };
  }

  const lines = order.order_lines || [];
  const matched: Array<{ line: MiraklOrderLine; variant: VariantMatch }> = [];
  const unmatched: Array<{ line_id: string; sku: string; upc?: string }> = [];

  for (const line of lines) {
    const variant = await findVariant(line);
    if (variant) {
      matched.push({ line, variant });
    } else {
      unmatched.push({
        line_id: line.id,
        sku: line.shop_sku || line.offer_sku || line.product_sku || 'unknown',
      });
    }
  }

  // Decision tree
  const allMatched = unmatched.length === 0;
  const allCleanSkuMatch = matched.every((m) => m.variant.matchedBy === 'sku');
  const enoughStock = matched.every((m) => m.variant.inventory >= m.line.quantity);

  const canAutoAccept = allMatched && allCleanSkuMatch && enoughStock;

  if (DRY_RUN) {
    return {
      miraklOrderId,
      miraklStatus: order.status,
      channel,
      decision: 'dry_run',
      reason: canAutoAccept
        ? 'Would create + auto-accept'
        : !allMatched
          ? 'Would create as needs_review (unmatched lines)'
          : !allCleanSkuMatch
            ? 'Would create as needs_review (UPC fallback used)'
            : 'Would create as needs_review (insufficient stock)',
      matched: matched.map((m) => ({
        line_id: m.line.id,
        sku: m.variant.sku,
        matched_by: m.variant.matchedBy,
      })),
      unmatched,
    };
  }

  // ===== REAL MODE =====
  const orderNumber = `MIR-${miraklOrderId.slice(0, 12).toUpperCase()}`;
  const ship = order.shipping_address || order.customer?.shipping_address;
  const bill = order.billing_address || order.customer?.billing_address;
  const customer = order.customer;

  const subtotal = matched.reduce(
    (s, m) => s + (m.line.price ?? 0) * m.line.quantity,
    0,
  );
  const shippingCost = order.shipping_price ?? 0;
  const tax = order.total_taxes ?? 0;
  const total = order.total_price ?? subtotal + shippingCost + tax;

  // Status: NEEDS_REVIEW concept doesn't exist in your enum, so we use PENDING
  // and surface "needs review" via the mirakl_status field.
  const ourStatus: OrderStatus = canAutoAccept ? 'CONFIRMED' : 'PENDING';
  const miraklStatusLabel = canAutoAccept ? order.status : 'NEEDS_REVIEW';

  await prisma.$transaction(async (tx) => {
    // 1. Create order
    const created = await tx.order.create({
      data: {
        orderNumber,
        email: customer?.email || 'unknown@mirakl.local',
        status: ourStatus,
        subtotal,
        shippingCost,
        tax,
        discount: 0,
        total,
        paymentMethod: 'STRIPE', // placeholder — Mirakl handles payment
        miraklOrderId,
        miraklChannel: channel,
        miraklStatus: miraklStatusLabel,
        miraklSyncedAt: new Date(),
        miraklRawData: order as object,
      },
    });

    // 2. Create order items for matched lines
    for (const m of matched) {
      await tx.orderItem.create({
        data: {
          orderId: created.id,
          productId: m.variant.productId,
          variantId: m.variant.variantId,
          name: m.variant.productName,
          size: m.variant.size,
          color: m.variant.color,
          image: m.variant.image,
          price: m.line.price ?? 0,
          quantity: m.line.quantity,
        },
      });

      // 3. Decrement inventory ONLY if auto-accepting
      // (if needs_review, admin will decide; we hold stock)
      if (canAutoAccept) {
        await tx.productVariant.update({
          where: { id: m.variant.variantId },
          data: { inventory: { decrement: m.line.quantity } },
        });
      }
    }

    // 4. Create shipping address if provided
    if (ship) {
      await tx.address.create({
        data: {
          orderId: created.id,
          type: 'SHIPPING',
          firstName: ship.first_name || customer?.first_name || '',
          lastName: ship.last_name || customer?.last_name || '',
          street: ship.street_1 || '',
          street2: ship.street_2 || null,
          city: ship.city || '',
          state: ship.state || '',
          zip: ship.zip_code || '',
          country: ship.country || 'United States',
          phone: ship.phone || null,
        },
      });
    }
    if (bill && (bill.street_1 !== ship?.street_1 || bill.zip_code !== ship?.zip_code)) {
      await tx.address.create({
        data: {
          orderId: created.id,
          type: 'BILLING',
          firstName: bill.first_name || customer?.first_name || '',
          lastName: bill.last_name || customer?.last_name || '',
          street: bill.street_1 || '',
          street2: bill.street_2 || null,
          city: bill.city || '',
          state: bill.state || '',
          zip: bill.zip_code || '',
          country: bill.country || 'United States',
          phone: bill.phone || null,
        },
      });
    }
  });

  // 5. Auto-accept on Mirakl if eligible
  if (canAutoAccept) {
    try {
      await acceptOrderOnMirakl(
        miraklOrderId,
        matched.map((m) => m.line.id),
      );
    } catch (err) {
      console.error(`[mirakl] Accept failed for ${miraklOrderId}:`, err);
      // Order is in our DB; admin can retry manually
    }
  }

  // 6. Fetch + store packing slip URL
  try {
    const docs = await listOrderDocuments({
      order_ids: [miraklOrderId],
    });
    const slip = docs.data.find(
      (d) =>
        d.type === 'PACKING_SLIP' ||
        d.type === 'INVOICE' ||
        d.type === 'CUSTOMER_INVOICE',
    );
    if (slip?.download_url) {
      await prisma.order.update({
        where: { miraklOrderId },
        data: { packingSlipUrl: slip.download_url },
      });
    }
  } catch (err) {
    console.error(`[mirakl] Document fetch failed for ${miraklOrderId}:`, err);
  }

  return {
    miraklOrderId,
    miraklStatus: order.status,
    channel,
    decision: canAutoAccept ? 'created_and_accepted' : 'created_needs_review',
    reason: canAutoAccept
      ? 'All checks passed'
      : !allMatched
        ? `${unmatched.length} unmatched line(s)`
        : !allCleanSkuMatch
          ? 'UPC fallback used'
          : 'Insufficient stock',
    matched: matched.map((m) => ({
      line_id: m.line.id,
      sku: m.variant.sku,
      matched_by: m.variant.matchedBy,
    })),
    unmatched,
  };
}

/**
 * Main entry point — pulls all updated orders since last successful sync.
 */
export async function syncOrders(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
  reports: SyncReport[];
  durationMs: number;
}> {
  const startedAt = Date.now();
  const reports: SyncReport[] = [];
  const errors: string[] = [];

  // Find last successful order sync
  const lastSync = await prisma.miraklSyncLog.findFirst({
    where: { syncType: 'orders', status: { in: ['success', 'partial'] } },
    orderBy: { startedAt: 'desc' },
    select: { startedAt: true },
  });

  // Default to 30 days ago on first run
  const updatedFrom = (lastSync?.startedAt ||
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).toISOString();

  let pageToken: string | undefined;
  let processed = 0;

  try {
    do {
      const page = await listOrders({
        updated_from: updatedFrom,
        limit: 50,
        page_token: pageToken,
      });

      for (const order of page.data) {
        try {
          const report = await processOrder(order);
          reports.push(report);
          processed++;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          errors.push(`${order.id || 'unknown'}: ${msg}`);
        }
      }

      pageToken = page.next_page_token;
    } while (pageToken);
  } catch (err) {
    errors.push(err instanceof Error ? err.message : String(err));
  }

  const durationMs = Date.now() - startedAt;
  const failed = errors.length;
  const succeeded = processed - failed;

  // Write sync log
  await prisma.miraklSyncLog.create({
    data: {
      syncType: 'orders',
      status: failed > 0 ? (succeeded > 0 ? 'partial' : 'error') : 'success',
      itemsProcessed: processed,
      itemsSucceeded: succeeded,
      itemsFailed: failed,
      durationMs,
      errorMessage: errors.length > 0 ? errors.join('\n').slice(0, 1000) : null,
      details: { reports, updatedFrom } as object,
      wasDryRun: DRY_RUN,
      completedAt: new Date(),
    },
  });

  return { processed, succeeded, failed, reports, durationMs };
}