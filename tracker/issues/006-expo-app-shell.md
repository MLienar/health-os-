---
id: 6
title: Expo app shell with Router, NativeWind, tabs, dark mode, web export, Playwright
milestone: M0
status: in-progress
owner: agent
area: [app, infra]
size: L
blocked_by: [2]
branch: feat/006-expo-app-shell-with-router-nativewind-ta
merged: ""
---

## Goal

The Expo application exists, renders the five-tab shell on web and native, exports as a static SPA, and Playwright can drive it at two viewports. Every later screen slots into this. `SPEC.md` §2 App, §3.4 layout, §10.

## Scope

`apps/tracker/**` excluding `src/features/**` and `src/lib/supabase*`.

## Acceptance criteria

- [x] `expo export --platform web` produces `dist/` with `web.output: "single"`, plus `public/_redirects` (`/* /index.html 200`) copied into `dist/` for Cloudflare Pages. **Deviation:** the dev server (`expo start --web`) was not exercised because the sandbox blocks loopback networking; the exported build served by `scripts/serve-dist.mjs` is what Playwright verified, and it is also what production serves.
- [x] Expo Router with `app/(tabs)/` containing Today, Diary, Train, Trends, Settings, each with a route, `testID="<name>.root"` and `<name>.title`, defined once in `src/navigation/tabs.ts`. Scheme `diettracker` in `app.json`.
- [x] NativeWind 4.2 configured (Babel preset, Metro, `global.css` tokens, `tailwind.config.js` semantic colors + fixed macro colors). **Deviation:** react-native-reusables' CLI was not run (network path unreliable from the sandbox); `src/components/ui/{text,button,card,input,sheet,tabs}.tsx` are hand-written with the same API shape (cva variants, `TextClassContext`, `cn()`), so reusables components can be dropped in later. Dark mode follows system and can be forced from Settings (`settings.theme.*`).
- [x] Under 768 px: bottom tabs. At or above 768 px: side rail (`tabs.rail`) and a 640 px centered column; the bottom bar is removed from the tree on wide layouts (`tabBar={() => null}`) so testIDs stay unique. Screenshots: `.playwright/shots/{iphone,desktop}-{today,diary,settings-dark}.png`.
- [x] `src/lib/log.ts` exports `log(scope, message, data?)` plus `.debug/.info/.warn/.error`, prefix `[dt]`; unit-tested.
- [x] Jest (`jest-expo` 57 + RNTL 13) runs `src/__tests__/shell.test.tsx` (3 router tests via `renderRouter`) and `log.test.ts`. 4/4 green.
- [x] Playwright 1.63 with `iphone` (390×844, WebKit, touch) and `desktop` (1280×800, Chromium, dark) projects, browsers in `.playwright/browsers`, `e2e/shell.spec.ts` (tabs + deep link, layout per viewport, forced theme). 6/6 green.
- [x] App typechecks (tsc 5.9, 0 errors) and `pnpm lint` is green (45 files).
- [ ] **Not done here:** app icon, splash, favicon (removed from `app.json` until #010 adds real assets).

## Verification

```bash
pnpm -F tracker test && pnpm -F tracker e2e && pnpm -F tracker export:web && ls apps/tracker/dist
```

## Out of scope

Auth (#007), any real screen content (M1), PWA files (#010).

## Verification log

2026-09-17. "U" = had to run unsandboxed (Babel reads `**/data/*.json`, or loopback networking).

| Check | Command | Result |
|---|---|---|
| install | `pnpm install` (U, `.vscode/launch.json` write denied sandboxed) | 889 packages; store pinned to `.pnpm-store` |
| typecheck | `node …/typescript/bin/tsc --noEmit` in `apps/tracker` | 0 errors |
| lint | `pnpm lint` | 45 files, 0 errors |
| unit | `node …/jest/bin/jest --ci` (U) | 2 suites, 4 tests, all pass |
| export | `expo export --platform web` (U) | `dist/index.html`, `_redirects`, 1 CSS, 1 JS (2.7 MB) |
| e2e | `playwright test` (U) | 6/6 pass, iphone + desktop |
| screenshots | viewed `iphone-today.png`, `desktop-diary.png`, `desktop-settings-dark.png` | bottom tabs on phone; rail + centered column on desktop; dark tokens applied when forced |
| review | `code-reviewer`, `typescript-reviewer` | code-reviewer: all [x] criteria confirmed against artifacts; 2 MEDIUM (dead `color` ternary on rail icons relying on web-only `className` passthrough; `jest` undeclared) → fixed. typescript-reviewer: same icon bug rated HIGH (would silently break on native) → same fix; 1 LOW deprecated `Slot.Text` → switched to generic `Slot`. Both confirmed `serve-dist.mjs` traversal-safe and a11y props valid. Re-verified after fixes: Jest 4/4, export OK, Playwright 6/6. |
| iOS | — | **not verified on iOS** (no simulator, no Expo Go run); #015 covers it |

Environment lessons recorded in #001 and `CLAUDE.md`: Babel-based tools cannot run sandboxed on this machine; JS CLIs must be invoked via `node "$(node -p 'require.resolve(...)')"`; RNTL 14 is incompatible with React 19.2 (use 13.x); jest-expo's transform list must be extended, not replaced.

Follow-up spotted: the `outline` Button variant looked low-contrast in the forced-dark screenshot on desktop (possibly hover state); check in #116 when Settings gets real content.
