---
id: 111
title: Previous performance per exercise, finish workout, summary, upload
milestone: M1
status: todo
owner: agent
area: [app]
size: M
blocked_by: [110]
branch: ""
merged: ""
---

## Goal

Show what you did last time in every set row, then close the workout and save it to the server. `SPEC.md` §3.3 workout logging, §5.

## Scope

`src/features/workout/**` (`usePreviousPerformance`, `FinishSheet`, `WorkoutSummary`, upload mutation).

## Acceptance criteria

- [ ] For each exercise in the draft, fetch the most recent finished workout containing it and show its sets greyed in matching rows (`prev: 80 × 8`); tapping a greyed value copies it into the input.
- [ ] Finish button opens a sheet: name (default from time of day), notes, duration shown, "Finish" and "Discard" (confirm).
- [ ] Finish writes `workouts`, `workout_exercises`, `sets` in one batched upsert through the queue helper; sets without `completed_at` are dropped; `total_volume_kg` and `duration_seconds` computed client-side (shared helper with tests).
- [ ] On success the draft is cleared and the summary screen shows duration, volume, sets, exercises, with "Done" to the Train tab. On network failure the workout is queued, the draft is cleared, and the summary says it will sync.
- [ ] Opportunistic upload: while online, the draft is also saved as an unfinished `workouts` row (`finished_at null`) every 5 minutes so a lost phone loses at most 5 minutes; finishing upserts the same id.
- [ ] Playwright: fixture `activeWorkout` + previous history, assert greyed values, finish, see summary, find the workout in history (#113 placeholder list is fine).

## Verification

```bash
pnpm -F tracker test -- workout && pnpm -F tracker e2e -- --grep finish
```

## Out of scope

PR detection (M2). Rest timer (#112).

## Verification log
