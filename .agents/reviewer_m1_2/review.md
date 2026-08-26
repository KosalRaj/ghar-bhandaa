# Adversarial & Quality Code Review Report: Milestone 1

**Reviewer:** Reviewer 2 (`reviewer_m1_2`)  
**Role:** Adversarial Critic & Independent Quality Reviewer  
**Milestone:** Milestone 1 — Invariant Audit Fixes, Security Remediation & Test Suite Setup  
**Date:** 2026-08-26  
**Verdict:** **APPROVE**

---

## 1. Executive Summary

An independent, adversarial review and integrity audit was conducted across all codebase changes, schema definitions, server functions, database queries, and unit tests implemented during Milestone 1 of the `ghar-bhandaa` project.

All 11 identified domain invariant gaps, multi-tenancy IDOR vulnerabilities, accounting aggregation bugs, state machine order issues, and tooling deficiencies have been thoroughly investigated, stress-tested, and verified. No integrity violations, shortcuts, facade implementations, or hardcoded dummy assertions were detected.

The test suite contains 4 comprehensive unit test suites comprising 36 tests with 100% pass rates. Static type analysis (`tsc --noEmit`), linter (`eslint`), formatter (`prettier`), and full production build (`vite build` client + SSR) pass with zero errors.

---

## 2. Integrity & Adversarial Audit Matrix

| Integrity & Domain Dimension | Expected Behavior | Code Implementation | Stress Test / Counter-Scenario Result | Status |
|---|---|---|---|---|
| **Integrity Checks** | No hardcoded outputs, fake mocks, or bypasses | Source files implement genuine business & math logic | Inspected `dates.ts`, `money.ts`, `invoices.server.ts`, `payments.server.ts`, and test files. No fabricated artifacts. | **PASS** |
| **Multi-Tenant IDOR (Rooms)** | Landlord cannot attach rooms to another landlord's property | `rooms.functions.ts:37-46` validates property ownership before inserting | Rejected foreign `propertyId` with unauthorized error | **PASS** |
| **Multi-Tenant IDOR (Leases)** | Landlord cannot create leases referencing another landlord's room/tenant | `leases.functions.ts:44-63` verifies `(roomId, landlordId)` and `(tenantId, landlordId)` via `Promise.all` | Rejected unauthorized cross-tenancy room or tenant references | **PASS** |
| **Multi-Tenant Composite Isolation** | Distinct landlords can onboard the same tenant email address | `schema.ts:127` enforces `uniqueIndex('tenants_landlord_email_idx').on(table.landlordId, table.email)` | Landlords have isolated tenant namespaces; global enumeration blocked | **PASS** |
| **Accounting Invariant (Dashboard Balances)** | Outstanding balance must not be wiped out by advance or historical payments on other invoices | `invoices.functions.ts:145-157` aggregates confirmed payments per invoice (`Map<string, number>`) and sums `max(0, inv.amount - paid)` | Evaluated with mix of older paid invoices and new unpaid invoices; outstanding balance reflects exact unpaid sum | **PASS** |
| **Financial Ledger Invariant (Overpayment Barrier)** | Payments cannot exceed remaining invoice balance; negative/zero payments rejected | `payments.server.ts:33-50` calculates `remainingPaisa = max(0, amount - currentPaid)` within D1 transaction and asserts `paymentAmountPaisa <= remainingPaisa` | Attempts to record payments > remaining balance or ≤ 0 throw descriptive error | **PASS** |
| **State Machine Precedence (Overdue Invariant)** | Partially paid invoices past Kathmandu due date must transition to `overdue` | `invoices.server.ts:33-41` checks `totalPaid >= amount -> 'paid'`, then `dueDate < today -> 'overdue'`, then `totalPaid > 0 -> 'partial'`, then `'unpaid'` | Partially paid invoice with past due date correctly evaluates as `overdue` (satisfies FR-17) | **PASS** |
| **Kathmandu Timezone & UTC Offset (+05:45)** | Date arithmetic must not shift across UTC midnight boundaries | `dates.ts` uses `Intl.DateTimeFormat` with `Asia/Kathmandu` and calculates UTC offsets (+345 min) for date addition | 18:14 UTC -> May 15 NPT, 18:15 UTC -> May 16 NPT tested across month and leap-year boundaries | **PASS** |
| **Integer Paisa Invariant** | Floating-point IEEE-754 precision loss must be prevented on all currency calculations | `money.ts` uses `Math.round(npr * 100)` and `paisa / 100`; schemas enforce `.multipleOf(0.01)` | `19.99 * 100` converts to exact 1999 paisa; roundtrip conversions verified | **PASS** |
| **Concurrency & Atomic State Recalculation** | Status recalculation and payment recording must execute in atomic isolation | `recordCashPayment` and `createManualInvoice` execute inside `db.transaction(async (tx) => { ... })` | DB updates are committed atomically within D1 transaction scope | **PASS** |

---

## 3. Detailed Dimension Findings

### 3.1 Security & Multi-Tenant Isolation
- **IDOR in Rooms (`src/server/rooms.functions.ts`)**:
  - The query `db.query.properties.findFirst({ where: and(eq(properties.id, data.propertyId), eq(properties.landlordId, landlordId)) })` effectively blocks foreign property association.
