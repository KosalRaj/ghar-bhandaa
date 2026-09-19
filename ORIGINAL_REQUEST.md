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

## Follow-up — 2026-09-19T15:41:17Z

Comprehensive UI/UX overhaul of the Ghar-Bhandaa rental property management application, modernizing components with coss primitives and coss-particles compositions while establishing a cohesive motion system with transitions-dev and transitions-polish animations.

Working directory: /Volumes/Acasis2TB/playground/ghar-bhandaa
Integrity mode: development

## Requirements

### R1. Design System & Component Library Modernization (coss & coss-particles)
Upgrade all shared UI components (`src/components/ui/` including buttons, dialogs, cards, data tables, fields/forms, inputs, selects, tabs, empty states, toasts, badges, and modals) to adhere to coss primitives and coss-particles patterns, preserving full accessibility, responsive behavior, and dark/light theme consistency.

### R2. Motion & Animation System Integration (transitions-dev & transitions-polish)
Implement the transitions.dev motion system and transitions-polish token doctrine into the application stylesheet (`src/styles.css`) and components. Apply purposeful micro-interactions and surface transitions—such as modal scale-up/down, dropdown reveals, side-by-side view transitions, number pop-ins, success badges, and shake on error—with strict open/close asymmetry, bounded staggers (<300ms total), smooth easing curves (`cubic-bezier(0.22, 1, 0.36, 1)`), and `prefers-reduced-motion` guards.

### R3. Screen & Route UI/UX Overhaul Across All Views
Overhaul the layout, navigation, and user experience across:
- **Public & Authentication Views**: Landing page (`/`), Sign In (`/login`), Sign Up (`/signup`), Global Header, Footer, and ThemeToggle.
- **Landlord Management Portal**: Landlord Shell/Header, Dashboard (`/dashboard`), Properties (`/properties`), Rooms (`/rooms`), Tenants (`/tenants`), Leases (`/leases`), and Invoice Details (`/invoices/$invoiceId`).
Ensure intuitive visual hierarchy, responsive multi-column to single-column adaptability, tactile interactive states, and clean empty/loading states.

### R4. Zero Regressions & Verification Enforcement
Maintain complete backend integrity, domain business rules (NPR/paisa calculations, Kathmandu timezone handling, landlord session authentication), and ensure all automated test suites pass without regression.

## Acceptance Criteria

### UI & Motion Verification
- [ ] Shared components in `src/components/ui/` utilize coss primitives and conform to Base UI / coss composition standards.
- [ ] Global stylesheet defines transitions.dev `:root` motion tokens (durations, easings, distances, scales, blurs) and applies transitions-polish rules (asymmetric modal/dropdown open vs. close speeds, capped staggers, hover dynamics).
- [ ] Interactive elements (dialogs, dropdown menus, tab switching, form error validations, action buttons, notifications) render smooth transitions with zero visual clipping or layout thrashing.
- [ ] Every animated selector or keyframe includes a `@media (prefers-reduced-motion: reduce)` fallback disabling or neutralizing motion.

### Functional & Quality Gates
- [ ] `pnpm run typecheck` passes with zero TypeScript errors.
- [ ] `pnpm run lint` passes with zero ESLint errors or warnings.
- [ ] `pnpm run test` passes 100% of Vitest unit and integration test suites (including money, dates, payments, invoices, stress tests).
- [ ] `pnpm run build` succeeds cleanly producing client and server bundles without Vite or bundler errors.
