# Milestone M1 Review & Adversarial Challenge Report

## Review Summary

**Verdict**: **APPROVE**

Milestone M1 (Design System & Motion System Core) successfully satisfies all requirements, invariants, and quality gates specified in `ORIGINAL_REQUEST.md` and `PROJECT.md`. The UI components in `src/components/ui/` adhere 100% to coss primitives and `@base-ui/react` standards with 0% `@radix-ui` dependencies. The stylesheet `src/styles.css` establishes the transitions.dev 5-dimension motion system, asymmetric open/close timing, tactile micro-interactions, and a universal `prefers-reduced-motion` override. All verification commands (`pnpm run typecheck`, `pnpm run lint`, `pnpm run test`, `pnpm run build`) passed with zero errors.

---

## Findings & Inspection

### Component Implementation Quality: PASS

1. **`src/components/ui/alert-dialog.tsx`**:
   - Built on `@base-ui/react/alert-dialog`.
   - Correctly integrates `AlertDialogPrimitive.Root`, `Portal`, `Trigger`, `Backdrop`, `Viewport`, `Popup`, `Header`, `Footer`, `Title`, `Description`, `Close`, and `createHandle`.
   - Binds `data-slot="alert-dialog-backdrop"` and `data-slot="alert-dialog-popup"` to inherit asymmetric modal CSS animations.
   - Preserves mobile responsiveness (`bottomStickOnMobile` bottom sheet variant on `<sm` screens).
   - Properly omits top-right 'X' close button to conform to WAI-ARIA alertdialog patterns (requiring explicit user action).
   - Provides backward compatibility aliases (`AlertDialogOverlay`, `AlertDialogContent`).

2. **`src/components/ui/menu.tsx`**:
   - Built on `@base-ui/react/menu`.
   - Comprehensive parts: `Menu`, `MenuTrigger`, `MenuPortal`, `MenuPopup`, `MenuGroup`, `MenuItem`, `MenuLinkItem`, `MenuCheckboxItem`, `MenuRadioGroup`, `MenuRadioItem`, `MenuGroupLabel`, `MenuSeparator`, `MenuShortcut`, `MenuSub`, `MenuSubTrigger`, `MenuSubPopup`.
   - Implements both standard checkmark and switch toggle indicator variants in `MenuCheckboxItem`.
   - Supports positioning via Base UI `Positioner` and forwards `align`, `sideOffset`, `alignOffset`, `side`, `anchor`, and `portalProps`.
   - Provides all legacy `DropdownMenu*` aliases for backward compatibility.

3. **`src/components/ui/drawer.tsx`**:
   - Built on `@base-ui/react/drawer`, `@base-ui/react/checkbox`, and `@base-ui/react/radio-group`.
   - Supports 4 drawer directions (`bottom`, `top`, `left`, `right`) with direction mapping to swipe gestures.
   - Comprehensive parts: `DrawerBackdrop`, `DrawerViewport`, `DrawerPopup`, `DrawerHeader`, `DrawerFooter`, `DrawerTitle`, `DrawerDescription`, `DrawerPanel` (with `ScrollArea` integration), `DrawerBar`, `DrawerContent`, and mobile menu navigation items (`DrawerMenu`, `DrawerMenuItem`, `DrawerMenuCheckboxItem`, `DrawerMenuRadioGroup`, `DrawerMenuRadioItem`).

4. **`src/components/ui/skeleton.tsx`**:
   - Uses linear shimmer keyframe `animate-skeleton` with CSS custom property `[background:linear-gradient(120deg,transparent_40%,var(--skeleton-highlight),transparent_60%)_var(--color-muted)_0_0/200%_100%_fixed]`.
   - Provides dark mode highlight adaptation.

5. **`src/components/ui/tooltip.tsx`**:
   - Built on `@base-ui/react/tooltip`.
   - Full parts: `TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipPopup` (aliased as `TooltipContent`), `TooltipPositioner`, and `TooltipViewport`.
   - Includes cross-fading viewport styles (`**:data-current`, `**:data-previous`) and instant dismissal support.

