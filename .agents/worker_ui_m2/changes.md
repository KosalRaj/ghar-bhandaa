# Changes Log — Milestone M2 (Public & Auth Views Overhaul)

## Summary
Milestone M2 completed the visual, interactive, and functional overhaul of all public-facing and authentication screens of Ghar-Bhandaa. It replaced the placeholder blind redirect on `/` with a high-conversion landing page, enhanced `ThemeToggle` with transitions-dev icon swap micro-interactions, modernized `Header` with a mobile responsive `Drawer` and active status pip, upgraded `Footer` into a multi-column information hub with domain invariant badges, and modernized `/login` and `/signup` with coss `InputGroup` components, password reveal toggles, `.rise-in` entrances, and `.t-input-shake` form validation feedback.

---

## Detailed File Modifications

### 1. `src/components/ThemeToggle.tsx`
- **Icon Swap Micro-Interaction**: Replaced plain text button (`Auto`, `Dark`, `Light`) with transitions-dev `.t-icon-swap` stacking Lucide `Sun` and `Moon` icons.
- **Motion & Accessible Animation**: Integrated smooth rotation (`-90deg` to `0deg`), scale (`0.25` to `1.0`), and opacity cross-fade over `var(--duration-fast, 250ms)`. Added `@media (prefers-reduced-motion: reduce)` fallbacks via `motion-reduce:transition-none`.
- **Tooltip Integration**: Wrapped button in Base UI `TooltipProvider` and `Tooltip` with a contextual popup indicating active mode and action on click.
- **SSR & Environment Resilience**: Guarded `window.matchMedia` access for jsdom and server-rendered contexts.

### 2. `src/components/Header.tsx`
- **Brand Pill & Status Pip**: Modernized brand link with animated ping status pip and border chip styling.
- **Navigation Links**: Added responsive desktop links for `Features` (`/#features`), `Workflow` (`/#workflow`), and `Calculator` (`/#calculator`).
- **Mobile Responsive Drawer**: Implemented Base UI `Drawer` primitive (`src/components/ui/drawer.tsx`) for screens `< 768px` (`md:hidden`) with `DrawerHeader`, `DrawerTitle`, `DrawerDescription`, and `DrawerPanel`.
- **Session-Awareness**: Integrated `authClient.useSession()`, dynamically displaying "Dashboard" when the landlord is authenticated or "Sign In" and "Get Started" when logged out.

### 3. `src/components/Footer.tsx`
- **Multi-Column Layout**: Upgraded into a responsive 4-column layout covering Brand Summary, Platform Links, Financial Integrity Invariants, and Landlord Portal Access.
- **Domain Invariant Badges**: Embedded dedicated badges:
  - Kathmandu Timezone: `Asia/Kathmandu UTC+05:45` with `Clock` icon
  - Integer Paisa Accounting: `Integer Paisa (Zero Float Drift)` with `Coins` icon
- **Legal & Copyright**: Added copyright year and domain compliance notice.

### 4. `src/routes/login.tsx`
- **Calibrated Entrance**: Applied `.rise-in` animation on page entry.
- **coss `InputGroup` Modernization**: Converted plain inputs into `InputGroup` elements with prefix icons (`Mail` and `Lock`).
- **Password Visibility Toggle**: Integrated interactive `Eye` / `EyeOff` button in the password field addon.
- **Percussive Error Shake**: Attached `.t-input-shake` class triggering the transitions-dev cubic-bezier horizontal shake upon authentication failure.
- **Auth Integrity**: Maintained 100% compatibility with `authClient.signIn.email`, redirecting to `/` on success.

### 5. `src/routes/signup.tsx`
- **Calibrated Entrance**: Applied `.rise-in` animation on page entry.
- **coss `InputGroup` Modernization**: Wrapped Name, Email, Phone, and Password in `InputGroup` containers with respective prefix icons (`User`, `Mail`, `Phone`, `Lock`).
- **Password Visibility Toggle**: Added interactive `Eye` / `EyeOff` button in the password field addon.
- **Percussive Error Shake**: Triggered `.t-input-shake` on registration errors.
- **Backend RPC Integrity**: Preserved direct calls to `registerLandlord({ data: { name, email, password, phone } })` and redirect to `/login`.

### 6. `src/routes/index.tsx`
- **Full Landing Page Architecture**: Replaced the previous blind `throw redirect({ to: '/dashboard' })` with an engaging public presentation of Ghar-Bhandaa.
- **Hero Section**: Strong value proposition tailored to Kathmandu property owners, prominent CTAs, and trust indicators.
- **Interactive Rent Calculator Widget**:
  - Live state for room count, average room rent, and utility add-ons.
  - Live calculations executed using integer paisa precision (0 floating-point error).
  - Displays monthly projected total, annual revenue, and exact integer paisa storage using `AnimatedNumber`.
- **6 Staggered Feature Cards**: Used `.stagger-item` with `.stagger-1` to `.stagger-6` to highlight: Automated Invoicing, Integer Paisa Precision, Asia/Kathmandu Timezone, Multi-Property & Rooms, Append-Only Cash Ledger, and Tenant & Lease Registry.
- **3-Step Setup Workflow Guide**: Clear visual path: Properties -> Leases -> Invoices.
- **Bottom CTA Banner**: High-conversion closing banner with trust guarantees.

### 7. `src/components/__tests__/public_views.test.tsx`
- Added 11 unit and integration tests covering:
  - ThemeToggle icon rendering and theme cycling across localStorage.
  - Header brand link, status pip, desktop navigation, and drawer trigger.
  - Footer multi-column links, copyright, and domain invariant badges.
  - LandingPage hero content, interactive calculator dynamic calculations, and feature cards.
  - LoginPage and SignupPage input groups, password eye toggle, and field types.

---

## Verification Summary
- `pnpm run typecheck`: 0 errors
- `pnpm run lint`: 0 errors, 0 warnings
- `pnpm run test`: 9 test files, 120 tests passed
- `pnpm run build`: Production client and Cloudflare Workers bundles built cleanly
- `graphify update .`: AST-only knowledge graph refreshed (985 nodes, 1928 edges, 77 communities)
