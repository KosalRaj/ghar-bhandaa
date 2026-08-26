# Comprehensive Documentation & Tooling Gap Analysis

## Executive Summary
This analysis presents the findings of the documentation, in-code annotation, and tooling audit conducted on the `ghar-bhandaa` repository. The codebase is a TanStack Start (React 19) full-stack web application hosted on Cloudflare Workers, using Cloudflare D1 (SQLite) via Drizzle ORM, Better Auth for authentication, and Cloudflare R2 for storage.

The audit revealed that while Phase 0 and Phase 1 functional code is largely implemented in `src/`, there is a complete absence of documentation in `docs/`, no unit or integration tests exist despite `vitest` being configured, `package.json` is missing a `typecheck` script, `README.md` contains obsolete template instructions (referencing PostgreSQL `pg`), and none of the exported server functions or schema definitions have TSDoc/JSDoc annotations.

---

## 1. Documentation Audit vs R2 Requirements

### 1.1 Current State of Documentation
- **`docs/` Directory**: Missing entirely from the repository root.
- **`README.md`**: Contains generic TanStack Start boilerplate with misleading instructions (e.g., configuring Better Auth with `pg.Pool` and PostgreSQL connection strings, when the app uses Cloudflare D1 and SQLite).
- **`REQUIREMENTS.md` & `PLAN.md`**: Well-defined specification and implementation blueprints, but internal developer-facing and operations guides have not been compiled into `docs/`.

### 1.2 Target Documentation Specifications (R2 Deliverables)

#### 1. `docs/architecture.md` (System Architecture & Domain Guide)
Must contain:
- **System Overview & Technology Stack**:
  - Framework: TanStack Start v1 (React 19) with server functions and SSR.
  - Compute/Runtime: Cloudflare Workers (edge compute).
  - Database: Cloudflare D1 (Serverless SQLite) accessed via Drizzle ORM (`drizzle-orm/d1`).
  - Authentication: Better Auth with Drizzle SQLite adapter and cookie management.
  - File Storage: Cloudflare R2 for bank transfer proof screenshots.
  - Background Jobs: Cloudflare Cron Triggers (`0 1 * * *` UTC = 06:45 NPT).
- **Three-Entry-Point Architectural Model**:
  1. *Server Functions (`createServerFn`)*: Authenticated UI-driven actions in `src/server/*.functions.ts`.
  2. *Scheduled Handlers (Cron)*: Daily automated invoice generation and reminder dispatch.
  3. *Public API Routes*: Better Auth handler (`/api/auth/*`) and payment gateway webhooks (Khalti, eSewa).
- **Domain Logic Centralization (`src/lib/*.server.ts`)**:
  - Clear architectural explanation why all state mutations must reside in `src/lib/` and never inside server function wrappers or routes directly.
- **Database Schema & Entity Relationships**:
  - Full Mermaid ER Diagram documenting all 13 tables (`user`, `session`, `account`, `verification`, `landlords`, `properties`, `rooms`, `tenants`, `leases`, `invoices`, `invoiceLineItems`, `payments`, `notificationsLog`).
  - Indexing strategy and foreign key relationships.
- **Multi-Tenancy & Data Isolation Model**:
  - Enforced via `landlordId` foreign keys on every domain table and `landlordAuthMiddleware` context injection.
- **10 Hard Domain Invariants**:
  1. *Integer Paisa Representation*: 1 NPR = 100 paisa, strictly integer math, zero floats.
  2. *Derived Invoice Status*: Status (`paid`, `partial`, `overdue`, `unpaid`) strictly computed from confirmed payments and Kathmandu due dates via `recalculateInvoiceStatus`.
  3. *Idempotent Invoice Generation*: Guaranteed by `(lease_id, period)` composite unique constraint.
  4. *Append-Only Payment Ledger*: Payments are never updated or deleted; status progresses forward or corrective rows are appended.
  5. *Asia/Kathmandu (UTC+05:45) Timezone*: Naive date math prohibited; all billing day and due date checks use `lib/dates.ts`.
  6. *Untrusted Payment Webhooks*: Server-side signature validation and invoice amount verification.
  7. *Transactional Integrity*: Multi-entity mutations wrapped in `db.transaction()`.
  8. *Notification Deduplication*: Guarded by `notifications_log` on successful delivery.
  9. *Private R2 Proof Storage*: Screenshots streamed through authenticated endpoint (`/api/proofs/$`), never exposed publicly.
  10. *Tenant Email Uniqueness*: Better Auth session email mapped to unique `tenants.email`.