6. **`src/components/ui/input-group.tsx`**:
   - Built with `cva` variants (`inline-start`, `inline-end`, `block-start`, `block-end`).
   - Implements smart focus delegation: non-interactive clicks on addon areas focus the sibling input/textarea, while interactive clicks on nested buttons, select triggers, or links are not intercepted (`target.closest(...)`).
   - Accessible `role="group"` on root container.

7. **`src/components/ui/animated-number.tsx`**:
   - Renders financial metrics with transitions.dev pop-in animations.
   - Implements screen reader accessibility: outer container carries full string in `aria-label`, while split individual `.t-digit` spans are hidden via `aria-hidden="true"`.
   - Implements stagger delays (`data-stagger="1"` and `data-stagger="2"`) on trailing digits.

8. **`src/components/ui/dialog.tsx`**:
   - Replaced hardcoded inline `duration-200 ease-in-out` transitions with clean `data-slot="dialog-backdrop"` and `data-slot="dialog-popup"` CSS bindings to leverage stylesheet asymmetric timing.

9. **`src/components/ui/empty.tsx`**:
   - Fixed prop duplication bug in `EmptyMedia` where `{...props}` was previously spread to both outer and inner wrapper divs.
   - Added responsive action button container layout to `EmptyContent`.

10. **`src/components/ui/toast.tsx`**:
    - Exported `anchoredToastManager` and `AnchoredToastProvider`.
    - Implemented `AnchoredToasts` renderer using `Toast.Positioner` supporting both tooltip-style and standard toast notifications.

---

## Adversarial Stress-Test & Challenge Report

### Overall Risk Assessment: LOW

### Challenges Tested & Mitigations Verified

1. **Challenge: Universal Reduced Motion Invisibility Bug**
   - *Attack Scenario*: Keyframe-based micro-interactions (e.g. `.t-success-check`) often start with `opacity: 0` and animate to `opacity: 1`. When `@media (prefers-reduced-motion: reduce)` disables keyframe execution, animated elements can remain permanently hidden at `opacity: 0`.
   - *Result*: **PASS**. `src/styles.css` lines 860-865 explicitly contains:
     ```css
     .t-success-check {
       opacity: 1 !important;
     }
     .t-success-check svg path {
       stroke-dashoffset: 0 !important;
     }
     ```
     The reduced motion override ensures immediate full visibility of completion marks without animation.

2. **Challenge: InputGroup Addon Click Interception Bug**
   - *Attack Scenario*: An addon containing an interactive button (e.g. show/hide password toggle, clear button, or unit dropdown) could have its click hijacked by a naive focus handler calling `e.preventDefault()`.
   - *Result*: **PASS**. `src/components/ui/input-group.tsx` lines 63-66 guards with:
     ```tsx
     const isInteractive = target.closest(
       "button, a, input, select, textarea, [role='button'], [role='combobox'], [role='listbox'], [data-slot='select-trigger']",
     )
     if (isInteractive) return
     ```
     Clicks on interactive controls propagate normally, while clicks on plain text/icons smoothly transfer focus to the input.

3. **Challenge: Screen Reader Splitting in AnimatedNumber**
   - *Attack Scenario*: Splitting a number into character spans for animation could cause assistive technology to announce single digits individually ("one", "two", "comma", "five", "zero", "zero") rather than the coherent number.
   - *Result*: **PASS**. `src/components/ui/animated-number.tsx` places `aria-label={str}` on the wrapper container and `aria-hidden="true"` on every `.t-digit` child span.

4. **Challenge: Zero @radix-ui Dependency Invariant**
   - *Attack Scenario*: Residual Radix UI imports or packages might linger in source files or `package.json`.
   - *Result*: **PASS**. Ripgrep search for `@radix-ui` across `src/` and `package.json` returned 0 matches.

