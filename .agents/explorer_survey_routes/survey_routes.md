# Comprehensive Route, View & Verification Survey Report

**Author:** `explorer_survey_routes`  
**Date:** 2026-09-19  
**Repository:** `ghar-bhandaa`  
**Working Directory:** `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/explorer_survey_routes/`

---

## 1. Executive Summary

A comprehensive architectural and UX survey was conducted across all public, authentication, and landlord management routes in the `ghar-bhandaa` application. The baseline tooling validation (`typecheck`, `lint`, `test`, `build`) succeeded with zero errors across all 73 existing automated tests. 

However, critical UI/UX gaps exist between the current codebase and the modernization requirements specified in `ORIGINAL_REQUEST.md`:
1. **Missing Landing Page**: The root route `/` (`src/routes/index.tsx`) does not render a public landing page; it blindly throws an immediate client-side redirect to `/dashboard`, redirecting unauthenticated visitors immediately into `/login`.
2. **Missing Mobile Navigation & Responsive Overflow**: `LandlordHeader` wraps navigation links in a flat flex row without a mobile hamburger/drawer menu, causing crowded header wrapping on narrow viewports. Data tables in `/dashboard` and `/leases` lack responsive card-view alternatives or horizontal scroll indicator affordances, and the manual invoice line item form in `/dashboard` crushes multiple inputs side-by-side on mobile screens.
3. **Motion System Absence**: `src/styles.css` lacks the standard `transitions.dev` `:root` motion token architecture (durations, easings, distances, scales, blurs) and transitions-polish rules (asymmetric modal/dropdown open/close speeds, shake-on-error validation, number pop-ins for financial stats, and `@media (prefers-reduced-motion: reduce)` guards).
4. **Test Coverage Gaps**: Automated testing covers domain business logic (integer paisa calculations, Kathmandu date manipulations, payment ledgers, invoice recalculation), but has zero tests for React routes, UI components, form validation states, or navigation guards.

---

## 2. Baseline Verification Tooling & Test Coverage Report

All four primary verification commands in `package.json` were executed in the local environment:

| Check | Command | Status | Duration | Key Observations |
|---|---|---|---|---|
| **Typecheck** | `pnpm run typecheck` (`tsc --noEmit`) | **PASS** (0 errors) | 4.2s | TypeScript compiler validated all route definitions and server function RPC types. |
| **Linter** | `pnpm run lint` (`eslint`) | **PASS** (0 errors, 0 warnings) | 3.1s | ESLint passed cleanly with no styling or syntax warnings. |
| **Test Suite** | `pnpm run test` (`vitest run`) | **PASS** (73/73 tests pass) | 0.8s | 6 test files passed cleanly (dates, money, challenger, invoices, payments, stress). |
| **Production Build** | `pnpm run build` (`vite build`) | **PASS** (Code 0) | 0.8s | Vite successfully bundled SSR and client assets into `dist/`. |

### Test Suite Breakdown

The existing 73 tests are distributed strictly across core utilities and server-side functions:
1. `src/lib/__tests__/dates.test.ts` (12 tests): Validates Kathmandu timezone parsing, formatted strings (`YYYY-MM-DD`), day additions, and past date checks.
2. `src/lib/__tests__/money.test.ts` (10 tests): Validates integer paisa conversions (`nprToPaisa`, `paisaToNpr`) and Nepali currency formatting (`formatNpr`).
3. `src/lib/__tests__/challenger_m1_2.test.ts` (20 tests): Integration stress tests for invoice generation, payment allocation, cross-tenant isolation, and cash reconciliation.
4. `src/lib/__tests__/invoices.server.test.ts` (9 tests): Validates invoice creation, status transitions (`unpaid` -> `partial` -> `paid`), and line-item aggregation.
5. `src/lib/__tests__/payments.server.test.ts` (5 tests): Validates payment recording, overpayment rejection, and ledger integrity.
6. `src/lib/__tests__/stress.test.ts` (17 tests): Validates boundary values (0 to 100,000 paisa round-trip exactness, concurrency edge-cases).

### Verification Gaps Identified
- **Missing Coverage Engine**: Attempting to run `vitest run --coverage` fails because `@vitest/coverage-v8` is not installed in `devDependencies`.
- **Zero Route / Component Testing**: None of the 8 routes (`index.tsx`, `login.tsx`, `signup.tsx`, `_authed.tsx`, `dashboard.tsx`, `properties.tsx`, `rooms.tsx`, `tenants.tsx`, `leases.tsx`, `invoices.$invoiceId.tsx`) or UI components (`button.tsx`, `dialog.tsx`, `table.tsx`, `tabs.tsx`, etc.) have automated tests or React Testing Library suites.

