# Dispatch: Milestone M1 — Design System & Motion System Core

You are `worker_ui_m1`.
Working directory: `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/worker_ui_m1/`

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. An auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Context & Inputs
- Project specification: `/Volumes/Acasis2TB/playground/ghar-bhandaa/PROJECT.md`
- Original user request: `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/ORIGINAL_REQUEST.md`
- Graph report (read first!): `/Volumes/Acasis2TB/playground/ghar-bhandaa/graphify-out/GRAPH_REPORT.md`
- Survey report (Motion): `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/explorer_survey_motion/survey_motion.md` (See Section 11 for complete drop-in CSS)
- Survey report (UI): `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/explorer_survey_ui/survey_ui.md`
- Skills:
  - `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/skills/coss/SKILL.md`
  - `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/skills/coss-particles/SKILL.md`
  - `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/skills/transitions-dev/SKILL.md`
  - `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/skills/transitions-polish/SKILL.md`

## Exclusive File Ownership
- `src/styles.css`
- `src/components/ui/*` (both existing and new components)

## Core Tasks
1. **Motion System in `src/styles.css`**:
   - Inject the full 5-dimension `:root` motion tokens: durations (40ms-500ms), easings centered on `--ease-smooth-out: cubic-bezier(0.22, 1, 0.36, 1)`, distances (4px-30px), scales (0.96-0.99), and blurs (2px-8px).
   - Implement open/close asymmetry rules: Modals/Dialogs open 250ms (`--duration-fast`, scale 0.96) and close 150ms (`--duration-quick`, scale 0.96); Popovers/Dropdowns open 250ms and close 150ms.
   - Implement micro-interaction classes and keyframes:
     - Number pop-in (`.t-digit-group`, `.t-digit`, `@keyframes t-digit-pop-in`).
     - Error shake (`.t-input-shake`, `@keyframes t-input-shake`).
     - Success check celebration (`.t-success-check`, `@keyframes t-success-draw`).
     - Bounded staggers (`.stagger-1` to `.stagger-6`, 40ms offset, capped at 200ms total).
   - Implement universal `@media (prefers-reduced-motion: reduce)` block neutralizing all durations, transitions, and keyframes.
   - Clean up ad-hoc durations (e.g. 180ms, 170ms).

2. **coss Primitives & Modernizations in `src/components/ui/`**:
   - Update `dialog.tsx` to support asymmetric open/close timing via data-starting-style and data-ending-style.
   - Add `alert-dialog.tsx` based on coss `@base-ui/react` AlertDialog for destructive confirmations.
   - Add `menu.tsx` / dropdown menu primitive for multi-action triggers.
   - Add `drawer.tsx` (sheet dialog for mobile navigation).
   - Add `skeleton.tsx` (loading skeleton primitive).
   - Add `tooltip.tsx` (accessible tooltip primitive).
   - Add `input-group.tsx` (input with prefix/suffix addons).
   - Update `empty.tsx` to support `EmptyContent` with action button styling.
   - Update `toast.tsx` to export `anchoredToastManager` and `AnchoredToastProvider`.
   - Add `animated-number.tsx` for easy numeric metric animation.
   - Ensure 100% `@base-ui/react` and 0% `@radix-ui`. Preserve all existing component export signatures so existing pages compile without issue.

3. **Verification**:
   - Run `pnpm run typecheck` (must pass 0 errors).
   - Run `pnpm run lint` (must pass 0 errors).
   - Run `pnpm run test` (all 73 unit tests must pass).
   - Run `pnpm run build` (must succeed cleanly).
   - Run `graphify update .` per GEMINI.md.

4. **Deliverables**:
   - Record changes in `changes.md`.
   - Write `handoff.md` with Observation, Logic Chain, Caveats, Conclusion, Verification Method.
   - Send completion message to orchestrator.