5. **Challenge: Asymmetric Open vs. Close Performance**
   - *Attack Scenario*: Slow closing animations create a sluggish UX feel and delay user interaction when dismissing dialogs or menus.
   - *Result*: **PASS**. Modals open at 250ms (`--modal-open-dur`) and close at 150ms (`--modal-close-dur`); dropdowns open at 250ms (`--dropdown-open-dur`) and close at 150ms (`--dropdown-close-dur`).

---

## 5-Component Handoff Protocol

### 1. Observation
- Independent verification was executed on the current working tree:
  - `git status --short` confirms only intended files modified (`src/styles.css`, `dialog.tsx`, `empty.tsx`, `toast.tsx`) and new files created (`alert-dialog.tsx`, `animated-number.tsx`, `drawer.tsx`, `input-group.tsx`, `menu.tsx`, `skeleton.tsx`, `tooltip.tsx`, and `__tests__/components.test.ts`).
  - `pnpm run typecheck` output:
    ```
    > ghar-bhandaa@ typecheck /Volumes/Acasis2TB/playground/ghar-bhandaa
    > tsc --noEmit
    Exit code: 0
    ```
  - `pnpm run lint` output:
    ```
    > ghar-bhandaa@ lint /Volumes/Acasis2TB/playground/ghar-bhandaa
    > eslint
    Exit code: 0 (0 warnings, 0 errors)
    ```
  - `pnpm run test` output:
    ```
    Test Files  7 passed (7)
    Tests  83 passed (83)
    Duration  818ms
    Exit code: 0
    ```
  - `pnpm run build` output:
    ```
    ✓ built in 988ms
    Exit code: 0
    ```
  - Search for `@radix-ui` in `src/` and `package.json`: 0 results found.

### 2. Logic Chain
1. Requirement R1 demands shared UI components modernized with coss primitives and `@base-ui/react`, eliminating any `@radix-ui` dependencies. Direct codebase grep confirmed 0 occurrences of `@radix-ui` and 100% `@base-ui/react` adoption.
2. Requirement R2 demands the transitions.dev motion system with 5-dimension tokens, open/close asymmetry, micro-interactions, and reduced-motion fallback. Inspection of `src/styles.css` confirmed complete `:root` tokens, asymmetric CSS rules for modals and dropdowns, keyframes for pop-ins/shimmers/shakes/checks, and a comprehensive `@media (prefers-reduced-motion: reduce)` block.
3. Component inspection of `alert-dialog.tsx`, `menu.tsx`, `drawer.tsx`, `skeleton.tsx`, `tooltip.tsx`, `input-group.tsx`, `animated-number.tsx`, `dialog.tsx`, `empty.tsx`, and `toast.tsx` verified proper part composition, accessibility attributes, slot forwarding, and backward compatibility.
4. Independent execution of `typecheck`, `lint`, `test`, and `build` completed with 0 errors across all 83 unit and integration tests.
5. Therefore, Milestone M1 is fully accomplished and compliant with all project requirements.

### 3. Caveats
- Route views (`src/routes/*`) have not yet replaced their local dialog/dropdown usage with the newly available primitives (e.g. `AlertDialog`, `Menu`, `Drawer`), as route-level updates are scoped to Milestone M2 (Shell & Auth) and Milestone M3 (Portal Views).

### 4. Conclusion
- **Verdict**: **APPROVE**
- Milestone M1 is ready to be merged and built upon by subsequent milestones.

### 5. Verification Method
To independently replicate this review:
1. Run `pnpm run typecheck` to verify TypeScript typing.
2. Run `pnpm run lint` to verify ESLint compliance.
3. Run `pnpm run test` to verify all 83 Vitest tests across domain and UI primitives.
4. Run `pnpm run build` to verify Vite client and server production bundling.
5. Run `git grep "@radix-ui" src/` to verify zero Radix UI dependencies.
