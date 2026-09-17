---
id: 6
title: Expo app shell with Router, NativeWind, tabs, dark mode, web export, Playwright
milestone: M0
status: todo
owner: agent
area: [app, infra]
size: L
blocked_by: [2]
branch: ""
merged: ""
---

## Goal

The Expo application exists, renders the five-tab shell on web and native, exports as a static SPA, and Playwright can drive it at two viewports. Every later screen slots into this. `SPEC.md` §2 App, §3.4 layout, §10.

## Scope

`apps/tracker/**` excluding `src/features/**` and `src/lib/supabase*`.

## Acceptance criteria

- [ ] `pnpm -F tracker web` serves the app; `pnpm -F tracker export:web` produces `dist/` with `web.output: "single"` and an SPA fallback file for Cloudflare Pages.
- [ ] Expo Router with `app/(tabs)/` containing Today, Diary, Train, Trends, Settings placeholders, each with a route, a `testID` on its root, and its title. Scheme `diettracker` set in `app.json`.
- [ ] NativeWind configured; react-native-reusables initialized with Button, Card, Input, Text, Sheet, Tabs; design tokens for light and dark in `tailwind.config.js`; dark mode follows system and can be forced from Settings placeholder.
- [ ] Under 768 px: bottom tabs. At or above 768 px on web: side rail with the same tabs and a centered column of max 640 px. Verified by screenshots at both viewports.
- [ ] `src/lib/log.ts` exports `log(scope, message, data?)` with the `[dt]` prefix.
- [ ] Jest (`jest-expo`) with React Native Testing Library runs one test rendering the tab shell.
- [ ] Playwright configured with `iphone` (390×844, touch, mobile UA) and `desktop` (1280×800) projects, browsers in `.playwright/` via `PLAYWRIGHT_BROWSERS_PATH`, one smoke test that loads `/` and asserts the five tabs; `pnpm -F tracker e2e` green.
- [ ] `pnpm typecheck && pnpm lint` green for the app.

## Verification

```bash
pnpm -F tracker test && pnpm -F tracker e2e && pnpm -F tracker export:web && ls apps/tracker/dist
```

## Out of scope

Auth (#007), any real screen content (M1), PWA files (#010).

## Verification log
