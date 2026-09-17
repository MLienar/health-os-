---
id: 105
title: Food search sheet with recents, favorites, my foods, quick add, and add-to-meal
milestone: M1
status: todo
owner: agent
area: [app]
size: L
blocked_by: [103, 104]
branch: ""
merged: ""
---

## Goal

The one sheet used to put anything into the diary. Local sources only in M1, but the sectioned layout and source badges are built so USDA and Open Food Facts slot in during M2. `SPEC.md` §3.2 food search and entry.

## Scope

`src/features/search/**` (`FoodSearchSheet`, `QuantityStep`, `QuickAddForm`), wiring from `MealSection`.

## Acceptance criteria

- [ ] Opens from any meal's add row as a bottom sheet (web: full-height sheet on phone, dialog on desktop). Search field autofocused.
- [ ] Sections in order: Recents (last 20 distinct foods), Favorites, My foods & recipes; each filtered by the query; a source badge slot per row (`custom`, `recipe`).
- [ ] Selecting a food goes to a quantity step: serving picker (defaults to last-used serving for that food, else default serving), quantity input with ×/grams toggle, live macros; "Add" writes a `diary_entries` row with the snapshot and updates `foods.last_used_at` and `use_count`.
- [ ] Quick add tab: kcal and macros, optional name, adds an entry with `food_id null`.
- [ ] "Add another" keeps the sheet open on the same meal; "Done" closes it.
- [ ] Optimistic insert appears in the day view immediately; totals update.
- [ ] `testID`s under `search.*`. Jest for section filtering and quantity math; Playwright adding a food and a quick add to lunch and asserting totals.

## Verification

```bash
pnpm -F tracker test -- search && pnpm -F tracker e2e -- --grep search
```

## Out of scope

External search and barcode (M2). Recipe rows appear once #107 exists; the section already handles `source: recipe`.

## Verification log
