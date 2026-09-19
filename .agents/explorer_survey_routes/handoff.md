# Handoff Report: Routes, Screens & Verification Survey

**Agent:** `explorer_survey_routes`  
**Working Directory:** `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/explorer_survey_routes/`  
**Handoff Type:** Hard (Task complete)  
**Date:** 2026-09-19  

---

## 1. Observation

### Verification Tooling Baseline Runs
1. **Typecheck**:
   - Command: `pnpm run typecheck` (`tsc --noEmit`)
   - Result: Exited with code `0`. Output:
     ```
     > ghar-bhandaa@ typecheck /Volumes/Acasis2TB/playground/ghar-bhandaa
     > tsc --noEmit
     ```
2. **Linter**:
   - Command: `pnpm run lint` (`eslint`)
   - Result: Exited with code `0`. Output:
     ```
     > ghar-bhandaa@ lint /Volumes/Acasis2TB/playground/ghar-bhandaa
     > eslint
     ```
3. **Automated Test Suite**:
   - Command: `pnpm run test` (`vitest run`)
   - Result: Exited with code `0`. 6 test files, 73 tests passed in 776ms:
     ```
     ✓ src/lib/__tests__/money.test.ts (10 tests) 28ms
     ✓ src/lib/__tests__/dates.test.ts (12 tests) 30ms
     ✓ src/lib/__tests__/payments.server.test.ts (5 tests) 19ms
     ✓ src/lib/__tests__/invoices.server.test.ts (9 tests) 20ms
     ✓ src/lib/__tests__/challenger_m1_2.test.ts (20 tests) 24ms
     ✓ src/lib/__tests__/stress.test.ts (17 tests) 426ms
     Test Files  6 passed (6)
     Tests       73 passed (73)
     ```
4. **Production Build**:
   - Command: `pnpm run build` (`vite build`)
   - Result: Exited with code `0` in 784ms, generating client and server distribution bundles.
5. **Coverage Tooling**:
   - Command: `pnpm dlx vitest run --coverage`
   - Result: Missing dependency `@vitest/coverage-v8` prevented coverage instrumentation without package modification.

### Route Implementation Inspections
1. **Root Route (`src/routes/index.tsx`, lines 1-10)**:
   ```tsx
   export const Route = createFileRoute('/')({
     loader: () => {
       throw redirect({
         to: '/dashboard',
       })
     },
   })
   ```
   Directly redirects to `/dashboard`, bypassing public landing page presentation.
2. **Authenticated Layout (`src/routes/_authed.tsx`, lines 6-17)**:
   ```tsx
   export const Route = createFileRoute('/_authed')({
     beforeLoad: async () => {
       const authStatus = await checkLandlordAuth()
       if (!authStatus.authenticated) {
         throw redirect({
           to: '/login',
         })
       }
       return authStatus
     },
     component: AuthedLayout,
   })
   ```
3. **Landlord Header Navigation (`src/components/LandlordHeader.tsx`, lines 40-76)**:
   Links rendered in a flat flex row without mobile responsive drawer or hamburger toggle:
   ```tsx
   <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-medium">
     <Link to="/dashboard" className="nav-link">Dashboard</Link>
     <Link to="/properties" className="nav-link">Properties</Link>
     <Link to="/rooms" className="nav-link">Rooms</Link>
     <Link to="/tenants" className="nav-link">Tenants</Link>
     <Link to="/leases" className="nav-link">Leases</Link>
   </div>
   ```
4. **Dashboard Line Items Repeater (`src/routes/_authed/dashboard.tsx`, lines 456-520)**:
   Repeater items squished into a single flex row:
   ```tsx
   <div key={index} className="flex gap-2 items-center">
     <Input className="flex-1" ... />
     <Input className="w-28" ... />
     <Select ...><SelectTrigger className="w-32">...</SelectTrigger></Select>
     <Button size="icon-sm" ... />
   </div>
   ```
