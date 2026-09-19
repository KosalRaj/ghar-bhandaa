import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Sparkles,
  Calculator,
  ShieldCheck,
  Calendar,
  Coins,
  Building2,
  Receipt,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  LayoutDashboard,
  LogIn,
  UserPlus,
} from 'lucide-react'
import { authClient } from '#/lib/auth-client'
import Header from '#/components/Header'
import Footer from '#/components/Footer'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { Field, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { AnimatedNumber } from '#/components/ui/animated-number'

export function LandingPage() {
  const { data: session } = authClient.useSession()

  // Interactive Rent Calculator State
  const [roomCount, setRoomCount] = useState<number>(4)
  const [rentPerRoom, setRentPerRoom] = useState<number>(15000)
  const [utilityPerRoom, setUtilityPerRoom] = useState<number>(500)

  // Financial calculations using exact integer paisa arithmetic
  const safeRoomCount = Math.max(1, isNaN(roomCount) ? 1 : roomCount)
  const safeRent = Math.max(0, isNaN(rentPerRoom) ? 0 : rentPerRoom)
  const safeUtility = Math.max(0, isNaN(utilityPerRoom) ? 0 : utilityPerRoom)

  const rentPaisa = safeRent * 100
  const utilityPaisa = safeUtility * 100
  const perRoomTotalPaisa = rentPaisa + utilityPaisa

  const monthlyCollectionPaisa = safeRoomCount * perRoomTotalPaisa
  const monthlyCollectionNpr = Math.floor(monthlyCollectionPaisa / 100)
  const annualRevenueNpr = monthlyCollectionNpr * 12

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1">
        {/* ================================================================= */}
        {/* HERO SECTION                                                      */}
        {/* ================================================================= */}
        <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8">
          {/* Subtle ambient gradient mesh in background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[var(--lagoon)] to-[var(--palm)] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            />
          </div>

          <div className="mx-auto max-w-5xl text-center">
            {/* Island kicker badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3.5 py-1 text-xs font-semibold text-[var(--sea-ink)] shadow-xs backdrop-blur-sm">
              <Sparkles className="size-3.5 text-[var(--lagoon-deep)]" />
              <span>Automated Room Rent Collection System</span>
            </div>

            {/* Headline */}
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-[var(--sea-ink)] sm:text-6xl sm:leading-tight">
              Effortless Room Rent Collection for{' '}
              <span className="bg-gradient-to-r from-[var(--lagoon-deep)] to-[var(--palm)] bg-clip-text text-transparent">
                Kathmandu Landlords
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-[var(--sea-ink-soft)] sm:text-xl">
              Eliminate lost paper records, manual calculation mistakes, and payment confusion.
              Automate monthly itemized invoices on Kathmandu time, track cash receipts with immutable ledgers,
              and guarantee zero float drift with exact integer paisa arithmetic.
            </p>

            {/* Prominent CTAs */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              {session?.user ? (
                <Link to="/dashboard">
                  <Button size="xl" className="rounded-full shadow-md">
                    <LayoutDashboard className="size-5" />
                    Open Landlord Dashboard
                    <ArrowRight className="size-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/signup">
                    <Button size="xl" className="rounded-full shadow-md">
                      <UserPlus className="size-5" />
                      Create Landlord Account
                      <ArrowRight className="size-5" />
                    </Button>
                  </Link>

                  <Link to="/login">
                    <Button size="xl" variant="outline" className="rounded-full">
                      <LogIn className="size-5" />
                      Sign In to Portal
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Trust Indicators Strip */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--sea-ink-soft)] sm:gap-8">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-medium">Exact Integer Paisa Arithmetic</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-medium">Asia/Kathmandu UTC+05:45 Cron</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-medium">Append-Only Cash Ledgers</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* INTERACTIVE RENT CALCULATOR WIDGET                                */}
        {/* ================================================================= */}
        <section id="calculator" className="scroll-mt-20 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <Card className="border-[var(--line)] shadow-xl/5 backdrop-blur-sm">
              <CardHeader className="border-b border-[var(--line)] bg-muted/20 pb-4">
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <Calculator className="size-5 text-[var(--lagoon-deep)]" />
                      <CardTitle className="text-xl font-bold text-[var(--sea-ink)] sm:text-2xl">
                        Interactive Rent & Revenue Estimator
                      </CardTitle>
                    </div>
                    <CardDescription className="mt-1 text-xs text-[var(--sea-ink-soft)] sm:text-sm">
                      Adjust your room count and rent rates to calculate live monthly collections and annual returns.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    Integer Paisa Engine
                  </Badge>
                </div>
              </CardHeader>

              <CardPanel className="p-6 sm:p-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  {/* Left Column: Interactive Inputs */}
                  <div className="flex flex-col gap-5">
                    <Field>
                      <FieldLabel htmlFor="calc-rooms">Number of Rental Rooms</FieldLabel>
                      <Input
                        id="calc-rooms"
                        type="number"
                        min="1"
                        max="100"
                        value={roomCount}
                        onChange={(e) => setRoomCount(parseInt(e.target.value, 10) || 0)}
                        placeholder="4"
                      />
                      <span className="text-[11px] text-muted-foreground">
                        Total occupied or available rental rooms in your property.
                      </span>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="calc-rent">Average Room Rent (NPR / Month)</FieldLabel>
                      <Input
                        id="calc-rent"
                        type="number"
                        step="500"
                        min="0"
                        value={rentPerRoom}
                        onChange={(e) => setRentPerRoom(parseInt(e.target.value, 10) || 0)}
                        placeholder="15000"
                      />
                      <span className="text-[11px] text-muted-foreground">
                        Base room rent excluding utilities (e.g. Rs. 15,000).
                      </span>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="calc-utility">
                        Water / Utility Surcharge (NPR / Room)
                      </FieldLabel>
                      <Input
                        id="calc-utility"
                        type="number"
                        step="100"
                        min="0"
                        value={utilityPerRoom}
                        onChange={(e) => setUtilityPerRoom(parseInt(e.target.value, 10) || 0)}
                        placeholder="500"
                      />
                      <span className="text-[11px] text-muted-foreground">
                        Shared water, waste, or electricity add-on per room.
                      </span>
                    </Field>
                  </div>

                  {/* Right Column: Live Projected Results */}
                  <div className="flex flex-col justify-between rounded-2xl border border-[var(--line)] bg-gradient-to-br from-muted/40 via-muted/10 to-transparent p-6">
                    <div className="flex flex-col gap-6">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                          Projected Monthly Collection
                        </span>
                        <div className="mt-1 flex items-baseline gap-1 text-3xl font-extrabold text-[var(--sea-ink)] sm:text-4xl">
                          <span>Rs.</span>
                          <AnimatedNumber
                            value={monthlyCollectionNpr.toLocaleString('en-US')}
                            className="font-bold text-[var(--sea-ink)]"
                          />
                        </div>
                        <p className="mt-1 text-[11px] text-[var(--sea-ink-soft)]">
                          Includes {safeRoomCount} room(s) @ Rs. {(safeRent + safeUtility).toLocaleString()} each
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-t border-[var(--line)] pt-4">
                        <div>
                          <span className="text-[11px] font-medium text-muted-foreground">
                            Annual Revenue
                          </span>
                          <div className="mt-0.5 text-lg font-bold text-foreground sm:text-xl">
                            Rs. <AnimatedNumber value={annualRevenueNpr.toLocaleString('en-US')} />
                          </div>
                        </div>

                        <div>
                          <span className="text-[11px] font-medium text-muted-foreground">
                            Exact Paisa Storage
                          </span>
                          <div className="mt-0.5 text-sm font-semibold font-mono text-[var(--lagoon-deep)] truncate">
                            <AnimatedNumber value={monthlyCollectionPaisa.toLocaleString('en-US')} />
                            <span className="text-xs font-normal"> p</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg bg-background/80 p-3 text-xs leading-relaxed text-muted-foreground border border-border">
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          <TrendingUp className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Zero Float Drift Guarantee</span>
                        </div>
                        <p className="mt-0.5 text-[11px]">
                          Amounts are stored in SQLite integer paisa (Rs. 1 = 100 paisa). Billing calculations will never lose a single paisa.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-2">
                      <Link to="/signup" className="w-full">
                        <Button className="w-full rounded-full" size="sm">
                          Start Managing {safeRoomCount} Rooms
                          <ArrowRight className="size-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardPanel>
            </Card>
          </div>
        </section>

        {/* ================================================================= */}
        {/* FEATURE HIGHLIGHTS (Staggered Cards)                             */}
        {/* ================================================================= */}
        <section id="features" className="scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            {/* Section Header */}
            <div className="text-center">
              <span className="island-kicker mb-2 block">Comprehensive Features</span>
              <h2 className="text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
                Engineered for Kathmandu Rental Realities
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[var(--sea-ink-soft)] sm:text-base">
                Everything required to keep your properties, rooms, tenant leases, and cash collections organized in one place.
              </p>
            </div>

            {/* 6 Staggered Feature Cards */}
            <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <Card className="stagger-item stagger-1 border-[var(--line)] shadow-xs transition hover:-translate-y-1 hover:shadow-md">
                <CardHeader>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Calendar className="size-5" />
                  </div>
                  <CardTitle className="mt-3 text-lg font-bold text-[var(--sea-ink)]">
                    Automated Invoicing
                  </CardTitle>
                  <CardDescription className="text-xs text-[var(--sea-ink-soft)]">
                    Cloudflare Cron triggers automatic monthly invoice generation on your specified billing day.
                  </CardDescription>
                </CardHeader>
                <CardPanel className="pt-0 text-xs leading-relaxed text-muted-foreground">
                  Invoices are itemized with room rent and custom utility line items, stamped with accurate due dates.
                </CardPanel>
              </Card>

              {/* Feature 2 */}
              <Card className="stagger-item stagger-2 border-[var(--line)] shadow-xs transition hover:-translate-y-1 hover:shadow-md">
                <CardHeader>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                    <Coins className="size-5" />
                  </div>
                  <CardTitle className="mt-3 text-lg font-bold text-[var(--sea-ink)]">
                    Integer Paisa Precision
                  </CardTitle>
                  <CardDescription className="text-xs text-[var(--sea-ink-soft)]">
                    Eliminate floating-point arithmetic errors across all rent calculations.
                  </CardDescription>
                </CardHeader>
                <CardPanel className="pt-0 text-xs leading-relaxed text-muted-foreground">
                  Every transaction and balance is maintained as an exact 64-bit integer paisa. 1 NPR = 100 paisa.
                </CardPanel>
              </Card>

              {/* Feature 3 */}
              <Card className="stagger-item stagger-3 border-[var(--line)] shadow-xs transition hover:-translate-y-1 hover:shadow-md">
                <CardHeader>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                    <Clock className="size-5" />
                  </div>
                  <CardTitle className="mt-3 text-lg font-bold text-[var(--sea-ink)]">
                    Asia/Kathmandu Timezone
                  </CardTitle>
                  <CardDescription className="text-xs text-[var(--sea-ink-soft)]">
                    Calibrated specifically to Nepal's UTC+05:45 timezone offset.
                  </CardDescription>
                </CardHeader>
                <CardPanel className="pt-0 text-xs leading-relaxed text-muted-foreground">
                  No billing-day skew or date slippage from UTC server environments. Due dates always reflect local calendar time.
                </CardPanel>
              </Card>

              {/* Feature 4 */}
              <Card className="stagger-item stagger-4 border-[var(--line)] shadow-xs transition hover:-translate-y-1 hover:shadow-md">
                <CardHeader>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Building2 className="size-5" />
                  </div>
                  <CardTitle className="mt-3 text-lg font-bold text-[var(--sea-ink)]">
                    Multi-Property & Rooms
                  </CardTitle>
                  <CardDescription className="text-xs text-[var(--sea-ink-soft)]">
                    Manage multiple rental buildings in Kathmandu, Lalitpur, or Bhaktapur.
                  </CardDescription>
                </CardHeader>
                <CardPanel className="pt-0 text-xs leading-relaxed text-muted-foreground">
                  Organize rooms with unique room numbers, floor levels, and individual baseline rent figures.
                </CardPanel>
              </Card>

              {/* Feature 5 */}
              <Card className="stagger-item stagger-5 border-[var(--line)] shadow-xs transition hover:-translate-y-1 hover:shadow-md">
                <CardHeader>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Receipt className="size-5" />
                  </div>
                  <CardTitle className="mt-3 text-lg font-bold text-[var(--sea-ink)]">
                    Append-Only Cash Ledger
                  </CardTitle>
                  <CardDescription className="text-xs text-[var(--sea-ink-soft)]">
                    Record in-person cash payments with instant receipts and audit logs.
                  </CardDescription>
                </CardHeader>
                <CardPanel className="pt-0 text-xs leading-relaxed text-muted-foreground">
                  Payments cannot be tampered with. Invoice statuses automatically transition from Issued to Paid.
                </CardPanel>
              </Card>

              {/* Feature 6 */}
              <Card className="stagger-item stagger-6 border-[var(--line)] shadow-xs transition hover:-translate-y-1 hover:shadow-md">
                <CardHeader>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Users className="size-5" />
                  </div>
                  <CardTitle className="mt-3 text-lg font-bold text-[var(--sea-ink)]">
                    Tenant & Lease Registry
                  </CardTitle>
                  <CardDescription className="text-xs text-[var(--sea-ink-soft)]">
                    Centralized directory of current tenants, leases, and emergency contacts.
                  </CardDescription>
                </CardHeader>
                <CardPanel className="pt-0 text-xs leading-relaxed text-muted-foreground">
                  Easily activate new leases, transition departing tenants, and track historical rent records over time.
                </CardPanel>
              </Card>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 3-STEP SETUP WORKFLOW GUIDE                                       */}
        {/* ================================================================= */}
        <section id="workflow" className="scroll-mt-20 border-y border-[var(--line)] bg-muted/15 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <span className="island-kicker mb-2 block">Simple 3-Step Setup</span>
              <h2 className="text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
                How Ghar Bhandaa Works
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--sea-ink-soft)] sm:text-base">
                Set up your rental business in minutes and let automated workflows handle the rest.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Step 1 */}
              <div className="relative flex flex-col items-center text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] text-xl font-extrabold text-[var(--sea-ink)] shadow-xs">
                  01
                </div>
                <h3 className="mt-5 text-lg font-bold text-[var(--sea-ink)]">
                  Add Properties & Rooms
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[var(--sea-ink-soft)]">
                  Define your buildings and configure rooms with custom identifiers, floor plans, and monthly rents.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative flex flex-col items-center text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] text-xl font-extrabold text-[var(--sea-ink)] shadow-xs">
                  02
                </div>
                <h3 className="mt-5 text-lg font-bold text-[var(--sea-ink)]">
                  Register Tenants & Leases
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[var(--sea-ink-soft)]">
                  Assign verified tenants to designated rooms. Set the monthly billing day and active lease duration.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative flex flex-col items-center text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] text-xl font-extrabold text-[var(--sea-ink)] shadow-xs">
                  03
                </div>
                <h3 className="mt-5 text-lg font-bold text-[var(--sea-ink)]">
                  Automate & Collect
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[var(--sea-ink-soft)]">
                  Invoices generate automatically on schedule. Log cash collections and watch balances recalculate instantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* BOTTOM CTA BANNER                                                 */}
        {/* ================================================================= */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl rounded-3xl border border-[var(--line)] bg-gradient-to-b from-[var(--chip-bg)] to-background p-8 text-center shadow-lg/5 sm:p-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
              Ready to automate your room rent collection?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[var(--sea-ink-soft)] sm:text-base">
              Join property owners across Kathmandu, Lalitpur, and Bhaktapur who rely on Ghar Bhandaa for stress-free monthly rent tracking.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {session?.user ? (
                <Link to="/dashboard">
                  <Button size="lg" className="rounded-full shadow-md">
                    <LayoutDashboard className="size-4" />
                    Open Landlord Dashboard
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/signup">
                    <Button size="lg" className="rounded-full shadow-md">
                      <UserPlus className="size-4" />
                      Create Free Landlord Account
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline" className="rounded-full">
                      <LogIn className="size-4" />
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[var(--sea-ink-soft)]">
              <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>Free to start · Zero credit card required · Full multi-tenant isolation</span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
