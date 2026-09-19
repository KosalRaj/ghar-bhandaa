// @vitest-environment jsdom
import { fireEvent, render, screen, act, cleanup } from '@testing-library/react'
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { Route as LeasesRoute } from '#/routes/_authed/leases'
import { Route as InvoiceDetailsRoute } from '#/routes/_authed/invoices.$invoiceId'
import * as leasesFunctions from '#/server/leases.functions'
import * as paymentsFunctions from '#/server/payments.functions'
import { formatNpr } from '#/lib/money'
import fs from 'node:fs'
import path from 'node:path'

// Mock TanStack Router
const mockNavigate = vi.fn()
const mockInvalidate = vi.fn()
let currentLeasesLoaderData: any = {}
let currentInvoiceLoaderData: any = {}

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, hash, children, className, onClick }: any) => (
    <a
      href={`${to || '/'}${hash ? `#${hash}` : ''}`}
      className={className}
      onClick={onClick}
    >
      {children}
    </a>
  ),
  useNavigate: () => mockNavigate,
  useRouter: () => ({
    invalidate: mockInvalidate,
  }),
  createFileRoute: (routePath: string) => (options: any) => {
    const routeObj: any = {
      options,
      component: options.component,
      useLoaderData: () => {
        if (routePath.includes('leases')) {
          return currentLeasesLoaderData
        }
        if (routePath.includes('invoices')) {
          return currentInvoiceLoaderData
        }
        return {}
      },
    }
    return routeObj
  },
}))

// Mock Server Functions
vi.mock('#/server/leases.functions', () => ({
  getLeases: vi.fn(),
  createLease: vi.fn(),
  endLease: vi.fn(),
}))

vi.mock('#/server/rooms.functions', () => ({
  getRooms: vi.fn().mockResolvedValue([]),
}))

vi.mock('#/server/tenants.functions', () => ({
  getTenants: vi.fn().mockResolvedValue([]),
}))

vi.mock('#/server/invoices.functions', () => ({
  getInvoiceDetails: vi.fn(),
}))

vi.mock('#/server/payments.functions', () => ({
  recordCashPaymentFn: vi.fn(),
}))

// Toast manager mock
vi.mock('#/components/ui/toast', () => ({
  toastManager: {
    add: vi.fn(),
  },
}))

const LeasesPageComponent = (LeasesRoute as any).options.component
const InvoiceDetailsPageComponent = (InvoiceDetailsRoute as any).options.component

