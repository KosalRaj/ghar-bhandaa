# Dispatch Assignment: Documentation Suite Author Worker (Milestone 3)

Working Directory: /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/worker_m3
Role: Documentation Suite Author Worker
Original Request: /Volumes/Acasis2TB/playground/ghar-bhandaa/ORIGINAL_REQUEST.md
Scope Document: /Volumes/Acasis2TB/playground/ghar-bhandaa/PROJECT.md
Survey Analysis Files:
- /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/explorer_survey_docs/analysis.md
- /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/explorer_survey_arch/analysis.md
- /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/explorer_survey_invariants/analysis.md
Audit Reports:
- /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/auditor_m1/audit.md
- /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/worker_m1/changes.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Milestone 3 Tasks:
Create the complete and structured documentation suite inside `docs/` and update `README.md`:

1. `docs/architecture.md`: Architecture & Domain Guide
   - High-level architecture (TanStack Start, Cloudflare Workers, Cloudflare D1/R2, Better Auth).
   - Three entry points model (Server functions RPCs, Cloudflare Cron Trigger, Better Auth REST API handler).
   - Complete Mermaid diagrams: Architecture diagram, Request/Response Flow diagram, Entity Relationship diagram (all 13 tables).
   - Core Domain Invariants: Nepal/Kathmandu (+05:45) timezone handling, integer paisa currency math, append-only payment ledger, derived invoice status state machine, multi-tenant isolation model.

2. `docs/api-catalog.md`: API & Server Functions Catalog
   - Catalog all 16 server functions across 7 domains (`auth`, `properties`, `rooms`, `tenants`, `leases`, `invoices`, `payments`).
   - For every function: Method (GET/POST), middleware authorization, input Zod schema parameters, return structure, error modes, side-effects.
   - Public Better Auth REST endpoints (`/api/auth/*`).

3. `docs/developer-guide.md`: Developer & Operations Guide
   - Prerequisites & local development setup (pnpm, Wrangler, Miniflare, D1 local migrations).
   - D1 Database schema migrations workflow (`pnpm db:generate`, `pnpm db:migrate`, `pnpm db:migrate:production`).
   - Testing strategies (Vitest unit tests, domain invariant stress testing, typechecking, linting).
   - Cloudflare deployment workflow (Wrangler configuration, secrets management, environment variables, R2 bucket binding).
   - Scheduled Cron triggers configuration (`wrangler.jsonc` `0 1 * * *` UTC = 06:45 NPT daily invoice processing and overdue recalculation).

4. `docs/audit-report.md`: Consolidated Code Review & Invariant Audit Report
   - Executive summary of findings.
   - Detailed classification of the 11 audited findings (IDOR, accounting balance aggregation, cash overpayments, overdue state precedence, Kathmandu timezone handling, Zod schema validation, multi-tenant composite email indexing, dead links, tooling scripts).
   - Severity ratings (High, Medium, Low) and applied code remediations.
   - Verification proofs and test metrics (36+ unit tests, 100k round-trip tests, clean build/lint/typecheck).

5. Update `README.md`:
   - Replace outdated PostgreSQL boilerplate with accurate Cloudflare D1 + Drizzle ORM + TanStack Start setup and commands.

Verification:
- Ensure all markdown links in `docs/` and `README.md` are valid and point to existing files.
- Run `pnpm run check` and `pnpm run lint` to ensure no formatting or linting issues.
- Write report to `.agents/worker_m3/changes.md` and handoff to `.agents/worker_m3/handoff.md`.