---

## 3. Route Inventory & View Layout Survey

### A. Public & Authentication Routes

#### 1. Root Route: `/` (`src/routes/index.tsx`)
- **File Location**: `src/routes/index.tsx` (10 lines)
- **Current Implementation**:
  ```tsx
  export const Route = createFileRoute('/')({
    loader: () => {
      throw redirect({ to: '/dashboard' })
    },
  })
  ```
- **UX Gap**: No landing page exists. Visiting the root domain immediately bounces to `/dashboard`, which triggers `_authed.tsx` and bounces to `/login`.
- **Requirements Mandate**: `ORIGINAL_REQUEST.md` specifically requires: "Public & Authentication Views: Landing page (/), Sign In (/login), Sign Up (/signup), Global Header, Footer, and ThemeToggle."
- **Recommended Remediation**: Build an attractive, responsive landing page at `/` explaining Ghar-Bhandaa's value proposition (automated monthly invoices, tenant management, NPR integer tracking, Kathmandu rent scheduling) with prominent call-to-actions ("Get Started as Landlord", "Sign In to Portal"), feature showcase cards, and demo highlights.

#### 2. Sign In: `/login` (`src/routes/login.tsx`)
- **File Location**: `src/routes/login.tsx` (134 lines)
- **Structure**: Uses `Header`, `Footer`, and a centered `Card` with email and password inputs.
- **Interactions**: Submits via `authClient.signIn.email`, navigates to `/` on success, displays error in an `Alert` component.
- **UX Gaps**:
  - No shake animation on invalid login attempt.
  - No password visibility toggle (eye icon) for user convenience.
  - Form card enters without smooth entrance transition.

#### 3. Sign Up: `/signup` (`src/routes/signup.tsx`)
- **File Location**: `src/routes/signup.tsx` (148 lines)
- **Structure**: Centered `Card` with Full Name, Email, Optional Phone, and Password.
- **Interactions**: Calls `registerLandlord` server function, navigates to `/login` on success.
- **UX Gaps**:
  - No password strength indicator or confirmation field.
  - Phone number validation formatting is unstructured.
  - Lacks tactile microinteractions on input focus and button press.

#### 4. Header: `src/components/Header.tsx`
- **File Location**: `src/components/Header.tsx` (25 lines)
- **Current Behavior**: Renders on public routes. Displays brand pill with glowing green pip and `ThemeToggle`.
- **UX Gaps**: Missing navigation links (e.g. "Features", "About", "Pricing", "Sign In") when displayed on the public landing page.

#### 5. Footer: `src/components/Footer.tsx`
- **File Location**: `src/components/Footer.tsx` (13 lines)
- **Current Behavior**: Displays copyright year and static text `"Room Rent Collection & Management"`.
- **UX Gaps**: Extremely minimal; missing links (Documentation, Support, Privacy Policy, Terms).

#### 6. Theme Toggle: `src/components/ThemeToggle.tsx`
- **File Location**: `src/components/ThemeToggle.tsx` (82 lines)
- **Current Behavior**: Plain HTML button displaying text `"Auto"`, `"Dark"`, or `"Light"`.
- **UX Gaps**: Lacks visual iconography (Sun, Moon, Laptop/Monitor icons). Does not use `transitions-dev` icon swap transition (`--blur-small`, cross-fade rotate).

---

### B. Landlord Management Portal

#### 1. Authenticated Layout Shell: `src/routes/_authed.tsx`
- **File Location**: `src/routes/_authed.tsx` (30 lines)
- **Guard**: `beforeLoad` runs `await checkLandlordAuth()`; if not authenticated, throws `redirect({ to: '/login' })`.
- **Layout**: Renders `LandlordHeader`, `<main className="flex-grow py-8"><Outlet /></main>`, and `Footer`.

#### 2. Landlord Navigation Header: `src/components/LandlordHeader.tsx`
- **File Location**: `src/components/LandlordHeader.tsx` (106 lines)
- **Structure**: Brand link, flat flex navigation links (Dashboard, Properties, Rooms, Tenants, Leases), User Avatar initials, Sign Out button, and `ThemeToggle`.
- **UX Bottlenecks**:
  - **No Mobile Navigation**: At `< 640px` viewport widths, navigation links simply wrap on multiple lines, consuming large vertical header space.
  - **No Active Indicator Animation**: The active link underline (`.nav-link.is-active::after`) is a simple CSS scale without fluid transition between route changes.
  - Avatar and user name are hidden on mobile (`hidden sm:flex`), providing no indication of the current logged-in identity on phones.

