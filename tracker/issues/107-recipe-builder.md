---
id: 107
title: Recipe builder and logging recipes by serving or grams
milestone: M1
status: todo
owner: agent
area: [app]
size: L
blocked_by: [105]
branch: ""
merged: ""
---

## Goal

Create a recipe in the simplest possible way and log it like a food. `SPEC.md` §3.2 recipes, entry point 1 and behaviour list.

## Scope

`apps/tracker/app/recipes/*` (`index`, `new`, `[id]`), `src/features/recipes/**`, `@tracker/shared` `calc/recipe.ts` if gaps appear.

## Acceptance criteria

- [ ] `/recipes/new`: name, "makes N servings" (default 1), optional cooked weight in grams, ingredient list. "Add ingredient" opens the same `FoodSearchSheet` from #105 in ingredient mode (returns food + quantity + serving instead of writing a diary row).
- [ ] Per-serving and, when cooked weight is set, per-100 g macros update live under the list. Nothing else is required to save.
- [ ] Saving writes `recipes`, `recipe_items`, and a `foods` row with `source: recipe` carrying the per-serving panel and a default serving "1 serving" (+ "100 g" when cooked weight exists), so search and logging treat it like any food.
- [ ] Ingredient rows: inline quantity edit, swap food (reopens search), reorder, remove.
- [ ] Editing a recipe updates its `foods` row; a Jest test proves an existing diary entry's snapshot is untouched.
- [ ] Logging a recipe from the search sheet offers servings (0.5, 1, 1.5, 2, custom) or grams; an on-the-fly scale factor field ("I made 1.5×") adjusts the per-serving math without saving.
- [ ] `/recipes` lists recipes with favorite toggle and search. `testID`s under `recipes.*`.
- [ ] Playwright: build a three-ingredient recipe, log one serving to dinner, assert totals. Both viewports.

## Verification

```bash
pnpm -F tracker test -- recipes && pnpm -F tracker e2e -- --grep recipes
```

## Out of scope

Save meal as recipe and duplicate (#108). Paste-to-recipe (M3).

## Verification log
