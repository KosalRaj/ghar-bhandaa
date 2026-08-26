import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { recordCashPayment } from '../payments.server'
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

function createPaymentsMockDb(initialData: {
  invoice: InvoiceRecord | null
  payments: PaymentRecord[]
}) {
  const invoiceData = initialData.invoice ? { ...initialData.invoice } : null
  const paymentsData = new Map<string, PaymentRecord>(
    initialData.payments.map((p) => [p.id, { ...p }]),
  )

  const mockDb = {
    query: {
      invoices: {
        findFirst: vi.fn(async () => invoiceData),
      },
      payments: {
        findMany: vi.fn(async () => {
          return Array.from(paymentsData.values()).filter(
            (p) => p.status === 'confirmed',
          )
        }),
      },
    },
    insert: vi.fn(() => ({
      values: vi.fn(async (paymentValues: PaymentRecord) => {
        paymentsData.set(paymentValues.id, paymentValues)
      }),
    })),
    update: vi.fn(() => ({
      set: vi.fn((setValues: Partial<InvoiceRecord>) => ({
        where: vi.fn(async () => {
          if (invoiceData) {
            Object.assign(invoiceData, setValues)
          }
        }),
      })),
    })),
    transaction: vi.fn(async (cb: (tx: any) => Promise<any>) => {
      return await cb(mockDb)
    }),
    _state: {
      invoice: invoiceData,
      payments: paymentsData,
    },
  }

  return mockDb
}

describe('payments.server logic & balance validation invariants', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-15T06:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('rejects payment when invoice does not belong to the calling landlord', async () => {
    const mockDb = createPaymentsMockDb({
      invoice: null, // access denied or not found
      payments: [],
    })

    await expect(
      recordCashPayment(mockDb as unknown as Database, 'wrong-landlord', {
        invoiceId: 'foreign-inv',
        amountNpr: 5000,
      }),
    ).rejects.toThrow('Invoice not found or access denied')
  })

  it('rejects zero or negative payment amounts', async () => {
    const mockDb = createPaymentsMockDb({
      invoice: {
        id: 'inv-1',
        landlordId: 'll-1',
        leaseId: 'l-1',
        tenantId: 't-1',
        period: '2026-05',
        amount: 1500000, // 15,000 NPR
        dueDate: '2026-05-25',
        status: 'unpaid',
        createdAt: '2026-05-01T00:00:00Z',
        updatedAt: '2026-05-01T00:00:00Z',
      },
      payments: [],
    })

    await expect(
      recordCashPayment(mockDb as unknown as Database, 'll-1', {
        invoiceId: 'inv-1',
        amountNpr: 0,
      }),
    ).rejects.toThrow('Payment amount must be greater than 0')

    await expect(
      recordCashPayment(mockDb as unknown as Database, 'll-1', {
        invoiceId: 'inv-1',
        amountNpr: -100,
      }),
    ).rejects.toThrow('Payment amount must be greater than 0')
  })

  it('rejects payment exceeding remaining balance (Overpayment Barrier)', async () => {
    const mockDb = createPaymentsMockDb({
      invoice: {
        id: 'inv-10',
        landlordId: 'll-1',
        leaseId: 'l-1',
        tenantId: 't-1',
        period: '2026-05',
        amount: 1000000, // 10,000 NPR
        dueDate: '2026-05-25',
        status: 'partial',
        createdAt: '2026-05-01T00:00:00Z',
        updatedAt: '2026-05-01T00:00:00Z',
      },
      payments: [
        {
          id: 'pay-prev',
          landlordId: 'll-1',
          invoiceId: 'inv-10',
          tenantId: 't-1',
          amount: 600000, // 6,000 NPR already paid. Remaining = 4,000 NPR
          method: 'cash',
          status: 'confirmed',
          createdAt: '2026-05-05T00:00:00Z',
        },
      ],
    })

    // Attempt to pay 5,000 NPR when only 4,000 NPR is remaining
    await expect(
      recordCashPayment(mockDb as unknown as Database, 'll-1', {
        invoiceId: 'inv-10',
        amountNpr: 5000,
      }),
    ).rejects.toThrow(/Payment amount exceeds remaining balance/)
  })

  it('records valid partial cash payment and recalculates invoice status to "partial"', async () => {
    const mockDb = createPaymentsMockDb({
      invoice: {
        id: 'inv-20',
        landlordId: 'll-1',
        leaseId: 'l-1',
        tenantId: 't-1',
        period: '2026-05',
        amount: 2000000, // 20,000 NPR
        dueDate: '2026-05-25',
        status: 'unpaid',
        createdAt: '2026-05-01T00:00:00Z',
        updatedAt: '2026-05-01T00:00:00Z',
      },
      payments: [],
    })

    const paymentId = await recordCashPayment(
      mockDb as unknown as Database,
      'll-1',
      {
        invoiceId: 'inv-20',
        amountNpr: 8000.5,
        confirmedAt: '2026-05-15',
      },
    )

    expect(typeof paymentId).toBe('string')
    const insertedPayment = mockDb._state.payments.get(paymentId)
    expect(insertedPayment).toBeDefined()
    expect(insertedPayment?.amount).toBe(800050) // 8,000.50 NPR = 800,050 paisa
    expect(insertedPayment?.method).toBe('cash')
    expect(insertedPayment?.status).toBe('confirmed')
    expect(insertedPayment?.confirmedAt).toBe('2026-05-15')

    // Invoice status recalculated to partial
    expect(mockDb._state.invoice?.status).toBe('partial')
  })

  it('records exact full payment and recalculates invoice status to "paid"', async () => {
    const mockDb = createPaymentsMockDb({
      invoice: {
        id: 'inv-30',
        landlordId: 'll-1',
        leaseId: 'l-1',
        tenantId: 't-1',
        period: '2026-05',
        amount: 1500000, // 15,000 NPR
        dueDate: '2026-05-25',
        status: 'unpaid',
        createdAt: '2026-05-01T00:00:00Z',
        updatedAt: '2026-05-01T00:00:00Z',
      },
      payments: [],
    })

    const paymentId = await recordCashPayment(
      mockDb as unknown as Database,
      'll-1',
      {
        invoiceId: 'inv-30',
        amountNpr: 15000,
      },
    )

    expect(typeof paymentId).toBe('string')
    const insertedPayment = mockDb._state.payments.get(paymentId)
    expect(insertedPayment?.amount).toBe(1500000)
    expect(insertedPayment?.status).toBe('confirmed')
    expect(mockDb._state.invoice?.status).toBe('paid')
  })
})
