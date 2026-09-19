# Dispatch: worker_ui_m4

## Identity & Role
- **Agent**: `worker_ui_m4`
- **Role**: Final Verification Worker (`teamwork_preview_worker`)
- **Working Directory**: `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/worker_ui_m4/`
- **Parent**: `orchestrator_2` (`fc4238fb-565d-4348-9447-354d94999226`)

## Mandatory Context Files
1. `/Volumes/Acasis2TB/playground/ghar-bhandaa/graphify-out/GRAPH_REPORT.md`
2. `/Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/ORIGINAL_REQUEST.md`
3. `/Volumes/Acasis2TB/playground/ghar-bhandaa/PROJECT.md`

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. An auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Objective & Tasks
You are responsible for executing the final verification and knowledge graph update for Milestone M4:
1. Run `pnpm run typecheck` (`tsc --noEmit`) and verify 0 errors across the entire codebase.
2. Run `pnpm run lint` (`eslint`) and verify 0 errors and 0 warnings.
3. Run `pnpm run test` (`vitest run`) and verify all 14+ test files and 206+ tests pass with 100% success rate.
4. Run `pnpm run build` and verify clean production Vite client and Cloudflare Workers SSR bundles.
5. Per USER rule in `GEMINI.md`, run `graphify update .` to keep the knowledge graph current after all code modifications.
6. In `/Volumes/Acasis2TB/playground/ghar-bhandaa/PROJECT.md`, update the milestone status table:
   - Milestone M3 Status: `DONE`
   - Milestone M4 Status: `DONE`
7. Document all command outputs in `changes.md` and `handoff.md` in your working directory.
8. Notify the orchestrator via `send_message` when complete.

## 2026-09-19T16:39:28Z
You are worker_ui_m4. Your working directory is /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/worker_ui_m4/.
Read your detailed task instructions in /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/worker_ui_m4/DISPATCH.md.
MANDATORY INTEGRITY WARNING: DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. An auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
MANDATORY: Read /Volumes/Acasis2TB/playground/ghar-bhandaa/graphify-out/GRAPH_REPORT.md before inspecting or modifying code.
MANDATORY: Read /Volumes/Acasis2TB/playground/ghar-bhandaa/.agents/ORIGINAL_REQUEST.md.
Follow instructions in DISPATCH.md:
1. Run pnpm run typecheck.
2. Run pnpm run lint.
3. Run pnpm run test (all 14+ test files, 206+ tests).
4. Run pnpm run build (clean client and SSR bundles).
5. Run graphify update . to update the knowledge graph.
6. In /Volumes/Acasis2TB/playground/ghar-bhandaa/PROJECT.md, update milestone statuses for M3 and M4 to DONE.
7. Write changes.md and handoff.md in your working directory and notify the orchestrator via send_message when complete.

