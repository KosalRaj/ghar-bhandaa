# BRIEFING — 2026-08-26T06:42:00Z

## Mission
Explore and comprehensively map the complete architecture, framework setup, database schema, and server functions of the ghar-bhandaa codebase.

## 🔒 My Identity
- Archetype: explorer
- Roles: Architecture & Server Functions Explorer
- Working directory: /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/explorer_survey_arch
- Original parent: d36b956d-fcce-4064-bdd0-a5add158487c
- Milestone: codebase-survey

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Follow GEMINI.md: Read graphify-out/GRAPH_REPORT.md before reading source files if it exists
- Map complete architecture: project structure, framework setup, database schema, server functions, data flow, component boundaries

## Current Parent
- Conversation ID: d36b956d-fcce-4064-bdd0-a5add158487c
- Updated: 2026-08-26T06:42:00Z

## Investigation State
- **Explored paths**:
  - `graphify-out/GRAPH_REPORT.md`, `ORIGINAL_REQUEST.md`, `PLAN.md`, `REQUIREMENTS.md`
  - `package.json`, `vite.config.ts`, `wrangler.jsonc`, `drizzle.config.ts`, `src/types/cloudflare.d.ts`
  - `src/db/schema.ts`, `src/db/index.ts`, `drizzle/0000_clear_punisher.sql`
  - `src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/lib/dates.ts`, `src/lib/money.ts`, `src/lib/invoices.server.ts`, `src/lib/payments.server.ts`, `src/lib/utils.ts`
  - `src/middleware/auth.ts`
  - `src/server/auth.functions.ts`, `properties.functions.ts`, `rooms.functions.ts`, `tenants.functions.ts`, `leases.functions.ts`, `invoices.functions.ts`, `payments.functions.ts`
  - `src/schemas/properties.ts`, `rooms.ts`, `tenants.ts`, `leases.ts`, `invoices.ts`, `payments.ts`
  - `src/router.tsx`, `src/routeTree.gen.ts`, `src/routes/__root.tsx`, `src/routes/_authed.tsx`, `src/routes/_authed/dashboard.tsx`, `invoices.$invoiceId.tsx`, `properties.tsx`, `rooms.tsx`, `tenants.tsx`, `leases.tsx`, `login.tsx`, `signup.tsx`, `about.tsx`, `index.tsx`, `api/auth/$.ts`
  - `src/components/Header.tsx`, `LandlordHeader.tsx`, `ThemeToggle.tsx`, `Footer.tsx`, `src/integrations/better-auth/header-user.tsx`
- **Key findings**:
  - Full TanStack Start v1 (React 19) fullstack app deployed to Cloudflare Workers with D1 and R2.
  - Three entry points architecture strictly delegating to `src/lib/` domain logic.
  - 13 tables (4 Better Auth + 9 domain) with foreign key relations, cascade deletes on line items, unique index on `(lease_id, period)`.
  - All server functions enforce `landlordAuthMiddleware` and `landlordId` data isolation.
  - Strict domain invariants: integer paisa arithmetic, Asia/Kathmandu timezone (UTC+05:45), derived invoice status calculation, append-only payment ledger, transactional multi-row operations.
  - Phases 0 and 1 are complete. Phases 2-5 are defined in schema and plan.
- **Unexplored areas**: None for architecture survey scope.

## Key Decisions Made
- Completed full architecture synthesis into `analysis.md` and `handoff.md`.

## Artifact Index
- /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/explorer_survey_arch/analysis.md — Comprehensive architecture analysis
- /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/explorer_survey_arch/handoff.md — 5-component handoff report
- /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/explorer_survey_arch/progress.md — Liveness & progress tracking
- /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/explorer_survey_arch/DISPATCH.md — Dispatch log
