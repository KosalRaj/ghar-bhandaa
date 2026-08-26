# Domain Invariants & Security Audit Report

**Project:** `ghar-bhandaa` (Automated Room Rent Collection System)  
**Date:** 2026-08-26  
**Auditor:** Teamwork Domain Invariants & Security Auditor  
**Integrity Mode:** Full Static Code & Invariant Audit  

---

## 1. Executive Summary & Scope

A comprehensive security, authorization, and domain invariant audit was performed on the `ghar-bhandaa` codebase. The system is designed as an automated rent collection platform built on TanStack Start (React), Cloudflare Workers, Cloudflare D1 (SQLite via Drizzle ORM), and Better Auth.

### Core Architectural Invariants Audited:
1. **Nepal / Kathmandu (`Asia/Kathmandu`, UTC+05:45) Timezone Handling**: Billing cycles, due dates, date strings, and Bikram Sambat (BS) / Gregorian (AD) calendar requirements.
2. **Monetary Amounts & Integer Paisa Arithmetic**: Paisa-based storage, precision guarantees, and elimination of floating-point arithmetic errors.
3. **Append-Only Payment Ledgers & Financial Integrity**: Non-destructive payment recording, transactional guarantees, and receipt generation.
4. **Derived Invoice Statuses**: Deterministic calculation of invoice lifecycle statuses (`paid`, `partial`, `overdue`, `unpaid`) from confirmed ledger rows.
5. **Multi-Tenant Isolation & Landlord Authorization**: Server function middleware security, cross-tenant IDOR barriers, and tenant data confidentiality.

### Audit Summary:
| Audit Area | Status | Findings |
|---|---|---|
| **Paisa Arithmetic** | PASS WITH GAPS | Minor units stored as integers across all tables. Gaps in Zod validation allowing fractional paisa inputs. |
| **Timezone (+05:45)** | PASS WITH GAPS | Server date helpers use `Asia/Kathmandu`. Client dashboard uses browser `new Date()` causing potential 1-day drift. BS converter missing. |
| **Payment Ledger** | PASS WITH GAPS | Strictly append-only. Backend lacks remaining balance check, allowing unbounded cash overpayments. |
| **Derived Statuses** | PASS WITH BUGS | Centralized in `recalculateInvoiceStatus`. Partially paid invoices past due date remain stuck in `partial` status instead of `overdue`. |
| **Multi-Tenancy Auth** | PASS WITH VULNERABILITIES | `landlordAuthMiddleware` protects all endpoints. Critical IDOR gaps in `createRoom` and `createLease` allow cross-landlord foreign key binding. |

---

## 2. Deep Dive: Nepal / Kathmandu (+05:45) Timezone & Calendar Handling

### 2.1 Server-Side Date Helpers (`src/lib/dates.ts`)
```typescript
export function getTodayInKathmandu(): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kathmandu',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const parts = formatter.formatToParts(new Date())
  const year = parts.find((p) => p.type === 'year')?.value
  const month = parts.find((p) => p.type === 'month')?.value
  const day = parts.find((p) => p.type === 'day')?.value
  return `${year}-${month}-${day}`
}
```

- **Analysis**:
  - `getTodayInKathmandu` correctly formats the current date in `Asia/Kathmandu` into ISO standard `YYYY-MM-DD` format.
  - Workers runtime in Cloudflare provides full ICU timezone data for `Asia/Kathmandu`.
  - `getCurrentDateTimeInKathmandu` returns `new Date().toISOString()`, which complies with PLAN.md Section 5 ("All timestamps are stored as UTC ISO-8601 strings").
  - `isPastDateInKathmandu` performs a lexicographical comparison `dateStr < today`.

