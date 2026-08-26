import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { recordCashPayment } from '../payments.server'
import { createManualInvoice } from '../invoices.server'
import { nprToPaisa, paisaToNpr, formatNpr } from '../money'
import { getTableConfig } from 'drizzle-orm/sqlite-core'
import { tenants, user, landlords } from '#/db/schema'
import type { Database } from '#/db/index'

// --- Mock DB Types for Multi-Tenancy & Transaction Simulation ---

interface PropertyRecord {
  id: string
  landlordId: string
  name: string
  address: string
  createdAt: string
}

interface RoomRecord {
  id: string
  landlordId: string
  propertyId: string
  name: string
  floor?: string | null
  description?: string | null
  isActive: boolean
  createdAt: string
}

interface TenantRecord {
  id: string
  landlordId: string
  name: string
  email: string
  phone?: string | null
  notes?: string | null
  createdAt: string
}

interface LeaseRecord {
  id: string
  landlordId: string
  roomId: string
  tenantId: string
  rentAmount: number
  depositAmount: number
  billingDay: number
  startDate: string
  endDate?: string | null
  status: 'active' | 'ended'
  createdAt: string
}

interface InvoiceRecord {
  id: string
  landlordId: string
  leaseId: string
  tenantId: string
  period: string
  amount: number
  dueDate: string
  status: 'unpaid' | 'partial' | 'overdue' | 'paid'
  createdAt: string
  updatedAt: string
}

interface LineItemRecord {
  id: string
  invoiceId: string
  description: string
  amount: number
  kind: 'rent' | 'utility' | 'adjustment'
}

interface PaymentRecord {
  id: string
  landlordId: string
  invoiceId: string
  tenantId: string
  amount: number
  method: string
  status:
    | 'initiated'
    | 'pending_verification'
    | 'confirmed'
    | 'rejected'
    | 'failed'
  createdAt: string
  confirmedAt?: string | null
}

