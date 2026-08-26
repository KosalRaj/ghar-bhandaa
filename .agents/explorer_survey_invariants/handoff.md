# Handoff Report: Domain Invariants & Security Audit

**Task:** Domain Invariants & Security Audit of the `ghar-bhandaa` Codebase  
**Working Directory:** `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/explorer_survey_invariants`  
**Date:** 2026-08-26  
**Type:** Hard Handoff (Complete)

---

## 1. Observation

Direct observations from source code inspection:

1. **Missing Foreign Key Ownership in `createRoom` & `createLease`**:
   - `src/server/rooms.functions.ts:36-46`:
     ```typescript
     await db.insert(rooms).values({
       id,
       landlordId,
       propertyId: data.propertyId, // Unverified
       name: data.name,
       floor: data.floor || null,
       description: data.description || null,
       isActive: data.isActive ?? true,
       createdAt: new Date().toISOString(),
     })
     ```
   - `src/server/leases.functions.ts:47-59`:
     ```typescript
     await db.insert(leases).values({
       id,
       landlordId,
       roomId: data.roomId, // Unverified
       tenantId: data.tenantId, // Unverified
       rentAmount: rentAmountPaisa,
       depositAmount: depositAmountPaisa,
       billingDay: data.billingDay,
       startDate: data.startDate,
       endDate: data.endDate || null,
       status: 'active',
       createdAt: new Date().toISOString(),
     })
     ```
   Neither function queries the database to verify that `data.propertyId`, `data.roomId`, or `data.tenantId` belong to `context.landlordId`.

2. **Flawed Outstanding Balance Calculation in `getDashboardData`**:
   - `src/server/invoices.functions.ts:128-136`:
     ```typescript
     const totalCollectedPaisa = confirmedPayments.reduce((acc, p) => acc + p.amount, 0)
     let totalInvoiceAmountPaisa = 0
     for (const inv of allInvoices) {
       totalInvoiceAmountPaisa += inv.amount
     }
     const totalOutstandingPaisa = Math.max(0, totalInvoiceAmountPaisa - totalCollectedPaisa)
     ```
   Outstanding balance is calculated by subtracting global confirmed payments from total invoices across all leases and periods.

3. **Missing Remaining Balance Check in `recordCashPayment`**:
   - `src/lib/payments.server.ts:34-45`:
     ```typescript
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
     ```
   Backend executes cash payments without checking if `paymentAmountPaisa <= (invoice.amount - alreadyPaid)`.

4. **Status Derivation Priority for Overdue Invoices**:
   - `src/lib/invoices.server.ts:29-41`:
     ```typescript
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
     ```
   If `0 < totalPaid < invoice.amount` and `dueDate < today`, status evaluates to `'partial'` and never to `'overdue'`.

5. **Client-Side Timezone Drift**:
   - `src/routes/_authed/dashboard.tsx:36-39`:
     ```typescript
     const [dueDate, setDueDate] = useState(() => {
       const today = new Date()
       today.setDate(today.getDate() + 7)
       return today.toISOString().split('T')[0]
     })
     ```
   Uses local browser timezone and `toISOString()` which skews date near UTC day boundaries.

6. **Global Unique Constraint on `tenants.email`**:
   - `src/db/schema.ts:90`:
     `email: text('email').notNull().unique()`
   A global unique constraint exists across all landlords.

7. **Middleware Protection**:
   - `src/middleware/auth.ts:7-44`: `landlordAuthMiddleware` is applied to all 14 data-access server functions across `properties.functions.ts`, `rooms.functions.ts`, `tenants.functions.ts`, `leases.functions.ts`, `invoices.functions.ts`, and `payments.functions.ts`.

---

## 2. Logic Chain

1. **Authorization & IDOR Security**:
   - Observation 1 shows `createRoom` and `createLease` accept foreign entity IDs (`propertyId`, `roomId`, `tenantId`) from the client without scoping them to `landlordId`.
   - In `getRooms` (`src/server/rooms.functions.ts:25`) and `getLeases` (`src/server/leases.functions.ts:30-32`), SQL inner joins pull associated entity names based on the foreign key.
   - Therefore, a malicious landlord can assign another landlord's property, room, or tenant to their own record and read foreign entity details and tenant PII, violating multi-tenant isolation (NFR-8).

2. **Accounting Invariant & Financial Integrity**:
   - Observation 2 demonstrates that `totalOutstandingPaisa` is computed as `totalInvoiceAmount - totalCollected`.
   - If an invoice is overpaid or payments exist from older invoices not in the active view, the global collected amount reduces the apparent outstanding amount of other unpaid invoices.
   - Therefore, the dashboard can report NPR 0 outstanding despite active unpaid invoices existing, violating reporting accuracy (FR-38).
   - Furthermore, Observation 3 shows the server lacks remaining balance validation on payments, allowing arbitrary overpayments.

3. **Status Derivation Invariant**:
   - Observation 4 shows `totalPaid > 0` branches to `'partial'` before checking `invoice.dueDate < today`.
   - Therefore, any invoice that received a partial payment (e.g. 500 NPR on a 15,000 NPR invoice) will remain in status `'partial'` indefinitely after its due date, failing to be reported in `overdueInvoicesCount` or triggering overdue reminders (FR-17).

4. **Multi-Tenancy Scalability**:
   - Observation 6 shows `tenants.email` is globally unique.
   - If Landlord A onboards `user@example.com`, Landlord B cannot onboard `user@example.com`.
   - Therefore, true multi-tenancy is blocked until the index is made composite on `(landlord_id, email)` (NFR-14).

---

## 3. Caveats

- Unsandboxed terminal commands timed out in this environment; all findings were established via static code analysis and AST review.
- Cloudflare Cron Trigger (`src/routes/api/cron/run.ts`) and online wallet webhooks (Khalti / eSewa) are specified in PLAN.md (Phases 2-4) but not yet implemented in `src/`.
- No additional caveats.

---

## 4. Conclusion

The codebase successfully enforces integer paisa storage across all tables, leverages `landlordAuthMiddleware` across all data-access server functions, and maintains an append-only payment ledger. However, **11 specific issues** (including 2 High IDOR authorization gaps, 1 High accounting calculation flaw, and 1 High overpayment vulnerability) require immediate resolution as detailed in `analysis.md`.

All issues have precise file locations and ready-to-apply remediation patches documented in `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/explorer_survey_invariants/analysis.md`.

---

## 5. Verification Method

To verify these findings independently:

1. **Verify IDOR vulnerability in `createRoom` & `createLease`**:
   - Inspect `src/server/rooms.functions.ts` lines 30-47 and `src/server/leases.functions.ts` lines 37-61.
   - Check whether `data.propertyId`, `data.roomId`, or `data.tenantId` are queried with `landlordId`.
2. **Verify Outstanding Balance calculation**:
   - Inspect `src/server/invoices.functions.ts` lines 128-136 and trace the subtraction `totalInvoiceAmountPaisa - totalCollectedPaisa`.
3. **Verify Status Derivation precedence**:
   - Inspect `src/lib/invoices.server.ts` lines 29-41 and trace execution when `totalPaid = 100`, `invoice.amount = 10000`, `invoice.dueDate = '2020-01-01'`.
4. **Verify Schema Constraints**:
   - Inspect `src/db/schema.ts` lines 87-97 and `drizzle/0000_clear_punisher.sql` line 167 for `tenants.email` uniqueness.
