---
id: 15
title: Expo Go on the iPhone against the hosted backend
milestone: M0
status: todo
owner: human
area: [app]
size: S
blocked_by: [13]
branch: ""
merged: ""
---

## Goal

Confirm the native path works end to end before any feature is built on it: the same code runs in Expo Go on the phone, signs in to the hosted project, and shows the tab shell. Also confirm the PWA installs.

## Scope

Your phone. Report findings as new issues if anything is off.

## Acceptance criteria

- [ ] Expo Go installed from the App Store. `pnpm -F tracker start` on the laptop, QR scanned, app loads on the phone over the LAN (needs #001's optional port allowance, or use `--tunnel`).
- [ ] Sign in with the hosted test user succeeds; tabs render; dark mode follows the phone setting.
- [ ] The Cloudflare URL opened in Safari offers "Add to Home Screen"; the installed app opens full screen and shows the shell offline after one online load.
- [ ] Any visual or behavioural difference from the web build is filed as an M1 issue with a screenshot.

## Verification

Screenshots from the phone attached to the log (drop them in `docs/screenshots/m0/`).

## Out of scope

EAS builds and TestFlight (M2).

## Verification log
