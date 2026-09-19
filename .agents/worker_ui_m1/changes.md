# Milestone M1: Design System & Motion System Core — Changes

## 1. Overview
This milestone delivers the foundational motion system and canonical coss component primitives for Ghar-Bhandaa, aligning 100% with `@base-ui/react` and Tailwind CSS v4 without any `@radix-ui` dependencies.

## 2. Modified Files

### `src/styles.css`
- **5-Dimension `:root` Motion Tokens**:
  - Durations: `--duration-stagger: 40ms`, `--duration-micro: 80ms`, `--duration-quick: 150ms`, `--duration-fast: 250ms`, `--duration-medium: 350ms`, `--duration-slow: 400ms`, `--duration-very-slow: 500ms`.
  - Easings: Centered on `--ease-smooth-out: cubic-bezier(0.22, 1, 0.36, 1)`, plus `--ease-in-out`, `--ease-out`, `--ease-linear`, `--ease-bounce`, `--ease-bounce-strong`.
  - Distances: `--distance-micro: 4px`, `--distance-small: 6px`, `--distance-base: 8px`, `--distance-medium: 12px`, `--distance-large: 30px`.
  - Scales: `--scale-large: 0.96`, `--scale-medium: 0.97`, `--scale-small: 0.98`, `--scale-tiny: 0.99`.
  - Blurs: `--blur-small: 2px`, `--blur-medium: 3px`, `--blur-large: 8px`.
  - Semantic component token mappings for modals, dropdowns, digits, shake, check celebrations, badges, and avatars.
- **Micro-Interactions**:
  - Replaced ad-hoc `180ms ease` and `170ms ease` with calibrated `var(--duration-quick) var(--ease-smooth-out)`.
  - Tactile button press compression: `button:active:not(:disabled), [data-slot="button"]:active:not(:disabled) { transform: scale(var(--scale-small)); }`.
  - Number pop-in classes and keyframes: `.t-digit-group`, `.t-digit`, `@keyframes t-digit-pop-in`.
  - Form error shake: `.t-input.is-shaking`, `.t-input-shake`, `.t-error-msg`, `@keyframes t-input-shake`.
  - Success check celebration: `.t-success-check`, `@keyframes t-success-draw`, `@keyframes t-check-fade`, `@keyframes t-check-rotate`, `@keyframes t-check-blur`, `@keyframes t-check-bob`.
  - Bounded staggers: `.stagger-item`, `.stagger-1` through `.stagger-6` (40ms offset, capped at 200ms total).
  - Avatar stack hover: `.t-avatar:hover` with quick lift and `.t-avatar:not(:hover)` with `--ease-bounce-strong` spring return.
  - Skeleton linear shimmer: `@keyframes skeleton`, `--animate-skeleton: skeleton 2s -1s infinite linear`.
- **Open/Close Asymmetry**:
  - Modals & Alert Dialogs: open 250ms (`--duration-fast`, pre-scale 0.96), close 150ms (`--duration-quick`).
  - Popovers, Select, & Menus: open 250ms (`--dropdown-open-dur`, pre-scale 0.97), close 150ms (`--dropdown-close-dur`, closing-scale 0.99).
- **Universal Reduced Motion Guard**:
  - `@media (prefers-reduced-motion: reduce)` block neutralizing all keyframes, transitions, and transforms across all components.

### `src/components/ui/dialog.tsx`
- Removed hardcoded symmetric `duration-200 ease-in-out` and inline transition classes from `DialogBackdrop` and `DialogPopup`.
- Bound `DialogBackdrop` and `DialogPopup` to `data-slot="dialog-backdrop"` and `data-slot="dialog-popup"` to inherit asymmetric open (250ms) and close (150ms) CSS transitions.

### `src/components/ui/empty.tsx`
- Fixed `EmptyMedia` prop-spreading bug where props were duplicated on both outer and inner wrapper divs.
- Enhanced `EmptyContent` with action button styling (`flex w-full min-w-0 max-w-sm flex-wrap items-center justify-center gap-3 text-balance text-sm mt-2 [[data-slot=empty-header]+&]:mt-2`).

