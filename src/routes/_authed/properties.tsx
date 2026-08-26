import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import {
  getProperties,
  createProperty,
  updateProperty,
} from '#/server/properties.functions'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
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
import { Alert, AlertDescription } from '#/components/ui/alert'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'
import { toastManager } from '#/components/ui/toast'
import { Building2, Plus, Edit2, AlertCircle, MapPin } from 'lucide-react'

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
  const [editingProperty, setEditingProperty] = useState<{
    id: string
    name: string
    address: string
  } | null>(null)

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
      await createProperty({
        data: { name, address },
      })
      setName('')
      setAddress('')
      setShowAddModal(false)
      toastManager.add({
        type: 'success',
        title: 'Property Added',
        description: `Successfully added ${name}.`,
      })
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
        data: {
          id: editingProperty.id,
          data: { name, address },
        },
      })
      setEditingProperty(null)
      setName('')
      setAddress('')
      toastManager.add({
        type: 'success',
        title: 'Property Updated',
        description: `Successfully updated ${name}.`,
      })
      router.invalidate()
    } catch (err: any) {
      setError(err?.message || 'Failed to update property')
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (prop: (typeof properties)[0]) => {
    setEditingProperty(prop)
    setName(prop.name)
    setAddress(prop.address)
    setError(null)
  }

  const cancelForm = () => {
    setShowAddModal(false)
    setEditingProperty(null)
    setName('')
    setAddress('')
    setError(null)
  }

  const isModalOpen = showAddModal || editingProperty !== null

  return (
    <div className="page-wrap flex flex-col gap-8">
      {/* Heading */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="island-kicker">Assets</span>
          <h1 className="display-title text-3xl font-bold tracking-tight text-[var(--sea-ink)]">
            Properties Registry
          </h1>
        </div>
        <Button
          onClick={() => {
            setName('')
            setAddress('')
            setError(null)
            setShowAddModal(true)
          }}
          className="self-start md:self-auto rounded-full"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add Property
        </Button>
      </div>

      {/* Grid List */}
      {properties.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((prop) => (
            <Card
              key={prop.id}
              className="rounded-3xl border-[var(--line)] flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <CardHeader className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-xl bg-[var(--lagoon)]/15 text-[var(--lagoon-deep)]">
                    <Building2 className="size-5" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-lg font-bold text-[var(--sea-ink)]">
                    {prop.name}
                  </CardTitle>
                </div>
                <CardDescription className="text-sm flex items-start gap-1 text-[var(--sea-ink-soft)]">
                  <MapPin className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
                  {prop.address}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-end border-t border-[var(--line)] p-4 bg-muted/20 rounded-b-3xl">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEdit(prop)}
                  className="rounded-full text-xs"
                >
                  <Edit2 className="size-3.5" aria-hidden="true" />
                  Edit Property
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="rounded-3xl border-[var(--line)] p-8">
          <Empty>
            <EmptyMedia variant="icon">
              <Building2 className="text-muted-foreground" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No Properties Registered</EmptyTitle>
              <EmptyDescription>
                You haven't added any buildings or property assets yet. Click "Add Property" to create one.
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
              {editingProperty ? 'Edit' : 'Create'}
            </span>
            <DialogTitle>
              {editingProperty ? 'Edit Property' : 'Add Property'}
            </DialogTitle>
            <DialogDescription>
              {editingProperty
                ? 'Update property details and address.'
                : 'Register a new building or property asset for room allocation.'}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={editingProperty ? handleEditSubmit : handleAddSubmit}
            className="contents"
          >
            <DialogPanel className="flex flex-col gap-4">
              {error && (
                <Alert variant="error">
                  <AlertCircle />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Field>
                <FieldLabel>Property Name</FieldLabel>
                <Input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Baneshwor House, Lakeside Villa"
                />
              </Field>

              <Field>
                <FieldLabel>Address / Location</FieldLabel>
                <Input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. New Baneshwor, Kathmandu"
                />
              </Field>
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
                {editingProperty ? 'Save Changes' : 'Create Property'}
              </Button>
            </DialogFooter>
          </form>
        </DialogPopup>
      </Dialog>
    </div>
  )
}
