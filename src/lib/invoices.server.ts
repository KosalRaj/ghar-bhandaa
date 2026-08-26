/**
 * @file Server-Side Invoice Operations and State Machine.
 * @description Core business logic for creating manual invoices and deterministically recalculating
 * invoice statuses based on confirmed payments and Kathmandu due dates.
 */

import type { Database } from '#/db/index'
import { invoices, invoiceLineItems, payments, leases } from '#/db/schema'
import { eq, and } from 'drizzle-orm'
import { nprToPaisa } from './money'
import { getTodayInKathmandu, getCurrentDateTimeInKathmandu } from './dates'

/**
 * Deterministically computes and updates the lifecycle status of an invoice.
 *
 * Status Evaluation Hierarchy:
 * 1. `'paid'`: Total confirmed payments (`totalPaid`) >= total invoice amount (`invoice.amount`).
 * 2. `'overdue'`: `invoice.dueDate` < today's date in `Asia/Kathmandu` (evaluated when not fully paid).
 * 3. `'partial'`: `totalPaid` > 0 and `totalPaid` < `invoice.amount` (and dueDate >= today).
 * 4. `'unpaid'`: `totalPaid` === 0 (and dueDate >= today).
 *
 * @param db - The database or active transaction client.
 * @param invoiceId - UUID of the target invoice to recalculate.
 * @returns The newly computed invoice status string ('paid' | 'partial' | 'overdue' | 'unpaid').
 * @throws Error if the invoice with the specified `invoiceId` does not exist.
 *
 * @remarks
 * Invariant: Overdue status takes strict precedence over partial status once the due date has elapsed
 * in `Asia/Kathmandu` time.
 */
export async function recalculateInvoiceStatus(
  db: Database,
  invoiceId: string,
): Promise<string> {
  // Get all confirmed payments for this invoice
  const confirmedPayments = await db.query.payments.findMany({
    where: and(
      eq(payments.invoiceId, invoiceId),
      eq(payments.status, 'confirmed'),
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
  const today = getTodayInKathmandu()

  if (totalPaid >= invoice.amount) {
    newStatus = 'paid'
  } else if (invoice.dueDate < today) {
    newStatus = 'overdue'
  } else if (totalPaid > 0) {
    newStatus = 'partial'
  } else {
    newStatus = 'unpaid'
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

/**
 * Input payload for manually generating an invoice.
 */
export interface CreateManualInvoiceInput {
  /** Target lease UUID identifier */
  leaseId: string
  /** Billing period represented as YYYY-MM */
  period: string
  /** Invoice payment due date represented as YYYY-MM-DD */
  dueDate: string
  /** Array of individual line items representing charges */
  lineItems: {
    /** Description of the line item charge */
    description: string
    /** Amount in Nepalese Rupees (NPR) */
    amountNpr: number
    /** Category of the charge */
    kind: 'rent' | 'utility' | 'adjustment'
  }[]
}

/**
 * Creates a new invoice with itemized line items within a database transaction.
 *
 * @param db - The database client instance.
 * @param landlordId - UUID of the authenticated landlord creating the invoice.
 * @param input - The validated invoice creation data.
 * @returns The UUID of the newly created invoice.
 * @throws Error if the lease does not exist or does not belong to `landlordId`.
 *
 * @remarks
 * Invariants:
 * - Lease ownership is verified against `landlordId` before insertion.
 * - Line item amounts are converted from NPR to integer paisa via `nprToPaisa`.
 * - Invoice amount is set to the sum of line item amounts in integer paisa.
 * - Initial status is evaluated and persisted via `recalculateInvoiceStatus`.
 */
export async function createManualInvoice(
  db: Database,
  landlordId: string,
  input: CreateManualInvoiceInput,
) {
  return await db.transaction(async (tx) => {
    // Verify lease exists and belongs to this landlord
    const lease = await tx.query.leases.findFirst({
      where: and(
        eq(leases.id, input.leaseId),
        eq(leases.landlordId, landlordId),
      ),
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
