# Milestone 1 Handoff Report: Reviewer 2 (Adversarial Review)

## 1. Observation

Direct observations and evidence collected during the adversarial review:
- **Integrity Audit**: Checked source files (`src/lib/dates.ts`, `src/lib/money.ts`, `src/lib/invoices.server.ts`, `src/lib/payments.server.ts`, `src/server/*.functions.ts`, `src/middleware/auth.ts`, `src/routes/`) and test suites (`src/lib/__tests__/*.test.ts`). Zero hardcoded outputs, fake facades, or integrity violations were found.
- **Multi-Tenancy Verification**:
  - `src/server/rooms.functions.ts:38-46`: Verifies `property.landlordId === landlordId` before creating room.
  - `src/server/leases.functions.ts:45-63`: Verifies `room.landlordId === landlordId` and `tenant.landlordId === landlordId` via `Promise.all` before inserting lease.
  - `src/db/schema.ts:127`: Replaced global email uniqueness with composite `uniqueIndex('tenants_landlord_email_idx').on(table.landlordId, table.email)`.
- **Accounting & Balance Calculation**:
  - `src/server/invoices.functions.ts:145-157`: `getDashboardData` computes outstanding balance by mapping confirmed payments per invoice ID and summing `max(0, invoice.amount - paid)`.
- **Financial Ledger & Overpayment Guard**:
  - `src/lib/payments.server.ts:33-51`: `recordCashPayment` verifies `invoice.landlordId === landlordId`, computes remaining unpaid balance in paisa within `tx`, rejects non-positive amounts and amounts exceeding remaining balance.
- **State Machine Priority**:
  - `src/lib/invoices.server.ts:33-41`: `recalculateInvoiceStatus` evaluates `totalPaid >= invoice.amount` first, then `invoice.dueDate < today` second, ensuring partially paid past-due invoices transition to `overdue`.
- **Timezone Invariants**:
  - `src/lib/dates.ts:6-55`: Accurately handles `Asia/Kathmandu` (UTC+05:45) using `Intl.DateTimeFormat` and offset arithmetic without client browser drift.
- **Verification Execution Results**:
  - `pnpm run check` -> PASSED (Prettier clean)
  - `pnpm run lint` -> PASSED (0 errors, 0 warnings)
  - `pnpm run typecheck` -> PASSED (`tsc --noEmit` exit code 0)
  - `pnpm test` -> PASSED (4 test suites, 36 unit tests passing)
  - `pnpm run build` -> PASSED (Vite client and SSR bundles built successfully)

---

## 2. Logic Chain

1. **Multi-Tenant IDOR Resolution**:
   - The ownership checks in `rooms.functions.ts`, `leases.functions.ts`, `invoices.server.ts`, and `payments.server.ts` guarantee that all entity references and queries are constrained by `context.landlordId`.
2. **Accounting Invariant Integrity**:
   - Per-invoice payment aggregation in `getDashboardData` ensures outstanding balances reflect genuine unpaid amounts and are immune to cancellation by advance or historical payments on other invoices.
3. **Ledger Integrity & Overpayment Barrier**:
   - The remaining balance assertion in `recordCashPayment` ensures that cash transactions cannot create negative balances or overpaid invoice states.
4. **State Machine Invariant**:
   - Evaluating overdue condition before partial payment condition ensures deterministic compliance with FR-17.
5. **Precision & Timezone Consistency**:
   - Enforcing `Math.round(npr * 100)` and `.multipleOf(0.01)` across schemas eliminates floating point anomalies, while Kathmandu-specific formatting guarantees calendar alignment.

---

## 3. Caveats

- **Automated Overdue Cron**: In Milestone 2 (Phase 2), a Cloudflare Cron Trigger (`0 1 * * *` UTC = 06:45 NPT) will be deployed to automatically run `recalculateInvoiceStatus` across all active invoices daily.
- **External Payment Gateways & R2**: Khalti/eSewa online payment verification webhooks and bank slip proof uploads to R2 are scheduled for subsequent milestones (Phases 3 and 4).

---

## 4. Conclusion

**Verdict: APPROVE**

Milestone 1 is complete, secure, and fully verified. All domain invariants, security barriers, accounting aggregations, and test suites meet the highest standards of correctness and code quality.

---

## 5. Verification Method

To independently verify:
```bash
# 1. Check code formatting
pnpm run check

# 2. Run static analysis & linting
pnpm run lint

# 3. Verify TypeScript type safety
pnpm run typecheck

# 4. Run full unit test suite
pnpm test

# 5. Run production build (client + SSR)
pnpm run build
```
Files to inspect:
- `src/server/rooms.functions.ts`
- `src/server/leases.functions.ts`
- `src/server/invoices.functions.ts`
- `src/lib/payments.server.ts`
- `src/lib/invoices.server.ts`
- `src/lib/dates.ts`
- `src/lib/money.ts`
- `src/db/schema.ts`
- `src/lib/__tests__/` (`dates.test.ts`, `money.test.ts`, `invoices.server.test.ts`, `payments.server.test.ts`)
