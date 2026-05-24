import { z } from 'zod'

export const createRoomSchema = z.object({
  propertyId: z.string().min(1, 'Property selection is required'),
  name: z.string().min(1, 'Room name/number is required').max(50),
  floor: z.string().max(50).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  isActive: z.boolean().default(true),
})

export const updateRoomSchema = createRoomSchema.partial().omit({ propertyId: true })
