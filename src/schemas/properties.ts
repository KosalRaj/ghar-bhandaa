/**
 * @file Property Validation Schemas.
 * @description Zod validation schemas for creating and updating physical properties.
 */

import { z } from 'zod'

/**
 * Validation schema for registering a new property.
 */
export const createPropertySchema = z.object({
  /** Property display name (1 to 100 characters) */
  name: z.string().min(1, 'Property name is required').max(100),
  /** Physical street address (1 to 200 characters) */
  address: z.string().min(1, 'Address is required').max(200),
})

/**
 * Validation schema for updating property details.
 */
export const updatePropertySchema = createPropertySchema.partial()
