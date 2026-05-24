import { z } from 'zod'

export const invoiceLineItemInputSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amountNpr: z.number().positive('Line item amount must be positive'),
  kind: z.enum(['rent', 'utility', 'adjustment']),
})

export const createManualInvoiceSchema = z.object({
  leaseId: z.string().min(1, 'Lease selection is required'),
  period: z.string().regex(/^\d{4}-\d{2}$/, 'Period must be YYYY-MM'),
  dueDate: z.string().min(1, 'Due date is required'),
  lineItems: z.array(invoiceLineItemInputSchema).min(1, 'At least one line item is required'),
})
