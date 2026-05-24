import { z } from 'zod'

export const createTenantSchema = z.object({
  name: z.string().min(1, 'Tenant name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(20).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
})

export const updateTenantSchema = createTenantSchema.partial()