### 2.2 Date Invariant Vulnerabilities & Inconsistencies
1. **Client-Side Timezone Drift in UI Forms**:
   - **Location**: `src/routes/_authed/dashboard.tsx:36-38`
   - **Code**:
     ```typescript
     const [dueDate, setDueDate] = useState(() => {
       const today = new Date()
       today.setDate(today.getDate() + 7) // Default 7 days due date
       return today.toISOString().split('T')[0]
     })
     ```
   - **Vulnerability**: In browser client components, `new Date()` runs in the client's local machine timezone. If a landlord is outside Nepal or accesses the system near midnight UTC offset boundary, `today.toISOString().split('T')[0]` returns the UTC date rather than the Kathmandu date, creating a 1-day date skew.
   - **Fix**: Centralize date arithmetic in `src/lib/dates.ts` with a helper `addDaysInKathmandu(days: number)` or initialize from `getTodayInKathmandu()`.

2. **Unvalidated Date String Formats in Zod Schemas**:
   - **Location**: `src/schemas/invoices.ts:12`, `src/schemas/leases.ts:9-10`, `src/schemas/payments.ts:6`
   - **Vulnerability**: `dueDate`, `startDate`, `endDate`, and `confirmedAt` are typed as `z.string().min(1)` without strict `YYYY-MM-DD` regex validation.
   - Lexicographical comparison `dateStr < today` in `isPastDateInKathmandu` will fail silently if non-padded dates (e.g. `2026-5-9` instead of `2026-05-09`) are submitted.
   - **Fix**: Enforce `z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format')` on all date fields.

3. **Bikram Sambat (BS) Calendar Integration**:
   - **Observation**: Rental contracts and monthly billing periods in Nepal predominantly follow Bikram Sambat calendar months (Baisakh to Chaitra).
   - The current schema stores period as Gregorian `YYYY-MM` and dates as Gregorian `YYYY-MM-DD`.
   - **Recommendation**: Provide a pure TypeScript BS/AD conversion utility (`src/lib/bikram-sambat.ts`) to allow displaying BS calendar months (e.g., `२०८३ जेठ` / `2083-02`) on invoices and tenant portals while keeping Gregorian ISO strings in the database layer.

---

## 3. Deep Dive: Monetary Amounts & Integer Paisa Arithmetic

### 3.1 Currency Conversion Utilities (`src/lib/money.ts`)
```typescript
export function nprToPaisa(npr: number): number {
  return Math.round(npr * 100)
}

export function paisaToNpr(paisa: number): number {
  return paisa / 100
}

export function formatNpr(paisa: number): string {
  const npr = paisaToNpr(paisa)
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 2,
  }).format(npr)
}
```

- **Analysis**:
  - `nprToPaisa` uses `Math.round(npr * 100)` to guard against floating-point IEEE-754 precision issues (e.g., `12000.50 * 100 = 1200050.0000000002`).
  - All database columns (`leases.rent_amount`, `leases.deposit_amount`, `invoices.amount`, `invoice_line_items.amount`, `payments.amount`) are integer types storing minor units (paisa).
  - No database arithmetic or column uses floating-point types.

### 3.2 Monetary Invariant Inconsistencies & Precision Gaps
1. **Arbitrary Decimal Input Precision in Schemas**:
   - **Location**: `src/schemas/leases.ts:6-7`, `src/schemas/invoices.ts:5`, `src/schemas/payments.ts:5`
   - **Issue**: `z.number().positive()` accepts numbers with arbitrary fractional digits (e.g., `12000.5559`). `Math.round` silently coerces this to integer paisa.
   - **Fix**: Add `.multipleOf(0.01)` or `.refine((v) => Number.isInteger(Math.round(v * 100)))` in Zod schemas.

2. **Denormalized Invoice Total Verification**:
   - **Location**: `src/lib/invoices.server.ts:84-95`
   - **Verification**: In `createManualInvoice`, line items are individually converted to paisa via `nprToPaisa(item.amountNpr)` and summed:
     `totalAmountPaisa += amountPaisa`
     The invoice total is assigned `amount: totalAmountPaisa`. This guarantees exact integer summation where `sum(lineItems.amount) === invoices.amount`.

---

## 4. Deep Dive: Append-Only Payment Ledgers & Financial Integrity

