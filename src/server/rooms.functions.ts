import { createServerFn } from '@tanstack/react-start'
import { landlordAuthMiddleware } from '#/middleware/auth'
import { createRoomSchema, updateRoomSchema } from '#/schemas/rooms'
import { rooms, properties } from '#/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

export const getRooms = createServerFn({ method: 'GET' })
  .middleware([landlordAuthMiddleware])
  .handler(async ({ context }) => {
    const { db, landlordId } = context
    
    return await db
      .select({
        id: rooms.id,
        propertyId: rooms.propertyId,
        propertyName: properties.name,
        name: rooms.name,
        floor: rooms.floor,
        description: rooms.description,
        isActive: rooms.isActive,
        createdAt: rooms.createdAt,
      })
      .from(rooms)
      .innerJoin(properties, eq(rooms.propertyId, properties.id))
      .where(eq(rooms.landlordId, landlordId))
      .orderBy(rooms.name)
  })

export const createRoom = createServerFn({ method: 'POST' })
  .middleware([landlordAuthMiddleware])
  .validator(createRoomSchema)
  .handler(async ({ data, context }) => {
    const { db, landlordId } = context
    const id = crypto.randomUUID()
    await db.insert(rooms).values({
      id,
      landlordId,
      propertyId: data.propertyId,
      name: data.name,
      floor: data.floor || null,
      description: data.description || null,
      isActive: data.isActive ?? true,
      createdAt: new Date().toISOString(),
    })
    return id
  })

export const updateRoom = createServerFn({ method: 'POST' })
  .middleware([landlordAuthMiddleware])
  .validator(
    z.object({
      id: z.string(),
      data: updateRoomSchema,
    })
  )
  .handler(async ({ data, context }) => {
    const { db, landlordId } = context
    await db
      .update(rooms)
      .set(data.data)
      .where(and(eq(rooms.id, data.id), eq(rooms.landlordId, landlordId)))
    return data.id
  })
