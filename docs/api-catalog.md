# API & Server Functions Catalog

This document provides a comprehensive reference of all server functions, RPC interfaces, Zod input validation schemas, authentication mechanisms, and public HTTP endpoints in the **`ghar-bhandaa`** system.

---

## 1. Overview & Protocol Architecture

### 1.1 Server Functions (RPC)

- Server functions are authored using TanStack Start's `createServerFn`.
- Client components invoke server functions via type-safe RPC:

  ```typescript
  // Client usage example:
  import { createProperty } from '#/server/properties.functions'

  const propertyId = await createProperty({
    data: {
      name: 'Lalita Niwas',
      address: 'Baluwatar, Kathmandu',
    },
  })
  ```

- **Authentication**: All data-access server functions enforce `landlordAuthMiddleware`. If a request is unauthenticated or the user is not registered as a landlord, the middleware halts execution and returns `401 Unauthorized` or `403 Forbidden`.
- **Validation**: Inputs are parsed with Zod schemas. Invalid payloads throw runtime validation errors before reaching handler logic.
- **Monetary Inputs**: API consumers provide currency values in Nepalese Rupees (NPR) with up to 2 decimal places (`.multipleOf(0.01)`). Server functions convert NPR to integer Paisa ($1\text{ NPR} = 100\text{ Paisa}$) before persistence.
- **Date Formats**: Dates are passed as `YYYY-MM-DD` strings, and billing periods as `YYYY-MM` strings.

---