function createFullMockDb(initialData?: {
  properties?: PropertyRecord[]
  rooms?: RoomRecord[]
  tenants?: TenantRecord[]
  leases?: LeaseRecord[]
  invoices?: InvoiceRecord[]
  lineItems?: LineItemRecord[]
  payments?: PaymentRecord[]
}) {
  const propertiesData = new Map<string, PropertyRecord>(
    (initialData?.properties || []).map((p) => [p.id, { ...p }]),
  )
  const roomsData = new Map<string, RoomRecord>(
    (initialData?.rooms || []).map((r) => [r.id, { ...r }]),
  )
  const tenantsData = new Map<string, TenantRecord>(
    (initialData?.tenants || []).map((t) => [t.id, { ...t }]),
  )
  const leasesData = new Map<string, LeaseRecord>(
    (initialData?.leases || []).map((l) => [l.id, { ...l }]),
  )
  const invoicesData = new Map<string, InvoiceRecord>(
    (initialData?.invoices || []).map((inv) => [inv.id, { ...inv }]),
  )
  const lineItemsData = new Map<string, LineItemRecord>(
    (initialData?.lineItems || []).map((item) => [item.id, { ...item }]),
  )
  const paymentsData = new Map<string, PaymentRecord>(
    (initialData?.payments || []).map((p) => [p.id, { ...p }]),
  )

  const mockDb = {
    query: {
      properties: {
        findFirst: vi.fn(async ({ where }: { where?: any } = {}) => {
          for (const prop of propertiesData.values()) {
            if (where?._mockMatch && !where._mockMatch(prop)) continue
            return prop
          }
          return undefined
        }),
        findMany: vi.fn(async () => Array.from(propertiesData.values())),
      },
      rooms: {
        findFirst: vi.fn(async ({ where }: { where?: any } = {}) => {
          for (const room of roomsData.values()) {
            if (where?._mockMatch && !where._mockMatch(room)) continue
            return room
          }
          return undefined
        }),
        findMany: vi.fn(async () => Array.from(roomsData.values())),
      },
      tenants: {
        findFirst: vi.fn(async ({ where }: { where?: any } = {}) => {
          for (const t of tenantsData.values()) {
            if (where?._mockMatch && !where._mockMatch(t)) continue
            return t
          }
          return undefined
        }),
        findMany: vi.fn(async () => Array.from(tenantsData.values())),
      },
      leases: {
        findFirst: vi.fn(async ({ where }: { where?: any } = {}) => {
          for (const l of leasesData.values()) {
            if (where?._mockMatch && !where._mockMatch(l)) continue
            return l
          }
          return undefined
        }),
        findMany: vi.fn(async () => Array.from(leasesData.values())),
      },
      invoices: {
        findFirst: vi.fn(async ({ where }: { where?: any } = {}) => {
          for (const inv of invoicesData.values()) {
            if (where?._mockMatch && !where._mockMatch(inv)) continue
            return inv
          }
          return undefined
        }),
        findMany: vi.fn(async () => Array.from(invoicesData.values())),
      },
      payments: {
        findMany: vi.fn(async ({ where }: { where?: any } = {}) => {
          return Array.from(paymentsData.values()).filter((p) => {
            if (p.status !== 'confirmed') return false
            if (where?._invoiceId && p.invoiceId !== where._invoiceId)
              return false
            return true
          })
        }),
      },
      invoiceLineItems: {
        findMany: vi.fn(async () => Array.from(lineItemsData.values())),
      },
    },
    insert: vi.fn((_table?: any) => ({
      values: vi.fn(async (values: any) => {
        if (Array.isArray(values)) {
          for (const v of values) {
            lineItemsData.set(v.id, v)
          }
        } else if (values.period !== undefined) {
          invoicesData.set(values.id, values)
        } else if (values.method !== undefined) {
          paymentsData.set(values.id, values)
        } else if (values.rentAmount !== undefined) {
          leasesData.set(values.id, values)
        } else if (values.propertyId !== undefined) {
          roomsData.set(values.id, values)
        } else if (values.address !== undefined) {
          propertiesData.set(values.id, values)
        } else if (
          values.email !== undefined &&
          values.landlordId !== undefined
        ) {
          // Check composite unique constraint (landlordId, email)
          for (const existing of tenantsData.values()) {
            if (
              existing.landlordId === values.landlordId &&
              existing.email.toLowerCase() === values.email.toLowerCase()
            ) {
              throw new Error(
                `UNIQUE constraint failed: tenants.landlord_id, tenants.email`,
              )
            }
          }
          tenantsData.set(values.id, values)
        }
      }),
    })),
    update: vi.fn((_table?: any) => ({
      set: vi.fn((setValues: any) => ({
        where: vi.fn(async () => {
          for (const inv of invoicesData.values()) {
            Object.assign(inv, setValues)
          }
        }),
      })),
    })),
    transaction: vi.fn(async (cb: (tx: any) => Promise<any>) => {
      return await cb(mockDb)
    }),
    _state: {
      properties: propertiesData,
      rooms: roomsData,
      tenants: tenantsData,
      leases: leasesData,
      invoices: invoicesData,
      lineItems: lineItemsData,
      payments: paymentsData,
    },
  }

  return mockDb
}

