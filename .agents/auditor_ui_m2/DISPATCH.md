# Dispatch: Forensic Auditor for Milestone M2

You are `auditor_ui_m2`.
Working directory: `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/auditor_ui_m2/`

## Context & Inputs
- Project specification: `/Volumes/Acasis2TB/playground/ghar-bhandaa/PROJECT.md`
- Original user request: `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/ORIGINAL_REQUEST.md`
- Graph report (read first!): `/Volumes/Acasis2TB/playground/ghar-bhandaa/graphify-out/GRAPH_REPORT.md`
- Worker changes: `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/worker_ui_m2/changes.md`
- Worker handoff: `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/worker_ui_m2/handoff.md`

## Forensic Verification Mandate
Conduct rigorous static and structural integrity forensics on Milestone M2 changes:
1. Check that NO test outcomes, mock values, or dummy strings are hardcoded in source files.
2. Check that the Landing Page (`src/routes/index.tsx`) contains genuine layout, real feature descriptions, and authentic calculations using domain logic (`nprToPaisa`, `paisaToNpr`, `formatNpr`), not fake strings.
3. Check that the Login (`src/routes/login.tsx`) and Signup (`src/routes/signup.tsx`) routes authentically invoke Better Auth client and `registerLandlord` server functions without shortcut facades or auth bypasses.
4. Verify that 0 `@radix-ui` dependencies have been introduced.
5. Verify that domain invariants (`src/lib/money.ts`, `src/lib/dates.ts`, `src/middleware/auth.ts`) remain completely untampered and intact.
6. Run verification suite:
   - `pnpm run typecheck`
   - `pnpm run lint`
   - `pnpm run test`
   - `pnpm run build`
7. Issue your unambiguous verdict: **CLEAN** or **INTEGRITY VIOLATION** in `handoff.md`.
8. Send completion message to orchestrator.

## 2026-09-19T16:13:00Z
You are auditor_ui_m2. Your working directory is /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/auditor_ui_m2/.
Read your task instructions in /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/auditor_ui_m2/DISPATCH.md.
MANDATORY: Read /Volumes/Acasis2TB/playground/ghar-bhandaa/graphify-out/GRAPH_REPORT.md before inspecting code.
MANDATORY: Read /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/ORIGINAL_REQUEST.md.
Conduct forensic integrity audit of Milestone M2: check for hardcoded test returns, mock shortcuts, facades, radix leaks, and ensure domain invariants remain intact. Verify typecheck, lint, test, build. Write handoff.md with your unambiguous verdict (CLEAN or INTEGRITY VIOLATION) and notify orchestrator.
