---
id: 5
title: packages/shared with types, zod schemas, and calculations
milestone: M0
status: todo
owner: agent
area: [shared]
size: M
blocked_by: [2, 4]
branch: ""
merged: ""
---

## Goal

A dependency-light TypeScript package holding the domain the app and Edge Functions share: row types, zod schemas for forms, and pure functions for targets, 1RM, recipe scaling, and day boundaries. `SPEC.md` §2 shared package.

## Scope

`packages/shared/**`.

## Acceptance criteria

- [ ] `package.json` with zod as the only runtime dependency; ESM; `exports` map; Jest configured.
- [ ] `src/db.types.ts` is the generated Supabase types file from #003; `src/rows.ts` re-exports friendly aliases (`Food`, `DiaryEntry`, `Workout`, …).
- [ ] `src/schemas/`: zod schemas for profile questionnaire, custom food, serving, recipe, diary entry, set. Each with a test of one valid and two invalid inputs.
- [ ] `src/calc/targets.ts` passes every vector in `docs/test-vectors/targets.json` byte-for-byte after JSON round-trip.
- [ ] `src/calc/oneRepMax.ts` (Epley) with tests. `src/calc/recipe.ts` per-serving and per-gram macros with tests including cooked weight. `src/calc/day.ts` `localDateFor(timestamp, dayStartHour, tz)` with tests around midnight and the boundary hour.
- [ ] `src/units.ts` SI helpers with rounding rules used by the UI.
- [ ] `pnpm -F shared test` and `pnpm typecheck` green; zero React or Supabase imports (a test asserts this by scanning the source).

## Verification

```bash
pnpm -F shared test && pnpm typecheck
```

## Out of scope

Anything rendering. Query hooks (live in the app).

## Verification log
