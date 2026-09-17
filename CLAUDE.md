# CLAUDE.md — Diet + Training Tracker

One Expo (React Native) codebase targeting web first (also a PWA) and iOS (Expo Go now, EAS builds later) + Supabase backend. Single user. See `SPEC.md`; §10 describes the agentic workflow this file implements.

**Status:** M0 in progress. Work is tracked in `tracker/` (see below). Paths in the command table exist once the issue that creates them is done; until then treat a missing path as "not created yet", not as an error to work around.

## Start here: the tracker

`tracker/` is the issue tracker. Read `tracker/README.md` once; it defines the loop. Short version:

```bash
node scripts/tracker.mjs next        # the issue to work on now, printed in full (exit 1 = waiting on human)
node scripts/tracker.mjs start <id>  # claim it, get the branch name
node scripts/tracker.mjs done <id> <sha>
node scripts/tracker.mjs humans      # what only Matheo can do
node scripts/tracker.mjs check       # validate; must pass before committing anything under tracker/
```

The issue file is the contract: goal, scope, acceptance criteria, verification commands. Do not widen scope. Check criteria off in the file as you prove them, fill its `## Verification log`, and if reality disagrees with the issue, edit the issue in the same commit and say why. New work found mid-issue becomes a new issue file from `tracker/TEMPLATE.md`, never extra scope. The agent merges its own branch when the definition of done holds unless the issue has `review: human`.

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

- Work one issue at a time from `tracker/`, following the loop in `tracker/README.md`. One issue per branch (`feat/NNN-slug`, from `start`). Nothing goes to `main` directly except tracker bookkeeping and hotfixes labelled as such.
- Conventional commits. Squash-merge into `main` when the definition of done holds; the commit body lists the acceptance criteria met.
- Independent issues (disjoint `area`) may run in parallel worktrees. Do not touch files outside the issue's `## Scope`.
- Changing anything marked `[DECISION]` in `SPEC.md` requires a short ADR in `docs/decisions/`. Never change it silently.
- Run `typescript-reviewer` and `code-reviewer` on every branch before merging. Run `security-reviewer` on anything touching auth, RLS, Edge Functions, or user input.
- Git inside the Bash sandbox fails until issue #001 is done (it cannot read `~/.gitconfig`). Until then, git commands need an unsandboxed retry; say so rather than working around it.

## Definition of done

1. Acceptance criteria in the issue file are checked off, each with the command or screenshot that proved it.
2. `pnpm typecheck`, `pnpm lint`, `pnpm test` green. `pnpm db:test` green if the issue touched SQL. `node scripts/tracker.mjs check` green.
3. New behaviour has a test at the lowest layer that can express it.
4. Any UI change has Playwright screenshots at both viewports, paths recorded in the verification log.
5. Route and `testID`s exist for any new screen or control.
6. Issue file's verification log filled in; `SPEC.md` updated if scope changed; `tracker/BOARD.md` regenerated (the `done` command does this).

Report the actual result of each check. If something is red or skipped, say so. iOS behaviour cannot be verified by the agent on this machine; say "not verified on iOS" rather than implying it was.

## Environment notes (this machine)

The Bash sandbox here is managed at a higher level and `/sandbox` cannot change it. Verified constraints and the rules that follow (details and log in `tracker/issues/001-*.md`):

- **No loopback networking in the sandbox, either direction.** Sandboxed commands can neither start a server nor connect to one. Long-lived servers (`pnpm db:start`, `pnpm -F tracker web`) are started by Matheo with `!` or, if he asks, by the agent unsandboxed once per session. Browser verification goes through the **Playwright MCP server**, which runs outside the sandbox; the Playwright CLI, `supabase db reset`, `supabase test db`, and any curl to localhost run unsandboxed and will prompt. Say which one you are about to do and why.
- **Docker socket is invisible.** Same rule: `supabase` container commands run unsandboxed.
- **Any file under a `data/` directory inside the project is unreadable sandboxed.** Babel's tables live in such directories, so **Jest, Metro, `expo start`, and `expo export` only work unsandboxed** (each run prompts). Native tools (`biome`, `tsc`) and `node scripts/*.mjs` are fine sandboxed. Never name a project directory `data/`.
- **`pnpm install` runs unsandboxed** (a transitive package ships `.vscode/launch.json`, which the sandbox refuses to write). Sandboxed `pnpm add <pkg>` usually works. The store is pinned to `.pnpm-store/` in the repo by `.npmrc`; never change that.
- **JS CLIs:** pnpm's bin shims and `pnpm <script>` cannot find `node` (see the PATH quirk below). Invoke CLIs as `node "$(node -p 'require.resolve("<pkg>/bin/cli")')" …` from the package directory, e.g. `expo/bin/cli`, `jest/bin/jest`, `@playwright/test/cli`, `typescript/bin/tsc`.
- **Git:** always prefix with `GIT_CONFIG_GLOBAL=/dev/null` and pass identity per command, since `~/.gitconfig` is unreadable and `.git/config` is not writable:
  `GIT_CONFIG_GLOBAL=/dev/null git -c user.name="Matheo Lienard" -c user.email=mld@sahar.fr commit -m "…"`. Reads, staging, commits, branches work sandboxed. `git push` needs the SSH key and runs unsandboxed.
- **Never use `rm`.** A hook blocks it. Build artifacts are gitignored; leave them. If a deletion is genuinely required, ask Matheo.
- **`.env*` files are unreadable** by the agent (sandbox and project deny rules). Document every variable in `README.md`; write env files from that documentation without reading them back; never put real values in the repo.
- **`.claude/skills`, `.claude/hooks`, `.claude/settings.json` are not writable** by the agent. Skill and hook content is authored under `docs/agent/` and Matheo copies it into place.
- **Node PATH quirk (until #001 installs Homebrew node):** node is under `~/.nvm`, which the sandbox lets you execute but not stat. `node scripts/tracker.mjs` run directly works; `pnpm tracker` and any pnpm script that launches a JS CLI fails with `node: command not found`. Native binaries (`biome`, `tsc` 7) are fine. Prefer direct `node …` invocations for repo scripts; if a pnpm script fails this way, say so and point at #001 rather than rewriting scripts around it.
- `pnpm view` and other npm pass-through commands fail (no `npm` on the sandbox PATH); use `pnpm add`, `pnpm outdated`, or a direct registry fetch. The pnpm store lives at `~/claude_access/.pnpm-store`, which is writable.
- Node 22 and pnpm 10 are installed. Docker is installed. Supabase CLI and EAS CLI are dev dependencies. Deno is not installed and is only needed for Edge Function unit tests.
- `.npmrc` sets `node-linker=hoisted`, which Expo requires in pnpm monorepos. Do not remove it. Playwright browsers install to `.playwright/` in the repo via `PLAYWRIGHT_BROWSERS_PATH`.
- No Xcode on this machine. Nothing in this repo may require it; iOS builds run on EAS.
