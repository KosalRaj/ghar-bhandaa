# Dispatch: Milestone M3 — Landlord Management Portal Overhaul

You are `worker_ui_m3`.
Working directory: `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/worker_ui_m3/`

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. An auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Context & Inputs
- Project specification: `/Volumes/Acasis2TB/playground/ghar-bhandaa/PROJECT.md`
- Original user request: `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/ORIGINAL_REQUEST.md`
- Graph report (read first!): `/Volumes/Acasis2TB/playground/ghar-bhandaa/graphify-out/GRAPH_REPORT.md`
- Route survey: `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/explorer_survey_routes/survey_routes.md`
- UI survey: `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/explorer_survey_ui/survey_ui.md`
- Shared primitives in `src/components/ui/`: `AlertDialog`, `Menu`, `Drawer`, `Skeleton`, `Tooltip`, `InputGroup`, `AnimatedNumber`, `Card`, `Button`, `Table`, `Tabs`, `Dialog`, `Empty`, `Toast`, `Badge`.
- Motion classes in `src/styles.css`: `.t-digit-group`, `.t-input-shake`, `.t-success-check`, `.stagger-item` with `.stagger-1`..`.6`.

## Exclusive File Ownership
- `src/components/LandlordHeader.tsx`
- `src/routes/_authed/dashboard.tsx`
- `src/routes/_authed/properties.tsx`
- `src/routes/_authed/rooms.tsx`
- `src/routes/_authed/tenants.tsx`
- `src/routes/_authed/leases.tsx`
- `src/routes/_authed/invoices.$invoiceId.tsx`

## Core Tasks

1. **`src/components/LandlordHeader.tsx`**:
   - Modernize navigation with a responsive layout:
     - On mobile (`< 768px`), provide a hamburger button that opens a Base UI `Drawer` containing all navigation links (Dashboard, Properties, Rooms, Tenants, Leases), user identity, and Sign Out.
     - On desktop, render clean navigation links with active link indicator.
     - Include `ThemeToggle`.

2. **`src/routes/_authed/dashboard.tsx`**:
   - Upgrade the 4-card metric grid (Collected, Outstanding, Active Leases, Overdue) to render dynamic metrics using `<AnimatedNumber value={...} />`.
   - In "Raise Manual Invoice" dialog: refactor the line items repeater from a cramped single flex-row to a responsive layout that wraps gracefully on small screens without horizontal squishing.
   - Enhance the Invoices table with responsive mobile card-list fallback (`md:hidden` compact cards, `hidden md:block` table).
   - In empty state, add `<EmptyContent><Button ...>Raise Manual Invoice</Button></EmptyContent>`.

3. **`src/routes/_authed/properties.tsx`**:
   - Add staggered card entrance (`.stagger-item` with `.stagger-1`..`.6`).
   - Add `<EmptyContent><Button ...>Add First Property</Button></EmptyContent>` in empty state to open create modal.

4. **`src/routes/_authed/rooms.tsx`**:
   - Add staggered card entrance (`.stagger-item`).
   - Add `<EmptyContent><Button ...>Add First Room</Button></EmptyContent>` in empty state.

5. **`src/routes/_authed/tenants.tsx`**:
   - Add staggered card entrance (`.stagger-item`).
   - Add `<EmptyContent><Button ...>Register First Tenant</Button></EmptyContent>` in empty state.

6. **`src/routes/_authed/leases.tsx`**:
   - Add responsive card-list fallback on mobile viewports for the 8-column table.
   - Upgrade lease termination from generic `Dialog` to `AlertDialog` (`src/components/ui/alert-dialog.tsx`) to enforce a proper semantic barrier for destructive termination.
   - Add `<EmptyContent><Button ...>Create First Lease</Button></EmptyContent>` in empty state.

7. **`src/routes/_authed/invoices.$invoiceId.tsx`**:
   - In "Record Cash Payment" modal: add `.t-input-shake` error animation when entered payment exceeds remaining balance or validation fails.
   - On successful payment: display celebratory `.t-success-check` animation.
   - Ensure clean responsive stacking (2-column on desktop, 1-column on mobile).

8. **Domain Invariants**:
   - Strictly preserve integer paisa math, Asia/Kathmandu date handling, and landlord authentication checks.

9. **Verification**:
   - Run `pnpm run typecheck` (0 errors).
   - Run `pnpm run lint` (0 errors).
   - Run `pnpm run test` (all unit/integration tests pass).
   - Run `pnpm run build` (clean client & server bundles).
   - Run `graphify update .` per GEMINI.md.

10. **Deliverables**:
    - Write `changes.md` and `handoff.md` to `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/worker_ui_m3/`.
    - Notify orchestrator when complete.
