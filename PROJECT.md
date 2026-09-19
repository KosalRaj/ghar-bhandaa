# Project: Ghar-Bhandaa UI/UX Overhaul & Motion Integration

## Architecture

`ghar-bhandaa` is an automated room rent collection and property management system for Nepal built on TanStack Start (React 19), Cloudflare Workers (SSR + Cron Triggers), Cloudflare D1 (SQLite via Drizzle ORM), Cloudflare R2 (Receipt storage), and Better Auth.

### UI/UX & Motion Modernization Architecture

1. **coss Primitives & Particles System**:
   - Primitives built purely on `@base-ui/react` (v1.7.0) with Tailwind CSS v4. Zero `@radix-ui` dependencies.
   - Comprehensive shared library in `src/components/ui/`: `Button`, `Dialog`, `AlertDialog`, `Menu`, `Drawer`, `Card`, `Table`, `Field`, `Input`, `Select`, `Tabs`, `Toast`, `Empty`, `Badge`, `Skeleton`, `Tooltip`, `InputGroup`, `AnimatedNumber`.
   - Particles patterns: empty state CTAs (`EmptyContent`), responsive table-to-card adaptive layouts, accessible mobile sheets.
2. **transitions.dev & transitions-polish Motion Architecture**:
   - Centralized `:root` token scale in `src/styles.css` covering 5 dimensions: Durations (`40ms`–`500ms`), Easings (`cubic-bezier(0.22, 1, 0.36, 1)`), Distances (`4px`–`30px`), Scales (`0.96`–`0.99`), and Blurs (`2px`–`8px`).
   - Open/close asymmetry: Dialogs/Modals open at 250ms (`--duration-fast`, scale 0.96) and close at 150ms (`--duration-quick`, scale 0.96); Popovers/Dropdowns open at 250ms (scale 0.97) and close at 150ms (scale 0.99).
   - Micro-interactions: Number pop-in (`t-digit-group`), Form error shake (`t-input-shake`), Success check (`t-success-check`), and bounded staggers (<300ms total, 40ms offset).
   - Accessibility: Universal `@media (prefers-reduced-motion: reduce)` zero-motion overrides.
3. **Core Domain Invariants (Zero Regression)**:
   - **Integer Paisa Currency Arithmetic**: Monetary values are integers in paisa (`1 NPR = 100 Paisa`). No floats in storage/DB.
   - **Nepal / Kathmandu (`Asia/Kathmandu`, UTC+05:45) Timezone**: All billing cycles, due dates, and overdue states are calculated in Kathmandu time. Billing days constrained to 1–28.
   - **Landlord Authentication & Tenancy Isolation**: Route guard in `_authed.tsx` and server middleware `landlordAuthMiddleware`.

---

## Feature Inventory

