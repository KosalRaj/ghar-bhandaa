# Handoff Report: Challenger 2 (Milestone 1)

## 1. Observation

1. **Codebase Inspection**:
   - `src/server/rooms.functions.ts` (lines 37-46): In `createRoom`, the property ownership check is enforced via:
     ```ts
     const property = await db.query.properties.findFirst({
       where: and(
         eq(properties.id, data.propertyId),
         eq(properties.landlordId, landlordId),
       ),
     })
     if (!property) {
       throw new Error('Property not found or unauthorized')
     }
     ```
   - `src/server/leases.functions.ts` (lines 45-63): In `createLease`, room and tenant ownership are validated via `Promise.all`:
     ```ts
     const [room, tenant] = await Promise.all([
       db.query.rooms.findFirst({
         where: and(eq(rooms.id, data.roomId), eq(rooms.landlordId, landlordId)),
       }),
       db.query.tenants.findFirst({
         where: and(
           eq(tenants.id, data.tenantId),
           eq(tenants.landlordId, landlordId),
         ),
       }),
     ])
     if (!room) throw new Error('Room not found or unauthorized')
     if (!tenant) throw new Error('Tenant not found or unauthorized')
     ```
   - `src/lib/payments.server.ts` (lines 19-50): In `recordCashPayment`:
     ```ts
     return await db.transaction(async (tx) => {
       const invoice = await tx.query.invoices.findFirst({
         where: and(
           eq(invoices.id, input.invoiceId),
           eq(invoices.landlordId, landlordId),
         ),
       })
       if (!invoice) throw new Error(`Invoice not found or access denied`)
       const existingPayments = await tx.query.payments.findMany({
         where: and(
           eq(payments.invoiceId, invoice.id),
           eq(payments.status, 'confirmed'),
         ),
       })
       const currentPaid = existingPayments.reduce((acc, p) => acc + p.amount, 0)
       const remainingPaisa = Math.max(0, invoice.amount - currentPaid)
       const paymentAmountPaisa = nprToPaisa(input.amountNpr)
       if (paymentAmountPaisa <= 0) throw new Error('Payment amount must be greater than 0')
       if (paymentAmountPaisa > remainingPaisa) {
         throw new Error(`Payment amount exceeds remaining balance of ${formatNpr(remainingPaisa)}`)
       }
     ```
   - `src/db/schema.ts` (lines 125-128): In `tenants` table definition:
     ```ts
     (table) => [
       index('tenants_landlord_idx').on(table.landlordId),
       uniqueIndex('tenants_landlord_email_idx').on(table.landlordId, table.email),
     ]
     ```

2. **Test Execution & Tool Output**:
   - Command: `pnpm run typecheck && pnpm run lint && pnpm test`
   - Output:
     - TypeScript compilation: `tsc --noEmit` exited with code 0 (0 errors).
     - Linter: `eslint` exited with code 0 (0 warnings/errors).
     - Test runner: `vitest run` executed 6 test suites and 73 test cases with 100% passing rate:
       - `src/lib/__tests__/challenger_m1_2.test.ts` (21 tests passed)
       - `src/lib/__tests__/invoices.server.test.ts` (10 tests passed)
       - `src/lib/__tests__/payments.server.test.ts` (5 tests passed)
       - `src/lib/__tests__/dates.test.ts` (14 tests passed)
       - `src/lib/__tests__/money.test.ts` (11 tests passed)

---

## 2. Logic Chain

1. **Step 1 (Cross-Landlord IDOR)**:
   - *From Observation 1*: In `createRoom`, `createLease`, and `recordCashPayment`, queries verify that the referenced foreign entity contains `landlordId === authenticated landlordId`.
   - *Inference*: Any cross-landlord attempt to attach a room to another landlord's property, a lease to another landlord's room or tenant, or a payment to another landlord's invoice will resolve to `undefined` and throw an unauthorized error.
   - *Empirical Proof*: Tests in `src/lib/__tests__/challenger_m1_2.test.ts` demonstrate that all IDOR permutations throw expected unauthorized errors and create 0 database records.

2. **Step 2 (Composite Tenant Email Index)**:
   - *From Observation 1*: `tenants` uses a composite index `(landlord_id, email)`. `tenants.email` does not have a table-level global unique constraint, whereas `user.email` and `landlords.email` do.
   - *Inference*: Multiple landlords can register the same email address for distinct tenant records, while a single landlord cannot insert duplicate tenant emails.
   - *Empirical Proof*: Schema inspection via `getTableConfig(tenants)` confirms index configuration, and empirical tests prove cross-landlord tenant email coexistence while enforcing duplicate rejection per landlord.

3. **Step 3 (Cash Payment Overpayment Limit & Transactions)**:
   - *From Observation 1*: `recordCashPayment` wraps balance verification, payment insertion, and invoice status recalculation inside a single `db.transaction(async (tx) => ...)`.
   - *Inference*: Payment amounts greater than remaining balance or <= 0 paisa throw immediately before insertion. In the event of an error, the transaction rolls back cleanly without phantom records or status drift.
   - *Empirical Proof*: Stress tests verify exact payments, sub-rupee overpayments (+0.01 NPR), sequential partial payments to 0 balance, negative amount rejections, and transaction rollback.

---

## 3. Caveats

1. **SQLite Binary Collation on Emails**: SQLite indexes default to binary collation unless specified with `COLLATE NOCASE`. Email uniqueness within a landlord's namespace is case-sensitive at the database level unless input emails are normalized to lowercase by the application layer.
2. **Silent Mutation Returns on Update Endpoints**: Update endpoints (`updateRoom`, `updateProperty`, `updateTenant`, `endLease`) use SQL `WHERE id = ? AND landlord_id = ?`. If a landlord passes an ID belonging to another landlord, 0 rows are updated and no exception is thrown. While safe against IDOR, client callers receive the ID rather than a 404/403.

---

## 4. Conclusion

- **Verdict**: **VERIFIED PASS (ALL INVARIANTS SATISFIED)**.
- The multi-tenancy authorization barriers, composite tenant index rules, integer paisa arithmetic, and cash payment transaction limits are verified empirically with 0 failures across all stress harnesses.

---

## 5. Verification Method

To independently verify all claims in this report:

```bash
# 1. Typecheck
pnpm run typecheck

# 2. Lint
pnpm run lint

# 3. Vitest test suite including Challenger 2 empirical suite
pnpm test
```

Files to inspect:
- `/Volumes/Acasis2TB/playground/ghar-bhandaa/src/lib/__tests__/challenger_m1_2.test.ts`
- `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/challenger_m1_2/challenge.md`
- `/Volumes/Acasis2TB/playground/ghar-bhandaa/src/lib/payments.server.ts`
- `/Volumes/Acasis2TB/playground/ghar-bhandaa/src/server/rooms.functions.ts`
- `/Volumes/Acasis2TB/playground/ghar-bhandaa/src/server/leases.functions.ts`
