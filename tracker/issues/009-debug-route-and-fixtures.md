---
id: 9
title: /debug route with fixture injection and testID conventions doc
milestone: M0
status: todo
owner: agent
area: [app, docs]
size: M
blocked_by: [7, 8]
branch: ""
merged: ""
---

## Goal

A dev-only screen that puts the app into known states in one tap, so automated verification never depends on manually entered data. `SPEC.md` §10 conventions.

## Scope

`apps/tracker/app/debug.tsx`, `apps/tracker/src/lib/fixtures/`, `docs/conventions.md`.

## Acceptance criteria

- [ ] `/debug` exists only when `__DEV__`; in production the route renders a 404.
- [ ] Buttons with `testID`s `debug.fixture.empty`, `debug.fixture.typicalDay`, `debug.fixture.activeWorkout`, `debug.fixture.eightWeeks`, each wiping the current user's rows (via soft delete then hard delete of own rows, allowed by RLS) and inserting the fixture.
- [ ] Fixtures are plain TypeScript data in `src/lib/fixtures/*.ts`, deterministic (fixed UUIDs, dates relative to today), and reuse seeded exercises and foods.
- [ ] Also: `debug.resetLocal` (clears AsyncStorage), `debug.forceOffline` toggle, `debug.replayQueue`, `debug.enqueueTest` (adds a harmless queued mutation for #008's e2e).
- [ ] Shows current user id, Supabase URL, app version, queue length, draft presence.
- [ ] `docs/conventions.md` documents `testID` naming, route naming, fixture naming, and log scopes, with examples.
- [ ] Playwright: applying `typicalDay` then loading `/diary/today` (placeholder) succeeds; applying `empty` clears it. Both projects.

## Verification

```bash
pnpm -F tracker e2e -- --grep debug
```

## Out of scope

Feature screens that consume the fixtures (M1).

## Verification log
