// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import ThemeToggle from '../ThemeToggle'
import Header from '../Header'
import Footer from '../Footer'
import { LandingPage } from '#/components/views/LandingPage'
import { LoginPage } from '#/components/views/LoginPage'
import { SignupPage } from '#/components/views/SignupPage'

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
    useSession: () => ({ data: null }),
    signIn: {
      email: vi.fn(),
    },
  },
}))

// Mock server auth function
vi.mock('#/server/auth.functions', () => ({
  registerLandlord: vi.fn(),
}))

describe('Public & Auth Views Suite', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.className = ''
    document.documentElement.removeAttribute('data-theme')
  })

  describe('ThemeToggle', () => {
    it('renders toggle button with Sun and Moon icons', () => {
      render(<ThemeToggle />)
      const button = screen.getByRole('button')
      expect(button).toBeDefined()
      expect(button.querySelector('.t-icon-swap')).not.toBeNull()
      expect(button.querySelector('[data-icon="light"]')).not.toBeNull()
      expect(button.querySelector('[data-icon="dark"]')).not.toBeNull()
    })

    it('cycles theme mode on button click and updates storage', () => {
      render(<ThemeToggle />)
      const button = screen.getByRole('button')

      // Initial auto mode -> click switches to light
      fireEvent.click(button)
      expect(window.localStorage.getItem('theme')).toBe('light')

      // Click again -> switches to dark
      fireEvent.click(button)
      expect(window.localStorage.getItem('theme')).toBe('dark')

      // Click again -> switches to auto
      fireEvent.click(button)
      expect(window.localStorage.getItem('theme')).toBe('auto')
    })
  })

  describe('Header', () => {
    it('renders brand pill with active status indicator', () => {
      render(<Header />)
      expect(screen.getByText('Ghar Bhandaa')).toBeDefined()
      const brandLink = screen.getByRole('link', { name: /Ghar Bhandaa/i })
      expect(brandLink).toBeDefined()
    })

    it('renders navigation links and mobile drawer trigger', () => {
      render(<Header />)
      expect(screen.getAllByText('Features').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Workflow').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Calculator').length).toBeGreaterThan(0)

      // Mobile drawer button
      const drawerButton = screen.getByLabelText('Open mobile navigation menu')
      expect(drawerButton).toBeDefined()
    })
  })

  describe('Footer', () => {
    it('renders multi-column sections and copyright', () => {
      render(<Footer />)
      const currentYear = new Date().getFullYear().toString()
      expect(screen.getByText(new RegExp(currentYear))).toBeDefined()
      expect(screen.getByText('Platform')).toBeDefined()
      expect(screen.getByText('Financial Integrity')).toBeDefined()
      expect(screen.getByText('Landlord Portal')).toBeDefined()
    })

    it('displays domain invariant pills (Kathmandu timezone and Integer paisa)', () => {
      render(<Footer />)
      expect(screen.getByText('Asia/Kathmandu UTC+05:45')).toBeDefined()
      expect(screen.getByText('Integer Paisa (Zero Float Drift)')).toBeDefined()
    })
  })

  describe('LandingPage', () => {
    it('renders hero headline, subheadline, and CTAs', () => {
      render(<LandingPage />)
      expect(
        screen.getByText(/Effortless Room Rent Collection for/i),
      ).toBeDefined()
      expect(screen.getByText(/Kathmandu Landlords/i)).toBeDefined()
      expect(screen.getAllByText(/Create Landlord Account/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Sign In to Portal/i).length).toBeGreaterThan(0)
    })

    it('renders interactive rent calculator and computes dynamic totals', () => {
      render(<LandingPage />)
      expect(screen.getByText('Interactive Rent & Revenue Estimator')).toBeDefined()

      const roomInput = screen.getByLabelText('Number of Rental Rooms')
      expect((roomInput as HTMLInputElement).value).toBe('4')

      // 4 rooms * (15000 + 500) = 62,000 monthly, accessible via AnimatedNumber aria-label
      expect(screen.getByLabelText('62,000')).toBeDefined()

      // Change rooms to 6: 6 * 15500 = 93,000 monthly
      fireEvent.change(roomInput, { target: { value: '6' } })
      expect(screen.getByLabelText('93,000')).toBeDefined()
    })

    it('renders 6 staggered feature cards and 3-step workflow', () => {
      render(<LandingPage />)
      expect(screen.getByText('Automated Invoicing')).toBeDefined()
      expect(screen.getByText('Integer Paisa Precision')).toBeDefined()
      expect(screen.getByText('Asia/Kathmandu Timezone')).toBeDefined()
      expect(screen.getByText('Multi-Property & Rooms')).toBeDefined()
      expect(screen.getByText('Append-Only Cash Ledger')).toBeDefined()
      expect(screen.getByText('Tenant & Lease Registry')).toBeDefined()

      expect(screen.getByText('How Ghar Bhandaa Works')).toBeDefined()
      expect(screen.getByText('Add Properties & Rooms')).toBeDefined()
      expect(screen.getByText('Register Tenants & Leases')).toBeDefined()
      expect(screen.getByText('Automate & Collect')).toBeDefined()
    })
  })

  describe('LoginPage', () => {
    it('renders email and password input groups with toggle', () => {
      render(<LoginPage />)
      expect(screen.getByText('Sign in to your account')).toBeDefined()

      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')
      expect((emailInput as HTMLInputElement).type).toBe('email')
      expect((passwordInput as HTMLInputElement).type).toBe('password')

      // Eye button toggles password visibility
      const toggleButton = screen.getByLabelText('Show password')
      fireEvent.click(toggleButton)
      expect((passwordInput as HTMLInputElement).type).toBe('text')
      expect(screen.getByLabelText('Hide password')).toBeDefined()

      fireEvent.click(screen.getByLabelText('Hide password'))
      expect((passwordInput as HTMLInputElement).type).toBe('password')
    })
  })

  describe('SignupPage', () => {
    it('renders name, email, phone, and password input groups', () => {
      render(<SignupPage />)
      expect(screen.getByText('Create your account')).toBeDefined()

      const nameInput = screen.getByLabelText('Full Name')
      const emailInput = screen.getByLabelText('Email Address')
      const phoneInput = screen.getByLabelText('Phone Number (Optional)')
      const passwordInput = screen.getByLabelText('Password')

      expect(nameInput).toBeDefined()
      expect((emailInput as HTMLInputElement).type).toBe('email')
      expect((phoneInput as HTMLInputElement).type).toBe('tel')
      expect((passwordInput as HTMLInputElement).type).toBe('password')

      // Toggle password
      const toggleButton = screen.getByLabelText('Show password')
      fireEvent.click(toggleButton)
      expect((passwordInput as HTMLInputElement).type).toBe('text')
    })
  })
})