### 4.1 Immutability of `payments` Table
- **Audit Result**: Zero `update(payments)` or `delete(payments)` queries exist in the codebase.
- In `src/db/schema.ts:145-163`, `payments` has foreign keys to `landlords`, `invoices`, and `tenants` with default `onDelete: 'no action'`.
- Deleting an invoice or tenant with existing payment records is rejected by SQLite foreign key constraints, preserving historical financial records.

### 4.2 Critical Financial Logic Gap: Unbounded Cash Overpayments
- **Location**: `src/lib/payments.server.ts:14-51` (`recordCashPayment`)
- **Vulnerability**:
  - The client UI in `src/routes/_authed/invoices.$invoiceId.tsx:47-50` enforces `amountNpr <= remainingNpr`.
  - However, the server function `recordCashPayment` performs **NO remaining balance validation**.
  - A client can submit a cash payment for an amount higher than the outstanding balance.
  - This corrupts the financial ledger, leads to negative invoice remaining balances, and distorts the landlord dashboard statistics.
- **Proposed Fix**:
  ```typescript
  // Inside recordCashPayment transaction in src/lib/payments.server.ts
  const existingPayments = await tx.query.payments.findMany({
    where: and(eq(payments.invoiceId, invoice.id), eq(payments.status, 'confirmed')),
  })
  const currentPaid = existingPayments.reduce((acc, p) => acc + p.amount, 0)
  const remainingPaisa = Math.max(0, invoice.amount - currentPaid)
  const paymentAmountPaisa = nprToPaisa(input.amountNpr)

  if (paymentAmountPaisa <= 0) {
    throw new Error('Payment amount must be greater than 0')
  }
  if (paymentAmountPaisa > remainingPaisa) {
    throw new Error(`Payment exceeds remaining balance of ${formatNpr(remainingPaisa)}`)
  }
  ```

---

## 5. Deep Dive: Derived Invoice Statuses & State Engine

### 5.1 Status Calculation Engine (`src/lib/invoices.server.ts:7-52`)
```typescript
export async function recalculateInvoiceStatus(db: Database, invoiceId: string): Promise<string> {
  const confirmedPayments = await db.query.payments.findMany({
    where: and(
      eq(payments.invoiceId, invoiceId),
      eq(payments.status, 'confirmed')
    ),
  })

  const totalPaid = confirmedPayments.reduce((acc, p) => acc + p.amount, 0)
  const invoice = await db.query.invoices.findFirst({
    where: eq(invoices.id, invoiceId),
  })

  if (!invoice) throw new Error(`Invoice with ID ${invoiceId} not found`)

  let newStatus: 'paid' | 'partial' | 'overdue' | 'unpaid' = 'unpaid'

  if (totalPaid >= invoice.amount) {
    newStatus = 'paid'
  } else if (totalPaid > 0) {
    newStatus = 'partial'
  } else {
    const today = getTodayInKathmandu()
    if (invoice.dueDate < today) {
      newStatus = 'overdue'
    } else {
      newStatus = 'unpaid'
    }
  }

  await db
    .update(invoices)
    .set({
      status: newStatus,
      updatedAt: getCurrentDateTimeInKathmandu(),
    })
    .where(eq(invoices.id, invoiceId))

  return newStatus
}
```

### 5.2 Status Invariant Bugs & Edge Cases

1. **Bug: Partially Paid Invoices Never Become Overdue**:
   - **Observation**: If an invoice has `0 < totalPaid < invoice.amount` and its `dueDate < today`, `recalculateInvoiceStatus` sets `newStatus = 'partial'` because `else if (totalPaid > 0)` is evaluated before the overdue check.
   - **Impact**:
     - Violates **FR-17**: *"An invoice not fully paid by its due date is reflected as `overdue`."*
     - In `getDashboardData` (`src/server/invoices.functions.ts:143`), `overdueInvoicesCount` ignores partially paid overdue invoices.
   - **Fix**: Re-order the precedence or differentiate partial overdue:
     ```typescript
     if (totalPaid >= invoice.amount) {
       newStatus = 'paid'
     } else if (invoice.dueDate < today) {
       newStatus = 'overdue'
     } else if (totalPaid > 0) {
       newStatus = 'partial'
     } else {
       newStatus = 'unpaid'
     }
     ```

