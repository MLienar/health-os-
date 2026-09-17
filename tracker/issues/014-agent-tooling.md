---
id: 14
title: Agent skills, hooks, and next-issue procedure
milestone: M0
status: todo
owner: agent
area: [infra, docs]
size: M
blocked_by: [3, 6, 9]
branch: ""
merged: ""
---

## Goal

The procedural loop in `tracker/README.md` and the repeated dev actions are one command each, so every session behaves the same. `SPEC.md` §10 repo tooling.

## Scope

`.claude/skills/*/SKILL.md`, `.claude/settings.json`, `CLAUDE.md` command table.

## Acceptance criteria

- [ ] `/next-issue`: runs `pnpm tracker next`, claims the issue, creates the branch (worktree when another slice is in progress), and follows steps 3 to 8 of the loop, ending with the report format. Honors `review: human`.
- [ ] `/run-web <route>`: ensures local Supabase and the web dev server are up (starts them if not), waits for readiness, opens the route with Playwright in both projects, saves screenshots to `.playwright/shots/<timestamp>/`, prints their paths.
- [ ] `/db-reset`: `pnpm db:reset && pnpm db:types`, then reports schema drift in `git diff --stat`.
- [ ] `/new-migration <name>`: creates the timestamped migration and a matching pgTAP file from templates, opens both paths.
- [ ] `/new-issue <milestone> <title>`: copies `tracker/TEMPLATE.md` to the next free id in that milestone and prints the path.
- [ ] Hooks in `.claude/settings.json`: Biome format on every edited `.ts/.tsx/.json/.mjs`; on Stop run `pnpm typecheck && pnpm test` and `pnpm tracker check`, reporting failures.
- [ ] If the sandbox blocks writing `.claude/skills` or `.claude/settings.json`, ask Matheo to create the files from the content committed under `docs/agent/` and record that here.
- [ ] Each skill was executed once successfully and the output pasted in the log.

## Verification

Run each skill. `pnpm tracker check`.

## Out of scope

`/plan-milestone` (create when M1 closes and M2 needs issues).

## Verification log
