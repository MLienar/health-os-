---
id: 114
title: Weight log with 7-day trend chart
milestone: M1
status: todo
owner: agent
area: [app, shared]
size: M
blocked_by: [5, 7, 9]
branch: ""
merged: ""
---

## Goal

Log body weight in two taps and see the trend, not the noise. `SPEC.md` §3.2 body, §2 charts.

## Scope

`apps/tracker/app/(tabs)/trends/weight.tsx`, `src/features/weight/**`, `src/components/charts/` (`LineChart` over react-native-svg + d3), `@tracker/shared` `calc/trend.ts`.

## Acceptance criteria

- [ ] Quick-log control (used on Today in #115): numeric input prefilled with the last weight, date defaults to today, saves a `weight_logs` row.
- [ ] `calc/trend.ts`: daily value = last entry per day; 7-day trailing average with gaps handled; unit tests with vectors.
- [ ] `LineChart` component: raw points and trend line, 30/90/365-day ranges, dark-mode aware, renders on web and native from the same code; a Jest snapshot of the SVG output for a fixed dataset.
- [ ] Weight screen: chart, range selector, list of entries with edit and delete.
- [ ] Fixture `eightWeeks` includes daily weights; Playwright asserts the chart renders and the trend value shown matches the shared calculation.

## Verification

```bash
pnpm -F shared test -- trend && pnpm -F tracker e2e -- --grep weight
```

## Out of scope

Measurements (M2). Weight vs kcal chart (M3).

## Verification log
