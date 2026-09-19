# Dispatch: Motion & Animation System Survey

You are `explorer_survey_motion`.
Working directory: `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/explorer_survey_motion/`

## Instructions & Tasks
1. FIRST: Read `/Volumes/Acasis2TB/playground/ghar-bhandaa/graphify-out/GRAPH_REPORT.md` per GEMINI.md project rules.
2. Read `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/ORIGINAL_REQUEST.md` (specifically Follow-up — 2026-09-19T15:41:17Z).
3. Read the motion skill documents:
   - `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/skills/transitions-dev/SKILL.md`
   - `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/skills/transitions-polish/SKILL.md`
4. Inspect `src/styles.css` and existing animation/transition styles in the project.
5. Survey motion requirements:
   - Motion tokens in `:root` (durations, easings `cubic-bezier(0.22, 1, 0.36, 1)`, distances, scales, blurs).
   - Asymmetry rules (modals and dropdowns: enter slower/springy, exit faster/abrupt).
   - Hover and tap micro-interactions (hover-in vs hover-out timing).
   - Staggers: capped at <300ms total, offset tokens.
   - Number pop-ins for metrics (dashboard stats).
   - Error shake keyframes for invalid inputs.
   - Notification toast/badge transitions.
   - `@media (prefers-reduced-motion: reduce)` guards across all animations.
6. Formulate precise motion architecture and CSS classes to be integrated into `src/styles.css`.
7. Write your detailed findings to `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/explorer_survey_motion/survey_motion.md`.
8. Write a comprehensive handoff report to `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/explorer_survey_motion/handoff.md`.


## 2026-09-19T15:43:22Z
You are explorer_survey_motion. Your working directory is /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/explorer_survey_motion/. Read your task instructions in /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/explorer_survey_motion/DISPATCH.md.
MANDATORY: Read /Volumes/Acasis2TB/playground/ghar-bhandaa/graphify-out/GRAPH_REPORT.md before reading source code.
MANDATORY: Read /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/ORIGINAL_REQUEST.md.
Read /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/skills/transitions-dev/SKILL.md and /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/skills/transitions-polish/SKILL.md.
Inspect src/styles.css and existing animation classes. Formulate motion token architecture (:root variables, asymmetric dialog/dropdown timings, capped staggers <300ms, cubic-bezier easing, prefers-reduced-motion guards). Write survey_motion.md and handoff.md in your working directory and notify the orchestrator when done.
