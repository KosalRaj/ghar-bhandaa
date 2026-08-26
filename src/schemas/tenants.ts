/**
 * @file Tenant Validation Schemas.
 * @description Zod validation schemas for registering and updating tenant contact information.
 */

import { z } from 'zod'

/**
 * Validation schema for registering a new tenant.
 */
export const createTenantSchema = z.object({
  /** Full name of the tenant (1 to 100 characters) */
  name: z.string().min(1, 'Tenant name is required').max(100),
  /** Valid email address */
  email: z.string().email('Invalid email address'),
  /** Optional phone number (up to 20 characters) */
  phone: z.string().max(20).optional().nullable(),
  /** Optional notes or emergency contacts (up to 500 characters) */
  notes: z.string().max(500).optional().nullable(),
})

/**
 * Validation schema for updating existing tenant details.
 */
export const updateTenantSchema = createTenantSchema.partial()
