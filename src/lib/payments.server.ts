import { Database } from '#/db/index'
import { payments, invoices } from '#/db/schema'
import { eq, and } from 'drizzle-orm'
import { nprToPaisa } from './money'
import { getCurrentDateTimeInKathmandu } from './dates'
import { recalculateInvoiceStatus } from './invoices.server'

export interface RecordCashPaymentInput {
  invoiceId: string
  amountNpr: number
  confirmedAt?: string | null
}

export async function recordCashPayment(
  db: Database,
  landlordId: string,
  input: RecordCashPaymentInput
) {
  return await db.transaction(async (tx) => {
    // Verify invoice exists and belongs to this landlord
    const invoice = await tx.query.invoices.findFirst({
      where: and(eq(invoices.id, input.invoiceId), eq(invoices.landlordId, landlordId)),
    })

    if (!invoice) {
      throw new Error(`Invoice not found or access denied`)
    }

    const paymentId = crypto.randomUUID()
    const nowStr = getCurrentDateTimeInKathmandu()
    const paymentAmountPaisa = nprToPaisa(input.amountNpr)

    // Insert Cash Payment (Cash payments are confirmed immediately)
    await tx.insert(payments).values({
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
    await recalculateInvoiceStatus(tx, invoice.id)

    return paymentId
  })
}
