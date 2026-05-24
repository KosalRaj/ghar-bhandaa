import { z } from 'zod'

export const createPropertySchema = z.object({
  name: z.string().min(1, 'Property name is required').max(100),
  address: z.string().min(1, 'Address is required').max(200),
})

export const updatePropertySchema = createPropertySchema.partial()
