import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { authClient } from '#/lib/auth-client'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from '#/components/ui/card'
import { Field, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { Alert, AlertDescription } from '#/components/ui/alert'
import Header from '#/components/Header'
import Footer from '#/components/Footer'
import { AlertCircle } from 'lucide-react'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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
          },
        },
      )
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md shadow-lg/5 border-[var(--line)]">
          <CardHeader className="text-center pb-2">
            <span className="island-kicker block mb-1">Ghar Bhandaa</span>
            <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--sea-ink)]">
              Sign in to your account
            </CardTitle>
            <CardDescription className="text-[var(--sea-ink-soft)] text-sm">
              Automated Room Rent Collection System
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardPanel className="flex flex-col gap-4">
              {error && (
                <Alert variant="error">
                  <AlertCircle />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Field>
                <FieldLabel>Email Address</FieldLabel>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ram@example.com"
                  autoComplete="email"
                />
              </Field>

              <Field>
                <FieldLabel>Password</FieldLabel>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </Field>
            </CardPanel>

            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                loading={loading}
                className="w-full rounded-full"
              >
                Sign In
              </Button>

              <div className="text-center text-xs sm:text-sm text-[var(--sea-ink-soft)]">
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