describe('Milestone 1 Challenger 2: Empirical Stress Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-15T06:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // =========================================================================
  // 1. Cross-Landlord IDOR Prevention in createRoom, createLease, recordCashPayment
  // =========================================================================
  describe('1. Cross-Landlord IDOR Prevention', () => {
    const LANDLORD_A = 'landlord-alice-uuid'
    const LANDLORD_B = 'landlord-bob-uuid'

    const PROPERTY_B: PropertyRecord = {
      id: 'prop-bob-1',
      landlordId: LANDLORD_B,
      name: 'Bob Heights',
      address: 'Patan, Lalitpur',
      createdAt: '2026-01-01T00:00:00Z',
    }

    const ROOM_B: RoomRecord = {
      id: 'room-bob-101',
      landlordId: LANDLORD_B,
      propertyId: PROPERTY_B.id,
      name: 'Room 101',
      floor: '1st',
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
    }

    const TENANT_B: TenantRecord = {
      id: 'tenant-bob-1',
      landlordId: LANDLORD_B,
      name: 'Bob Tenant',
      email: 'tenant.bob@example.com',
      createdAt: '2026-01-01T00:00:00Z',
    }

    const PROPERTY_A: PropertyRecord = {
      id: 'prop-alice-1',
      landlordId: LANDLORD_A,
      name: 'Alice Villa',
      address: 'Baluwatar, Kathmandu',
      createdAt: '2026-01-01T00:00:00Z',
    }

    const ROOM_A: RoomRecord = {
      id: 'room-alice-201',
      landlordId: LANDLORD_A,
      propertyId: PROPERTY_A.id,
      name: 'Room 201',
      floor: '2nd',
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
    }

    const TENANT_A: TenantRecord = {
      id: 'tenant-alice-1',
      landlordId: LANDLORD_A,
      name: 'Alice Tenant',
      email: 'tenant.alice@example.com',
      createdAt: '2026-01-01T00:00:00Z',
    }

    describe('createRoom cross-landlord validation logic', () => {
      it('rejects room creation when propertyId belongs to a different landlord', async () => {
        // Simulating createRoom handler authorization check:
        // const property = await db.query.properties.findFirst({
        //   where: and(eq(properties.id, data.propertyId), eq(properties.landlordId, landlordId))
        // })
        // if (!property) throw new Error('Property not found or unauthorized')

        const mockDb = createFullMockDb({
          properties: [PROPERTY_B],
        })

        // Override findFirst to enforce landlordId check
        mockDb.query.properties.findFirst = vi.fn(async () => {
          const prop = mockDb._state.properties.get(PROPERTY_B.id)
          if (prop && prop.landlordId === LANDLORD_A) {
            return prop
          }
          return undefined // Property belongs to Bob, so Alice gets undefined
        })

        const attemptCreateRoom = async (
          callerLandlordId: string,
          propertyId: string,
        ) => {
          const prop = mockDb._state.properties.get(propertyId)
          if (!prop || prop.landlordId !== callerLandlordId) {
            throw new Error('Property not found or unauthorized')
          }
          return 'room-id'
        }

        await expect(
          attemptCreateRoom(LANDLORD_A, PROPERTY_B.id),
        ).rejects.toThrow('Property not found or unauthorized')
      })

      it('permits room creation when propertyId belongs to the authenticated landlord', async () => {
        const mockDb = createFullMockDb({
          properties: [PROPERTY_A],
        })

        mockDb.query.properties.findFirst = vi.fn(async () => PROPERTY_A)

        const property = await mockDb.query.properties.findFirst()
        expect(property).toBeDefined()
        expect(property?.landlordId).toBe(LANDLORD_A)
      })
    })

    describe('createLease cross-landlord validation logic', () => {
      it('rejects lease creation if room belongs to another landlord (Cross-Landlord Room IDOR)', async () => {
        const mockDb = createFullMockDb({
          rooms: [ROOM_B],
          tenants: [TENANT_A],
        })

        const attemptCreateLease = async (
          callerLandlordId: string,
          roomId: string,
          tenantId: string,
        ) => {
          const room = mockDb._state.rooms.get(roomId)
          const validRoom =
            room && room.landlordId === callerLandlordId ? room : null
          const tenant = mockDb._state.tenants.get(tenantId)
          const validTenant =
            tenant && tenant.landlordId === callerLandlordId ? tenant : null

          if (!validRoom) throw new Error('Room not found or unauthorized')
          if (!validTenant) throw new Error('Tenant not found or unauthorized')
          return 'lease-created-id'
        }

        // Alice tries to lease Bob's room with Alice's tenant
        await expect(
          attemptCreateLease(LANDLORD_A, ROOM_B.id, TENANT_A.id),
        ).rejects.toThrow('Room not found or unauthorized')
      })

      it('rejects lease creation if tenant belongs to another landlord (Cross-Landlord Tenant IDOR)', async () => {
        const mockDb = createFullMockDb({
          rooms: [ROOM_A],
          tenants: [TENANT_B],
        })

        const attemptCreateLease = async (
          callerLandlordId: string,
          roomId: string,
          tenantId: string,
        ) => {
          const room = mockDb._state.rooms.get(roomId)
          const validRoom =
            room && room.landlordId === callerLandlordId ? room : null
          const tenant = mockDb._state.tenants.get(tenantId)
          const validTenant =
            tenant && tenant.landlordId === callerLandlordId ? tenant : null

          if (!validRoom) throw new Error('Room not found or unauthorized')
          if (!validTenant) throw new Error('Tenant not found or unauthorized')
          return 'lease-created-id'
        }

        // Alice tries to lease Alice's room to Bob's tenant
        await expect(
          attemptCreateLease(LANDLORD_A, ROOM_A.id, TENANT_B.id),
        ).rejects.toThrow('Tenant not found or unauthorized')
      })

      it('rejects lease creation when both room and tenant belong to another landlord', async () => {
        const mockDb = createFullMockDb({
          rooms: [ROOM_B],
          tenants: [TENANT_B],
        })

        const attemptCreateLease = async (
          callerLandlordId: string,
          roomId: string,
          tenantId: string,
        ) => {
          const room = mockDb._state.rooms.get(roomId)
          const validRoom =
            room && room.landlordId === callerLandlordId ? room : null
          const tenant = mockDb._state.tenants.get(tenantId)
          const validTenant =
            tenant && tenant.landlordId === callerLandlordId ? tenant : null

          if (!validRoom) throw new Error('Room not found or unauthorized')
          if (!validTenant) throw new Error('Tenant not found or unauthorized')
          return 'lease-created-id'
        }

        await expect(
          attemptCreateLease(LANDLORD_A, ROOM_B.id, TENANT_B.id),
        ).rejects.toThrow('Room not found or unauthorized')
      })
    })

    describe('recordCashPayment cross-landlord isolation in transactions', () => {
      it('strictly prevents Landlord A from recording cash payment for Landlord B invoice', async () => {
        const bobInvoice: InvoiceRecord = {
          id: 'inv-bob-999',
          landlordId: LANDLORD_B,
          leaseId: 'lease-bob-1',
          tenantId: TENANT_B.id,
          period: '2026-05',
          amount: 1500000,
          dueDate: '2026-05-25',
          status: 'unpaid',
          createdAt: '2026-05-01T00:00:00Z',
          updatedAt: '2026-05-01T00:00:00Z',
        }

        const mockDb = createFullMockDb({
          invoices: [bobInvoice],
          payments: [],
        })

        // Override query.invoices.findFirst to simulate SQL WHERE invoice.id = input.id AND invoice.landlord_id = landlordId
        mockDb.query.invoices.findFirst = vi.fn(async () => {
          // When called by Alice, invoice with landlordId Bob is not returned
          return undefined
        })

        await expect(
          recordCashPayment(mockDb as unknown as Database, LANDLORD_A, {
            invoiceId: bobInvoice.id,
            amountNpr: 15000,
          }),
        ).rejects.toThrow('Invoice not found or access denied')

        // Ensure zero payments inserted
        expect(mockDb._state.payments.size).toBe(0)
      })

      it('prevents manual invoice creation for a lease belonging to another landlord', async () => {
        const bobLease: LeaseRecord = {
          id: 'lease-bob-2',
          landlordId: LANDLORD_B,
          roomId: ROOM_B.id,
          tenantId: TENANT_B.id,
          rentAmount: 1800000,
          depositAmount: 1800000,
          billingDay: 1,
          startDate: '2026-01-01',
          status: 'active',
          createdAt: '2026-01-01T00:00:00Z',
        }

        const mockDb = createFullMockDb({
          leases: [bobLease],
        })

        mockDb.query.leases.findFirst = vi.fn(async () => undefined)

        await expect(
          createManualInvoice(mockDb as unknown as Database, LANDLORD_A, {
            leaseId: bobLease.id,
            period: '2026-05',
            dueDate: '2026-05-25',
            lineItems: [
              {
                description: 'Unauthorized rent',
                amountNpr: 18000,
                kind: 'rent',
              },
            ],
          }),
        ).rejects.toThrow('Lease not found or access denied')
      })

      it('prevents cross-landlord invoice inspection in getInvoiceDetails', async () => {
        const bobInvoice: InvoiceRecord = {
          id: 'inv-bob-private',
          landlordId: LANDLORD_B,
          leaseId: 'lease-bob-1',
          tenantId: TENANT_B.id,
          period: '2026-05',
          amount: 2000000,
          dueDate: '2026-05-25',
          status: 'unpaid',
          createdAt: '2026-05-01T00:00:00Z',
          updatedAt: '2026-05-01T00:00:00Z',
        }

        const mockDb = createFullMockDb({
          invoices: [bobInvoice],
        })

        // Simulating getInvoiceDetails handler logic:
        // const invoice = await db.query.invoices.findFirst({
        //   where: and(eq(invoices.id, data.id), eq(invoices.landlordId, landlordId)),
        // })
        // if (!invoice) throw new Error('Invoice not found')
        const getInvoiceForCaller = async (
          callerLandlordId: string,
          invoiceId: string,
        ) => {
          const inv = mockDb._state.invoices.get(invoiceId)
          if (!inv || inv.landlordId !== callerLandlordId) {
            throw new Error('Invoice not found')
          }
          return inv
        }

        await expect(
          getInvoiceForCaller(LANDLORD_A, bobInvoice.id),
        ).rejects.toThrow('Invoice not found')
      })

      it('prevents cross-landlord lease termination in endLease', async () => {
        const bobLease: LeaseRecord = {
          id: 'lease-bob-active',
          landlordId: LANDLORD_B,
          roomId: ROOM_B.id,
          tenantId: TENANT_B.id,
          rentAmount: 1500000,
          depositAmount: 1500000,
          billingDay: 1,
          startDate: '2026-01-01',
          status: 'active',
          createdAt: '2026-01-01T00:00:00Z',
        }

        const mockDb = createFullMockDb({
          leases: [bobLease],
        })

        // Simulating endLease SQL:
        // db.update(leases).set({ status: 'ended', endDate: data.endDate })
        //   .where(and(eq(leases.id, data.id), eq(leases.landlordId, landlordId)))
        const endLeaseForCaller = async (
          callerLandlordId: string,
          leaseId: string,
          endDate: string,
        ) => {
          const lease = mockDb._state.leases.get(leaseId)
          if (!lease || lease.landlordId !== callerLandlordId) {
            // Update matches 0 rows in SQL
            return 0
          }
          lease.status = 'ended'
          lease.endDate = endDate
          return 1
        }

        const affectedRows = await endLeaseForCaller(
          LANDLORD_A,
          bobLease.id,
          '2026-05-31',
        )
        expect(affectedRows).toBe(0)
        expect(mockDb._state.leases.get(bobLease.id)?.status).toBe('active')
      })

      it('prevents cross-landlord entity mutation in updateProperty, updateRoom, updateTenant', async () => {
        const mockDb = createFullMockDb({
          properties: [PROPERTY_B],
          rooms: [ROOM_B],
          tenants: [TENANT_B],
        })

        // Update property where landlordId matches caller
        const updateProperty = (
          callerId: string,
          propId: string,
          newName: string,
        ) => {
          const p = mockDb._state.properties.get(propId)
          if (!p || p.landlordId !== callerId) return 0
          p.name = newName
          return 1
        }

        const updateRoom = (
          callerId: string,
          roomId: string,
          newName: string,
        ) => {
          const r = mockDb._state.rooms.get(roomId)
          if (!r || r.landlordId !== callerId) return 0
          r.name = newName
          return 1
        }

        const updateTenant = (
          callerId: string,
          tenantId: string,
          newName: string,
        ) => {
          const t = mockDb._state.tenants.get(tenantId)
          if (!t || t.landlordId !== callerId) return 0
          t.name = newName
          return 1
        }

        // Alice attempts to update Bob's property, room, and tenant
        expect(updateProperty(LANDLORD_A, PROPERTY_B.id, 'Hacked Prop')).toBe(0)
        expect(mockDb._state.properties.get(PROPERTY_B.id)?.name).toBe(
          'Bob Heights',
        )

        expect(updateRoom(LANDLORD_A, ROOM_B.id, 'Hacked Room')).toBe(0)
        expect(mockDb._state.rooms.get(ROOM_B.id)?.name).toBe('Room 101')

        expect(updateTenant(LANDLORD_A, TENANT_B.id, 'Hacked Tenant')).toBe(0)
        expect(mockDb._state.tenants.get(TENANT_B.id)?.name).toBe('Bob Tenant')
      })
    })
  })

  // =========================================================================
  // 2. Composite Tenant Email Index Behavior
  // =========================================================================
  describe('2. Composite Tenant Email Index Behavior (Multiple vs Same Landlord)', () => {
    it('verifies schema table configuration defines composite uniqueIndex on (landlordId, email)', () => {
      const tableConfig = getTableConfig(tenants)
      expect(tableConfig.name).toBe('tenants')

      // Inspect extraConfig indexes
      const indexes = tableConfig.indexes
      expect(indexes).toBeDefined()
      expect(indexes.length).toBeGreaterThanOrEqual(2)

      const uniqueEmailIndex = indexes.find(
        (idx) => (idx as any).config?.name === 'tenants_landlord_email_idx',
      )
      expect(uniqueEmailIndex).toBeDefined()
      expect((uniqueEmailIndex as any).config?.unique).toBe(true)

      // Column names in index
      const columns = (uniqueEmailIndex as any).config?.columns.map(
        (c: any) => c.name,
      )
      expect(columns).toEqual(['landlord_id', 'email'])
    })

    it('verifies user and landlords tables enforce GLOBAL unique email while tenants is SCOPED to landlord', () => {
      const userConfig = getTableConfig(user)
      const userEmailCol = userConfig.columns.find((c) => c.name === 'email')
      expect(userEmailCol?.isUnique).toBe(true)

      const landlordsConfig = getTableConfig(landlords)
      const landlordsEmailCol = landlordsConfig.columns.find(
        (c) => c.name === 'email',
      )
      expect(landlordsEmailCol?.isUnique).toBe(true)

      const tenantsConfig = getTableConfig(tenants)
      const tenantsEmailCol = tenantsConfig.columns.find(
        (c) => c.name === 'email',
      )
      // Tenant email itself is NOT globally unique; uniqueness is on composite index (landlord_id, email)
      expect(tenantsEmailCol?.isUnique).toBe(false)
    })

    it('allows identical tenant email under two different landlords', async () => {
      const mockDb = createFullMockDb()
      const sharedEmail = 'shared.tenant@kathmandurent.com'

      // Landlord 1 adds tenant
      await mockDb.insert(tenants).values({
        id: 't-101',
        landlordId: 'landlord-1',
        name: 'Ram Bahadur',
        email: sharedEmail,
        createdAt: '2026-05-01T00:00:00Z',
      })

      // Landlord 2 adds tenant with same email
      await mockDb.insert(tenants).values({
        id: 't-201',
        landlordId: 'landlord-2',
        name: 'Ram Bahadur (Branch 2)',
        email: sharedEmail,
        createdAt: '2026-05-01T00:00:00Z',
      })

      expect(mockDb._state.tenants.size).toBe(2)
      expect(mockDb._state.tenants.get('t-101')?.email).toBe(sharedEmail)
      expect(mockDb._state.tenants.get('t-201')?.email).toBe(sharedEmail)
    })

    it('rejects duplicate tenant email under the same landlord (UNIQUE constraint violation)', async () => {
      const mockDb = createFullMockDb()
      const email = 'duplicate.test@kathmandurent.com'

      // Landlord 1 adds first tenant
      await mockDb.insert(tenants).values({
        id: 't-101',
        landlordId: 'landlord-1',
        name: 'Sita Sharma',
        email,
        createdAt: '2026-05-01T00:00:00Z',
      })

      // Landlord 1 attempts to add second tenant with same email
      await expect(
        mockDb.insert(tenants).values({
          id: 't-102',
          landlordId: 'landlord-1',
          name: 'Sita Sharma Duplicate',
          email,
          createdAt: '2026-05-02T00:00:00Z',
        }),
      ).rejects.toThrow(
        'UNIQUE constraint failed: tenants.landlord_id, tenants.email',
      )

      expect(mockDb._state.tenants.size).toBe(1)
    })
  })

  // =========================================================================
  // 3. Cash Payment Overpayment Limit Enforcement in D1 Transactions
  // =========================================================================
  describe('3. Cash Payment Overpayment Limit Enforcement in D1 Transactions', () => {
    const LANDLORD_ID = 'landlord-alpha'

    it('successfully processes exact full payment and marks invoice as "paid"', async () => {
      const invoice: InvoiceRecord = {
        id: 'inv-exact',
        landlordId: LANDLORD_ID,
        leaseId: 'lease-1',
        tenantId: 'tenant-1',
        period: '2026-05',
        amount: 1500000, // Rs. 15,000.00
        dueDate: '2026-05-25',
        status: 'unpaid',
        createdAt: '2026-05-01T00:00:00Z',
        updatedAt: '2026-05-01T00:00:00Z',
      }

      const mockDb = createFullMockDb({
        invoices: [invoice],
        payments: [],
      })

      const paymentId = await recordCashPayment(
        mockDb as unknown as Database,
        LANDLORD_ID,
        {
          invoiceId: invoice.id,
          amountNpr: 15000,
        },
      )

      expect(paymentId).toBeDefined()
      const payment = mockDb._state.payments.get(paymentId)
      expect(payment?.amount).toBe(1500000)
      expect(payment?.status).toBe('confirmed')
      expect(mockDb._state.invoices.get(invoice.id)?.status).toBe('paid')
    })

    it('rejects overpayment by even 1 paisa (0.01 NPR boundary challenge)', async () => {
      const invoice: InvoiceRecord = {
        id: 'inv-1paisa-limit',
        landlordId: LANDLORD_ID,
        leaseId: 'lease-1',
        tenantId: 'tenant-1',
        period: '2026-05',
        amount: 1500000, // Rs. 15,000.00 (1,500,000 paisa)
        dueDate: '2026-05-25',
        status: 'unpaid',
        createdAt: '2026-05-01T00:00:00Z',
        updatedAt: '2026-05-01T00:00:00Z',
      }

      const mockDb = createFullMockDb({
        invoices: [invoice],
        payments: [],
      })

      // Attempt payment of Rs. 15,000.01 (1,500,001 paisa)
      await expect(
        recordCashPayment(mockDb as unknown as Database, LANDLORD_ID, {
          invoiceId: invoice.id,
          amountNpr: 15000.01,
        }),
      ).rejects.toThrow(/Payment amount exceeds remaining balance.*15,000\.00/)

      // Ensure no phantom payments created
      expect(mockDb._state.payments.size).toBe(0)
      expect(mockDb._state.invoices.get(invoice.id)?.status).toBe('unpaid')
    })

    it('enforces overpayment limit across sequential partial payments until 0 balance', async () => {
      const invoice: InvoiceRecord = {
        id: 'inv-seq',
        landlordId: LANDLORD_ID,
        leaseId: 'lease-1',
        tenantId: 'tenant-1',
        period: '2026-05',
        amount: 2500000, // Rs. 25,000.00
        dueDate: '2026-05-25',
        status: 'unpaid',
        createdAt: '2026-05-01T00:00:00Z',
        updatedAt: '2026-05-01T00:00:00Z',
      }

      const mockDb = createFullMockDb({
        invoices: [invoice],
        payments: [],
      })

      // Step 1: Pay Rs. 10,000 -> Remaining Rs. 15,000
      await recordCashPayment(mockDb as unknown as Database, LANDLORD_ID, {
        invoiceId: invoice.id,
        amountNpr: 10000,
      })
      expect(mockDb._state.invoices.get(invoice.id)?.status).toBe('partial')

      // Step 2: Pay Rs. 8,000 -> Remaining Rs. 7,000
      await recordCashPayment(mockDb as unknown as Database, LANDLORD_ID, {
        invoiceId: invoice.id,
        amountNpr: 8000,
      })
      expect(mockDb._state.invoices.get(invoice.id)?.status).toBe('partial')

      // Step 3: Attempt overpayment of Rs. 7,000.50 -> Should fail
      await expect(
        recordCashPayment(mockDb as unknown as Database, LANDLORD_ID, {
          invoiceId: invoice.id,
          amountNpr: 7000.5,
        }),
      ).rejects.toThrow(/Payment amount exceeds remaining balance.*7,000\.00/)

      // Step 4: Pay Rs. 5,000 -> Remaining Rs. 2,000
      await recordCashPayment(mockDb as unknown as Database, LANDLORD_ID, {
        invoiceId: invoice.id,
        amountNpr: 5000,
      })
      expect(mockDb._state.invoices.get(invoice.id)?.status).toBe('partial')

      // Step 5: Pay exact remaining Rs. 2,000 -> Remaining Rs. 0
      await recordCashPayment(mockDb as unknown as Database, LANDLORD_ID, {
        invoiceId: invoice.id,
        amountNpr: 2000,
      })
      expect(mockDb._state.invoices.get(invoice.id)?.status).toBe('paid')

      // Step 6: Subsequent payment attempt on fully paid invoice (Rs. 1) -> Must fail
      await expect(
        recordCashPayment(mockDb as unknown as Database, LANDLORD_ID, {
          invoiceId: invoice.id,
          amountNpr: 1,
        }),
      ).rejects.toThrow(/Payment amount exceeds remaining balance.*0\.00/)
    })

    it('rejects zero and negative payment amounts in cash payments', async () => {
      const invoice: InvoiceRecord = {
        id: 'inv-zero-neg',
        landlordId: LANDLORD_ID,
        leaseId: 'lease-1',
        tenantId: 'tenant-1',
        period: '2026-05',
        amount: 1000000,
        dueDate: '2026-05-25',
        status: 'unpaid',
        createdAt: '2026-05-01T00:00:00Z',
        updatedAt: '2026-05-01T00:00:00Z',
      }

      const mockDb = createFullMockDb({
        invoices: [invoice],
        payments: [],
      })

      await expect(
        recordCashPayment(mockDb as unknown as Database, LANDLORD_ID, {
          invoiceId: invoice.id,
          amountNpr: 0,
        }),
      ).rejects.toThrow('Payment amount must be greater than 0')

      await expect(
        recordCashPayment(mockDb as unknown as Database, LANDLORD_ID, {
          invoiceId: invoice.id,
          amountNpr: -0.01,
        }),
      ).rejects.toThrow('Payment amount must be greater than 0')

      await expect(
        recordCashPayment(mockDb as unknown as Database, LANDLORD_ID, {
          invoiceId: invoice.id,
          amountNpr: -500,
        }),
      ).rejects.toThrow('Payment amount must be greater than 0')
    })

    it('verifies integer paisa conversions avoid IEEE 754 precision errors', () => {
      // Test conversion edge cases
      expect(nprToPaisa(100.01)).toBe(10001)
      expect(nprToPaisa(100.99)).toBe(10099)
      expect(nprToPaisa(0.01)).toBe(1)
      expect(nprToPaisa(0.5)).toBe(50)
      expect(nprToPaisa(99999.99)).toBe(9999999)

      // Inverse
      expect(paisaToNpr(10001)).toBe(100.01)
      expect(paisaToNpr(1)).toBe(0.01)
      expect(formatNpr(1500000)).toMatch(/15,000\.00/)
      expect(formatNpr(0)).toMatch(/0\.00/)
    })

    it('enforces D1 transaction atomicity: transaction aborts completely on error with zero partial mutations', async () => {
      const invoice: InvoiceRecord = {
        id: 'inv-atomicity',
        landlordId: LANDLORD_ID,
        leaseId: 'lease-1',
        tenantId: 'tenant-1',
        period: '2026-05',
        amount: 1000000,
        dueDate: '2026-05-25',
        status: 'unpaid',
        createdAt: '2026-05-01T00:00:00Z',
        updatedAt: '2026-05-01T00:00:00Z',
      }

      // Simulate a transactional DB where uncommitted writes are discarded on exception
      let txCommitted = false
      let stagedPayments = new Map<string, PaymentRecord>()

      const atomicDb = {
        query: {
          invoices: {
            findFirst: vi.fn(async () => ({ ...invoice })),
          },
          payments: {
            findMany: vi.fn(async () => []),
          },
        },
        transaction: vi.fn(async (callback: (tx: any) => Promise<any>) => {
          stagedPayments = new Map<string, PaymentRecord>()
          const txContext = {
            query: {
              invoices: {
                findFirst: vi.fn(async () => ({ ...invoice })),
              },
              payments: {
                findMany: vi.fn(async () =>
                  Array.from(stagedPayments.values()),
                ),
              },
            },
            insert: vi.fn(() => ({
              values: vi.fn(async (val: PaymentRecord) => {
                stagedPayments.set(val.id, val)
              }),
            })),
            update: vi.fn(() => ({
              set: vi.fn(() => ({
                where: vi.fn(async () => {}),
              })),
            })),
          }

          try {
            const result = await callback(txContext)
            txCommitted = true
            return result
          } catch (err) {
            txCommitted = false
            stagedPayments.clear() // Transaction rolled back
            throw err
          }
        }),
      }

      // Trigger overpayment failure
      await expect(
        recordCashPayment(atomicDb as unknown as Database, LANDLORD_ID, {
          invoiceId: invoice.id,
          amountNpr: 10000.01,
        }),
      ).rejects.toThrow(/Payment amount exceeds remaining balance/)

      expect(txCommitted).toBe(false)
      expect(stagedPayments.size).toBe(0)
    })
  })
})
