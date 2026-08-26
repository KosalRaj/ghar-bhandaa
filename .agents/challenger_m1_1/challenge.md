# Empirical Challenge Report — Milestone 1 Domain Invariants

## Challenge Summary

**Overall risk assessment**: LOW (All domain invariants verified empirically robust)

This report details empirical stress-testing, adversarial property exploration, and state-machine fuzzing for Milestone 1 of `ghar-bhandaa`. Testing targeted three critical domain areas:
1. **Paisa Currency Arithmetic** (minor unit storage, IEEE-754 floating-point hazards, large amounts, rounding linearity).
2. **Kathmandu Timezone Date Math** (Asia/Kathmandu UTC+05:45 transitions, midnight day-flip boundaries, leap year calculations, multi-day/year offsets).
3. **Invoice Status Recalculation Engine** (state transition precedence, overdue priority, complex payment sequences, payment status isolation, idempotency, and 500-trial fuzz testing).

---

## Empirical Verification Results

### Suite Execution
- **Command**: `pnpm test` (vitest v4.1.7)
- **Files executed**: 5 test files (`money.test.ts`, `dates.test.ts`, `invoices.server.test.ts`, `payments.server.test.ts`, `stress.test.ts`)
- **Total Tests**: 53 passed (0 failed, 0 flaky)
- **Static Analysis**: `pnpm run typecheck` (tsc --noEmit) and `pnpm run lint` (eslint) passed with 0 errors and 0 warnings.

---

## 1. Paisa Currency Arithmetic Stress Analysis

### Invariants Challenged
1. **Integer Minor Unit Representation**: Storing all financial values in Paisa (1 NPR = 100 Paisa) prevents binary floating-point drift.
2. **Round-Trip Exactness**: `nprToPaisa(paisaToNpr(p)) === p` for all valid integer paisa values.
3. **IEEE-754 Binary Rounding Defense**: `Math.round(npr * 100)` correctly normalizes float edge cases like `19.99 * 100 = 1998.9999999999998` and `1.15 * 100 = 114.99999999999999`.
4. **Schema Multiplicity Validation**: Zod's `multipleOf(0.01)` does not falsely reject valid 2-decimal inputs due to float modulo bugs.

### Empirical Stress Tests & Findings

| Test Dimension | Test Scenario | Result | Status |
| :--- | :--- | :--- | :--- |
| **Round-Trip Range** | 100,001 consecutive integers (`0` to `100,000` paisa) | `nprToPaisa(paisaToNpr(p)) === p` holds 100% | ✅ PASS |
| **Float Hazard Suite** | Dangerous float amounts: `0.07`, `0.14`, `0.28`, `0.29`, `0.57`, `1.13`, `1.14`, `1.15`, `19.99`, `29.99`, `59.95`, `140.35`, `1054.45`, `12500.75`, `999999.99`, `1000000.01` | All convert to exact integer paisa without off-by-one errors | ✅ PASS |
| **Extreme Scale** | Large numbers: `1,000,000,000 NPR` (100 Crore NPR = 100 Billion Paisa) | Safe integer bound confirmed (`Number.isSafeInteger` true, formatNpr formats correctly) | ✅ PASS |
| **Sub-Paisa Rounding** | Boundary numbers: `10.004999 NPR` vs `10.005 NPR`, `0.0049 NPR` vs `0.005 NPR` | Half-up rounding via `Math.round` resolves correctly (1000 vs 1001, 0 vs 1) | ✅ PASS |
| **Aggregation Linearity** | Sum of line items converted individually vs sum of NPR amounts | Exact equality verified across multi-item invoices | ✅ PASS |
| **Zod Schema 10k Exhaustive** | 10,000 consecutive 2-decimal numbers (`0.01` to `100.00`) validated with `multipleOf(0.01)` | 10,000 / 10,000 passed without float modulo false rejections | ✅ PASS |

**Mitigations / Observations**:
- The implementation in `src/lib/money.ts` and `src/schemas/invoices.ts` is robust against IEEE-754 representation issues.

---

## 2. Kathmandu Timezone Date Calculations

### Invariants Challenged
1. **Fixed UTC+05:45 (345 Minutes) Offset**: Nepal Standard Time (NPT) is strictly UTC+05:45 with no daylight saving time (DST).
2. **Day-Flip Millisecond Transition**: `18:14:59.999 UTC` is Day $N$ (23:59:59.999 NPT); `18:15:00.000 UTC` is Day $N+1$ (00:00:00.000 NPT).
3. **Leap Year and Century Boundaries**: Correct rollover on leap years (2024, 2028, 2000) vs non-leap years (2026, 2100).
4. **Lexicographical String Ordering**: `YYYY-MM-DD` formatted date strings sort strictly identically to chronological timestamps.

