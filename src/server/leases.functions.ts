import { createServerFn } from '@tanstack/react-start'
import { landlordAuthMiddleware } from '#/middleware/auth'
import { createLeaseSchema } from '#/schemas/leases'
import { leases, rooms, tenants, properties } from '#/db/schema'
import { eq, and } from 'drizzle-orm'
import { nprToPaisa } from '#/lib/money'
import { z } from 'zod'

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

export const createLease = createServerFn({ method: 'POST' })
  .middleware([landlordAuthMiddleware])
  .inputValidator(createLeaseSchema)
  .handler(async ({ data, context }) => {
    const { db, landlordId } = context
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
      createdAt: new Date().toISOString(),
    })
    return id
  })

export const endLease = createServerFn({ method: 'POST' })
  .middleware([landlordAuthMiddleware])
  .inputValidator(
    z.object({
      id: z.string(),
      endDate: z.string(),
    })
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
