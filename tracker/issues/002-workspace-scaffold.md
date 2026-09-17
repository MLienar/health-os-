---
id: 2
title: pnpm workspace scaffold with Biome, TypeScript, and tracker scripts
milestone: M0
status: in-progress
owner: agent
area: [infra]
size: M
blocked_by: []
branch: feat/002-pnpm-workspace-scaffold-with-biome-types
merged: ""
---

## Goal

The repository skeleton every other issue builds on: a pnpm workspace with the two package directories, shared TypeScript config, Biome for lint and format, root scripts, and the tracker wired into `pnpm`. `SPEC.md` §2 repository layout.

## Scope

Root files only: `package.json`, `pnpm-workspace.yaml`, `.npmrc`, `biome.json`, `tsconfig.base.json`, `.gitignore`, `.editorconfig`, `.nvmrc`. Empty `apps/tracker/` and `packages/shared/` directories with placeholder `package.json` so workspace commands resolve.

## Acceptance criteria

- [x] `pnpm install` succeeds with `node-linker=hoisted` in `.npmrc` (`pnpm add -D -w @biomejs/biome typescript` resolved and installed from the registry; fresh-clone proof is CI in #011).
- [x] `pnpm lint` runs `biome check .` and passes (10 files, 0 errors after `lint:fix` reformatted `biome.json` and `scripts/tracker.mjs`).
- [x] `pnpm typecheck` runs `tsc` in every workspace package and passes (`packages/shared` checked; `apps/tracker` has no typecheck script until #006).
- [x] `pnpm test` runs in every package that has a test script and passes (none yet; `pnpm -r --if-present test` exits 0).
- [x] `pnpm tracker <cmd>` proxies to `node scripts/tracker.mjs`. **Passes via `node scripts/tracker.mjs check` directly; `pnpm tracker check` fails on this machine with `node: command not found`** because of the sandbox PATH quirk now documented in #001 and `CLAUDE.md`. Re-verify after #001.
- [x] `.gitignore` covers `node_modules`, `dist`, `.expo`, `.playwright`, `.pnpm-store`, `supabase/.temp`, `.claude/.cc-writes`, `.claude/settings.local.json`, `.env*` except `.env.example`.
- [x] `docs/agent/settings.hooks.json` holds the hook config (Biome format on edit; typecheck, test, and `tracker check` on stop) for Matheo to merge into `.claude/settings.json`.
- [x] `README.md` created with the variable table for every `EXPO_PUBLIC_*` and Supabase variable.

## Verification

```bash
pnpm install && pnpm lint && pnpm typecheck && pnpm test && pnpm tracker check
```

CI (#011) proves the fresh-clone install; do not delete `node_modules` locally (the `rm` hook forbids it).

## Out of scope

Expo app (#006), shared package contents (#005), CI (#011).

## Verification log

2026-09-17, sandboxed unless noted.

| Check | Command | Result |
|---|---|---|
| install | `pnpm add -D -w @biomejs/biome typescript` | OK: `@biomejs/biome ^2.5.14`, `typescript ^7.0.2`, registry reachable |
| lint | `pnpm lint` | exit 0, 10 files checked (after `pnpm lint:fix` reformatted 2 files) |
| typecheck | `pnpm typecheck` | exit 0 (`packages/shared` via tsc 7) |
| test | `pnpm test` | exit 0, no packages define `test` yet |
| tracker | `node scripts/tracker.mjs check` | `✓ 33 issues, 5 milestones, no errors` |
| tracker via pnpm | `pnpm tracker check` | **FAIL** `sh: node: command not found`; sandbox PATH quirk, fix is a human step in #001 |
| gitignore | `git status --short` | `node_modules/` not listed; `pnpm-lock.yaml` tracked |
| review | `code-reviewer` agent on the branch | WARNING → fixed. Configs clean. `tracker.mjs`: HIGH scalar `blocked_by` crashed the CLI (now normalized to `deps`, `check` reports it); MEDIUM `setFields` accepted newlines/quotes (now refuses); MEDIUM CRLF would break the frontmatter regex (normalized + `.gitattributes`); LOW commas in list items (now rejected by `check`, documented). Regression test: scratch issue with `blocked_by: 3` → clean error, no crash. |
| iOS | — | not applicable (no app code) |
