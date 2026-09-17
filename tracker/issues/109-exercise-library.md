---
id: 109
title: Exercise library with search, filters, and custom exercises
milestone: M1
status: todo
owner: agent
area: [app]
size: M
blocked_by: [7, 9]
branch: ""
merged: ""
---

## Goal

Browse the seeded library, add your own, and pick exercises quickly during a workout. `SPEC.md` §3.3 exercise library.

## Scope

`apps/tracker/app/exercises/*`, `src/features/exercises/**` (`ExerciseList`, `ExercisePicker` sheet, `ExerciseForm`).

## Acceptance criteria

- [ ] `/exercises` lists seed plus custom exercises with search over name, filter chips for primary muscle and equipment, and "recently used" first once workouts exist.
- [ ] `/exercises/new` and `/exercises/[id]/edit` for custom exercises: name, category, primary and secondary muscles, equipment, default rest seconds, notes. Seed exercises are read-only but allow per-user notes and default rest via a small `exercise_prefs` addition (new migration + pgTAP + regenerated types).
- [ ] `/exercises/[id]` detail with instructions and image; history and chart sections are placeholders for #113 and M2.
- [ ] `ExercisePicker` sheet: same list, multi-select, "Add N exercises" button; reused by #110.
- [ ] List renders 800+ rows smoothly (FlashList or virtualized FlatList); verified by a Playwright scroll to the bottom under 2 s.
- [ ] `testID`s under `exercises.*`. Jest for filter logic.

## Verification

```bash
pnpm db:test && pnpm -F tracker test -- exercises && pnpm -F tracker e2e -- --grep exercises
```

## Out of scope

Routines (M2). PR stats (M2).

## Verification log
