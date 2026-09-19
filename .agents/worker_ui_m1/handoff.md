# Milestone M1 Handoff Report — Design System & Motion System Core

## 1. Observation

- **Initial State**:
  - Baseline verification was executed using `pnpm run typecheck`, `pnpm run lint`, `pnpm run test`, and `pnpm run build`.
  - Initial tests: 6 test files, 73 unit tests passed (`src/lib/__tests__/money.test.ts`, `dates.test.ts`, `invoices.server.test.ts`, `payments.server.test.ts`, `challenger_m1_2.test.ts`, `stress.test.ts`).
  - Baseline stylesheet `src/styles.css` had ad-hoc uncalibrated transitions (`180ms ease` in lines 388-396, `170ms ease` in line 422, `700ms` in line 436) and lacked motion tokens, open/close asymmetry, micro-interaction keyframes, and `@media (prefers-reduced-motion: reduce)`.
  - Several core coss primitives (`alert-dialog`, `menu`, `drawer`, `skeleton`, `tooltip`, `input-group`, `animated-number`) were missing from `src/components/ui/`.
  - `src/components/ui/empty.tsx` duplicated `{...props}` across both outer and inner wrappers in `EmptyMedia` and lacked action button styling in `EmptyContent`.
  - `src/components/ui/toast.tsx` lacked exports for `anchoredToastManager` and `AnchoredToastProvider`.
  - `src/components/ui/dialog.tsx` used hardcoded symmetric `duration-200 ease-in-out` transitions.

- **Changes Applied**:
  - `src/styles.css`:
    - Added full 5-dimension `:root` motion tokens: durations (40ms to 500ms), easings centered on `--ease-smooth-out: cubic-bezier(0.22, 1, 0.36, 1)`, distances (4px to 30px), scales (0.96 to 0.99), and blurs (2px to 8px).
    - Added `@keyframes skeleton` and `--animate-skeleton: skeleton 2s -1s infinite linear` to `@theme inline`.
    - Added open/close asymmetric surface transitions for modals (`data-slot="dialog-backdrop"`, `data-slot="dialog-popup"`, `data-slot="alert-dialog-backdrop"`, `data-slot="alert-dialog-popup"`) and dropdowns (`data-slot="popover-popup"`, `data-slot="select-popup"`, `data-slot="menu-popup"`): 250ms open, 150ms close.
    - Added micro-interaction keyframes and classes: `.t-digit-group`, `.t-digit`, `@keyframes t-digit-pop-in`, `.t-input.is-shaking`, `.t-input-shake`, `@keyframes t-input-shake`, `.t-success-check`, `@keyframes t-success-draw`, `.stagger-item`, `.stagger-1` through `.stagger-6`, `.t-badge`, `.t-avatar`.
    - Added universal `@media (prefers-reduced-motion: reduce)` block neutralizing all transitions and keyframes.
    - Replaced ad-hoc `180ms ease` and `170ms ease` on buttons and nav links with `var(--duration-quick) var(--ease-smooth-out)`.
  - `src/components/ui/dialog.tsx`:
    - Removed hardcoded `duration-200` to bind to `[data-slot="dialog-backdrop"]` and `[data-slot="dialog-popup"]` asymmetric rules.
  - `src/components/ui/empty.tsx`:
    - Resolved prop spreading duplication in `EmptyMedia`.
    - Added action button styling to `EmptyContent`.
  - `src/components/ui/toast.tsx`:
    - Exported `anchoredToastManager` and `AnchoredToastProvider`.
    - Added `AnchoredToasts` renderer using `Toast.Positioner` supporting tooltip-style and regular anchored toasts.
  - New Primitives Created:
    - `src/components/ui/alert-dialog.tsx` (using `@base-ui/react/alert-dialog`)
    - `src/components/ui/menu.tsx` (using `@base-ui/react/menu`, with `DropdownMenu` aliases)
    - `src/components/ui/drawer.tsx` (using `@base-ui/react/drawer`, with mobile menu navigation items)
    - `src/components/ui/skeleton.tsx` (loading placeholder)
    - `src/components/ui/tooltip.tsx` (using `@base-ui/react/tooltip`)
    - `src/components/ui/input-group.tsx` (supporting inline/block addons and inputs)
    - `src/components/ui/animated-number.tsx` (financial and metric digit pop-in)
  - Unit Test Suite:
    - `src/components/ui/__tests__/components.test.ts` (10 tests verifying component exports, constructors, toast managers, animated numbers, and stylesheet motion tokens).

