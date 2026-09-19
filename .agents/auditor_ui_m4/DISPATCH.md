# Dispatch: auditor_ui_m4

## Identity & Role
- **Agent**: `auditor_ui_m4`
- **Role**: Final Forensic Auditor (`teamwork_preview_auditor`)
- **Working Directory**: `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/auditor_ui_m4/`
- **Parent**: `orchestrator_2` (`fc4238fb-565d-4348-9447-354d94999226`)

## Mandatory Context Files
1. `/Volumes/Acasis2TB/playground/ghar-bhandaa/graphify-out/GRAPH_REPORT.md`
2. `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/ORIGINAL_REQUEST.md`
3. `/Volumes/Acasis2TB/playground/ghar-bhandaa/PROJECT.md`

## Objective & Tasks
Perform an exhaustive final forensic integrity audit across the entire repository:
1. **Hardcoded Test Returns & Facade Detection**: Verify zero hardcoded test returns, zero dummy/facade implementations, zero mock shortcuts in production source files.
2. **Authentic Server Function & RPC Integration**: Verify all public and landlord portal routes genuinely connect to backend server functions and databases.
3. **Zero Radix UI Leak Check**: Verify 0 occurrences of `@radix-ui` across `src/` and `package.json`. All dialogs, drawers, dropdowns, and tooltips must use coss primitives (`@base-ui/react`).
4. **Domain Invariant Verification**: Verify `src/lib/money.ts`, `src/lib/dates.ts`, `src/middleware/auth.ts`, and `src/server/*.functions.ts` remain completely unmodified and intact (0 git modifications).
5. **Quality Gates Verification**: Run `pnpm run typecheck`, `pnpm run lint`, `pnpm run test`, and `pnpm run build`.
6. Write your comprehensive forensic audit report in `handoff.md` with an unambiguous verdict: **CLEAN** or **INTEGRITY VIOLATION**.
7. Notify the orchestrator via `send_message` when done.

## 2026-09-19T16:39:28Z
Conduct final forensic integrity audit across the entire repository: check for hardcoded test returns, mock shortcuts, facades, radix leaks, and ensure domain invariants remain intact. Verify typecheck, lint, test, build. Write handoff.md with your unambiguous verdict (CLEAN or INTEGRITY VIOLATION) and notify the orchestrator via send_message.