#### 3. Dashboard: `src/routes/_authed/dashboard.tsx`
- **File Location**: `src/routes/_authed/dashboard.tsx` (544 lines)
- **Components Used**: `Card`, `Table`, `Tabs`, `Badge`, `Button`, `Dialog`, `Select`, `DatePicker`, `Empty`, `toastManager`.
- **Layout & Structure**:
  - Top header: Page title + "Raise Manual Invoice" action button.
  - 4-Card Stats Grid: Total Collected (green), Total Outstanding (neutral), Active Leases (lagoon), Overdue Invoices (destructive red).
  - Invoices Registry Card: Tabs filter (`All`, `Paid`, `Unpaid`, `Partial`, `Overdue`) + Data Table with Period, Tenant, Room/Property, Amount, Due Date, Status Badge, and Details button.
  - Manual Invoice Dialog: Active Lease selector, Billing Period, Due Date, and dynamic line items repeater.
- **UX Gaps & Bottlenecks**:
  - **Financial Stats**: Numbers are rendered as static text. According to `transitions-dev`, updated metrics should use `--digit-dur: 500ms` number pop-in animations.
  - **Table Mobile Experience**: While `<Table>` has `overflow-x-auto`, tables on mobile require horizontal dragging. A responsive card-list or compact invoice list should be available on small screens.
  - **Line Items Repeater on Mobile**: Modal line items are rendered as `flex gap-2 items-center`:
    ```tsx
    <Input placeholder="Description" className="flex-1" />
    <Input placeholder="NPR" className="w-28" />
    <Select ... className="w-32" />
    <Button size="icon-sm" ... />
    ```
    On phone screens (<400px), these 4 elements wrap or overflow horizontally, destroying the modal layout. It needs a responsive multi-row card pattern on mobile.

#### 4. Properties Registry: `src/routes/_authed/properties.tsx`
- **File Location**: `src/routes/_authed/properties.tsx` (291 lines)
- **Layout**: Responsive grid `grid gap-6 md:grid-cols-2 lg:grid-cols-3`.
- **Cards**: Building icon, property name, address with `MapPin` icon, Edit button.
- **Modal**: Create / Edit dialog with Property Name and Address inputs.
- **Assessment**: Good responsive adaptability (1 column mobile, 2 columns tablet, 3 columns desktop). Clean empty state.

#### 5. Rooms Registry: `src/routes/_authed/rooms.tsx`
- **File Location**: `src/routes/_authed/rooms.tsx` (385 lines)
- **Layout**: Responsive grid `grid gap-6 md:grid-cols-2 lg:grid-cols-3`.
- **Cards**: DoorOpen icon, room name, active/inactive badge, property name, floor, optional description, Edit button.
- **Modal**: Create/Edit dialog with Property selection, Room name, Floor, Description textarea, and Active Switch.
- **Assessment**: Well-structured card hierarchy. The Switch component has clear labeling.

#### 6. Tenants Registry: `src/routes/_authed/tenants.tsx`
- **File Location**: `src/routes/_authed/tenants.tsx` (350 lines)
- **Layout**: Responsive grid `grid gap-6 md:grid-cols-2 lg:grid-cols-3`.
- **Cards**: Avatar initials badge, name, email, phone with `Phone` icon, optional notes in quote box, Edit Profile button.
- **Modal**: Create/Edit dialog with Full Name, Email, Phone, Notes textarea.
- **Assessment**: Clean contact presentation. Avatars provide solid visual anchoring.

#### 7. Leases Registry: `src/routes/_authed/leases.tsx`
- **File Location**: `src/routes/_authed/leases.tsx` (503 lines)
- **Layout**: Full-width Card containing a Table of leases: Tenant, Room & Property, Rent, Deposit, Billing Day, Period, Status Badge, End Lease action.
- **Modals**:
  - Create Lease Dialog: Room selector (only active rooms), Tenant selector, Rent amount NPR, Deposit amount NPR, Billing Day (1-28), Start Date, End Date.
  - Terminate Lease Dialog: Confirmation modal with Termination Date picker.
