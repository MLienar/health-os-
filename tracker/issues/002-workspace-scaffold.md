---
id: 2
title: pnpm workspace scaffold with Biome, TypeScript, and tracker scripts
milestone: M0
status: todo
owner: agent
area: [infra]
size: M
blocked_by: []
branch: ""
merged: ""
---

## Goal

The repository skeleton every other issue builds on: a pnpm workspace with the two package directories, shared TypeScript config, Biome for lint and format, root scripts, and the tracker wired into `pnpm`. `SPEC.md` §2 repository layout.

## Scope

Root files only: `package.json`, `pnpm-workspace.yaml`, `.npmrc`, `biome.json`, `tsconfig.base.json`, `.gitignore`, `.editorconfig`, `.nvmrc`. Empty `apps/tracker/` and `packages/shared/` directories with placeholder `package.json` so workspace commands resolve.

## Acceptance criteria

- [ ] `pnpm install` succeeds from a fresh clone with `node-linker=hoisted` in `.npmrc`.
- [ ] `pnpm lint` runs `biome check .` and passes.
- [ ] `pnpm typecheck` runs `tsc --noEmit` in every workspace package and passes.
- [ ] `pnpm test` runs Jest in every package that has tests and passes (zero tests is acceptable here).
- [ ] `pnpm tracker <cmd>` proxies to `node scripts/tracker.mjs`; `pnpm tracker check` passes.
- [ ] `.gitignore` covers `node_modules`, `dist`, `.expo`, `.playwright`, `.pnpm-store`, `supabase/.temp`, `.claude/.cc-writes`, `.claude/settings.local.json`, `.env*` except `.env.example`.
- [ ] `docs/agent/settings.hooks.json` holds the hook config (Biome format on edit; typecheck, test, and `tracker check` on stop) for Matheo to merge into `.claude/settings.json`, since the agent cannot write there.
- [ ] `README.md` created with the variable table for every `EXPO_PUBLIC_*` and Supabase variable (the agent cannot read `.env*` files, so this table is the source of truth).

## Verification

```bash
pnpm install && pnpm lint && pnpm typecheck && pnpm test && pnpm tracker check
```

CI (#011) proves the fresh-clone install; do not delete `node_modules` locally (the `rm` hook forbids it).

## Out of scope

Expo app (#006), shared package contents (#005), CI (#011).

## Verification log
