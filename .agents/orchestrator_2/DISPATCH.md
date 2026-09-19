# Dispatch Log

## 2026-09-19T15:42:08Z

Execute the comprehensive UI/UX overhaul of the Ghar-Bhandaa rental property management application:
1. R1. Design System & Component Library Modernization (coss & coss-particles):
   Upgrade all shared UI components in `src/components/ui/` (buttons, dialogs, cards, data tables, fields/forms, inputs, selects, tabs, empty states, toasts, badges, modals) to adhere to coss primitives and coss-particles patterns, preserving full accessibility, responsive behavior, and dark/light theme consistency.
2. R2. Motion & Animation System Integration (transitions-dev & transitions-polish):
   Implement the transitions.dev motion system and transitions-polish token doctrine into the application stylesheet (`src/styles.css`) and components. Apply purposeful micro-interactions and surface transitions (modal scale-up/down, dropdown reveals, side-by-side view transitions, number pop-ins, success badges, shake on error) with strict open/close asymmetry, bounded staggers (<300ms total), smooth easing curves (`cubic-bezier(0.22, 1, 0.36, 1)`), and `prefers-reduced-motion` guards.
3. R3. Screen & Route UI/UX Overhaul Across All Views:
   Overhaul layout, navigation, and user experience across:
   - Public & Authentication Views: Landing page (`/`), Sign In (`/login`), Sign Up (`/signup`), Global Header, Footer, and ThemeToggle.
   - Landlord Management Portal: Landlord Shell/Header, Dashboard (`/dashboard`), Properties (`/properties`), Rooms (`/rooms`), Tenants (`/tenants`), Leases (`/leases`), and Invoice Details (`/invoices/$invoiceId`).
   Ensure intuitive visual hierarchy, responsive multi-column to single-column adaptability, tactile interactive states, and clean empty/loading states.
4. R4. Zero Regressions & Verification Enforcement:
   Maintain complete backend integrity, domain business rules (NPR/paisa calculations, Kathmandu timezone handling, landlord session authentication), and ensure all automated test suites pass without regression:
   - `pnpm run typecheck` passes with 0 errors.
   - `pnpm run lint` passes with 0 errors/warnings.
   - `pnpm run test` passes 100% of Vitest unit and integration test suites.
   - `pnpm run build` succeeds cleanly producing client and server bundles.
