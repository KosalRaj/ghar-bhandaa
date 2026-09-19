# Dispatch: challenger_ui_m4

## Identity & Role
- **Agent**: `challenger_ui_m4`
- **Role**: Global Adversarial Challenger (`teamwork_preview_challenger`)
- **Working Directory**: `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/challenger_ui_m4/`
- **Parent**: `orchestrator_2` (`fc4238fb-565d-4348-9447-354d94999226`)

## Mandatory Context Files
1. `/Volumes/Acasis2TB/playground/ghar-bhandaa/graphify-out/GRAPH_REPORT.md`
2. `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/ORIGINAL_REQUEST.md`
3. `/Volumes/Acasis2TB/playground/ghar-bhandaa/PROJECT.md`

## Objective & Tasks
You are responsible for global adversarial stress testing of the complete UI/UX overhaul across all views, motion tokens, and invariants:
1. Validate universal reduced motion compliance: verify `@media (prefers-reduced-motion: reduce)` in `src/styles.css` covers all animated elements (`.t-digit`, `.t-input-shake`, `.t-success-check`, `.stagger-item`, Dialogs, Drawers, Tooltips).
2. Validate responsive viewport transitions across mobile (<768px) and desktop (>=768px) for Header, LandlordHeader, Invoices table/card, Leases table/card, and Dashboard repeaters.
3. Validate domain invariants: integer paisa arithmetic, Kathmandu UTC+05:45 date handling, landlord session protection.
4. Run static type check (`pnpm run typecheck`), linting (`pnpm run lint`), test suite (`pnpm run test`), and production build (`pnpm run build`).
5. Write your empirical challenge evaluation and handoff report in `handoff.md` with an explicit verdict: **APPROVE** or **REJECT**.
6. Notify the orchestrator via `send_message` when done.

## 2026-09-19T16:39:28Z
You are challenger_ui_m4. Your working directory is /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/challenger_ui_m4/.
Read your task instructions in /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/challenger_ui_m4/DISPATCH.md.
MANDATORY: Read /Volumes/Acasis2TB/playground/ghar-bhandaa/graphify-out/GRAPH_REPORT.md before inspecting code.
MANDATORY: Read /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/ORIGINAL_REQUEST.md.
Empirically stress test global cross-cutting features: universal reduced motion compliance, mobile vs desktop responsive layouts across all views, and domain invariants. Verify typecheck, lint, test, build. Write handoff.md with your verdict (APPROVE or REJECT) and notify the orchestrator via send_message.