2. **Bug: Flawed Outstanding Balance Formula in Dashboard**:
   - **Location**: `src/server/invoices.functions.ts:130-136`
   - **Code**:
     ```typescript
     let totalInvoiceAmountPaisa = 0
     for (const inv of allInvoices) {
       totalInvoiceAmountPaisa += inv.amount
     }
     const totalOutstandingPaisa = Math.max(0, totalInvoiceAmountPaisa - totalCollectedPaisa)
     ```
   - **Root Cause**: Subtracts global `totalCollectedPaisa` from global `totalInvoiceAmountPaisa`. If payments from prior periods or overpayments exist, they cancel out the outstanding balance of other unpaid invoices, causing the dashboard to show NPR 0 outstanding when invoices are actively unpaid.
   - **Fix**: Calculate outstanding balance per invoice:
     ```typescript
     const paidByInvoice = new Map<string, number>()
     for (const p of confirmedPayments) {
       paidByInvoice.set(p.invoiceId, (paidByInvoice.get(p.invoiceId) || 0) + p.amount)
     }
     let totalOutstandingPaisa = 0
     for (const inv of allInvoices) {
       const paid = paidByInvoice.get(inv.id) || 0
       totalOutstandingPaisa += Math.max(0, inv.amount - paid)
     }
     ```

3. **Temporal Invariant: Lazy Status Synchronization**:
   - Invoices that receive no payments remain in status `unpaid` in the database after their due date lapses until `recalculateInvoiceStatus` is explicitly triggered.
   - **Recommendation**: In Phase 2, the daily Cloudflare Cron Trigger must batch recalculate status for all non-`paid` invoices against `getTodayInKathmandu()`.

---

## 6. Deep Dive: Multi-Tenant Isolation & Authorization Security

### 6.1 Landlord Authorization Middleware (`src/middleware/auth.ts`)
- **Analysis**:
  - `landlordAuthMiddleware` is applied to **all 14 data-access server functions** in `src/server/*`.
  - Verifies Better Auth session headers and user existence in `landlords` table.
  - Injects `landlordId` and typed `db` into context.
  - Direct unauthenticated RPC/POST requests receive `401 Unauthorized` or `403 Forbidden`.

### 6.2 High-Severity IDOR Vulnerabilities Discovered

#### Vulnerability IDOR-1: Missing Property Ownership Validation in `createRoom`
- **Location**: `src/server/rooms.functions.ts:30-47`
- **Mechanism**:
  ```typescript
  export const createRoom = createServerFn({ method: 'POST' })
    .middleware([landlordAuthMiddleware])
    .inputValidator(createRoomSchema)
    .handler(async ({ data, context }) => {
      const { db, landlordId } = context
      const id = crypto.randomUUID()
      await db.insert(rooms).values({
        id,
        landlordId,
        propertyId: data.propertyId, // <-- NO OWNERSHIP CHECK ON propertyId
        name: data.name,
        floor: data.floor || null,
        description: data.description || null,
        isActive: data.isActive ?? true,
        createdAt: new Date().toISOString(),
      })
      return id
    })
  ```
- **Exploit Scenario**: Landlord A submits `createRoom` with `propertyId` belonging to Landlord B. The database inserts the room under Landlord A's `landlordId` with Landlord B's `propertyId`. When Landlord A queries `getRooms`, the query performs `innerJoin(properties, eq(rooms.propertyId, properties.id))` and leaks Landlord B's property name and address to Landlord A.
- **Fix**: Verify property ownership prior to room creation:
  ```typescript
  const property = await db.query.properties.findFirst({
    where: and(eq(properties.id, data.propertyId), eq(properties.landlordId, landlordId)),
  })
  if (!property) {
    throw new Error('Property not found or unauthorized')
  }
  ```

