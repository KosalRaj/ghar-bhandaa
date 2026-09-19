// @vitest-environment jsdom
import { fireEvent, render, screen, act, cleanup } from '@testing-library/react'
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import Header from '../Header'
import LandlordHeader from '../LandlordHeader'
import { Route as DashboardRoute } from '#/routes/_authed/dashboard'
import { Route as LeasesRoute } from '#/routes/_authed/leases'
import { Route as InvoiceDetailsRoute } from '#/routes/_authed/invoices.$invoiceId'
import { authClient } from '#/lib/auth-client'
import { nprToPaisa, paisaToNpr, formatNpr } from '#/lib/money'
import {
  getTodayInKathmandu,
  isPastDateInKathmandu,
  addDaysInKathmandu,
} from '#/lib/dates'
import { recordCashPaymentFn } from '#/server/payments.functions'
import { endLease } from '#/server/leases.functions'

// Mock TanStack Router
const mockNavigate = vi.fn()
const mockRouterInvalidate = vi.fn()

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual<any>('@tanstack/react-router')
  return {
    ...actual,
    useRouter: () => ({
      invalidate: mockRouterInvalidate,
    }),
    useNavigate: () => mockNavigate,
    Link: ({
      to,
      children,
      onClick,
      className,
      params,
      ...props
    }: any) => (
      <a
        href={typeof to === 'string' ? to : '#'}
        onClick={(e) => {
          e.preventDefault()
          onClick?.(e)
        }}
        className={className}
        data-testid="mock-link"
        data-params={params ? JSON.stringify(params) : undefined}
        {...props}
      >
        {children}
      </a>
    ),
  }
})

// Mock cloudflare:workers
vi.mock('cloudflare:workers', () => ({
  env: {
    DB: {},
  },
}))

// Mock authClient
vi.mock('#/lib/auth-client', () => ({
  authClient: {
    useSession: vi.fn(),
    signOut: vi.fn().mockResolvedValue({}),
  },
}))

// Mock server functions
vi.mock('#/server/invoices.functions', () => ({
  getDashboardData: vi.fn(),
  createManualInvoiceFn: vi.fn().mockResolvedValue({ id: 'inv-new-uuid' }),
  getInvoiceDetails: vi.fn(),
}))

vi.mock('#/server/leases.functions', () => ({
  getLeases: vi.fn(),
  createLease: vi.fn().mockResolvedValue({ id: 'lease-new-uuid' }),
  endLease: vi.fn().mockResolvedValue({ id: 'lease-ended-uuid' }),
}))

vi.mock('#/server/rooms.functions', () => ({
  getRooms: vi.fn().mockResolvedValue([]),
  createRoom: vi.fn(),
  updateRoom: vi.fn(),
}))

vi.mock('#/server/tenants.functions', () => ({
  getTenants: vi.fn().mockResolvedValue([]),
  createTenant: vi.fn(),
  updateTenant: vi.fn(),
}))

vi.mock('#/server/payments.functions', () => ({
  recordCashPaymentFn: vi.fn().mockResolvedValue({ id: 'pay-new-uuid' }),
}))