#### 2. `docs/api-catalog.md` (API & Server Functions Catalog)
Must document every server function and HTTP route:
- **Authentication**:
  - `registerLandlord`: Input (`name`, `email`, `password`, `phone`), Output (`{ success: true }`), Auth: Public, Throws on duplicate/Better Auth error.
  - `checkLandlordAuth`: Input: None, Output (`{ authenticated, user, landlord }`), Auth: Public/Session, Verifies landlord status.
- **Properties**:
  - `getProperties`: Input: None, Output: Array of properties, Auth: Landlord.
  - `createProperty`: Input (`name`, `address`), Output: `propertyId`, Auth: Landlord.
  - `updateProperty`: Input (`id`, `data`), Output: `propertyId`, Auth: Landlord.
- **Rooms**:
  - `getRooms`: Input: None, Output: Array of rooms joined with property name, Auth: Landlord.
  - `createRoom`: Input (`propertyId`, `name`, `floor`, `description`, `isActive`), Output: `roomId`, Auth: Landlord.
  - `updateRoom`: Input (`id`, `data`), Output: `roomId`, Auth: Landlord.
- **Tenants**:
  - `getTenants`: Input: None, Output: Array of tenants, Auth: Landlord.
  - `createTenant`: Input (`name`, `email`, `phone`, `notes`), Output: `tenantId`, Auth: Landlord.
  - `updateTenant`: Input (`id`, `data`), Output: `tenantId`, Auth: Landlord.
- **Leases**:
  - `getLeases`: Input: None, Output: Array of leases joined with room, property, tenant, Auth: Landlord.
  - `createLease`: Input (`roomId`, `tenantId`, `rentAmountNpr`, `depositAmountNpr`, `billingDay`, `startDate`, `endDate`), Output: `leaseId`, Auth: Landlord. Converts NPR to Paisa.
  - `endLease`: Input (`id`, `endDate`), Output: `leaseId`, Auth: Landlord.
- **Invoices**:
  - `getInvoices`: Input: None, Output: Array of invoices joined with tenant, room, property, Auth: Landlord.
  - `getInvoiceDetails`: Input (`id`), Output: Full invoice bundle (invoice, tenant, lease, room, property, lineItems, payments), Auth: Landlord.
  - `createManualInvoiceFn`: Input (`leaseId`, `period`, `dueDate`, `lineItems`), Output: `invoiceId`, Auth: Landlord.
  - `getDashboardData`: Input: None, Output: Financial statistics (`totalCollected`, `totalOutstanding`, `activeLeasesCount`, `overdueInvoicesCount`) and invoice list, Auth: Landlord.
- **Payments**:
  - `recordCashPaymentFn`: Input (`invoiceId`, `amountNpr`, `confirmedAt`), Output: `paymentId`, Auth: Landlord. Converts NPR to Paisa, inserts payment, recalculates status.
- **HTTP Endpoints**:
  - `/api/auth/$`: Better Auth router handler for all authentication operations.

#### 3. `docs/developer-guide.md` (Developer & Operations Guide)
Must detail:
- Local development prerequisites (`node >= 22`, `pnpm >= 10`, `wrangler`).
- Local environment setup (`.dev.vars`, Cloudflare D1 local bindings).
- Database workflows: Schema modifications in `src/db/schema.ts`, running `pnpm run db:generate`, applying local migrations `pnpm run db:migrate`, and remote production migrations `pnpm run db:migrate:production`.
- Testing workflows: Running Vitest unit and integration suites (`pnpm test`), adding new tests.
- Code quality checks: `pnpm run lint`, `pnpm run format`, `pnpm run check`, `pnpm run typecheck`.
- Deployment instructions: Deploying to Cloudflare Workers with `pnpm run deploy`.
- Cloudflare Cron Trigger operations and local simulation.

#### 4. Audit Report Document
- Summary of audit findings across architectural integrity, security/multi-tenancy boundaries, type safety, domain invariants, and tooling discrepancies.

---

## 2. In-Code Annotations & Type Documentation Catalog (R3 Requirements)

Every item in this catalog requires complete, standardized TSDoc annotations detailing `@param`, `@returns`, `@throws`, `@remarks` (invariants), and example usage.

