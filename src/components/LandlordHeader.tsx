import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  Menu,
  LayoutDashboard,
  Building2,
  DoorOpen,
  Users,
  FileSignature,
  LogOut,
} from 'lucide-react'
import { authClient } from '#/lib/auth-client'
import { Avatar, AvatarFallback } from '#/components/ui/avatar'
import { Button } from '#/components/ui/button'
import {
  Drawer,
  DrawerTrigger,
  DrawerPopup,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerPanel,
} from '#/components/ui/drawer'
import ThemeToggle from './ThemeToggle'

export default function LandlordHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()

  const handleSignOut = async () => {
    setMobileOpen(false)
    await authClient.signOut()
    await navigate({ to: '/login' })
  }

  const initials = session?.user.name
    ? session.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'L'

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/properties', label: 'Properties', icon: Building2 },
    { to: '/rooms', label: 'Rooms', icon: DoorOpen },
    { to: '/tenants', label: 'Tenants', icon: Users },
    { to: '/leases', label: 'Leases', icon: FileSignature },
  ] as const

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
      <nav className="page-wrap flex items-center justify-between py-3 sm:py-3.5">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <h2 className="m-0 flex-shrink-0 text-base font-semibold tracking-tight">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm text-[var(--sea-ink)] no-underline shadow-[0_8px_24px_rgba(30,90,72,0.08)] sm:px-4 sm:py-2"
            >
              <span className="h-2 w-2 rounded-full bg-[linear-gradient(90deg,#56c6be,#7ed3bf)]" />
              Ghar Bhandaa
            </Link>
          </h2>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-x-5 text-sm font-medium">
            {navLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="nav-link"
                activeProps={{ className: 'nav-link is-active' }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop User Info & Actions */}
        <div className="hidden md:flex items-center gap-3">
          {session?.user && (
            <div className="flex items-center gap-2">
              <Avatar className="size-7">
                <AvatarFallback className="text-[11px] font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-[var(--sea-ink-soft)] max-w-32 truncate">
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
            <LogOut className="size-3.5" aria-hidden="true" />
            Sign Out
          </Button>

          <ThemeToggle />
        </div>

        {/* Mobile Navigation Drawer Trigger */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />

          <Drawer
            position="right"
            open={mobileOpen}
            onOpenChange={setMobileOpen}
          >
            <DrawerTrigger
              type="button"
              className="inline-flex size-9 items-center justify-center rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink)] transition hover:bg-[var(--surface-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Open mobile navigation menu"
            >
              <Menu className="size-4.5" />
            </DrawerTrigger>

            <DrawerPopup
              position="right"
              showCloseButton
              className="w-80 max-w-[85vw]"
            >
              <DrawerHeader>
                <div className="flex items-center gap-2.5">
                  <Avatar className="size-9">
                    <AvatarFallback className="text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 text-left">
                    <DrawerTitle className="text-sm font-bold text-[var(--sea-ink)] truncate">
                      {session?.user.name || 'Landlord Portal'}
                    </DrawerTitle>
                    <DrawerDescription className="text-xs text-[var(--sea-ink-soft)] truncate">
                      {session?.user.email || 'Rental Management'}
                    </DrawerDescription>
                  </div>
                </div>
              </DrawerHeader>

              <DrawerPanel className="flex flex-col gap-4">
                <nav className="flex flex-col gap-1">
                  {navLinks.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--sea-ink)] transition-colors hover:bg-accent"
                        activeProps={{
                          className:
                            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold bg-accent text-[var(--lagoon-deep)]',
                        }}
                      >
                        <Icon className="size-4 text-[var(--lagoon-deep)]" />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </nav>

                <div className="my-1 h-px bg-border" />

                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="w-full justify-center rounded-full text-xs"
                    size="sm"
                  >
                    <LogOut className="size-3.5" aria-hidden="true" />
                    Sign Out
                  </Button>
                </div>
              </DrawerPanel>
            </DrawerPopup>
          </Drawer>
        </div>
      </nav>
    </header>
  )
}
