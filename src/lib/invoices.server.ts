import { Database } from '#/db/index'
import { invoices, invoiceLineItems, payments, leases } from '#/db/schema'
import { eq, and } from 'drizzle-orm'
import { nprToPaisa } from './money'
import { getTodayInKathmandu, getCurrentDateTimeInKathmandu } from './dates'

export async function recalculateInvoiceStatus(db: Database, invoiceId: string): Promise<string> {
  // Get all confirmed payments for this invoice
  const confirmedPayments = await db.query.payments.findMany({
    where: and(
      eq(payments.invoiceId, invoiceId),
      eq(payments.status, 'confirmed')
    ),
  })

  const totalPaid = confirmedPayments.reduce((acc, p) => acc + p.amount, 0)

  // Get invoice details
  const invoice = await db.query.invoices.findFirst({
    where: eq(invoices.id, invoiceId),
  })

  if (!invoice) {
    throw new Error(`Invoice with ID ${invoiceId} not found`)
  }

  let newStatus: 'paid' | 'partial' | 'overdue' | 'unpaid' = 'unpaid'

  if (totalPaid >= invoice.amount) {
    newStatus = 'paid'
  } else if (totalPaid > 0) {
    newStatus = 'partial'
  } else {
    // Check if due date is in the past in Kathmandu timezone
    const today = getTodayInKathmandu()
    if (invoice.dueDate < today) {
      newStatus = 'overdue'
    } else {
      newStatus = 'unpaid'
    }
  }

  await db
    .update(invoices)
    .set({
      status: newStatus,
      updatedAt: getCurrentDateTimeInKathmandu(),
    })
    .where(eq(invoices.id, invoiceId))

  return newStatus
}

export interface CreateManualInvoiceInput {
  leaseId: string
  period: string
  dueDate: string
  lineItems: {
    description: string
    amountNpr: number
    kind: 'rent' | 'utility' | 'adjustment'
  }[]
}

export async function createManualInvoice(
  db: Database,
  landlordId: string,
  input: CreateManualInvoiceInput
) {
  return await db.transaction(async (tx) => {
    // Verify lease exists and belongs to this landlord
    const lease = await tx.query.leases.findFirst({
      where: and(eq(leases.id, input.leaseId), eq(leases.landlordId, landlordId)),
    })

    if (!lease) {
      throw new Error(`Lease not found or access denied`)
    }

    const invoiceId = crypto.randomUUID()
    const nowStr = getCurrentDateTimeInKathmandu()

    // Calculate total amount in paisa
    let totalAmountPaisa = 0
    const lineItemInserts = input.lineItems.map((item) => {
      const amountPaisa = nprToPaisa(item.amountNpr)
      totalAmountPaisa += amountPaisa
      return {
        id: crypto.randomUUID(),
        invoiceId,
        description: item.description,
        amount: amountPaisa,
        kind: item.kind,
      }
    })

    // Insert Invoice
    await tx.insert(invoices).values({
      id: invoiceId,
      landlordId,
      leaseId: lease.id,
      tenantId: lease.tenantId,
      period: input.period,
      amount: totalAmountPaisa,
      dueDate: input.dueDate,
      status: 'unpaid',
      createdAt: nowStr,
      updatedAt: nowStr,
    })

    // Insert Line Items
    if (lineItemInserts.length > 0) {
      await tx.insert(invoiceLineItems).values(lineItemInserts)
    }

    // Call recalculate in tx context
    await recalculateInvoiceStatus(tx, invoiceId)

    return invoiceId
  })
}