- **IDOR in Leases (`src/server/leases.functions.ts`)**:
  - Parallel validation of `rooms` and `tenants` ensures both entities belong to the calling landlord before lease insertion.
- **Lease Immutability**:
  - Leases are terminated via `endLease` with landlord ID check (`where: and(eq(leases.id, data.id), eq(leases.landlordId, landlordId))`), preventing retroactive mutation of financial terms.

### 3.2 Accounting & Financial Correctness
- **Per-Invoice Balance Summation (`src/server/invoices.functions.ts`)**:
  - `paymentsByInvoice` map indexes confirmed payments by `invoiceId`. `totalOutstandingPaisa` calculates `sum(max(0, inv.amount - paid))`. This avoids catastrophic cross-invoice cancellation.
- **Cash Payment Ledger (`src/lib/payments.server.ts`)**:
  - `recordCashPayment` accurately enforces `paymentAmountPaisa > 0` and `paymentAmountPaisa <= remainingPaisa`.
  - Cash payments are inserted with `method: 'cash'` and `status: 'confirmed'`.
  - `recalculateInvoiceStatus(tx, invoice.id)` is immediately invoked in the same transaction.

### 3.3 State Machine Determinism
- **Invoice Status Evaluation Order (`src/lib/invoices.server.ts`)**:
  ```ts
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
  - If paid in full: status is `'paid'` regardless of due date.
  - If unpaid or partially paid and `dueDate < today`: status is `'overdue'`.
  - If partially paid and `dueDate >= today`: status is `'partial'`.
  - If zero paid and `dueDate >= today`: status is `'unpaid'`.

### 3.4 Input Validation & Type Safety
- `src/schemas/invoices.ts`, `leases.ts`, `payments.ts`, `rooms.ts`, `properties.ts`, and `tenants.ts` strictly enforce:
  - Date format regex `^\d{4}-\d{2}-\d{2}$`
  - Period format regex `^\d{4}-\d{2}$`
  - Currency precision `.multipleOf(0.01)` and positivity constraints
  - Non-empty strings and string length limits (`max(50)`, `max(100)`, `max(500)`)

---

## 4. Adversarial Challenges & Mitigations

### Challenge 1: Concurrent Cash Payment Submissions
- **Scenario**: Two rapid concurrent cash payment requests are submitted for the same invoice.
- **Analysis**: In Cloudflare D1 (SQLite), write transactions acquire an exclusive database lock and execute sequentially. The second transaction reads the updated payment sum committed by the first transaction, and correctly evaluates `remainingPaisa`.
- **Verdict**: Handled safely by SQLite serialization in D1 transactions.

### Challenge 2: Client Date Manipulation
- **Scenario**: A malicious or misconfigured browser clock submits a stale or future `dueDate` or `paymentDate`.
- **Analysis**: Server schemas validate date structure (`YYYY-MM-DD`). Server status calculation uses server-evaluated `getTodayInKathmandu()`, ensuring overdue evaluation is strictly tied to server-side Nepal standard time.
- **Verdict**: Robust against client clock drift.

### Challenge 3: Negative or Floating Point Paisa Edge Cases
- **Scenario**: Submitting `0.001` NPR or negative amounts to corrupt integer arithmetic.
- **Analysis**: Zod schema `.multipleOf(0.01)` rejects sub-paisa decimals, and `nprToPaisa` employs `Math.round(npr * 100)`. `recordCashPayment` throws on `paymentAmountPaisa <= 0`.
- **Verdict**: Robust against sub-paisa and floating-point errors.

---

## 5. Non-Blocking Observations for Future Milestones

1. **Scheduled Daily Overdue Cron**:
   - In Milestone 2 (Phase 2), a Cloudflare Cron Trigger (`0 1 * * *` UTC = 06:45 NPT) should be implemented to sweep all unpaid/partial invoices whose due dates passed and trigger `recalculateInvoiceStatus`.
2. **Timestamp Utility Consistency**:
   - `getCurrentDateTimeInKathmandu()` returns UTC ISO string (`new Date().toISOString()`). Direct uses of `new Date().toISOString()` in `properties.functions.ts` and `tenants.functions.ts` are functionally identical, but can be unified under `getCurrentDateTimeInKathmandu()` in docs/refactor passes.

---

## 6. Verification Results

| Verification Suite | Command | Result |
|---|---|---|
| **Code Style** | `pnpm run check` | PASSED (Prettier clean) |
| **Linter** | `pnpm run lint` | PASSED (0 errors, 0 warnings) |
| **Type Check** | `pnpm run typecheck` | PASSED (`tsc --noEmit` exit code 0) |
| **Unit Test Suite** | `pnpm test` | PASSED (4 suites, 36 tests passing) |
| **Production Build** | `pnpm run build` | PASSED (Client + SSR bundles built in ~600ms) |

---

## 7. Review Verdict

**Final Verdict**: **APPROVE**  
The Milestone 1 implementation is robust, complete, strictly adheres to all architectural domain invariants, and passes all verification standards.
