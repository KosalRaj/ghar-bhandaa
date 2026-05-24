import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { getLeases, createLease, endLease } from '#/server/leases.functions'
import { getRooms } from '#/server/rooms.functions'
import { getTenants } from '#/server/tenants.functions'
import { formatNpr } from '#/lib/money'
import { getTodayInKathmandu } from '#/lib/dates'

export const Route = createFileRoute('/_authed/leases')({
  loader: async () => {
    const leasesList = await getLeases()
    const roomsList = await getRooms()
    const tenantsList = await getTenants()
    return {
      leases: leasesList,
      rooms: roomsList.filter((r) => r.isActive), // only active rooms can be leased
      tenants: tenantsList,
    }
  },
  component: LeasesPage,
})

function LeasesPage() {
  const { leases, rooms, tenants } = Route.useLoaderData()
  const router = useRouter()

  // Modal / Form States
  const [showAddModal, setShowAddModal] = useState(false)
  const [endingLeaseId, setEndingLeaseId] = useState<string | null>(null)

  const [roomId, setRoomId] = useState('')
  const [tenantId, setTenantId] = useState('')
  const [rentAmountNpr, setRentAmountNpr] = useState(0)
  const [depositAmountNpr, setDepositAmountNpr] = useState(0)
  const [billingDay, setBillingDay] = useState(1)
  const [startDate, setStartDate] = useState(() => getTodayInKathmandu())
  const [endDate, setEndDate] = useState('')
  const [closeDate, setCloseDate] = useState(() => getTodayInKathmandu())

  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Submit Handler for Add
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!roomId) {
      setError('Please select a room')
      return
    }
    if (!tenantId) {
      setError('Please select a tenant')
      return
    }
    if (rentAmountNpr <= 0) {
      setError('Rent amount must be greater than 0')
      return
    }

    setSubmitting(true)

    try {
      await createLease({
        roomId,
        tenantId,
        rentAmountNpr,
        depositAmountNpr,
        billingDay,
        startDate,
        endDate: endDate || null,
      })
      resetForm()
      setShowAddModal(false)
      router.invalidate()
    } catch (err: any) {
      setError(err?.message || 'Failed to create lease')
    } finally {
      setSubmitting(false)
    }
  }

  // Submit Handler for End Lease
  const handleEndSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!endingLeaseId) return
    setError(null)
    setSubmitting(true)

    try {
      await endLease({
        id: endingLeaseId,
        endDate: closeDate,
      })
      setEndingLeaseId(null)
      router.invalidate()
    } catch (err: any) {
      setError(err?.message || 'Failed to end lease')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setRoomId('')
    setTenantId('')
    setRentAmountNpr(0)
    setDepositAmountNpr(0)
    setBillingDay(1)
    setStartDate(getTodayInKathmandu())
    setEndDate('')
    setError(null)
  }

  const cancelForm = () => {
    resetForm()
    setShowAddModal(false)
    setEndingLeaseId(null)
  }

  return (
    <div className="page-wrap">
      {/* Heading */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <span className="island-kicker">Contracts</span>
          <h1 className="display-title text-3xl font-bold tracking-tight text-[var(--sea-ink)]">
            Leases Registry
          </h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-full bg-[var(--lagoon-deep)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#246f76] transition-transform hover:-translate-y-0.5 shadow-md"
        >
          + Create Lease
        </button>
      </div>

      {/* Leases Table */}
      <div className="island-shell rounded-3xl p-6 md:p-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--line)] text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                <th className="py-3 px-4">Tenant</th>
                <th className="py-3 px-4">Room & Property</th>
                <th className="py-3 px-4 text-right">Rent</th>
                <th className="py-3 px-4 text-right">Deposit</th>
                <th className="py-3 px-4 text-center">Billing Day</th>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] text-sm text-[var(--sea-ink)]">
              {leases.length > 0 ? (
                leases.map((lease) => (
                  <tr key={lease.id} className="hover:bg-white/20 transition-colors">
                    <td className="py-4 px-4 font-semibold">{lease.tenantName}</td>
                    <td className="py-4 px-4">
                      <span className="font-semibold">{lease.roomName}</span>
                      <span className="text-xs text-[var(--sea-ink-soft)] block">{lease.propertyName}</span>
                    </td>
                    <td className="py-4 px-4 text-right font-bold">{formatNpr(lease.rentAmount)}</td>
                    <td className="py-4 px-4 text-right">{formatNpr(lease.depositAmount)}</td>
                    <td className="py-4 px-4 text-center font-semibold">{lease.billingDay}</td>
                    <td className="py-4 px-4">
                      <div className="text-xs font-medium">Start: {lease.startDate}</div>
                      {lease.endDate && <div className="text-xs text-[var(--sea-ink-soft)]">End: {lease.endDate}</div>}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          lease.status === 'active'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}
                      >
                        {lease.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {lease.status === 'active' && (
                        <button
                          onClick={() => setEndingLeaseId(lease.id)}
                          className="rounded-full border border-red-200 bg-red-50/50 hover:bg-red-50 text-red-600 px-3 py-1 text-xs font-semibold transition-colors"
                        >
                          End Lease
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[var(--sea-ink-soft)]">
                    No leases registered. Click "+ Create Lease" to link a tenant to a room.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Lease Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
          <div className="island-shell w-full max-w-md rounded-[2.5rem] p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="island-kicker">Setup</span>
                <h3 className="display-title text-2xl font-bold text-[var(--sea-ink)]">
                  Create Lease Agreement
                </h3>
              </div>
              <button
                onClick={cancelForm}
                className="rounded-full bg-white/40 dark:bg-black/20 p-2 text-[var(--sea-ink-soft)] hover:text-red-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Room Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                  Select Room
                </label>
                <select
                  required
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-[var(--line)] bg-white/50 px-3 py-2 text-sm text-[var(--sea-ink)] focus:outline-none"
                >
                  <option value="">-- Choose Room --</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.propertyName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tenant Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                  Select Tenant
                </label>
                <select
                  required
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-[var(--line)] bg-white/50 px-3 py-2 text-sm text-[var(--sea-ink)] focus:outline-none"
                >
                  <option value="">-- Choose Tenant --</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Rent Amount */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                    Rent Amount (NPR / Month)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={rentAmountNpr || ''}
                    onChange={(e) => setRentAmountNpr(parseFloat(e.target.value) || 0)}
                    placeholder="12000"
                    className="mt-1 block w-full rounded-lg border border-[var(--line)] bg-white/50 px-3 py-2 text-sm text-[var(--sea-ink)] focus:outline-none"
                  />
                </div>

                {/* Deposit Amount */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                    Deposit (NPR)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={depositAmountNpr || ''}
                    onChange={(e) => setDepositAmountNpr(parseFloat(e.target.value) || 0)}
                    placeholder="12000"
                    className="mt-1 block w-full rounded-lg border border-[var(--line)] bg-white/50 px-3 py-2 text-sm text-[var(--sea-ink)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Billing Day */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                    Billing Day (1-28)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="28"
                    value={billingDay}
                    onChange={(e) => setBillingDay(parseInt(e.target.value) || 1)}
                    className="mt-1 block w-full rounded-lg border border-[var(--line)] bg-white/50 px-3 py-2 text-sm text-[var(--sea-ink)] focus:outline-none"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-[var(--line)] bg-white/50 px-3 py-2 text-sm text-[var(--sea-ink)] focus:outline-none"
                  />
                </div>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-[var(--line)] bg-white/50 px-3 py-2 text-sm text-[var(--sea-ink)] focus:outline-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="rounded-full border border-[var(--chip-line)] bg-white/50 px-5 py-2 text-sm font-semibold text-[var(--sea-ink)] hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-[var(--lagoon-deep)] px-6 py-2 text-sm font-semibold text-white hover:bg-[#246f76] disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Lease'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* End Lease Modal */}
      {endingLeaseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
          <div className="island-shell w-full max-w-sm rounded-[2.5rem] p-6 sm:p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="island-kicker">Closure</span>
                <h3 className="display-title text-2xl font-bold text-[var(--sea-ink)]">
                  Terminate Lease
                </h3>
              </div>
              <button
                onClick={cancelForm}
                className="rounded-full bg-white/40 dark:bg-black/20 p-2 text-[var(--sea-ink-soft)] hover:text-red-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEndSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                  Select End Date
                </label>
                <input
                  type="date"
                  required
                  value={closeDate}
                  onChange={(e) => setCloseDate(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-[var(--line)] bg-white/50 px-3 py-2 text-sm text-[var(--sea-ink)] focus:outline-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="rounded-full border border-[var(--chip-line)] bg-white/50 px-5 py-2 text-sm font-semibold text-[var(--sea-ink)] hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-red-600 px-6 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {submitting ? 'Ending...' : 'Terminate Lease'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
