---
id: 103
title: Diary day view with meals, entries, totals, and date navigation
milestone: M1
status: todo
owner: agent
area: [app]
size: L
blocked_by: [7, 9]
branch: ""
merged: ""
---

## Goal

The screen used most often: one day's food, grouped by meal, with totals against the target. `SPEC.md` §3.2 food diary.

## Scope

`apps/tracker/app/(tabs)/diary/[date].tsx`, `src/features/diary/**` (queries, components: `DayHeader`, `MealSection`, `EntryRow`, `TotalsBar`).

## Acceptance criteria

- [ ] Route `/diary/[date]` with `today` alias; swipe or arrow navigation between days; a date picker.
- [ ] Meals rendered from the `meals` table in `sort_order`, each with entries and a per-meal subtotal; empty meal shows an "Add food" row (`diary.meal.<id>.add`).
- [ ] `TotalsBar` shows kcal eaten, remaining vs `useCurrentTargets(date)` (falls back to "no target" state before onboarding), and protein/carbs/fat/fiber bars.
- [ ] Day boundary hour from `settings` used through `localDateFor` so entries logged at 01:00 land on the previous day when configured.
- [ ] Entry row shows name, quantity with serving label, kcal, and a compact macro line; tapping opens the edit sheet stub (#106).
- [ ] Loading, error, offline (cached) and empty states designed, not default spinners.
- [ ] Fixture `typicalDay` renders three meals with entries and correct totals (assert exact numbers in Playwright). Both viewports screenshotted in light and dark.

## Verification

```bash
pnpm -F tracker test -- diary && pnpm -F tracker e2e -- --grep diary
```

## Out of scope

Adding foods (#105), editing/moving/copying (#106).

## Verification log
