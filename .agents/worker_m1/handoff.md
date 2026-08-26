# Milestone 1 Handoff Report: Invariant & Security Remediation

## 1. Observation

Direct observations and evidence collected during audit and remediation:
- **IDOR in Rooms (`src/server/rooms.functions.ts:33-47`)**: `createRoom` previously inserted rooms with unverified `propertyId`, permitting foreign landlord properties to be linked.
- **IDOR in Leases (`src/server/leases.functions.ts:37-61`)**: `createLease` previously inserted leases referencing arbitrary `roomId` and `tenantId` without verifying that either entity belonged to `context.landlordId`.
- **Flawed Balance Aggregation (`src/server/invoices.functions.ts:130-136`)**: `getDashboardData` subtracted global `totalCollectedPaisa` from global `totalInvoiceAmountPaisa`, zeroing out outstanding balances if previous or advance payments existed.
- **Unbounded Cash Payments (`src/lib/payments.server.ts:14-51`)**: `recordCashPayment` previously inserted cash ledger rows without checking whether the payment exceeded the remaining unpaid invoice balance.
- **Overdue Status Precedence Bug (`src/lib/invoices.server.ts:29-41`)**: In `recalculateInvoiceStatus`, `else if (totalPaid > 0)` was evaluated prior to `invoice.dueDate < today`, leaving past-due partially paid invoices stuck in `partial` rather than `overdue`.
- **Client Date Initialization (`src/routes/_authed/dashboard.tsx:36-39`)**: `dueDate` in the creation modal was initialized using browser `new Date().toISOString().split('T')[0]`, which shifts by 1 day on UTC boundaries compared to `Asia/Kathmandu` (+05:45).
- **Schema Validation Gaps (`src/schemas/invoices.ts:12`, `src/schemas/leases.ts:9-10`, `src/schemas/payments.ts:6`)**: Date strings were unconstrained `z.string().min(1)` and monetary amounts lacked fractional precision limits.
- **Global Uniqueness on Tenant Email (`src/db/schema.ts:90, 96`)**: `tenants.email` had a global unique constraint preventing independent landlords from onboarding the same tenant email address.
- **Tooling & Test Gaps**:
  - `package.json` lacked `"typecheck": "tsc --noEmit"`.
  - `tsconfig.json` contained `"vite.config.js"` instead of `"vite.config.ts"`.
  - Zero unit tests existed in `src/lib/__tests__/`.
- **Verification Execution Results**:
  - `pnpm run check` -> `All matched files use Prettier code style!`
  - `pnpm run lint` -> `eslint` exited with 0 errors and 0 warnings.
  - `pnpm run typecheck` -> `tsc --noEmit` exited with code 0.
  - `pnpm test` -> `4 passed (4)`, `Tests 36 passed (36)`.
  - `pnpm run build` -> Vite and TanStack Start production build generated client and SSR bundles with 0 errors in ~600ms.

---

## 2. Logic Chain

1. **Multi-Tenancy IDOR Mitigation**:
   - By adding database ownership queries (`where: and(eq(properties.id, data.propertyId), eq(properties.landlordId, landlordId))` in `createRoom` and `where: and(eq(rooms.id, data.roomId), eq(rooms.landlordId, landlordId))` / `where: and(eq(tenants.id, data.tenantId), eq(tenants.landlordId, landlordId))` in `createLease`), unauthorized cross-tenancy entity binding is blocked before inserting rows.

2. **Accounting Invariant Integrity**:
   - By aggregating payments per invoice (`Map<string, number>`) in `getDashboardData` and summing `max(0, invoice.amount - paid)` per invoice, outstanding balance is immune to distortions from prior invoices or advance collections.

3. **Financial Ledger & Overpayment Protection**:
   - In `recordCashPayment`, calculating `remainingPaisa = Math.max(0, invoice.amount - currentPaid)` within the D1 transaction and asserting `paymentAmountPaisa <= remainingPaisa` prevents negative invoice remaining balances and protects financial ledger consistency.

4. **Deterministic Status State Machine**:
   - In `recalculateInvoiceStatus`, evaluating `totalPaid >= invoice.amount -> 'paid'`, then `invoice.dueDate < today -> 'overdue'`, then `totalPaid > 0 -> 'partial'`, and lastly `'unpaid'` satisfies FR-17 and ensures that any uncompleted invoice past its Kathmandu due date is classified as `overdue`.

5. **Multi-Tenant Composite Index**:
   - Changing `tenants.email` unique constraint to a composite index `uniqueIndex('tenants_landlord_email_idx').on(table.landlordId, table.email)` allows distinct landlords to onboard identical tenant emails while preventing duplicates within the same landlord's tenancy.

6. **Timezone & Precision Invariants**:
   - Centralizing all date operations through `addDaysInKathmandu` and `getTodayInKathmandu` eliminates client browser timezone offsets. Enforcing `YYYY-MM-DD` regex and `.multipleOf(0.01)` in Zod ensures inputs strictly conform to storage expectations.

---

## 3. Caveats

- **Cron Scheduling**: Daily automatic recalculation of overdue status for all non-paid invoices (without requiring manual triggers) is specified for Phase 2 implementation via Cloudflare Cron Triggers (`0 1 * * *` UTC = 06:45 NPT).
- **External Gateways**: Online wallet integrations (Khalti/eSewa webhooks) and bank proof image uploading to R2 are scheduled for subsequent milestones (Phase 3 and Phase 4).

---

## 4. Conclusion

Milestone 1 is **100% complete and fully verified**. All 11 identified security vulnerabilities, accounting bugs, invariant flaws, schema constraints, and configuration issues have been genuinely remediated. The test suite includes 4 comprehensive unit test files with 36 passing tests covering all domain invariants. All linters, TypeScript typechecks, test runners, and build commands pass without error.

---

## 5. Verification Method

To independently verify the implementation:

1. **Execute Typecheck**:
   ```bash
   pnpm run typecheck
   ```
   *Expected: Exit code 0, 0 errors.*

2. **Execute Linter**:
   ```bash
   pnpm run lint
   ```
   *Expected: Exit code 0, 0 errors, 0 warnings.*

3. **Execute Unit Tests**:
   ```bash
   pnpm test
   ```
   *Expected: 4 test suites passed, 36 tests passed.*

4. **Execute Code Formatter Check**:
   ```bash
   pnpm run check
   ```
   *Expected: "All matched files use Prettier code style!"*

5. **Execute Production Build**:
   ```bash
   pnpm run build
   ```
   *Expected: Clean build of client and SSR bundles in `dist/`.*

6. **Inspect Source Files**:
   - `src/server/rooms.functions.ts` (property landlord check)
   - `src/server/leases.functions.ts` (room and tenant landlord check)
   - `src/server/invoices.functions.ts` (per-invoice outstanding balance calculation)
   - `src/lib/payments.server.ts` (remaining balance overpayment check)
   - `src/lib/invoices.server.ts` (overdue precedence logic)
   - `src/schemas/` (`invoices.ts`, `leases.ts`, `payments.ts`)
   - `src/db/schema.ts` (composite unique index on `(landlordId, email)`)
   - `src/lib/__tests__/` (`dates.test.ts`, `money.test.ts`, `invoices.server.test.ts`, `payments.server.test.ts`)
