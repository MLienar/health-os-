---
id: 102
title: Targets summary, manual override, and save via compute_targets RPC
milestone: M1
status: todo
owner: agent
area: [app]
size: M
blocked_by: [101]
branch: ""
merged: ""
---

## Goal

The end of onboarding: show TDEE, daily kcal, macros, and projected goal date; let the user override any number; persist the profile and a `targets` row. `SPEC.md` §3.1 output and lifecycle.

## Scope

`apps/tracker/app/onboarding/summary.tsx`, `src/features/targets/**` (queries, hooks, `useCurrentTargets`).

## Acceptance criteria

- [ ] Summary calls `supabase.rpc('compute_targets')` and displays its result; a Jest test asserts the RPC result equals the shared calculator's for the same input (guards drift).
- [ ] Each macro and kcal is editable; edits keep kcal and macros consistent (carbs absorb) and mark `source: manual`.
- [ ] Save upserts `profiles` and inserts `targets` rows (one per day type when enabled) with `effective_from = today` and `last_calc_weight_kg`/`last_calc_at` set.
- [ ] `useCurrentTargets(date)` returns the targets effective on that date, honoring day type when a workout exists that day (hook is ready for #115 even if day types are off by default).
- [ ] Recalculation banner logic: `useRecalcSuggestion()` returns a reason when 7-day average weight moved ≥ 2 kg or 4 weeks passed; displayed on Today (#115) and Settings (#116). Unit tested.
- [ ] Playwright: finish onboarding, reload, Today shows the saved kcal target.

## Verification

```bash
pnpm -F tracker test -- targets && pnpm -F tracker e2e -- --grep targets
```

## Out of scope

Adaptive targets (M3). Day-type UI polish (M2).

## Verification log
