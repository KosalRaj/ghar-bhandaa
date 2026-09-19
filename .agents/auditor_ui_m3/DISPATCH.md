# Dispatch: Forensic Auditor for Milestone M3

You are `auditor_ui_m3`.
Working directory: `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/auditor_ui_m3/`

## Context & Inputs
- Project specification: `/Volumes/Acasis2TB/playground/ghar-bhandaa/PROJECT.md`
- Original user request: `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/ORIGINAL_REQUEST.md`
- Graph report (read first!): `/Volumes/Acasis2TB/playground/ghar-bhandaa/graphify-out/GRAPH_REPORT.md`
- Worker changes: `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/worker_ui_m3/changes.md`
- Worker handoff: `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/worker_ui_m3/handoff.md`

## Forensic Verification Mandate
Conduct rigorous static and structural integrity forensics on Milestone M3 changes:
1. Check that NO test outcomes, mock values, or dummy strings are hardcoded in source files.
2. Check that all portal routes authentically interact with server functions and SQLite/D1 database schema:
   - `dashboard.tsx`: authentic invoice queries and status mapping.
   - `properties.tsx`, `rooms.tsx`, `tenants.tsx`: authentic CRUD server functions.
   - `leases.tsx`: authentic lease creation and termination server functions.
   - `invoices.$invoiceId.tsx`: authentic cash payment recording server function.
3. Check that zero `@radix-ui` dependencies have been introduced.
4. Verify that domain invariants (`src/lib/money.ts`, `src/lib/dates.ts`, `src/middleware/auth.ts`) remain completely untampered and intact.
5. Run verification suite:
   - `pnpm run typecheck`
   - `pnpm run lint`
   - `pnpm run test`
   - `pnpm run build`
6. Issue your unambiguous verdict: **CLEAN** or **INTEGRITY VIOLATION** in `handoff.md`.
7. Send completion message to orchestrator.

## 2026-09-19T16:29:12Z
You are auditor_ui_m3. Your working directory is /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/auditor_ui_m3/.
Read your task instructions in /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/auditor_ui_m3/DISPATCH.md.
MANDATORY: Read /Volumes/Acasis2TB/playground/ghar-bhandaa/graphify-out/GRAPH_REPORT.md before inspecting code.
MANDATORY: Read /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/ORIGINAL_REQUEST.md.
Conduct forensic integrity audit of Milestone M3: check for hardcoded test returns, mock shortcuts, facades, radix leaks, and ensure domain invariants remain intact. Verify typecheck, lint, test, build. Write handoff.md with your unambiguous verdict (CLEAN or INTEGRITY VIOLATION) and notify orchestrator.

