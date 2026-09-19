# Dispatch: Routes, Screens & Verification Survey

You are `explorer_survey_routes`.
Working directory: `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/explorer_survey_routes/`

## Instructions & Tasks
1. FIRST: Read `/Volumes/Acasis2TB/playground/ghar-bhandaa/graphify-out/GRAPH_REPORT.md` per GEMINI.md project rules.
2. Read `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/ORIGINAL_REQUEST.md` (specifically Follow-up — 2026-09-19T15:41:17Z).
3. Inspect all routes and view layouts:
   - Public & Auth: `/` (`index.tsx`), `/login` (`login.tsx`), `/signup` (`signup.tsx`), `Header.tsx`, `Footer.tsx`, `ThemeToggle.tsx`.
   - Landlord Management Portal: `_authenticated.tsx`, `/dashboard`, `/properties`, `/rooms`, `/tenants`, `/leases`, `/invoices/$invoiceId`.
4. Analyze UX hierarchy, responsive multi-column to single-column adaptability, tactile interactive states, and clean empty/loading states.
5. Survey project verification tooling in `package.json`:
   - Run typecheck, lint, test, and build baseline checks. Document existing test coverage and any baseline issues.
6. Identify domain invariants to preserve: integer paisa currency, Asia/Kathmandu time handling, landlord middleware guards.
7. Write your detailed findings to `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/explorer_survey_routes/survey_routes.md`.
8. Write a comprehensive handoff report to `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/explorer_survey_routes/handoff.md`.
9. Send a completion message to the orchestrator.
