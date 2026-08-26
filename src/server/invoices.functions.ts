/**
 * @file Invoices and Financial Dashboard Server Functions.
 * @description RPC server functions for managing invoices, fetching detailed invoice statements,
 * creating manual invoices, and computing landlord portfolio dashboard metrics.
 */

import { createServerFn } from '@tanstack/react-start'
import { landlordAuthMiddleware } from '#/middleware/auth'
import { createManualInvoiceSchema } from '#/schemas/invoices'
import { createManualInvoice } from '#/lib/invoices.server'
import {
  invoices,
  tenants,
  leases,
  rooms,
  properties,
  invoiceLineItems,
  payments,
} from '#/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

/**
 * Retrieves all invoices issued across properties owned by the authenticated landlord.
 * Joins tenant, lease, room, and property metadata.
 *
 * @returns Array of enriched invoice records ordered by billing `period` and `dueDate`.
 * @throws 401 Unauthorized if unauthenticated.
 * @throws 403 Forbidden if not registered as a landlord.
 */
export const getInvoices = createServerFn({ method: 'GET' })
  .middleware([landlordAuthMiddleware])
  .handler(async ({ context }) => {
    const { db, landlordId } = context

    return await db
      .select({
        id: invoices.id,
        period: invoices.period,
        amount: invoices.amount,
        dueDate: invoices.dueDate,
        status: invoices.status,
        createdAt: invoices.createdAt,
        tenantName: tenants.name,
        roomName: rooms.name,
        propertyName: properties.name,
      })
      .from(invoices)
      .innerJoin(tenants, eq(invoices.tenantId, tenants.id))
      .innerJoin(leases, eq(invoices.leaseId, leases.id))
      .innerJoin(rooms, eq(leases.roomId, rooms.id))
      .innerJoin(properties, eq(rooms.propertyId, properties.id))
      .where(eq(invoices.landlordId, landlordId))
      .orderBy(invoices.period, invoices.dueDate)
  })

/**
 * Retrieves full details for a specific invoice including related tenant, lease, room,
 * property, line items, and payment history.
 *
 * @param data.id - UUID of the invoice to fetch.
 * @returns Object containing `{ invoice, tenant, lease, room, property, lineItems, payments }`.
 * @throws 401 Unauthorized if unauthenticated.
 * @throws 403 Forbidden if not registered as a landlord.
 * @throws Error ('Invoice not found') if the invoice does not exist or does not belong to `landlordId`.
 */
export const getInvoiceDetails = createServerFn({ method: 'GET' })
  .middleware([landlordAuthMiddleware])
  .inputValidator(z.object({ id: z.string().min(1, 'Invoice ID is required') }))
  .handler(async ({ data, context }) => {
    const { db, landlordId } = context

    const invoice = await db.query.invoices.findFirst({
      where: and(eq(invoices.id, data.id), eq(invoices.landlordId, landlordId)),
    })

    if (!invoice) {
      throw new Error('Invoice not found')
    }

    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, invoice.tenantId),
    })

    const lease = await db.query.leases.findFirst({
      where: eq(leases.id, invoice.leaseId),
    })

    const room = lease
      ? await db.query.rooms.findFirst({
          where: eq(rooms.id, lease.roomId),
        })
      : null

    const property = room
      ? await db.query.properties.findFirst({
          where: eq(properties.id, room.propertyId),
        })
      : null

    const lineItems = await db.query.invoiceLineItems.findMany({
      where: eq(invoiceLineItems.invoiceId, invoice.id),
    })

    const invoicePayments = await db.query.payments.findMany({
      where: eq(payments.invoiceId, invoice.id),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
    })

    return {
      invoice,
      tenant,
      lease,
      room,
      property,
      lineItems,
      payments: invoicePayments,
    }
  })

/**
 * Server function endpoint to manually generate an invoice with line items.
 *
 * @param data - The validated manual invoice creation input.
 * @returns UUID string of the newly created invoice.
 * @throws 401 Unauthorized if unauthenticated.
 * @throws 403 Forbidden if not registered as a landlord.
 * @throws Error if lease is not found or unauthorized.
 */
export const createManualInvoiceFn = createServerFn({ method: 'POST' })
  .middleware([landlordAuthMiddleware])
  .inputValidator(createManualInvoiceSchema)
  .handler(async ({ data, context }) => {
    const { db, landlordId } = context
    return await createManualInvoice(db, landlordId, data)
  })

/**
 * Aggregates portfolio-wide financial metrics and recent invoices for the landlord dashboard.
 *
 * Calculations performed:
 * - `totalCollected`: Sum of all confirmed payments in integer paisa.
 * - `totalOutstanding`: Sum of remaining balances (`amount - confirmedPayments`) across all invoices in integer paisa.
 * - `activeLeasesCount`: Total count of active leases.
 * - `overdueInvoicesCount`: Total count of invoices currently in `'overdue'` status.
 *
 * @returns Dashboard payload containing `stats` summary and `invoices` list.
 * @throws 401 Unauthorized if unauthenticated.
 * @throws 403 Forbidden if not registered as a landlord.
 */
export const getDashboardData = createServerFn({ method: 'GET' })
  .middleware([landlordAuthMiddleware])
  .handler(async ({ context }) => {
    const { db, landlordId } = context

    // 1. Fetch all invoices for stats and list
    const allInvoices = await db
      .select({
        id: invoices.id,
        amount: invoices.amount,
        status: invoices.status,
        dueDate: invoices.dueDate,
        tenantName: tenants.name,
        roomName: rooms.name,
        propertyName: properties.name,
        period: invoices.period,
        createdAt: invoices.createdAt,
      })
      .from(invoices)
      .innerJoin(tenants, eq(invoices.tenantId, tenants.id))
      .innerJoin(leases, eq(invoices.leaseId, leases.id))
      .innerJoin(rooms, eq(leases.roomId, rooms.id))
      .innerJoin(properties, eq(rooms.propertyId, properties.id))
      .where(eq(invoices.landlordId, landlordId))
      .orderBy(invoices.dueDate)

    // 2. Fetch all confirmed payments
    const confirmedPayments = await db.query.payments.findMany({
      where: and(
        eq(payments.landlordId, landlordId),
        eq(payments.status, 'confirmed'),
      ),
    })

    const totalCollectedPaisa = confirmedPayments.reduce(
      (acc, p) => acc + p.amount,
      0,
    )

    // 3. Calculate outstanding balance per invoice (sum of invoice amount minus confirmed payments per invoice)
    const paymentsByInvoice = new Map<string, number>()
    for (const p of confirmedPayments) {
      paymentsByInvoice.set(
        p.invoiceId,
        (paymentsByInvoice.get(p.invoiceId) || 0) + p.amount,
      )
    }

    let totalOutstandingPaisa = 0
    for (const inv of allInvoices) {
      const paid = paymentsByInvoice.get(inv.id) || 0
      totalOutstandingPaisa += Math.max(0, inv.amount - paid)
    }

    // 4. Fetch active leases count
    const activeLeases = await db.query.leases.findMany({
      where: and(
        eq(leases.landlordId, landlordId),
        eq(leases.status, 'active'),
      ),
    })

    const overdueCount = allInvoices.filter(
      (inv) => inv.status === 'overdue',
    ).length

    return {
      stats: {
        totalCollected: totalCollectedPaisa,
        totalOutstanding: totalOutstandingPaisa,
        activeLeasesCount: activeLeases.length,
        overdueInvoicesCount: overdueCount,
      },
      invoices: allInvoices,
    }
  })
