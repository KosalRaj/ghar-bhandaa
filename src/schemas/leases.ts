/**
 * @file Lease Validation Schemas.
 * @description Zod validation schemas for creating and updating residential rental leases.
 */

import { z } from 'zod'

/**
 * Validation schema for creating a new rental lease agreement.
 *
 * @remarks
 * Invariants:
 * - `rentAmountNpr`: Must be positive and restricted to at most 2 decimal places.
 * - `depositAmountNpr`: Must be non-negative (0 or more) and restricted to at most 2 decimal places.
 * - `billingDay`: Constrained to integer between 1 and 28 to guarantee validity across all calendar months.
 * - `startDate`: Formatted as YYYY-MM-DD.
 * - `endDate`: Optional date formatted as YYYY-MM-DD.
 */
export const createLeaseSchema = z.object({
  /** UUID of the room/unit being leased */
  roomId: z.string().min(1, 'Room selection is required'),
  /** UUID of the tenant entering the lease */
  tenantId: z.string().min(1, 'Tenant selection is required'),
  /** Monthly recurring rent in Nepalese Rupees (NPR) */
  rentAmountNpr: z
    .number()
    .positive('Rent amount must be greater than 0')
    .multipleOf(0.01, 'Rent amount cannot have more than 2 decimal places'),
  /** Security deposit in Nepalese Rupees (NPR) */
  depositAmountNpr: z
    .number()
    .nonnegative('Deposit amount must be 0 or more')
    .multipleOf(0.01, 'Deposit amount cannot have more than 2 decimal places'),
  /** Day of each month (1-28) when the monthly rent invoice is issued */
  billingDay: z
    .number()
    .int()
    .min(1)
    .max(28, 'Billing day must be between 1 and 28'),
  /** Commencement date formatted as YYYY-MM-DD */
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  /** Optional expiration / termination date formatted as YYYY-MM-DD */
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .optional()
    .nullable(),
})

/**
 * Validation schema for updating existing lease terms.
 *
 * @remarks
 * `roomId` and `tenantId` are immutable once a lease is initialized and are omitted from update operations.
 */
export const updateLeaseSchema = createLeaseSchema
  .partial()
  .omit({ roomId: true, tenantId: true })
