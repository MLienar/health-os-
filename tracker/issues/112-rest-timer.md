---
id: 112
title: Rest timer with per-exercise defaults, native notification, web beep
milestone: M1
status: todo
owner: agent
area: [app]
size: M
blocked_by: [110]
branch: ""
merged: ""
---

## Goal

Completing a set starts a countdown you can see from across the gym floor. `SPEC.md` §3.3 rest timer, §2 rest timer row.

## Scope

`src/features/workout/timer/**` (`useRestTimer`, `RestTimerBar`, `notify.ts` + `notify.web.ts`).

## Acceptance criteria

- [ ] Checking a set starts the timer with the exercise's default rest (or the settings default); a persistent bar at the bottom shows remaining time with +15 s, −15 s, skip.
- [ ] Timer state is part of the draft, so a reload mid-rest resumes with the correct remaining time computed from the end timestamp.
- [ ] Native: schedules an `expo-notifications` local notification at the end time (cancelled on skip); permission requested on first use with an explanatory sheet.
- [ ] Web: Web Audio beep and a tab-title countdown; when the page is hidden and permission exists, a `Notification` is shown.
- [ ] Settings default rest and per-exercise default editable inline from the bar's menu.
- [ ] Jest for timer math with fake timers. Playwright: complete a set, assert the bar and the title countdown, skip.
- [ ] Not verifiable on iOS by the agent; log says so and #118 covers it.

## Verification

```bash
pnpm -F tracker test -- timer && pnpm -F tracker e2e -- --grep timer
```

## Out of scope

Web Push for installed PWA and Live Activity (M2, M4).

## Verification log
