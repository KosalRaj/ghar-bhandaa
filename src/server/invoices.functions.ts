import { createServerFn } from '@tanstack/react-start'
import { landlordAuthMiddleware } from '#/middleware/auth'
import { createManualInvoiceSchema } from '#/schemas/invoices'
import { createManualInvoice } from '#/lib/invoices.server'
import { invoices, tenants, leases, rooms, properties, invoiceLineItems, payments } from '#/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

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

export const getInvoiceDetails = createServerFn({ method: 'GET' })
  .middleware([landlordAuthMiddleware])
  .inputValidator(z.object({ id: z.string() }))
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

export const createManualInvoiceFn = createServerFn({ method: 'POST' })
  .middleware([landlordAuthMiddleware])
  .inputValidator(createManualInvoiceSchema)
  .handler(async ({ data, context }) => {
    const { db, landlordId } = context
    return await createManualInvoice(db, landlordId, data)
  })

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
      where: and(eq(payments.landlordId, landlordId), eq(payments.status, 'confirmed')),
    })

    const totalCollectedPaisa = confirmedPayments.reduce((acc, p) => acc + p.amount, 0)

    // 3. Calculate outstanding (sum of unpaid invoice balances)
    // For outstanding we sum up the invoice amount minus its confirmed payments
    let totalInvoiceAmountPaisa = 0
    for (const inv of allInvoices) {
      totalInvoiceAmountPaisa += inv.amount
    }
    const totalOutstandingPaisa = Math.max(0, totalInvoiceAmountPaisa - totalCollectedPaisa)

    // 4. Fetch active leases count
    const activeLeases = await db.query.leases.findMany({
      where: and(eq(leases.landlordId, landlordId), eq(leases.status, 'active')),
    })

    const overdueCount = allInvoices.filter((inv) => inv.status === 'overdue').length

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
