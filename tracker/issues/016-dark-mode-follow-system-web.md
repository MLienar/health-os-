---
id: 16
title: Dark mode should follow the system preference on web
milestone: M0
status: todo
owner: agent
area: [app]
size: S
blocked_by: [6]
branch: ""
merged: ""
---

## Goal

With the theme preference set to "system", the web build should render dark when the OS or browser prefers dark. Forcing dark from Settings works (#006), but Playwright screenshots taken with `colorScheme: "dark"` emulation (`desktop-diary.png`, `pwa-offline-diary.png`) render light, so the "system" path is not wired on web. `SPEC.md` §2 UI (dark mode from day one).

## Scope

`apps/tracker/src/lib/theme.tsx`, `apps/tracker/tailwind.config.js` (`darkMode`), `apps/tracker/app/_layout.tsx`, one Playwright assertion.

## Acceptance criteria

- [ ] Root cause identified and written here (likely NativeWind `darkMode: "class"` not applying the `dark` class from `prefers-color-scheme` on web when the preference is "system", or `Appearance` not being consulted at startup).
- [ ] With preference "system", `colorScheme: "dark"` emulation renders the dark tokens (background `#0b0f14`-ish) on `/` in both the `desktop` and `pwa` projects; `colorScheme: "light"` renders light.
- [ ] Forcing light/dark from Settings still works and still wins over the system preference.
- [ ] Playwright: assert the computed background color of `today.root` under both emulated schemes.
- [ ] Not verified on iOS; note whether the same code path applies natively.

## Verification

```bash
pnpm -F tracker export:web && pnpm -F tracker e2e -- --grep theme
```

## Out of scope

Persisting the preference (#116).

## Verification log
