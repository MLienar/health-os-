---
id: 108
title: Save a diary meal as a recipe; duplicate a recipe
milestone: M1
status: todo
owner: agent
area: [app]
size: S
blocked_by: [106, 107]
branch: ""
merged: ""
---

## Goal

The two other recipe entry points from `SPEC.md` §3.2, so a meal you already logged becomes reusable in one tap.

## Scope

`src/features/diary/MealSection` menu, `src/features/recipes/**`.

## Acceptance criteria

- [ ] Meal header menu: "Save as recipe" opens the recipe editor prefilled with the meal's entries as ingredients (quick-add entries become a single "Quick add" ingredient with their macros), servings 1, name defaulting to "<Meal> <date>".
- [ ] Recipe detail menu: "Duplicate" opens the editor prefilled with "<name> (copy)".
- [ ] Optional after saving from a meal: "Replace these entries with 1 serving of the recipe" (off by default).
- [ ] Playwright: save fixture lunch as a recipe, find it in the search sheet, log it to tomorrow.

## Verification

```bash
pnpm -F tracker e2e -- --grep "save as recipe"
```

## Out of scope

Nothing further.

## Verification log
