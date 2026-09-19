import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { getLeases, createLease, endLease } from '#/server/leases.functions'
import { getRooms } from '#/server/rooms.functions'
import { getTenants } from '#/server/tenants.functions'
import { formatNpr } from '#/lib/money'
import { getTodayInKathmandu } from '#/lib/dates'
import { Card, CardDescription, CardTitle } from '#/components/ui/card'
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
import {
  Select,
  SelectPopup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { DatePicker } from '#/components/ui/date-picker'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'
import { toastManager } from '#/components/ui/toast'
import { FileSignature, Plus, AlertCircle, Ban } from 'lucide-react'

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
        data: {
          roomId,
          tenantId,
          rentAmountNpr,
          depositAmountNpr,
          billingDay,
          startDate,
          endDate: endDate || null,
        },
      })
      resetForm()
      setShowAddModal(false)
      toastManager.add({
        type: 'success',
        title: 'Lease Created',
        description: 'New lease contract successfully initiated.',
      })
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
        data: {
          id: endingLeaseId,
          endDate: closeDate,
        },
      })
      setEndingLeaseId(null)
      toastManager.add({
        type: 'success',
        title: 'Lease Terminated',
        description: `Lease has been concluded as of ${closeDate}.`,
      })
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
    <div className="page-wrap flex flex-col gap-8">
      {/* Heading */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="island-kicker">Contracts</span>
          <h1 className="display-title text-3xl font-bold tracking-tight text-[var(--sea-ink)]">
            Leases Registry
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
          Create Lease
        </Button>
      </div>

      {/* Leases Card Table */}
      <Card className="rounded-3xl border-[var(--line)] p-6 md:p-8">
        <div className="mb-6">
          <CardTitle className="text-lg">Active & Historical Leases</CardTitle>
          <CardDescription className="text-xs">
            Manage tenancy agreements, recurring rent rates, and billing cycles.
          </CardDescription>
        </div>

        {leases.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant</TableHead>
                <TableHead>Room & Property</TableHead>
                <TableHead className="text-right">Rent</TableHead>
                <TableHead className="text-right">Deposit</TableHead>
                <TableHead className="text-center">Billing Day</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leases.map((lease) => (
                <TableRow key={lease.id}>
                  <TableCell className="font-semibold">
                    {lease.tenantName}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{lease.roomName}</div>
                    <div className="text-xs text-muted-foreground">
                      {lease.propertyName}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatNpr(lease.rentAmount)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatNpr(lease.depositAmount)}
                  </TableCell>
                  <TableCell className="text-center font-semibold">
                    Day {lease.billingDay}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-medium">
                      Start: {lease.startDate}
                    </div>
                    {lease.endDate && (
                      <div className="text-xs text-muted-foreground">
                        End: {lease.endDate}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        lease.status === 'active' ? 'success' : 'secondary'
                      }
                      className="capitalize font-bold"
                    >
                      {lease.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {lease.status === 'active' && (
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => setEndingLeaseId(lease.id)}
                        className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                      >
                        End Lease
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Empty>
            <EmptyMedia variant="icon">
              <FileSignature className="text-muted-foreground" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No Leases Registered</EmptyTitle>
              <EmptyDescription>
                No active or historic leases found. Click "Create Lease" to link
                a tenant to a room.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </Card>

      {/* Add Lease Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogPopup className="sm:max-w-lg">
          <DialogHeader>
            <span className="island-kicker block mb-1">Setup</span>
            <DialogTitle>Create Lease Agreement</DialogTitle>
            <DialogDescription>
              Assign an available room to a tenant with custom rent, deposit,
              and billing day.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="contents">
            <DialogPanel className="flex flex-col gap-4">
              {error && (
                <Alert variant="error">
                  <AlertCircle />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Room Selector */}
              <Field>
                <FieldLabel>Select Room</FieldLabel>
                <Select
                  items={rooms.map((r) => ({
                    label: `${r.name} (${r.propertyName})`,
                    value: r.id,
                  }))}
                  value={roomId}
                  onValueChange={(val) => setRoomId(val ? String(val) : '')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="-- Choose Room --" />
                  </SelectTrigger>
                  <SelectPopup>
                    {rooms.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name} ({r.propertyName})
                      </SelectItem>
                    ))}
                  </SelectPopup>
                </Select>
              </Field>

              {/* Tenant Selector */}
              <Field>
                <FieldLabel>Select Tenant</FieldLabel>
                <Select
                  items={tenants.map((t) => ({
                    label: `${t.name} (${t.email})`,
                    value: t.id,
                  }))}
                  value={tenantId}
                  onValueChange={(val) => setTenantId(val ? String(val) : '')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="-- Choose Tenant --" />
                  </SelectTrigger>
                  <SelectPopup>
                    {tenants.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} ({t.email})
                      </SelectItem>
                    ))}
                  </SelectPopup>
                </Select>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Rent Amount */}
                <Field>
                  <FieldLabel>Rent Amount (NPR / Month)</FieldLabel>
                  <Input
                    type="number"
                    required
                    min="1"
                    value={rentAmountNpr || ''}
                    onChange={(e) =>
                      setRentAmountNpr(parseFloat(e.target.value) || 0)
                    }
                    placeholder="12000"
                  />
                </Field>

                {/* Deposit Amount */}
                <Field>
                  <FieldLabel>Deposit Amount (NPR)</FieldLabel>
                  <Input
                    type="number"
                    required
                    min="0"
                    value={depositAmountNpr || ''}
                    onChange={(e) =>
                      setDepositAmountNpr(parseFloat(e.target.value) || 0)
                    }
                    placeholder="12000"
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Billing Day */}
                <Field>
                  <FieldLabel>Billing Day (1-28)</FieldLabel>
                  <Input
                    type="number"
                    required
                    min="1"
                    max="28"
                    value={billingDay}
                    onChange={(e) =>
                      setBillingDay(parseInt(e.target.value) || 1)
                    }
                  />
                </Field>

                {/* Start Date */}
                <Field>
                  <FieldLabel>Start Date</FieldLabel>
                  <DatePicker
                    value={startDate}
                    onChange={setStartDate}
                    placeholder="Select start date"
                  />
                </Field>
              </div>

              {/* End Date */}
              <Field>
                <FieldLabel>End Date (Optional)</FieldLabel>
                <DatePicker
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="Select end date (optional)"
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
                Create Lease
              </Button>
            </DialogFooter>
          </form>
        </DialogPopup>
      </Dialog>

      {/* End Lease Modal */}
      <Dialog
        open={endingLeaseId !== null}
        onOpenChange={(open) => {
          if (!open) cancelForm()
        }}
      >
        <DialogPopup className="sm:max-w-md">
          <DialogHeader>
            <span className="island-kicker block mb-1">Closure</span>
            <DialogTitle>Terminate Lease</DialogTitle>
            <DialogDescription>
              Mark this lease as terminated and set the closure date.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEndSubmit} className="contents">
            <DialogPanel className="flex flex-col gap-4">
              {error && (
                <Alert variant="error">
                  <AlertCircle />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Field>
                <FieldLabel>Termination Date</FieldLabel>
                <DatePicker
                  value={closeDate}
                  onChange={setCloseDate}
                  placeholder="Select termination date"
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
              <Button variant="destructive" type="submit" loading={submitting}>
                <Ban className="size-4" aria-hidden="true" />
                Terminate Lease
              </Button>
            </DialogFooter>
          </form>
        </DialogPopup>
      </Dialog>
    </div>
  )
}
