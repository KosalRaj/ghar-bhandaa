import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { registerLandlord } from '#/server/auth.functions'

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
      await registerLandlord({ name, email, password, phone })
      navigate({ to: '/login' })
    } catch (err: any) {
      setError(err?.message || 'Failed to register landlord. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="island-shell w-full max-w-md rounded-[2rem] p-8 sm:p-10">
        <div className="text-center">
          <span className="island-kicker">Landlord Portal</span>
          <h2 className="display-title mt-2 text-3xl font-bold tracking-tight text-[var(--sea-ink)]">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
            Start automating your monthly rent collections
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-[var(--line)] bg-white/50 px-3 py-2 text-sm text-[var(--sea-ink)] placeholder-gray-400 focus:border-[var(--lagoon-deep)] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--lagoon-deep)]"
              placeholder="Ram Bahadur"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-[var(--line)] bg-white/50 px-3 py-2 text-sm text-[var(--sea-ink)] placeholder-gray-400 focus:border-[var(--lagoon-deep)] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--lagoon-deep)]"
              placeholder="ram@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-[var(--line)] bg-white/50 px-3 py-2 text-sm text-[var(--sea-ink)] placeholder-gray-400 focus:border-[var(--lagoon-deep)] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--lagoon-deep)]"
              placeholder="98XXXXXXXX"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-[var(--line)] bg-white/50 px-3 py-2 text-sm text-[var(--sea-ink)] placeholder-gray-400 focus:border-[var(--lagoon-deep)] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--lagoon-deep)]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-full bg-[var(--lagoon-deep)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#246f76] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)] focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Sign Up'}
          </button>

          <div className="text-center text-sm mt-4">
            <span className="text-[var(--sea-ink-soft)]">Already have an account? </span>
            <Link to="/login" className="font-semibold text-[var(--lagoon-deep)] hover:underline">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
