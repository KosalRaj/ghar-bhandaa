# Ghar Bhandaa — Architectural & Server Functions Analysis

**Date:** 2026-08-26  
**Document Scope:** Comprehensive architecture, data model, server functions, middleware, domain logic, and frontend data flow for the `ghar-bhandaa` automated room rent collection system.

---

## 1. Executive Summary & System Architecture

### 1.1 Purpose & Scope
`ghar-bhandaa` (घर भाडा) is an automated monthly rent billing, invoice generation, and collection management system designed for landlords operating multi-room, multi-property residential or commercial leases in Nepal.

The system is built on **TanStack Start (v1)** with **React 19**, deployed serverlessly to **Cloudflare Workers** (via Vite and Nitro) backed by **Cloudflare D1** (distributed SQLite) and **Cloudflare R2** (object storage).

### 1.2 The Three Entry Points Architecture
A fundamental design principle of the codebase (defined in `PLAN.md` §4) is the strict decoupling of **three independent backend entry points**, all delegating to a pure, framework-agnostic domain logic layer (`src/lib/`):

```
                               ┌────────────────────────┐
                               │   Landlord / Tenant    │
                               │     Web Clients        │
                               └───────────┬────────────┘
                                           │ HTTP/RPC
                                           ▼
┌───────────────────────┐      ┌────────────────────────┐      ┌────────────────────────┐
│ Cloudflare Cron (NPT) │      │  Server Functions RPC  │      │ Public Webhooks / API  │
│  `wrangler.jsonc`     │      │   `createServerFn`     │      │ `/api/webhooks/*`      │
│  (Invoicing/Reminder) │      │ (Authenticated Actions)│      │  (Khalti/eSewa Call)   │
└──────────┬────────────┘      └───────────┬────────────┘      └───────────┬────────────┘
           │                               │                               │
           └───────────────────────┐       │       ┌───────────────────────┘
                                   ▼       ▼       ▼
                       ┌─────────────────────────────────────────┐
                       │       Domain Logic Layer (`src/lib/`)   │
                       │  - invoices.server.ts (calculation)     │
                       │  - payments.server.ts (ledger & confirm)│
                       │  - dates.ts (Asia/Kathmandu UTC+05:45)  │
                       │  - money.ts (Integer Paisa arithmetic)  │
                       └───────────────────┬─────────────────────┘
                                           │
                                  ┌────────┴────────┐
                                  ▼                 ▼
                       ┌────────────────────┐ ┌───────────────┐
                       │ Cloudflare D1 (DB) │ │ Cloudflare R2 │
                       │    (Drizzle ORM)   │ │ (Proof Store) │
                       └────────────────────┘ └───────────────┘
```

1. **Server Functions (`src/server/*.functions.ts`)**: Type-safe RPC endpoints invoked by frontend UI interactions. Guarded by function-level middleware (`landlordAuthMiddleware`) and input-validated with Zod.
2. **Scheduled Handler (`Cloudflare Cron Triggers`)**: Configured in `wrangler.jsonc` (`0 1 * * *` = 06:45 NPT). Designed to execute automated monthly invoice creation and reminder dispatch idempotently.
3. **Public API Routes (`src/routes/api/`)**: Webhook callback routes (e.g. Better Auth catch-all `/api/auth/$`, future Khalti/eSewa endpoints) that verify third-party signatures and invoke domain logic.
4. **Domain Logic (`src/lib/*.server.ts`)**: The single authoritative source of truth for business rules, money math, date logic, and invoice status state machines.

---

## 2. Technology Stack & Configuration

| Concern | Technology / Library | Version / Details | Purpose |
|---|---|---|---|
| **Framework** | TanStack Start (`@tanstack/react-start`) | `latest` (v1) | Full-stack SSR React framework with file-based routing |
| **UI Library** | React | `^19.2.0` | Frontend component rendering with React 19 compiler/primitives |
| **Routing** | TanStack Router (`@tanstack/react-router`) | `latest` | Type-safe router with loader caching, `beforeLoad` guards, search params |
| **Bundler & Dev** | Vite | `^8.0.0` | Ultra-fast bundling, HMR, SSR environment pipelines |
| **Cloudflare Adapter** | `@cloudflare/vite-plugin` | `^1.26.0` | Native Cloudflare Workers execution inside Vite SSR (`name: 'ssr'`) |
| **Runtime & Edge** | Cloudflare Workers | Compatibility: `2025-09-02` | Global edge hosting with low latency PoP in Kathmandu |
| **Database** | Cloudflare D1 | Binding: `DB` | Serverless SQLite database at the edge |
| **ORM** | Drizzle ORM (`drizzle-orm`) | `^0.45.1` (d1 dialect) | TypeScript-first ORM mapping SQLite tables with relation queries |
| **Migrations** | Drizzle Kit (`drizzle-kit`) | `^0.31.9` | Schema migration generator (`drizzle/` directory) |
| **Authentication** | Better Auth (`better-auth`) | `^1.5.3` | Session management with Drizzle SQLite adapter & TanStack cookies |
| **File Storage** | Cloudflare R2 | Binding: `PROOFS` | Private bucket for tenant payment proof screenshots |
| **Validation** | Zod (`zod`) | `^3.24.2` | Runtime schema validation shared between client forms & server functions |
| **Styling** | Tailwind CSS (`tailwindcss`) | `^4.1.18` (`@tailwindcss/vite`) | Modern utility CSS with custom CSS variable design tokens |
| **Icons** | Lucide React (`lucide-react`) | `^0.577.0` | UI iconography |

### 2.1 Key Configuration Files

#### `vite.config.ts`
Configures Vite plugins in required order:
1. `devtools()`: TanStack Devtools instrumentation.
2. `cloudflare({ viteEnvironment: { name: 'ssr' } })`: Bridges Cloudflare Worker bindings into Vite SSR.
3. `tailwindcss()`: Tailwind CSS v4 compiler.
4. `tanstackStart()`: TanStack Start router code generation and server bundling.
5. `viteReact()`: React 19 JSX transformation.

#### `wrangler.jsonc`
Declares Cloudflare environment bindings:
- `d1_databases`: Binding `DB`, database `ghar-bhandaa-db`, migration folder `drizzle`.
- `r2_buckets`: Binding `PROOFS`, bucket `ghar-bhandaa-proofs`.
- `triggers`: Cron trigger `0 1 * * *` (daily 01:00 UTC = 06:45 NPT).
- `compatibility_flags`: `["nodejs_compat"]`.
- `main`: `@tanstack/react-start/server-entry`.

#### `src/types/cloudflare.d.ts`
Type definition exposing global Cloudflare bindings:
```typescript
interface CloudflareBindings {
  DB: D1Database
  PROOFS: R2Bucket
  APP_BASE_URL: string
}
declare module 'cloudflare:workers' {
  export const env: CloudflareBindings
}
```

---

## 3. Database Schema, Tables & Relations

The database is built on SQLite (Cloudflare D1) via Drizzle ORM (`src/db/schema.ts`). All tables enforce strict multi-tenant ownership via `landlordId`.

```
                    ┌─────────────────────────┐
                    │      user / session     │
                    │      (Better Auth)      │
                    └────────────┬────────────┘
                                 │ 1:1 (id = user.id)
                                 ▼
                    ┌─────────────────────────┐
                    │        landlords        │
                    └──────┬───────────┬──────┘
                           │           │
                 ┌─────────┘           └─────────┐
                 │ 1:N                           │ 1:N
                 ▼                               ▼
       ┌──────────────────┐            ┌──────────────────┐
       │    properties    │            │     tenants      │
       └─────────┬────────┘            └─────────┬────────┘
                 │ 1:N                           │
                 ▼                               │
       ┌──────────────────┐                      │
       │      rooms       │                      │
       └─────────┬────────┘                      │
                 │ 1:N                           │
                 └──────────────┐ ┌──────────────┘
                                ▼ ▼ 1:N
                       ┌──────────────────┐
                       │      leases      │
                       └─────────┬────────┘
                                 │ 1:N
                                 ▼
                       ┌──────────────────┐
                       │     invoices     │◄────────┐
                       └────┬───────────┬─┘         │ 1:N
                            │           │           │
                  ┌─────────┘           └─────┐     │
              1:N │                       1:N │     │
                  ▼                           ▼     │
      ┌───────────────────────┐   ┌───────────────────────┐
      │  invoice_line_items   │   │       payments        │
      └───────────────────────┘   └───────────────────────┘
```

### 3.1 Better Auth Tables
- **`user`**: `id` (PK text), `name`, `email` (unique text), `emailVerified` (boolean), `image` (text), `createdAt` (timestamp), `updatedAt` (timestamp).
- **`session`**: `id` (PK text), `expiresAt` (timestamp), `token` (unique text), `createdAt`, `updatedAt`, `ipAddress`, `userAgent`, `userId` (FK -> `user.id` on delete cascade).
- **`account`**: `id` (PK text), `accountId`, `providerId`, `userId` (FK -> `user.id`), OAuth tokens, hashed `password`, `createdAt`, `updatedAt`.
- **`verification`**: `id` (PK text), `identifier`, `value`, `expiresAt`, `createdAt`, `updatedAt`.

### 3.2 Domain Tables

#### 1. `landlords`
The tenant boundary entity for multi-landlord isolation.
- `id` (PK text, corresponds 1:1 with `user.id`).
- `email` (text, unique, not null).
- `name` (text, not null).
- `phone` (text, nullable).
- `createdAt` (text ISO-8601 string, not null).

#### 2. `properties`
Represents physical building assets.
- `id` (PK text UUID).
- `landlordId` (FK -> `landlords.id`, not null).
- `name` (text, not null, e.g., "Lalita Niwas").
- `address` (text, not null, e.g., "Baluwatar, Kathmandu").
- `createdAt` (text ISO-8601, not null).
- *Index:* `properties_landlord_idx` on `(landlordId)`.

#### 3. `rooms`
Individual rentable units within a property.
- `id` (PK text UUID).
- `landlordId` (FK -> `landlords.id`, not null).
- `propertyId` (FK -> `properties.id`, not null).
- `name` (text, not null, e.g., "Room 101", "Flat A").
- `floor` (text, nullable, e.g., "1st Floor").
- `description` (text, nullable).
- `isActive` (boolean integer, default `true`).
- `createdAt` (text ISO-8601, not null).
- *Indexes:* `rooms_landlord_idx` on `(landlordId)`, `rooms_property_idx` on `(propertyId)`, composite `rooms_landlord_property_idx` on `(landlordId, propertyId)`.

#### 4. `tenants`
Renter profiles.
- `id` (PK text UUID).
- `landlordId` (FK -> `landlords.id`, not null).
- `name` (text, not null).
- `email` (text, unique, not null).
- `phone` (text, nullable).
- `notes` (text, nullable).
- `createdAt` (text ISO-8601, not null).
- *Indexes:* `tenants_landlord_idx` on `(landlordId)`, `tenants_email_idx` on `(email)`.

#### 5. `leases`
Legal contract linking one tenant to one room.
- `id` (PK text UUID).
- `landlordId` (FK -> `landlords.id`, not null).
- `roomId` (FK -> `rooms.id`, not null).
- `tenantId` (FK -> `tenants.id`, not null).
- `rentAmount` (integer paisa, not null).
- `depositAmount` (integer paisa, not null).
- `billingDay` (integer 1–28, not null).
- `startDate` (text `YYYY-MM-DD`, not null).
- `endDate` (text `YYYY-MM-DD`, nullable).
- `status` (text `'active'` | `'ended'`, default `'active'`).
- `createdAt` (text ISO-8601, not null).
- *Indexes:* `leases_landlord_idx`, `leases_room_idx`, `leases_tenant_idx`.

#### 6. `invoices`
Monthly billing record.
- `id` (PK text UUID).
- `landlordId` (FK -> `landlords.id`, not null).
- `leaseId` (FK -> `leases.id`, not null).
- `tenantId` (FK -> `tenants.id`, not null).
- `period` (text `YYYY-MM`, not null).
- `amount` (integer paisa, denormalized sum of line items).
- `dueDate` (text `YYYY-MM-DD`, not null).
- `status` (text `'unpaid'` | `'partial'` | `'paid'` | `'overdue'`, default `'unpaid'`).
- `createdAt` (text ISO-8601, not null).
- `updatedAt` (text ISO-8601, not null).
- *Indexes & Constraints:*
  - `invoices_landlord_idx`, `invoices_tenant_idx`, `invoices_lease_idx`.
  - **Unique composite index:** `invoices_lease_period_idx` on `(leaseId, period)` (guarantees invoice generation idempotency).

#### 7. `invoiceLineItems`
Itemized line charges for an invoice.
- `id` (PK text UUID).
- `invoiceId` (FK -> `invoices.id` ON DELETE CASCADE, not null).
- `description` (text, not null).
- `amount` (integer paisa, not null).
- `kind` (text `'rent'` | `'utility'` | `'adjustment'`, not null).
- *Index:* `invoice_line_items_invoice_idx` on `(invoiceId)`.

#### 8. `payments`
Append-only payment ledger. Rows are never mutated or deleted.
- `id` (PK text UUID).
- `landlordId` (FK -> `landlords.id`, not null).
- `invoiceId` (FK -> `invoices.id`, not null).
- `tenantId` (FK -> `tenants.id`, not null).
- `amount` (integer paisa, not null).
- `method` (text `'khalti'` | `'esewa'` | `'bank_transfer'` | `'cash'`).
- `status` (text `'initiated'` | `'pending_verification'` | `'confirmed'` | `'rejected'` | `'failed'`, default `'initiated'`).
- `gatewayRef` (text, unique, nullable).
- `bankRef` (text, nullable).
- `proofObjectKey` (text, nullable — R2 bucket object key).
- `createdAt` (text ISO-8601, not null).
- `confirmedAt` (text ISO-8601, nullable).
- *Indexes:* `payments_landlord_idx`, `payments_invoice_idx`, `payments_tenant_idx`, unique `payments_gateway_ref_idx` on `(gatewayRef)`.

#### 9. `notificationsLog`
Audit log for communication and reminder deduplication.
- `id` (PK text UUID).
- `landlordId` (FK -> `landlords.id`, not null).
- `invoiceId` (FK -> `invoices.id`, nullable).
- `tenantId` (FK -> `tenants.id`, not null).
- `channel` (text `'email'` | `'sms'`).
- `kind` (text `'reminder_before'` | `'reminder_due'` | `'reminder_overdue'` | `'receipt'`).
- `sentAt` (text ISO-8601, not null).
- `status` (text `'sent'` | `'failed'`).
- *Indexes:* `notifications_log_landlord_idx`, `notifications_log_invoice_idx`, `notifications_log_tenant_idx`, composite `notifications_log_invoice_kind_idx` on `(invoiceId, kind)`.

---

## 4. Middleware & Authentication Architecture

### 4.1 Better Auth Integration
- Server instance initialized in `src/lib/auth.ts` via `getAuth(env)` using the `better-auth/adapters/drizzle` adapter with SQLite schema.
- Uses `tanstackStartCookies()` plugin to handle cookie serialization between client and worker context.
- Catch-all route in `src/routes/api/auth/$.ts` handles all Better Auth incoming requests (`auth.handler(request)`).
- Client client created in `src/lib/auth-client.ts` via `createAuthClient()`.

### 4.2 Security Invariant: Function-Level Middleware
TanStack Router route-level guards (`beforeLoad` in `_authed.tsx`) only protect client navigation. Since `createServerFn` endpoints are exposed over HTTP via POST, **every server function touching database records executes `landlordAuthMiddleware`**.

### 4.3 `landlordAuthMiddleware` Flow (`src/middleware/auth.ts`)
```
Incoming Request
      │
      ▼
Resolve Cloudflare `env` from context
      │
      ▼
Execute `auth.api.getSession({ headers: request.headers })`
      │
      ├─► Session / User missing? ──────► Throw 401 Unauthorized Response
      │
      ▼
Query `landlords` table where `id == session.user.id`
      │
      ├─► Record not found? ─────────────► Throw 403 Forbidden Response
      │
      ▼
Inject `{ env, db, user, session, landlordId }` into downstream context
```

---

## 5. Server Functions Catalog & RPC Layer

All server functions are implemented in `src/server/*.functions.ts` using `createServerFn`.

| Module | Function Name | HTTP Method | Auth / Middleware | Input Schema | Return Type | Description |
|---|---|---|---|---|---|---|
| **`auth.functions.ts`** | `registerLandlord` | `POST` | Public | `z.object({ name, email, password, phone })` | `{ success: boolean }` | Signs up user in Better Auth and inserts landlord record in transaction |
| | `checkLandlordAuth` | `GET` | Public (Session check) | None | `{ authenticated: boolean, user?, landlord?, reason? }` | Checks active session & landlord registration status for route guards |
| **`properties.functions.ts`** | `getProperties` | `GET` | `landlordAuthMiddleware` | None | `Property[]` | Retrieves all properties owned by authenticated landlord |
| | `createProperty` | `POST` | `landlordAuthMiddleware` | `createPropertySchema` (`{ name, address }`) | `string` (UUID) | Creates a new property asset |
| | `updateProperty` | `POST` | `landlordAuthMiddleware` | `z.object({ id, data: updatePropertySchema })` | `string` (UUID) | Updates existing property details |
| **`rooms.functions.ts`** | `getRooms` | `GET` | `landlordAuthMiddleware` | None | `(Room & { propertyName: string })[]` | Lists rooms joined with property name |
| | `createRoom` | `POST` | `landlordAuthMiddleware` | `createRoomSchema` (`{ propertyId, name, floor?, description?, isActive? }`) | `string` (UUID) | Adds room under a property |
| | `updateRoom` | `POST` | `landlordAuthMiddleware` | `z.object({ id, data: updateRoomSchema })` | `string` (UUID) | Updates room details |
| **`tenants.functions.ts`** | `getTenants` | `GET` | `landlordAuthMiddleware` | None | `Tenant[]` | Retrieves landlord's registered tenants |
| | `createTenant` | `POST` | `landlordAuthMiddleware` | `createTenantSchema` (`{ name, email, phone?, notes? }`) | `string` (UUID) | Registers a new tenant profile |
| | `updateTenant` | `POST` | `landlordAuthMiddleware` | `z.object({ id, data: updateTenantSchema })` | `string` (UUID) | Updates tenant information |
| **`leases.functions.ts`** | `getLeases` | `GET` | `landlordAuthMiddleware` | None | `(Lease & { roomName, propertyName, tenantName, tenantEmail })[]` | Lists all leases with tenant and room joins |
| | `createLease` | `POST` | `landlordAuthMiddleware` | `createLeaseSchema` (`{ roomId, tenantId, rentAmountNpr, depositAmountNpr, billingDay, startDate, endDate? }`) | `string` (UUID) | Creates lease converting NPR to Paisa |
| | `endLease` | `POST` | `landlordAuthMiddleware` | `z.object({ id, endDate })` | `string` (UUID) | Sets lease status to `'ended'` with specified end date |
| **`invoices.functions.ts`** | `getInvoices` | `GET` | `landlordAuthMiddleware` | None | `(Invoice & { tenantName, roomName, propertyName })[]` | Fetches all invoices with relations |
| | `getInvoiceDetails` | `GET` | `landlordAuthMiddleware` | `z.object({ id: z.string() })` | `{ invoice, tenant, lease, room, property, lineItems, payments }` | Full detail graph for an invoice |
| | `createManualInvoiceFn` | `POST` | `landlordAuthMiddleware` | `createManualInvoiceSchema` (`{ leaseId, period, dueDate, lineItems }`) | `string` (UUID) | Transactionally creates manual invoice + line items and calculates status |
| | `getDashboardData` | `GET` | `landlordAuthMiddleware` | None | `{ stats: { totalCollected, totalOutstanding, activeLeasesCount, overdueInvoicesCount }, invoices }` | Aggregates KPI statistics and invoice records |
| **`payments.functions.ts`** | `recordCashPaymentFn` | `POST` | `landlordAuthMiddleware` | `recordCashPaymentSchema` (`{ invoiceId, amountNpr, confirmedAt? }`) | `string` (UUID) | Records cash payment ledger entry and recalculates invoice status |

---

## 6. Domain Logic & Business Rules

Located in `src/lib/`, domain functions are pure and framework-agnostic.

### 6.1 Integer Paisa Arithmetic (`src/lib/money.ts`)
Floats are strictly forbidden in monetary storage.
- $1\text{ NPR} = 100\text{ Paisa}$.
- `nprToPaisa(npr)` $\rightarrow \text{Math.round}(npr \times 100)$
- `paisaToNpr(paisa)` $\rightarrow paisa / 100$
- `formatNpr(paisa)` $\rightarrow$ Formats via `Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR' })`.

### 6.2 Kathmandu Timezone Handling (`src/lib/dates.ts`)
Nepal operates on a non-standard 45-minute offset (UTC+05:45).
- `getTodayInKathmandu()`: Formats current date in `Asia/Kathmandu` timezone as `YYYY-MM-DD`.
- `getCurrentDateTimeInKathmandu()`: Generates UTC ISO-8601 string (`new Date().toISOString()`).
- `isPastDateInKathmandu(dateStr)`: Compares `dateStr < getTodayInKathmandu()`.

### 6.3 Derived Invoice Status State Machine (`src/lib/invoices.server.ts`)
Invoice status is never updated manually. The `recalculateInvoiceStatus(db, invoiceId)` function computes state:
$$\text{Status} = \begin{cases} 
\text{'paid'} & \text{if } \sum \text{confirmed\_payments} \ge \text{invoice.amount} \\
\text{'partial'} & \text{if } 0 < \sum \text{confirmed\_payments} < \text{invoice.amount} \\
\text{'overdue'} & \text{if } \sum \text{confirmed\_payments} = 0 \text{ and } \text{dueDate} < \text{today}_{\text{Kathmandu}} \\
\text{'unpaid'} & \text{otherwise}
\end{cases}$$

### 6.4 Transactional Multi-Row Inserts
Both `createManualInvoice` and `recordCashPayment` execute inside Drizzle's `db.transaction(async (tx) => { ... })` to ensure relational integrity across multi-table mutations.

---

## 7. Frontend Architecture, Routing & Data Flow

```
                      ┌─────────────────────────────────┐
                      │    src/routes/__root.tsx        │
                      │  (HTML Shell, Theme Script,     │
                      │   Header, DevTools, Footer)     │
                      └────────────────┬────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌──────────────────────────────┐              ┌─────────────────────────────────┐
│ Public Routes                │              │ Authenticated Layout            │
│ - /login (LoginPage)         │              │ `src/routes/_authed.tsx`        │
│ - /signup (SignupPage)       │              │ `beforeLoad: checkLandlordAuth` │
│ - /about (AboutPage)         │              │ `<LandlordHeader />`            │
│ - / (redirect -> /dashboard) │              └────────────────┬────────────────┘
└──────────────────────────────┘                               │
                                     ┌─────────────────────────┴─────────────────────────┐
                                     ▼                                                   ▼
                     ┌───────────────────────────────┐                   ┌───────────────────────────────┐
                     │ Dashboard & Invoices          │                   │ Management Registries         │
                     │ - /dashboard                  │                   │ - /properties                 │
                     │ - /invoices/$invoiceId        │                   │ - /rooms                      │
                     │                               │                   │ - /tenants                    │
                     │                               │                   │ - /leases                     │
                     └───────────────────────────────┘                   └───────────────────────────────┘
```

### 7.1 Data Flow Lifecycle
1. **Route Preload / Navigation**: Client triggers navigation via `<Link>` or `router.navigate()`.
2. **Route Guard Evaluation (`beforeLoad`)**: Evaluates `checkLandlordAuth()`. If unauthenticated, throws `redirect({ to: '/login' })`.
3. **Route Loader Execution (`loader`)**: Executes server functions (e.g. `getDashboardData()`, `getLeases()`).
4. **Context & Auth Injection**: `landlordAuthMiddleware` extracts headers, validates Better Auth session against D1 SQLite, ensures user is in `landlords` table, and attaches `{ db, landlordId }`.
5. **Drizzle Query Execution**: Scoped queries return typed DTOs.
6. **SSR & Hydration**: Components render data.
7. **User Mutation**: Action invokes server function (e.g., `createManualInvoiceFn()`, `recordCashPaymentFn()`).
8. **Cache Invalidation**: On mutation success, `router.invalidate()` re-executes active loaders, instantly refreshing UI statistics.

---

## 8. Implementation Status vs System Plan (Gap Analysis)

| Phase | Description | Status | Components Present | Missing / Remaining Work |
|---|---|---|---|---|
| **Phase 0** | Project Setup & Infrastructure | **Complete** | TanStack Start, Cloudflare Worker bindings, D1 Drizzle schema, Better Auth, Tailwind CSS | None |
| **Phase 1** | Core Records & Manual Billing | **Complete** | Full CRUD for Properties, Rooms, Tenants, Leases; Manual Invoice creation; Cash payment recording; Derived status engine; Landlord Dashboard with KPIs | None |
| **Phase 2** | Automation (Cron & Reminders) | **Pending** | `wrangler.jsonc` cron trigger (`0 1 * * *`), `notifications_log` schema | `src/routes/api/cron/run.ts` endpoint, `generateInvoiceForLease` batch runner, Resend email dispatch integration, Tenant portal login |
| **Phase 3** | Bank Transfer & Verification Queue | **Pending** | `payments` schema (`bankRef`, `proofObjectKey`, `status: pending_verification`), R2 binding | Tenant proof upload form, R2 authenticated streaming endpoint (`/api/proofs/[key]`), Landlord verification queue UI (`verifyPayment` approve/reject) |
| **Phase 4** | Online Wallet Payments | **Pending** | `payments` schema (`gatewayRef`, `method: khalti/esewa`) | Khalti / eSewa checkout integration, public webhook handlers (`/api/webhooks/khalti.ts`, `/api/webhooks/esewa.ts`), signature verification |
| **Phase 5** | Hardening & PWA | **Pending** | — | PWA manifest, service worker cache-first strategy, Sparrow SMS integration, automated D1 to R2 backup script |
| **Phase 6** | Multi-Landlord Isolation | **Architected** | All tables include `landlordId`, all server functions filter by `context.landlordId` | Multi-landlord automated integration tests |

### 8.1 Architectural Observations & Cleanup Recommendations
1. **Header Layout Duplication**: In `__root.tsx`, `<Header />` (the default TanStack starter header) is rendered for all pages, while `_authed.tsx` renders `<LandlordHeader />`. In authenticated views, two navigation headers can appear simultaneously.
2. **Template Remnants in Header**: `src/components/Header.tsx` and `src/integrations/better-auth/header-user.tsx` still reference demo links (`/demo/better-auth`, `https://tanstack.com`, `https://x.com/tan_stack`).
3. **PWA & Offline Capability**: PWA manifest and service worker caching are not yet added.

---

## 9. Summary & Architecture Compliance Matrix

- [x] **Strict Multi-Tenancy**: All domain tables (`properties`, `rooms`, `tenants`, `leases`, `invoices`, `payments`, `notifications_log`) enforce `landlord_id` foreign key.
- [x] **Integer Paisa Invariant**: Stored as integers in database; formatted only at UI boundary.
- [x] **Derived Invoice Status**: Computed dynamically via `recalculateInvoiceStatus()` based on confirmed payments and Nepal due dates.
- [x] **Idempotent Invoicing**: Guaranteed by composite unique constraint `(lease_id, period)`.
- [x] **Append-Only Payment Ledger**: Payments are inserted and status-updated; never deleted.
- [x] **Server Function Protection**: Function-level `landlordAuthMiddleware` secures RPC endpoints against unauthorized direct POST invocations.