describe('Challenger UI M3.2: Leases AlertDialog & Invoice Feedback Empirical Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.requestAnimationFrame = (cb: FrameRequestCallback) => {
      return setTimeout(() => cb(performance.now()), 0) as unknown as number
    }
    window.cancelAnimationFrame = (id: number) => clearTimeout(id)
  })

  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  // =========================================================================
  // 1. LEASES TABLE RESPONSIVE FALLBACK & ALERTDIALOG TERMINATION BARRIER
  // =========================================================================
  describe('leases.tsx — Responsive Layout & AlertDialog Termination Barrier', () => {
    const mockLeases = [
      {
        id: 'lease-act-1',
        roomId: 'room-101',
        tenantId: 'tenant-1',
        propertyName: 'Himalayan Residency',
        roomName: 'Suite 101',
        tenantName: 'Sita Sharma',
        tenantEmail: 'sita@example.com',
        rentAmount: 1800000, // 18,000 NPR in paisa
        depositAmount: 3600000, // 36,000 NPR in paisa
        billingDay: 5,
        startDate: '2026-01-01',
        endDate: null,
        status: 'active',
      },
      {
        id: 'lease-term-2',
        roomId: 'room-202',
        tenantId: 'tenant-2',
        propertyName: 'Himalayan Residency',
        roomName: 'Suite 202',
        tenantName: 'Gopal Thapa',
        tenantEmail: 'gopal@example.com',
        rentAmount: 1400000, // 14,000 NPR in paisa
        depositAmount: 2800000, // 28,000 NPR in paisa
        billingDay: 10,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        status: 'terminated',
      },
    ]

    beforeEach(() => {
      currentLeasesLoaderData = {
        leases: mockLeases,
        rooms: [],
        tenants: [],
      }
    })

    it('empirically verifies 8-column desktop table and responsive mobile card fallback layout', () => {
      const { container } = render(<LeasesPageComponent />)

      // 1. Desktop container has hidden md:block
      const desktopContainer = container.querySelector('.hidden.md\\:block')
      expect(desktopContainer).not.toBeNull()

      // Desktop table headers (8 columns)
      const tableHeaders = desktopContainer?.querySelectorAll('th')
      expect(tableHeaders?.length).toBe(8)
      const headerTexts = Array.from(tableHeaders || []).map((th) =>
        th.textContent.trim(),
      )
      expect(headerTexts).toEqual([
        'Tenant',
        'Room & Property',
        'Rent',
        'Deposit',
        'Billing Day',
        'Period',
        'Status',
        'Actions',
      ])

      // 2. Mobile container has md:hidden flex-col
      const mobileContainer = container.querySelector('.md\\:hidden')
      expect(mobileContainer).not.toBeNull()

      // Mobile cards count matches leases count (2 cards)
      const mobileCards = mobileContainer?.querySelectorAll('.rounded-2xl')
      expect(mobileCards?.length).toBe(2)

      // Active lease mobile card contains all critical contract points
      const activeCard = mobileCards?.[0]
      expect(activeCard?.textContent).toContain('Sita Sharma')
      expect(activeCard?.textContent).toContain('Suite 101')
      expect(activeCard?.textContent).toContain('Himalayan Residency')
      expect(activeCard?.textContent).toContain(formatNpr(1800000)) // Rent
      expect(activeCard?.textContent).toContain(formatNpr(3600000)) // Deposit
      expect(activeCard?.textContent).toContain('Day 5')
      expect(activeCard?.textContent).toContain('2026-01-01 (ongoing)')
      expect(activeCard?.textContent).toContain('active')

      // Terminated lease mobile card displays termination period and no ongoing
      const terminatedCard = mobileCards?.[1]
      expect(terminatedCard?.textContent).toContain('Gopal Thapa')
      expect(terminatedCard?.textContent).toContain('2025-01-01 to 2025-12-31')
      expect(terminatedCard?.textContent).toContain('terminated')
    })

    it('enforces that End Lease action is ONLY accessible for active leases in both views', () => {
      const { container } = render(<LeasesPageComponent />)

      const desktopContainer = container.querySelector('.hidden.md\\:block')
      const desktopEndButtons =
        desktopContainer?.querySelectorAll('button') || []
      expect(desktopEndButtons.length).toBe(1)
      expect(desktopEndButtons[0].textContent).toContain('End Lease')

      const mobileContainer = container.querySelector('.md\\:hidden')
      const mobileEndButtons =
        mobileContainer?.querySelectorAll('button') || []
      expect(mobileEndButtons.length).toBe(1)
      expect(mobileEndButtons[0].textContent).toContain('End Lease')
    })

    it('empirically verifies AlertDialog barrier: opening, semantic attributes, cancel action, and dismissal', async () => {
      render(<LeasesPageComponent />)

      // Initially no alert dialog is open in document
      expect(screen.queryByRole('alertdialog')).toBeNull()

      // Click "End Lease" from desktop view
      const endButtons = screen.getAllByRole('button', { name: /End Lease/i })
      await act(async () => {
        fireEvent.click(endButtons[0])
      })

      // AlertDialog should be mounted with semantic role
      const alertDialog = screen.getByRole('alertdialog')
      expect(alertDialog).toBeDefined()
      expect(alertDialog.getAttribute('data-slot')).toBe('alert-dialog-popup')

      // Verifies title and description barrier
      expect(screen.getByText('Terminate Lease Contract')).toBeDefined()
      expect(
        screen.getByText(
          /Mark this lease as terminated and set the effective closure date/i,
        ),
      ).toBeDefined()

      // Cancel button should dismiss the modal without calling endLease
      const cancelBtn = screen.getByRole('button', { name: /Cancel/i })
      await act(async () => {
        fireEvent.click(cancelBtn)
      })

      expect(leasesFunctions.endLease).not.toHaveBeenCalled()
      expect(screen.queryByRole('alertdialog')).toBeNull()
    })

    it('empirically verifies AlertDialog destructive styling and successful termination execution', async () => {
      vi.mocked(leasesFunctions.endLease).mockResolvedValueOnce({
        id: 'lease-act-1',
      } as any)

      render(<LeasesPageComponent />)

      // Open dialog from mobile card End Lease button
      const endButtons = screen.getAllByRole('button', { name: /End Lease/i })
      await act(async () => {
        fireEvent.click(endButtons[1]) // mobile view button
      })

      // Verify destructive styling on confirm button
      const confirmButton = screen.getByRole('button', {
        name: /Terminate Lease/i,
      })
      expect(confirmButton).toBeDefined()
      expect(confirmButton.className).toContain('destructive')
      expect(confirmButton.querySelector('svg')).not.toBeNull()

      // Submit termination
      await act(async () => {
        fireEvent.click(confirmButton)
      })

      expect(leasesFunctions.endLease).toHaveBeenCalledTimes(1)
      expect(leasesFunctions.endLease).toHaveBeenCalledWith({
        data: {
          id: 'lease-act-1',
          endDate: expect.any(String),
        },
      })
      expect(mockInvalidate).toHaveBeenCalledTimes(1)
    })

    it('safely handles termination error by displaying Alert without dismissing barrier', async () => {
      vi.mocked(leasesFunctions.endLease).mockRejectedValueOnce(
        new Error('Database lock contention error'),
      )

      render(<LeasesPageComponent />)

      const endButtons = screen.getAllByRole('button', { name: /End Lease/i })
      await act(async () => {
        fireEvent.click(endButtons[0])
      })

      const confirmButton = screen.getByRole('button', {
        name: /Terminate Lease/i,
      })
      await act(async () => {
        fireEvent.click(confirmButton)
      })

      // Error alert displayed inside dialog
      expect(
        screen.getByText('Database lock contention error'),
      ).toBeDefined()
      // Dialog remains open for retry
      expect(screen.getByRole('alertdialog')).toBeDefined()
    })

    it('renders EmptyContent with actionable CTA when no leases exist', () => {
      currentLeasesLoaderData = {
        leases: [],
        rooms: [],
        tenants: [],
      }

      render(<LeasesPageComponent />)
      expect(screen.getByText('No Leases Registered')).toBeDefined()
      const createCta = screen.getByRole('button', {
        name: /Create First Lease/i,
      })
      expect(createCta).toBeDefined()
    })
  })

  // =========================================================================
  // 2. INVOICE CASH PAYMENT VALIDATION SHAKE & CELEBRATORY SUCCESS CHECK
  // =========================================================================
  describe('invoices.$invoiceId.tsx — Cash Payment Validation Shake & Success Check', () => {
    const mockInvoiceData = {
      invoice: {
        id: 'inv-nep-999',
        leaseId: 'lease-act-1',
        amount: 2000000, // 20,000 NPR in paisa
        period: '2026-09',
        dueDate: '2026-09-15',
        status: 'partial',
      },
      tenant: {
        id: 'tenant-1',
        name: 'Sita Sharma',
        email: 'sita@example.com',
        phone: '9841234567',
      },
      lease: {
        id: 'lease-act-1',
        billingDay: 5,
      },
      room: {
        id: 'room-101',
        name: 'Suite 101',
      },
      property: {
        id: 'prop-1',
        name: 'Himalayan Residency',
      },
      lineItems: [
        {
          id: 'li-1',
          description: 'Monthly Room Rent',
          kind: 'rent',
          amount: 2000000,
        },
      ],
      payments: [
        {
          id: 'pay-prev-1',
          amount: 800000, // 8,000 NPR in paisa
          method: 'cash',
          status: 'success',
          confirmedAt: '2026-09-06',
          gatewayRef: 'CASH-001',
        },
      ],
    }
    // Remaining balance: 20,000 - 8,000 = 12,000 NPR = 1,200,000 paisa

    beforeEach(() => {
      currentInvoiceLoaderData = mockInvoiceData
    })

    it('renders invoice details correctly with remaining balance computation', () => {
      render(<InvoiceDetailsPageComponent />)

      expect(screen.getByText('Invoice details')).toBeDefined()
      expect(screen.getByText('ID: inv-nep-999')).toBeDefined()
      expect(screen.getAllByText(/20,000\.00/).length).toBeGreaterThan(0) // Total amount
      expect(screen.getAllByText(/8,000\.00/).length).toBeGreaterThan(0) // Total paid
      expect(screen.getAllByText(/12,000\.00/).length).toBeGreaterThan(0) // Remaining balance
      expect(
        screen.getByRole('button', { name: /Record Cash Payment/i }),
      ).toBeDefined()
    })

    it('triggers .t-input-shake when payment amount is 0', async () => {
      render(<InvoiceDetailsPageComponent />)

      // Open Cash Payment Modal
      const openBtn = screen.getByRole('button', {
        name: /Record Cash Payment/i,
      })
      await act(async () => {
        fireEvent.click(openBtn)
      })

      // Find amount input (defaults to remaining balance 12000)
      const input = screen.getByLabelText(/Amount Received \(NPR\)/i)
      expect(input).toBeDefined()

      // Change amount to 0
      await act(async () => {
        fireEvent.change(input, { target: { value: '0' } })
      })

      // Submit form
      const form = input.closest('form')!
      await act(async () => {
        fireEvent.submit(form)
        await new Promise((r) => setTimeout(r, 10))
      })

      // Error message rendered
      expect(
        screen.getByText('Payment amount must be greater than 0'),
      ).toBeDefined()

      // Shake animation class applied to the input container in portal
      const shakeContainer = document.querySelector('.t-input-shake')
      expect(shakeContainer).not.toBeNull()
      expect(paymentsFunctions.recordCashPaymentFn).not.toHaveBeenCalled()
    })

    it('triggers .t-input-shake when payment amount is negative (-500)', async () => {
      render(<InvoiceDetailsPageComponent />)

      const openBtn = screen.getByRole('button', {
        name: /Record Cash Payment/i,
      })
      await act(async () => {
        fireEvent.click(openBtn)
      })

      const input = screen.getByLabelText(/Amount Received \(NPR\)/i)
      await act(async () => {
        fireEvent.change(input, { target: { value: '-500' } })
      })

      const form = input.closest('form')!
      await act(async () => {
        fireEvent.submit(form)
        await new Promise((r) => setTimeout(r, 10))
      })

      expect(
        screen.getByText('Payment amount must be greater than 0'),
      ).toBeDefined()

      const shakeContainer = document.querySelector('.t-input-shake')
      expect(shakeContainer).not.toBeNull()
      expect(paymentsFunctions.recordCashPaymentFn).not.toHaveBeenCalled()
    })

    it('triggers .t-input-shake when payment amount exceeds remaining balance', async () => {
      render(<InvoiceDetailsPageComponent />)

      const openBtn = screen.getByRole('button', {
        name: /Record Cash Payment/i,
      })
      await act(async () => {
        fireEvent.click(openBtn)
      })

      const input = screen.getByLabelText(/Amount Received \(NPR\)/i)

      // Change amount to 12000.01 (exceeds remaining balance of 12000.00)
      await act(async () => {
        fireEvent.change(input, { target: { value: '12000.01' } })
      })

      const form = input.closest('form')!
      await act(async () => {
        fireEvent.submit(form)
        await new Promise((r) => setTimeout(r, 10))
      })

      expect(
        screen.getByText(/Payment cannot exceed the remaining balance of/i),
      ).toBeDefined()

      const shakeContainer = document.querySelector('.t-input-shake')
      expect(shakeContainer).not.toBeNull()
      expect(paymentsFunctions.recordCashPaymentFn).not.toHaveBeenCalled()
    })

    it('triggers .t-input-shake when server fails during cash payment submission', async () => {
      vi.mocked(paymentsFunctions.recordCashPaymentFn).mockRejectedValueOnce(
        new Error('Network connection timeout'),
      )

      render(<InvoiceDetailsPageComponent />)

      const openBtn = screen.getByRole('button', {
        name: /Record Cash Payment/i,
      })
      await act(async () => {
        fireEvent.click(openBtn)
      })

      const input = screen.getByLabelText(/Amount Received \(NPR\)/i)
      const form = input.closest('form')!

      // Amount is already 12000 (valid remaining balance)
      await act(async () => {
        fireEvent.submit(form)
        await new Promise((r) => setTimeout(r, 10))
      })

      expect(screen.getByText('Network connection timeout')).toBeDefined()
      const shakeContainer = document.querySelector('.t-input-shake')
      expect(shakeContainer).not.toBeNull()
    })

    it('clears .t-input-shake class on animationend and on new input edit', async () => {
      render(<InvoiceDetailsPageComponent />)

      const openBtn = screen.getByRole('button', {
        name: /Record Cash Payment/i,
      })
      await act(async () => {
        fireEvent.click(openBtn)
      })

      const input = screen.getByLabelText(/Amount Received \(NPR\)/i)
      await act(async () => {
        fireEvent.change(input, { target: { value: '0' } })
      })

      const form = input.closest('form')!
      await act(async () => {
        fireEvent.submit(form)
        await new Promise((r) => setTimeout(r, 10))
      })

      const shakeContainer = document.querySelector('.t-input-shake')
      expect(shakeContainer).not.toBeNull()
      const propsKey = Object.keys(shakeContainer || {}).find(k => k.startsWith('__reactProps'))
      expect(propsKey).toBeDefined()
      // Trigger animationEnd handler
      await act(async () => {
        if (propsKey) {
          (shakeContainer as any)[propsKey].onAnimationEnd()
        }
        await new Promise((r) => setTimeout(r, 10))
      })

      expect(document.querySelector('.t-input-shake')).toBeNull()

      // Trigger shake again with invalid input
      await act(async () => {
        fireEvent.submit(form)
        await new Promise((r) => setTimeout(r, 10))
      })
      expect(document.querySelector('.t-input-shake')).not.toBeNull()

      // User modifies input -> shake class immediately clears
      await act(async () => {
        fireEvent.change(input, { target: { value: '5000' } })
        await new Promise((r) => setTimeout(r, 10))
      })
      expect(document.querySelector('.t-input-shake')).toBeNull()
    })

    it('empirically verifies celebratory .t-success-check dialog on successful payment without getting stuck', async () => {
      vi.mocked(paymentsFunctions.recordCashPaymentFn).mockResolvedValueOnce({
        id: 'new-pay-1',
      } as any)

      render(<InvoiceDetailsPageComponent />)

      const openBtn = screen.getByRole('button', {
        name: /Record Cash Payment/i,
      })
      await act(async () => {
        fireEvent.click(openBtn)
      })

      const input = screen.getByLabelText(/Amount Received \(NPR\)/i)
      await act(async () => {
        fireEvent.change(input, { target: { value: '5000' } })
      })

      const form = input.closest('form')!
      await act(async () => {
        fireEvent.submit(form)
        await new Promise((r) => setTimeout(r, 10))
      })

      expect(paymentsFunctions.recordCashPaymentFn).toHaveBeenCalledWith({
        data: {
          invoiceId: 'inv-nep-999',
          amountNpr: 5000,
          confirmedAt: expect.any(String),
        },
      })

      // Payment form modal is closed
      expect(screen.queryByRole('heading', { name: 'Record Cash Payment' })).toBeNull()

      // Celebratory Success Modal is open
      const successModal = screen.getByRole('dialog')
      expect(successModal).toBeDefined()
      expect(screen.getByText('Payment Recorded!')).toBeDefined()
      expect(
        screen.getByText(/Successfully collected.*in cash/i),
      ).toBeDefined()

      // Celebratory check icon attributes
      const successCheck = successModal.querySelector('.t-success-check')
      expect(successCheck).not.toBeNull()
      expect(successCheck?.getAttribute('data-state')).toBe('in')

      const checkPath = successCheck?.querySelector('path')
      expect(checkPath).not.toBeNull()
      expect(checkPath?.getAttribute('pathLength')).toBe('20')
      expect(checkPath?.getAttribute('d')).toBe('M5 13l4 4L19 7')

      // Dismissal barrier: Click "Done"
      const doneBtn = screen.getByRole('button', { name: /Done/i })
      await act(async () => {
        fireEvent.click(doneBtn)
      })

      // Verifies dialog is dismissed and not stuck in DOM
      expect(screen.queryByText('Payment Recorded!')).toBeNull()
      expect(mockInvalidate).toHaveBeenCalledTimes(1)
    })

    it('permits exact remaining balance payment (12,000 NPR) without triggering shake', async () => {
      vi.mocked(paymentsFunctions.recordCashPaymentFn).mockResolvedValueOnce({
        id: 'new-pay-full',
      } as any)

      render(<InvoiceDetailsPageComponent />)

      const openBtn = screen.getByRole('button', {
        name: /Record Cash Payment/i,
      })
      await act(async () => {
        fireEvent.click(openBtn)
      })

      const input = screen.getByLabelText(/Amount Received \(NPR\)/i)
      const form = input.closest('form')!

      // Default is already 12000 (remaining balance)
      await act(async () => {
        fireEvent.submit(form)
      })

      expect(document.querySelector('.t-input-shake')).toBeNull()
      expect(paymentsFunctions.recordCashPaymentFn).toHaveBeenCalledWith({
        data: {
          invoiceId: 'inv-nep-999',
          amountNpr: 12000,
          confirmedAt: expect.any(String),
        },
      })
    })

    it('omits the Record Cash Payment button when invoice status is paid', () => {
      currentInvoiceLoaderData = {
        ...mockInvoiceData,
        invoice: {
          ...mockInvoiceData.invoice,
          status: 'paid',
        },
      }

      render(<InvoiceDetailsPageComponent />)
      expect(
        screen.queryByRole('button', { name: /Record Cash Payment/i }),
      ).toBeNull()
    })
  })

  // =========================================================================
  // 3. CSS TOKEN & REDUCED MOTION SPECIFICATION VERIFICATION
  // =========================================================================
  describe('CSS Motion Token Doctrine & Reduced Motion Neutralization', () => {
    it('verifies src/styles.css contains .t-input-shake and .t-success-check definitions with reduced motion guard', () => {
      const stylesPath = path.resolve(process.cwd(), 'src/styles.css')
      const css = fs.readFileSync(stylesPath, 'utf8')

      // 1. Shake animation tokens
      expect(css).toContain('.t-input-shake {')
      expect(css).toContain('@keyframes t-input-shake')
      expect(css).toContain('--shake-distance')
      expect(css).toContain('--shake-overshoot')

      // 2. Success check animation tokens
      expect(css).toContain('.t-success-check {')
      expect(css).toContain('.t-success-check[data-state="in"]')
      expect(css).toContain('stroke-dasharray: 20;')
      expect(css).toContain('stroke-dashoffset: 20;')
      expect(css).toContain('@keyframes t-check-fade')
      expect(css).toContain('@keyframes t-success-draw')

      // 3. Prefers-reduced-motion block neutralizes animations
      const reducedMotionSection = css.split('@media (prefers-reduced-motion: reduce)')[1]
      expect(reducedMotionSection).toBeDefined()
      expect(reducedMotionSection).toContain('.t-input-shake')
      expect(reducedMotionSection).toContain('.t-success-check')
      expect(reducedMotionSection).toContain('animation: none !important')
      expect(reducedMotionSection).toContain('opacity: 1 !important')
      expect(reducedMotionSection).toContain('stroke-dashoffset: 0 !important')
    })
  })
})
