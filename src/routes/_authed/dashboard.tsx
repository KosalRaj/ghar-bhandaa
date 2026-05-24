import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { getDashboardData, createManualInvoiceFn } from '#/server/invoices.functions'
import { getLeases } from '#/server/leases.functions'
import { formatNpr } from '#/lib/money'
import { getTodayInKathmandu } from '#/lib/dates'

export const Route = createFileRoute('/_authed/dashboard')({
  loader: async () => {
    const dashboard = await getDashboardData()
    const leasesList = await getLeases()
    return {
      stats: dashboard.stats,
      invoices: dashboard.invoices,
      leases: leasesList.filter((l) => l.status === 'active'),
    }
  },
  component: DashboardPage,
})

function DashboardPage() {
  const { stats, invoices, leases } = Route.useLoaderData()
  const router = useRouter()

  // Filtering State
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'unpaid' | 'overdue'>('all')

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedLeaseId, setSelectedLeaseId] = useState('')
  const [period, setPeriod] = useState(() => {
    const today = getTodayInKathmandu() // YYYY-MM-DD
    return today.substring(0, 7) // YYYY-MM
  })
  const [dueDate, setDueDate] = useState(() => {
    const today = new Date()
    today.setDate(today.getDate() + 7) // Default 7 days due date
    return today.toISOString().split('T')[0]
  })
  const [lineItems, setLineItems] = useState<
    { description: string; amountNpr: number; kind: 'rent' | 'utility' | 'adjustment' }[]
  >([{ description: 'Rent', amountNpr: 0, kind: 'rent' }])

  const [formError, setFormError] = useState<string | null>(null)
  const [formSubmitting, setFormSubmitting] = useState(false)

  // Handle Lease Change to populate default rent amount
  const handleLeaseChange = (leaseId: string) => {
    setSelectedLeaseId(leaseId)
    const lease = leases.find((l) => l.id === leaseId)
    if (lease) {
      setLineItems([
        {
          description: `Rent - ${lease.roomName}`,
          amountNpr: lease.rentAmount / 100, // convert paisa to NPR
          kind: 'rent',
        },
      ])
    }
  }

  // Handle Add/Remove Line Items
  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', amountNpr: 0, kind: 'utility' }])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const updateLineItem = (index: number, key: string, value: any) => {
    setLineItems(
      lineItems.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    )
  }

  // Handle Manual Invoice Submission
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!selectedLeaseId) {
      setFormError('Please select a lease')
      return
    }

    if (lineItems.some((item) => !item.description || item.amountNpr <= 0)) {
      setFormError('All line items must have a description and an amount greater than 0')
      return
    }

    setFormSubmitting(true)

    try {
      await createManualInvoiceFn({
        leaseId: selectedLeaseId,
        period,
        dueDate,
        lineItems,
      })
      setShowCreateModal(false)
      // Reset Form
      setSelectedLeaseId('')
      setLineItems([{ description: 'Rent', amountNpr: 0, kind: 'rent' }])
      // Invalidate router cache to refresh statistics and lists
      router.invalidate()
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create invoice')
    } finally {
      setFormSubmitting(false)
    }
  }

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter === 'all') return true
    return inv.status === statusFilter
  })

  return (
    <div className="page-wrap">
      {/* Dashboard Heading */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <span className="island-kicker">Overview</span>
          <h1 className="display-title text-3xl font-bold tracking-tight text-[var(--sea-ink)]">
            Landlord Dashboard
          </h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="rounded-full bg-[var(--lagoon-deep)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#246f76] transition-transform hover:-translate-y-0.5 shadow-md self-start md:self-auto"
        >
          + Raise Manual Invoice
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="island-shell rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
            Total Collected
          </p>
          <p className="text-2xl font-bold text-[var(--palm)] mt-1">
            {formatNpr(stats.totalCollected)}
          </p>
        </div>

        <div className="island-shell rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
            Total Outstanding
          </p>
          <p className="text-2xl font-bold text-[var(--sea-ink)] mt-1">
            {formatNpr(stats.totalOutstanding)}
          </p>
        </div>

        <div className="island-shell rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
            Active Leases
          </p>
          <p className="text-2xl font-bold text-[var(--lagoon-deep)] mt-1">
            {stats.activeLeasesCount}
          </p>
        </div>

        <div className="island-shell rounded-2xl p-5 border-red-200 bg-red-50/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
            Overdue Invoices
          </p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {stats.overdueInvoicesCount}
          </p>
        </div>
      </div>

      {/* Invoices List */}
      <div className="island-shell rounded-3xl p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-lg font-bold text-[var(--sea-ink)]">Invoices Registry</h2>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-1 bg-white/40 dark:bg-black/20 p-1 rounded-xl border border-[var(--line)]">
            {(['all', 'paid', 'unpaid', 'partial', 'overdue'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                  statusFilter === filter
                    ? 'bg-[var(--lagoon-deep)] text-white shadow-sm'
                    : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Invoice Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--line)] text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Tenant</th>
                <th className="py-3 px-4">Room & Property</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] text-sm text-[var(--sea-ink)]">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/20 transition-colors">
                    <td className="py-4 px-4 font-semibold">{inv.period}</td>
                    <td className="py-4 px-4">{inv.tenantName}</td>
                    <td className="py-4 px-4">
                      <div className="font-semibold">{inv.roomName}</div>
                      <div className="text-xs text-[var(--sea-ink-soft)]">{inv.propertyName}</div>
                    </td>
                    <td className="py-4 px-4 text-right font-bold">{formatNpr(inv.amount)}</td>
                    <td className="py-4 px-4">{inv.dueDate}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          inv.status === 'paid'
                            ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/20 dark:text-green-400'
                            : inv.status === 'partial'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400'
                              : inv.status === 'overdue'
                                ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-400'
                                : 'bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to="/invoices/$invoiceId"
                        params={{ invoiceId: inv.id }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[var(--lagoon-deep)] hover:underline"
                      >
                        Details &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[var(--sea-ink-soft)]">
                    No invoices found matching status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Invoice Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
          <div className="island-shell w-full max-w-2xl rounded-[2.5rem] p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="island-kicker">Create</span>
                <h3 className="display-title text-2xl font-bold text-[var(--sea-ink)]">
                  Raise Manual Invoice
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-full bg-white/40 dark:bg-black/20 p-2 text-[var(--sea-ink-soft)] hover:text-red-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              {formError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
                  {formError}
                </div>
              )}

              {/* Lease Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                  Select Active Lease
                </label>
                <select
                  required
                  value={selectedLeaseId}
                  onChange={(e) => handleLeaseChange(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-[var(--line)] bg-white/50 px-3 py-2 text-sm text-[var(--sea-ink)] focus:border-[var(--lagoon-deep)] focus:bg-white focus:outline-none"
                >
                  <option value="">-- Choose Lease --</option>
                  {leases.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.tenantName} — {l.roomName} ({l.propertyName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Period */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                    Billing Period (YYYY-MM)
                  </label>
                  <input
                    type="text"
                    required
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    placeholder="2026-05"
                    className="mt-1 block w-full rounded-lg border border-[var(--line)] bg-white/50 px-3 py-2 text-sm text-[var(--sea-ink)] focus:border-[var(--lagoon-deep)] focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-[var(--line)] bg-white/50 px-3 py-2 text-sm text-[var(--sea-ink)] focus:border-[var(--lagoon-deep)] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                    Invoice Line Items
                  </label>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="text-xs font-semibold text-[var(--lagoon-deep)] hover:underline"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {lineItems.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        required
                        placeholder="Description (e.g. Rent, Water)"
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        className="flex-grow rounded-lg border border-[var(--line)] bg-white/50 px-3 py-2 text-sm text-[var(--sea-ink)] focus:border-[var(--lagoon-deep)]"
                      />
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="Amount (NPR)"
                        value={item.amountNpr || ''}
                        onChange={(e) => updateLineItem(index, 'amountNpr', parseFloat(e.target.value) || 0)}
                        className="w-28 rounded-lg border border-[var(--line)] bg-white/50 px-3 py-2 text-sm text-[var(--sea-ink)] focus:border-[var(--lagoon-deep)]"
                      />
                      <select
                        value={item.kind}
                        onChange={(e) => updateLineItem(index, 'kind', e.target.value)}
                        className="w-28 rounded-lg border border-[var(--line)] bg-white/50 px-3 py-2 text-sm text-[var(--sea-ink)] focus:border-[var(--lagoon-deep)]"
                      >
                        <option value="rent">Rent</option>
                        <option value="utility">Utility</option>
                        <option value="adjustment">Adjustment</option>
                      </select>
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          className="text-red-500 hover:text-red-700 text-sm px-2"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-full border border-[var(--chip-line)] bg-white/50 px-5 py-2 text-sm font-semibold text-[var(--sea-ink)] hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="rounded-full bg-[var(--lagoon-deep)] px-6 py-2 text-sm font-semibold text-white hover:bg-[#246f76] disabled:opacity-50"
                >
                  {formSubmitting ? 'Raising...' : 'Raise Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
