---
id: 117
title: JSON export and import of all user data
milestone: M1
status: todo
owner: agent
area: [app, shared]
size: M
blocked_by: [106, 108, 113, 114]
branch: ""
merged: ""
---

## Goal

Own the data from day one. `SPEC.md` §1 goals, §3.4 export.

## Scope

`src/features/export/**`, `@tracker/shared` `export/schema.ts`, Settings entry.

## Acceptance criteria

- [ ] Export produces one JSON file `{ version, exportedAt, tables: { profiles, targets, foods, food_servings, recipes, recipe_items, meals, diary_entries, weight_logs, measurements, exercises (custom only), workouts, workout_exercises, sets, settings } }`, streamed table by table for large histories. Shared zod schema validates it.
- [ ] Web: downloads via a Blob; native: `expo-sharing` share sheet (file suffix split).
- [ ] Import: pick a file, validate against the schema, preview counts, then upsert by id (idempotent, safe to re-import) with a progress bar; conflicts are last-writer-wins by `updated_at`.
- [ ] Round-trip test: export fixture `eightWeeks`, wipe, import, export again, deep-equal ignoring `exportedAt`.
- [ ] Playwright (desktop): export downloads a file that passes the schema.

## Verification

```bash
pnpm -F shared test -- export && pnpm -F tracker test -- export && pnpm -F tracker e2e -- --grep export
```

## Out of scope

CSV (M3). MFP/Hevy import (M4).

## Verification log