## 2. Server Functions Catalog by Domain

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                 Server Functions Index                                   │
├─────────────┬──────────────────────────┬─────────┬──────────────────────┬────────────────┤
│ Domain      │ Function Name            │ Method  │ Auth / Middleware    │ Input Schema   │
├─────────────┼──────────────────────────┼─────────┼──────────────────────┼────────────────┤
│ Auth        │ `registerLandlord`       │ POST    │ Public               │ `z.object`     │
│ Auth        │ `checkLandlordAuth`      │ GET     │ Public (Session)     │ None           │
│ Properties  │ `getProperties`          │ GET     │ landlordAuth         │ None           │
│ Properties  │ `createProperty`         │ POST    │ landlordAuth         │ createProperty │
│ Properties  │ `updateProperty`         │ POST    │ landlordAuth         │ updateProperty │
│ Rooms       │ `getRooms`               │ GET     │ landlordAuth         │ None           │
│ Rooms       │ `createRoom`             │ POST    │ landlordAuth         │ createRoom     │
│ Rooms       │ `updateRoom`             │ POST    │ landlordAuth         │ updateRoom     │
│ Tenants     │ `getTenants`             │ GET     │ landlordAuth         │ None           │
│ Tenants     │ `createTenant`           │ POST    │ landlordAuth         │ createTenant   │
│ Tenants     │ `updateTenant`           │ POST    │ landlordAuth         │ updateTenant   │
│ Leases      │ `getLeases`              │ GET     │ landlordAuth         │ None           │
│ Leases      │ `createLease`            │ POST    │ landlordAuth         │ createLease    │
│ Leases      │ `endLease`               │ POST    │ landlordAuth         │ `z.object`     │
│ Invoices    │ `getInvoices`            │ GET     │ landlordAuth         │ None           │
│ Invoices    │ `getInvoiceDetails`      │ GET     │ landlordAuth         │ `z.object`     │
│ Invoices    │ `createManualInvoiceFn`  │ POST    │ landlordAuth         │ createInvoice  │
│ Invoices    │ `getDashboardData`       │ GET     │ landlordAuth         │ None           │
│ Payments    │ `recordCashPaymentFn`    │ POST    │ landlordAuth         │ recordPayment  │
└─────────────┴──────────────────────────┴─────────┴──────────────────────┴────────────────┘
```

---

### 2.1 Authentication Domain (`src/server/auth.functions.ts`)

#### `registerLandlord`

Registers a new landlord account by creating a Better Auth user identity and inserting a corresponding record into the `landlords` table within an atomic transaction.

- **Method**: `POST`
- **Authorization**: Public
- **Input Schema**:
  ```typescript
  z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional().nullable(),
  })
  ```
- **Return Type**: `Promise<{ success: boolean }>`
- **Side Effects**:
  - Creates Better Auth user in `user` and `account` tables.
  - Inserts row in `landlords` table with `id = user.id`.
- **Error Modes**:
  - `400 Bad Request`: Invalid email format or password $< 6$ characters.
  - `Error`: Duplicate email address already registered.
  - `Error`: Cloudflare D1 database unavailable.

---

#### `checkLandlordAuth`

Checks the current session status and verifies if the authenticated user is registered as a landlord. Used primarily by route guards (`_authed.tsx`).

- **Method**: `GET`
- **Authorization**: Public (inspects session headers)
- **Input**: None
- **Return Type**:
  ```typescript
  Promise<{
    authenticated: boolean
    user?: {
      id: string
      name: string
      email: string
      emailVerified: boolean
      image?: string | null
    }
    landlord?: {
      id: string
      name: string
      email: string
    }
    reason?: 'database_missing' | 'unauthenticated' | 'not_landlord'
  }>
  ```
- **Error Modes**: Non-throwing; returns `{ authenticated: false, reason }` when unauthenticated.

---

### 2.2 Properties Domain (`src/server/properties.functions.ts`)

#### `getProperties`

Retrieves all properties owned by the authenticated landlord, ordered by creation date descending.

- **Method**: `GET`
- **Authorization**: `landlordAuthMiddleware`
- **Input**: None
- **Return Type**: `Promise<Property[]>`
  ```typescript
  Array<{
    id: string
    landlordId: string
    name: string
    address: string
    createdAt: string
  }>
  ```

---

#### `createProperty`

Creates a new property asset under the authenticated landlord's account.

- **Method**: `POST`
- **Authorization**: `landlordAuthMiddleware`
- **Input Schema (`createPropertySchema`)**:
  ```typescript
  z.object({
    name: z.string().min(1, 'Property name is required'),
    address: z.string().min(1, 'Address is required'),
  })
  ```
- **Return Type**: `Promise<string>` (Newly generated Property UUID)
- **Side Effects**: Inserts a new row in `properties`.

---

#### `updateProperty`

Updates the name or address of an existing property owned by the authenticated landlord.

- **Method**: `POST`
- **Authorization**: `landlordAuthMiddleware`
- **Input Schema**:
  ```typescript
  z.object({
    id: z.string(),
    data: z.object({
      name: z.string().min(1).optional(),
      address: z.string().min(1).optional(),
    }),
  })
  ```
- **Return Type**: `Promise<string>` (Property UUID)
- **Multi-Tenant Guard**: Query includes `where: and(eq(properties.id, id), eq(properties.landlordId, landlordId))`.

---

### 2.3 Rooms Domain (`src/server/rooms.functions.ts`)

#### `getRooms`

Lists all rooms owned by the authenticated landlord, joined with the parent property name.

- **Method**: `GET`
- **Authorization**: `landlordAuthMiddleware`
- **Input**: None
- **Return Type**:
  ```typescript
  Promise<
    Array<{
      id: string
      propertyId: string
      propertyName: string
      name: string
      floor: string | null
      description: string | null
      isActive: boolean
      createdAt: string
    }>
  >
  ```

---

#### `createRoom`

Creates a new room under a specified property.

- **Method**: `POST`
- **Authorization**: `landlordAuthMiddleware`
- **Input Schema (`createRoomSchema`)**:
  ```typescript
  z.object({
    propertyId: z.string().min(1, 'Property is required'),
    name: z.string().min(1, 'Room name/number is required'),
    floor: z.string().optional(),
    description: z.string().optional(),
    isActive: z.boolean().default(true),
  })
  ```
- **Return Type**: `Promise<string>` (Room UUID)
- **Security Check (IDOR-1 Fix)**: Verifies that `properties.landlordId === context.landlordId` before inserting.
- **Error Modes**: Throws `'Property not found or unauthorized'` if `propertyId` does not belong to the landlord.

---

#### `updateRoom`

Updates room details (name, floor, description, active status).

- **Method**: `POST`
- **Authorization**: `landlordAuthMiddleware`
- **Input Schema**:
  ```typescript
  z.object({
    id: z.string(),
    data: z.object({
      name: z.string().min(1).optional(),
      floor: z.string().optional().nullable(),
      description: z.string().optional().nullable(),
      isActive: z.boolean().optional(),
    }),
  })
  ```
- **Return Type**: `Promise<string>` (Room UUID)
- **Multi-Tenant Guard**: Updates where `id = input.id AND landlordId = context.landlordId`.

---

### 2.4 Tenants Domain (`src/server/tenants.functions.ts`)

#### `getTenants`

Retrieves all tenant profiles registered under the authenticated landlord.

- **Method**: `GET`
- **Authorization**: `landlordAuthMiddleware`
- **Input**: None
- **Return Type**: `Promise<Tenant[]>`
  ```typescript
  Array<{
    id: string
    landlordId: string
    name: string
    email: string
    phone: string | null
    notes: string | null
    createdAt: string
  }>
  ```

---

#### `createTenant`

Registers a new tenant profile under the landlord's account.

- **Method**: `POST`
- **Authorization**: `landlordAuthMiddleware`
- **Input Schema (`createTenantSchema`)**:
  ```typescript
  z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    notes: z.string().optional(),
  })
  ```
- **Return Type**: `Promise<string>` (Tenant UUID)
- **Multi-Tenant Constraint (SCH-01 Fix)**: Enforced via composite unique index `(landlord_id, email)`. Multiple landlords can register the same tenant email address independently.

---

#### `updateTenant`

Updates tenant contact information or notes.

- **Method**: `POST`
- **Authorization**: `landlordAuthMiddleware`
- **Input Schema**:
  ```typescript
  z.object({
    id: z.string(),
    data: z.object({
      name: z.string().min(1).optional(),
      email: z.string().email().optional(),
      phone: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),
    }),
  })
  ```
- **Return Type**: `Promise<string>` (Tenant UUID)

---

### 2.5 Leases Domain (`src/server/leases.functions.ts`)

#### `getLeases`

Lists all rental lease agreements for the landlord, joined with room, property, and tenant details.

- **Method**: `GET`
- **Authorization**: `landlordAuthMiddleware`
- **Input**: None
- **Return Type**:
  ```typescript
  Promise<
    Array<{
      id: string
      rentAmount: number // in paisa
      depositAmount: number // in paisa
      billingDay: number // 1-28
      startDate: string // YYYY-MM-DD
      endDate: string | null // YYYY-MM-DD
      status: 'active' | 'ended'
      createdAt: string
      roomName: string
      propertyName: string
      tenantName: string
      tenantEmail: string
    }>
  >
  ```

---

#### `createLease`

Creates a new rental agreement. Converts NPR monetary inputs into integer paisa.

- **Method**: `POST`
- **Authorization**: `landlordAuthMiddleware`
- **Input Schema (`createLeaseSchema`)**:
  ```typescript
  z.object({
    roomId: z.string().min(1, 'Room is required'),
    tenantId: z.string().min(1, 'Tenant is required'),
    rentAmountNpr: z
      .number()
      .positive('Rent must be positive')
      .multipleOf(0.01),
    depositAmountNpr: z
      .number()
      .nonnegative('Deposit cannot be negative')
      .multipleOf(0.01),
    billingDay: z
      .number()
      .int()
      .min(1)
      .max(28, 'Billing day must be between 1 and 28'),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD')
      .optional(),
  })
  ```
- **Return Type**: `Promise<string>` (Lease UUID)
- **Security Check (IDOR-2 Fix)**: Concurrently verifies via `Promise.all` that both `roomId` and `tenantId` belong to `context.landlordId`.
- **Side Effects**: Inserts lease with `rentAmount = nprToPaisa(rentAmountNpr)` and `depositAmount = nprToPaisa(depositAmountNpr)`.

---

#### `endLease`

Terminates an active lease agreement by recording an end date and setting status to `'ended'`.

- **Method**: `POST`
- **Authorization**: `landlordAuthMiddleware`
- **Input Schema**:
  ```typescript
  z.object({
    id: z.string().min(1, 'Lease ID is required'),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD'),
  })
  ```
- **Return Type**: `Promise<string>` (Lease UUID)

---

### 2.6 Invoices Domain (`src/server/invoices.functions.ts`)

#### `getInvoices`

Retrieves all invoices issued by the landlord, joined with tenant, room, and property metadata.

- **Method**: `GET`
- **Authorization**: `landlordAuthMiddleware`
- **Input**: None
- **Return Type**:
  ```typescript
  Promise<
    Array<{
      id: string
      period: string // YYYY-MM
      amount: number // in paisa
      dueDate: string // YYYY-MM-DD
      status: 'unpaid' | 'partial' | 'paid' | 'overdue'
      createdAt: string
      tenantName: string
      roomName: string
      propertyName: string
    }>
  >
  ```

---

#### `getInvoiceDetails`

Fetches a complete aggregate bundle for a single invoice, including tenant profile, lease terms, property metadata, itemized line items, and payment history.

- **Method**: `GET`
- **Authorization**: `landlordAuthMiddleware`
- **Input Schema**: `z.object({ id: z.string().min(1, 'Invoice ID is required') })`
- **Return Type**:
  ```typescript
  Promise<{
    invoice: Invoice
    tenant: Tenant | null
    lease: Lease | null
    room: Room | null
    property: Property | null
    lineItems: InvoiceLineItem[]
    payments: Payment[]
  }>
  ```
- **Error Modes**: Throws `'Invoice not found'` if the invoice does not exist or belongs to another landlord.

---

#### `createManualInvoiceFn`

Creates a manual invoice with itemized line items (rent, utilities, maintenance adjustments) within an atomic transaction and calculates initial invoice status.

- **Method**: `POST`
- **Authorization**: `landlordAuthMiddleware`
- **Input Schema (`createManualInvoiceSchema`)**:
  ```typescript
  z.object({
    leaseId: z.string().min(1, 'Lease is required'),
    period: z.string().regex(/^\d{4}-\d{2}$/, 'Period must be YYYY-MM'),
    dueDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be YYYY-MM-DD'),
    lineItems: z
      .array(
        z.object({
          description: z.string().min(1, 'Description is required'),
          amountNpr: z
            .number()
            .positive('Amount must be positive')
            .multipleOf(0.01),
          kind: z.enum(['rent', 'utility', 'adjustment']),
        }),
      )
      .min(1, 'At least one line item is required'),
  })
  ```
- **Return Type**: `Promise<string>` (Invoice UUID)
- **Idempotency Guarantee**: Backed by composite unique constraint `(lease_id, period)`.
- **Side Effects**:
  - Converts line item amounts to paisa.
  - Denormalizes invoice total: `invoices.amount = sum(lineItems.amount)`.
  - Atomically invokes `recalculateInvoiceStatus(tx, invoiceId)`.

---

#### `getDashboardData`

Aggregates landlord KPI metrics and provides a summary list of recent invoices.

- **Method**: `GET`
- **Authorization**: `landlordAuthMiddleware`
- **Input**: None
- **Return Type**:
  ```typescript
  Promise<{
    stats: {
      totalCollected: number // in paisa
      totalOutstanding: number // in paisa
      activeLeasesCount: number
      overdueInvoicesCount: number
    }
    invoices: Array<{
      id: string
      amount: number
      status: string
      dueDate: string
      tenantName: string
      roomName: string
      propertyName: string
      period: string
      createdAt: string
    }>
  }>
  ```
- **Accounting Accuracy (INV-01 Fix)**: Calculates outstanding balance per invoice:
  $$\text{totalOutstanding} = \sum_{\text{invoice}} \max(0, \text{invoice.amount} - \text{confirmedPaid}_{\text{invoice}})$$

---

### 2.7 Payments Domain (`src/server/payments.functions.ts`)

#### `recordCashPaymentFn`

Records an immediate cash payment against an invoice and updates the derived status.

- **Method**: `POST`
- **Authorization**: `landlordAuthMiddleware`
- **Input Schema (`recordCashPaymentSchema`)**:
  ```typescript
  z.object({
    invoiceId: z.string().min(1, 'Invoice ID is required'),
    amountNpr: z
      .number()
      .positive('Payment amount must be positive')
      .multipleOf(0.01),
    confirmedAt: z.string().optional().nullable(),
  })
  ```
- **Return Type**: `Promise<string>` (Payment UUID)
- **Financial Balance Validation (FIN-01 Fix)**:
  - Computes: $\text{remainingPaisa} = \max(0, \text{invoice.amount} - \sum \text{confirmedPayments})$.
  - Throws `'Payment amount exceeds remaining balance of NPR X'` if $\text{paymentAmountPaisa} > \text{remainingPaisa}$.
- **Side Effects**:
  - Inserts payment row (`status = 'confirmed'`, `method = 'cash'`).
  - Calls `recalculateInvoiceStatus(tx, invoice.id)` inside transaction.

---

## 3. Public Better Auth REST Endpoints (`/api/auth/*`)

Better Auth handles authentication via standard HTTP endpoints served at `src/routes/api/auth/$.ts`:

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                           Better Auth REST API Routes                             │
├─────────────────────────┬────────┬────────────────────────────────────────────────┤
│ Endpoint                │ Method │ Description                                    │
├─────────────────────────┼────────┼────────────────────────────────────────────────┤
│ `/api/auth/sign-up/email`│ POST   │ Registers user with email & password           │
│ `/api/auth/sign-in/email`│ POST   │ Authenticates user & sets session cookie       │
│ `/api/auth/sign-out`     │ POST   │ Revokes session and removes cookie             │
│ `/api/auth/get-session`  │ GET    │ Returns active session and user profile        │
│ `/api/auth/change-password` POST  │ Updates password for authenticated user        │
│ `/api/auth/verify-email` │ GET    │ Verifies email token                           │
└─────────────────────────┴────────┴────────────────────────────────────────────────┘
```

---

## 4. HTTP Error Handling & Status Codes

| HTTP Status            | Error Type                  | Trigger Conditions                                                                   |
| ---------------------- | --------------------------- | ------------------------------------------------------------------------------------ |
| **401 Unauthorized**   | Session Missing / Expired   | Request lacks valid Better Auth session cookie or token.                             |
| **403 Forbidden**      | Role / Tenancy Mismatch     | Authenticated user is not found in the `landlords` table.                            |
| **400 Bad Request**    | Schema Validation Failure   | Input payload fails Zod schema constraints (e.g. malformed date, negative amount).   |
| **500 Internal Error** | Database / Server Exception | Constraint violation (e.g. duplicate billing period) or database connectivity error. |