- **UX Bottlenecks**: Table has 8 columns. On mobile screens, reading lease details requires extensive horizontal scrolling. Needs a responsive card view for `< 768px`.

#### 8. Invoice Details & Ledger: `src/routes/_authed/invoices.$invoiceId.tsx`
- **File Location**: `src/routes/_authed/invoices.$invoiceId.tsx` (432 lines)
- **Layout**: Two-column layout on desktop `grid gap-6 lg:grid-cols-3`:
  - Left 2 columns:
    - Invoice Summary Card: Period kicker, Invoice Details title, Status Badge, 4-metric grid (Due Date, Total Amount, Total Paid, Remaining Balance), and "Record Cash Payment" action button.
    - Itemized Charges Card: Table listing each line item (Description, Kind badge, Amount) and Grand Total.
  - Right 1 column:
    - Tenant Card: Name, Email, Phone, Room, Property, Billing Day.
    - Payment History Ledger: Itemized list of payments with method, confirmed date, gateway reference, amount, and status badge.
- **Modal**: Record Cash Payment Dialog: Amount Received (NPR, clamped to remaining balance), Payment Date picker.
- **Assessment**: Excellent information hierarchy. Clearly separates invoice status, breakdown, tenant details, and append-only payment ledger.

---

## 4. UI/UX Hierarchy, Responsive Adaptability & States Assessment

### Responsive Adaptability Matrix

| View | Mobile (<640px) | Tablet (640-1024px) | Desktop (>1024px) | Key Responsiveness Notes |
|---|---|---|---|---|
| **Header** | Crowded | Adequate | Clean | Lacks mobile drawer/sheet; navigation wraps awkwardly. |
| **Login / Signup** | 100% width card | Max-w-md centered | Max-w-md centered | Good form centering; lacks microinteractions. |
| **Dashboard** | 1-col stats, table overflow | 2-col stats, table | 4-col stats, table | Table overflows without card fallback. Modal line items squash. |
| **Properties** | 1 column | 2 columns | 3 columns | Responsive grid adapts smoothly. |
| **Rooms** | 1 column | 2 columns | 3 columns | Responsive grid adapts smoothly. |
| **Tenants** | 1 column | 2 columns | 3 columns | Responsive grid adapts smoothly. |
| **Leases** | Table overflow | Table overflow | 8-col Table | Lacks mobile card alternative. |
| **Invoice Details** | 1 column stack | 1 column stack | 2-col / 1-col split | Stacks cleanly on mobile (`lg:col-span-2` + `lg:col-span-1`). |

### Tactile Interactive States
- **Buttons**: Use `coss` Base UI primitives with `data-pressed`, `focus-visible:ring-2`, and `data-loading` with embedded `Spinner`.
- **Dialogs**: Feature backdrop blur and mobile bottom-sheet pinning (`bottomStickOnMobile`).
- **Inputs & Selects**: Consistent border focus ring with `outline-none ring-ring/24`.
- **Missing Tactile Dynamics**:
  - No shake on invalid form submission (`transitions-dev` 12-error-state-shake).
  - No icon cross-fade on theme toggle (`transitions-dev` 09-icon-swap).
  - No smooth number pop-in on financial balance updates (`transitions-dev` 02-number-pop-in).

### Empty & Loading States
- All registry views (`properties`, `rooms`, `tenants`, `leases`, `dashboard`) properly integrate the `Empty` component (`EmptyMedia`, `EmptyHeader`, `EmptyTitle`, `EmptyDescription`).
- Missing: Skeleton loading components for initial route transitions or pending loaders (currently relies on SSR / initial hydration).

---

## 5. Motion & Animation System Audit

Comparing `src/styles.css` against `transitions-dev` and `transitions-polish`:

