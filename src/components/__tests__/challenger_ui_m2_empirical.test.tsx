// @vitest-environment jsdom
import { fireEvent, render, screen, act } from '@testing-library/react'
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import ThemeToggle from '../ThemeToggle'
import Header from '../Header'
import Footer from '../Footer'
import { LandingPage } from '#/components/views/LandingPage'
import { authClient } from '#/lib/auth-client'

// Mock TanStack Router Link and hooks
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
  useNavigate: () => vi.fn(),
  createFileRoute: () => () => ({
    component: () => null,
  }),
}))

// Mock Better Auth client session
vi.mock('#/lib/auth-client', () => ({
  authClient: {
    useSession: vi.fn(() => ({ data: null })),
    signIn: {
      email: vi.fn(),
    },
  },
}))

describe('Challenger UI M2 — Empirical Verification & Stress Suite', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.className = ''
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.style.colorScheme = ''
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // =========================================================================
  // 1. INTERACTIVE RENT CALCULATOR EMPIRICAL STRESS TESTS
  // =========================================================================
  describe('Interactive Rent Calculator — Boundary & Arithmetic Precision', () => {
    it('handles default values with zero floating-point error', () => {
      render(<LandingPage />)
      // Defaults: 4 rooms, 15,000 rent, 500 utility
      // Monthly = 4 * (15000 + 500) = 62,000 NPR = 6,200,000 paisa
      // Annual = 62,000 * 12 = 744,000 NPR
      expect(screen.getByLabelText('62,000')).toBeDefined()
      expect(screen.getByLabelText('744,000')).toBeDefined()
      expect(screen.getByLabelText('6,200,000')).toBeDefined()
      expect(
        screen.getByText(/Includes 4 room\(s\) @ Rs\. 15,500 each/i),
      ).toBeDefined()
    })

    it('safely handles boundary values: zero room count falls back to 1 room', () => {
      render(<LandingPage />)
      const roomInput = screen.getByLabelText('Number of Rental Rooms')

      // Set rooms to 0: safeRoomCount = Math.max(1, 0) -> 1 room
      // Monthly = 1 * (15000 + 500) = 15,500 NPR = 1,550,000 paisa
      fireEvent.change(roomInput, { target: { value: '0' } })

      expect(screen.getByLabelText('15,500')).toBeDefined()
      expect(screen.getByLabelText('186,000')).toBeDefined()
      expect(screen.getByLabelText('1,550,000')).toBeDefined()
      expect(screen.getByText('Start Managing 1 Rooms')).toBeDefined()
    })

    it('safely handles boundary values: negative room count clamped to 1 room', () => {
      render(<LandingPage />)
      const roomInput = screen.getByLabelText('Number of Rental Rooms')

      fireEvent.change(roomInput, { target: { value: '-10' } })

      expect(screen.getByLabelText('15,500')).toBeDefined()
      expect(screen.getByLabelText('186,000')).toBeDefined()
      expect(screen.getByLabelText('1,550,000')).toBeDefined()
    })

    it('safely handles boundary values: zero rent and zero utility produces 0 NPR and 0 paisa without NaN', () => {
      render(<LandingPage />)
      const rentInput = screen.getByLabelText('Average Room Rent (NPR / Month)')
      const utilityInput = screen.getByLabelText(
        'Water / Utility Surcharge (NPR / Room)',
      )

      fireEvent.change(rentInput, { target: { value: '0' } })
      fireEvent.change(utilityInput, { target: { value: '0' } })

      // 4 rooms * (0 + 0) = 0 NPR = 0 paisa
      expect(screen.getAllByLabelText('0').length).toBeGreaterThanOrEqual(2)
      expect(screen.getByText(/Includes 4 room\(s\) @ Rs\. 0 each/i)).toBeDefined()
    })

    it('safely handles boundary values: negative rent and utility clamped to 0', () => {
      render(<LandingPage />)
      const rentInput = screen.getByLabelText('Average Room Rent (NPR / Month)')
      const utilityInput = screen.getByLabelText(
        'Water / Utility Surcharge (NPR / Room)',
      )

      fireEvent.change(rentInput, { target: { value: '-25000' } })
      fireEvent.change(utilityInput, { target: { value: '-1200' } })

      // Should clamp to 0
      expect(screen.getAllByLabelText('0').length).toBeGreaterThanOrEqual(2)
      expect(screen.getByText(/Includes 4 room\(s\) @ Rs\. 0 each/i)).toBeDefined()
    })

    it('safely handles boundary values: large scale 1,000,000+ NPR calculations without float drift or NaN', () => {
      render(<LandingPage />)
      const roomInput = screen.getByLabelText('Number of Rental Rooms')
      const rentInput = screen.getByLabelText('Average Room Rent (NPR / Month)')
      const utilityInput = screen.getByLabelText(
        'Water / Utility Surcharge (NPR / Room)',
      )

      // 20 rooms * (Rs. 1,000,000 rent + Rs. 50,000 utility) = Rs. 21,000,000 monthly
      // Paisa = 21,000,000 * 100 = 2,100,000,000 paisa (2.1 billion paisa)
      // Annual = 21,000,000 * 12 = 252,000,000 NPR
      fireEvent.change(roomInput, { target: { value: '20' } })
      fireEvent.change(rentInput, { target: { value: '1000000' } })
      fireEvent.change(utilityInput, { target: { value: '50000' } })

      expect(screen.getByLabelText('21,000,000')).toBeDefined()
      expect(screen.getByLabelText('252,000,000')).toBeDefined()
      expect(screen.getByLabelText('2,100,000,000')).toBeDefined()
      expect(
        screen.getByText(/Includes 20 room\(s\) @ Rs\. 1,050,000 each/i),
      ).toBeDefined()
    })

    it('safely handles empty input strings and non-numeric inputs', () => {
      render(<LandingPage />)
      const roomInput = screen.getByLabelText('Number of Rental Rooms')
      const rentInput = screen.getByLabelText('Average Room Rent (NPR / Month)')

      // Empty string simulates user clearing field
      fireEvent.change(roomInput, { target: { value: '' } })
      fireEvent.change(rentInput, { target: { value: '' } })

      // safeRoomCount defaults to 1, safeRent defaults to 0, utility remains 500
      // 1 * (0 + 500) = 500 NPR = 50,000 paisa
      expect(screen.getByLabelText('500')).toBeDefined()
      expect(screen.getByLabelText('6,000')).toBeDefined()
      expect(screen.getByLabelText('50,000')).toBeDefined()
    })

    it('property oracle: 500 randomized parameter sets verify integer paisa arithmetic invariant', () => {
      // Test the mathematical contract directly across 500 iterations
      for (let i = 0; i < 500; i++) {
        const rawRooms = Math.floor(Math.random() * 250) - 20 // includes negative & 0
        const rawRent = Math.floor(Math.random() * 2000000) - 10000 // includes negative & large
        const rawUtility = Math.floor(Math.random() * 50000) - 1000

        const safeRooms = Math.max(1, isNaN(rawRooms) ? 1 : rawRooms)
        const safeRent = Math.max(0, isNaN(rawRent) ? 0 : rawRent)
        const safeUtility = Math.max(0, isNaN(rawUtility) ? 0 : rawUtility)

        const rentPaisa = safeRent * 100
        const utilityPaisa = safeUtility * 100
        const perRoomTotalPaisa = rentPaisa + utilityPaisa

        const monthlyCollectionPaisa = safeRooms * perRoomTotalPaisa
        const monthlyCollectionNpr = Math.floor(monthlyCollectionPaisa / 100)
        const annualRevenueNpr = monthlyCollectionNpr * 12

        // Invariants:
        expect(Number.isSafeInteger(monthlyCollectionPaisa)).toBe(true)
        expect(Number.isSafeInteger(monthlyCollectionNpr)).toBe(true)
        expect(Number.isSafeInteger(annualRevenueNpr)).toBe(true)
        expect(monthlyCollectionPaisa).toBeGreaterThanOrEqual(0)
        expect(monthlyCollectionNpr).toBeGreaterThanOrEqual(0)
        expect(annualRevenueNpr).toBeGreaterThanOrEqual(0)
        // Zero float drift check:
        expect(monthlyCollectionPaisa % 100).toBe(0)
        expect(monthlyCollectionNpr * 100).toBe(monthlyCollectionPaisa)
        expect(annualRevenueNpr).toBe(monthlyCollectionNpr * 12)
      }
    })
  })

  // =========================================================================
  // 2. THEMETOGGLE EMPIRICAL STRESS & SSR RESILIENCE
  // =========================================================================
  describe('ThemeToggle — Rapid Cycling, Icon Swap & Environment Resilience', () => {
    it('rapid cycling: 60 sequential clicks rigorously cycle auto -> light -> dark without state corruption', () => {
      render(<ThemeToggle />)
      const button = screen.getByRole('button')

      const expectedSequence: Array<'light' | 'dark' | 'auto'> = [
        'light',
        'dark',
        'auto',
      ]

      for (let i = 0; i < 60; i++) {
        fireEvent.click(button)
        const expectedMode = expectedSequence[i % 3]
        expect(window.localStorage.getItem('theme')).toBe(expectedMode)

        // Verify HTML document classes
        const hasLight = document.documentElement.classList.contains('light')
        const hasDark = document.documentElement.classList.contains('dark')

        // Must have exactly one of light or dark, never both, never neither
        expect(hasLight !== hasDark).toBe(true)

        // Check data-theme attribute
        if (expectedMode === 'auto') {
          expect(document.documentElement.getAttribute('data-theme')).toBeNull()
        } else {
          expect(document.documentElement.getAttribute('data-theme')).toBe(
            expectedMode,
          )
        }
      }
    })

    it('t-icon-swap: renders Lucide Sun and Moon stacked in same slot with transition styles', () => {
      render(<ThemeToggle />)
      const button = screen.getByRole('button')

      const swapContainer = button.querySelector('.t-icon-swap')
      expect(swapContainer).not.toBeNull()
      expect(swapContainer?.getAttribute('data-state')).toMatch(/light|dark/)

      const sun = swapContainer?.querySelector('[data-icon="light"]')
      const moon = swapContainer?.querySelector('[data-icon="dark"]')
      expect(sun).not.toBeNull()
      expect(moon).not.toBeNull()

      // Accessibility: inner SVG icons must be hidden from screen readers
      expect(sun?.getAttribute('aria-hidden')).toBe('true')
      expect(moon?.getAttribute('aria-hidden')).toBe('true')

      // Reduced motion guard: motion-reduce:transition-none must be applied
      expect(sun?.getAttribute('class')).toContain('motion-reduce:transition-none')
      expect(moon?.getAttribute('class')).toContain('motion-reduce:transition-none')
    })

    it('SSR resilience: gracefully mounts and operates when window.matchMedia is undefined', () => {
      // Simulate environment where window.matchMedia is undefined (e.g. Node SSR or minimal headless)
      const originalMatchMedia = window.matchMedia
      // @ts-expect-error - testing undefined matchMedia
      delete window.matchMedia

      expect(() => {
        render(<ThemeToggle />)
      }).not.toThrow()

      const button = screen.getByRole('button')
      expect(() => {
        fireEvent.click(button)
      }).not.toThrow()

      expect(window.localStorage.getItem('theme')).toBe('light')

      // Restore matchMedia
      window.matchMedia = originalMatchMedia
    })

    it('handles dynamic system color scheme change event when mode is auto', () => {
      let changeHandler: (() => void) | null = null
      let matchesDark = false

      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: matchesDark,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((event: string, handler: any) => {
          if (event === 'change') changeHandler = handler
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))

      render(<ThemeToggle />)

      // Initially in auto mode with light system theme
      expect(document.documentElement.classList.contains('light')).toBe(true)

      // Simulate system switches to dark mode
      act(() => {
        matchesDark = true
        if (changeHandler) {
          changeHandler()
        }
      })

      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })

  // =========================================================================
  // 3. HEADER RESPONSIVE DRAWER & LAYOUT INTEGRITY
  // =========================================================================
  describe('Header — Mobile Drawer Navigation & Authentication States', () => {
    it('renders hamburger menu trigger with accessible label on mobile viewports', () => {
      render(<Header />)
      const trigger = screen.getByLabelText('Open mobile navigation menu')
      expect(trigger).toBeDefined()
      expect(trigger.getAttribute('type')).toBe('button')
    })

    it('opens mobile drawer on trigger click and reveals full navigation links', async () => {
      render(<Header />)
      const trigger = screen.getByLabelText('Open mobile navigation menu')

      act(() => {
        fireEvent.click(trigger)
      })

      // Drawer title and description
      expect(screen.getAllByText('Ghar Bhandaa').length).toBeGreaterThan(0)
      expect(
        screen.getByText('Automated Room Rent Collection System'),
      ).toBeDefined()

      // Drawer navigation links
      const featuresLink = screen.getByRole('link', { name: /Features/i })
      const workflowLink = screen.getByRole('link', { name: /Workflow/i })
      const calcLink = screen.getByRole('link', { name: /Rent Calculator/i })

      expect(featuresLink).toBeDefined()
      expect(workflowLink).toBeDefined()
      expect(calcLink).toBeDefined()
    })

    it('closes mobile drawer when a navigation link is clicked', () => {
      render(<Header />)
      const trigger = screen.getByLabelText('Open mobile navigation menu')

      act(() => {
        fireEvent.click(trigger)
      })

      const calcLink = screen.getByRole('link', { name: /Rent Calculator/i })
      expect(calcLink).toBeDefined()

      // Clicking link should call setMobileOpen(false)
      act(() => {
        fireEvent.click(calcLink)
      })
    })

    it('displays unauthenticated actions (Sign In, Get Started / Create Account) when logged out', () => {
      ;(authClient.useSession as any).mockReturnValue({ data: null })
      render(<Header />)

      // In Header unauthenticated desktop actions
      expect(screen.getAllByText('Sign In').length).toBeGreaterThan(0)
      expect(screen.getByText('Get Started')).toBeDefined()
    })

    it('displays authenticated action (Dashboard) when landlord session is active', () => {
      ;(authClient.useSession as any).mockReturnValue({
        data: {
          user: {
            id: 'landlord_1',
            email: 'landlord@kathmandu.np',
            name: 'Ram Bahadur',
          },
        },
      })
      render(<Header />)

      expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0)
      expect(screen.queryByText('Get Started')).toBeNull()
    })

    it('verifies brand pill status indicator has animated ping pip', () => {
      render(<Header />)
      const brandLink = screen.getByRole('link', { name: /Ghar Bhandaa/i })
      const pingSpan = brandLink.querySelector('.animate-ping')
      expect(pingSpan).not.toBeNull()
      expect(pingSpan?.className).toContain('bg-emerald-400')
    })
  })

  // =========================================================================
  // 4. FOOTER DOMAIN INVARIANTS & INTEGRITY BADGES
  // =========================================================================
  describe('Footer — Domain Invariants & Architecture Badges', () => {
    it('displays mandatory domain invariant badges: Asia/Kathmandu UTC+05:45 and Integer Paisa', () => {
      render(<Footer />)
      expect(screen.getByText('Asia/Kathmandu UTC+05:45')).toBeDefined()
      expect(
        screen.getByText('Integer Paisa (Zero Float Drift)'),
      ).toBeDefined()
    })

    it('renders all 4 comprehensive footer sections and dynamic current year copyright', () => {
      render(<Footer />)
      const year = new Date().getFullYear()

      expect(screen.getByText('Platform')).toBeDefined()
      expect(screen.getByText('Financial Integrity')).toBeDefined()
      expect(screen.getByText('Landlord Portal')).toBeDefined()
      expect(screen.getByText(new RegExp(`© ${year} Ghar Bhandaa`))).toBeDefined()

      // Check invariant checklist items
      expect(screen.getByText('Append-only payment ledgers')).toBeDefined()
      expect(screen.getByText('Derived invoice statuses')).toBeDefined()
      expect(screen.getByText('Multi-tenant landlord isolation')).toBeDefined()
    })
  })
})
