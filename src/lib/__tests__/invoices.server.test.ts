import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  recalculateInvoiceStatus,
  createManualInvoice,
} from '../invoices.server'
import type { Database } from '#/db/index'

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
  status: string
  createdAt: string
}

interface LineItemRecord {
  id: string
  invoiceId: string
  description: string
  amount: number
  kind: 'rent' | 'utility' | 'adjustment'
}

function createMockDb(initialData?: {
  invoices?: InvoiceRecord[]
  payments?: PaymentRecord[]
  leases?: LeaseRecord[]
  lineItems?: LineItemRecord[]
}) {
  const invoicesData = new Map<string, InvoiceRecord>(
    (initialData?.invoices || []).map((inv) => [inv.id, { ...inv }]),
  )
  const paymentsData = new Map<string, PaymentRecord>(
    (initialData?.payments || []).map((p) => [p.id, { ...p }]),
  )
  const leasesData = new Map<string, LeaseRecord>(
    (initialData?.leases || []).map((l) => [l.id, { ...l }]),
  )
  const lineItemsData = new Map<string, LineItemRecord>(
    (initialData?.lineItems || []).map((item) => [item.id, { ...item }]),
  )

  const mockDb = {
    query: {
      invoices: {
        findFirst: vi.fn(async () => {
          for (const inv of invoicesData.values()) {
            return inv
          }
          return undefined
        }),
        findMany: vi.fn(async () => Array.from(invoicesData.values())),
      },
      payments: {
        findMany: vi.fn(async () => {
          return Array.from(paymentsData.values()).filter(
            (p) => p.status === 'confirmed',
          )
        }),
      },
      leases: {
        findFirst: vi.fn(async () => {
          return Array.from(leasesData.values())[0]
        }),
      },
      invoiceLineItems: {
        findMany: vi.fn(async () => Array.from(lineItemsData.values())),
      },
    },
    update: vi.fn(() => ({
      set: vi.fn((setValues: Partial<InvoiceRecord>) => ({
        where: vi.fn(async () => {
          // Update all or targeted invoice
          for (const inv of invoicesData.values()) {
            Object.assign(inv, setValues)
          }
        }),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(async (values: any) => {
        if (Array.isArray(values)) {
          for (const v of values) {
            lineItemsData.set(v.id, v)
          }
        } else if (values.period !== undefined) {
          invoicesData.set(values.id, values)
        } else if (values.method !== undefined) {
          paymentsData.set(values.id, values)
        }
      }),
    })),
    transaction: vi.fn(async (cb: (tx: any) => Promise<any>) => {
      return await cb(mockDb)
    }),
    _state: {
      invoices: invoicesData,
      payments: paymentsData,
      leases: leasesData,
      lineItems: lineItemsData,
    },
  }

  return mockDb
}

describe('invoices.server logic and status engine', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Current date: 2026-05-15 in Kathmandu
    vi.setSystemTime(new Date('2026-05-15T06:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('recalculateInvoiceStatus state transitions', () => {
    it('returns "unpaid" when 0 payments and due date is in the future', async () => {
      const mockDb = createMockDb({
        invoices: [
          {
            id: 'inv-1',
            landlordId: 'll-1',
            leaseId: 'l-1',
            tenantId: 't-1',
            period: '2026-05',
            amount: 1500000, // 15,000 NPR in Paisa
            dueDate: '2026-05-20', // Future
            status: 'unpaid',
            createdAt: '2026-05-01T00:00:00Z',
            updatedAt: '2026-05-01T00:00:00Z',
          },
        ],
        payments: [],
      })

      const status = await recalculateInvoiceStatus(
        mockDb as unknown as Database,
        'inv-1',
      )
      expect(status).toBe('unpaid')
      expect(mockDb._state.invoices.get('inv-1')?.status).toBe('unpaid')
    })

    it('returns "overdue" when 0 payments and due date is in the past', async () => {
      const mockDb = createMockDb({
        invoices: [
          {
            id: 'inv-2',
            landlordId: 'll-1',
            leaseId: 'l-1',
            tenantId: 't-1',
            period: '2026-04',
            amount: 1500000,
            dueDate: '2026-05-10', // Past (today is 2026-05-15)
            status: 'unpaid',
            createdAt: '2026-04-01T00:00:00Z',
            updatedAt: '2026-04-01T00:00:00Z',
          },
        ],
        payments: [],
      })

      const status = await recalculateInvoiceStatus(
        mockDb as unknown as Database,
        'inv-2',
      )
      expect(status).toBe('overdue')
      expect(mockDb._state.invoices.get('inv-2')?.status).toBe('overdue')
    })

    it('returns "partial" when partial payment received and due date is in the future', async () => {
      const mockDb = createMockDb({
        invoices: [
          {
            id: 'inv-3',
            landlordId: 'll-1',
            leaseId: 'l-1',
            tenantId: 't-1',
            period: '2026-05',
            amount: 1500000, // 15,000 NPR
            dueDate: '2026-05-25', // Future
            status: 'unpaid',
            createdAt: '2026-05-01T00:00:00Z',
            updatedAt: '2026-05-01T00:00:00Z',
          },
        ],
        payments: [
          {
            id: 'pay-1',
            landlordId: 'll-1',
            invoiceId: 'inv-3',
            tenantId: 't-1',
            amount: 500000, // 5,000 NPR paid
            method: 'cash',
            status: 'confirmed',
            createdAt: '2026-05-05T00:00:00Z',
          },
        ],
      })

      const status = await recalculateInvoiceStatus(
        mockDb as unknown as Database,
        'inv-3',
      )
      expect(status).toBe('partial')
      expect(mockDb._state.invoices.get('inv-3')?.status).toBe('partial')
    })

    it('returns "overdue" when partial payment received but due date is in the past (Overdue Precedence Fix)', async () => {
      const mockDb = createMockDb({
        invoices: [
          {
            id: 'inv-4',
            landlordId: 'll-1',
            leaseId: 'l-1',
            tenantId: 't-1',
            period: '2026-04',
            amount: 1500000, // 15,000 NPR
            dueDate: '2026-05-10', // Past (today is 2026-05-15)
            status: 'partial',
            createdAt: '2026-04-01T00:00:00Z',
            updatedAt: '2026-04-01T00:00:00Z',
          },
        ],
        payments: [
          {
            id: 'pay-2',
            landlordId: 'll-1',
            invoiceId: 'inv-4',
            tenantId: 't-1',
            amount: 700000, // 7,000 NPR paid, 8,000 NPR remaining
            method: 'cash',
            status: 'confirmed',
            createdAt: '2026-05-02T00:00:00Z',
          },
        ],
      })

      const status = await recalculateInvoiceStatus(
        mockDb as unknown as Database,
        'inv-4',
      )
      expect(status).toBe('overdue')
      expect(mockDb._state.invoices.get('inv-4')?.status).toBe('overdue')
    })

    it('returns "paid" when payments equal exact total invoice amount', async () => {
      const mockDb = createMockDb({
        invoices: [
          {
            id: 'inv-5',
            landlordId: 'll-1',
            leaseId: 'l-1',
            tenantId: 't-1',
            period: '2026-05',
            amount: 1500000,
            dueDate: '2026-05-20',
            status: 'unpaid',
            createdAt: '2026-05-01T00:00:00Z',
            updatedAt: '2026-05-01T00:00:00Z',
          },
        ],
        payments: [
          {
            id: 'pay-3',
            landlordId: 'll-1',
            invoiceId: 'inv-5',
            tenantId: 't-1',
            amount: 1500000, // 15,000 NPR paid in full
            method: 'cash',
            status: 'confirmed',
            createdAt: '2026-05-05T00:00:00Z',
          },
        ],
      })

      const status = await recalculateInvoiceStatus(
        mockDb as unknown as Database,
        'inv-5',
      )
      expect(status).toBe('paid')
      expect(mockDb._state.invoices.get('inv-5')?.status).toBe('paid')
    })

    it('returns "paid" even if due date is in the past when fully paid', async () => {
      const mockDb = createMockDb({
        invoices: [
          {
            id: 'inv-6',
            landlordId: 'll-1',
            leaseId: 'l-1',
            tenantId: 't-1',
            period: '2026-04',
            amount: 1500000,
            dueDate: '2026-05-01', // Past
            status: 'overdue',
            createdAt: '2026-04-01T00:00:00Z',
            updatedAt: '2026-04-01T00:00:00Z',
          },
        ],
        payments: [
          {
            id: 'pay-4',
            landlordId: 'll-1',
            invoiceId: 'inv-6',
            tenantId: 't-1',
            amount: 1500000,
            method: 'cash',
            status: 'confirmed',
            createdAt: '2026-05-05T00:00:00Z',
          },
        ],
      })

      const status = await recalculateInvoiceStatus(
        mockDb as unknown as Database,
        'inv-6',
      )
      expect(status).toBe('paid')
      expect(mockDb._state.invoices.get('inv-6')?.status).toBe('paid')
    })

    it('throws error if invoice ID does not exist', async () => {
      const mockDb = createMockDb({ invoices: [], payments: [] })
      await expect(
        recalculateInvoiceStatus(
          mockDb as unknown as Database,
          'non-existent-id',
        ),
      ).rejects.toThrow('Invoice with ID non-existent-id not found')
    })
  })

  describe('createManualInvoice transactional creation', () => {
    it('creates invoice and line items with exact integer paisa sum invariant', async () => {
      const mockDb = createMockDb({
        leases: [
          {
            id: 'lease-100',
            landlordId: 'landlord-1',
            roomId: 'room-1',
            tenantId: 'tenant-1',
            rentAmount: 1200000,
            depositAmount: 1200000,
            billingDay: 1,
            startDate: '2026-01-01',
            status: 'active',
            createdAt: '2026-01-01T00:00:00Z',
          },
        ],
      })

      const invoiceId = await createManualInvoice(
        mockDb as unknown as Database,
        'landlord-1',
        {
          leaseId: 'lease-100',
          period: '2026-05',
          dueDate: '2026-05-25',
          lineItems: [
            { description: 'Monthly Rent', amountNpr: 12000.5, kind: 'rent' },
            { description: 'Water Bill', amountNpr: 450, kind: 'utility' },
            {
              description: 'Waste Management',
              amountNpr: 150.25,
              kind: 'utility',
            },
          ],
        },
      )

      expect(typeof invoiceId).toBe('string')
      const createdInvoice = mockDb._state.invoices.get(invoiceId)
      expect(createdInvoice).toBeDefined()
      expect(createdInvoice?.period).toBe('2026-05')
      expect(createdInvoice?.dueDate).toBe('2026-05-25')

      // Sum of line items:
      // 12000.50 NPR = 1200050 paisa
      // 450.00 NPR = 45000 paisa
      // 150.25 NPR = 15025 paisa
      // Total = 1260075 paisa
      expect(createdInvoice?.amount).toBe(1260075)

      // Verify line items inserted
      const lineItems = Array.from(mockDb._state.lineItems.values())
      expect(lineItems.length).toBe(3)
      const lineItemSum = lineItems.reduce((acc, item) => acc + item.amount, 0)
      expect(lineItemSum).toBe(createdInvoice?.amount)
    })

    it('throws error when lease does not belong to the calling landlord', async () => {
      const mockDb = {
        transaction: vi.fn(async (cb: (tx: any) => Promise<any>) => {
          return await cb({
            query: {
              leases: {
                findFirst: vi.fn(async () => null), // lease not found or unauthorized
              },
            },
          })
        }),
      }

      await expect(
        createManualInvoice(
          mockDb as unknown as Database,
          'unauthorized-landlord',
          {
            leaseId: 'foreign-lease',
            period: '2026-05',
            dueDate: '2026-05-25',
            lineItems: [
              { description: 'Rent', amountNpr: 10000, kind: 'rent' },
            ],
          },
        ),
      ).rejects.toThrow('Lease not found or access denied')
    })
  })
})
