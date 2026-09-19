/**
 * @file Server-Side Payment Operations and Ledger Processing.
 * @description Core business logic for processing cash payments, validating remaining balances,
 * and maintaining the append-only payment ledger.
 */

import type { Database } from '#/db/index'
import { payments, invoices } from '#/db/schema'
import { eq, and } from 'drizzle-orm'
import { nprToPaisa, formatNpr } from './money'
import { getCurrentDateTimeInKathmandu } from './dates'
import { recalculateInvoiceStatus } from './invoices.server'

/**
 * Input payload for recording a direct cash payment against an invoice.
 */
export interface RecordCashPaymentInput {
  /** Target invoice UUID identifier */
  invoiceId: string
  /** Cash payment amount in Nepalese Rupees (NPR) */
  amountNpr: number
  /** Optional confirmation timestamp / date string formatted as YYYY-MM-DD or ISO-8601 */
  confirmedAt?: string | null
}

/**
 * Records an immutable cash payment entry into the payment ledger and updates the invoice status.
 *
 * @param db - The database client instance.
 * @param landlordId - UUID of the authenticated landlord recording the payment.
 * @param input - The validated cash payment input payload.
 * @returns The UUID of the newly inserted payment record.
 * @throws Error if the invoice does not exist or access is denied.
 * @throws Error if the payment amount is <= 0.
 * @throws Error if the payment amount exceeds the invoice's remaining unpaid balance.
 *
 * @remarks
 * Invariants:
 * - Append-Only Ledger: Payments are inserted as new rows and never modified/overwritten.
 * - Balance Protection: Payment amount cannot exceed the calculated remaining balance.
 * - Immediate Confirmation: Cash payments are recorded with `status: 'confirmed'` immediately.
 * - Deterministic Recalculation: Automatically triggers `recalculateInvoiceStatus` within the transaction.
 */
export async function recordCashPayment(
  db: Database,
  landlordId: string,
  input: RecordCashPaymentInput,
) {
  const runner = async (client: any) => {
    const q = client.query || db.query
    // Verify invoice exists and belongs to this landlord
    const invoice = await q.invoices.findFirst({
      where: and(
        eq(invoices.id, input.invoiceId),
        eq(invoices.landlordId, landlordId),
      ),
    })

    if (!invoice) {
      throw new Error(`Invoice not found or access denied`)
    }

    // Calculate current confirmed payments and remaining balance
    const existingPayments = await q.payments.findMany({
      where: and(
        eq(payments.invoiceId, invoice.id),
        eq(payments.status, 'confirmed'),
      ),
    })
    const currentPaid = existingPayments.reduce(
      (acc: number, p: { amount: number }) => acc + p.amount,
      0,
    )
    const remainingPaisa = Math.max(0, invoice.amount - currentPaid)
    const paymentAmountPaisa = nprToPaisa(input.amountNpr)

    if (paymentAmountPaisa <= 0) {
      throw new Error('Payment amount must be greater than 0')
    }
    if (paymentAmountPaisa > remainingPaisa) {
      throw new Error(
        `Payment amount exceeds remaining balance of ${formatNpr(remainingPaisa)}`,
      )
    }

    const paymentId = crypto.randomUUID()
    const nowStr = getCurrentDateTimeInKathmandu()

    // Insert Cash Payment (Cash payments are confirmed immediately)
    await client.insert(payments).values({
      id: paymentId,
      landlordId,
      invoiceId: invoice.id,
      tenantId: invoice.tenantId,
      amount: paymentAmountPaisa,
      method: 'cash',
      status: 'confirmed',
      createdAt: nowStr,
      confirmedAt: input.confirmedAt || nowStr,
    })

    // Recalculate Invoice Status
    await recalculateInvoiceStatus(client, invoice.id)

    return paymentId
  }

  if (typeof (db as any).transaction === 'function') {
    try {
      return await (db as any).transaction(runner)
    } catch (err: any) {
      if (err?.message?.includes('begin')) {
        return await runner(db)
      }
      throw err
    }
  }

  return await runner(db)
}
