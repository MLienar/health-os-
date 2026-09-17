---
id: 113
title: Workout history list and detail, exercise history section
milestone: M1
status: todo
owner: agent
area: [app]
size: M
blocked_by: [111]
branch: ""
merged: ""
---

## Goal

See what you did, when. `SPEC.md` §3.3 history.

## Scope

`apps/tracker/app/(tabs)/train/index.tsx` (history below the start button), `app/workout/[id].tsx`, exercise detail history section from #109.

## Acceptance criteria

- [ ] Train tab lists finished workouts newest first, grouped by week, each card with name, date, duration, volume, exercise names; infinite scroll by 20.
- [ ] `/workout/[id]` shows exercises and sets read-only with set types and RPE; menu: edit notes, delete (soft, confirm), "Repeat" (creates a draft with the same exercises and empty sets).
- [ ] Exercise detail (#109) gains a history list of that exercise's sets by workout date.
- [ ] Unsynced queued workouts show a "pending sync" badge.
- [ ] Fixture `eightWeeks` renders 24 workouts correctly; Playwright asserts grouping and opens one.

## Verification

```bash
pnpm -F tracker e2e -- --grep history
```

## Out of scope

PRs, 1RM, charts, calendar (M2).

## Verification log
