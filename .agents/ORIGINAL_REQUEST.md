# Original User Request

## Initial Request — 2026-08-26T12:20:52+05:45

Perform a comprehensive code review and documentation generation for the `ghar-bhandaa` codebase, applying necessary fixes and producing a complete documentation suite.

Working directory: /Volumes/Acasis2TB/playground/ghar-bhandaa
Integrity mode: demo

## Requirements

### R1. Comprehensive Code Review & Invariant Audit
Audit the full codebase covering architectural design, security/authentication barriers (landlord middleware, multi-tenant isolation), type safety, error handling, and domain invariants (Nepal/Kathmandu timezone handling, integer paisa monetary amounts, append-only payment ledgers, and derived invoice statuses). Directly resolve bugs, type inconsistencies, or security gaps found during the audit, and compile a structured audit report summarizing findings and applied resolutions.

### R2. Comprehensive Documentation Suite
Produce a complete and structured documentation suite inside `docs/` comprising:
1. **Architecture & Domain Guide**: System architecture, data flow diagrams, database schema relationships, and business domain invariants.
2. **API & Server Functions Catalog**: Complete catalog of all server functions and endpoints, detailing parameter schemas, response structures, authorization requirements, and error modes.
3. **Developer & Operations Guide**: Local environment setup, D1 database migrations, testing strategies, Cloudflare Workers/Pages deployment workflow, and scheduled cron triggers.

### R3. In-Code Documentation & Type Annotations
Enrich all exported server functions, database schema definitions, and domain utility functions with clear TSDoc/JSDoc comments describing purpose, parameters, return types, and potential side-effects without altering intended application behavior.

## Verification Resources
- Existing repository test and build scripts (`package.json`, `pnpm run lint`, `pnpm run typecheck`, etc.)
- Specifications and blueprints in `REQUIREMENTS.md` and `PLAN.md`

## Acceptance Criteria

### Code Quality & Correctness
- [ ] TypeScript compilation (`pnpm run typecheck` or `tsc --noEmit`) passes with 0 errors.
- [ ] Linter checks (`pnpm run lint`) pass with 0 errors or warnings.
- [ ] Any existing unit and integration test suites pass without regression.
- [ ] Domain invariants (integer paisa arithmetic, Kathmandu time handling, landlord middleware guards) are validated across all server functions.

### Deliverables & Artifacts
- [ ] Audit report document exists summarizing discovered issues, severity ratings, and applied resolutions.
- [ ] Complete documentation files created under `docs/` (`docs/architecture.md`, `docs/api-catalog.md`, `docs/developer-guide.md`) with valid internal links and accurate schema references.
- [ ] All public server functions and utility modules in `src/` contain complete TSDoc annotations.