### 2.1 Database Schema (`src/db/schema.ts` & `src/db/index.ts`)
| File | Exported Symbol | Type | Description |
|---|---|---|---|
| `src/db/schema.ts` | `user` | SQLite Table | Better Auth core user table storing credentials & identity |
| `src/db/schema.ts` | `session` | SQLite Table | Better Auth active sessions with token expiry |
| `src/db/schema.ts` | `account` | SQLite Table | Better Auth credential/OAuth accounts linked to user |
| `src/db/schema.ts` | `verification` | SQLite Table | Better Auth verification tokens |
| `src/db/schema.ts` | `landlords` | SQLite Table | Landlord domain profile mapped 1:1 to Better Auth user |
| `src/db/schema.ts` | `properties` | SQLite Table | Real estate property entities owned by landlords |
| `src/db/schema.ts` | `rooms` | SQLite Table | Rentable room/unit records within properties |
| `src/db/schema.ts` | `tenants` | SQLite Table | Tenant profile records scoped to landlord |
| `src/db/schema.ts` | `leases` | SQLite Table | Rental agreements linking tenant to room with rent in paisa |
| `src/db/schema.ts` | `invoices` | SQLite Table | Billing records with derived status and paisa amount |
| `src/db/schema.ts` | `invoiceLineItems` | SQLite Table | Itemized charges (rent, utility, adjustment) |
| `src/db/schema.ts` | `payments` | SQLite Table | Append-only payment ledger records |
| `src/db/schema.ts` | `notificationsLog` | SQLite Table | Notification dispatch log and deduplication audit |
| `src/db/index.ts` | `getDB` | Function | Factory returning Drizzle D1 ORM client instance with schema |
| `src/db/index.ts` | `Database` | Type Alias | TypeScript return type for Drizzle D1 database instance |

### 2.2 Domain Utility Functions (`src/lib/`)
| File | Exported Symbol | Signature | Description / Invariant |
|---|---|---|---|
| `src/lib/dates.ts` | `getTodayInKathmandu` | `(): string` | Returns current date formatted as `YYYY-MM-DD` in `Asia/Kathmandu` (UTC+05:45) |
| `src/lib/dates.ts` | `getCurrentDateTimeInKathmandu` | `(): string` | Returns current UTC timestamp ISO-8601 string |
| `src/lib/dates.ts` | `isPastDateInKathmandu` | `(dateStr: string): boolean` | Evaluates if a given date string is earlier than today in Kathmandu |
| `src/lib/money.ts` | `nprToPaisa` | `(npr: number): number` | Converts NPR amount to integer Paisa (Math.round(npr * 100)) |
| `src/lib/money.ts` | `paisaToNpr` | `(paisa: number): number` | Converts integer Paisa to floating NPR |
| `src/lib/money.ts` | `formatNpr` | `(paisa: number): string` | Formats Paisa into localized currency string (`NPR 12,000.00`) |
| `src/lib/invoices.server.ts` | `CreateManualInvoiceInput` | `interface` | Type definition for manual invoice input payload |
| `src/lib/invoices.server.ts` | `recalculateInvoiceStatus` | `(db: Database, invoiceId: string): Promise<string>` | Recomputes derived invoice status (`paid`, `partial`, `overdue`, `unpaid`) |
| `src/lib/invoices.server.ts` | `createManualInvoice` | `(db: Database, landlordId: string, input: CreateManualInvoiceInput): Promise<string>` | Transactionally creates invoice and line items in D1 |
| `src/lib/payments.server.ts` | `RecordCashPaymentInput` | `interface` | Type definition for recording cash payments |
| `src/lib/payments.server.ts` | `recordCashPayment` | `(db: Database, landlordId: string, input: RecordCashPaymentInput): Promise<string>` | Transactionally records cash payment and updates invoice status |
| `src/lib/auth.ts` | `getAuth` | `(env?: any): BetterAuthInstance` | Server-side Better Auth initialization factory |
| `src/lib/auth-client.ts` | `authClient` | `ReturnType<typeof createAuthClient>` | Better Auth React client instance |
| `src/lib/utils.ts` | `cn` | `(...inputs: ClassValue[]): string` | Tailwind class merger helper |

