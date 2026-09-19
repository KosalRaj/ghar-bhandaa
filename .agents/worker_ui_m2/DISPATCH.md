# Dispatch: Milestone M2 — Public & Authentication Views Overhaul

You are `worker_ui_m2`.
Working directory: `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/worker_ui_m2/`

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. An auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Context & Inputs
- Project specification: `/Volumes/Acasis2TB/playground/ghar-bhandaa/PROJECT.md`
- Original user request: `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/ORIGINAL_REQUEST.md`
- Graph report (read first!): `/Volumes/Acasis2TB/playground/ghar-bhandaa/graphify-out/GRAPH_REPORT.md`
- Route survey: `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/explorer_survey_routes/survey_routes.md`
- Completed M1 Design System & Primitives in `src/styles.css` and `src/components/ui/`
- Available skills: `coss`, `coss-particles`, `transitions-dev`, `transitions-polish`

## Exclusive File Ownership
- `src/routes/index.tsx`
- `src/components/Header.tsx`
- `src/components/Footer.tsx`
- `src/components/ThemeToggle.tsx`
- `src/routes/login.tsx`
- `src/routes/signup.tsx`

## Core Tasks
1. **Public Landing Page (`src/routes/index.tsx`)**:
   - Replace the blind redirect to `/dashboard` with a full-featured, responsive, beautifully styled public landing page.
   - Hero Section: Punchy headline, subheadline, prominent CTAs ("Sign In to Portal" -> `/login`, "Create Landlord Account" -> `/signup`), interactive rent preview/calculator widget using `Card`, `Input`, and `AnimatedNumber`.
   - Feature Highlights: Staggered feature cards (`.stagger-item` with `.stagger-1`..`.stagger-6`) showcasing automated monthly invoicing, integer paisa precision, Kathmandu billing schedule, tenant directory, and cash payment receipts.
   - Workflow Steps: 3-step setup guide (Properties -> Leases -> Invoices).
   - Bottom CTA banner and trust indicators.
   - If user is already authenticated (checked via `authClient.useSession` or similar if available, or just render landing page with clean portal links), preserve navigation ease.

2. **Public Global Header (`src/components/Header.tsx`)**:
   - Brand pill with status pip.
   - Public nav links: Features, Workflow, Sign In, Get Started.
   - Mobile responsive drawer using `Drawer` primitive from `src/components/ui/drawer.tsx` for viewports < 768px.
   - Integrated `ThemeToggle`.

3. **Global Footer (`src/components/Footer.tsx`)**:
   - Modernized multi-column footer with brand summary, links, Kathmandu timezone pill (`Asia/Kathmandu UTC+05:45`), integer paisa currency badge, and copyright.

4. **ThemeToggle (`src/components/ThemeToggle.tsx`)**:
   - Upgrade with transitions-dev icon swap micro-interaction using `Sun` and `Moon` icons from `lucide-react`.
   - Smooth rotation, scale, and cross-fade on toggle.
   - Keyboard accessible and tooltipped with `Tooltip`.

5. **Sign In (`src/routes/login.tsx`)**:
   - Smooth entrance with `.rise-in`.
   - Add email and password `InputGroup` with prefix icons (`Mail`, `Lock`) and eye toggle for password visibility.
   - On submission failure, trigger `.t-input-shake` error animation on the form card.
   - Preserve `authClient.signIn.email` integration, error alerts, and redirect on success.

6. **Sign Up (`src/routes/signup.tsx`)**:
   - Smooth entrance with `.rise-in`.
   - Input groups with prefix icons (`User`, `Mail`, `Phone`, `Lock`) and eye toggle for password.
   - Form error shake on failure.
   - Preserve `registerLandlord` server function call and redirect to `/login` on success.

7. **Verification**:
   - Run `pnpm run typecheck` (0 errors).
   - Run `pnpm run lint` (0 errors).
   - Run `pnpm run test` (all unit/integration tests pass).
   - Run `pnpm run build` (client & server bundles build cleanly).
   - Run `graphify update .` per GEMINI.md.

8. **Deliverables**:
   - Write `changes.md` and `handoff.md` to `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/worker_ui_m2/`.
   - Notify orchestrator when done.

## 2026-09-19T16:05:27Z
You are worker_ui_m2. Your working directory is /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/worker_ui_m2/.
Read your detailed task instructions in /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/worker_ui_m2/DISPATCH.md.
MANDATORY INTEGRITY WARNING: DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. An auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
MANDATORY: Read /Volumes/Acasis2TB/playground/ghar-bhandaa/graphify-out/GRAPH_REPORT.md before touching code.
MANDATORY: Read /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/ORIGINAL_REQUEST.md.
Overhaul the public & auth views: landing page at src/routes/index.tsx, Header.tsx with mobile Drawer, Footer.tsx, ThemeToggle.tsx with Sun/Moon icon swap, login.tsx with InputGroup and error shake, signup.tsx with InputGroup and error shake.
Verify with typecheck, lint, test, build, and graphify update . Write changes.md and handoff.md in your working directory and notify the orchestrator when done.
