/**
 * @file Properties Server Functions.
 * @description RPC server functions for managing landlord rental properties with strict multi-tenant isolation.
 */

import { createServerFn } from '@tanstack/react-start'
import { landlordAuthMiddleware } from '#/middleware/auth'
import {
  createPropertySchema,
  updatePropertySchema,
} from '#/schemas/properties'
import { properties } from '#/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

/**
 * Retrieves all properties owned by the authenticated landlord.
 *
 * @returns Array of property records ordered chronologically by `createdAt` descending.
 * @throws 401 Unauthorized if unauthenticated.
 * @throws 403 Forbidden if not registered as a landlord.
 */
export const getProperties = createServerFn({ method: 'GET' })
  .middleware([landlordAuthMiddleware])
  .handler(async ({ context }) => {
    const { db, landlordId } = context
    return await db.query.properties.findMany({
      where: eq(properties.landlordId, landlordId),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
    })
  })

/**
 * Creates a new property under the authenticated landlord.
 *
 * @param data.name - Name/title of the property.
 * @param data.address - Physical street address.
 * @returns UUID string of the newly created property.
 * @throws 401 Unauthorized if unauthenticated.
 * @throws 403 Forbidden if not registered as a landlord.
 */
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

/**
 * Updates an existing property belonging to the authenticated landlord.
 *
 * @param data.id - UUID of the target property.
 * @param data.data - Partial property payload containing updated `name` and/or `address`.
 * @returns UUID string of the updated property.
 * @throws 401 Unauthorized if unauthenticated.
 * @throws 403 Forbidden if not registered as a landlord.
 *
 * @remarks
 * Invariant: Mutates only properties where `properties.id === id AND properties.landlordId === landlordId`
 * ensuring cross-tenant isolation.
 */
export const updateProperty = createServerFn({ method: 'POST' })
  .middleware([landlordAuthMiddleware])
  .inputValidator(
    z.object({
      id: z.string(),
      data: updatePropertySchema,
    }),
  )
  .handler(async ({ data, context }) => {
    const { db, landlordId } = context
    await db
      .update(properties)
      .set(data.data)
      .where(
        and(eq(properties.id, data.id), eq(properties.landlordId, landlordId)),
      )
    return data.id
  })
