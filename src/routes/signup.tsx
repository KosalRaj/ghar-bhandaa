import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { registerLandlord } from '#/server/auth.functions'
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

export const Route = createFileRoute('/signup')({
  component: SignupPage,
})

function SignupPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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
            <span className="island-kicker block mb-1">Landlord Portal</span>
            <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--sea-ink)]">
              Create your account
            </CardTitle>
            <CardDescription className="text-[var(--sea-ink-soft)] text-sm">
              Start automating your monthly rent collections
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardPanel className="flex flex-col gap-3.5">
              {error && (
                <Alert variant="error">
                  <AlertCircle />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Field>
                <FieldLabel>Full Name</FieldLabel>
                <Input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ram Bahadur"
                  autoComplete="name"
                />
              </Field>

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
                <FieldLabel>Phone Number (Optional)</FieldLabel>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98XXXXXXXX"
                  autoComplete="tel"
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
                  autoComplete="new-password"
                />
              </Field>
            </CardPanel>

            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                loading={loading}
                className="w-full rounded-full"
              >
                Sign Up
              </Button>

              <div className="text-center text-xs sm:text-sm text-[var(--sea-ink-soft)]">
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
