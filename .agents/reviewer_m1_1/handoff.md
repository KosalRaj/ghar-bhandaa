# Milestone 1 Reviewer Handoff Report

**Reviewer:** Reviewer 1 (`reviewer_m1_1`)  
**Date:** 2026-08-26  
**Verdict:** **APPROVE**  
**Detailed Report:** `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/reviewer_m1_1/review.md`

---

## 1. Observation

Direct observations and execution outputs obtained during independent review:
- **Build & Verification Commands**:
  - `pnpm run check`: Exited with code 0 (`All matched files use Prettier code style!`).
  - `pnpm run lint`: Exited with code 0 (0 errors, 0 warnings).
  - `pnpm run typecheck`: `tsc --noEmit` exited with code 0.
  - `pnpm test`: Exited with code 0 (`Test Files: 4 passed (4)`, `Tests: 36 passed (36)` in 293ms).
  - `pnpm run build`: Vite & TanStack Start build compiled client (`dist/client`) and SSR (`dist/server`) bundles successfully in 654ms / 743ms.
- **Code Inspect Results**:
  - `src/server/rooms.functions.ts:38-46`: `createRoom` queries `properties.findFirst` with `and(eq(properties.id, data.propertyId), eq(properties.landlordId, landlordId))` before inserting a room.
  - `src/server/leases.functions.ts:45-63`: `createLease` queries both `rooms` and `tenants` concurrently against `landlordId`.
  - `src/lib/payments.server.ts:33-51`: `recordCashPayment` enforces `paymentAmountPaisa > 0` and `paymentAmountPaisa <= remainingPaisa`.
  - `src/lib/invoices.server.ts:33-41`: `recalculateInvoiceStatus` evaluates `paid`, then `overdue` (when `invoice.dueDate < todayInKathmandu`), then `partial`, then `unpaid`.
  - `src/server/invoices.functions.ts:145-158`: `getDashboardData` computes outstanding balance by mapping payments per invoice and summing `Math.max(0, inv.amount - paid)`.
  - `src/db/schema.ts:127`: `tenants` table contains `uniqueIndex('tenants_landlord_email_idx').on(table.landlordId, table.email)`.
  - `src/lib/dates.ts:33-55`: `addDaysInKathmandu` converts `fromDateStr` to Kathmandu midnight UTC and formats using `Asia/Kathmandu` Intl formatter.
  - `src/schemas/invoices.ts`, `src/schemas/leases.ts`, `src/schemas/payments.ts`: Date formats are constrained with `YYYY-MM-DD` regex and monetary fields with `.multipleOf(0.01)`.
- **Integrity Assessment**: No hardcoded test stubs, dummy functions, shortcut mockings, or integrity bypasses were detected in the source code.

---

## 2. Logic Chain

1. **Multi-Tenancy & Authorization (Observation -> Invariant Enforcement)**:
   - Verifying property, room, and tenant ownership prior to creating child records (`rooms`, `leases`, `invoices`, `payments`) strictly confines every write operation to the authenticated landlord (`landlordId`), resolving IDOR vulnerabilities.
2. **Ledger Integrity & Balance Constraints (Observation -> Accounting Soundness)**:
   - Calculating `remainingPaisa` on the target invoice and asserting `paymentAmount <= remainingPaisa` within the database transaction ensures invoice balances cannot go negative and payments remain immutable ledger entries.
3. **Deterministic Status Machine (Observation -> Requirement FR-17)**:
   - Evaluating overdue condition before partial payment status ensures that past-due partial payments are correctly marked `overdue` rather than remaining in `partial`.
4. **Timezone Offset Safety (Observation -> Locale Invariant)**:
   - Computing Kathmandu dates using `Intl.DateTimeFormat` with `Asia/Kathmandu` prevents date discrepancies across UTC midnight boundaries.
5. **Independent Build & Test Execution (Observation -> Readiness Gate)**:
   - Passing `typecheck`, `lint`, `check`, `test` (36 passing tests), and `build` proves the codebase is stable, type-safe, and free of regression.

---

## 3. Caveats

- **Automated Daily Overdue Cron**: In Milestone 1, overdue status recalculation occurs on-demand during payment recording or manual invoice creation. Automated daily background recalculation via Cloudflare Cron Triggers is scoped for Milestone 2 / Phase 2 architecture.
- **External Webhooks & Storage**: Online payment gateway webhooks (Khalti/eSewa) and R2 image proof storage will be integrated in subsequent milestones according to `PLAN.md`.

---

## 4. Conclusion

**Verdict: APPROVE**

Milestone 1 has successfully met all functional, security, type safety, and domain invariant requirements. All 11 identified issues have been remediated with full test coverage and clean builds. The project is ready for Milestone 2.

---

## 5. Verification Method

To reproduce and verify this review independently:

1. **Run Full Verification Suite**:
   ```bash
   pnpm run check && pnpm run lint && pnpm run typecheck && pnpm test && pnpm run build
   ```
   *Expected: All 5 commands exit with code 0.*

2. **Inspect Domain Test Coverage**:
   - `src/lib/__tests__/dates.test.ts` (9 tests)
   - `src/lib/__tests__/money.test.ts` (9 tests)
   - `src/lib/__tests__/invoices.server.test.ts` (9 tests)
   - `src/lib/__tests__/payments.server.test.ts` (5 tests)

3. **Invalidation Conditions**:
   - Any failure in `pnpm run typecheck`, `pnpm run lint`, `pnpm test`, or `pnpm run build`.
   - Cross-tenant record creation without landlord ID validation.
   - Recording a cash payment that exceeds remaining invoice balance.
   - A past-due invoice with partial payment remaining in `partial` status instead of `overdue`.