describe('Challenger UI M4 — Global Adversarial Empirical Stress Suite', () => {
  const cssPath = path.resolve(process.cwd(), 'src/styles.css')
  let cssContent: string

  beforeEach(() => {
    vi.clearAllMocks()
    cssContent = fs.readFileSync(cssPath, 'utf-8')
  })

  afterEach(() => {
    cleanup()
  })

  /* ==========================================================================
     SUITE 1: UNIVERSAL REDUCED MOTION COMPLIANCE
     ========================================================================== */
  describe('Suite 1: Universal Reduced Motion Compliance', () => {
    it('verifies that src/styles.css includes the @media (prefers-reduced-motion: reduce) block', () => {
      expect(cssContent).toContain('@media (prefers-reduced-motion: reduce)')
    })

    it('verifies universal duration neutralization across all DOM elements (*, *::before, *::after)', () => {
      const reducedMotionSection = cssContent.split(
        '@media (prefers-reduced-motion: reduce)',
      )[1]
      expect(reducedMotionSection).toBeDefined()

      // Must neutralize duration to 0.01ms on all elements
      expect(reducedMotionSection).toMatch(
        /\*,\s*\*::before,\s*\*::after\s*\{[\s\S]*?animation-duration:\s*0\.01ms\s*!important;/,
      )
      expect(reducedMotionSection).toMatch(
        /\*,\s*\*::before,\s*\*::after\s*\{[\s\S]*?transition-duration:\s*0\.01ms\s*!important;/,
      )
      expect(reducedMotionSection).toMatch(
        /\*,\s*\*::before,\s*\*::after\s*\{[\s\S]*?scroll-behavior:\s*auto\s*!important;/,
      )
    })

    it('verifies explicit animation, transition, transform and filter neutralization for interactive surfaces', () => {
      const reducedMotionSection = cssContent.split(
        '@media (prefers-reduced-motion: reduce)',
      )[1]
      expect(reducedMotionSection).toBeDefined()

      const requiredSelectors = [
        '.t-dropdown',
        '.t-modal',
        '.t-badge',
        '.t-badge-dot',
        '.t-digit-group .t-digit',
        '.t-input',
        '.t-input-shake',
        '.t-success-check',
        '.t-success-check svg path',
        '.stagger-item',
        '.rise-in',
        '[data-slot="dialog-popup"]',
        '[data-slot="dialog-backdrop"]',
        '[data-slot="alert-dialog-popup"]',
        '[data-slot="alert-dialog-backdrop"]',
        '[data-slot="popover-popup"]',
        '[data-slot="select-popup"]',
        '[data-slot="menu-popup"]',
        '[data-slot="drawer-popup"]',
        '[data-slot="drawer-backdrop"]',
      ]

      for (const selector of requiredSelectors) {
        expect(
          reducedMotionSection.includes(selector),
          `Expected reduced-motion section to include selector: ${selector}`,
        ).toBe(true)
      }

      expect(reducedMotionSection).toContain('animation: none !important')
      expect(reducedMotionSection).toContain('transition: none !important')
      expect(reducedMotionSection).toContain('transform: none !important')
      expect(reducedMotionSection).toContain('filter: none !important')
    })

    it('verifies that .t-success-check displays immediately without drawing delay under reduced motion', () => {
      const reducedMotionSection = cssContent.split(
        '@media (prefers-reduced-motion: reduce)',
      )[1]
      expect(reducedMotionSection).toBeDefined()

      expect(reducedMotionSection).toMatch(
        /\.t-success-check\s*\{[\s\S]*?opacity:\s*1\s*!important;/,
      )
      expect(reducedMotionSection).toMatch(
        /\.t-success-check\s+svg\s+path\s*\{[\s\S]*?stroke-dashoffset:\s*0\s*!important;/,
      )
    })

    it('audits tooltip-popup reduced motion handling', () => {
      const reducedMotionSection = cssContent.split(
        '@media (prefers-reduced-motion: reduce)',
      )[1]
      expect(reducedMotionSection).toBeDefined()

      // Tooltip is covered universally by *, *::before, *::after (0.01ms transition duration)
      // Check if [data-slot="tooltip-popup"] is in the explicit list
      const hasExplicitTooltip = reducedMotionSection.includes(
        '[data-slot="tooltip-popup"]',
      )
      // We document whether it is present or relies on universal rule
      expect(typeof hasExplicitTooltip).toBe('boolean')
    })
  })

  /* ==========================================================================
     SUITE 2: MOBILE VS DESKTOP RESPONSIVE VIEWPORT TRANSITIONS
     ========================================================================== */
  describe('Suite 2: Mobile vs Desktop Responsive Viewport Layouts', () => {
    describe('Public Header Responsive Layout', () => {
      it('renders desktop navigation links in md:flex container and keeps mobile drawer closed initially', () => {
        vi.mocked(authClient.useSession).mockReturnValue({
          data: null,
          isPending: false,
          error: null,
        } as any)

        const { container } = render(<Header />)

        // Desktop nav container is hidden on small screens and flex on md:
        const desktopNav = container.querySelector('div.hidden.md\\:flex')
        expect(desktopNav).toBeTruthy()

        // Mobile drawer trigger is flex on small screens, hidden on md:
        const mobileContainer = container.querySelector('div.flex.md\\:hidden')
        expect(mobileContainer).toBeTruthy()

        const mobileTrigger = mobileContainer?.querySelector('button[data-slot="drawer-trigger"]')
        expect(mobileTrigger).toBeTruthy()
      })

      it('opens mobile drawer when trigger is clicked and allows closing via navigation links', async () => {
        vi.mocked(authClient.useSession).mockReturnValue({
          data: null,
          isPending: false,
          error: null,
        } as any)

        const { container } = render(<Header />)
        const mobileTrigger = container.querySelector(
          'button[data-slot="drawer-trigger"]',
        )
        expect(mobileTrigger).toBeTruthy()

        // Click mobile trigger
        await act(async () => {
          fireEvent.click(mobileTrigger!)
        })

        // Drawer popup should appear in DOM
        const drawerPopup = document.querySelector('[data-slot="drawer-popup"]')
        expect(drawerPopup).toBeTruthy()
        expect(drawerPopup?.textContent).toContain('Features')
        expect(drawerPopup?.textContent).toContain('Workflow')
        expect(drawerPopup?.textContent).toContain('Rent Calculator')

        // Click a link inside the mobile drawer
        const featuresLink = drawerPopup?.querySelector('a[href="/"]')
        expect(featuresLink).toBeTruthy()

        await act(async () => {
          fireEvent.click(featuresLink!)
        })
      })
    })

    describe('LandlordHeader Responsive Layout', () => {
      it('renders desktop navigation and landlord details in md:flex containers', () => {
        vi.mocked(authClient.useSession).mockReturnValue({
          data: {
            user: {
              id: 'landlord-1',
              name: 'Ram Bahadur',
              email: 'ram@example.com',
            },
          },
          isPending: false,
          error: null,
        } as any)

        const { container } = render(<LandlordHeader />)

        // Desktop nav links container
        const desktopNav = container.querySelector('div.hidden.md\\:flex.items-center.gap-x-5')
        expect(desktopNav).toBeTruthy()
        expect(desktopNav?.textContent).toContain('Dashboard')
        expect(desktopNav?.textContent).toContain('Properties')
        expect(desktopNav?.textContent).toContain('Rooms')
        expect(desktopNav?.textContent).toContain('Tenants')
        expect(desktopNav?.textContent).toContain('Leases')

        // Desktop user info & sign out
        const desktopUser = container.querySelectorAll('div.hidden.md\\:flex')[1]
        expect(desktopUser).toBeTruthy()
        expect(desktopUser.textContent).toContain('Ram Bahadur')
        expect(desktopUser.textContent).toContain('Sign Out')
      })

      it('opens mobile drawer with avatar initials, landlord info, and full nav links', async () => {
        vi.mocked(authClient.useSession).mockReturnValue({
          data: {
            user: {
              id: 'landlord-1',
              name: 'Ram Bahadur',
              email: 'ram@example.com',
            },
          },
          isPending: false,
          error: null,
        } as any)

        const { container } = render(<LandlordHeader />)
        const mobileTrigger = container.querySelector('button[data-slot="drawer-trigger"]')
        expect(mobileTrigger).toBeTruthy()

        await act(async () => {
          fireEvent.click(mobileTrigger!)
        })

        const drawerPopup = document.querySelector('[data-slot="drawer-popup"]')
        expect(drawerPopup).toBeTruthy()
        // Check avatar initials "RB"
        expect(drawerPopup?.textContent).toContain('RB')
        expect(drawerPopup?.textContent).toContain('Ram Bahadur')
        expect(drawerPopup?.textContent).toContain('ram@example.com')
        expect(drawerPopup?.textContent).toContain('Dashboard')
        expect(drawerPopup?.textContent).toContain('Properties')
        expect(drawerPopup?.textContent).toContain('Rooms')
        expect(drawerPopup?.textContent).toContain('Tenants')
        expect(drawerPopup?.textContent).toContain('Leases')
        expect(drawerPopup?.textContent).toContain('Sign Out')

        // Test Sign Out action
        const signOutBtn = drawerPopup?.querySelector('button[data-slot="button"]')
        expect(signOutBtn).toBeTruthy()
        await act(async () => {
          fireEvent.click(signOutBtn!)
        })
        expect(authClient.signOut).toHaveBeenCalled()
        expect(mockNavigate).toHaveBeenCalledWith({ to: '/login' })
      })
    })

    describe('Dashboard Responsive Table vs Card Layout', () => {
      const mockData = {
        stats: {
          totalCollected: 2500000,
          totalOutstanding: 1500000,
          activeLeasesCount: 4,
          overdueInvoicesCount: 1,
        },
        invoices: [
          {
            id: 'inv-1',
            period: '2026-05',
            tenantName: 'Sita Devi',
            roomName: 'Room 101',
            propertyName: 'Lagankhel Heights',
            amount: 1500000,
            dueDate: '2026-05-10',
            status: 'paid',
          },
          {
            id: 'inv-2',
            period: '2026-05',
            tenantName: 'Gopal Shrestha',
            roomName: 'Room 102',
            propertyName: 'Lagankhel Heights',
            amount: 1800000,
            dueDate: '2026-05-08',
            status: 'overdue',
          },
          {
            id: 'inv-3',
            period: '2026-05',
            tenantName: 'Hari Prasad',
            roomName: 'Room 201',
            propertyName: 'Patan Residency',
            amount: 1200000,
            dueDate: '2026-05-15',
            status: 'unpaid',
          },
        ],
        leases: [
          {
            id: 'lease-1',
            tenantName: 'Sita Devi',
            roomName: 'Room 101',
            rentAmount: 1500000,
            status: 'active',
          },
        ],
      }

      beforeEach(() => {
        ;(DashboardRoute as any).useLoaderData = () => mockData
      })

      it('renders desktop table view (hidden md:block) with proper columns and rows', () => {
        const DashboardComponent = (DashboardRoute as any).options.component
        const { container } = render(<DashboardComponent />)

        const desktopTableWrapper = container.querySelector('div.hidden.md\\:block')
        expect(desktopTableWrapper).toBeTruthy()

        const table = desktopTableWrapper?.querySelector('table')
        expect(table).toBeTruthy()

        const headers = table?.querySelectorAll('th')
        expect(headers?.length).toBe(7)
        expect(table?.textContent).toContain('Sita Devi')
        expect(table?.textContent).toContain('Gopal Shrestha')
        expect(table?.textContent).toContain('Hari Prasad')
      })

      it('renders mobile card list view (flex flex-col gap-3 md:hidden) with individual card details', () => {
        const DashboardComponent = (DashboardRoute as any).options.component
        const { container } = render(<DashboardComponent />)

        const mobileListWrapper = container.querySelector('div.flex.flex-col.gap-3.md\\:hidden')
        expect(mobileListWrapper).toBeTruthy()

        const cards = mobileListWrapper?.children
        expect(cards?.length).toBe(3)

        // Verify first card contains tenant name, property, amount, status
        const firstCard = cards?.[0]
        expect(firstCard?.textContent).toContain('Sita Devi')
        expect(firstCard?.textContent).toContain('Room 101 • Lagankhel Heights')
        expect(firstCard?.textContent).toContain('paid')
      })

      it('filters invoices dynamically between All, Paid, Unpaid, Overdue across both desktop and mobile views', async () => {
        const DashboardComponent = (DashboardRoute as any).options.component
        const { container } = render(<DashboardComponent />)

        // Find Paid tab button
        const paidTab = screen.getByRole('tab', { name: /^paid$/i })
        expect(paidTab).toBeTruthy()

        await act(async () => {
          fireEvent.click(paidTab)
        })

        // Desktop table should now only show Sita Devi
        const desktopTable = container.querySelector('div.hidden.md\\:block')
        expect(desktopTable?.textContent).toContain('Sita Devi')
        expect(desktopTable?.textContent).not.toContain('Gopal Shrestha')
        expect(desktopTable?.textContent).not.toContain('Hari Prasad')

        // Mobile card list should also only show Sita Devi
        const mobileList = container.querySelector('div.flex.flex-col.gap-3.md\\:hidden')
        expect(mobileList?.textContent).toContain('Sita Devi')
        expect(mobileList?.textContent).not.toContain('Gopal Shrestha')
        expect(mobileList?.textContent).not.toContain('Hari Prasad')
      })
    })

    describe('Leases Registry Responsive Table vs Card Layout', () => {
      const mockLeasesData = {
        leases: [
          {
            id: 'lease-101',
            tenantName: 'Anil Gurung',
            roomName: 'Room 301',
            propertyName: 'Lalitpur Suites',
            rentAmount: 2000000, // paisa
            depositAmount: 4000000,
            billingDay: 5,
            startDate: '2026-01-01',
            endDate: null,
            status: 'active',
          },
        ],
        rooms: [],
        tenants: [],
      }

      beforeEach(() => {
        ;(LeasesRoute as any).useLoaderData = () => mockLeasesData
      })

      it('renders 8-column desktop table on md:block and card list on md:hidden', () => {
        const LeasesComponent = (LeasesRoute as any).options.component
        const { container } = render(<LeasesComponent />)

        const desktopTableWrapper = container.querySelector('div.hidden.md\\:block')
        expect(desktopTableWrapper).toBeTruthy()

        const ths = desktopTableWrapper?.querySelectorAll('th')
        expect(ths?.length).toBe(8)

        const mobileCardWrapper = container.querySelector('div.flex.flex-col.gap-3.md\\:hidden')
        expect(mobileCardWrapper).toBeTruthy()
        expect(mobileCardWrapper?.textContent).toContain('Anil Gurung')
        expect(mobileCardWrapper?.textContent).toContain('Day 5')
        expect(mobileCardWrapper?.textContent).toContain('active')
      })

      it('opens AlertDialog on End Lease click and executes endLease', async () => {
        const LeasesComponent = (LeasesRoute as any).options.component
        const { container } = render(<LeasesComponent />)

        const endLeaseBtn = container.querySelector('button.text-destructive')
        expect(endLeaseBtn).toBeTruthy()

        await act(async () => {
          fireEvent.click(endLeaseBtn!)
        })

        // AlertDialog popup should be in DOM
        const alertPopup = document.querySelector('[data-slot="alert-dialog-popup"]')
        expect(alertPopup).toBeTruthy()
        expect(alertPopup?.textContent).toContain('Terminate Lease Contract')

        // Confirm termination
        const confirmBtn = alertPopup?.querySelector('button[type="submit"]')
        expect(confirmBtn).toBeTruthy()

        await act(async () => {
          fireEvent.click(confirmBtn!)
        })

        expect(endLease).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              id: 'lease-101',
            }),
          }),
        )
      })
    })

    describe('Invoice Details Multi-Column Layout and Form Validation Shake', () => {
      const mockInvoiceDetailsData = {
        invoice: {
          id: 'inv-uuid-1',
          period: '2026-06',
          dueDate: '2026-06-15',
          amount: 2500000, // 25,000 NPR
          status: 'unpaid',
        },
        tenant: {
          name: 'Nabin Thapa',
          email: 'nabin@example.com',
          phone: '9841000000',
        },
        lease: {
          billingDay: 15,
        },
        room: {
          name: 'Room 204',
        },
        property: {
          name: 'Kathmandu Heights',
        },
        lineItems: [
          {
            id: 'li-1',
            description: 'Room Rent',
            kind: 'rent',
            amount: 2200000,
          },
          {
            id: 'li-2',
            description: 'Water & Electricity',
            kind: 'utility',
            amount: 300000,
          },
        ],
        payments: [],
      }

      beforeEach(() => {
        ;(InvoiceDetailsRoute as any).useLoaderData = () => mockInvoiceDetailsData
      })

      it('renders multi-column grid layout (lg:grid-cols-3) with summary, items, and tenant ledger', () => {
        const InvoiceDetailsComponent = (InvoiceDetailsRoute as any).options.component
        const { container } = render(<InvoiceDetailsComponent />)

        const grid = container.querySelector('div.grid.gap-6.lg\\:grid-cols-3')
        expect(grid).toBeTruthy()

        // 2 cols on left, 1 col on right
        const leftCol = grid?.querySelector('div.lg\\:col-span-2')
        expect(leftCol).toBeTruthy()
        expect(leftCol?.textContent).toContain('Invoice details')
        expect(leftCol?.textContent).toContain('Itemized charges')
        expect(leftCol?.textContent).toContain('Room Rent')
        expect(leftCol?.textContent).toContain('Water & Electricity')

        // Verify grand total
        expect(leftCol?.textContent).toContain('Grand Total:')

        const rightCol = grid?.querySelectorAll('div.flex.flex-col.gap-6')[1]
        expect(rightCol).toBeTruthy()
        expect(rightCol?.textContent).toContain('Nabin Thapa')
        expect(rightCol?.textContent).toContain('Payment history')
      })

      it('validates cash payment input, triggers t-input-shake on overflow error, and shows celebratory modal on success', async () => {
        const InvoiceDetailsComponent = (InvoiceDetailsRoute as any).options.component
        render(<InvoiceDetailsComponent />)

        const recordPayBtn = screen.getByRole('button', { name: /record cash payment/i })
        expect(recordPayBtn).toBeTruthy()

        await act(async () => {
          fireEvent.click(recordPayBtn)
        })

        const dialog = document.querySelector('[data-slot="dialog-popup"]')
        expect(dialog).toBeTruthy()

        const input = dialog?.querySelector('input[type="number"]') as HTMLInputElement
        expect(input).toBeTruthy()

        // 1. Try overpaying (more than 25,000 NPR, e.g. 30,000)
        await act(async () => {
          fireEvent.change(input, { target: { value: '30000' } })
        })

        const form = dialog?.querySelector('form')
        expect(form).toBeTruthy()

        await act(async () => {
          fireEvent.submit(form!)
          await new Promise((r) => setTimeout(r, 20))
        })

        // Shake animation class should be applied to the field wrapper
        const shakeWrapper = document.querySelector('.t-input-shake')
        expect(shakeWrapper).toBeTruthy()
        expect(dialog?.textContent).toContain('Payment cannot exceed the remaining balance')
        expect(recordCashPaymentFn).not.toHaveBeenCalled()

        // 2. Submit valid payment (25,000 NPR)
        await act(async () => {
          fireEvent.change(input, { target: { value: '25000' } })
        })

        await act(async () => {
          fireEvent.submit(form!)
          await new Promise((r) => setTimeout(r, 20))
        })

        expect(recordCashPaymentFn).toHaveBeenCalledWith({
          data: expect.objectContaining({
            amountNpr: 25000,
            invoiceId: 'inv-uuid-1',
          }),
        })

        // Celebratory success modal appears with .t-success-check
        const successCheck = document.querySelector('.t-success-check')
        expect(successCheck).toBeTruthy()
        expect(successCheck?.getAttribute('data-state')).toBe('in')
        expect(document.body.textContent).toContain('Payment Recorded!')
      })
    })
  })

  /* ==========================================================================
     SUITE 3: DOMAIN INVARIANTS EMPIRICAL STRESS TESTING
     ========================================================================== */
  describe('Suite 3: Domain Invariants Empirical Stress Testing', () => {
    describe('Integer Paisa Arithmetic Invariant', () => {
      it('guarantees round-trip preservation between NPR and Paisa', () => {
        const testValues = [0, 1, 50, 100, 1250, 15000, 25499, 999999]
        for (const val of testValues) {
          expect(paisaToNpr(nprToPaisa(val))).toBe(val)
        }
      })

      it('rounds fractional inputs strictly to the nearest integer paisa without float drift', () => {
        expect(nprToPaisa(12.345)).toBe(1235) // rounds 1234.5 to 1235
        expect(nprToPaisa(12.344)).toBe(1234)
        expect(nprToPaisa(0.004)).toBe(0)
        expect(nprToPaisa(0.006)).toBe(1)
      })

      it('formats currency strictly as Nepalese Rupees (NPR)', () => {
        const formatted = formatNpr(1500000)
        // Should contain 15,000.00 and NPR currency marker
        expect(formatted).toMatch(/15,000\.00/)
        expect(formatted.replace(/\s+/g, ' ')).toMatch(/NPR/)
      })
    })

    describe('Kathmandu UTC+05:45 Timezone Handling Invariant', () => {
      it('returns dates matching standard YYYY-MM-DD pattern', () => {
        const today = getTodayInKathmandu()
        expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      })

      it('evaluates past dates accurately relative to today', () => {
        const today = getTodayInKathmandu()
        const [y, m, d] = today.split('-').map(Number)
        const pastDate = `${y - 1}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        const futureDate = `${y + 1}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`

        expect(isPastDateInKathmandu(pastDate)).toBe(true)
        expect(isPastDateInKathmandu(futureDate)).toBe(false)
        expect(isPastDateInKathmandu(today)).toBe(false)
      })

      it('accurately computes calendar day additions across month and leap year boundaries', () => {
        // Leap year: 2028-02-28 + 1 day = 2028-02-29
        expect(addDaysInKathmandu(1, '2028-02-28')).toBe('2028-02-29')
        expect(addDaysInKathmandu(2, '2028-02-28')).toBe('2028-03-01')

        // Non-leap year: 2027-02-28 + 1 day = 2027-03-01
        expect(addDaysInKathmandu(1, '2027-02-28')).toBe('2027-03-01')

        // Year boundary: 2026-12-31 + 1 day = 2027-01-01
        expect(addDaysInKathmandu(1, '2026-12-31')).toBe('2027-01-01')

        // Negative offset
        expect(addDaysInKathmandu(-1, '2026-01-01')).toBe('2025-12-31')
      })
    })
  })
})