- **Verification Commands & Results**:
  - `pnpm run typecheck`:
    ```
    > ghar-bhandaa@ typecheck /Volumes/Acasis2TB/playground/ghar-bhandaa
    > tsc --noEmit
    (Exit code: 0, 0 errors)
    ```
  - `pnpm run lint`:
    ```
    > ghar-bhandaa@ lint /Volumes/Acasis2TB/playground/ghar-bhandaa
    > eslint
    (Exit code: 0, 0 errors/warnings)
    ```
  - `pnpm run test`:
    ```
    Test Files  7 passed (7)
    Tests  83 passed (83)
    (Exit code: 0, 83/83 passed)
    ```
  - `pnpm run build`:
    ```
    ✓ built in 764ms
    (Exit code: 0)
    ```
  - `graphify update .`:
    ```
    [graphify watch] Rebuilt: 949 nodes, 1748 edges, 72 communities
    [graphify watch] graph.json, graph.html and GRAPH_REPORT.md updated in graphify-out
    (Exit code: 0)
    ```

## 2. Logic Chain

1. **Premise**: Per Requirement R1 and R2, Ghar-Bhandaa required upgrading shared UI components to coss primitives using `@base-ui/react` and establishing the transitions.dev & transitions-polish motion system in `src/styles.css`.
2. **Observation**: `src/styles.css` lacked CSS custom properties for durations, easings, distances, scales, and blurs, and contained ad-hoc durations (`180ms`, `170ms`, `700ms`).
3. **Inference**: Inserting the unified 5-dimension token scale into `:root` and replacing ad-hoc transitions establishes the authoritative motion doctrine across the application.
4. **Observation**: Dialogs and popovers previously opened and closed at symmetric 200ms speeds, violating the open/close asymmetry principle where closing must be faster to avoid user friction.
5. **Inference**: Establishing 250ms open (`--duration-fast`, scale 0.96) and 150ms close (`--duration-quick`, scale 0.96) via `[data-slot="..."]` selectors in `src/styles.css` and removing conflicting inline durations from `dialog.tsx` provides natural, snappy dismissal.
6. **Observation**: Key primitives like `alert-dialog`, `menu`, `drawer`, `skeleton`, `tooltip`, `input-group`, and `animated-number` were missing from `src/components/ui/`.
7. **Inference**: Implementing these primitives using `@base-ui/react` and Tailwind v4 following official coss specifications equips subsequent milestones (Shell, Auth, Portal Views) with the required building blocks.
8. **Observation**: All 83 automated unit tests, typechecks, ESLint rules, and production bundle builds passed with zero errors.

## 3. Caveats

- Route views (e.g. `_authed/dashboard.tsx`, `properties.tsx`, `leases.tsx`) have not been edited in Milestone M1 per exclusive file ownership constraints (`src/styles.css` and `src/components/ui/*` only). Route integration of the new primitives and motion classes is assigned to subsequent milestones (M2 and M3).
- No caveats regarding component stability, typing, or build compatibility.

## 4. Conclusion

Milestone M1 is fully accomplished:
- The motion system in `src/styles.css` is complete with tokens, asymmetric rules, micro-interactions, and reduced-motion overrides.
- All requested coss primitives and component updates in `src/components/ui/` are implemented using 100% `@base-ui/react` and 0% `@radix-ui`.
- All quality gates (`typecheck`, `lint`, `test`, `build`, `graphify`) pass with zero errors.

## 5. Verification Method

To independently verify this milestone:
1. `pnpm run typecheck` — confirms 0 TypeScript compiler errors.
2. `pnpm run lint` — confirms 0 ESLint warnings or errors.
3. `pnpm run test` — executes all 83 Vitest unit and integration tests (including the new component and motion token suite in `src/components/ui/__tests__/components.test.ts`).
4. `pnpm run build` — produces client and server production bundles without bundler errors.
5. `graphify update .` — checks AST extraction and knowledge graph consistency.
