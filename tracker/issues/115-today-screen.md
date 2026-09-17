---
id: 115
title: Today screen
milestone: M1
status: todo
owner: agent
area: [app]
size: M
blocked_by: [102, 103, 111, 114]
branch: ""
merged: ""
---

## Goal

The landing tab: everything that matters right now on one screen. `SPEC.md` §3.4 Today.

## Scope

`apps/tracker/app/(tabs)/index.tsx`, `src/features/today/**`.

## Acceptance criteria

- [ ] Kcal remaining ring and macro bars from today's entries vs `useCurrentTargets(today)`; tapping goes to `/diary/today`.
- [ ] Collapsed meals with subtotals and an add button per meal opening the search sheet directly.
- [ ] Weight quick-log card (from #114) showing today's weight or the prompt, plus the 7-day trend delta.
- [ ] Start or Resume workout card; today's finished workouts summarized.
- [ ] Recalculation banner from `useRecalcSuggestion()` linking to onboarding edit.
- [ ] No-target state (pre-onboarding) links to onboarding. Offline pill visible when applicable.
- [ ] Playwright screenshots of `typicalDay`, `empty`, and `activeWorkout` fixtures at both viewports, light and dark.

## Verification

```bash
pnpm -F tracker e2e -- --grep today
```

## Out of scope

Trends tab (M3 beyond weight).

## Verification log
