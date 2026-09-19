# transitions-polish skill copy
See original at: /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/skills/transitions-polish/SKILL.md
Methodology: Motion-token scale (duration, distance, scale, blur, easing) and polish rules.
Key invariants:
- Open/close asymmetry: open 250ms -> close 150ms (modal/dropdown), panel open 400ms -> close 350ms.
- Hover in/out: in is quick (fast/smooth-out), out is softer/springier.
- Stagger offset: ~40ms, total stagger capped < 300ms.
- Intent delay: micro (80ms), never delay close.
- Reduced motion: media query fallbacks.
