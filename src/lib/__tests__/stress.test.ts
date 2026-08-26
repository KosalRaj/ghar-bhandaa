import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nprToPaisa, paisaToNpr, formatNpr } from '../money'
import {
  getTodayInKathmandu,
  isPastDateInKathmandu,
  addDaysInKathmandu,
} from '../dates'
import { recalculateInvoiceStatus } from '../invoices.server'
import { invoiceLineItemInputSchema } from '../../schemas/invoices'
import type { Database } from '#/db/index'

interface MockDbState {
  invoices: Map<string, any>
  payments: Map<string, any>
  leases: Map<string, any>
  lineItems: Map<string, any>
}

function createStressMockDb(initialState?: {
  invoices?: [string, any][]
  payments?: [string, any][]
  leases?: [string, any][]
  lineItems?: [string, any][]
}) {
  const state: MockDbState = {
    invoices: new Map(initialState?.invoices || []),
    payments: new Map(initialState?.payments || []),
    leases: new Map(initialState?.leases || []),
    lineItems: new Map(initialState?.lineItems || []),
  }

  const mockDb = {
    query: {
      invoices: {
        findFirst: vi.fn(async () => {
          for (const inv of state.invoices.values()) {
            return inv
          }
          return undefined
        }),
        findMany: vi.fn(async () => Array.from(state.invoices.values())),
      },
      payments: {
        findMany: vi.fn(async () => {
          return Array.from(state.payments.values()).filter(
            (p) => p.status === 'confirmed',
          )
        }),
      },
      leases: {
        findFirst: vi.fn(async () => {
          for (const lease of state.leases.values()) {
            return lease
          }
          return undefined
        }),
      },
      invoiceLineItems: {
        findMany: vi.fn(async () => Array.from(state.lineItems.values())),
      },
    },
    update: vi.fn(() => ({
      set: vi.fn((setValues: any) => ({
        where: vi.fn(async () => {
          for (const inv of state.invoices.values()) {
            Object.assign(inv, setValues)
          }
        }),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(async (values: any) => {
        if (Array.isArray(values)) {
          for (const v of values) {
            state.lineItems.set(v.id, v)
          }
        } else if (values.period !== undefined) {
          state.invoices.set(values.id, values)
        } else if (values.method !== undefined) {
          state.payments.set(values.id, values)
        }
      }),
    })),
    transaction: vi.fn(async (cb: (tx: any) => Promise<any>) => {
      return await cb(mockDb)
    }),
    _state: state,
  }

  return mockDb
}

describe('Empirical Challenger Milestone 1 Stress Suite', () => {
  describe('1. Paisa Arithmetic Invariants', () => {
    it('Property: Round-trip exactness for all integers from 0 to 100,000 paisa', () => {
      for (let paisa = 0; paisa <= 100000; paisa++) {
        const npr = paisaToNpr(paisa)
        const roundTripped = nprToPaisa(npr)
        expect(roundTripped).toBe(paisa)
      }
    })

    it('Property: Floating-point precision on dangerous IEEE-754 numbers', () => {
      const dangerousAmounts = [
        0.07, 0.14, 0.28, 0.29, 0.57, 1.13, 1.14, 1.15, 19.99, 29.99, 59.95,
        140.35, 1054.45, 12500.75, 999999.99, 1000000.01,
      ]

      for (const amt of dangerousAmounts) {
        const paisa = nprToPaisa(amt)
        expect(Number.isInteger(paisa)).toBe(true)
        expect(Math.abs(paisa / 100 - amt)).toBeLessThan(0.000001)
      }
    })

    it('Property: Large monetary amounts (up to 100 Crore NPR = 1 Billion NPR)', () => {
      const oneBillionNpr = 1_000_000_000
      const paisa = nprToPaisa(oneBillionNpr)
      expect(paisa).toBe(100_000_000_000) // 100 Billion paisa
      expect(Number.isSafeInteger(paisa)).toBe(true)
      expect(paisaToNpr(paisa)).toBe(oneBillionNpr)

      const formatted = formatNpr(paisa)
      expect(formatted).toMatch(/1,000,000,000\.00/)
    })

    it('Property: Sub-paisa rounding semantics (half-up via Math.round)', () => {
      expect(nprToPaisa(10.004999)).toBe(1000) // 1000.4999 -> 1000 paisa
      expect(nprToPaisa(10.005)).toBe(1001) // 1000.5 -> 1001 paisa
      expect(nprToPaisa(10.005001)).toBe(1001)
      expect(nprToPaisa(0.005)).toBe(1) // 0.5 paisa -> 1 paisa
      expect(nprToPaisa(0.0049)).toBe(0) // 0.49 paisa -> 0 paisa
    })

    it('Property: Aggregation linearity (Sum of line items converted individually vs summed)', () => {
      const items = [12500.5, 450.25, 125.75, 99.99, 320.1, 0.01, 14.4]
      const sumNpr = items.reduce((acc, x) => acc + x, 0)
      const sumPaisaFromIndividual = items.reduce(
        (acc, x) => acc + nprToPaisa(x),
        0,
      )
      const paisaFromTotal = nprToPaisa(sumNpr)

      expect(sumPaisaFromIndividual).toBe(paisaFromTotal)
    })

    it('Zod Schema Exhaustive Test: 10,000 consecutive 2-decimal numbers', () => {
      for (let i = 1; i <= 10000; i++) {
        const npr = Math.round(i) / 100 // 0.01, 0.02, ..., 100.00
        const result = invoiceLineItemInputSchema.safeParse({
          description: `Item ${i}`,
          amountNpr: npr,
          kind: 'utility',
        })
        expect(result.success, `Failed on amount: ${npr}`).toBe(true)
      }
    })

    it('FormatNpr formatting stress: across zero, sub-rupee, thousands, millions', () => {
      expect(formatNpr(0)).toMatch(/0\.00/)
      expect(formatNpr(50)).toMatch(/0\.50/)
      expect(formatNpr(100)).toMatch(/1\.00/)
      expect(formatNpr(100000)).toMatch(/1,000\.00/)
      expect(formatNpr(10000000)).toMatch(/100,000\.00/)
      expect(formatNpr(1000000000)).toMatch(/10,000,000\.00/)
    })
  })

  describe('2. Kathmandu Timezone Date Calculations', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('Timezone Transition: 18:14:59 UTC vs 18:15:00 UTC boundary for all months', () => {
      const months = [
        '2026-01-15',
        '2026-02-28',
        '2026-03-31',
        '2026-04-30',
        '2026-05-31',
        '2026-06-30',
        '2026-07-31',
        '2026-08-31',
        '2026-09-30',
        '2026-10-31',
        '2026-11-30',
        '2026-12-31',
      ]

      for (const baseDate of months) {
        vi.setSystemTime(new Date(`${baseDate}T18:14:59.999Z`))
        expect(getTodayInKathmandu()).toBe(baseDate)

        vi.setSystemTime(new Date(`${baseDate}T18:15:00.000Z`))
        const nextDay = addDaysInKathmandu(1, baseDate)
        expect(getTodayInKathmandu()).toBe(nextDay)
      }
    })

    it('addDaysInKathmandu: Leap years (2024, 2028, 2000 vs 2026, 2100)', () => {
      expect(addDaysInKathmandu(1, '2024-02-28')).toBe('2024-02-29')
      expect(addDaysInKathmandu(2, '2024-02-28')).toBe('2024-03-01')
      expect(addDaysInKathmandu(-1, '2024-03-01')).toBe('2024-02-29')

      expect(addDaysInKathmandu(1, '2026-02-28')).toBe('2026-03-01')
      expect(addDaysInKathmandu(-1, '2026-03-01')).toBe('2026-02-28')

      expect(addDaysInKathmandu(1, '2000-02-28')).toBe('2000-02-29')
      expect(addDaysInKathmandu(1, '2100-02-28')).toBe('2100-03-01')
    })

    it('addDaysInKathmandu: Year transitions and large day offsets', () => {
      expect(addDaysInKathmandu(1, '2025-12-31')).toBe('2026-01-01')
      expect(addDaysInKathmandu(365, '2025-01-01')).toBe('2026-01-01')
      expect(addDaysInKathmandu(366, '2024-01-01')).toBe('2025-01-01')

      expect(addDaysInKathmandu(-1, '2026-01-01')).toBe('2025-12-31')
      expect(addDaysInKathmandu(-365, '2026-01-01')).toBe('2025-01-01')

      const d1000 = addDaysInKathmandu(1000, '2026-01-01')
      expect(d1000).toBe('2028-09-27')
    })

    it('isPastDateInKathmandu: Boundary conditions at exact current day', () => {
      vi.setSystemTime(new Date('2026-08-26T06:15:00Z'))

      expect(isPastDateInKathmandu('2026-08-25')).toBe(true)
      expect(isPastDateInKathmandu('2026-08-26')).toBe(false)
      expect(isPastDateInKathmandu('2026-08-27')).toBe(false)
    })
  })

  describe('3. Invoice Status Recalculation State Transitions', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-05-15T06:00:00Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('Sequence 1: Unpaid -> Partial -> Overdue (time passes) -> Paid (late payment)', async () => {
      const invoiceId = 'inv-lifecycle-1'
      const invoiceAmount = 2000000

      vi.setSystemTime(new Date('2026-05-01T06:00:00Z'))
      const mockDb = createStressMockDb({
        invoices: [
          [
            invoiceId,
            {
              id: invoiceId,
              landlordId: 'll-1',
              leaseId: 'l-1',
              tenantId: 't-1',
              period: '2026-05',
              amount: invoiceAmount,
              dueDate: '2026-05-10',
              status: 'unpaid',
            },
          ],
        ],
      })

      let status = await recalculateInvoiceStatus(
        mockDb as unknown as Database,
        invoiceId,
      )
      expect(status).toBe('unpaid')

      vi.setSystemTime(new Date('2026-05-05T06:00:00Z'))
      mockDb._state.payments.set('pay-1', {
        id: 'pay-1',
        landlordId: 'll-1',
        invoiceId,
        amount: 500000,
        status: 'confirmed',
      })
      status = await recalculateInvoiceStatus(
        mockDb as unknown as Database,
        invoiceId,
      )
      expect(status).toBe('partial')

      vi.setSystemTime(new Date('2026-05-15T06:00:00Z'))
      status = await recalculateInvoiceStatus(
        mockDb as unknown as Database,
        invoiceId,
      )
      expect(status).toBe('overdue')

      vi.setSystemTime(new Date('2026-05-16T06:00:00Z'))
      mockDb._state.payments.set('pay-2', {
        id: 'pay-2',
        landlordId: 'll-1',
        invoiceId,
        amount: 500000,
        status: 'confirmed',
      })
      status = await recalculateInvoiceStatus(
        mockDb as unknown as Database,
        invoiceId,
      )
      expect(status).toBe('overdue')

      vi.setSystemTime(new Date('2026-05-20T06:00:00Z'))
      mockDb._state.payments.set('pay-3', {
        id: 'pay-3',
        landlordId: 'll-1',
        invoiceId,
        amount: 1000000,
        status: 'confirmed',
      })
      status = await recalculateInvoiceStatus(
        mockDb as unknown as Database,
        invoiceId,
      )
      expect(status).toBe('paid')
    })

    it('Sequence 2: Non-confirmed payment statuses (initiated, pending_verification, rejected, failed) do NOT affect invoice status', async () => {
      const invoiceId = 'inv-unconfirmed-1'
      const invoiceAmount = 1500000
      const mockDb = createStressMockDb({
        invoices: [
          [
            invoiceId,
            {
              id: invoiceId,
              landlordId: 'll-1',
              leaseId: 'l-1',
              tenantId: 't-1',
              period: '2026-05',
              amount: invoiceAmount,
              dueDate: '2026-05-20',
              status: 'unpaid',
            },
          ],
        ],
      })

      mockDb._state.payments.set('pay-init', {
        id: 'pay-init',
        invoiceId,
        amount: 1500000,
        status: 'initiated',
      })
      mockDb._state.payments.set('pay-pending', {
        id: 'pay-pending',
        invoiceId,
        amount: 1500000,
        status: 'pending_verification',
      })
      mockDb._state.payments.set('pay-rej', {
        id: 'pay-rej',
        invoiceId,
        amount: 1500000,
        status: 'rejected',
      })
      mockDb._state.payments.set('pay-fail', {
        id: 'pay-fail',
        invoiceId,
        amount: 1500000,
        status: 'failed',
      })

      let status = await recalculateInvoiceStatus(
        mockDb as unknown as Database,
        invoiceId,
      )
      expect(status).toBe('unpaid')

      mockDb._state.payments.set('pay-confirmed-1p', {
        id: 'pay-confirmed-1p',
        invoiceId,
        amount: 1,
        status: 'confirmed',
      })
      status = await recalculateInvoiceStatus(
        mockDb as unknown as Database,
        invoiceId,
      )
      expect(status).toBe('partial')
    })

    it('Sequence 3: Complex micro-payment accumulation matching exact total amount', async () => {
      const invoiceId = 'inv-micropayments'
      const totalAmount = 10000
      const mockDb = createStressMockDb({
        invoices: [
          [
            invoiceId,
            {
              id: invoiceId,
              landlordId: 'll-1',
              leaseId: 'l-1',
              tenantId: 't-1',
              period: '2026-05',
              amount: totalAmount,
              dueDate: '2026-05-25',
              status: 'unpaid',
            },
          ],
        ],
      })

      for (let i = 1; i <= 100; i++) {
        mockDb._state.payments.set(`pay-${i}`, {
          id: `pay-${i}`,
          invoiceId,
          amount: 100,
          status: 'confirmed',
        })
        const status = await recalculateInvoiceStatus(
          mockDb as unknown as Database,
          invoiceId,
        )
        if (i < 100) {
          expect(status).toBe('partial')
        } else {
          expect(status).toBe('paid')
        }
      }
    })

    it('Sequence 4: Due Date Boundary (On due date vs Day before vs Day after)', async () => {
      const invoiceId = 'inv-due-boundary'
      const invoiceAmount = 1000000
      const dueDate = '2026-05-15'

      const mockDb = createStressMockDb({
        invoices: [
          [
            invoiceId,
            {
              id: invoiceId,
              landlordId: 'll-1',
              leaseId: 'l-1',
              tenantId: 't-1',
              period: '2026-05',
              amount: invoiceAmount,
              dueDate: dueDate,
              status: 'unpaid',
            },
          ],
        ],
      })

      vi.setSystemTime(new Date('2026-05-14T10:00:00Z'))
      let status = await recalculateInvoiceStatus(
        mockDb as unknown as Database,
        invoiceId,
      )
      expect(status).toBe('unpaid')

      vi.setSystemTime(new Date('2026-05-15T10:00:00Z'))
      status = await recalculateInvoiceStatus(
        mockDb as unknown as Database,
        invoiceId,
      )
      expect(status).toBe('unpaid')

      vi.setSystemTime(new Date('2026-05-16T01:00:00Z'))
      status = await recalculateInvoiceStatus(
        mockDb as unknown as Database,
        invoiceId,
      )
      expect(status).toBe('overdue')
    })

    it('Idempotence: 50 consecutive calls produce identical output and state without side-effects', async () => {
      const invoiceId = 'inv-idempotent'
      const mockDb = createStressMockDb({
        invoices: [
          [
            invoiceId,
            {
              id: invoiceId,
              landlordId: 'll-1',
              leaseId: 'l-1',
              tenantId: 't-1',
              period: '2026-05',
              amount: 1500000,
              dueDate: '2026-05-10',
              status: 'overdue',
            },
          ],
        ],
      })

      for (let i = 0; i < 50; i++) {
        const status = await recalculateInvoiceStatus(
          mockDb as unknown as Database,
          invoiceId,
        )
        expect(status).toBe('overdue')
      }
    })

    it('Full Fuzz: Random permutation state machine test across 500 payment sequences', async () => {
      for (let trial = 0; trial < 500; trial++) {
        const totalAmount = Math.floor(Math.random() * 50000) + 100
        const invoiceId = `fuzz-${trial}`
        const isPast = Math.random() > 0.5
        const dueDate = isPast ? '2026-05-10' : '2026-05-20'

        const mockDb = createStressMockDb({
          invoices: [
            [
              invoiceId,
              {
                id: invoiceId,
                landlordId: 'll-1',
                leaseId: 'l-1',
                tenantId: 't-1',
                period: '2026-05',
                amount: totalAmount,
                dueDate: dueDate,
                status: 'unpaid',
              },
            ],
          ],
        })

        const numPayments = Math.floor(Math.random() * 5) + 1
        let runningPaid = 0
        for (let p = 0; p < numPayments; p++) {
          const remaining = totalAmount - runningPaid
          if (remaining <= 0) break
          const payAmount =
            p === numPayments - 1 && Math.random() > 0.3
              ? remaining
              : Math.floor(Math.random() * remaining) + 1
          runningPaid += payAmount

          mockDb._state.payments.set(`fuzz-pay-${trial}-${p}`, {
            id: `fuzz-pay-${trial}-${p}`,
            invoiceId,
            amount: payAmount,
            status: 'confirmed',
          })
        }

        const status = await recalculateInvoiceStatus(
          mockDb as unknown as Database,
          invoiceId,
        )

        if (runningPaid >= totalAmount) {
          expect(status).toBe('paid')
        } else if (isPast) {
          expect(status).toBe('overdue')
        } else if (runningPaid > 0) {
          expect(status).toBe('partial')
        } else {
          expect(status).toBe('unpaid')
        }
      }
    })
  })
})
