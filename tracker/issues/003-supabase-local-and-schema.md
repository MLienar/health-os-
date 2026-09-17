---
id: 3
title: Supabase local stack, full schema migration, RLS, seed, pgTAP
milestone: M0
status: todo
owner: agent
area: [db, infra]
size: L
blocked_by: [1, 2]
branch: ""
merged: ""
---

## Goal

The whole data model from `SPEC.md` §4 exists as one initial migration, protected by RLS, with a seeded test user and the exercise library, and tests that prove another user cannot read or write anything. Everything runs locally through Docker.

## Scope

`supabase/` (config, migrations, seed.sql, seed/exercises.json, tests), root `package.json` db scripts, `supabase` CLI as a root dev dependency.

## Acceptance criteria

- [ ] `pnpm db:start` brings up the local stack; `pnpm db:reset` applies migrations and seed without error.
- [ ] Every table in §4 exists with `id`, `user_id`, `created_at`, `updated_at`, `deleted_at`, and a trigger keeps `updated_at` current.
- [ ] RLS is enabled on every table with `user_id = auth.uid()` for select/insert/update/delete. `exercises` additionally allows select where `user_id is null`.
- [ ] `seed.sql` creates the test user (`test@local.dev`, password from `supabase/.env.example`), default meals, three sample foods with servings, one profile, one targets row.
- [ ] `seed/exercises.json` is derived from free-exercise-db with fixed UUIDs (UUID v5 from the source id), and a seed step loads it into `exercises` with `user_id null`. License file included.
- [ ] pgTAP tests in `supabase/tests/` prove: a second user sees zero rows from every user table; the second user cannot insert with a foreign `user_id`; seed exercises are readable by any user and not writable.
- [ ] `pnpm db:test` runs them green. `pnpm db:types` regenerates `packages/shared/src/db.types.ts`.
- [ ] `supabase/.env.example` documents every variable; no real secret committed.

## Verification

```bash
pnpm db:start && pnpm db:reset && pnpm db:test && pnpm db:types && git diff --stat
```

## Out of scope

`compute_targets` and other SQL functions (#004). Edge Functions (M2). Hosted project (#012).

## Verification log
