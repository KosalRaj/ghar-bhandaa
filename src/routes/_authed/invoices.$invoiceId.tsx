import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { getInvoiceDetails } from '#/server/invoices.functions'
import { recordCashPaymentFn } from '#/server/payments.functions'
import { formatNpr } from '#/lib/money'
import { getTodayInKathmandu } from '#/lib/dates'
import { cn } from '#/lib/utils'
import { Card, CardHeader, CardPanel, CardTitle } from '#/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Separator } from '#/components/ui/separator'
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from '#/components/ui/dialog'
import { Field, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { DatePicker } from '#/components/ui/date-picker'
import { toastManager } from '#/components/ui/toast'
import {
  ArrowLeft,
  Banknote,
  AlertCircle,
  CheckCircle2,
  Receipt,
  User,
} from 'lucide-react'

export const Route = createFileRoute('/_authed/invoices/$invoiceId')({
  loader: async ({ params }) => {
    return await getInvoiceDetails({ data: { id: params.invoiceId } })
  },
  component: InvoiceDetailsPage,
})

function InvoiceDetailsPage() {
  const { invoice, tenant, lease, room, property, lineItems, payments } =
    Route.useLoaderData()
  const router = useRouter()

  // Cash payment form states
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [amountNpr, setAmountNpr] = useState(0)
  const [paymentDate, setPaymentDate] = useState(() => getTodayInKathmandu())
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [isShaking, setIsShaking] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [lastRecordedPaymentPaisa, setLastRecordedPaymentPaisa] = useState<
    number | null
  >(null)

  // Calculations
  const totalPaidPaisa = payments.reduce((acc, p) => acc + p.amount, 0)
  const remainingPaisa = Math.max(0, invoice.amount - totalPaidPaisa)
  const remainingNpr = remainingPaisa / 100

  const triggerShake = () => {
    setIsShaking(false)
    requestAnimationFrame(() => {
      setIsShaking(true)
    })
  }

  const handleOpenPaymentModal = () => {
    setAmountNpr(remainingNpr)
    setPaymentDate(getTodayInKathmandu())
    setError(null)
    setIsShaking(false)
    setShowPaymentModal(true)
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (amountNpr <= 0) {
      setError('Payment amount must be greater than 0')
      triggerShake()
      return
    }

    if (amountNpr > remainingNpr) {
      setError(
        `Payment cannot exceed the remaining balance of ${formatNpr(remainingPaisa)}`,
      )
      triggerShake()
      return
    }

    setSubmitting(true)

    try {
      await recordCashPaymentFn({
        data: {
          invoiceId: invoice.id,
          amountNpr,
          confirmedAt: paymentDate,
        },
      })
      setLastRecordedPaymentPaisa(Math.round(amountNpr * 100))
      setShowPaymentModal(false)
      setShowSuccessModal(true)
      toastManager.add({
        type: 'success',
        title: 'Payment Recorded',
        description: `Successfully registered payment of ${formatNpr(amountNpr * 100)}.`,
      })
      router.invalidate()
    } catch (err: any) {
      setError(err?.message || 'Failed to record cash payment')
      triggerShake()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-wrap flex flex-col gap-6">
      {/* Back link */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          render={
            <Link to="/dashboard">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to Dashboard
            </Link>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Invoice Details & Items */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Invoice Summary Card */}
          <Card className="rounded-3xl border-[var(--line)] p-6 md:p-8">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
              <div>
                <span className="island-kicker">
                  Invoice Period: {invoice.period}
                </span>
                <h2 className="display-title text-2xl sm:text-3xl font-bold text-[var(--sea-ink)] mt-1">
                  Invoice details
                </h2>
                <p className="text-xs text-[var(--sea-ink-soft)] mt-1">
                  ID: {invoice.id}
                </p>
              </div>

              <Badge
                variant={
                  invoice.status === 'paid'
                    ? 'success'
                    : invoice.status === 'partial'
                      ? 'warning'
                      : invoice.status === 'overdue'
                        ? 'error'
                        : 'secondary'
                }
                size="lg"
                className="capitalize font-bold px-3 py-1"
              >
                {invoice.status}
              </Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-sm text-[var(--sea-ink-soft)] bg-white/40 dark:bg-black/20 p-4 rounded-2xl border border-[var(--line)]">
              <div>
                <span className="text-xs font-semibold uppercase block text-muted-foreground">
                  Due Date
                </span>
                <span className="font-semibold text-foreground">
                  {invoice.dueDate}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase block text-muted-foreground">
                  Total Amount
                </span>
                <span className="font-bold text-foreground text-base">
                  {formatNpr(invoice.amount)}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase block text-muted-foreground">
                  Total Paid
                </span>
                <span className="font-bold text-[var(--palm)] text-base">
                  {formatNpr(totalPaidPaisa)}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase block text-muted-foreground">
                  Remaining Balance
                </span>
                <span className="font-bold text-destructive text-base">
                  {formatNpr(remainingPaisa)}
                </span>
              </div>
            </div>

            {/* Pay Action Button */}
            {invoice.status !== 'paid' && (
              <div className="mt-6">
                <Button
                  onClick={handleOpenPaymentModal}
                  className="rounded-full"
                >
                  <Banknote className="size-4" aria-hidden="true" />
                  Record Cash Payment
                </Button>
              </div>
            )}
          </Card>

          {/* Line Items Card */}
          <Card className="rounded-3xl border-[var(--line)] p-6 md:p-8">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-lg">Itemized charges</CardTitle>
            </CardHeader>
            <CardPanel className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-xs">
                          {item.kind}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatNpr(item.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold border-t-2 border-[var(--line)]">
                    <TableCell colSpan={2} className="text-right">
                      Grand Total:
                    </TableCell>
                    <TableCell className="text-right text-[var(--lagoon-deep)] text-base">
                      {formatNpr(invoice.amount)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardPanel>
          </Card>
        </div>

        {/* Right column: Tenant & Payments history */}
        <div className="flex flex-col gap-6">
          {/* Tenant Card */}
          <Card className="rounded-3xl border-[var(--line)] p-6">
            <span className="island-kicker">Tenant</span>
            <CardTitle className="text-lg mt-1 mb-3 flex items-center gap-2">
              <User
                className="size-4 text-[var(--lagoon-deep)]"
                aria-hidden="true"
              />
              {tenant?.name}
            </CardTitle>
            <div className="text-sm text-[var(--sea-ink-soft)] space-y-2">
              <div>
                <span className="text-xs uppercase text-muted-foreground block font-semibold">
                  Email
                </span>
                <span>{tenant?.email}</span>
              </div>
              {tenant?.phone && (
                <div>
                  <span className="text-xs uppercase text-muted-foreground block font-semibold">
                    Phone
                  </span>
                  <span>{tenant.phone}</span>
                </div>
              )}
              {room && (
                <>
                  <Separator className="my-3" />
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <strong className="text-foreground">Room:</strong>{' '}
                      {room.name}
                    </div>
                    <div>
                      <strong className="text-foreground">Property:</strong>{' '}
                      {property?.name}
                    </div>
                    <div>
                      <strong className="text-foreground">Billing Day:</strong>{' '}
                      {lease?.billingDay}th of month
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Payments History Ledger Card */}
          <Card className="rounded-3xl border-[var(--line)] p-6">
            <span className="island-kicker">Ledger</span>
            <CardTitle className="text-lg mt-1 mb-4 flex items-center gap-2">
              <Receipt
                className="size-4 text-[var(--lagoon-deep)]"
                aria-hidden="true"
              />
              Payment history
            </CardTitle>
            <div className="flex flex-col gap-3">
              {payments.length > 0 ? (
                payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-start text-xs border-b border-[var(--line)] pb-3 last:border-0"
                  >
                    <div>
                      <div className="font-bold text-[var(--sea-ink)] capitalize flex items-center gap-1.5">
                        <CheckCircle2
                          className="size-3.5 text-success"
                          aria-hidden="true"
                        />
                        {p.method} Payment
                      </div>
                      <div className="text-muted-foreground mt-1">
                        Confirmed: {p.confirmedAt}
                      </div>
                      {p.gatewayRef && (
                        <div className="text-muted-foreground mt-0.5">
                          Ref: {p.gatewayRef}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[var(--palm)] text-sm">
                        {formatNpr(p.amount)}
                      </div>
                      <Badge
                        variant="success"
                        size="sm"
                        className="mt-1 uppercase"
                      >
                        {p.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-sm text-[var(--sea-ink-soft)]">
                  No payment records registered for this invoice.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Record Cash Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogPopup className="sm:max-w-md">
          <DialogHeader>
            <span className="island-kicker block mb-1">Ledger</span>
            <DialogTitle>Record Cash Payment</DialogTitle>
            <DialogDescription>
              Record an in-person cash payment received from the tenant.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePaymentSubmit} className="contents">
            <DialogPanel className="flex flex-col gap-4">
              {error && (
                <Alert variant="error">
                  <AlertCircle />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Field>
                <FieldLabel>Amount Received (NPR)</FieldLabel>
                <div
                  className={cn(
                    'w-full transition-transform',
                    isShaking && 't-input-shake',
                  )}
                  onAnimationEnd={() => setIsShaking(false)}
                >
                  <Input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    max={remainingNpr}
                    value={amountNpr || ''}
                    onChange={(e) => {
                      setIsShaking(false)
                      setAmountNpr(parseFloat(e.target.value) || 0)
                    }}
                    className={cn(
                      isShaking &&
                        'border-destructive focus-visible:ring-destructive',
                    )}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Maximum allowable: {formatNpr(remainingPaisa)}
                </p>
              </Field>

              <Field>
                <FieldLabel>Payment Date</FieldLabel>
                <DatePicker
                  value={paymentDate}
                  onChange={setPaymentDate}
                  placeholder="Select payment date"
                />
              </Field>
            </DialogPanel>

            <DialogFooter>
              <DialogClose
                render={
                  <Button variant="ghost" type="button">
                    Cancel
                  </Button>
                }
              />
              <Button type="submit" loading={submitting}>
                <Banknote className="size-4" aria-hidden="true" />
                Record Payment
              </Button>
            </DialogFooter>
          </form>
        </DialogPopup>
      </Dialog>

      {/* Celebratory Payment Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogPopup className="sm:max-w-md text-center p-8">
          <div className="flex flex-col items-center justify-center gap-4 py-2">
            <span
              className="t-success-check"
              data-state="in"
              aria-label="Payment successful animation"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="size-16 text-emerald-500 stroke-emerald-500"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 13l4 4L19 7" pathLength={20} />
              </svg>
            </span>

            <div>
              <DialogTitle className="display-title text-2xl font-bold text-[var(--sea-ink)]">
                Payment Recorded!
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1.5">
                {lastRecordedPaymentPaisa !== null
                  ? `Successfully collected ${formatNpr(lastRecordedPaymentPaisa)} in cash.`
                  : 'Cash payment registered and ledger updated.'}
              </DialogDescription>
            </div>

            <Button
              onClick={() => setShowSuccessModal(false)}
              className="rounded-full px-8 mt-2"
            >
              Done
            </Button>
          </div>
        </DialogPopup>
      </Dialog>
    </div>
  )
}