### `src/components/ui/toast.tsx`
- Exported `anchoredToastManager: ReturnType<typeof Toast.createToastManager>`.
- Added and exported `AnchoredToastProvider` and `AnchoredToastProviderProps`.
- Added `AnchoredToasts` renderer utilizing `Toast.Positioner` with tooltip-style and regular notifications.

## 3. Newly Created Files

### `src/components/ui/alert-dialog.tsx`
- Implemented using `@base-ui/react/alert-dialog`.
- Exports: `AlertDialog`, `AlertDialogTrigger`, `AlertDialogPortal`, `AlertDialogBackdrop`, `AlertDialogViewport`, `AlertDialogPopup`, `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogClose`, `AlertDialogCreateHandle`.
- Inherits asymmetric modal open/close timing via `data-slot="alert-dialog-backdrop"` and `data-slot="alert-dialog-popup"`.

### `src/components/ui/menu.tsx`
- Implemented using `@base-ui/react/menu`.
- Exports: `Menu`, `MenuTrigger`, `MenuPortal`, `MenuPopup`, `MenuGroup`, `MenuItem`, `MenuLinkItem`, `MenuCheckboxItem`, `MenuRadioGroup`, `MenuRadioItem`, `MenuGroupLabel`, `MenuSeparator`, `MenuShortcut`, `MenuSub`, `MenuSubTrigger`, `MenuSubPopup`, `MenuCreateHandle`.
- Also exports all DropdownMenu aliases: `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, etc.
- Uses `data-slot="menu-popup"` to inherit origin-aware asymmetric dropdown scaling and fade.

### `src/components/ui/drawer.tsx`
- Implemented using `@base-ui/react/drawer`.
- Supports 4 directions (`bottom`, `top`, `left`, `right`), swipe gestures, backdrop fade, drawer handles, viewports, panels with `ScrollArea`, and mobile menu drawer navigation items (`DrawerMenu`, `DrawerMenuItem`, `DrawerMenuCheckboxItem`, `DrawerMenuRadioGroup`, `DrawerMenuRadioItem`, `DrawerMenuGroup`, `DrawerMenuGroupLabel`, `DrawerMenuSeparator`, `DrawerMenuTrigger`).

### `src/components/ui/skeleton.tsx`
- Implemented loading placeholder primitive using linear shimmer keyframes (`animate-skeleton`, `@keyframes skeleton`).

### `src/components/ui/tooltip.tsx`
- Implemented using `@base-ui/react/tooltip`.
- Exports: `Tooltip`, `TooltipTrigger`, `TooltipPopup`, `TooltipProvider`, `TooltipCreateHandle`, `TooltipContent` alias.

### `src/components/ui/input-group.tsx`
- Implemented input group pattern with addons for prefix/suffix icons, buttons, currency labels, and text.
- Exports: `InputGroup`, `InputGroupAddon`, `InputGroupText`, `InputGroupInput`, `InputGroupTextarea`.
- Preserves input focus when clicking non-interactive addon areas.

### `src/components/ui/animated-number.tsx`
- Implemented `AnimatedNumber` component using the transitions.dev number pop-in animation (`.t-digit-group.is-animating`, `.t-digit`, `data-stagger="1"` and `data-stagger="2"`).

### `src/components/ui/__tests__/components.test.ts`
- Added unit tests covering all new and modified components, verifying export signatures, constructor integrity, anchored toast management, `AnimatedNumber` DOM structure, and CSS stylesheet motion token invariants.

## 4. Verification Results
- `pnpm run typecheck`: 0 errors.
- `pnpm run lint`: 0 errors.
- `pnpm run test`: 83/83 unit tests passed (73 previous + 10 new tests).
- `pnpm run build`: built in 764ms without warnings.
- `graphify update .`: successfully updated knowledge graph (949 nodes, 1748 edges, 72 communities).
