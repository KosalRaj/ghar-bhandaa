/**
 * @file Invoice Validation Schemas.
 * @description Zod validation schemas for creating manual invoices and itemized line items.
 */

import { z } from 'zod'

/**
 * Validation schema for an individual invoice line item input.
 *
 * @remarks
 * Invariant: `amountNpr` must be positive and restricted to at most 2 decimal places (representing exact paisa).
 */
export const invoiceLineItemInputSchema = z.object({
  /** Description of the specific charge (e.g. 'Electricity (Units: 25)') */
  description: z.string().min(1, 'Description is required'),
  /** Charge amount in Nepalese Rupees (must be positive and at most 2 decimal places) */
  amountNpr: z
    .number()
    .positive('Line item amount must be positive')
    .multipleOf(
      0.01,
      'Line item amount cannot have more than 2 decimal places',
    ),
  /** Category of the charge */
  kind: z.enum(['rent', 'utility', 'adjustment']),
})

/**
 * Validation schema for manually generating a monthly invoice with line items.
 *
 * @remarks
 * Invariants:
 * - `period`: Format `YYYY-MM` (e.g. '2026-08').
 * - `dueDate`: Format `YYYY-MM-DD` (e.g. '2026-08-15').
 * - `lineItems`: Array must contain at least one valid line item.
 */
export const createManualInvoiceSchema = z.object({
  /** UUID of the target lease */
  leaseId: z.string().min(1, 'Lease selection is required'),
  /** Billing period represented as YYYY-MM */
  period: z.string().regex(/^\d{4}-\d{2}$/, 'Period must be YYYY-MM'),
  /** Due date formatted as YYYY-MM-DD */
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format'),
  /** List of line items contributing to the invoice total */
  lineItems: z
    .array(invoiceLineItemInputSchema)
    .min(1, 'At least one line item is required'),
})
