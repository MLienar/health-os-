---
id: 101
title: Onboarding questionnaire with live target preview
milestone: M1
status: todo
owner: agent
area: [app]
size: L
blocked_by: [5, 7, 9]
branch: ""
merged: ""
---

## Goal

A first-run flow that asks the eight questions in `SPEC.md` §3.1 across a few screens and shows the resulting targets updating live as answers change, using the shared calculator.

## Scope

`apps/tracker/app/onboarding/*`, `src/features/onboarding/**`.

## Acceptance criteria

- [ ] Routes `/onboarding/about`, `/onboarding/activity`, `/onboarding/goal`, `/onboarding/preferences` with progress indicator, back navigation, and answers kept in a single form state (react-hook-form + shared zod schema).
- [ ] Inputs: sex, birth date, height, weight, optional body-fat %, activity level, sessions per week and minutes, goal with rate slider (ranges per spec), optional goal weight or date (each derives the other), protein preference, day-type toggle.
- [ ] A sticky footer shows current kcal and protein from `@tracker/shared` `computeTargets` on every change; warnings (floor hit, gain > 20%) shown inline.
- [ ] Users with no `profiles` row are redirected here after sign-in; users with one are never redirected. Re-runnable from Settings (`/onboarding/about?edit=1`) prefilled.
- [ ] Every control has a `testID` under `onboarding.*`. Fixture `empty` puts the app into the first-run state.
- [ ] Jest: form validation and derived goal date/weight. Playwright: complete the flow at both viewports and arrive at `/onboarding/summary` (#102 owns that screen; a placeholder is fine here).

## Verification

```bash
pnpm -F tracker test -- onboarding && pnpm -F tracker e2e -- --grep onboarding
```

## Out of scope

Saving targets and the summary screen (#102).

## Verification log
