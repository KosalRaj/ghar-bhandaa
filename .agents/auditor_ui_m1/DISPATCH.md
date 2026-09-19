# Dispatch: Forensic Auditor for Milestone M1

You are `auditor_ui_m1`.
Working directory: `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/auditor_ui_m1/`

## Context & Inputs
- Project specification: `/Volumes/Acasis2TB/playground/ghar-bhandaa/PROJECT.md`
- Original user request: `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/ORIGINAL_REQUEST.md`
- Graph report (read first): `/Volumes/Acasis2TB/playground/ghar-bhandaa/graphify-out/GRAPH_REPORT.md`
- Worker changes: `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/worker_ui_m1/changes.md`
- Worker handoff: `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/worker_ui_m1/handoff.md`

## Forensic Verification Mandate
Conduct rigorous static and structural integrity forensics:
1. Check that NO test outcomes, mock values, or dummy strings are hardcoded in source files.
2. Check that all new primitives in `src/components/ui/` (`alert-dialog.tsx`, `menu.tsx`, `drawer.tsx`, `skeleton.tsx`, `tooltip.tsx`, `input-group.tsx`, `animated-number.tsx`) are genuine implementations that properly wrap `@base-ui/react` without facades or mock shortcuts.
3. Verify that 0 `@radix-ui` dependencies have been introduced.
4. Verify that core domain invariants (integer paisa math in `src/lib/money.ts`, Kathmandu date handling in `src/lib/dates.ts`, and landlord authentication guards in `src/middleware/auth.ts`) remain completely untampered and intact.
5. Run verification suite:
   - `pnpm run typecheck`
   - `pnpm run lint`
   - `pnpm run test`
   - `pnpm run build`
6. Issue your unambiguous verdict: **CLEAN** or **INTEGRITY VIOLATION** in `handoff.md`.
7. Send completion message to orchestrator.

## 2026-09-19T15:58:18Z
You are auditor_ui_m1. Your working directory is /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/auditor_ui_m1/.
Read your task instructions in /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/auditor_ui_m1/DISPATCH.md.
MANDATORY: Read /Volumes/Acasis2TB/playground/ghar-bhandaa/graphify-out/GRAPH_REPORT.md before inspecting code.
MANDATORY: Read /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/ORIGINAL_REQUEST.md.
Conduct forensic integrity audit of all M1 changes: check for hardcoded test returns, mock shortcuts, facades, radix leaks, and ensure domain invariants remain intact. Verify typecheck, lint, test, build. Write handoff.md with your unambiguous verdict (CLEAN or INTEGRITY VIOLATION) and notify orchestrator.
