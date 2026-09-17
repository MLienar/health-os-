---
id: 104
title: Custom foods and servings CRUD
milestone: M1
status: todo
owner: agent
area: [app]
size: M
blocked_by: [7, 9]
branch: ""
merged: ""
---

## Goal

Create and maintain your own foods with one or more serving sizes. This is the only food source in M1, so it must be quick. `SPEC.md` §3.2 custom foods.

## Scope

`apps/tracker/app/foods/*` (`index`, `new`, `[id]`), `src/features/foods/**`.

## Acceptance criteria

- [ ] `/foods` lists my foods sorted by `last_used_at` then name, with search-as-you-type over name and brand; favorite toggle per row.
- [ ] `/foods/new` and `/foods/[id]`: name, brand, per-100 g macro panel (kcal, protein, carbs, fat, fiber, optional sugar, sat fat, sodium), servings list (label + grams, one default). Shared zod schema; kcal auto-suggested from macros with an override.
- [ ] Servings can be added, edited, removed, and reordered; deleting the default promotes the next.
- [ ] Soft delete a food; it disappears from lists but existing diary entries keep their snapshot and still display.
- [ ] All mutations optimistic and queue-aware (#008).
- [ ] `testID`s under `foods.*`. Jest for the form and kcal suggestion; Playwright creating a food with two servings and seeing it in the list.

## Verification

```bash
pnpm -F tracker test -- foods && pnpm -F tracker e2e -- --grep foods
```

## Out of scope

Search sheet integration (#105), recipes (#107), external sources (M2).

## Verification log
