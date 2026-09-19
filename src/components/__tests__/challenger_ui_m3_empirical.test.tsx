// @vitest-environment jsdom
import { fireEvent, render, screen, act, cleanup } from '@testing-library/react'
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import LandlordHeader from '../LandlordHeader'
import { AnimatedNumber } from '#/components/ui/animated-number'
import { Route as DashboardRoute } from '#/routes/_authed/dashboard'
import { authClient } from '#/lib/auth-client'
import {
  createManualInvoiceFn,
} from '#/server/invoices.functions'
import { toastManager } from '#/components/ui/toast'

// Mock TanStack Router
const mockNavigate = vi.fn()
const mockRouterInvalidate = vi.fn()

const mockDashboardLoaderData: any = {
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
      amount: 1500000, // paisa
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
      id: 'lease-101',
      tenantName: 'Sita Devi',
      roomName: 'Room 101',
      propertyName: 'Lagankhel Heights',
      rentAmount: 1500000, // paisa = 15,000 NPR
      status: 'active',
    },
    {
      id: 'lease-102',
      tenantName: 'Gopal Shrestha',
      roomName: 'Room 102',
      propertyName: 'Lagankhel Heights',
      rentAmount: 1800000, // paisa = 18,000 NPR
      status: 'active',
    },
  ],
}

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, params, children, className, activeProps, onClick }: any) => {
    let href = to || '/'
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        href = href.replace(`$${k}`, String(v))
      }
    }
    return (
      <a
        href={href}
        className={`${className || ''} ${activeProps?.className || ''}`}
        onClick={onClick}
      >
        {children}
      </a>
    )
  },
  useNavigate: () => mockNavigate,
  useRouter: () => ({
    invalidate: mockRouterInvalidate,
  }),
  createFileRoute: () => (routeOptions: any) => {
    const Comp = routeOptions.component
    return {
      ...routeOptions,
      component: Comp,
      useLoaderData: () => mockDashboardLoaderData,
    }
  },
}))

// Mock Better Auth client session
let mockSessionUser: any = {
  id: 'landlord-1',
  name: 'Ram Bahadur Thapa',
  email: 'ram.thapa@example.com',
}

vi.mock('#/lib/auth-client', () => ({
  authClient: {
    useSession: vi.fn(() => ({
      data: mockSessionUser ? { user: mockSessionUser } : null,
    })),
    signOut: vi.fn(async () => {}),
  },
}))

// Mock server functions
vi.mock('#/server/invoices.functions', () => ({
  getDashboardData: vi.fn(),
  createManualInvoiceFn: vi.fn(async () => ({ success: true, invoiceId: 'inv-new-999' })),
}))

vi.mock('#/server/leases.functions', () => ({
  getLeases: vi.fn(),
}))

// Mock toastManager
vi.mock('#/components/ui/toast', () => ({
  toastManager: {
    add: vi.fn(),
  },
}))

