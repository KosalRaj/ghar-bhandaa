import { Link, useNavigate } from '@tanstack/react-router'
import { authClient } from '#/lib/auth-client'
import ThemeToggle from './ThemeToggle'

export default function LandlordHeader() {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()

  const handleSignOut = async () => {
    await authClient.signOut({
      onSuccess: () => {
        navigate({ to: '/login' })
      },
    })
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
      <nav className="page-wrap flex flex-wrap items-center justify-between py-3 sm:py-4">
        {/* Brand */}
        <h2 className="m-0 flex-shrink-0 text-base font-semibold tracking-tight">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm text-[var(--sea-ink)] no-underline shadow-[0_8px_24px_rgba(30,90,72,0.08)] sm:px-4 sm:py-2"
          >
            <span className="h-2 w-2 rounded-full bg-[linear-gradient(90deg,#56c6be,#7ed3bf)]" />
            Ghar Bhandaa
          </Link>
        </h2>

        {/* Links */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold">
          <Link
            to="/dashboard"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Dashboard
          </Link>
          <Link
            to="/properties"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Properties
          </Link>
          <Link
            to="/rooms"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Rooms
          </Link>
          <Link
            to="/tenants"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Tenants
          </Link>
          <Link
            to="/leases"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Leases
          </Link>
        </div>

        {/* User Info / Actions */}
        <div className="flex items-center gap-2">
          {session?.user && (
            <div className="hidden items-center gap-2 md:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--lagoon)]/20 text-xs font-semibold text-[var(--lagoon-deep)]">
                {session.user.name?.charAt(0).toUpperCase() || 'L'}
              </div>
              <span className="text-xs font-medium text-[var(--sea-ink-soft)] max-w-28 truncate">
                {session.user.name}
              </span>
            </div>
          )}

          <button
            onClick={handleSignOut}
            className="rounded-full border border-[var(--chip-line)] bg-white/50 px-3 py-1.5 text-xs font-semibold text-[var(--sea-ink)] hover:bg-white hover:text-[var(--lagoon-deep)] focus:outline-none transition-colors"
          >
            Sign Out
          </button>

          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
