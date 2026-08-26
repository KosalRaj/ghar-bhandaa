import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import {
  getDashboardData,
  createManualInvoiceFn,
} from '#/server/invoices.functions'
import { getLeases } from '#/server/leases.functions'
import { formatNpr } from '#/lib/money'
import { getTodayInKathmandu, addDaysInKathmandu } from '#/lib/dates'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { Tabs, TabsList, TabsTab } from '#/components/ui/tabs'
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'
import { toastManager } from '#/components/ui/toast'
import {
  FileText,
  Plus,
  Trash2,
  AlertCircle,
  Receipt,
  ArrowRight,
} from 'lucide-react'

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
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'paid' | 'partial' | 'unpaid' | 'overdue'
  >('all')

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedLeaseId, setSelectedLeaseId] = useState('')
  const [period, setPeriod] = useState(() => {
    const today = getTodayInKathmandu() // YYYY-MM-DD
    return today.substring(0, 7) // YYYY-MM
  })
  const [dueDate, setDueDate] = useState(() => addDaysInKathmandu(7))
  const [lineItems, setLineItems] = useState<
    {
      description: string
      amountNpr: number
      kind: 'rent' | 'utility' | 'adjustment'
    }[]
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
    setLineItems([
      ...lineItems,
      { description: '', amountNpr: 0, kind: 'utility' },
    ])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const updateLineItem = (index: number, key: string, value: any) => {
    setLineItems(
      lineItems.map((item, i) =>
        i === index ? { ...item, [key]: value } : item,
      ),
    )
  }

  // Handle Manual Invoice Submission
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!selectedLeaseId) {
      setFormError('Please select an active lease')
      return
    }

    if (lineItems.some((item) => !item.description || item.amountNpr <= 0)) {
      setFormError(
        'All line items must have a description and an amount greater than 0',
      )
      return
    }

    setFormSubmitting(true)

    try {
      await createManualInvoiceFn({
        data: {
          leaseId: selectedLeaseId,
          period,
          dueDate,
          lineItems,
        },
      })
      setShowCreateModal(false)
      // Reset Form
      setSelectedLeaseId('')
      setLineItems([{ description: 'Rent', amountNpr: 0, kind: 'rent' }])
      toastManager.add({
        type: 'success',
        title: 'Invoice Created',
        description: `Successfully generated manual invoice for period ${period}.`,
      })
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
    <div className="page-wrap flex flex-col gap-8">
      {/* Dashboard Heading */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="island-kicker">Overview</span>
          <h1 className="display-title text-3xl font-bold tracking-tight text-[var(--sea-ink)]">
            Landlord Dashboard
          </h1>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="self-start md:self-auto rounded-full"
        >
          <Plus className="size-4" aria-hidden="true" />
          Raise Manual Invoice
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-[var(--line)]">
          <CardHeader className="p-5 pb-1">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
              Total Collected
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-[var(--palm)] mt-1">
              {formatNpr(stats.totalCollected)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-[var(--line)]">
          <CardHeader className="p-5 pb-1">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
              Total Outstanding
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-[var(--sea-ink)] mt-1">
              {formatNpr(stats.totalOutstanding)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-[var(--line)]">
          <CardHeader className="p-5 pb-1">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
              Active Leases
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-[var(--lagoon-deep)] mt-1">
              {stats.activeLeasesCount}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-red-200 bg-red-50/10 dark:bg-red-950/10">
          <CardHeader className="p-5 pb-1">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-destructive-foreground">
              Overdue Invoices
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-destructive mt-1">
              {stats.overdueInvoicesCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Invoices List */}
      <Card className="rounded-3xl border-[var(--line)] p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-[var(--sea-ink)]">
              Invoices Registry
            </h2>
            <p className="text-xs text-[var(--sea-ink-soft)]">
              View and track all generated rental invoices
            </p>
          </div>

          {/* Filters using COSS Tabs */}
          <Tabs
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val as any)}
          >
            <TabsList size="sm">
              <TabsTab value="all">All</TabsTab>
              <TabsTab value="paid">Paid</TabsTab>
              <TabsTab value="unpaid">Unpaid</TabsTab>
              <TabsTab value="partial">Partial</TabsTab>
              <TabsTab value="overdue">Overdue</TabsTab>
            </TabsList>
          </Tabs>
        </div>

        {/* Invoice Table */}
        {filteredInvoices.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Room & Property</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-semibold">{inv.period}</TableCell>
                  <TableCell>{inv.tenantName}</TableCell>
                  <TableCell>
                    <div className="font-medium">{inv.roomName}</div>
                    <div className="text-xs text-muted-foreground">
                      {inv.propertyName}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatNpr(inv.amount)}
                  </TableCell>
                  <TableCell>{inv.dueDate}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        inv.status === 'paid'
                          ? 'success'
                          : inv.status === 'partial'
                            ? 'warning'
                            : inv.status === 'overdue'
                              ? 'error'
                              : 'secondary'
                      }
                      className="capitalize font-bold"
                    >
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      render={
                        <Link
                          to="/invoices/$invoiceId"
                          params={{ invoiceId: inv.id }}
                        >
                          Details <ArrowRight className="size-3.5" aria-hidden="true" />
                        </Link>
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Empty>
            <EmptyMedia variant="icon">
              <FileText className="text-muted-foreground" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No Invoices Found</EmptyTitle>
              <EmptyDescription>
                {statusFilter === 'all'
                  ? 'No invoices have been recorded yet. Click "Raise Manual Invoice" to create one.'
                  : `No invoices currently match the "${statusFilter}" filter.`}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </Card>

      {/* Manual Invoice Creation Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogPopup className="sm:max-w-xl">
          <DialogHeader>
            <span className="island-kicker block mb-1">Create</span>
            <DialogTitle>Raise Manual Invoice</DialogTitle>
            <DialogDescription>
              Issue a manual invoice with custom rent and utility line items.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateInvoice} className="contents">
            <DialogPanel className="flex flex-col gap-4">
              {formError && (
                <Alert variant="error">
                  <AlertCircle />
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              {/* Lease Selection */}
              <Field>
                <FieldLabel>Select Active Lease</FieldLabel>
                <Select
                  value={selectedLeaseId}
                  onValueChange={(val) => handleLeaseChange(val as string)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="-- Choose Lease --" />
                  </SelectTrigger>
                  <SelectPopup>
                    {leases.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.tenantName} — {l.roomName} ({l.propertyName})
                      </SelectItem>
                    ))}
                  </SelectPopup>
                </Select>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Period */}
                <Field>
                  <FieldLabel>Billing Period (YYYY-MM)</FieldLabel>
                  <Input
                    type="text"
                    required
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    placeholder="2026-05"
                  />
                </Field>

                {/* Due Date */}
                <Field>
                  <FieldLabel>Due Date</FieldLabel>
                  <Input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </Field>
              </div>

              {/* Line Items */}
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                    Invoice Line Items
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={addLineItem}
                  >
                    <Plus className="size-3.5" aria-hidden="true" />
                    Add Item
                  </Button>
                </div>

                <div className="flex flex-col gap-2.5">
                  {lineItems.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        type="text"
                        required
                        placeholder="Description (e.g. Rent, Electricity)"
                        value={item.description}
                        onChange={(e) =>
                          updateLineItem(index, 'description', e.target.value)
                        }
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        required
                        min="1"
                        placeholder="NPR"
                        value={item.amountNpr || ''}
                        onChange={(e) =>
                          updateLineItem(
                            index,
                            'amountNpr',
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="w-28"
                      />
                      <Select
                        value={item.kind}
                        onValueChange={(val) =>
                          updateLineItem(index, 'kind', val as string)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectPopup>
                          <SelectItem value="rent">Rent</SelectItem>
                          <SelectItem value="utility">Utility</SelectItem>
                          <SelectItem value="adjustment">Adjustment</SelectItem>
                        </SelectPopup>
                      </Select>
                      {lineItems.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Remove item"
                          onClick={() => removeLineItem(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </DialogPanel>

            <DialogFooter>
              <DialogClose
                render={
                  <Button variant="ghost" type="button">
                    Cancel
                  </Button>
                }
              />
              <Button type="submit" loading={formSubmitting}>
                <Receipt className="size-4" aria-hidden="true" />
                Raise Invoice
              </Button>
            </DialogFooter>
          </form>
        </DialogPopup>
      </Dialog>
    </div>
  )
}