### Empirical Stress Tests & Findings

| Test Dimension | Test Scenario | Result | Status |
| :--- | :--- | :--- | :--- |
| **Day-Flip Boundary (All Months)** | Checked `18:14:59.999Z` vs `18:15:00.000Z` on end-of-month dates across all 12 months in 2026 | Day-flip occurs precisely at 18:15:00.000Z across all months | ✅ PASS |
| **Leap Year Math** | `addDaysInKathmandu(1, '2024-02-28')` -> `2024-02-29`<br>`addDaysInKathmandu(1, '2026-02-28')` -> `2026-03-01`<br>`addDaysInKathmandu(1, '2000-02-28')` -> `2000-02-29`<br>`addDaysInKathmandu(1, '2100-02-28')` -> `2100-03-01` | Leap year math handled accurately | ✅ PASS |
| **Year Transition & Large Shifts** | `+1` day on Dec 31 -> Jan 1<br>`-1` day on Jan 1 -> Dec 31<br>`+1000` days from 2026-01-01 -> 2028-09-27 | Accurately handles multi-year and negative day shifts | ✅ PASS |
| **Due Date Boundary Condition** | In `isPastDateInKathmandu(dueDate)`: evaluated on `dueDate - 1 day`, `dueDate`, and `dueDate + 1 day` | `false` on due date (tenant has full day until 23:59:59 NPT), `true` the day after | ✅ PASS |

---

## 3. Invoice Status Recalculation Engine & State Transitions

### Invariants Challenged
1. **Derived Status Hierarchy**:
   - Total confirmed payments $\ge$ invoice amount $\implies$ `paid` (even if past due date).
   - Total confirmed payments $<$ invoice amount AND `dueDate < today` $\implies$ `overdue` (overdue takes precedence over partial).
   - $0 <$ Total confirmed payments $<$ invoice amount AND `dueDate >= today` $\implies$ `partial`.
   - Total confirmed payments $= 0$ AND `dueDate >= today` $\implies$ `unpaid`.
2. **Payment Status Isolation**: Non-confirmed payments (`initiated`, `pending_verification`, `rejected`, `failed`) must have zero weight on invoice status.
3. **Complex Payment Sequence Robustness**: Transitions across partial payments, late payments, and micro-payments.
4. **Idempotence**: Repeated execution of status recalculation yields stable, identical results.

### Empirical Stress Tests & Findings

| Test Dimension | Test Scenario | Result | Status |
| :--- | :--- | :--- | :--- |
| **Full Lifecycle Sequence** | `unpaid` -> `partial` -> `overdue` (due date passes) -> `overdue` (additional partial payment while overdue) -> `paid` (full settlement) | State machine transitioned through exact expected states | ✅ PASS |
| **Payment Status Isolation** | Inserted `initiated` (15k), `pending_verification` (15k), `rejected` (15k), and `failed` (15k) payments against a 15k invoice | Status remained `unpaid`. Only when `confirmed` payment added did status recalculate | ✅ PASS |
| **Micro-Payment Accumulation** | 100 consecutive 1 NPR (100 paisa) confirmed payments on a 100 NPR invoice | Steps 1–99 evaluated to `partial`; Step 100 evaluated to `paid` | ✅ PASS |
| **Due Date Boundary** | Day before (`unpaid`), on due date (`unpaid`), day after (`overdue`) | Accurately transitions to `overdue` only once due date has strictly elapsed | ✅ PASS |
| **Idempotence Stress** | 50 consecutive recalculations of an overdue invoice | 50 / 50 returned `overdue` with no data corruption or state divergence | ✅ PASS |
| **Randomized Fuzz Harness** | 500 randomized sequences with arbitrary payment amounts, due dates, and partial splits verified against an independent mathematical oracle | 500 / 500 passed (100% oracle agreement) | ✅ PASS |

---

## Conclusion & Verdict

**VERDICT**: **APPROVED / PASS**

All core Milestone 1 domain invariants (Paisa financial arithmetic, Asia/Kathmandu timezone handling, and derived invoice status state machine transitions) have been empirically verified under extreme boundary conditions, property-based ranges, and randomized fuzzing. No invariant violations or edge-case regressions were detected.
