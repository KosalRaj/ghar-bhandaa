import { z } from 'zod'

export const recordCashPaymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice is required'),
  amountNpr: z.number().positive('Payment amount must be positive'),
  confirmedAt: z.string().optional().nullable(),
})
