/**
 * @file Room / Rental Unit Validation Schemas.
 * @description Zod validation schemas for creating and updating rentable rooms within properties.
 */

import { z } from 'zod'

/**
 * Validation schema for creating a new room unit.
 */
export const createRoomSchema = z.object({
  /** Parent property UUID identifier */
  propertyId: z.string().min(1, 'Property selection is required'),
  /** Room number or identifier (e.g. 'Room 101', 'Flat 3A') */
  name: z.string().min(1, 'Room name/number is required').max(50),
  /** Optional floor level descriptor (e.g. 'Ground Floor', '2nd Floor') */
  floor: z.string().max(50).optional().nullable(),
  /** Optional description or amenities notes */
  description: z.string().max(500).optional().nullable(),
  /** Whether the room is currently active and rentable (defaults to true) */
  isActive: z.boolean().default(true),
})

/**
 * Validation schema for updating room details.
 *
 * @remarks
 * `propertyId` is immutable once created and is omitted from updates.
 */
export const updateRoomSchema = createRoomSchema
  .partial()
  .omit({ propertyId: true })
