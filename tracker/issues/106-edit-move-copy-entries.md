---
id: 106
title: Edit, delete, move entries; copy meal or day from a previous day
milestone: M1
status: todo
owner: agent
area: [app]
size: M
blocked_by: [105]
branch: ""
merged: ""
---

## Goal

Fixing and repeating logs is where most diary time goes. `SPEC.md` §3.2 food diary bullets on copy and move.

## Scope

`src/features/diary/**` (`EntrySheet`, `CopySheet`, swipe actions, multi-select).

## Acceptance criteria

- [ ] Tap an entry: sheet to change quantity or serving (recomputes snapshot from current food data, by design), move to another meal, or delete. Swipe-to-delete on touch with undo toast.
- [ ] Long-press enters multi-select; actions: delete, move to meal, copy to date+meal.
- [ ] Meal header menu: "Copy from…" opens a date picker defaulting to yesterday and lists that day's meals; picking one copies its entries (new UUIDs, snapshots copied verbatim, `created_at` now).
- [ ] Day header menu: "Copy entire day from…" with the same picker.
- [ ] All mutations optimistic and queue-aware; a copy of eight entries is one batched upsert.
- [ ] Jest for the copy mapping; Playwright: copy yesterday's lunch into today (fixture `typicalDay` seeds yesterday) and assert totals.

## Verification

```bash
pnpm -F tracker test -- diary && pnpm -F tracker e2e -- --grep copy
```

## Out of scope

Keyboard shortcuts on desktop (M4).

## Verification log
