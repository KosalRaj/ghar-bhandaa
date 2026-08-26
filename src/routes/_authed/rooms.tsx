import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { getRooms, createRoom, updateRoom } from '#/server/rooms.functions'
import { getProperties } from '#/server/properties.functions'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
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
import { Textarea } from '#/components/ui/textarea'
import {
  Select,
  SelectPopup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Alert, AlertDescription } from '#/components/ui/alert'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'
import { toastManager } from '#/components/ui/toast'
import { DoorOpen, Plus, Edit2, AlertCircle, Layers } from 'lucide-react'

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
  const [editingRoom, setEditingRoom] = useState<(typeof rooms)[0] | null>(null)

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
        data: {
          propertyId,
          name,
          floor: floor || null,
          description: description || null,
          isActive,
        },
      })
      resetForm()
      setShowAddModal(false)
      toastManager.add({
        type: 'success',
        title: 'Room Added',
        description: `Successfully added room ${name}.`,
      })
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
        data: {
          id: editingRoom.id,
          data: {
            name,
            floor: floor || null,
            description: description || null,
            isActive,
          },
        },
      })
      resetForm()
      setEditingRoom(null)
      toastManager.add({
        type: 'success',
        title: 'Room Updated',
        description: `Successfully updated room ${name}.`,
      })
      router.invalidate()
    } catch (err: any) {
      setError(err?.message || 'Failed to update room')
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (room: (typeof rooms)[0]) => {
    setEditingRoom(room)
    setName(room.name)
    setFloor(room.floor || '')
    setDescription(room.description || '')
    setIsActive(room.isActive)
    setError(null)
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

  const isModalOpen = showAddModal || editingRoom !== null

  return (
    <div className="page-wrap flex flex-col gap-8">
      {/* Heading */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="island-kicker">Assets</span>
          <h1 className="display-title text-3xl font-bold tracking-tight text-[var(--sea-ink)]">
            Rooms Registry
          </h1>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setShowAddModal(true)
          }}
          className="self-start md:self-auto rounded-full"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add Room
        </Button>
      </div>

      {/* Grid List */}
      {rooms.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Card
              key={room.id}
              className="rounded-3xl border-[var(--line)] flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <CardHeader className="p-6">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-[var(--palm)]/15 text-[var(--palm)]">
                      <DoorOpen className="size-5" aria-hidden="true" />
                    </div>
                    <CardTitle className="text-lg font-bold text-[var(--sea-ink)]">
                      Room {room.name}
                    </CardTitle>
                  </div>
                  <Badge
                    variant={room.isActive ? 'success' : 'error'}
                    className="font-bold uppercase text-[10px]"
                  >
                    {room.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <CardDescription className="text-xs font-semibold text-[var(--lagoon-deep)] mb-1">
                  Property: {room.propertyName}
                </CardDescription>
                {room.floor && (
                  <div className="flex items-center gap-1 text-xs text-[var(--sea-ink-soft)] font-medium mb-2">
                    <Layers className="size-3.5" aria-hidden="true" />
                    Floor: {room.floor}
                  </div>
                )}
                {room.description && (
                  <p className="text-xs text-[var(--sea-ink-soft)] italic mt-2 line-clamp-2">
                    "{room.description}"
                  </p>
                )}
              </CardHeader>
              <CardFooter className="flex justify-end border-t border-[var(--line)] p-4 bg-muted/20 rounded-b-3xl">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEdit(room)}
                  className="rounded-full text-xs"
                >
                  <Edit2 className="size-3.5" aria-hidden="true" />
                  Edit Room
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="rounded-3xl border-[var(--line)] p-8">
          <Empty>
            <EmptyMedia variant="icon">
              <DoorOpen className="text-muted-foreground" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No Rooms Registered</EmptyTitle>
              <EmptyDescription>
                No rental rooms or flats found. Click "Add Room" to configure your first unit.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </Card>
      )}

      {/* Add / Edit Modal */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) cancelForm()
        }}
      >
        <DialogPopup className="sm:max-w-md">
          <DialogHeader>
            <span className="island-kicker block mb-1">
              {editingRoom ? 'Edit' : 'Create'}
            </span>
            <DialogTitle>
              {editingRoom ? 'Edit Room' : 'Add Room'}
            </DialogTitle>
            <DialogDescription>
              {editingRoom
                ? 'Update unit naming, floor, and availability status.'
                : 'Configure a room or unit for tenancy.'}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={editingRoom ? handleEditSubmit : handleAddSubmit}
            className="contents"
          >
            <DialogPanel className="flex flex-col gap-4">
              {error && (
                <Alert variant="error">
                  <AlertCircle />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Property selection (only on creation) */}
              {!editingRoom && (
                <Field>
                  <FieldLabel>Property Selection</FieldLabel>
                  <Select
                    value={propertyId}
                    onValueChange={(val) => setPropertyId(val as string)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="-- Choose Property --" />
                    </SelectTrigger>
                    <SelectPopup>
                      {properties.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({p.address})
                        </SelectItem>
                      ))}
                    </SelectPopup>
                  </Select>
                </Field>
              )}

              <Field>
                <FieldLabel>Room Name / Number</FieldLabel>
                <Input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Room 101, Flat 2B"
                />
              </Field>

              <Field>
                <FieldLabel>Floor</FieldLabel>
                <Input
                  type="text"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  placeholder="e.g. Ground Floor, 2nd Floor"
                />
              </Field>

              <Field>
                <FieldLabel>Description (Optional)</FieldLabel>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Attached balcony, North-facing, sunny"
                  rows={3}
                />
              </Field>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-[var(--line)] text-[var(--lagoon-deep)] focus:ring-[var(--lagoon-deep)] cursor-pointer"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-semibold text-[var(--sea-ink)] cursor-pointer"
                >
                  Active (Available for leasing)
                </label>
              </div>
            </DialogPanel>

            <DialogFooter>
              <DialogClose
                render={
                  <Button variant="ghost" type="button" onClick={cancelForm}>
                    Cancel
                  </Button>
                }
              />
              <Button type="submit" loading={submitting}>
                {editingRoom ? 'Save Changes' : 'Create Room'}
              </Button>
            </DialogFooter>
          </form>
        </DialogPopup>
      </Dialog>
    </div>
  )
}
