---
id: 110
title: Active workout screen with set logging and draft persistence
milestone: M1
status: todo
owner: agent
area: [app]
size: L
blocked_by: [8, 109]
branch: ""
merged: ""
---

## Goal

The gym screen. Start an empty workout, add exercises, log sets, and never lose anything. `SPEC.md` §3.3 workout logging, §5 draft.

## Scope

`apps/tracker/app/workout/active.tsx`, `src/features/workout/**` (`useActiveWorkout`, `ExerciseBlock`, `SetRow`, `AddExerciseButton`), Train tab start button.

## Acceptance criteria

- [ ] Train tab shows "Start empty workout" when no draft exists, or a resume banner with elapsed time when one does. `/workout/active` redirects to the Train tab if there is no draft.
- [ ] Draft model lives in `draftStore` (#008); every change persists within 250 ms; reload restores exact state including focused exercise order and set values.
- [ ] `ExerciseBlock`: header with name and menu (notes, replace via picker, remove, move up/down); set rows; "Add set" copies the previous row's values.
- [ ] `SetRow`: set number or type badge (tap cycles warm-up / working / drop / failure), kg and reps numeric inputs tuned for a numpad, optional RPE, a check button that stamps `completed_at`. Cardio exercises show duration and distance instead.
- [ ] Inputs accept decimals with either separator; kg stored as number; blank reps blocks completion.
- [ ] Elapsed timer in the header; keep-awake while active on native.
- [ ] `testID`s: `workout.exercise.<n>.*`, `workout.set.<n>.<field>`. Jest for the draft reducer. Playwright: add two exercises, log three sets, reload, assert all values persist; both viewports.

## Verification

```bash
pnpm -F tracker test -- workout && pnpm -F tracker e2e -- --grep "active workout"
```

## Out of scope

Previous performance, finish and upload (#111). Rest timer (#112). Supersets (M2).

## Verification log
