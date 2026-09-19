import { useState } from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { AlertCircle, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react'
import { authClient } from '#/lib/auth-client'
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

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      await authClient.signIn.email(
        {
          email,
          password,
          callbackURL: '/',
        },
        {
          onSuccess: () => {
            navigate({ to: '/' })
          },
          onError: (ctx) => {
            setError(ctx.error.message || 'Invalid email or password')
            triggerShake()
          },
        },
      )
    } catch {
      setError('An unexpected error occurred. Please try again.')
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
            <span className="island-kicker mb-1 block">Ghar Bhandaa</span>
            <CardTitle className="text-2xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-3xl">
              Sign in to your account
            </CardTitle>
            <CardDescription className="text-sm text-[var(--sea-ink-soft)]">
              Automated Room Rent Collection System
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardPanel className="flex flex-col gap-4">
              {error && (
                <Alert variant="error">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Field>
                <FieldLabel htmlFor="login-email">Email Address</FieldLabel>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <Mail className="size-4 text-muted-foreground" aria-hidden="true" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="login-email"
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
                <FieldLabel htmlFor="login-password">Password</FieldLabel>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <Lock className="size-4 text-muted-foreground" aria-hidden="true" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
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
                <LogIn className="size-4" />
                Sign In
              </Button>

              <div className="text-center text-xs text-[var(--sea-ink-soft)] sm:text-sm">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-semibold text-[var(--lagoon-deep)] hover:underline"
                >
                  Create a Landlord Account
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
