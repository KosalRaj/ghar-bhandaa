import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Menu,
  Sparkles,
  CheckCircle2,
  Calculator,
  LayoutDashboard,
  LogIn,
  UserPlus,
} from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { authClient } from '#/lib/auth-client'
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

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: session } = authClient.useSession()

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
      <nav className="page-wrap flex items-center justify-between py-3 sm:py-3.5">
        {/* Brand pill with active status pip */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3.5 py-1.5 text-sm font-bold text-[var(--sea-ink)] no-underline shadow-xs transition hover:bg-[var(--surface-strong)] hover:shadow-sm"
          >
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
            </span>
            <span>Ghar Bhandaa</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/"
              hash="features"
              className="rounded-full px-3 py-1.5 text-sm font-medium text-[var(--sea-ink-soft)] transition hover:text-[var(--sea-ink)] hover:bg-black/5 dark:hover:bg-white/5"
            >
              Features
            </Link>
            <Link
              to="/"
              hash="workflow"
              className="rounded-full px-3 py-1.5 text-sm font-medium text-[var(--sea-ink-soft)] transition hover:text-[var(--sea-ink)] hover:bg-black/5 dark:hover:bg-white/5"
            >
              Workflow
            </Link>
            <Link
              to="/"
              hash="calculator"
              className="rounded-full px-3 py-1.5 text-sm font-medium text-[var(--sea-ink-soft)] transition hover:text-[var(--sea-ink)] hover:bg-black/5 dark:hover:bg-white/5"
            >
              Calculator
            </Link>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          <ThemeToggle />

          {session?.user ? (
            <Link to="/dashboard">
              <Button size="sm" className="rounded-full">
                <LayoutDashboard className="size-4" />
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="rounded-full">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="rounded-full shadow-xs">
                  Get Started
                </Button>
              </Link>
            </>
          )}
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
                <div className="flex items-center gap-2">
                  <span className="relative flex size-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                  </span>
                  <DrawerTitle className="text-base font-bold text-[var(--sea-ink)]">
                    Ghar Bhandaa
                  </DrawerTitle>
                </div>
                <DrawerDescription className="text-xs text-[var(--sea-ink-soft)]">
                  Automated Room Rent Collection System
                </DrawerDescription>
              </DrawerHeader>

              <DrawerPanel className="flex flex-col gap-4">
                <nav className="flex flex-col gap-1">
                  <Link
                    to="/"
                    hash="features"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--sea-ink)] transition-colors hover:bg-accent"
                  >
                    <Sparkles className="size-4 text-[var(--lagoon-deep)]" />
                    <span>Features</span>
                  </Link>
                  <Link
                    to="/"
                    hash="workflow"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--sea-ink)] transition-colors hover:bg-accent"
                  >
                    <CheckCircle2 className="size-4 text-[var(--palm)]" />
                    <span>Workflow</span>
                  </Link>
                  <Link
                    to="/"
                    hash="calculator"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--sea-ink)] transition-colors hover:bg-accent"
                  >
                    <Calculator className="size-4 text-[var(--lagoon-deep)]" />
                    <span>Rent Calculator</span>
                  </Link>
                </nav>

                <div className="my-1 h-px bg-border" />

                <div className="flex flex-col gap-2">
                  {session?.user ? (
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="w-full"
                    >
                      <Button className="w-full justify-center rounded-full" size="sm">
                        <LayoutDashboard className="size-4" />
                        Landlord Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setMobileOpen(false)}
                        className="w-full"
                      >
                        <Button
                          variant="outline"
                          className="w-full justify-center rounded-full"
                          size="sm"
                        >
                          <LogIn className="size-4" />
                          Sign In to Portal
                        </Button>
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setMobileOpen(false)}
                        className="w-full"
                      >
                        <Button
                          className="w-full justify-center rounded-full"
                          size="sm"
                        >
                          <UserPlus className="size-4" />
                          Create Landlord Account
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </DrawerPanel>
            </DrawerPopup>
          </Drawer>
        </div>
      </nav>
    </header>
  )
}
