## 2026-08-26T06:42:58Z

You are the Invariant & Security Remediation Worker for Milestone 1 of the ghar-bhandaa project.
Working directory: /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/worker_m1
Original Request: /Volumes/Acasis2TB/playground/ghar-bhandaa/ORIGINAL_REQUEST.md
Dispatch file: /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/worker_m1/DISPATCH.md
Scope Document: /Volumes/Acasis2TB/playground/ghar-bhandaa/PROJECT.md

Reports to consult:
- /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/explorer_survey_invariants/analysis.md
- /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/explorer_survey_docs/analysis.md
- /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/explorer_survey_arch/analysis.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Key Tasks to Implement:
1. Fix IDOR in src/server/rooms.functions.ts (verify property belongs to landlord in createRoom).
2. Fix IDOR in src/server/leases.functions.ts (verify room and tenant belong to landlord in createLease).
3. Fix outstanding balance calculation in src/server/invoices.functions.ts (sum per-invoice outstanding in getDashboardData).
4. Fix remaining balance validation in src/lib/payments.server.ts (prevent overpayments in recordCashPayment).
5. Fix overdue status precedence in src/lib/invoices.server.ts (mark uncompleted invoices past due date as overdue in recalculateInvoiceStatus).
6. Fix client date initialization in src/routes/_authed/dashboard.tsx.
7. Add YYYY-MM-DD regex & number validation in src/schemas/ (invoices.ts, leases.ts, payments.ts).
8. Update src/db/schema.ts for tenants table unique composite index on (landlordId, email).
9. Fix link in src/integrations/better-auth/header-user.tsx.
10. Add "typecheck": "tsc --noEmit" to package.json and fix vite.config.ts in tsconfig.json.
11. Author comprehensive unit test suites in src/lib/__tests__/ (dates.test.ts, money.test.ts, invoices.server.test.ts, payments.server.test.ts) covering all domain invariants.
12. Run build, typecheck, lint, and test commands to verify your changes.

Write your changes report to /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/worker_m1/changes.md
Write your self-contained handoff report to /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/worker_m1/handoff.md
Send a completion message back to the orchestrator when finished.
