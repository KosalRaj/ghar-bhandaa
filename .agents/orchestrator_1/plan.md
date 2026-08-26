# Project Execution Plan — orchestrator_1

## Objective
Deliver a complete invariant audit, architectural review, bug fixes, in-code TSDoc annotations, and full documentation suite (`docs/architecture.md`, `docs/api-catalog.md`, `docs/developer-guide.md`, and Audit Report) for `ghar-bhandaa`.

## Phase 0: Codebase Survey & Invariant Mapping (Parallel Explorers)
- Dispatch 3 Explorers:
  1. `teamwork_preview_explorer` (Architecture & Core Schema): Maps TanStack Start routes, D1 schema, server functions, and middleware.
  2. `teamwork_preview_explorer` (Domain Invariants & Security): Audits integer paisa arithmetic, Kathmandu timezone handling, append-only payment ledgers, derived invoice statuses, landlord middleware, multi-tenant isolation.
  3. `teamwork_preview_explorer` (Tooling, Tests, Docs Gap): Maps existing test suites, linting/typecheck setups, exported functions needing TSDocs, and missing documentation.

## Phase 1: PROJECT.md & Milestone Architecture
- Synthesize all explorer findings into `PROJECT.md` at project root with full architecture, feature inventory, code layout, interface contracts, and assigned milestones.

## Phase 2: Milestone 1 — Invariant Audit & Bug Fixes
- Dispatch Worker to fix any identified domain invariant violations, security loopholes, type issues, or test breakages.
- Run Reviewers, Challengers, and Forensic Auditor to gate Milestone 1.

## Phase 3: Milestone 2 — In-Code Documentation & Type Annotations
- Dispatch Worker to add TSDoc/JSDoc comments to all exported server functions, database schema definitions, and domain utility functions.
- Run Reviewers and Forensic Auditor.

## Phase 4: Milestone 3 — Complete Documentation Suite
- Dispatch Worker to generate `docs/architecture.md`, `docs/api-catalog.md`, `docs/developer-guide.md`, and the consolidated Audit Report.
- Run Reviewers to ensure full completeness, accurate schemas, and valid internal links.

## Phase 5: Final Milestone — Verification & Adversarial Coverage Hardening
- Run full typecheck (`pnpm run typecheck` / `tsc --noEmit`), linter (`pnpm run lint`), test suites (`pnpm test` / `vitest`).
- Run Forensic Auditor for integrity verification.
- Synthesize final human report and complete mission.
