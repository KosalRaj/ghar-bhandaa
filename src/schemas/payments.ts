/**
 * @file Payment Validation Schemas.
 * @description Zod validation schemas for recording cash payments against outstanding invoices.
 */

import { z } from 'zod'

/**
 * Validation schema for recording a manual cash payment.
 *
 * @remarks
 * Invariants:
 * - `invoiceId`: Non-empty UUID string.
 * - `amountNpr`: Must be positive and restricted to at most 2 decimal places.
 * - `confirmedAt`: Optional date string formatted as `YYYY-MM-DD` or full ISO-8601 timestamp.
 */
export const recordCashPaymentSchema = z.object({
  /** Target invoice UUID identifier */
  invoiceId: z.string().min(1, 'Invoice is required'),
  /** Paid cash amount in Nepalese Rupees (NPR) */
  amountNpr: z
    .number()
    .positive('Payment amount must be positive')
    .multipleOf(0.01, 'Payment amount cannot have more than 2 decimal places'),
  /** Optional payment collection date/time */
  confirmedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Confirmed date must be in YYYY-MM-DD format')
    .or(z.string().datetime())
    .optional()
    .nullable(),
})
