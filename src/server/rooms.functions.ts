/**
 * @file Rooms / Units Server Functions.
 * @description RPC server functions for querying, creating, and updating rentable rooms within landlord properties.
 */

import { createServerFn } from '@tanstack/react-start'
import { landlordAuthMiddleware } from '#/middleware/auth'
import { createRoomSchema, updateRoomSchema } from '#/schemas/rooms'
import { rooms, properties } from '#/db/schema'
import { eq, and } from 'drizzle-orm'
import { getCurrentDateTimeInKathmandu } from '#/lib/dates'
import { z } from 'zod'

/**
 * Retrieves all rooms across properties owned by the authenticated landlord.
 * Joins property details to include the property name for each room.
 *
 * @returns Array of room objects with joined `propertyName`, ordered alphabetically by room name.
 * @throws 401 Unauthorized if unauthenticated.
 * @throws 403 Forbidden if not registered as a landlord.
 */
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

/**
 * Creates a new rentable room under a specified property.
 *
 * @param data.propertyId - UUID of the parent property.
 * @param data.name - Room number or name (e.g. 'Room 101').
 * @param data.floor - Optional floor level description.
 * @param data.description - Optional amenities/features description.
 * @param data.isActive - Availability flag (defaults to true).
 * @returns UUID string of the newly created room.
 * @throws 401 Unauthorized if unauthenticated.
 * @throws 403 Forbidden if not registered as a landlord.
 * @throws Error if the specified property does not exist or does not belong to `landlordId`.
 *
 * @remarks
 * Invariant: Validates property ownership (`properties.landlordId === landlordId`) before room insertion
 * preventing unauthorized association (IDOR protection).
 */
export const createRoom = createServerFn({ method: 'POST' })
  .middleware([landlordAuthMiddleware])
  .inputValidator(createRoomSchema)
  .handler(async ({ data, context }) => {
    const { db, landlordId } = context

    // Verify property belongs to the authenticated landlord
    const property = await db.query.properties.findFirst({
      where: and(
        eq(properties.id, data.propertyId),
        eq(properties.landlordId, landlordId),
      ),
    })
    if (!property) {
      throw new Error('Property not found or unauthorized')
    }

    const id = crypto.randomUUID()
    await db.insert(rooms).values({
      id,
      landlordId,
      propertyId: data.propertyId,
      name: data.name,
      floor: data.floor || null,
      description: data.description || null,
      isActive: data.isActive,
      createdAt: getCurrentDateTimeInKathmandu(),
    })
    return id
  })

/**
 * Updates an existing room belonging to the authenticated landlord.
 *
 * @param data.id - UUID of the target room.
 * @param data.data - Partial room update payload (`name`, `floor`, `description`, `isActive`).
 * @returns UUID string of the updated room.
 * @throws 401 Unauthorized if unauthenticated.
 * @throws 403 Forbidden if not registered as a landlord.
 *
 * @remarks
 * Invariant: Mutates only rooms where `rooms.id === id AND rooms.landlordId === landlordId`.
 */
export const updateRoom = createServerFn({ method: 'POST' })
  .middleware([landlordAuthMiddleware])
  .inputValidator(
    z.object({
      id: z.string(),
      data: updateRoomSchema,
    }),
  )
  .handler(async ({ data, context }) => {
    const { db, landlordId } = context
    await db
      .update(rooms)
      .set(data.data)
      .where(and(eq(rooms.id, data.id), eq(rooms.landlordId, landlordId)))
    return data.id
  })
