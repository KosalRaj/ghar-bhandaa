import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { getRooms, createRoom, updateRoom } from '#/server/rooms.functions'
import { getProperties } from '#/server/properties.functions'

export const Route = createFileRoute('/_authed/rooms')({
  loader: async () => {
    const roomsList = await getRooms()
    const propertiesList = await getProperties()
    return { rooms: roomsList, properties: propertiesList }
  },
  component: RoomsPage,
})

function RoomsPage() {
  const { rooms, properties } = Route.useLoaderData()
  const router = useRouter()

  // Modal / Form States
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState<typeof rooms[0] | null>(null)

  const [propertyId, setPropertyId] = useState('')
  const [name, setName] = useState('')
  const [floor, setFloor] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Submit Handler for Add
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!propertyId) {
      setError('Please select a property')
      return
    }

    setSubmitting(true)

    try {
      await createRoom({
        propertyId,
        name,
        floor: floor || null,
        description: description || null,
        isActive,
      })
      resetForm()
      setShowAddModal(false)
      router.invalidate()
    } catch (err: any) {
      setError(err?.message || 'Failed to add room')
    } finally {
      setSubmitting(false)
    }
  }

  // Submit Handler for Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRoom) return
    setError(null)
    setSubmitting(true)

    try {
      await updateRoom({
        id: editingRoom.id,
        data: {
          name,
          floor: floor || null,
          description: description || null,
          isActive,
        },
      })
      resetForm()
      setEditingRoom(null)
      router.invalidate()
    } catch (err: any) {
      setError(err?.message || 'Failed to update room')
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (room: typeof rooms[0]) => {
    setEditingRoom(room)
    setName(room.name)
    setFloor(room.floor || '')
    setDescription(room.description || '')
    setIsActive(room.isActive)
  }

  const resetForm = () => {
    setPropertyId('')
    setName('')
    setFloor('')
    setDescription('')
    setIsActive(true)
    setError(null)
  }

  const cancelForm = () => {
    resetForm()
    setShowAddModal(false)
    setEditingRoom(null)
  }

  return (
    <div className="page-wrap">
      {/* Heading */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <span className="island-kicker">Assets</span>
          <h1 className="display-title text-3xl font-bold tracking-tight text-[var(--sea-ink)]">
            Rooms Registry
          </h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-full bg-[var(--lagoon-deep)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#246f76] transition-transform hover:-translate-y-0.5 shadow-md"
        >
          + Add Room
        </button>
      </div>

      {/* Grid List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <div key={room.id} className="island-shell rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-[var(--sea-ink)]">Room {room.name}</h3>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                      room.isActive
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {room.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs text-[var(--lagoon-deep)] font-semibold mb-2">
                  Property: {room.propertyName}
                </p>
                {room.floor && (
                  <p className="text-xs text-[var(--sea-ink-soft)] mb-2 font-medium">
                    Floor: {room.floor}
                  </p>
                )}
                {room.description && (
                  <p className="text-sm text-[var(--sea-ink-soft)] mb-4 italic">
                    "{room.description}"
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2 border-t border-[var(--line)] pt-4">
                <button
                  onClick={() => startEdit(room)}
                  className="rounded-full border border-[var(--chip-line)] bg-white/50 px-4 py-1.5 text-xs font-semibold text-[var(--sea-ink)] hover:bg-white transition-colors"
                >
                  Edit Room
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="island-shell rounded-2xl p-8 col-span-full text-center text-[var(--sea-ink-soft)]">
            No rooms registered. Click "+ Add Room" to configure your first rent unit.
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {(showAddModal || editingRoom) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
          <div className="island-shell w-full max-w-md rounded-[2.5rem] p-6 sm:p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="island-kicker">{editingRoom ? 'Edit' : 'Create'}</span>
                <h3 className="display-title text-2xl font-bold text-[var(--sea-ink)]">
                  {editingRoom ? 'Edit Room' : 'Add Room'}
                </h3>
              </div>
              <button
                onClick={cancelForm}
                className="rounded-full bg-white/40 dark:bg-black/20 p-2 text-[var(--sea-ink-soft)] hover:text-red-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={editingRoom ? handleEditSubmit : handleAddSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Property selection (only on creation) */}
              {!editingRoom && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                    Property Selection
                  </label>
                  <select
                    required
                    value={propertyId}
                    onChange={(e) => setPropertyId(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-[var(--line)] bg-white/50 px-3 py-2 text-sm text-[var(--sea-ink)] focus:outline-none"
                  >
                    <option value="">-- Choose Property --</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.address})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                  Room Name / Number
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Room 101 / Flat A"
                  className="mt-1 block w-full rounded-lg border border-[var(--line)] bg-white/50 px-3 py-2 text-sm text-[var(--sea-ink)] focus:border-[var(--lagoon-deep)] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                  Floor
                </label>
                <input
                  type="text"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  placeholder="First Floor"
                  className="mt-1 block w-full rounded-lg border border-[var(--line)] bg-white/50 px-3 py-2 text-sm text-[var(--sea-ink)] focus:border-[var(--lagoon-deep)] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Attached bathroom, balcony, South-facing"
                  className="mt-1 block w-full rounded-lg border border-[var(--line)] bg-white/50 px-3 py-2 text-sm text-[var(--sea-ink)] focus:border-[var(--lagoon-deep)] focus:bg-white focus:outline-none"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-[var(--line)] text-[var(--lagoon-deep)] focus:ring-[var(--lagoon-deep)]"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-[var(--sea-ink)]">
                  Active (Ready to lease)
                </label>
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
                  {submitting ? 'Saving...' : editingRoom ? 'Update Room' : 'Add Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