### A. Missing Motion Tokens in `:root`
Currently, `src/styles.css` contains zero `transitions.dev` root variables. The following standard tokens must be added to `:root`:
```css
:root {
  /* transitions-dev tokens */
  --resize-dur: 300ms;
  --resize-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --digit-dur: 500ms;
  --digit-distance: 8px;
  --digit-stagger: 70ms;
  --digit-blur: 2px;
  --digit-ease: cubic-bezier(0.34, 1.45, 0.64, 1);
  --badge-slide-dur: 260ms;
  --badge-pop-dur: 500ms;
  --text-swap-dur: 200ms;
  --dropdown-open-dur: 250ms;
  --dropdown-close-dur: 150ms;
  --dropdown-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --modal-open-dur: 250ms;
  --modal-close-dur: 150ms;
  --modal-scale: 0.96;
  --modal-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --panel-open-dur: 400ms;
  --panel-close-dur: 350ms;
  --page-slide-dur: 200ms;
  --icon-swap-dur: 250ms;
  --shake-dur: 400ms;

  /* transitions-polish tokens */
  --duration-stagger: 40ms;
  --duration-micro: 80ms;
  --duration-quick: 150ms;
  --duration-fast: 250ms;
  --duration-medium: 350ms;
  --duration-slow: 400ms;
  --ease-smooth-out: cubic-bezier(0.22, 1, 0.36, 1);
  --distance-micro: 4px;
  --distance-small: 6px;
  --distance-base: 8px;
  --scale-large: 0.96;
  --scale-medium: 0.97;
  --blur-small: 2px;
  --blur-medium: 3px;
}
```

### B. Motion Polish Violations
1. **Open/Close Asymmetry**: `DialogPopup` in `dialog.tsx` uses a symmetric `duration-200 ease-in-out` instead of 250ms open (`--duration-fast`) and 150ms close (`--duration-quick`).
2. **Missing Prefers-Reduced-Motion Fallbacks**: Existing animations in `src/styles.css` (`.rise-in`, `@keyframes rise-in`, `@keyframes toast-success-odd`, etc.) lack `@media (prefers-reduced-motion: reduce)` overrides to neutralize motion for users with vestibular sensitivities.
3. **No Error State Shake**: Form validation failures in `login.tsx`, `signup.tsx`, and modal dialogs do not trigger an error shake.

---

## 6. Domain Invariants Preservation Matrix

The route survey confirmed three fundamental domain invariants that must be strictly preserved during any UI overhaul:

| Invariant | Implementation Mechanism | Route Touchpoints & Constraints |
|---|---|---|
| **Integer Paisa Arithmetic** | Stored strictly as integers in SQLite/D1 (`1 NPR = 100 paisa`). Math operations never use floats. | - Displayed via `formatNpr(amountInPaisa)` from `#/lib/money`.<br>- Form inputs accept NPR values and convert via `nprToPaisa()`.<br>- Invoice details calculates `remainingPaisa = Math.max(0, invoice.amount - totalPaidPaisa)` and guards against overpayments. |
| **Asia/Kathmandu Timezone** | Strict UTC+05:45 timezone formatting and date generation. | - Form date inputs initialized via `getTodayInKathmandu()` or `addDaysInKathmandu(7)`.<br>- Billing days restricted to integers `1` through `28` (`min="1" max="28"`) to accommodate 28-day month lengths safely. |
| **Landlord Auth Middleware & Isolation** | Session token verification and landlord ID filtering. | - `_authed.tsx` guards all portal routes via `checkLandlordAuth()`.<br>- All server RPCs enforce `landlordAuthMiddleware` ensuring landlords cannot view or associate resources belonging to another landlord. |

---

## 7. Actionable Recommendations for Subsequent Implementation Agents

1. **Implement Public Landing Page (`src/routes/index.tsx`)**:
   - Replace the blind redirect to `/dashboard` with an engaging public landing page.
   - Include Hero header with Nepali tenancy context, feature grid, live interactive rent calculator preview, and distinct "Landlord Login" / "Create Account" CTAs.
2. **Modernize Public Header & Landlord Header**:
   - Add mobile sheet/drawer navigation in `LandlordHeader` using Base UI Dialog / Sheet primitive to prevent link wrapping on smartphones.
   - Upgrade `ThemeToggle` with animated icon morphing (`Sun` <-> `Moon`) via `transitions-dev` icon-swap.
3. **Inject Motion Tokens & Polish Rules into `src/styles.css`**:
   - Add the complete `:root` transitions.dev and transitions-polish tokens.
   - Enforce asymmetric open/close timing for all Dialog, Select, and Popover overlays.
   - Wrap all keyframes in `@media (prefers-reduced-motion: reduce)` fallbacks.
4. **Enhance Mobile Data Presentation**:
   - On `/dashboard` and `/leases`, implement a dual-mode responsive layout: tabular display on desktop (`hidden md:block`), compact card list on mobile (`md:hidden`).
   - In `/dashboard` manual invoice dialog, refactor the line items repeater into a responsive stack on mobile screens.
5. **Install Test Coverage Dependency**:
   - Add `@vitest/coverage-v8` to `devDependencies` so `pnpm run test --coverage` can measure coverage metrics.
