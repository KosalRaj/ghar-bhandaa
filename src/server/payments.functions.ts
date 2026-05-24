import { createServerFn } from '@tanstack/react-start'
import { landlordAuthMiddleware } from '#/middleware/auth'
import { recordCashPaymentSchema } from '#/schemas/payments'
import { recordCashPayment } from '#/lib/payments.server'

export const recordCashPaymentFn = createServerFn({ method: 'POST' })
  .middleware([landlordAuthMiddleware])
  .validator(recordCashPaymentSchema)
  .handler(async ({ data, context }) => {
    const { db, landlordId } = context
    return await recordCashPayment(db, landlordId, data)
  })
