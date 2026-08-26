import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import {
  getTenants,
  createTenant,
  updateTenant,
} from '#/server/tenants.functions'
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Avatar, AvatarFallback } from '#/components/ui/avatar'
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
import { Alert, AlertDescription } from '#/components/ui/alert'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'
import { toastManager } from '#/components/ui/toast'
import { Users, Plus, Edit2, AlertCircle, Mail, Phone } from 'lucide-react'

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
  const [editingTenant, setEditingTenant] = useState<
    (typeof tenants)[0] | null
  >(null)

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
        data: {
          name,
          email,
          phone: phone || null,
          notes: notes || null,
        },
      })
      resetForm()
      setShowAddModal(false)
      toastManager.add({
        type: 'success',
        title: 'Tenant Registered',
        description: `Successfully registered tenant ${name}.`,
      })
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
        data: {
          id: editingTenant.id,
          data: {
            name,
            email,
            phone: phone || null,
            notes: notes || null,
          },
        },
      })
      resetForm()
      setEditingTenant(null)
      toastManager.add({
        type: 'success',
        title: 'Tenant Updated',
        description: `Successfully updated tenant profile for ${name}.`,
      })
      router.invalidate()
    } catch (err: any) {
      setError(err?.message || 'Failed to update tenant')
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (tenant: (typeof tenants)[0]) => {
    setEditingTenant(tenant)
    setName(tenant.name)
    setEmail(tenant.email)
    setPhone(tenant.phone || '')
    setNotes(tenant.notes || '')
    setError(null)
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

  const isModalOpen = showAddModal || editingTenant !== null

  return (
    <div className="page-wrap flex flex-col gap-8">
      {/* Heading */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="island-kicker">Renter Records</span>
          <h1 className="display-title text-3xl font-bold tracking-tight text-[var(--sea-ink)]">
            Tenants Registry
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
          Add Tenant
        </Button>
      </div>

      {/* Grid List */}
      {tenants.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tenants.map((tenant) => {
            const initials = tenant.name
              ? tenant.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
              : 'T'

            return (
              <Card
                key={tenant.id}
                className="rounded-3xl border-[var(--line)] flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <CardHeader className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="size-10">
                      <AvatarFallback className="text-xs font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg font-bold text-[var(--sea-ink)]">
                        {tenant.name}
                      </CardTitle>
                      <div className="text-xs text-[var(--sea-ink-soft)] flex items-center gap-1">
                        <Mail className="size-3" aria-hidden="true" />
                        {tenant.email}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-[var(--sea-ink-soft)]">
                    {tenant.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="size-3.5 text-muted-foreground" aria-hidden="true" />
                        <span>{tenant.phone}</span>
                      </div>
                    )}
                    {tenant.notes && (
                      <div className="mt-2 text-xs italic bg-muted/40 p-2.5 rounded-xl border border-[var(--line)] text-foreground">
                        "{tenant.notes}"
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardFooter className="flex justify-end border-t border-[var(--line)] p-4 bg-muted/20 rounded-b-3xl">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(tenant)}
                    className="rounded-full text-xs"
                  >
                    <Edit2 className="size-3.5" aria-hidden="true" />
                    Edit Profile
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="rounded-3xl border-[var(--line)] p-8">
          <Empty>
            <EmptyMedia variant="icon">
              <Users className="text-muted-foreground" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No Tenants Registered</EmptyTitle>
              <EmptyDescription>
                You haven't onboarded any tenants yet. Click "Add Tenant" to register a tenant.
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
              {editingTenant ? 'Edit' : 'Create'}
            </span>
            <DialogTitle>
              {editingTenant ? 'Edit Tenant Profile' : 'Add Tenant'}
            </DialogTitle>
            <DialogDescription>
              {editingTenant
                ? 'Update contact details and tenant profile notes.'
                : 'Onboard a new tenant with email and phone.'}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={editingTenant ? handleEditSubmit : handleAddSubmit}
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
                <FieldLabel>Full Name</FieldLabel>
                <Input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ram Bahadur"
                />
              </Field>

              <Field>
                <FieldLabel>Email Address</FieldLabel>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ram@example.com"
                />
              </Field>

              <Field>
                <FieldLabel>Phone Number</FieldLabel>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98XXXXXXXX"
                />
              </Field>

              <Field>
                <FieldLabel>Notes / Emergency Contacts (Optional)</FieldLabel>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional contact details, ID references, etc."
                  rows={3}
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
                {editingTenant ? 'Save Changes' : 'Add Tenant'}
              </Button>
            </DialogFooter>
          </form>
        </DialogPopup>
      </Dialog>
    </div>
  )
}