#### Vulnerability IDOR-2: Missing Room & Tenant Ownership Validation in `createLease`
- **Location**: `src/server/leases.functions.ts:37-61`
- **Mechanism**:
  `createLease` inserts a lease referencing `roomId` and `tenantId` without verifying that either entity belongs to the calling landlord.
- **Exploit Scenario**: Landlord A creates a lease with Landlord B's room and Landlord C's tenant. In `getLeases`, Landlord A's dashboard displays Landlord B's room/property and Landlord C's tenant PII (name, email address).
- **Fix**: Verify both `roomId` and `tenantId` belong to `landlordId`:
  ```typescript
  const [room, tenant] = await Promise.all([
    db.query.rooms.findFirst({
      where: and(eq(rooms.id, data.roomId), eq(rooms.landlordId, landlordId)),
    }),
    db.query.tenants.findFirst({
      where: and(eq(tenants.id, data.tenantId), eq(tenants.landlordId, landlordId)),
    }),
  ])
  if (!room || !tenant) {
    throw new Error('Room or tenant not found or unauthorized')
  }
  ```

### 6.3 Multi-Tenant Database Schema Flaw: Global `tenants.email` Unique Constraint
- **Location**: `src/db/schema.ts:90, 167`, `drizzle/0000_clear_punisher.sql:167`
- **Mechanism**: `email: text('email').notNull().unique()` creates a global unique constraint across the entire `tenants` table.
- **Impact**:
  - In a multi-landlord deployment, two independent landlords cannot onboard the same tenant email address (e.g. a tenant renting a storage unit from Landlord A and an apartment from Landlord B).
  - Enables a Denial-of-Service / Enumeration vector: a malicious actor can pre-register arbitrary email addresses as tenants to block legitimate landlords from onboarding them.
- **Fix**: Change from global unique index to composite unique index `(landlordId, email)`:
  ```typescript
  export const tenants = sqliteTable('tenants', {
    id: text('id').primaryKey(),
    landlordId: text('landlord_id').notNull().references(() => landlords.id),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    notes: text('notes'),
    createdAt: text('created_at').notNull(),
  }, (table) => [
    index('tenants_landlord_idx').on(table.landlordId),
    uniqueIndex('tenants_landlord_email_idx').on(table.landlordId, table.email),
  ])
  ```

---

## 7. Master Catalog of Issues, Invariant Violations & Security Loopholes

