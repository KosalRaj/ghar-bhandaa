import { Link } from '@tanstack/react-router'
import { Clock, Coins, ShieldCheck } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-[var(--header-bg)]/60 px-4 py-12 text-[var(--sea-ink-soft)] backdrop-blur-sm">
      <div className="page-wrap mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 sm:grid-cols-2 lg:gap-12">
          {/* Brand & Mission */}
          <div className="flex flex-col gap-3 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1 text-xs font-bold text-[var(--sea-ink)]">
                <span className="size-2 rounded-full bg-[linear-gradient(90deg,#56c6be,#7ed3bf)]" />
                Ghar Bhandaa
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[var(--sea-ink-soft)]">
              Automated room rent collection and management platform built specifically for landlords and property owners in Nepal.
            </p>

            {/* Timezone & Currency Invariant Badges */}
            <div className="mt-2 flex flex-col gap-2">
              <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                <Clock className="size-3 shrink-0" />
                <span>Asia/Kathmandu UTC+05:45</span>
              </div>
              <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-[11px] font-medium text-sky-700 dark:text-sky-400">
                <Coins className="size-3 shrink-0" />
                <span>Integer Paisa (Zero Float Drift)</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink)]">
              Platform
            </h4>
            <ul className="flex flex-col gap-2 text-xs">
              <li>
                <Link
                  to="/"
                  hash="features"
                  className="transition hover:text-[var(--sea-ink)]"
                >
                  Features & Invoicing
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  hash="workflow"
                  className="transition hover:text-[var(--sea-ink)]"
                >
                  3-Step Workflow
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  hash="calculator"
                  className="transition hover:text-[var(--sea-ink)]"
                >
                  Rent Calculator Widget
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="transition hover:text-[var(--sea-ink)]"
                >
                  Landlord Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Domain Invariants & Rules */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink)]">
              Financial Integrity
            </h4>
            <ul className="flex flex-col gap-2 text-xs">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
                <span>Append-only payment ledgers</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
                <span>Derived invoice statuses</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
                <span>Exact integer arithmetic</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
                <span>Multi-tenant landlord isolation</span>
              </li>
            </ul>
          </div>

          {/* Account & Portal */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink)]">
              Landlord Portal
            </h4>
            <ul className="flex flex-col gap-2 text-xs">
              <li>
                <Link
                  to="/login"
                  className="transition hover:text-[var(--sea-ink)]"
                >
                  Sign In to Portal
                </Link>
              </li>
              <li>
                <Link
                  to="/signup"
                  className="transition hover:text-[var(--sea-ink)]"
                >
                  Create Landlord Account
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground">
                  Kathmandu Valley Property Support
                </span>
              </li>
              <li>
                <span className="text-muted-foreground">
                  Cash & Bank Verification
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-[var(--line)] pt-6 text-center text-xs sm:flex-row sm:text-left">
          <p className="m-0">
            &copy; {year} Ghar Bhandaa. All rights reserved.
          </p>
          <p className="island-kicker m-0">
            Room Rent Collection & Management for Nepal
          </p>
        </div>
      </div>
    </footer>
  )
}
