# CLAUDE.md — Diet + Training Tracker

One Expo (React Native) codebase targeting web first (also a PWA) and iOS (Expo Go now, EAS builds later) + Supabase backend. Single user. See `SPEC.md`; §10 describes the agentic workflow this file implements.

**Status:** pre-Phase 0. The commands below describe the intended layout. Until Phase 0 scaffolding lands, treat a missing path as "not created yet", not as an error to work around.

## Commands

Fastest loop first. Run the cheapest command that can verify your change.

```bash
pnpm install

# Whole workspace
pnpm typecheck && pnpm lint             # tsc --noEmit in each package + biome check
pnpm test                               # jest across packages

# Scoped
pnpm -F shared test                     # calculations, schemas, test vectors
pnpm -F tracker test                    # components/hooks (jest-expo + RNTL, mocked Supabase)
pnpm -F tracker web                     # expo start --web  → http://localhost:8081
pnpm -F tracker start                   # expo start (QR code for Expo Go on the phone)
pnpm -F tracker export:web              # static SPA build into apps/tracker/dist

# Database (local Supabase via Docker)
pnpm db:start                           # supabase start
pnpm db:reset                           # supabase db reset (migrations + seed.sql)
pnpm db:test                            # supabase test db (pgTAP)
pnpm db:types                           # regenerate packages/shared/src/db.types.ts
pnpm db:migration <name>                # or /new-migration, which also creates the pgTAP file
pnpm db:functions                       # supabase functions serve

# Browser
pnpm -F tracker e2e                     # playwright against the web build, projects: iphone, desktop
/run-web /diary/today                   # skill: ensure db + web dev server up, open URL, screenshot both viewports

# iOS (later, needs Apple Developer account; runs in Expo's cloud, no Xcode)
pnpm -F tracker eas build --profile development --platform ios
```

Local Supabase URLs: API `http://127.0.0.1:54321`, Studio `http://127.0.0.1:54323`. The test user is created by `supabase/seed.sql`; its credentials live in `apps/tracker/.env.development` as `EXPO_PUBLIC_*` vars (never in production env).

## Architecture rules

- `packages/shared` has **zod as its only runtime dependency**. Domain types, schemas, and pure calculations (targets, 1RM, recipe scaling, day boundaries) live there with tests. If it imports React, React Native, or Supabase, it does not belong in `shared`.
- Data access goes through TanStack Query hooks in `apps/tracker/src/features/<name>/queries.ts`. Components never call `supabase` directly.
- Optimistic updates for every mutation. Mutations are idempotent upserts keyed by client-generated UUIDs.
- All storage is SI: kg, m, kcal, cm. Convert only in the presentation layer.
- Diary entries store a macro snapshot. Never recompute history from current food data.
- Online-first. Only `activeWorkoutDraft`, `pendingWriteQueue`, and the TanStack Query persister live in AsyncStorage. Do not add a local database or a sync engine.
- **Platform differences are separate files** (`Scanner.tsx` / `Scanner.web.tsx`), never `Platform.OS` branches inside components. Every screen must render on web; native-only features get a web fallback or a clear "not available on web" state.
- Prefer Expo SDK modules over community packages. Anything outside Expo Go's bundled module set must be justified in the task file, because it forces an EAS dev client.
- Dev points at local Supabase and auto-logs-in the seeded user. Production points at hosted. The service-role key never appears in the repo or in any client bundle.
- Postgres functions (`compute_targets`, `exercise_prs`, …) are the source of truth for shared logic. The TypeScript mirror in `shared` must pass the same vectors in `docs/test-vectors/`.
- Use `packages/shared/src/db.types.ts` (generated) for row types. Regenerate after every migration; never hand-edit.

## UI conventions

- Phone-first. Design at 390 px. Bottom tabs on phone; on web above 768 px the same screens render in a centered column with a side rail.
- NativeWind classes for styling; react-native-reusables primitives in `src/components/ui`. No `StyleSheet.create` except for things Tailwind cannot express.
- Every interactive element has `testID="<screen>.<element>[.<index>]"`, e.g. `diary.addFood`, `workout.set.3.reps`. On web this becomes `data-testid`.
- Every screen and state has a route under `app/`. Add the route when you add the screen. Navigate by URL in automation.
- `/debug` (dev only) injects fixtures: `empty`, `typicalDay`, `activeWorkout`, `eightWeeks`. Add a fixture when a feature needs a new state.
- Dark mode and large Dynamic Type / 200% zoom must work. Screenshot both Playwright viewports for any UI change.
- Logging via `log(scope, message, data?)` from `src/lib/log.ts`, prefix `[dt]`.

## Database conventions

- One migration per change, timestamped, in `supabase/migrations`. Never edit an applied migration; add a new one.
- Every user table has `id`, `user_id`, `created_at`, `updated_at`, `deleted_at` and RLS `user_id = auth.uid()`. Seed rows (exercises) have `user_id null` and a read-only policy.
- Every new table or function gets a pgTAP test: RLS denies other users, function matches vectors.
- Soft delete only.
- Edge Functions in `supabase/functions/<name>/index.ts`, Deno. External API keys come from function secrets, never from the client.

## Workflow

- Work in **vertical slices** from `docs/tasks/NNN-name.md`. One branch and one PR per slice. If no task file exists, create one with `/new-feature` first.
- Conventional commits. Commit when a slice's acceptance criteria are met, not before.
- Independent slices may run in parallel worktrees. Do not touch files outside your slice's declared scope.
- Changing anything marked `[DECISION]` in `SPEC.md` requires a short ADR in `docs/decisions/`. Never change it silently.
- Run `typescript-reviewer` and `code-reviewer` on every PR. Run `security-reviewer` on anything touching auth, RLS, Edge Functions, or user input.

## Definition of done

1. Acceptance criteria in the task file are checked off.
2. `pnpm typecheck`, `pnpm lint`, `pnpm test` green. `pnpm db:test` green if the slice touched SQL.
3. New behaviour has a test at the lowest layer that can express it.
4. Any UI change has Playwright screenshots at both viewports attached to the PR.
5. Route and `testID`s exist for any new screen or control.
6. Task file updated; `SPEC.md` updated if scope changed.

Report the actual result of each check. If something is red or skipped, say so. iOS behaviour cannot be verified by the agent on this machine; say "not verified on iOS" rather than implying it was.

## Environment notes

- Node 22 and pnpm 10 are installed. Docker is installed. Supabase CLI and EAS CLI are dev dependencies. Deno is not installed and is only needed for Edge Function unit tests.
- `.npmrc` sets `node-linker=hoisted`, which Expo requires in pnpm monorepos. Do not remove it.
- Sandbox: `supabase start` needs the Docker socket allowed. Playwright browsers install to `.playwright/` in the repo via `PLAYWRIGHT_BROWSERS_PATH`. If the default pnpm store is blocked, use `pnpm config set store-dir .pnpm-store`.
- No Xcode on this machine. Nothing in this repo may require it; iOS builds run on EAS.
