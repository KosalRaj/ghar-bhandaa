import { useState } from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { AlertCircle, User, Mail, Phone, Lock, Eye, EyeOff, UserPlus } from 'lucide-react'
import { registerLandlord } from '#/server/auth.functions'
import { cn } from '#/lib/utils'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from '#/components/ui/card'
import { Field, FieldLabel } from '#/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '#/components/ui/input-group'
import { Button } from '#/components/ui/button'
import { Alert, AlertDescription } from '#/components/ui/alert'
import Header from '#/components/Header'
import Footer from '#/components/Footer'

export const Route = createFileRoute('/signup')({
  component: SignupPage,
})

export function SignupPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isShaking, setIsShaking] = useState(false)

  const triggerShake = () => {
    setIsShaking(false)
    requestAnimationFrame(() => {
      setIsShaking(true)
      setTimeout(() => {
        setIsShaking(false)
      }, 320)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await registerLandlord({
        data: { name, email, password, phone: phone || null },
      })
      navigate({ to: '/login' })
    } catch (err: any) {
      setError(err?.message || 'Failed to register landlord. Please try again.')
      triggerShake()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <Card
          className={cn(
            'rise-in w-full max-w-md border-[var(--line)] shadow-lg/5 transition-transform duration-200',
            isShaking && 't-input-shake',
          )}
        >
          <CardHeader className="pb-2 text-center">
            <span className="island-kicker mb-1 block">Landlord Portal</span>
            <CardTitle className="text-2xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-3xl">
              Create your account
            </CardTitle>
            <CardDescription className="text-sm text-[var(--sea-ink-soft)]">
              Start automating your monthly rent collections
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardPanel className="flex flex-col gap-3.5">
              {error && (
                <Alert variant="error">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Field>
                <FieldLabel htmlFor="signup-name">Full Name</FieldLabel>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <User className="size-4 text-muted-foreground" aria-hidden="true" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="signup-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ram Bahadur"
                    autoComplete="name"
                  />
                </InputGroup>
              </Field>

              <Field>
                <FieldLabel htmlFor="signup-email">Email Address</FieldLabel>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <Mail className="size-4 text-muted-foreground" aria-hidden="true" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="signup-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ram@example.com"
                    autoComplete="email"
                  />
                </InputGroup>
              </Field>

              <Field>
                <FieldLabel htmlFor="signup-phone">Phone Number (Optional)</FieldLabel>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <Phone className="size-4 text-muted-foreground" aria-hidden="true" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="signup-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    autoComplete="tel"
                  />
                </InputGroup>
              </Field>

              <Field>
                <FieldLabel htmlFor="signup-password">Password</FieldLabel>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <Lock className="size-4 text-muted-foreground" aria-hidden="true" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <InputGroupAddon align="inline-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="rounded-md text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="size-3.5" aria-hidden="true" />
                      ) : (
                        <Eye className="size-3.5" aria-hidden="true" />
                      )}
                    </Button>
                  </InputGroupAddon>
                </InputGroup>
              </Field>
            </CardPanel>

            <CardFooter className="flex flex-col gap-3 pt-4">
              <Button
                type="submit"
                loading={loading}
                className="w-full rounded-full"
              >
                <UserPlus className="size-4" />
                Sign Up
              </Button>

              <div className="text-center text-xs text-[var(--sea-ink-soft)] sm:text-sm">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-[var(--lagoon-deep)] hover:underline"
                >
                  Sign In
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