describe('Challenger UI M3 — Empirical Verification & Stress Suite', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.className = ''
    document.documentElement.removeAttribute('data-theme')
    vi.clearAllMocks()
    mockSessionUser = {
      id: 'landlord-1',
      name: 'Ram Bahadur Thapa',
      email: 'ram.thapa@example.com',
    }
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  // =========================================================================
  // 1. LANDLORD HEADER — MOBILE DRAWER, NAVIGATION & DISMISSAL EMPIRICAL TESTS
  // =========================================================================
  describe('LandlordHeader — Mobile Drawer Navigation, Dismissal & Viewport Adaptability', () => {
    it('renders desktop navigation container (hidden md:flex) and mobile trigger container (flex md:hidden)', () => {
      const { container } = render(<LandlordHeader />)

      // Desktop navigation container should have responsive hidden md:flex
      const desktopNav = container.querySelector('.hidden.md\\:flex.items-center')
      expect(desktopNav).not.toBeNull()

      // Mobile drawer container should have flex md:hidden
      const mobileContainer = container.querySelector('.flex.md\\:hidden.items-center')
      expect(mobileContainer).not.toBeNull()
    })

    it('opens mobile drawer upon hamburger button click and displays navigation roster', async () => {
      render(<LandlordHeader />)
      const trigger = screen.getByLabelText('Open mobile navigation menu')
      expect(trigger).toBeDefined()

      await act(async () => {
        fireEvent.click(trigger)
      })

      // In drawer popup, check header user info
      expect(screen.getAllByText('Ram Bahadur Thapa').length).toBeGreaterThan(0)
      expect(screen.getByText('ram.thapa@example.com')).toBeDefined()

      // Check all 5 primary landlord portal navigation links inside drawer
      const drawerPanel = screen.getByText('ram.thapa@example.com').closest('[data-slot="drawer-popup"]')
      expect(drawerPanel).not.toBeNull()

      expect(drawerPanel?.textContent).toContain('Dashboard')
      expect(drawerPanel?.textContent).toContain('Properties')
      expect(drawerPanel?.textContent).toContain('Rooms')
      expect(drawerPanel?.textContent).toContain('Tenants')
      expect(drawerPanel?.textContent).toContain('Leases')
    })

    it('dismisses drawer when a navigation link is clicked', async () => {
      render(<LandlordHeader />)
      const trigger = screen.getByLabelText('Open mobile navigation menu')

      await act(async () => {
        fireEvent.click(trigger)
      })

      // Find the Leases link inside the drawer
      const leasesLinks = screen.getAllByRole('link', { name: /Leases/i })
      const drawerLeaseLink = leasesLinks[leasesLinks.length - 1]

      await act(async () => {
        fireEvent.click(drawerLeaseLink)
      })

      const drawerPopup = document.querySelector('[data-slot="drawer-popup"]')
      if (drawerPopup) {
        expect(drawerPopup.getAttribute('data-state')).toBe('closed')
      }
    })

    it('dismisses drawer when the close button (XIcon) is clicked', async () => {
      render(<LandlordHeader />)
      const trigger = screen.getByLabelText('Open mobile navigation menu')

      await act(async () => {
        fireEvent.click(trigger)
      })

      const closeButton = screen.getByLabelText('Close')
      expect(closeButton).toBeDefined()

      await act(async () => {
        fireEvent.click(closeButton)
      })

      const drawerPopup = document.querySelector('[data-slot="drawer-popup"]')
      if (drawerPopup) {
        expect(drawerPopup.getAttribute('data-state')).toBe('closed')
      }
    })

    it('executes sign-out workflow from drawer: closes drawer, calls authClient.signOut, navigates to /login', async () => {
      render(<LandlordHeader />)
      const trigger = screen.getByLabelText('Open mobile navigation menu')

      await act(async () => {
        fireEvent.click(trigger)
      })

      const signOutButtons = screen.getAllByRole('button', { name: /Sign Out/i })
      const drawerSignOut = signOutButtons[signOutButtons.length - 1]

      await act(async () => {
        fireEvent.click(drawerSignOut)
      })

      expect(authClient.signOut).toHaveBeenCalledTimes(1)
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/login' })
    })

    it('correctly calculates avatar initials across edge case name formats', async () => {
      // 1. Multi-word name: "Ram Bahadur Thapa" -> "RB" (capped to 2 initials)
      const { unmount: unmount1 } = render(<LandlordHeader />)
      expect(screen.getAllByText('RB').length).toBeGreaterThan(0)
      unmount1()

      // 2. Single-word name: "Sita" -> "S"
      mockSessionUser = { id: 'l2', name: 'Sita', email: 'sita@test.np' }
      const { unmount: unmount2 } = render(<LandlordHeader />)
      expect(screen.getAllByText('S').length).toBeGreaterThan(0)
      unmount2()

      // 3. Null session -> opens drawer to inspect fallback 'L' and portal defaults
      mockSessionUser = null
      render(<LandlordHeader />)
      const trigger = screen.getByLabelText('Open mobile navigation menu')
      await act(async () => {
        fireEvent.click(trigger)
      })
      expect(screen.getAllByText('L').length).toBeGreaterThan(0)
      expect(screen.getByText('Landlord Portal')).toBeDefined()
      expect(screen.getByText('Rental Management')).toBeDefined()
    })
  })

  // =========================================================================
  // 2. ANIMATED NUMBER — BOUNDARY VALUES, STAGGER LOGIC & DYNAMIC UPDATES
  // =========================================================================
  describe('AnimatedNumber — Numerical Edge Cases, Trailing Stagger & Dynamic Mutability', () => {
    it('handles numerical 0 cleanly without NaN or unexpected renders', () => {
      const { container } = render(<AnimatedNumber value={0} />)
      const group = container.querySelector('.t-digit-group')
      expect(group).not.toBeNull()
      expect(group?.getAttribute('aria-label')).toBe('0')

      const digits = container.querySelectorAll('.t-digit')
      expect(digits.length).toBe(1)
      expect(digits[0].textContent).toBe('0')
      expect(digits[0].getAttribute('data-stagger')).toBe('2')
    })

    it('handles zero formatted currency strings "NPR 0.00"', () => {
      const { container } = render(<AnimatedNumber value="NPR 0.00" />)
      const digits = container.querySelectorAll('.t-digit')
      expect(digits.length).toBe('NPR 0.00'.length)
      expect(container.querySelector('.t-digit-group')?.getAttribute('aria-label')).toBe('NPR 0.00')

      // Last two characters are '0' and '0' with stagger 1 and 2
      expect(digits[digits.length - 2].getAttribute('data-stagger')).toBe('1')
      expect(digits[digits.length - 1].getAttribute('data-stagger')).toBe('2')
    })

    it('handles extremely large integer values without precision loss or truncation', () => {
      const largeNum = 123456789012
      const { container } = render(<AnimatedNumber value={largeNum} />)
      const digits = container.querySelectorAll('.t-digit')
      expect(digits.length).toBe(12)

      const renderedStr = Array.from(digits)
        .map((d) => d.textContent)
        .join('')
      expect(renderedStr).toBe(String(largeNum))

      // Stagger assignments on 12-digit number: only indices 10 and 11 have staggers
      expect(digits[9].getAttribute('data-stagger')).toBeNull()
      expect(digits[10].getAttribute('data-stagger')).toBe('1')
      expect(digits[11].getAttribute('data-stagger')).toBe('2')
    })

    it('handles negative numbers safely: "-500"', () => {
      const { container } = render(<AnimatedNumber value={-500} />)
      const digits = container.querySelectorAll('.t-digit')
      expect(digits.length).toBe(4) // '-', '5', '0', '0'
      expect(digits[0].textContent).toBe('-')
      expect(digits[0].getAttribute('data-stagger')).toBeNull()
      expect(digits[2].getAttribute('data-stagger')).toBe('1')
      expect(digits[3].getAttribute('data-stagger')).toBe('2')
    })

    it('handles empty string value without crashing or rendering phantom digits', () => {
      const { container } = render(<AnimatedNumber value="" />)
      const digits = container.querySelectorAll('.t-digit')
      expect(digits.length).toBe(0)
      expect(container.querySelector('.t-digit-group')?.getAttribute('aria-label')).toBe('')
    })

    it('dynamically adapts when value transitions through multiple rerenders', () => {
      const { container, rerender } = render(<AnimatedNumber value={100} />)
      expect(container.querySelectorAll('.t-digit').length).toBe(3)
      expect(container.textContent).toBe('100')

      // Rerender with higher balance
      rerender(<AnimatedNumber value={25000} />)
      expect(container.querySelectorAll('.t-digit').length).toBe(5)
      expect(container.textContent).toBe('25000')

      // Rerender down to 0
      rerender(<AnimatedNumber value={0} />)
      expect(container.querySelectorAll('.t-digit').length).toBe(1)
      expect(container.textContent).toBe('0')

      // Rerender with formatted string
      rerender(<AnimatedNumber value="Rs. 45,000" />)
      expect(container.querySelectorAll('.t-digit').length).toBe('Rs. 45,000'.length)
      expect(container.textContent).toBe('Rs. 45,000')
    })

    it('enforces accessibility contracts: aria-label on group and aria-hidden on individual digits', () => {
      const { container } = render(<AnimatedNumber value="NPR 5,000" />)
      const group = container.querySelector('.t-digit-group')
      expect(group?.getAttribute('aria-label')).toBe('NPR 5,000')

      const digits = container.querySelectorAll('.t-digit')
      digits.forEach((digit) => {
        expect(digit.getAttribute('aria-hidden')).toBe('true')
      })
    })
  })

  // =========================================================================
  // 3. DASHBOARD — RESPONSIVE INVOICE TABLE & CARD LIST TOGGLING
  // =========================================================================
  describe('Dashboard — Invoices Responsive Table vs Mobile Card List & Tab Filtering', () => {
    const DashboardComponent = (DashboardRoute as any).component

    it('renders both high-density desktop Table (hidden md:block) and mobile Card list (md:hidden)', () => {
      const { container } = render(<DashboardComponent />)

      // Desktop table container check
      const desktopTableWrapper = container.querySelector('.hidden.md\\:block')
      expect(desktopTableWrapper).not.toBeNull()
      const table = desktopTableWrapper?.querySelector('table')
      expect(table).not.toBeNull()

      // Verify desktop table headers
      expect(desktopTableWrapper?.textContent).toContain('Period')
      expect(desktopTableWrapper?.textContent).toContain('Tenant')
      expect(desktopTableWrapper?.textContent).toContain('Room & Property')
      expect(desktopTableWrapper?.textContent).toContain('Amount')
      expect(desktopTableWrapper?.textContent).toContain('Due Date')
      expect(desktopTableWrapper?.textContent).toContain('Status')
      expect(desktopTableWrapper?.textContent).toContain('Actions')

      // Mobile cards container check
      const mobileCardWrapper = container.querySelector('.flex.flex-col.gap-3.md\\:hidden')
      expect(mobileCardWrapper).not.toBeNull()

      // Both desktop and mobile should display all 3 invoices
      expect(screen.getAllByText('Sita Devi').length).toBe(2) // 1 desktop, 1 mobile
      expect(screen.getAllByText('Gopal Shrestha').length).toBe(2)
      expect(screen.getAllByText('Hari Prasad').length).toBe(2)
    })

    it('filters both desktop table and mobile cards simultaneously when tab filters change', async () => {
      render(<DashboardComponent />)

      // Find tabs: "All", "Paid", "Unpaid", "Partial", "Overdue"
      const paidTab = screen.getByRole('tab', { name: /^Paid$/i })
      expect(paidTab).toBeDefined()

      await act(async () => {
        fireEvent.click(paidTab)
      })

      // Only Sita Devi (paid) should be visible; Gopal (overdue) and Hari (unpaid) should NOT be rendered
      expect(screen.getAllByText('Sita Devi').length).toBe(2) // 1 in desktop table, 1 in mobile card
      expect(screen.queryByText('Gopal Shrestha')).toBeNull()
      expect(screen.queryByText('Hari Prasad')).toBeNull()

      // Switch to "Overdue" tab
      const overdueTab = screen.getByRole('tab', { name: /^Overdue$/i })
      await act(async () => {
        fireEvent.click(overdueTab)
      })

      expect(screen.queryByText('Sita Devi')).toBeNull()
      expect(screen.getAllByText('Gopal Shrestha').length).toBe(2)
      expect(screen.queryByText('Hari Prasad')).toBeNull()
    })

    it('renders EmptyContent with actionable CTA when filter returns 0 results', async () => {
      render(<DashboardComponent />)

      // Click "Partial" tab — in mock data, no invoice has status 'partial'
      const partialTab = screen.getByRole('tab', { name: /^Partial$/i })
      await act(async () => {
        fireEvent.click(partialTab)
      })

      // Empty state assertions
      expect(screen.getByText('No Invoices Found')).toBeDefined()
      expect(
        screen.getByText(/No invoices currently match the "partial" filter/i),
      ).toBeDefined()

      // Actionable CTA button in empty state
      const ctaButtons = screen.getAllByRole('button', { name: /Raise Manual Invoice/i })
      expect(ctaButtons.length).toBeGreaterThan(0)
    })
  })

  // =========================================================================
  // 4. DASHBOARD — MANUAL INVOICE LINE ITEMS REPEATER & MOBILE WRAPPING
  // =========================================================================
  describe('Dashboard — Manual Invoice Line Items Repeater Responsiveness & Validation', () => {
    const DashboardComponent = (DashboardRoute as any).component

    it('opens manual invoice modal and verifies line items responsive wrapping layout', async () => {
      render(<DashboardComponent />)
      const openModalBtn = screen.getByRole('button', { name: /Raise Manual Invoice/i })

      await act(async () => {
        fireEvent.click(openModalBtn)
      })

      // Check dialog header
      expect(screen.getByRole('heading', { name: 'Raise Manual Invoice' })).toBeDefined()

      // Inspect line items container layout classes inside dialog popup (rendered in portal)
      const lineItemRow = document.querySelector(
        '.flex.flex-col.sm\\:flex-row.gap-2\\.5.sm\\:items-center',
      )
      expect(lineItemRow).not.toBeNull()
      expect(lineItemRow?.className).toContain('p-3')
      expect(lineItemRow?.className).toContain('sm:p-0')
      expect(lineItemRow?.className).toContain('rounded-2xl')
      expect(lineItemRow?.className).toContain('sm:rounded-none')
      expect(lineItemRow?.className).toContain('border')
      expect(lineItemRow?.className).toContain('sm:border-0')
    })

    it('supports adding and removing multiple line items while enforcing 1 item minimum', async () => {
      render(<DashboardComponent />)
      const openModalBtn = screen.getByRole('button', { name: /Raise Manual Invoice/i })

      await act(async () => {
        fireEvent.click(openModalBtn)
      })

      // Initially 1 line item -> delete button should NOT exist
      expect(screen.queryByLabelText('Remove item')).toBeNull()

      // Click "Add Item"
      const addItemBtn = screen.getByRole('button', { name: /Add Item/i })
      await act(async () => {
        fireEvent.click(addItemBtn)
      })

      // Now 2 items exist -> delete buttons should appear
      let removeButtons = screen.getAllByLabelText('Remove item')
      expect(removeButtons.length).toBe(2)

      // Add a third item
      await act(async () => {
        fireEvent.click(addItemBtn)
      })
      removeButtons = screen.getAllByLabelText('Remove item')
      expect(removeButtons.length).toBe(3)

      // Delete the middle item
      await act(async () => {
        fireEvent.click(removeButtons[1])
      })
      removeButtons = screen.getAllByLabelText('Remove item')
      expect(removeButtons.length).toBe(2)

      // Delete again -> only 1 remains -> delete button disappears
      await act(async () => {
        fireEvent.click(removeButtons[0])
      })
      expect(screen.queryByLabelText('Remove item')).toBeNull()
    })

    it('validates required lease selection and prevents submission', async () => {
      render(<DashboardComponent />)
      const openModalBtn = screen.getByRole('button', { name: /Raise Manual Invoice/i })

      await act(async () => {
        fireEvent.click(openModalBtn)
      })

      const submitBtn = screen.getByRole('button', { name: /Raise Invoice/i })
      const form = submitBtn.closest('form')!

      await act(async () => {
        fireEvent.submit(form)
      })

      // Expect form error alert
      expect(screen.getByText('Please select an active lease')).toBeDefined()
      expect(createManualInvoiceFn).not.toHaveBeenCalled()
    })

    it('validates line items require description and positive amount', async () => {
      render(<DashboardComponent />)
      const openModalBtn = screen.getByRole('button', { name: /Raise Manual Invoice/i })

      await act(async () => {
        fireEvent.click(openModalBtn)
      })

      // Select lease via first combobox
      const comboboxes = screen.getAllByRole('combobox')
      const leaseTrigger = comboboxes[0]
      await act(async () => {
        fireEvent.click(leaseTrigger)
      })

      const leaseOption = screen.getByText(/Sita Devi — Room 101/i)
      await act(async () => {
        fireEvent.click(leaseOption)
      })

      // Clear description to trigger line item validation
      const descInput = screen.getByPlaceholderText('Description (e.g. Rent, Electricity)')
      fireEvent.change(descInput, { target: { value: '' } })

      const submitBtn = screen.getByRole('button', { name: /Raise Invoice/i })
      const form = submitBtn.closest('form')!

      await act(async () => {
        fireEvent.submit(form)
      })

      expect(
        screen.getByText(
          'All line items must have a description and an amount greater than 0',
        ),
      ).toBeDefined()
    })

    it('submits valid manual invoice, displays success toast, and invalidates router cache', async () => {
      render(<DashboardComponent />)
      const openModalBtn = screen.getByRole('button', { name: /Raise Manual Invoice/i })

      await act(async () => {
        fireEvent.click(openModalBtn)
      })

      // Select lease: trigger select popup via first combobox
      const comboboxes = screen.getAllByRole('combobox')
      const leaseTrigger = comboboxes[0]
      await act(async () => {
        fireEvent.click(leaseTrigger)
      })

      // Click lease option
      const leaseOption = screen.getByText(/Sita Devi — Room 101/i)
      await act(async () => {
        fireEvent.click(leaseOption)
      })

      // Upon selecting lease, line item 0 should be auto-populated:
      // Description = "Rent - Room 101", Amount = 15000 (1500000 / 100)
      const descInput = screen.getByPlaceholderText<HTMLInputElement>(
        'Description (e.g. Rent, Electricity)',
      )
      expect(descInput.value).toBe('Rent - Room 101')

      const amountInput = screen.getByPlaceholderText<HTMLInputElement>('NPR')
      expect(amountInput.value).toBe('15000')

      // Submit the invoice via form submit
      const submitBtn = screen.getByRole('button', { name: /Raise Invoice/i })
      const form = submitBtn.closest('form')!

      await act(async () => {
        fireEvent.submit(form)
      })

      // Verify createManualInvoiceFn was called with the correct data
      expect(createManualInvoiceFn).toHaveBeenCalledTimes(1)
      expect(createManualInvoiceFn).toHaveBeenCalledWith({
        data: expect.objectContaining({
          leaseId: 'lease-101',
          lineItems: [
            {
              description: 'Rent - Room 101',
              amountNpr: 15000,
              kind: 'rent',
            },
          ],
        }),
      })

      // Toast notification triggered
      expect(toastManager.add).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          title: 'Invoice Created',
        }),
      )

      // Router invalidated
      expect(mockRouterInvalidate).toHaveBeenCalledTimes(1)
    })
  })
})
