/**
 * @file Payments Server Functions.
 * @description RPC server functions for processing and recording payments in the financial ledger.
 */

import { createServerFn } from '@tanstack/react-start'
import { landlordAuthMiddleware } from '#/middleware/auth'
import { recordCashPaymentSchema } from '#/schemas/payments'
import { recordCashPayment } from '#/lib/payments.server'

/**
 * Server function endpoint to record a manual cash payment against an invoice.
 *
 * @param data - The validated cash payment input payload (`invoiceId`, `amountNpr`, optional `confirmedAt`).
 * @returns UUID string of the newly created payment ledger record.
 * @throws 401 Unauthorized if unauthenticated.
 * @throws 403 Forbidden if not registered as a landlord.
 * @throws Error if the invoice does not exist or does not belong to the landlord.
 * @throws Error if the payment amount is <= 0 or exceeds the invoice remaining balance.
 */
export const recordCashPaymentFn = createServerFn({ method: 'POST' })
  .middleware([landlordAuthMiddleware])
  .inputValidator(recordCashPaymentSchema)
  .handler(async ({ data, context }) => {
    const { db, landlordId } = context
    return await recordCashPayment(db, landlordId, data)
  })
