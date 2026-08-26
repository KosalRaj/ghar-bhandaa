/**
 * @file Leases Server Functions.
 * @description RPC server functions for managing residential rental leases and lifecycle states.
 */

import { createServerFn } from '@tanstack/react-start'
import { landlordAuthMiddleware } from '#/middleware/auth'
import { createLeaseSchema } from '#/schemas/leases'
import { leases, rooms, tenants, properties } from '#/db/schema'
import { eq, and } from 'drizzle-orm'
import { nprToPaisa } from '#/lib/money'
import { getCurrentDateTimeInKathmandu } from '#/lib/dates'
import { z } from 'zod'

/**
 * Retrieves all leases under the authenticated landlord, enriched with room, property, and tenant metadata.
 *
 * @returns Array of enriched lease records ordered by `status` and `startDate`.
 * @throws 401 Unauthorized if unauthenticated.
 * @throws 403 Forbidden if not registered as a landlord.
 */
export const getLeases = createServerFn({ method: 'GET' })
  .middleware([landlordAuthMiddleware])
  .handler(async ({ context }) => {
    const { db, landlordId } = context

    return await db
      .select({
        id: leases.id,
        rentAmount: leases.rentAmount,
        depositAmount: leases.depositAmount,
        billingDay: leases.billingDay,
        startDate: leases.startDate,
        endDate: leases.endDate,
        status: leases.status,
        createdAt: leases.createdAt,
        roomName: rooms.name,
        propertyName: properties.name,
        tenantName: tenants.name,
        tenantEmail: tenants.email,
      })
      .from(leases)
      .innerJoin(rooms, eq(leases.roomId, rooms.id))
      .innerJoin(properties, eq(rooms.propertyId, properties.id))
      .innerJoin(tenants, eq(leases.tenantId, tenants.id))
      .where(eq(leases.landlordId, landlordId))
      .orderBy(leases.status, leases.startDate)
  })

/**
 * Creates a new active lease agreement.
 *
 * @param data.roomId - UUID of the room to lease.
 * @param data.tenantId - UUID of the tenant entering the lease.
 * @param data.rentAmountNpr - Monthly rent amount in NPR.
 * @param data.depositAmountNpr - Security deposit amount in NPR.
 * @param data.billingDay - Recurring billing day of the month (1-28).
 * @param data.startDate - Commencement date formatted as YYYY-MM-DD.
 * @param data.endDate - Optional termination date formatted as YYYY-MM-DD.
 * @returns UUID string of the newly created lease.
 * @throws 401 Unauthorized if unauthenticated.
 * @throws 403 Forbidden if not registered as a landlord.
 * @throws Error if the specified room or tenant does not exist or does not belong to `landlordId`.
 *
 * @remarks
 * Invariants:
 * - Room and Tenant ownership are verified against `landlordId` before insertion (IDOR prevention).
 * - Rent and Deposit amounts are converted from NPR to integer paisa via `nprToPaisa`.
 * - Lease is initialized with `status: 'active'`.
 */
export const createLease = createServerFn({ method: 'POST' })
  .middleware([landlordAuthMiddleware])
  .inputValidator(createLeaseSchema)
  .handler(async ({ data, context }) => {
    const { db, landlordId } = context

    // Verify room and tenant belong to the authenticated landlord
    const [room, tenant] = await Promise.all([
      db.query.rooms.findFirst({
        where: and(eq(rooms.id, data.roomId), eq(rooms.landlordId, landlordId)),
      }),
      db.query.tenants.findFirst({
        where: and(
          eq(tenants.id, data.tenantId),
          eq(tenants.landlordId, landlordId),
        ),
      }),
    ])

    if (!room) {
      throw new Error('Room not found or unauthorized')
    }
    if (!tenant) {
      throw new Error('Tenant not found or unauthorized')
    }

    const id = crypto.randomUUID()
    const rentAmountPaisa = nprToPaisa(data.rentAmountNpr)
    const depositAmountPaisa = nprToPaisa(data.depositAmountNpr)

    await db.insert(leases).values({
      id,
      landlordId,
      roomId: data.roomId,
      tenantId: data.tenantId,
      rentAmount: rentAmountPaisa,
      depositAmount: depositAmountPaisa,
      billingDay: data.billingDay,
      startDate: data.startDate,
      endDate: data.endDate || null,
      status: 'active',
      createdAt: getCurrentDateTimeInKathmandu(),
    })
    return id
  })

/**
 * Terminates an active lease by setting its status to `'ended'` and recording its `endDate`.
 *
 * @param data.id - UUID of the lease to terminate.
 * @param data.endDate - Termination date formatted as YYYY-MM-DD.
 * @returns UUID string of the ended lease.
 * @throws 401 Unauthorized if unauthenticated.
 * @throws 403 Forbidden if not registered as a landlord.
 *
 * @remarks
 * Invariant: Mutates only leases where `leases.id === id AND leases.landlordId === landlordId`.
 */
export const endLease = createServerFn({ method: 'POST' })
  .middleware([landlordAuthMiddleware])
  .inputValidator(
    z.object({
      id: z.string().min(1, 'Lease ID is required'),
      endDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD'),
    }),
  )
  .handler(async ({ data, context }) => {
    const { db, landlordId } = context
    await db
      .update(leases)
      .set({
        status: 'ended',
        endDate: data.endDate,
      })
      .where(and(eq(leases.id, data.id), eq(leases.landlordId, landlordId)))
    return data.id
  })
