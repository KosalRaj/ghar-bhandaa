import { createServerFn } from '@tanstack/react-start'
import { landlordAuthMiddleware } from '#/middleware/auth'
import { createTenantSchema, updateTenantSchema } from '#/schemas/tenants'
import { tenants } from '#/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

export const getTenants = createServerFn({ method: 'GET' })
  .middleware([landlordAuthMiddleware])
  .handler(async ({ context }) => {
    const { db, landlordId } = context
    return await db.query.tenants.findMany({
      where: eq(tenants.landlordId, landlordId),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
    })
  })

export const createTenant = createServerFn({ method: 'POST' })
  .middleware([landlordAuthMiddleware])
  .inputValidator(createTenantSchema)
  .handler(async ({ data, context }) => {
    const { db, landlordId } = context
    const id = crypto.randomUUID()
    await db.insert(tenants).values({
      id,
      landlordId,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      notes: data.notes || null,
      createdAt: new Date().toISOString(),
    })
    return id
  })

export const updateTenant = createServerFn({ method: 'POST' })
  .middleware([landlordAuthMiddleware])
  .inputValidator(
    z.object({
      id: z.string(),
      data: updateTenantSchema,
    })
  )
  .handler(async ({ data, context }) => {
    const { db, landlordId } = context
    await db
      .update(tenants)
      .set(data.data)
      .where(and(eq(tenants.id, data.id), eq(tenants.landlordId, landlordId)))
    return data.id
  })
