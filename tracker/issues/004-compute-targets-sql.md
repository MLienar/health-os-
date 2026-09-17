---
id: 4
title: compute_targets Postgres function and shared test vectors
milestone: M0
status: todo
owner: agent
area: [db, docs]
size: M
blocked_by: [3]
branch: ""
merged: ""
---

## Goal

The target calculation in `SPEC.md` §3.1 exists as a Postgres function callable over RPC, and a JSON file of input/output vectors becomes the contract that the TypeScript mirror (#005) and any future client must satisfy.

## Scope

`supabase/migrations/*_compute_targets.sql`, `supabase/tests/compute_targets.sql`, `docs/test-vectors/targets.json`, `docs/test-vectors/README.md`.

## Acceptance criteria

- [ ] `docs/test-vectors/targets.json` holds at least 12 vectors covering: male/female, Mifflin vs Katch-McArdle, each activity level, lose/maintain/gain, the BMR floor, the gain warning flag, standard vs high protein, day types on and off. Each vector has an `id`, `input`, `expected`, and a one-line `why`.
- [ ] `compute_targets(profile jsonb, weight_kg numeric) returns jsonb` implements every rule in §3.1 including rounding: kcal to nearest 10, grams to nearest 1.
- [ ] Output shape: `{ bmr, tdee, days: [{ day_type, kcal, protein_g, fat_g, carbs_g, fiber_g }], warnings: [] }`.
- [ ] pgTAP test loads the JSON vectors and asserts every one; `pnpm db:test` is green.
- [ ] Function is `security invoker`, `immutable`, and callable by the `authenticated` role via `supabase.rpc('compute_targets', …)`, proven by a curl in the verification log.

## Verification

```bash
pnpm db:reset && pnpm db:test
curl -s "$SUPABASE_URL/rest/v1/rpc/compute_targets" -H "apikey: $ANON" -H "Authorization: Bearer $JWT" -H 'content-type: application/json' -d @docs/test-vectors/one.json
```

## Out of scope

The TypeScript mirror (#005). Adaptive targets (M3). `exercise_prs` and `weekly_summary` (M2).

## Verification log