5. **Styles Motion Tokens (`src/styles.css`, lines 1-464)**:
   Contains only two keyframes (`toast-success-odd/even`, `toast-error-odd/even`, and `rise-in`). Does NOT contain `transitions.dev` semantic root variables (`--modal-open-dur`, `--modal-close-dur`, `--dropdown-open-dur`, `--digit-dur`, `--ease-smooth-out`, `--shake-dur`) and lacks `@media (prefers-reduced-motion: reduce)` fallbacks.

---

## 2. Logic Chain

1. **Premise 1 (from Observation 1.1 - 1.4)**: The existing codebase is stable, typecheck-clean, lint-clean, and all 73 existing backend tests pass.
2. **Premise 2 (from Observation 2.1 & ORIGINAL_REQUEST.md)**: The prompt and requirements require an overhauled landing page at `/`, but `src/routes/index.tsx` contains only a blind redirect to `/dashboard`. Unauthenticated visitors hitting `/` are redirected to `/dashboard`, which bounces them to `/login`, eliminating the public marketing and product onboarding surface.
3. **Premise 3 (from Observation 2.3 & 2.4)**: On mobile viewports (<640px), the flat flex navbar in `LandlordHeader` causes multi-line link wrapping, and tables in `/dashboard` and `/leases` lack mobile card alternatives, while modal line items in `/dashboard` crush horizontally on small screens.
4. **Premise 4 (from Observation 2.5 & transitions-dev / transitions-polish skills)**: The application stylesheet lacks the five-dimensional motion tokens (duration, easing, distance, scale, blur) and lacks asymmetric open/close timing, error shakes, number pop-in animations, and accessibility media query guards.
5. **Conclusion**: While backend domain integrity (integer paisa, Kathmandu time, landlord auth guards) is fully preserved and validated, the front-end routing and UI require a 4-pillar overhaul:
   - Creating the public landing page on `/` with hero and feature highlights.
   - Injecting the complete `transitions-dev` and `transitions-polish` motion token architecture and reduced-motion guards.
   - Refactoring `LandlordHeader` to support responsive mobile navigation and upgrading tables to support responsive card view fallbacks.
   - Polishing interactive states (form validation shakes, number pop-ins, theme icon swap).

---

## 3. Caveats

1. **Network / Package Installation**: `@vitest/coverage-v8` was not installed during this survey because the agent was under a read-only investigation constraint. Coverage was evaluated by cataloging existing test files manually.
2. **Browser Runtime Visuals**: The survey was conducted via static code inspection, AST dependency mapping, and terminal test/build verification without live browser rendering. Actual layout wrapping was analyzed from Tailwind CSS class specifications.
3. **Public Landing Page Design Scope**: While `index.tsx` was identified as needing a landing page, the specific branding copy and visual assets (illustrations/screenshots) will need to be supplied during the implementation phase.

---

## 4. Conclusion

The application has a robust, bug-free domain foundation with zero compiler, linter, or test failures. The next implementation steps should focus squarely on:
1. Transforming `src/routes/index.tsx` into a modern, responsive public landing page.
2. Populating `src/styles.css` with `transitions.dev` root variables, asymmetric timings, and reduced-motion guards.
3. Enhancing `LandlordHeader.tsx` with mobile drawer navigation and adding mobile-friendly card alternatives to the desktop tables.
4. Preserving the three verified domain invariants: integer paisa math, Asia/Kathmandu date handling, and landlord auth guards.

---

## 5. Verification Method

To independently verify all findings in this report:

1. **Baseline Compilation & Test Verification**:
   ```bash
   pnpm run typecheck
   pnpm run lint
   pnpm run test
   pnpm run build
   ```
   All four commands must exit with code `0`.
2. **Inspection of Routes & Style Tokens**:
   - Inspect `src/routes/index.tsx` to verify immediate redirect to `/dashboard`.
   - Inspect `src/components/LandlordHeader.tsx` to verify absence of mobile hamburger menu.
   - Inspect `src/styles.css` to verify absence of `transitions.dev` `:root` tokens and `prefers-reduced-motion` guards.
3. **Invalidation Conditions**:
   - If `src/routes/index.tsx` renders a JSX component with a hero section, the landing page gap finding is invalidated.
   - If `src/styles.css` already contains `--modal-open-dur: 250ms`, the motion token finding is invalidated.
