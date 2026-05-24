import { z } from 'zod'

export const createLeaseSchema = z.object({
  roomId: z.string().min(1, 'Room selection is required'),
  tenantId: z.string().min(1, 'Tenant selection is required'),
  rentAmountNpr: z.number().positive('Rent amount must be greater than 0'),
  depositAmountNpr: z.number().nonnegative('Deposit amount must be 0 or more'),
  billingDay: z.number().int().min(1).max(28, 'Billing day must be between 1 and 28'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional().nullable(),
})

export const updateLeaseSchema = createLeaseSchema.partial().omit({ roomId: true, tenantId: true })
