# Handoff Report — Motion & Animation System Survey

**Agent**: `explorer_survey_motion`  
**Working Directory**: `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/explorer_survey_motion/`  
**Target Milestone**: UI/UX Overhaul — Motion & Animation System  
**Recipient**: `parent` (`fc4238fb-565d-4348-9447-354d94999226`)  

---

## 1. Observation

Direct inspection of `src/styles.css`, component primitives in `src/components/ui/`, and route files revealed the following exact lines and behaviors:

1. **Ad-hoc global transition declarations in `src/styles.css`**:
   - `src/styles.css:388-396`:
     ```css
     button,
     .island-shell,
     a {
       transition:
         background-color 180ms ease,
         color 180ms ease,
         border-color 180ms ease,
         transform 180ms ease;
     }
     ```
     `180ms ease` is hardcoded across all buttons and anchors with generic `ease`.
   - `src/styles.css:422`:
     ```css
     transition: transform 170ms ease;
     ```
     Arbitrary `170ms` duration applied to `.nav-link::after`.
   - `src/styles.css:435-448`:
     ```css
     .rise-in {
       animation: rise-in 700ms cubic-bezier(0.16, 1, 0.3, 1) both;
     }
     ```
     `700ms` is excessively slow, unaligned with the token scale, and has no reduced-motion override.
   - `src/styles.css:177-184`:
     ```css
     --animate-toast-success-odd: toast-success-odd 0.32s cubic-bezier(0.5, 1, 0.89, 1);
     --animate-toast-error-odd: toast-error-odd 0.28s cubic-bezier(0.5, 1, 0.89, 1);
     ```
     Non-standard bezier curves (`cubic-bezier(0.5, 1, 0.89, 1)`) and ad-hoc durations (`0.32s`, `0.28s`).
   - `src/styles.css` contains zero `:root` motion tokens and zero `@media (prefers-reduced-motion: reduce)` rules anywhere in its 464 lines.

2. **Symmetric Modal and Dropdown Transitions in UI Primitives**:
   - `src/components/ui/dialog.tsx:37`:
     ```tsx
     'fixed inset-0 z-50 bg-black/32 backdrop-blur-sm transition-all duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0'
     ```
   - `src/components/ui/dialog.tsx:87`:
     ```tsx
     'relative row-start-2 flex ... transition-[scale,opacity,translate] duration-200 ease-in-out ... sm:data-ending-style:scale-98 sm:data-starting-style:scale-98'
     ```
     Symmetric `200ms ease-in-out` on both enter and exit.
   - `src/components/ui/popover.tsx:59`:
     ```tsx
     'relative flex ... transition-[width,height,scale,opacity] ... data-starting-style:scale-98 data-starting-style:opacity-0'
     ```
     Lacks exit acceleration (`150ms`) and origin-scaled growth.
   - `src/components/ui/tabs.tsx:61`:
     ```tsx
     'absolute bottom-0 left-0 ... transition-[width,translate] duration-200 ease-in-out'
     ```

3. **Absence of Micro-Interactions on Key User Journeys**:
   - `src/routes/_authed/dashboard.tsx:215-230`: Financial statistics (Total Collected, Total Outstanding, Active Leases, Overdue Invoices) display static numbers with no pop-in transitions.
   - `src/routes/_authed/invoices.$invoiceId.tsx:74-100`: Cash payment modal lacks error state shake on validation error and celebratory success-check animation on completion.
   - Entity grid layouts (`properties.tsx:166`, `rooms.tsx:196`, `tenants.tsx:186`): Cards mount simultaneously with no entrance stagger.

---

## 2. Logic Chain

1. **From Observation 1 (Ad-hoc timings & absence of tokens)**:
   - Ad-hoc durations (`180ms`, `170ms`, `700ms`, `0.32s`) and non-standard curves degrade visual polish and consistency.
   - Applying `transitions-polish` and `transitions-dev` doctrine requires defining a unified `:root` scale across 5 dimensions: Durations (7 tokens: `40ms` to `500ms`), Easings (6 tokens centered around `--ease-smooth-out: cubic-bezier(0.22, 1, 0.36, 1)`), Distances (`4px` to `30px`), Scales (`0.96` to `0.99`), and Blurs (`2px` to `8px`).
   - Every semantic transition recipe (`--modal-*`, `--dropdown-*`, `--digit-*`, `--shake-*`, `--check-*`, `--badge-*`) maps directly to this underlying token grid.

2. **From Observation 2 (Symmetric modal & dropdown transitions)**:
   - According to transitions-polish, opening is an invitation, but closing must get out of the way.
   - Base UI natively exposes `data-starting-style` (entrance) and `data-ending-style` (exit).
   - By declaring `transition: transform var(--modal-open-dur) var(--modal-ease)` (250ms) on the default open state and switching to `transition: transform var(--modal-close-dur) var(--modal-ease)` (150ms) on `[data-ending-style]`, modals and popovers achieve true 250ms open vs 150ms close asymmetry without any JavaScript overhead.

