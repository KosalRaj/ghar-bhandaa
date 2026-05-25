import { createServerFn } from '@tanstack/react-start'
import { landlordAuthMiddleware } from '#/middleware/auth'
import { createPropertySchema, updatePropertySchema } from '#/schemas/properties'
import { properties } from '#/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

export const getProperties = createServerFn({ method: 'GET' })
  .middleware([landlordAuthMiddleware])
  .handler(async ({ context }) => {
    const { db, landlordId } = context
    return await db.query.properties.findMany({
      where: eq(properties.landlordId, landlordId),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
    })
  })

export const createProperty = createServerFn({ method: 'POST' })
  .middleware([landlordAuthMiddleware])
  .inputValidator(createPropertySchema)
  .handler(async ({ data, context }) => {
    const { db, landlordId } = context
    const id = crypto.randomUUID()
    await db.insert(properties).values({
      id,
      landlordId,
      name: data.name,
      address: data.address,
      createdAt: new Date().toISOString(),
    })
    return id
  })

export const updateProperty = createServerFn({ method: 'POST' })
  .middleware([landlordAuthMiddleware])
  .inputValidator(
    z.object({
      id: z.string(),
      data: updatePropertySchema,
    })
  )
  .handler(async ({ data, context }) => {
    const { db, landlordId } = context
    await db
      .update(properties)
      .set(data.data)
      .where(and(eq(properties.id, data.id), eq(properties.landlordId, landlordId)))
    return data.id
  })
