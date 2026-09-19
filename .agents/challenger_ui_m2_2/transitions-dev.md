# Local Copy: transitions-dev skill
Extracted from: /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/skills/transitions-dev/SKILL.md and 12-error-state-shake.md

Key concepts:
- `:root` token variables (`--shake-distance: 6px; --shake-overshoot: 4px; --shake-dur-a: 80ms; --shake-dur-b: 60ms; --shake-ease: cubic-bezier(0.22, 1, 0.36, 1); --revert-hold: 3000ms; --revert-dur: 280ms;`)
- `.t-input.is-shaking` animation: `t-input-shake calc(...) linear;`
- Keyframes `@keyframes t-input-shake`
- Media query `@media (prefers-reduced-motion: reduce)`
- Error shake replay via removing `is-shaking`, forcing reflow (`void el.offsetWidth`), and re-adding `is-shaking`.
