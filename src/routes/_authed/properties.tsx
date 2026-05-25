import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { getProperties, createProperty, updateProperty } from '#/server/properties.functions'

export const Route = createFileRoute('/_authed/properties')({
  loader: async () => {
    return await getProperties()
  },
  component: PropertiesPage,
})

function PropertiesPage() {
  const properties = Route.useLoaderData()
  const router = useRouter()

  // Modal / Form States
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProperty, setEditingProperty] = useState<{ id: string; name: string; address: string } | null>(null)
  
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Submit Handler for Add
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await createProperty({ name, address })
      setName('')
      setAddress('')
      setShowAddModal(false)
      router.invalidate()
    } catch (err: any) {
      setError(err?.message || 'Failed to add property')
    } finally {
      setSubmitting(false)
    }
  }

  // Submit Handler for Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProperty) return
    setError(null)
    setSubmitting(true)

    try {
      await updateProperty({
        id: editingProperty.id,
        data: { name, address },
      })
      setEditingProperty(null)
      setName('')
      setAddress('')
      router.invalidate()
    } catch (err: any) {
      setError(err?.message || 'Failed to update property')
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (prop: typeof properties[0]) => {
    setEditingProperty(prop)
    setName(prop.name)
    setAddress(prop.address)
  }

  const cancelForm = () => {
    setShowAddModal(false)
    setEditingProperty(null)
    setName('')
    setAddress('')
    setError(null)
  }

  return (
    <div className="page-wrap">
      {/* Heading */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <span className="island-kicker">Assets</span>
          <h1 className="display-title text-3xl font-bold tracking-tight text-[var(--sea-ink)]">
            Properties Registry
          </h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-full bg-[var(--lagoon-deep)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#246f76] transition-transform hover:-translate-y-0.5 shadow-md"
        >
          + Add Property
        </button>
      </div>

      {/* Grid List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {properties.length > 0 ? (
          properties.map((prop) => (
            <div key={prop.id} className="island-shell rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-[var(--sea-ink)] mb-2">{prop.name}</h3>
                <p className="text-sm text-[var(--sea-ink-soft)] mb-4">{prop.address}</p>
              </div>
              <div className="flex justify-end gap-2 border-t border-[var(--line)] pt-4">
                <button
                  onClick={() => startEdit(prop)}
                  className="rounded-full border border-[var(--chip-line)] bg-white/50 px-4 py-1.5 text-xs font-semibold text-[var(--sea-ink)] hover:bg-white transition-colors"
                >
                  Edit Property
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="island-shell rounded-2xl p-8 col-span-full text-center text-[var(--sea-ink-soft)]">
            No properties registered. Click "+ Add Property" to create your first property asset.
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {(showAddModal || editingProperty) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
          <div className="island-shell w-full max-w-md rounded-[2.5rem] p-6 sm:p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="island-kicker">{editingProperty ? 'Edit' : 'Create'}</span>
                <h3 className="display-title text-2xl font-bold text-[var(--sea-ink)]">
                  {editingProperty ? 'Edit Property' : 'Add Property'}
                </h3>
              </div>
              <button
                onClick={cancelForm}
                className="rounded-full bg-white/40 dark:bg-black/20 p-2 text-[var(--sea-ink-soft)] hover:text-red-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={editingProperty ? handleEditSubmit : handleAddSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                  Property Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Lalita Niwas"
                  className="mt-1 block w-full rounded-lg border border-[var(--line)] bg-white/50 px-3 py-2 text-sm text-[var(--sea-ink)] focus:border-[var(--lagoon-deep)] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                  Address
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Baluwatar, Kathmandu"
                  className="mt-1 block w-full rounded-lg border border-[var(--line)] bg-white/50 px-3 py-2 text-sm text-[var(--sea-ink)] focus:border-[var(--lagoon-deep)] focus:bg-white focus:outline-none"
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
                  {submitting ? 'Saving...' : editingProperty ? 'Update Property' : 'Add Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
