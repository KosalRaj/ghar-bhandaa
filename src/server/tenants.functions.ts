/**
 * @file Tenants Server Functions.
 * @description RPC server functions for managing tenant records scoped to the authenticated landlord.
 */

import { createServerFn } from '@tanstack/react-start'
import { landlordAuthMiddleware } from '#/middleware/auth'
import { createTenantSchema, updateTenantSchema } from '#/schemas/tenants'
import { tenants } from '#/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

/**
 * Retrieves all tenants registered under the authenticated landlord.
 *
 * @returns Array of tenant records ordered chronologically by `createdAt` descending.
 * @throws 401 Unauthorized if unauthenticated.
 * @throws 403 Forbidden if not registered as a landlord.
 */
export const getTenants = createServerFn({ method: 'GET' })
  .middleware([landlordAuthMiddleware])
  .handler(async ({ context }) => {
    const { db, landlordId } = context
    return await db.query.tenants.findMany({
      where: eq(tenants.landlordId, landlordId),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
    })
  })

/**
 * Registers a new tenant under the authenticated landlord.
 *
 * @param data.name - Tenant full name.
 * @param data.email - Tenant email address.
 * @param data.phone - Optional tenant phone number.
 * @param data.notes - Optional tenant notes.
 * @returns UUID string of the newly created tenant.
 * @throws 401 Unauthorized if unauthenticated.
 * @throws 403 Forbidden if not registered as a landlord.
 * @throws Error if email is already registered under this landlord (violates unique composite index `(landlordId, email)`).
 */
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

/**
 * Updates an existing tenant record belonging to the authenticated landlord.
 *
 * @param data.id - UUID of the target tenant.
 * @param data.data - Partial tenant payload (`name`, `email`, `phone`, `notes`).
 * @returns UUID string of the updated tenant.
 * @throws 401 Unauthorized if unauthenticated.
 * @throws 403 Forbidden if not registered as a landlord.
 *
 * @remarks
 * Invariant: Mutates only records where `tenants.id === id AND tenants.landlordId === landlordId`.
 */
export const updateTenant = createServerFn({ method: 'POST' })
  .middleware([landlordAuthMiddleware])
  .inputValidator(
    z.object({
      id: z.string(),
      data: updateTenantSchema,
    }),
  )
  .handler(async ({ data, context }) => {
    const { db, landlordId } = context
    await db
      .update(tenants)
      .set(data.data)
      .where(and(eq(tenants.id, data.id), eq(tenants.landlordId, landlordId)))
    return data.id
  })