| ID | Title | Category | Severity | File Path & Lines | Impact & Recommended Fix |
|---|---|---|---|---|---|
| **SEC-01** | Cross-Tenant Property Association in `createRoom` | Authorization / IDOR | **HIGH** | `src/server/rooms.functions.ts:30-47` | Missing `properties.landlordId == landlordId` check. Add ownership query before room insert. |
| **SEC-02** | Cross-Tenant Room & Tenant Association in `createLease` | Authorization / IDOR | **HIGH** | `src/server/leases.functions.ts:37-61` | Missing ownership verification for `roomId` and `tenantId`. Add `where: and(..., eq(landlordId, landlordId))` validation. |
| **INV-01** | Global Outstanding Balance Calculation Error | Domain Invariant / Accounting | **HIGH** | `src/server/invoices.functions.ts:130-136` | Subtraction of global payments from total invoice sum corrupts outstanding balance. Calculate outstanding per invoice. |
| **FIN-01** | Missing Remaining Balance Check in `recordCashPayment` | Financial Integrity | **HIGH** | `src/lib/payments.server.ts:14-51` | Backend permits unbounded cash payments exceeding invoice amount. Add server-side balance limit check. |
| **INV-02** | Partially Paid Invoices Never Become Overdue | Domain Invariant / Lifecycle | **MEDIUM** | `src/lib/invoices.server.ts:29-41` | `totalPaid > 0` overrides `dueDate < today`. Reorder logic to flag past-due partial invoices as overdue. |
| **LOC-01** | Client-Side Date Construction Bypasses Kathmandu Timezone | Localization / Timezone | **MEDIUM** | `src/routes/_authed/dashboard.tsx:36-39` | `new Date().toISOString()` in client components causes 1-day date offset on UTC boundaries. Use `getTodayInKathmandu()`. |
| **VAL-01** | Missing Date Regex Validation in Schemas | Type Safety / Validation | **MEDIUM** | `src/schemas/invoices.ts:12`, `src/schemas/leases.ts:9-10`, `src/schemas/payments.ts:6` | Plain `z.string().min(1)` allows malformed dates, breaking lexicographical comparison. Add `YYYY-MM-DD` regex. |
| **SCH-01** | Global Unique Constraint on `tenants.email` | Multi-Tenancy / Schema | **MEDIUM** | `src/db/schema.ts:90, 167`, `drizzle/0000_clear_punisher.sql:167` | Blocks multiple landlords from having the same tenant. Replace with composite index `(landlordId, email)`. |
| **UI-01** | Duplicate Header Rendered in Authenticated Layout | UI / Layout | **LOW** | `src/routes/__root.tsx:85` & `src/routes/_authed.tsx:22` | Root `<Header />` and `<LandlordHeader />` stack on authed routes. Conditionally render header based on route context. |
| **AUTH-01** | Non-Atomic Registration Rollback | Transaction Safety | **LOW** | `src/server/auth.functions.ts:23-45` | Better Auth user creation happens outside DB transaction. Wrap with proper rollback handling if landlord insert fails. |
| **LNK-01** | Dead Link in `BetterAuthHeader` | Navigation / Routing | **LOW** | `src/integrations/better-auth/header-user.tsx:39` | Points to non-existent `/demo/better-auth`. Update link target to `/login`. |

---

## 8. Proposed Remediation Patches

### Patch 1: Secure `createRoom` & `createLease` with Landlord Verification
```typescript
// Proposed src/server/rooms.functions.ts (Lines 30-47)
export const createRoom = createServerFn({ method: 'POST' })
  .middleware([landlordAuthMiddleware])
  .inputValidator(createRoomSchema)
  .handler(async ({ data, context }) => {
    const { db, landlordId } = context

    // Verify property belongs to the authenticated landlord
    const property = await db.query.properties.findFirst({
      where: and(eq(properties.id, data.propertyId), eq(properties.landlordId, landlordId)),
    })
    if (!property) {
      throw new Error('Property not found or unauthorized')
    }

    const id = crypto.randomUUID()
    await db.insert(rooms).values({
      id,
      landlordId,
      propertyId: data.propertyId,
      name: data.name,
      floor: data.floor || null,
      description: data.description || null,
      isActive: data.isActive ?? true,
      createdAt: getCurrentDateTimeInKathmandu(),
    })
    return id
  })
```

```typescript
// Proposed src/server/leases.functions.ts (Lines 37-61)
export const createLease = createServerFn({ method: 'POST' })
  .middleware([landlordAuthMiddleware])
  .inputValidator(createLeaseSchema)
  .handler(async ({ data, context }) => {
    const { db, landlordId } = context

    // Verify room and tenant belong to the authenticated landlord
    const [room, tenant] = await Promise.all([
      db.query.rooms.findFirst({
        where: and(eq(rooms.id, data.roomId), eq(rooms.landlordId, landlordId)),
      }),
      db.query.tenants.findFirst({
        where: and(eq(tenants.id, data.tenantId), eq(tenants.landlordId, landlordId)),
      }),
    ])

    if (!room) {
      throw new Error('Room not found or unauthorized')
    }
    if (!tenant) {
      throw new Error('Tenant not found or unauthorized')
    }

    const id = crypto.randomUUID()
    const rentAmountPaisa = nprToPaisa(data.rentAmountNpr)
    const depositAmountPaisa = nprToPaisa(data.depositAmountNpr)

    await db.insert(leases).values({
      id,
      landlordId,
      roomId: data.roomId,
      tenantId: data.tenantId,
      rentAmount: rentAmountPaisa,
      depositAmount: depositAmountPaisa,
      billingDay: data.billingDay,
      startDate: data.startDate,
      endDate: data.endDate || null,
      status: 'active',
      createdAt: getCurrentDateTimeInKathmandu(),
    })
    return id
  })
```