### 2.3 Server Functions & Middleware (`src/server/` & `src/middleware/`)
| File | Exported Symbol | HTTP Method | Middleware / Auth | Description |
|---|---|---|---|---|
| `src/middleware/auth.ts` | `landlordAuthMiddleware` | N/A | Function Middleware | Validates session & landlord identity; injects `db`, `user`, `landlordId` |
| `src/server/auth.functions.ts` | `registerLandlord` | `POST` | Public | Registers Better Auth user and inserts landlord record |
| `src/server/auth.functions.ts` | `checkLandlordAuth` | `GET` | Public/Session | Verifies active session and returns landlord profile |
| `src/server/invoices.functions.ts` | `getInvoices` | `GET` | `landlordAuthMiddleware` | Fetches all invoices for authenticated landlord with joins |
| `src/server/invoices.functions.ts` | `getInvoiceDetails` | `GET` | `landlordAuthMiddleware` | Fetches single invoice with tenant, lease, room, line items, payments |
| `src/server/invoices.functions.ts` | `createManualInvoiceFn` | `POST` | `landlordAuthMiddleware` | Validates manual invoice payload and persists invoice |
| `src/server/invoices.functions.ts` | `getDashboardData` | `GET` | `landlordAuthMiddleware` | Computes dashboard aggregate stats and list of invoices |
| `src/server/leases.functions.ts` | `getLeases` | `GET` | `landlordAuthMiddleware` | Fetches all leases for authenticated landlord |
| `src/server/leases.functions.ts` | `createLease` | `POST` | `landlordAuthMiddleware` | Creates a new lease with rent/deposit converted to Paisa |
| `src/server/leases.functions.ts` | `endLease` | `POST` | `landlordAuthMiddleware` | Ends lease by updating status and end date |
| `src/server/payments.functions.ts` | `recordCashPaymentFn` | `POST` | `landlordAuthMiddleware` | Records cash payment and updates invoice status |
| `src/server/properties.functions.ts` | `getProperties` | `GET` | `landlordAuthMiddleware` | Fetches all properties owned by authenticated landlord |
| `src/server/properties.functions.ts` | `createProperty` | `POST` | `landlordAuthMiddleware` | Creates a new property record |
| `src/server/properties.functions.ts` | `updateProperty` | `POST` | `landlordAuthMiddleware` | Updates property name or address |
| `src/server/rooms.functions.ts` | `getRooms` | `GET` | `landlordAuthMiddleware` | Fetches all rooms owned by authenticated landlord |
| `src/server/rooms.functions.ts` | `createRoom` | `POST` | `landlordAuthMiddleware` | Creates a new room record under a property |
| `src/server/rooms.functions.ts` | `updateRoom` | `POST` | `landlordAuthMiddleware` | Updates room details |
| `src/server/tenants.functions.ts` | `getTenants` | `GET` | `landlordAuthMiddleware` | Fetches all tenants under authenticated landlord |
| `src/server/tenants.functions.ts` | `createTenant` | `POST` | `landlordAuthMiddleware` | Creates a new tenant record |
| `src/server/tenants.functions.ts` | `updateTenant` | `POST` | `landlordAuthMiddleware` | Updates tenant details |

### 2.4 Zod Validation Schemas (`src/schemas/`)
| File | Exported Schema | Target Entity / Purpose |
|---|---|---|
| `src/schemas/invoices.ts` | `invoiceLineItemInputSchema` | Validates single invoice line item (description, amountNpr, kind) |
| `src/schemas/invoices.ts` | `createManualInvoiceSchema` | Validates manual invoice form submission |
| `src/schemas/leases.ts` | `createLeaseSchema` | Validates lease creation (roomId, tenantId, rent, deposit, billingDay 1-28) |
| `src/schemas/leases.ts` | `updateLeaseSchema` | Validates lease update |
| `src/schemas/payments.ts` | `recordCashPaymentSchema` | Validates cash payment entry |
| `src/schemas/properties.ts` | `createPropertySchema` | Validates property creation |
| `src/schemas/properties.ts` | `updatePropertySchema` | Validates property update |
| `src/schemas/rooms.ts` | `createRoomSchema` | Validates room creation |
| `src/schemas/rooms.ts` | `updateRoomSchema` | Validates room update |
| `src/schemas/tenants.ts` | `createTenantSchema` | Validates tenant creation |
| `src/schemas/tenants.ts` | `updateTenantSchema` | Validates tenant update |

---

## 3. Tooling, Build, and Test Suite Audit

