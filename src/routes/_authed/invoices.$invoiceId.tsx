import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { getInvoiceDetails } from '#/server/invoices.functions'
import { recordCashPaymentFn } from '#/server/payments.functions'
import { formatNpr } from '#/lib/money'
import { getTodayInKathmandu } from '#/lib/dates'

export const Route = createFileRoute('/_authed/invoices/$invoiceId')({
  loader: async ({ params }) => {
    return await getInvoiceDetails({ id: params.invoiceId })
  },
  component: InvoiceDetailsPage,
})

function InvoiceDetailsPage() {
  const { invoice, tenant, lease, room, property, lineItems, payments } = Route.useLoaderData()
  const router = useRouter()

  // Cash payment form states
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [amountNpr, setAmountNpr] = useState(0)
  const [paymentDate, setPaymentDate] = useState(() => getTodayInKathmandu())
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Calculations
  const totalPaidPaisa = payments.reduce((acc, p) => acc + p.amount, 0)
  const remainingPaisa = Math.max(0, invoice.amount - totalPaidPaisa)
  const remainingNpr = remainingPaisa / 100

  const handleOpenPaymentModal = () => {
    setAmountNpr(remainingNpr)
    setPaymentDate(getTodayInKathmandu())
    setError(null)
    setShowPaymentModal(true)
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (amountNpr <= 0) {
      setError('Payment amount must be greater than 0')
      return
    }

    if (amountNpr > remainingNpr) {
      setError(`Payment cannot exceed the remaining balance of ${formatNpr(remainingPaisa)}`)
      return
    }

    setSubmitting(true)

    try {
      await recordCashPaymentFn({
        invoiceId: invoice.id,
        amountNpr,
        confirmedAt: paymentDate,
      })
      setShowPaymentModal(false)
      router.invalidate()
    } catch (err: any) {
      setError(err?.message || 'Failed to record cash payment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-wrap">
      {/* Back link */}
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] mb-6">
        &larr; Back to Dashboard
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Invoice Details & Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Summary */}
          <div className="island-shell rounded-3xl p-6 md:p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="island-kicker">Invoice Period: {invoice.period}</span>
                <h2 className="display-title text-2xl font-bold text-[var(--sea-ink)] mt-1">
                  Invoice details
                </h2>
                <p className="text-xs text-[var(--sea-ink-soft)] mt-1">ID: {invoice.id}</p>
              </div>

              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                  invoice.status === 'paid'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : invoice.status === 'partial'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : invoice.status === 'overdue'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                {invoice.status}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-sm text-[var(--sea-ink-soft)]">
              <div>
                <strong>Due Date:</strong> {invoice.dueDate}
              </div>
              <div>
                <strong>Total Amount:</strong> <span className="font-bold text-[var(--sea-ink)]">{formatNpr(invoice.amount)}</span>
              </div>
              <div>
                <strong>Total Paid:</strong> <span className="font-bold text-[var(--palm)]">{formatNpr(totalPaidPaisa)}</span>
              </div>
              <div>
                <strong>Remaining Balance:</strong> <span className="font-bold text-red-600">{formatNpr(remainingPaisa)}</span>
              </div>
            </div>

            {/* Pay Action Button */}
            {invoice.status !== 'paid' && (
              <button
                onClick={handleOpenPaymentModal}
                className="mt-6 w-full sm:w-auto rounded-full bg-[var(--lagoon-deep)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#246f76] transition-transform hover:-translate-y-0.5 shadow-md"
              >
                Record Cash Payment
              </button>
            )}
          </div>

          {/* Line Items */}
          <div className="island-shell rounded-3xl p-6 md:p-8">
            <h3 className="text-lg font-bold text-[var(--sea-ink)] mb-4">Itemized charges</h3>
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] text-xs font-semibold uppercase text-[var(--sea-ink-soft)]">
                  <th className="py-2 px-3">Description</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)] text-[var(--sea-ink)]">
                {lineItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 px-3 font-medium">{item.description}</td>
                    <td className="py-3 px-3 capitalize text-xs text-[var(--sea-ink-soft)]">{item.kind}</td>
                    <td className="py-3 px-3 text-right font-semibold">{formatNpr(item.amount)}</td>
                  </tr>
                ))}
                <tr className="font-bold border-t-2 border-[var(--sea-ink)]">
                  <td colSpan={2} className="py-3 px-3 text-right">Grand Total:</td>
                  <td className="py-3 px-3 text-right text-[var(--lagoon-deep)]">{formatNpr(invoice.amount)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column: Tenant & Payments history */}
        <div className="space-y-6">
          {/* Tenant Card */}
          <div className="island-shell rounded-3xl p-6">
            <span className="island-kicker">Tenant</span>
            <h3 className="text-lg font-bold text-[var(--sea-ink)] mt-1 mb-3">{tenant?.name}</h3>
            <div className="text-sm text-[var(--sea-ink-soft)] space-y-2">
              <div><strong>Email:</strong> {tenant?.email}</div>
              {tenant?.phone && <div><strong>Phone:</strong> {tenant.phone}</div>}
              {room && (
                <div className="mt-4 pt-4 border-t border-[var(--line)]">
                  <div><strong>Room:</strong> {room.name}</div>
                  <div><strong>Property:</strong> {property?.name}</div>
                  <div><strong>Billing Day:</strong> {lease?.billingDay}th of month</div>
                </div>
              )}
            </div>
          </div>

          {/* Payments History Ledger */}
          <div className="island-shell rounded-3xl p-6">
            <span className="island-kicker">Ledger</span>
            <h3 className="text-lg font-bold text-[var(--sea-ink)] mt-1 mb-4">Payment history</h3>
            <div className="space-y-4">
              {payments.length > 0 ? (
                payments.map((p) => (
                  <div key={p.id} className="flex justify-between items-start text-xs border-b border-[var(--line)] pb-3">
                    <div>
                      <div className="font-bold text-[var(--sea-ink)] capitalize">{p.method} Payment</div>
                      <div className="text-[var(--sea-ink-soft)] mt-1">Confirmed: {p.confirmedAt}</div>
                      {p.gatewayRef && <div className="text-[var(--sea-ink-soft)] mt-0.5">Ref: {p.gatewayRef}</div>}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[var(--palm)]">{formatNpr(p.amount)}</div>
                      <span className="inline-flex rounded-full bg-green-50 border border-green-200 px-2 py-0.25 text-[10px] text-green-700 font-bold mt-1 uppercase">
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-sm text-[var(--sea-ink-soft)]">
                  No payment records registered for this invoice.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Record Cash Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
          <div className="island-shell w-full max-w-sm rounded-[2.5rem] p-6 sm:p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="island-kicker">Ledger</span>
                <h3 className="display-title text-2xl font-bold text-[var(--sea-ink)]">
                  Record Cash Payment
                </h3>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="rounded-full bg-white/40 dark:bg-black/20 p-2 text-[var(--sea-ink-soft)] hover:text-red-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                  Amount Received (NPR)
                </label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  max={remainingNpr}
                  value={amountNpr || ''}
                  onChange={(e) => setAmountNpr(parseFloat(e.target.value) || 0)}
                  className="mt-1 block w-full rounded-lg border border-[var(--line)] bg-white/50 px-3 py-2 text-sm text-[var(--sea-ink)] focus:outline-none"
                />
                <p className="text-[10px] text-[var(--sea-ink-soft)] mt-1">
                  Maximum allowed: {formatNpr(remainingPaisa)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                  Payment Date
                </label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-[var(--line)] bg-white/50 px-3 py-2 text-sm text-[var(--sea-ink)] focus:outline-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="rounded-full border border-[var(--chip-line)] bg-white/50 px-5 py-2 text-sm font-semibold text-[var(--sea-ink)] hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-[var(--palm)] px-6 py-2 text-sm font-semibold text-white hover:bg-[#224e35] disabled:opacity-50"
                >
                  {submitting ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