### Patch 2: Fix Dashboard Outstanding Balance Calculation
```typescript
// Proposed src/server/invoices.functions.ts (Lines 123-137)
    // 2. Fetch all confirmed payments
    const confirmedPayments = await db.query.payments.findMany({
      where: and(eq(payments.landlordId, landlordId), eq(payments.status, 'confirmed')),
    })

    const totalCollectedPaisa = confirmedPayments.reduce((acc, p) => acc + p.amount, 0)

    // 3. Calculate outstanding balance per invoice
    const paymentsByInvoice = new Map<string, number>()
    for (const p of confirmedPayments) {
      paymentsByInvoice.set(p.invoiceId, (paymentsByInvoice.get(p.invoiceId) || 0) + p.amount)
    }

    let totalOutstandingPaisa = 0
    for (const inv of allInvoices) {
      const paid = paymentsByInvoice.get(inv.id) || 0
      totalOutstandingPaisa += Math.max(0, inv.amount - paid)
    }
```

### Patch 3: Secure `recordCashPayment` with Balance Validation
```typescript
// Proposed src/lib/payments.server.ts (Lines 14-51)
export async function recordCashPayment(
  db: Database,
  landlordId: string,
  input: RecordCashPaymentInput
) {
  return await db.transaction(async (tx) => {
    const invoice = await tx.query.invoices.findFirst({
      where: and(eq(invoices.id, input.invoiceId), eq(invoices.landlordId, landlordId)),
    })

    if (!invoice) {
      throw new Error(`Invoice not found or access denied`)
    }

    // Calculate current confirmed payments and remaining balance
    const existingPayments = await tx.query.payments.findMany({
      where: and(eq(payments.invoiceId, invoice.id), eq(payments.status, 'confirmed')),
    })
    const currentPaid = existingPayments.reduce((acc, p) => acc + p.amount, 0)
    const remainingPaisa = Math.max(0, invoice.amount - currentPaid)
    const paymentAmountPaisa = nprToPaisa(input.amountNpr)

    if (paymentAmountPaisa <= 0) {
      throw new Error('Payment amount must be greater than 0')
    }
    if (paymentAmountPaisa > remainingPaisa) {
      throw new Error(`Payment amount exceeds remaining balance of ${formatNpr(remainingPaisa)}`)
    }

    const paymentId = crypto.randomUUID()
    const nowStr = getCurrentDateTimeInKathmandu()

    await tx.insert(payments).values({
      id: paymentId,
      landlordId,
      invoiceId: invoice.id,
      tenantId: invoice.tenantId,
      amount: paymentAmountPaisa,
      method: 'cash',
      status: 'confirmed',
      createdAt: nowStr,
      confirmedAt: input.confirmedAt || nowStr,
    })

    await recalculateInvoiceStatus(tx, invoice.id)

    return paymentId
  })
}
```

---

## 9. Conclusion

The `ghar-bhandaa` codebase exhibits strong foundational patterns:
- Universal `landlordAuthMiddleware` attachment on all data-touching server functions.
- Integer paisa money storage with zero float columns in the database.
- Append-only payment ledger with transactional status updates.
- Centralized date formatting for Kathmandu timezone.

By applying the 11 targeted remediations identified above—specifically securing foreign key ownership in `createRoom`/`createLease`, bounding payment amounts in `recordCashPayment`, correcting the dashboard outstanding balance aggregation, and adjusting overdue status precedence—the system will achieve strict domain invariant compliance and complete multi-tenant security readiness.
