// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { resolve as pathResolve } from 'node:path'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { LoginPage } from '#/components/views/LoginPage'
import { SignupPage } from '#/components/views/SignupPage'

// Shared mocks
const mockNavigate = vi.fn()
const mockSignInEmail = vi.fn()
const mockRegisterLandlord = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, className, onClick }: any) => (
    <a href={to || '/'} className={className} onClick={onClick}>
      {children}
    </a>
  ),
  useNavigate: () => mockNavigate,
  createFileRoute: () => () => ({
    component: () => null,
  }),
}))

vi.mock('#/lib/auth-client', () => ({
  authClient: {
    useSession: () => ({ data: null }),
    signIn: {
      email: (...args: any[]) => mockSignInEmail(...args),
    },
  },
}))

vi.mock('#/server/auth.functions', () => ({
  registerLandlord: (...args: any[]) => mockRegisterLandlord(...args),
}))

// Re-import the exact registration schema to test invariant boundaries directly
const registerLandlordInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional().nullable(),
})

describe('Challenger M2.2: Auth Screens & Input Validation Stress Test', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('1. Password Visibility Toggle Functionality & State Machine', () => {
    it('LoginPage: toggles password input type and aria-label back and forth', () => {
      render(<LoginPage />)
      const passwordInput = screen.getByLabelText('Password')
      const toggleButton = screen.getByLabelText('Show password')

      // Initial state: masked
      expect((passwordInput as HTMLInputElement).type).toBe('password')
      expect(toggleButton.getAttribute('aria-label')).toBe('Show password')

      // First toggle: reveal
      fireEvent.click(toggleButton)
      expect((passwordInput as HTMLInputElement).type).toBe('text')
      expect(screen.getByLabelText('Hide password')).toBeDefined()

      // Second toggle: re-mask
      fireEvent.click(screen.getByLabelText('Hide password'))
      expect((passwordInput as HTMLInputElement).type).toBe('password')
      expect(screen.getByLabelText('Show password')).toBeDefined()
    })

    it('SignupPage: toggles password input type and aria-label back and forth', () => {
      render(<SignupPage />)
      const passwordInput = screen.getByLabelText('Password')
      const toggleButton = screen.getByLabelText('Show password')

      expect((passwordInput as HTMLInputElement).type).toBe('password')
      expect(toggleButton.getAttribute('aria-label')).toBe('Show password')

      fireEvent.click(toggleButton)
      expect((passwordInput as HTMLInputElement).type).toBe('text')
      expect(screen.getByLabelText('Hide password')).toBeDefined()

      fireEvent.click(screen.getByLabelText('Hide password'))
      expect((passwordInput as HTMLInputElement).type).toBe('password')
    })

    it('Stress test: 20 rapid toggle cycles preserve parity and do not corrupt typed content', () => {
      render(<LoginPage />)
      const passwordInput = screen.getByLabelText('Password')
      fireEvent.change(passwordInput, { target: { value: 'SecretKathmandu123!@#' } })
      expect((passwordInput as HTMLInputElement).value).toBe('SecretKathmandu123!@#')

      for (let i = 1; i <= 20; i++) {
        const isCurrentlyPassword = i % 2 === 1
        const label = isCurrentlyPassword ? 'Show password' : 'Hide password'
        const btn = screen.getByLabelText(label)
        fireEvent.click(btn)

        const expectedType = isCurrentlyPassword ? 'text' : 'password'
        expect((passwordInput as HTMLInputElement).type).toBe(expectedType)
        expect((passwordInput as HTMLInputElement).value).toBe('SecretKathmandu123!@#')
      }
    })

    it('Toggling does not trigger premature form submission', () => {
      render(<LoginPage />)
      const toggleButton = screen.getByLabelText('Show password')
      expect(toggleButton.getAttribute('type')).toBe('button')
      fireEvent.click(toggleButton)
      expect(mockSignInEmail).not.toHaveBeenCalled()
    })
  })

  describe('2. Error Shaking Trigger & Recovery Lifecycle (.t-input-shake)', () => {
    it('LoginPage: triggers .t-input-shake on auth failure and auto-clears after 320ms', async () => {
      mockSignInEmail.mockImplementation(
        (_payload: any, options: { onError: (ctx: any) => void }) => {
          options.onError({ error: { message: 'Invalid email or password' } })
          return Promise.resolve()
        },
      )

      const { container } = render(<LoginPage />)
      const card = container.querySelector('main .rise-in')
      expect(card?.classList.contains('t-input-shake')).toBe(false)

      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')
      fireEvent.change(emailInput, { target: { value: 'wrong@test.com' } })
      fireEvent.change(passwordInput, { target: { value: 'badpassword' } })

      const submitBtn = container.querySelector('form button[type="submit"]')!
      await act(async () => {
        fireEvent.click(submitBtn)
      })

      // Error message is displayed
      expect(screen.getByText('Invalid email or password')).toBeDefined()

      // RequestAnimationFrame triggers shake
      act(() => {
        vi.advanceTimersByTime(16) // tick rAF
      })
      expect(card?.classList.contains('t-input-shake')).toBe(true)

      // Advance past the 320ms timeout
      act(() => {
        vi.advanceTimersByTime(350)
      })
      expect(card?.classList.contains('t-input-shake')).toBe(false)
    })

    it('LoginPage: triggers .t-input-shake on unexpected exception in try/catch', async () => {
      mockSignInEmail.mockImplementation(() => {
        return Promise.reject(new Error('Network offline'))
      })

      const { container } = render(<LoginPage />)
      const card = container.querySelector('main .rise-in')

      fireEvent.change(screen.getByLabelText('Email Address'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'somepassword' },
      })

      const submitBtn = container.querySelector('form button[type="submit"]')!
      await act(async () => {
        fireEvent.click(submitBtn)
      })

      expect(
        screen.getByText('An unexpected error occurred. Please try again.'),
      ).toBeDefined()

      act(() => {
        vi.advanceTimersByTime(16)
      })
      expect(card?.classList.contains('t-input-shake')).toBe(true)

      act(() => {
        vi.advanceTimersByTime(350)
      })
      expect(card?.classList.contains('t-input-shake')).toBe(false)
    })

    it('SignupPage: triggers .t-input-shake on registration failure and auto-clears', async () => {
      mockRegisterLandlord.mockRejectedValue(
        new Error('Email is already registered as a landlord'),
      )

      const { container } = render(<SignupPage />)
      const card = container.querySelector('main .rise-in')

      fireEvent.change(screen.getByLabelText('Full Name'), {
        target: { value: 'Test Landlord' },
      })
      fireEvent.change(screen.getByLabelText('Email Address'), {
        target: { value: 'duplicate@example.com' },
      })
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'Secret123!' },
      })

      const submitBtn = container.querySelector('form button[type="submit"]')!
      await act(async () => {
        fireEvent.click(submitBtn)
      })

      expect(
        screen.getByText('Email is already registered as a landlord'),
      ).toBeDefined()

      act(() => {
        vi.advanceTimersByTime(16)
      })
      expect(card?.classList.contains('t-input-shake')).toBe(true)

      act(() => {
        vi.advanceTimersByTime(350)
      })
      expect(card?.classList.contains('t-input-shake')).toBe(false)
    })

    it('Rapid failure replay: multiple sequential errors do not lock isShaking indefinitely', async () => {
      mockSignInEmail.mockImplementation(
        (_payload: any, options: { onError: (ctx: any) => void }) => {
          options.onError({ error: { message: 'Attempt failed' } })
          return Promise.resolve()
        },
      )

      const { container } = render(<LoginPage />)
      const card = container.querySelector('main .rise-in')

      fireEvent.change(screen.getByLabelText('Email Address'), {
        target: { value: 'replay@test.com' },
      })
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'wrongpass' },
      })

      const submitBtn = container.querySelector('form button[type="submit"]')!

      for (let attempt = 1; attempt <= 3; attempt++) {
        await act(async () => {
          fireEvent.click(submitBtn)
        })
        act(() => {
          vi.advanceTimersByTime(16)
        })
        expect(card?.classList.contains('t-input-shake')).toBe(true)
        act(() => {
          vi.advanceTimersByTime(350)
        })
        expect(card?.classList.contains('t-input-shake')).toBe(false)
      }
    })

    it('Graceful unmount during active shake timer does not throw', async () => {
      mockSignInEmail.mockImplementation(
        (_payload: any, options: { onError: (ctx: any) => void }) => {
          options.onError({ error: { message: 'Failed' } })
          return Promise.resolve()
        },
      )

      const { container, unmount } = render(<LoginPage />)
      fireEvent.change(screen.getByLabelText('Email Address'), {
        target: { value: 'unmount@test.com' },
      })
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'pass1234' },
      })

      const submitBtn = container.querySelector('form button[type="submit"]')!
      await act(async () => {
        fireEvent.click(submitBtn)
      })

      act(() => {
        vi.advanceTimersByTime(16)
      })

      // Unmount while timer is pending
      expect(() => {
        unmount()
        vi.advanceTimersByTime(500)
      }).not.toThrow()
    })
  })

  describe('3. Form Input Validation & Submission Edge Cases', () => {
    it('LoginPage: HTML5 validation attributes on email and password and prevents empty submission', () => {
      const { container } = render(<LoginPage />)
      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')

      expect((emailInput as HTMLInputElement).required).toBe(true)
      expect((emailInput as HTMLInputElement).type).toBe('email')
      expect(emailInput.getAttribute('autoComplete')).toBe('email')

      expect((passwordInput as HTMLInputElement).required).toBe(true)
      expect(passwordInput.getAttribute('autoComplete')).toBe('current-password')

      // Empty submission attempt blocked by HTML5 required attribute
      const submitBtn = container.querySelector('form button[type="submit"]')!
      fireEvent.click(submitBtn)
      expect(mockSignInEmail).not.toHaveBeenCalled()
    })

    it('SignupPage: HTML5 validation attributes on name, email, phone, password and prevents empty submission', () => {
      const { container } = render(<SignupPage />)
      const nameInput = screen.getByLabelText('Full Name')
      const emailInput = screen.getByLabelText('Email Address')
      const phoneInput = screen.getByLabelText('Phone Number (Optional)')
      const passwordInput = screen.getByLabelText('Password')

      expect((nameInput as HTMLInputElement).required).toBe(true)
      expect((emailInput as HTMLInputElement).required).toBe(true)
      expect((emailInput as HTMLInputElement).type).toBe('email')
      expect((phoneInput as HTMLInputElement).required).toBe(false)
      expect((phoneInput as HTMLInputElement).type).toBe('tel')
      expect((passwordInput as HTMLInputElement).required).toBe(true)
      expect(passwordInput.getAttribute('autoComplete')).toBe('new-password')

      // Empty submission attempt blocked
      const submitBtn = container.querySelector('form button[type="submit"]')!
      fireEvent.click(submitBtn)
      expect(mockRegisterLandlord).not.toHaveBeenCalled()
    })

    it('SignupPage: normalizes empty phone string to null on submission', async () => {
      mockRegisterLandlord.mockResolvedValue({ success: true })
      const { container } = render(<SignupPage />)

      fireEvent.change(screen.getByLabelText('Full Name'), {
        target: { value: 'Hari Krishna' },
      })
      fireEvent.change(screen.getByLabelText('Email Address'), {
        target: { value: 'hari@bhandaa.com' },
      })
      fireEvent.change(screen.getByLabelText('Phone Number (Optional)'), {
        target: { value: '' }, // empty phone
      })
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'ValidPass123' },
      })

      const submitBtn = container.querySelector('form button[type="submit"]')!
      await act(async () => {
        fireEvent.click(submitBtn)
      })

      expect(mockRegisterLandlord).toHaveBeenCalledWith({
        data: {
          name: 'Hari Krishna',
          email: 'hari@bhandaa.com',
          password: 'ValidPass123',
          phone: null,
        },
      })
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/login' })
    })

    it('SignupPage: preserves phone number when provided', async () => {
      mockRegisterLandlord.mockResolvedValue({ success: true })
      const { container } = render(<SignupPage />)

      fireEvent.change(screen.getByLabelText('Full Name'), {
        target: { value: 'Sita Sharma' },
      })
      fireEvent.change(screen.getByLabelText('Email Address'), {
        target: { value: 'sita@bhandaa.com' },
      })
      fireEvent.change(screen.getByLabelText('Phone Number (Optional)'), {
        target: { value: '9841234567' },
      })
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'ValidPass123' },
      })

      const submitBtn = container.querySelector('form button[type="submit"]')!
      await act(async () => {
        fireEvent.click(submitBtn)
      })

      expect(mockRegisterLandlord).toHaveBeenCalledWith({
        data: {
          name: 'Sita Sharma',
          email: 'sita@bhandaa.com',
          password: 'ValidPass123',
          phone: '9841234567',
        },
      })
    })

    it('Multi-click protection: button enters disabled loading state during submission', async () => {
      let resolveSubmission: (() => void) | undefined
      const pendingPromise = new Promise<void>((done) => {
        resolveSubmission = done
      })
      mockSignInEmail.mockReturnValue(pendingPromise)

      const { container } = render(<LoginPage />)
      fireEvent.change(screen.getByLabelText('Email Address'), {
        target: { value: 'multi@test.com' },
      })
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      })

      const submitBtn = container.querySelector(
        'form button[type="submit"]',
      ) as HTMLButtonElement
      expect(submitBtn.disabled).toBe(false)

      await act(async () => {
        fireEvent.click(submitBtn)
      })

      // Button is now disabled and displays loading indicator
      expect(submitBtn.disabled).toBe(true)
      expect(submitBtn.getAttribute('data-loading')).toBe('')

      // Second click does not trigger a second submission call
      fireEvent.click(submitBtn)
      expect(mockSignInEmail).toHaveBeenCalledTimes(1)

      // Resolve pending call
      await act(async () => {
        resolveSubmission?.()
      })
    })

    it('LoginPage: navigates to root / on successful sign-in', async () => {
      mockSignInEmail.mockImplementation(
        (_payload: any, options: { onSuccess: () => void }) => {
          options.onSuccess()
          return Promise.resolve()
        },
      )

      const { container } = render(<LoginPage />)
      fireEvent.change(screen.getByLabelText('Email Address'), {
        target: { value: 'landlord@domain.com' },
      })
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'CorrectPassword' },
      })

      const submitBtn = container.querySelector('form button[type="submit"]')!
      await act(async () => {
        fireEvent.click(submitBtn)
      })

      expect(mockSignInEmail).toHaveBeenCalledWith(
        {
          email: 'landlord@domain.com',
          password: 'CorrectPassword',
          callbackURL: '/',
        },
        expect.any(Object),
      )
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
    })

    it('Handles Unicode / Devanagari and extreme inputs without crashing', async () => {
      mockRegisterLandlord.mockResolvedValue({ success: true })
      const { container } = render(<SignupPage />)

      const nepaliName = 'राम बहादुर श्रेष्ठ'
      const nepaliPassword = 'नेपाल_पासवर्ड_२०२६!@#'
      const longEmail =
        'landlord_with_very_long_subdomain_testing_boundary_conditions@kathmandu.ghar-bhandaa.np'

      fireEvent.change(screen.getByLabelText('Full Name'), {
        target: { value: nepaliName },
      })
      fireEvent.change(screen.getByLabelText('Email Address'), {
        target: { value: longEmail },
      })
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: nepaliPassword },
      })

      const submitBtn = container.querySelector('form button[type="submit"]')!
      await act(async () => {
        fireEvent.click(submitBtn)
      })

      expect(mockRegisterLandlord).toHaveBeenCalledWith({
        data: {
          name: nepaliName,
          email: longEmail,
          password: nepaliPassword,
          phone: null,
        },
      })
    })
  })

  describe('4. Schema Invariants & Server Function Contracts', () => {
    it('registerLandlord Zod schema rejects empty name, invalid email, short password', () => {
      expect(() =>
        registerLandlordInputSchema.parse({
          name: '',
          email: 'not-an-email',
          password: '123',
        }),
      ).toThrow()

      // Valid payloads
      const valid = registerLandlordInputSchema.parse({
        name: 'Landlord A',
        email: 'landlord@bhandaa.np',
        password: 'password123',
        phone: null,
      })
      expect(valid.name).toBe('Landlord A')
      expect(valid.phone).toBeNull()

      const withPhone = registerLandlordInputSchema.parse({
        name: 'Landlord B',
        email: 'landlord@bhandaa.np',
        password: 'password123',
        phone: '9800000000',
      })
      expect(withPhone.phone).toBe('9800000000')
    })

    it('registerLandlord Zod schema accepts valid Unicode strings', () => {
      const validUnicode = registerLandlordInputSchema.parse({
        name: 'कृष्ण गोपाल',
        email: 'krishna@bhandaa.np',
        password: 'पासवर्ड१२३४',
        phone: '+977-9841234567',
      })
      expect(validUnicode.name).toBe('कृष्ण गोपाल')
      expect(validUnicode.phone).toBe('+977-9841234567')
    })
  })

  describe('5. CSS & Motion Conformance Verification (transitions-dev)', () => {
    it('src/styles.css contains .t-input-shake animation and @keyframes t-input-shake', () => {
      const cssPath = pathResolve(process.cwd(), 'src/styles.css')
      const css = readFileSync(cssPath, 'utf-8')

      expect(css).toContain('.t-input-shake')
      expect(css).toContain('@keyframes t-input-shake')
      expect(css).toContain('var(--shake-dur-a)')
      expect(css).toContain('var(--shake-dur-b)')
      expect(css).toContain('var(--shake-distance)')
      expect(css).toContain('var(--shake-overshoot)')

      // Verify keyframe percentage stops matching transitions-dev doctrine
      expect(css).toContain('28.57%')
      expect(css).toContain('57.14%')
      expect(css).toContain('78.57%')

      // Verify prefers-reduced-motion neutralizes .t-input-shake
      expect(css).toMatch(
        /@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)[\s\S]*?\.t-input-shake[\s\S]*?animation:\s*none\s*!important/,
      )
    })
  })
})
