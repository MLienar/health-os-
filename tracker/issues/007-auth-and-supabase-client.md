---
id: 7
title: Supabase client, password auth, dev auto-login, session persistence
milestone: M0
status: todo
owner: agent
area: [app]
size: M
blocked_by: [3, 6]
branch: ""
merged: ""
---

## Goal

The app talks to Supabase with a typed client, a user can sign in with email and password, the session survives reloads on web and relaunches on native, and dev builds land on Today already signed in as the seeded user. `SPEC.md` §2 Auth session, §10 dev auto-login.

## Scope

`apps/tracker/src/lib/supabase.ts`, `src/lib/storage.ts` (+ `.web.ts`), `src/lib/queryClient.ts`, `app/(auth)/sign-in.tsx`, `app/_layout.tsx` route guard, `.env.development`, `.env.example`.

## Acceptance criteria

- [ ] `supabase.ts` creates a client typed with `Database` from `@tracker/shared`, reading `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- [ ] Session storage adapter: `expo-secure-store` on native, `localStorage` on web, chosen by file suffix, not `Platform.OS`.
- [ ] `/sign-in` screen with email and password fields, `testID`s `auth.email`, `auth.password`, `auth.submit`, inline error on failure.
- [ ] Unauthenticated users are redirected to `/sign-in`; authenticated users hitting `/sign-in` go to `/`.
- [ ] In development (`__DEV__` and `EXPO_PUBLIC_DEV_AUTOLOGIN=1`), the app signs in as the seeded user automatically; never in production builds (a Jest test asserts the guard).
- [ ] Sign out from the Settings placeholder clears the session and returns to `/sign-in`.
- [ ] TanStack Query client created with sane defaults (staleTime 30 s, retry 2, no refetch on window focus for mutations in flight).
- [ ] Playwright: with auto-login disabled, signing in with the seeded credentials lands on Today; with it enabled, `/` renders Today directly. Both viewports screenshotted.

## Verification

```bash
pnpm db:reset && pnpm -F tracker test && pnpm -F tracker e2e
```

## Out of scope

Sign in with Apple (M2). Password reset (not needed for a single user; document the Supabase Studio path in Settings help text).

## Verification log
