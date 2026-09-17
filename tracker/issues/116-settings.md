---
id: 116
title: Settings: day start, default rest, meal slots, profile, account
milestone: M1
status: todo
owner: agent
area: [app]
size: M
blocked_by: [102, 103]
branch: ""
merged: ""
---

## Goal

The few knobs the app has, plus account actions. `SPEC.md` §3.4 Settings.

## Scope

`apps/tracker/app/(tabs)/settings/*`, `src/features/settings/**`.

## Acceptance criteria

- [ ] Day start hour picker (0–6) writing `settings` jsonb; diary uses it immediately.
- [ ] Default rest seconds; theme (system / light / dark).
- [ ] Meal slots editor: rename, add, remove (only if empty across all days, else disable with explanation), reorder.
- [ ] Profile and targets: shows current targets, "Edit profile" to onboarding edit, "Recalculate" runs the RPC and shows a diff before saving.
- [ ] Account: email shown, sign out, "Delete all my data" (types DELETE to confirm; soft-deletes every user row then hard-deletes via an RPC `purge_my_data` added in a migration with pgTAP).
- [ ] About: version, links to spec and live URL.
- [ ] Playwright: change day start and confirm a 01:00 entry moves days; rename a meal and see it in the diary.

## Verification

```bash
pnpm db:test && pnpm -F tracker e2e -- --grep settings
```

## Out of scope

Export and import (#117). Units toggle (metric only in MVP).

## Verification log
