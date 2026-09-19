# Project: ghar-bhandaa Code Review, Invariant Audit & Documentation Suite

## Architecture

`ghar-bhandaa` is an automated room rent collection and property management system for Nepal built on TanStack Start (React 19), Cloudflare Workers (SSR + Cron Triggers), Cloudflare D1 (SQLite via Drizzle ORM), Cloudflare R2 (Receipt storage), and Better Auth.

### Key Architectural Invariants

1. **Nepal / Kathmandu (`Asia/Kathmandu`, UTC+05:45) Timezone**: All date calculations (due dates, billing periods, overdue triggers) are computed relative to Kathmandu timezone.
2. **Integer Paisa Currency Arithmetic**: Monetary values in the database are stored as integers representing paisa (1 NPR = 100 Paisa). Floating-point arithmetic is strictly forbidden in DB/storage.
3. **Append-Only Payment Ledger**: Payments are recorded as immutable ledger entries. Invoices derive status deterministically from confirmed payments.
4. **Derived Invoice Lifecycle Statuses**: Statuses (`unpaid`, `partial`, `overdue`, `paid`) are dynamically derived and updated based on confirmed payment totals and Kathmandu due dates.
5. **Multi-Tenant Landlord Isolation**: Strict function-level authorization via `landlordAuthMiddleware` ensuring landlords can only query, create, or associate resources within their own tenancy.

## Feature Inventory

| #   | Feature                                      | Description                                                                                                     | Milestone | Source |
| --- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------- | ------ |
| 1   | Landlord Auth & Middleware                   | Session verification, registration, and tenancy scoping                                                         | M1        | Survey |
| 2   | Multi-Tenant IDOR Protection                 | Validation of property, room, tenant ownership on relational creation                                           | M1        | Survey |
| 3   | Integer Paisa Currency Math                  | `nprToPaisa`, `paisaToNpr`, `formatNpr` utilities and schema constraints                                        | M1        | Survey |
| 4   | Kathmandu Timezone Handling                  | `getTodayInKathmandu`, `getCurrentDateTimeInKathmandu`, `isPastDateInKathmandu`                                 | M1        | Survey |
| 5   | Append-Only Payment Ledger & Balance Check   | Cash payment recording with server-side remaining balance validation                                            | M1        | Survey |
| 6   | Deterministic Invoice Status Machine         | State recalculation (`unpaid`, `partial`, `overdue`, `paid`) with overdue precedence                            | M1        | Survey |
| 7   | Dashboard Metric Aggregation                 | Per-invoice outstanding balance calculation, collected totals, active counts                                    | M1        | Survey |
| 8   | Multi-Tenant Tenant Uniqueness               | Composite uniqueness on `(landlordId, email)`                                                                   | M1        | Survey |
| 9   | Tooling & Test Suite Setup                   | `typecheck` script, `tsconfig` fix, Vitest unit test suites for lib utilities                                   | M1        | Survey |
| 10  | TSDoc Schema Annotations                     | Complete TSDoc/JSDoc for 13 SQLite tables in `src/db/schema.ts`                                                 | M2        | Survey |
| 11  | TSDoc DB Client Annotations                  | JSDoc for `getDB` and `Database` type in `src/db/index.ts`                                                      | M2        | Survey |
| 12  | TSDoc Domain Utilities Annotations           | JSDoc for all functions in `src/lib/` (`dates`, `money`, `invoices.server`, `payments.server`, `auth`, `utils`) | M2        | Survey |
| 13  | TSDoc Auth Middleware Annotations            | JSDoc for `landlordAuthMiddleware` in `src/middleware/auth.ts`                                                  | M2        | Survey |
| 14  | TSDoc Server Functions Annotations           | JSDoc for all 16 server functions in `src/server/*.functions.ts`                                                | M2        | Survey |
| 15  | TSDoc Zod Schemas Annotations                | JSDoc for schemas in `src/schemas/*.ts`                                                                         | M2        | Survey |
| 16  | Architecture & Domain Guide                  | `docs/architecture.md` (System design, data flows, D1/R2, invariants)                                           | M3        | Survey |
| 17  | API & Server Functions Catalog               | `docs/api-catalog.md` (16 server functions, schemas, auth, error modes)                                         | M3        | Survey |
| 18  | Developer & Operations Guide                 | `docs/developer-guide.md` (Local setup, migrations, tests, deployment, cron)                                    | M3        | Survey |
| 19  | Consolidated Audit Report                    | `docs/audit-report.md` (Executive summary, findings, severities, resolutions)                                   | M3        | Survey |
| 20  | Repository README & Link Fixes               | Update `README.md` to D1/Drizzle stack and fix dead links                                                       | M3        | Survey |
| 21  | Full Verification & Forensic Integrity Audit | End-to-end typecheck, lint, test execution, and forensic audit                                                  | Final     | Survey |

## Milestones

| #     | Name                               | Scope                                                                                                                                                | Dependencies | Status |
| ----- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------ |
| M1    | Invariant Audit Fixes & Test Suite | Fix 11 security/invariant issues (IDOR, balance checks, status machine, schema unique index, date handling), add typecheck script & unit test suites | none         | DONE   |
| M2    | In-Code TSDoc Annotations          | Add comprehensive TSDoc comments across schema, DB client, lib utilities, middleware, server functions, and schemas                                  | M1           | DONE   |
| M3    | Comprehensive Documentation Suite  | Create `docs/architecture.md`, `docs/api-catalog.md`, `docs/developer-guide.md`, `docs/audit-report.md`, and update `README.md`                      | M1, M2       | DONE   |
| Final | Verification & Audit Gate          | `pnpm run typecheck`, `pnpm run lint`, `pnpm test`, Reviewer & Challenger verification, Forensic Audit                                               | M1, M2, M3   | DONE   |

## Code Layout

- `src/db/`: SQLite schema definitions and D1 database client factory
- `src/lib/`: Framework-agnostic core domain logic (money, dates, invoices, payments, auth)
- `src/lib/__tests__/`: Unit and domain invariant test suites
- `src/middleware/`: Request middleware (landlord authentication and session binding)
- `src/server/`: TanStack Start RPC server functions (`createServerFn`)
- `src/schemas/`: Zod validation schemas for server function inputs
- `src/routes/`: TanStack Router file-based route definitions
- `docs/`: Comprehensive project documentation suite
- `drizzle/`: SQL schema migration files