### 3.1 `package.json` Scripts Audit
- **Existing Scripts**:
  - `dev`: `vite dev --port 3000`
  - `build`: `vite build`
  - `preview`: `vite preview`
  - `test`: `vitest run`
  - `db:generate`: `drizzle-kit generate`
  - `db:migrate`: `wrangler d1 migrations apply ghar-bhandaa-db --local`
  - `db:migrate:production`: `wrangler d1 migrations apply ghar-bhandaa-db --remote`
  - `lint`: `eslint`
  - `format`: `prettier --write . && eslint --fix`
  - `check`: `prettier --check .`
  - `deploy`: `pnpm run build && wrangler deploy`
- **Tooling Discrepancies & Missing Scripts**:
  1. **Missing `typecheck` script**: The repository currently lacks `"typecheck": "tsc --noEmit"` in `package.json`.
  2. **`tsconfig.json` include array error**: Line 2 of `tsconfig.json` contains `"vite.config.js"` instead of `"vite.config.ts"`.
  3. **Wrangler configuration file reference**: `PLAN.md` and `README.md` reference `wrangler.toml`, whereas the actual repository configuration is `wrangler.jsonc`.

### 3.2 Test Suite Audit (Complete Absence of Tests)
- **Current State**: `vitest` (`v4.1.5`), `@testing-library/react`, and `jsdom` are present in `devDependencies`, but **zero** test files exist in `src/` or `tests/`.
- **Missing Test Suites Required for Domain Invariants**:
  1. **`src/lib/dates.test.ts` (Unit Tests)**:
     - `getTodayInKathmandu()` returns correct format `YYYY-MM-DD`.
     - Test behavior across UTC midnight vs Kathmandu timezone (+05:45 offset).
     - `isPastDateInKathmandu()` correctly evaluates past, current, and future dates.
  2. **`src/lib/money.test.ts` (Unit Tests)**:
     - `nprToPaisa()` accurate rounding and integer conversion (e.g. `12000.50 -> 1200050`).
     - `paisaToNpr()` accurate fractional conversion (`1200050 -> 12000.5`).
     - `formatNpr()` localized currency formatting.
  3. **`src/lib/invoices.server.test.ts` (Unit/Integration Tests)**:
     - `recalculateInvoiceStatus()` state transitions:
       - 0 payments & due date in future -> `unpaid`
       - 0 payments & due date in past -> `overdue`
       - Partial payment -> `partial`
       - Full payment (sum >= amount) -> `paid`
     - Idempotency & transactional integrity of `createManualInvoice()`.
  4. **`src/lib/payments.server.test.ts` (Unit/Integration Tests)**:
     - `recordCashPayment()` records payment row with `status = 'confirmed'` and triggers invoice status recalculation.

### 3.3 Dead Code & Route Inconsistencies
1. **`src/integrations/better-auth/header-user.tsx`**:
   - Line 39 contains `<Link to="/demo/better-auth">` which references a nonexistent demo page. Should be `/login`.
2. **`src/components/Header.tsx`**:
   - Public header references TanStack demo links (`/about`, external TanStack docs) rather than app-specific landing links.

---

## 4. Synthesis & Recommendations for Implementation

1. **Create Complete Documentation Suite in `docs/`**:
   - `docs/architecture.md`: Comprehensive architecture, data flow, ERD diagrams, and 10 domain invariants.
   - `docs/api-catalog.md`: Exhaustive reference of all server functions, schemas, error codes, and endpoints.
   - `docs/developer-guide.md`: Step-by-step developer setup, D1 migrations, testing, and deployment.
   - Update `README.md` to reflect real D1/Drizzle/Better Auth architecture.

2. **Add TSDoc Annotations Across All Exported Code**:
   - Annotate all 13 Drizzle schema definitions in `src/db/schema.ts` and `src/db/index.ts`.
   - Annotate all utility functions in `src/lib/` (`dates.ts`, `money.ts`, `invoices.server.ts`, `payments.server.ts`, `auth.ts`, `utils.ts`).
   - Annotate all 16 server functions across `src/server/*.functions.ts` and `src/middleware/auth.ts`.
   - Annotate all Zod validation schemas in `src/schemas/`.

3. **Tooling & Test Suite Fixes**:
   - Add `"typecheck": "tsc --noEmit"` to `package.json`.
   - Fix `"vite.config.ts"` in `tsconfig.json` `include`.
   - Fix `/demo/better-auth` link in `header-user.tsx`.
   - Implement unit test suites in `src/lib/` for dates, money, invoices, and payments to ensure CI test coverage.

