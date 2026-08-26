import { Link, useNavigate } from '@tanstack/react-router'
import { authClient } from '#/lib/auth-client'
import { Avatar, AvatarFallback } from '#/components/ui/avatar'
import { Button } from '#/components/ui/button'
import ThemeToggle from './ThemeToggle'

export default function LandlordHeader() {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()

  const handleSignOut = async () => {
    await authClient.signOut()
    await navigate({ to: '/login' })
  }

  const initials = session?.user?.name
    ? session.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'L'

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
      <nav className="page-wrap flex flex-wrap items-center justify-between py-3 sm:py-3.5">
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

        {/* Navigation Links */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-medium">
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
        <div className="flex items-center gap-2.5">
          {session?.user && (
            <div className="hidden items-center gap-2 sm:flex">
              <Avatar className="size-7">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-[var(--sea-ink-soft)] max-w-28 truncate">
                {session.user.name}
              </span>
            </div>
          )}

          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="rounded-full text-xs"
          >
            Sign Out
          </Button>

          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
