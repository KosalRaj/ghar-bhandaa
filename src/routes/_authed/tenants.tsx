import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { getTenants, createTenant, updateTenant } from '#/server/tenants.functions'

export const Route = createFileRoute('/_authed/tenants')({
  loader: async () => {
    return await getTenants()
  },
  component: TenantsPage,
})

function TenantsPage() {
  const tenants = Route.useLoaderData()
  const router = useRouter()

  // Modal / Form States
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTenant, setEditingTenant] = useState<typeof tenants[0] | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Submit Handler for Add
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await createTenant({
        name,
        email,
        phone: phone || null,
        notes: notes || null,
      })
      resetForm()
      setShowAddModal(false)
      router.invalidate()
    } catch (err: any) {
      setError(err?.message || 'Failed to add tenant')
    } finally {
      setSubmitting(false)
    }
  }

  // Submit Handler for Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTenant) return
    setError(null)
    setSubmitting(true)

    try {
      await updateTenant({
        id: editingTenant.id,
        data: {
          name,
          email,
          phone: phone || null,
          notes: notes || null,
        },
      })
      resetForm()
      setEditingTenant(null)
      router.invalidate()
    } catch (err: any) {
      setError(err?.message || 'Failed to update tenant')
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (tenant: typeof tenants[0]) => {
    setEditingTenant(tenant)
    setName(tenant.name)
    setEmail(tenant.email)
    setPhone(tenant.phone || '')
    setNotes(tenant.notes || '')
  }

  const resetForm = () => {
    setName('')
    setEmail('')
    setPhone('')
    setNotes('')
    setError(null)
  }

  const cancelForm = () => {
    resetForm()
    setShowAddModal(false)
    setEditingTenant(null)
  }

  return (
    <div className="page-wrap">
      {/* Heading */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <span className="island-kicker">Renter Records</span>
          <h1 className="display-title text-3xl font-bold tracking-tight text-[var(--sea-ink)]">
            Tenants Registry
          </h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-full bg-[var(--lagoon-deep)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#246f76] transition-transform hover:-translate-y-0.5 shadow-md"
        >
          + Add Tenant
        </button>
      </div>

      {/* Grid List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tenants.length > 0 ? (
          tenants.map((tenant) => (
            <div key={tenant.id} className="island-shell rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-[var(--sea-ink)] mb-2">{tenant.name}</h3>
                <div className="text-sm text-[var(--sea-ink-soft)] space-y-1 mb-4">
                  <div><strong>Email:</strong> {tenant.email}</div>
                  {tenant.phone && <div><strong>Phone:</strong> {tenant.phone}</div>}
                  {tenant.notes && (
                    <div className="mt-2 text-xs italic bg-white/20 p-2 rounded-lg border border-[var(--line)]">
                      "{tenant.notes}"
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-[var(--line)] pt-4">
                <button
                  onClick={() => startEdit(tenant)}
                  className="rounded-full border border-[var(--chip-line)] bg-white/50 px-4 py-1.5 text-xs font-semibold text-[var(--sea-ink)] hover:bg-white transition-colors"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="island-shell rounded-2xl p-8 col-span-full text-center text-[var(--sea-ink-soft)]">
            No tenants registered. Click "+ Add Tenant" to onboard a tenant.
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {(showAddModal || editingTenant) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
          <div className="island-shell w-full max-w-md rounded-[2.5rem] p-6 sm:p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="island-kicker">{editingTenant ? 'Edit' : 'Create'}</span>
                <h3 className="display-title text-2xl font-bold text-[var(--sea-ink)]">
                  {editingTenant ? 'Edit Tenant' : 'Add Tenant'}
                </h3>
              </div>
              <button
                onClick={cancelForm}
                className="rounded-full bg-white/40 dark:bg-black/20 p-2 text-[var(--sea-ink-soft)] hover:text-red-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={editingTenant ? handleEditSubmit : handleAddSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ram Bahadur"
                  className="mt-1 block w-full rounded-lg border border-[var(--line)] bg-white/50 px-3 py-2 text-sm text-[var(--sea-ink)] focus:border-[var(--lagoon-deep)] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ram@example.com"
                  className="mt-1 block w-full rounded-lg border border-[var(--line)] bg-white/50 px-3 py-2 text-sm text-[var(--sea-ink)] focus:border-[var(--lagoon-deep)] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98XXXXXXXX"
                  className="mt-1 block w-full rounded-lg border border-[var(--line)] bg-white/50 px-3 py-2 text-sm text-[var(--sea-ink)] focus:border-[var(--lagoon-deep)] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional contact details, references, etc."
                  className="mt-1 block w-full rounded-lg border border-[var(--line)] bg-white/50 px-3 py-2 text-sm text-[var(--sea-ink)] focus:border-[var(--lagoon-deep)] focus:bg-white focus:outline-none"
                  rows={3}
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
                  {submitting ? 'Saving...' : editingTenant ? 'Update Tenant' : 'Add Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
