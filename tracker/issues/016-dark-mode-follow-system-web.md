---
id: 16
title: Dark mode should follow the system preference on web
milestone: M0
status: done
owner: agent
area: [app]
size: S
blocked_by: [6]
branch: feat/016-dark-mode-should-follow-the-system-prefe
merged: 070b5bd
---

## Goal

With the theme preference set to "system", the web build should render dark when the OS or browser prefers dark. Forcing dark from Settings works (#006), but Playwright screenshots taken with `colorScheme: "dark"` emulation (`desktop-diary.png`, `pwa-offline-diary.png`) render light, so the "system" path is not wired on web. `SPEC.md` §2 UI (dark mode from day one).

## Scope

`apps/tracker/src/lib/theme.tsx`, `apps/tracker/tailwind.config.js` (`darkMode`), `apps/tracker/app/_layout.tsx`, one Playwright assertion.

## Acceptance criteria

- [x] Root cause: `react-native-css-interop/dist/runtime/web/color-scheme.js`. In `darkMode: "class"` mode on web, `colorScheme.set("dark")` adds the `dark` class to `<html>` and any other value (including `"system"`) removes it; the system value only feeds the `useColorScheme()` observable, never the class. So Tailwind's `.dark` CSS never matched under a dark OS preference while the hook said "dark". Fix: `src/lib/systemTheme.web.ts` mirrors `matchMedia("(prefers-color-scheme: dark)")` onto the class while the preference is "system" (applied at module load to avoid a light flash, and re-synced on change); `systemTheme.ts` is a native no-op (NativeWind handles `Appearance` itself there). Wired via one `useEffect` in `ThemeProvider`.
- [x] With preference "system", the `desktop` project (dark emulation) renders a background with luminance < 60 and the `iphone` project (light emulation) > 200. The `pwa` project only runs `pwa.spec.ts` by config, but uses the same Chromium dark emulation and its offline screenshot is now dark.
- [x] Forcing the opposite scheme from Settings flips the background; returning to "system" restores the OS preference. Both asserted.
- [x] `e2e/theme.spec.ts` asserts computed `backgroundColor` luminance of `today.root` / `settings.root` under both emulated schemes.
- [x] Not verified on iOS. The web module is a `.web.ts` split; natively the no-op applies and NativeWind resolves "system" through `Appearance`, which is the documented path.

## Verification

```bash
pnpm -F tracker export:web && pnpm -F tracker e2e -- --grep theme
```

## Out of scope

Persisting the preference (#116).

## Verification log

2026-09-17. "U" = unsandboxed.

| Check | Command | Result |
|---|---|---|
| lint / typecheck | `pnpm lint`, `tsc --noEmit` (app) | 53 files clean; 0 errors |
| unit | `jest --ci` (U) | 4/4 (theme provider still renders and forces) |
| export + e2e | `expo export` + `inject-pwa` + `playwright test` (U) | 13/13: shell 6, theme 4, pwa 3 |
| screenshot | `desktop-today.png` after the fix | dark tokens under dark emulation (was light before) |
| review | `code-reviewer` | Root cause confirmed against the runtime source. 1 HIGH: NativeWind's web runtime snapshots the `dark` class at import time, so a dark-OS "system" load left `useColorScheme()` on "light" (status bar and the Settings label disagreed with the CSS) → now `nwColorScheme.set(preference)` runs on mount in a `useLayoutEffect`. 1 MEDIUM: flash when leaving a forced choice back to system → same `useLayoutEffect` applies the class before paint. Theme spec extended to assert the "Currently dark/light" label matches the emulated OS scheme. Re-verified after fixes (see rows above). |
| iOS | — | not verified on iOS (native path is a no-op by design) |
