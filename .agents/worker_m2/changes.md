# Changes Report — Milestone 2: TSDoc & In-Code Annotation

## Overview
Added comprehensive, standardized TSDoc and JSDoc annotations across all target database schemas, database client factories, domain utilities, request middleware, Zod schemas, and TanStack Start RPC server functions without altering any runtime behavior.

## Summary of Files Modified & Annotated

### 1. Database Schema (`src/db/schema.ts`)
- Added comprehensive file-level TSDoc overview detailing Better Auth integration, multi-tenant property rental domain model, integer paisa arithmetic invariant, append-only payment ledger, and derived invoice statuses.
- Fully annotated all 13 SQLite tables with column-level descriptions, data types, constraints, foreign key relationships, and indexes:
  - Better Auth Tables: `user`, `session`, `account`, `verification`
  - Domain Tables: `landlords`, `properties`, `rooms`, `tenants`, `leases`, `invoices`, `invoiceLineItems`, `payments`, `notificationsLog`

### 2. Database Factory (`src/db/index.ts`)
- Documented `getDB(d1: D1Database)` factory function including parameters, return types, and usage examples.
- Documented `Database` type alias representing the typed SQLite database instance with Ghar-Bhandaa schema.

### 3. Core Domain Utilities (`src/lib/`)
- `src/lib/dates.ts`: Annotated `getTodayInKathmandu`, `getCurrentDateTimeInKathmandu`, `isPastDateInKathmandu`, and `addDaysInKathmandu` highlighting the `Asia/Kathmandu` (UTC+05:45) timezone invariant and `Intl.DateTimeFormat` usage.
- `src/lib/money.ts`: Annotated `nprToPaisa`, `paisaToNpr`, and `formatNpr` documenting the integer paisa invariant (`1 NPR = 100 Paisa`) and floating-point prevention in SQLite storage.
- `src/lib/invoices.server.ts`: Annotated `recalculateInvoiceStatus`, `CreateManualInvoiceInput` interface, and `createManualInvoice` documenting deterministic status hierarchy (`paid`, `overdue`, `partial`, `unpaid`), Kathmandu due date evaluation, and transactional integrity.
- `src/lib/payments.server.ts`: Annotated `RecordCashPaymentInput` interface and `recordCashPayment` documenting the append-only ledger invariant, remaining balance validation, immediate cash confirmation, and automatic invoice status recalculation.
- `src/lib/auth.ts`: Annotated `getAuth(env?: any)` documenting Better Auth server initialization, Drizzle D1 adapter, cookie plugin, and environment resolution.
- `src/lib/auth-client.ts`: Annotated `authClient` singleton detailing client-side authentication hooks and methods.
- `src/lib/utils.ts`: Annotated `cn(...inputs: ClassValue[])` utility merging Tailwind CSS classes with clsx and twMerge.

### 4. Authentication Middleware (`src/middleware/auth.ts`)
- Annotated `landlordAuthMiddleware` documenting session token verification, `landlords` table registration checks, context injections (`env`, `db`, `user`, `session`, `landlordId`), and HTTP 401/403 guards.

### 5. Input Validation Schemas (`src/schemas/*.ts`)
- `src/schemas/invoices.ts`: Annotated `invoiceLineItemInputSchema` and `createManualInvoiceSchema` with validation rules (e.g., positive 2-decimal max NPR amounts, YYYY-MM period, YYYY-MM-DD due date).
- `src/schemas/leases.ts`: Annotated `createLeaseSchema` and `updateLeaseSchema` documenting rent/deposit amounts, billing day range (1-28), and date formats.
- `src/schemas/payments.ts`: Annotated `recordCashPaymentSchema` documenting invoice ID, positive amount constraints, and confirmed date formats.
- `src/schemas/properties.ts`: Annotated `createPropertySchema` and `updatePropertySchema`.
- `src/schemas/rooms.ts`: Annotated `createRoomSchema` and `updateRoomSchema`.
- `src/schemas/tenants.ts`: Annotated `createTenantSchema` and `updateTenantSchema`.

### 6. RPC Server Functions (`src/server/*.functions.ts`)
- Annotated all server functions across the 7 modules with input parameters, response structures, authentication middleware requirements, error modes, and multi-tenant security invariants:
  - `src/server/auth.functions.ts`: `registerLandlord`, `checkLandlordAuth`
  - `src/server/properties.functions.ts`: `getProperties`, `createProperty`, `updateProperty`
  - `src/server/rooms.functions.ts`: `getRooms`, `createRoom`, `updateRoom`
  - `src/server/tenants.functions.ts`: `getTenants`, `createTenant`, `updateTenant`
  - `src/server/leases.functions.ts`: `getLeases`, `createLease`, `endLease`
  - `src/server/invoices.functions.ts`: `getInvoices`, `getInvoiceDetails`, `createManualInvoiceFn`, `getDashboardData`
  - `src/server/payments.functions.ts`: `recordCashPaymentFn`

## Verification Results
- `pnpm run check` (Prettier formatting): PASSED
- `pnpm run lint` (ESLint): PASSED (0 errors, 0 warnings)
- `pnpm run typecheck` (tsc --noEmit): PASSED (0 errors)
- `pnpm test` (Vitest): PASSED (6 test suites, 73 tests passed)
- `pnpm run build` (Vite Client & SSR Production Build): PASSED
