// @vitest-environment jsdom
import { fireEvent, render, screen, act } from '@testing-library/react'
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import LandlordHeader from '../LandlordHeader'
import { AnimatedNumber } from '#/components/ui/animated-number'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'
import { Button } from '#/components/ui/button'
import { authClient } from '#/lib/auth-client'

// Mock TanStack Router Link and hooks
const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, hash, children, className, activeProps, onClick }: any) => (
    <a
      href={`${to || '/'}${hash ? `#${hash}` : ''}`}
      className={`${className || ''} ${activeProps?.className || ''}`}
      onClick={onClick}
    >
      {children}
    </a>
  ),
  useNavigate: () => mockNavigate,
  createFileRoute: () => () => ({
    component: () => null,
  }),
}))

// Mock Better Auth client session
vi.mock('#/lib/auth-client', () => ({
  authClient: {
    useSession: vi.fn(() => ({
      data: {
        user: {
          id: 'landlord-1',
          name: 'Ram Bahadur',
          email: 'ram@bhandaa.np',
        },
      },
    })),
    signOut: vi.fn(),
  },
}))

describe('Milestone M3: Landlord Management Portal Overhaul Suite', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.className = ''
    document.documentElement.removeAttribute('data-theme')
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('LandlordHeader Component', () => {
    it('renders brand link and all primary navigation targets', () => {
      render(<LandlordHeader />)
      expect(screen.getByText('Ghar Bhandaa')).toBeDefined()
      expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Properties').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Rooms').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Tenants').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Leases').length).toBeGreaterThan(0)
    })

    it('renders user identity and avatar initials for authenticated landlord', () => {
      render(<LandlordHeader />)
      expect(screen.getAllByText('Ram Bahadur').length).toBeGreaterThan(0)
      // Initials for Ram Bahadur should be RB
      expect(screen.getAllByText('RB').length).toBeGreaterThan(0)
    })

    it('renders mobile drawer trigger button with proper accessibility label', () => {
      render(<LandlordHeader />)
      const trigger = screen.getByLabelText('Open mobile navigation menu')
      expect(trigger).toBeDefined()
      expect(trigger.getAttribute('type')).toBe('button')
    })

    it('opens mobile drawer when hamburger is clicked', async () => {
      render(<LandlordHeader />)
      const trigger = screen.getByLabelText('Open mobile navigation menu')

      await act(async () => {
        fireEvent.click(trigger)
      })

      // Drawer panel should now contain the portal navigation and landlord info
      expect(screen.getByText('ram@bhandaa.np')).toBeDefined()
      expect(screen.getAllByText('Sign Out').length).toBeGreaterThan(0)
    })

    it('invokes authClient.signOut and navigates to /login on sign out', async () => {
      render(<LandlordHeader />)
      const signOutButtons = screen.getAllByText('Sign Out')

      await act(async () => {
        fireEvent.click(signOutButtons[0])
      })

      expect(authClient.signOut).toHaveBeenCalledTimes(1)
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/login' })
    })
  })

  describe('Empty State with EmptyContent & CTAs', () => {
    it('renders EmptyContent with actionable CTA button for properties', () => {
      const handleAction = vi.fn()
      render(
        <Empty>
          <EmptyMedia variant="icon">
            <span data-testid="prop-icon">Building</span>
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No Properties Registered</EmptyTitle>
            <EmptyDescription>
              You haven't added any buildings yet.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={handleAction} size="sm">
              Add First Property
            </Button>
          </EmptyContent>
        </Empty>,
      )

      expect(screen.getByText('No Properties Registered')).toBeDefined()
      const cta = screen.getByRole('button', { name: /Add First Property/i })
      expect(cta).toBeDefined()

      fireEvent.click(cta)
      expect(handleAction).toHaveBeenCalledTimes(1)
    })

    it('renders EmptyContent with actionable CTA button for leases', () => {
      const handleAction = vi.fn()
      render(
        <Empty>
          <EmptyMedia variant="icon">
            <span data-testid="lease-icon">Lease</span>
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No Leases Registered</EmptyTitle>
            <EmptyDescription>No active leases found.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={handleAction} size="sm">
              Create First Lease
            </Button>
          </EmptyContent>
        </Empty>,
      )

      const cta = screen.getByRole('button', { name: /Create First Lease/i })
      expect(cta).toBeDefined()
      fireEvent.click(cta)
      expect(handleAction).toHaveBeenCalledTimes(1)
    })
  })

  describe('AnimatedNumber Metric Component', () => {
    it('splits numbers and applies digit classes and trailing staggers', () => {
      const { container } = render(<AnimatedNumber value="NPR 45,000.00" />)
      const group = container.querySelector('.t-digit-group')
      expect(group).not.toBeNull()
      expect(group?.classList.contains('is-animating')).toBe(true)

      const digits = container.querySelectorAll('.t-digit')
      expect(digits.length).toBe('NPR 45,000.00'.length)

      // The last two characters should carry stagger 1 and 2
      expect(digits[digits.length - 2].getAttribute('data-stagger')).toBe('1')
      expect(digits[digits.length - 1].getAttribute('data-stagger')).toBe('2')
    })

    it('renders numeric counts properly', () => {
      const { container } = render(<AnimatedNumber value={12} />)
      const digits = container.querySelectorAll('.t-digit')
      expect(digits.length).toBe(2)
      expect(digits[0].textContent).toBe('1')
      expect(digits[1].textContent).toBe('2')
    })
  })

  describe('AlertDialog for Destructive Termination', () => {
    it('renders AlertDialog semantic elements and handles dismissal', async () => {
      const onCancel = vi.fn()
      const onConfirm = vi.fn()

      render(
        <AlertDialog open={true}>
          <AlertDialogPopup>
            <AlertDialogHeader>
              <AlertDialogTitle>Terminate Lease Contract</AlertDialogTitle>
              <AlertDialogDescription>
                This action will conclude active tenancy for this room.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogClose
                render={
                  <Button variant="ghost" onClick={onCancel}>
                    Cancel
                  </Button>
                }
              />
              <Button variant="destructive" onClick={onConfirm}>
                Confirm Termination
              </Button>
            </AlertDialogFooter>
          </AlertDialogPopup>
        </AlertDialog>,
      )

      expect(screen.getByText('Terminate Lease Contract')).toBeDefined()
      expect(
        screen.getByText(
          'This action will conclude active tenancy for this room.',
        ),
      ).toBeDefined()

      const cancelBtn = screen.getByRole('button', { name: /Cancel/i })
      const confirmBtn = screen.getByRole('button', {
        name: /Confirm Termination/i,
      })

      fireEvent.click(cancelBtn)
      expect(onCancel).toHaveBeenCalledTimes(1)

      fireEvent.click(confirmBtn)
      expect(onConfirm).toHaveBeenCalledTimes(1)
    })
  })
})