| #   | Feature | Description | Milestone | Source |
|---|---|---|---|---|
| 1 | Motion Token Architecture | `:root` tokens in `src/styles.css` (durations, easings, distances, scales, blurs) | M1 | Survey |
| 2 | Open/Close Asymmetry | Asymmetric open (250ms) vs close (150ms) for Dialogs, Modals, and Dropdowns | M1 | Survey |
| 3 | Prefers-Reduced-Motion Guard | Comprehensive `@media (prefers-reduced-motion: reduce)` override block | M1 | Survey |
| 4 | Micro-Interaction Animations | Number pop-in, Form error shake, Success check, Bounded staggers (<300ms) | M1 | Survey |
| 5 | coss Primitive Additions | Add `AlertDialog`, `Menu`, `Drawer`, `Skeleton`, `Tooltip`, `InputGroup` | M1 | Survey |
| 6 | coss Component Modernization | Modernize `Toast` (`anchoredToastManager`), `Empty` (`EmptyContent`), `Table`, `Dialog` | M1 | Survey |
| 7 | Public Landing Page | Build rich public landing page at `/` (`src/routes/index.tsx`) with Hero, features, demo, CTAs | M2 | Survey |
| 8 | Public Header & Footer | Responsive public navigation header with CTAs and informative footer | M2 | Survey |
| 9 | ThemeToggle Icon Morph | Animated Sun/Moon icon swap with smooth cross-fade rotation | M2 | Survey |
| 10 | Sign In & Sign Up Overhaul | Card entrance, tactile fields, password visibility toggle, error shake on invalid submit | M2 | Survey |
| 11 | Landlord Shell & Mobile Nav | `LandlordHeader.tsx` with responsive mobile drawer navigation and active indicator transition | M3 | Survey |
| 12 | Dashboard Overhaul | Animated number pop-ins for financial stats, responsive table/card fallback, modal line items fix | M3 | Survey |
| 13 | Properties, Rooms & Tenants | Staggered card reveals, refined edit/create dialogs, empty state action buttons | M3 | Survey |
| 14 | Leases Registry Overhaul | 8-column table to mobile card-list responsive fallback, `AlertDialog` for lease termination | M3 | Survey |
| 15 | Invoice Details & Ledger | Payment modal validation shake, success check on confirmation, refined 2-col/1-col layout | M3 | Survey |
| 16 | Domain Invariants Preservation | Strict preservation of integer paisa math, Kathmandu date handling, and landlord auth guards | M1–M4 | Survey |
| 17 | Verification Quality Gates | `pnpm run typecheck`, `pnpm run lint`, `pnpm run test`, `pnpm run build` | M4 | Survey |
| 18 | Adversarial UI & Motion Tests | Validate reduced-motion fallbacks, mobile viewports, and edge cases | M4 | Survey |
| 19 | Forensic Integrity Audit | Systematic audit for authentic logic, zero facades, zero hardcoding | M4 | Survey |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Design System & Motion System Core | `src/styles.css` motion tokens & rules; `src/components/ui/` coss primitives & modernizations | none | DONE |
| M2 | Public & Authentication Views Overhaul | Landing page (`/`), Public Header/Footer, ThemeToggle icon morph, `/login`, `/signup` | M1 | DONE |
| M3 | Landlord Management Portal Overhaul | `LandlordHeader` with mobile drawer; `/dashboard`, `/properties`, `/rooms`, `/tenants`, `/leases`, `/invoices/$invoiceId` | M1 | DONE |
| M4 | Verification, Adversarial Hardening & Audit | Typecheck, lint, full Vitest test pass, UI/motion test coverage, Challenger, Forensic Audit | M1, M2, M3 | DONE |

---

## Interface Contracts

### Design System ↔ Routes
- **Motion Classes**:
  - `.t-digit-group` / `.t-digit`: Animated financial numbers via `<AnimatedNumber />`.
  - `.t-input-shake`: Added on validation error to shake form fields.
  - `.t-success-check`: Added to payment/creation confirmation moments.
  - `.stagger-item` with `.stagger-1` through `.stagger-6`: 40ms offset staggered grid entrance.
- **Components**:
  - `AlertDialog`: Semantic barrier for destructive actions (`open`, `onOpenChange`, `title`, `description`, `confirmText`, `cancelText`, `onConfirm`, `variant="destructive"`).
  - `Drawer`: Slide-over sheet for mobile navigation on viewports `< 768px`.
  - `Empty`: Must render `EmptyContent` with action buttons across all empty datasets.
  - `Table`: Must provide clean mobile overflow or responsive card-list fallback.

---

## Code Layout

- `src/styles.css`: Centralized stylesheet with `:root` motion tokens, asymmetric rules, and `@media (prefers-reduced-motion: reduce)`.
- `src/components/ui/`: Base UI / coss shared primitives (`button.tsx`, `dialog.tsx`, `alert-dialog.tsx`, `drawer.tsx`, `menu.tsx`, `card.tsx`, `table.tsx`, `empty.tsx`, `input.tsx`, `toast.tsx`, `skeleton.tsx`, `tooltip.tsx`, `input-group.tsx`, `animated-number.tsx`).
- `src/components/`: Layout and shell components (`Header.tsx`, `LandlordHeader.tsx`, `Footer.tsx`, `ThemeToggle.tsx`).
- `src/routes/index.tsx`: Public landing page.
- `src/routes/login.tsx`, `src/routes/signup.tsx`: Authentication screens.
- `src/routes/_authed.tsx`: Authenticated layout shell.
- `src/routes/_authed/`: Landlord management portal routes (`dashboard.tsx`, `properties.tsx`, `rooms.tsx`, `tenants.tsx`, `leases.tsx`, `invoices.$invoiceId.tsx`).
- `src/lib/`: Domain business logic (money, dates, invoices, payments).
- `src/server/`: Server functions.