3. **From Observation 3 (Missing micro-interactions & un-staggered grids)**:
   - Financial figures are central to rental property management. Adding `AnimatedNumber` (`@keyframes t-digit-pop-in`) with a `70ms` decimal stagger brings vitality to the landlord dashboard and invoice balances.
   - Sequential grid rendering without bounding causes visual overwhelm or sluggishness. A bounded stagger system using `--duration-stagger: 40ms` capped at $N_{\max}=6$ items guarantees a maximum total delay of $200\text{ms}$, well under the strict $300\text{ms}$ perception ceiling.
   - Form errors in modal dialogs (cash overpayment, missing fields) require tactile feedback. A 4-segment cubic-bezier `@keyframes t-input-shake` (total 280ms) paired with `.t-input-wrap.is-error` gives clear, instantaneous feedback.
   - Payment confirmation and invoice generation moments require celebration via `.t-success-check` (fade + 80° upright rotation + 40px bob + SVG path stroke-draw).

4. **From Observation 1 (Absence of accessibility guards)**:
   - Web Content Accessibility Guidelines (WCAG 2.1 SC 2.3.3) and transitions-dev mandate that all animated elements must obey `prefers-reduced-motion: reduce`.
   - An unconditional `@media (prefers-reduced-motion: reduce)` block must zero `animation-duration`, `transition-duration`, `transform`, and `filter` across all selectors.

---

## 3. Caveats

1. **Base UI CSS Pseudo-State Compatibility**:
   - Modern Base UI transitions rely on `@starting-style` / `data-starting-style` and `data-ending-style`. The proposed CSS uses attribute selectors `[data-starting-style]` and `[data-ending-style]` which are fully compatible with Base UI runtime attributes and standard Tailwind v4 setup.
2. **SVG Path Length Measurement for Success Check**:
   - The CSS snippet specifies a default `stroke-dasharray: 20` for standard 24px checkmark icons. For bespoke SVG icon paths, `path.getTotalLength()` should be rounded up by 1px if custom SVGs are substituted.
3. **No Direct Codebase Modifications**:
   - As an explorer agent operating under read-only constraints, no application source files (`src/styles.css`, `src/components/ui/*`) were altered. The ready-to-use drop-in CSS code is compiled in `survey_motion.md`.

---

## 4. Conclusion

The motion survey is complete and provides an exhaustive, production-grade motion architecture for Ghar-Bhandaa:
1. **Token Architecture**: Complete `:root` block defined across the 5 dimensions, fully unifying durations, easings, distances, scales, and blurs.
2. **Open/Close Asymmetry**: Modal dialogs open in `250ms` (scale 0.96) and close in `150ms` (scale 0.96); dropdowns open in `250ms` (pre-scale 0.97) and close in `150ms` (closing scale 0.99).
3. **Bounded Staggers**: Strictly capped at $\le 200\text{ms}$ ($5 \times 40\text{ms}$) across dashboard metrics, property grids, and table rows.
4. **Purposeful Micro-Interactions**: Full specifications for Number Pop-in (`t-digit-group`), Form Error State Shake (`t-input-shake`), Success Check celebration (`t-success-check`), and tactile hover/tap dynamics.
5. **Universal Accessibility**: Complete `@media (prefers-reduced-motion: reduce)` block ready to drop into `src/styles.css`.
6. **Detailed Artifact**: All code snippets, token tables, and integration instructions are recorded in `.agents/explorer_survey_motion/survey_motion.md`.

---

## 5. Verification Method

To verify the survey findings and validate subsequent implementation:

1. **Inspect Report Artifact**:
   - Verify that `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/explorer_survey_motion/survey_motion.md` contains the full analysis and Section 11 drop-in CSS snippet.
2. **Project Linting & Typecheck**:
   - Run `pnpm run typecheck` to confirm 0 TypeScript errors.
   - Run `pnpm run lint` to confirm 0 ESLint errors.
3. **Test Suite Verification**:
   - Run `pnpm run test` to confirm 100% of Vitest tests pass without regressions:
     - `src/lib/__tests__/money.test.ts`
     - `src/lib/__tests__/dates.test.ts`
     - `src/lib/__tests__/payments.server.test.ts`
     - `src/lib/__tests__/invoices.server.test.ts`
     - `src/lib/__tests__/stress.test.ts`
4. **CSS Motion Token Validation (Once Implemented)**:
   - In browser developer tools, inspect `:root` on `document.documentElement` to verify `--duration-*`, `--ease-*`, `--distance-*`, `--scale-*`, `--blur-*` are active.
   - Emulate `prefers-reduced-motion: reduce` in Chrome DevTools (Rendering > Emulate CSS media feature prefers-reduced-motion) and verify that all dialogs, dropdowns, and animations open instantly without motion.
