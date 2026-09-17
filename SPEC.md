# Diet + Training Tracker — Spec

Personal-use app combining a food diary (MyFitnessPal-style) with a workout logger (Hevy-style).
**One Expo (React Native) codebase.** Web is the first shipped surface (also installable as a PWA on iPhone); iOS runs today through Expo Go and ships later through EAS cloud builds, so no Xcode is needed on this machine. Single user. Running cost target: $0/month.

Status: **v0.4** (2026-09-17). Confirmed: Expo single codebase, web first, online-first, metric units, Apple Developer account acceptable when iOS builds start. Xcode is not available locally.

---

## 1. Goals and non-goals

**Goals**

- Log food fast enough to actually do it every day: recents, favorites, copy yesterday, barcode scan, recipes.
- Log workouts in the gym even with bad signal: active workout never lost, "last time you did this" per exercise, rest timer.
- Set targets from a short onboarding questionnaire and keep them current as weight and goals change.
- See diet and training together: calories/macros vs targets, weight trend, strength progression.
- Own the data: plain Postgres schema, one-tap export.
- Phone-first UI from day one, usable on iPhone immediately via Expo Go or the installed web app.

**Non-goals (for now)**

- Polished desktop web experience (it must work, not shine).
- Multi-user, social, sharing. Coaching, meal plans, AI suggestions. Apple Watch, Android (Expo makes it cheap later, but not a target).

---

## 2. Architecture

### Overview

```
┌──────────────────────────────────────┐    HTTPS    ┌──────────────────────────────┐
│  Expo app (apps/tracker)             │ ──────────▶ │ Supabase (free tier)         │
│  ├─ web build  → Cloudflare Pages    │ supabase-js │  - Postgres + RLS            │
│  ├─ Expo Go    → your iPhone (dev)   │             │  - Auth (password / Apple)   │
│  └─ EAS Build  → TestFlight (later)  │             │  - RPC: compute_targets, …   │
│  packages/shared: types, calcs       │             │  - Edge Fn: food-search,     │
│  AsyncStorage: draft, queue, cache   │             │    barcode (USDA, OFF proxy) │
└──────────────────────────────────────┘             └──────────────────────────────┘
```

### App

| Concern | Choice | Notes |
|---|---|---|
| Framework | **Expo SDK (latest)**, React Native, TypeScript, **Expo Router** | File-based routes are URLs on web and deep links (`diettracker://`) on iOS. |
| Web output | `expo export --platform web`, output mode `single` (SPA) | Static files, free hosting. React Native Web renders the same components. |
| UI | **NativeWind** (Tailwind for RN) + **react-native-reusables** (shadcn port) | Phone-first. Dark mode from day one. Desktop gets a max-width centered column plus a sidebar; no separate desktop components in MVP. |
| Data | TanStack Query over `supabase-js`; generated DB types | Optimistic updates, retry, persisted cache. |
| Forms | react-hook-form + zod, schemas from `packages/shared` | |
| Charts | `react-native-svg` + `d3-scale` / `d3-shape`, small in-house components | Only line, area, and bar charts are needed; works identically on web and native. |
| Local persistence | `@react-native-async-storage/async-storage` (localStorage on web) for `activeWorkoutDraft`, `pendingWriteQueue`, TanStack Query persister | No local database. See §5. |
| Auth session | Supabase session in `expo-secure-store` on native, localStorage on web | Storage adapter chosen per platform. |
| Barcode | `expo-camera` barcode scanning on iOS; `zxing-wasm` over `getUserMedia` in a `.web.tsx` file | Safari has no built-in barcode API. |
| Rest timer | Native: `expo-notifications` local notification. Web: in-page timer, Web Audio beep, tab-title countdown | Web Push for the installed PWA is Phase 2. |
| PWA | Hand-written `manifest.json` + small service worker (precache shell, network-first for data) added to `public/` and injected after export | Expo no longer generates these. |
| Lint / format | Biome | |
| Tests | **Jest** (`jest-expo` preset) + React Native Testing Library for components and hooks; Jest for `packages/shared`; **Playwright** for web e2e and screenshots | One test runner. Playwright MCP is available to the agent. |
| iOS dev loop | **Expo Go** on your iPhone via QR code for everything that uses only Expo-bundled modules | HealthKit, widgets, Live Activities need a custom dev client built by EAS (Phase 3+). |
| iOS distribution | **EAS Build** (cloud, free tier) → TestFlight | Requires the Apple Developer account at that point. `eas.json` profiles: `development`, `preview`, `production`. |
| Web hosting | Cloudflare Pages free tier, SPA fallback to `index.html` | Deploy on push to `main`, preview per PR. |

### Shared package

`packages/shared` (TypeScript, zod as its only dependency): domain types, zod schemas, and pure calculations (targets, 1RM, recipe scaling, day boundaries). Consumed by the app and by Edge Functions via a Deno import map. Test vectors in `docs/test-vectors/` are shared with the Postgres functions.

### Backend (Supabase)

| Concern | Choice |
|---|---|
| Database | Postgres. Migrations in `supabase/migrations`, Supabase CLI as a dev dependency. RLS on every table: `user_id = auth.uid()`. |
| Auth | Email + password (works on all surfaces and in automation). Sign in with Apple in Phase 2 on iOS. |
| Local stack | `supabase start` via Docker (installed). Dev points at localhost; production at the hosted project. `supabase db reset` restores the seed. |
| DB tests | pgTAP in `supabase/tests/` for RLS and SQL functions. `supabase test db`. |
| Shared logic | Postgres functions via RPC: `compute_targets`, `exercise_prs`, `weekly_summary`. |
| Edge Functions | `food-search` (USDA + Open Food Facts merged and normalized), `barcode` (Open Food Facts). USDA key stays server-side. Run locally through the CLI's Docker edge runtime; Deno only needed for their unit tests. |
| Keep-alive | GitHub Actions cron pings a REST endpoint twice a week so the free project never pauses. |
| Seed | Exercises from `free-exercise-db` with fixed UUIDs and `user_id null`. `seed.sql` also creates the local test user, default meals, sample foods. |

### Repository layout

```
diet-tracker/
  SPEC.md
  CLAUDE.md
  package.json               # pnpm workspace root, scripts
  pnpm-workspace.yaml
  .npmrc                     # node-linker=hoisted (required by Expo in pnpm monorepos)
  biome.json
  .claude/
    settings.json            # hooks (biome on edit, typecheck+test on stop), sandbox allowances
    skills/                  # next-issue, run-web, db-reset, new-migration, new-issue
  scripts/tracker.mjs        # repo-local issue tracker CLI (zero deps)
  tracker/
    README.md                # the process: vocabulary, commands, the per-issue loop, merge policy
    BOARD.md                 # generated overview
    milestones/M*.md         # one per phase, with exit criterion
    issues/NNN-*.md          # one per vertical slice: frontmatter + goal/scope/acceptance/verification
  docs/
    decisions/               # ADRs when a [DECISION] changes
    test-vectors/            # JSON vectors shared by shared/, SQL, future clients
    conventions.md           # testID, route, fixture, and log naming
  apps/tracker/              # Expo app
    app.json  eas.json  metro.config.js  tailwind.config.js
    app/                     # Expo Router routes: (tabs)/, diary/[date], workout/active, recipes/, debug
    src/features/<name>/     # components, hooks, queries per feature
    src/components/ui/       # react-native-reusables primitives
    src/lib/                 # supabase client, query client, storage, log
    public/                  # manifest.json, service worker, icons
    e2e/                     # Playwright (web)
  packages/shared/           # types, zod schemas, calculations, tests
  supabase/
    config.toml  seed.sql  seed/exercises.json
    migrations/  tests/  functions/food-search/  functions/barcode/
  .github/workflows/
    ci.yml                   # biome, typecheck, jest, supabase test db, playwright, web deploy
    keepalive.yml
```

---

## 3. Feature spec

### 3.1 Onboarding and targets  *(required)*

**Profile questionnaire** (first login, re-runnable from Settings)

1. Sex, date of birth, height (cm).
2. Current weight (kg). Optional body-fat % (unlocks Katch-McArdle).
3. Activity outside training: sedentary / light / moderate / very active.
4. Training: sessions per week, typical duration.
5. Goal: lose / maintain / gain, with a rate slider (kg per week; lose 0.25–1.0, gain 0.1–0.5).
6. Optional goal weight and/or goal date (each derives the other from the rate).
7. Protein preference: standard / high.
8. Day-type targets: off / on (training days get more kcal and carbs, rest days fewer, same weekly average).

**Calculation** (`compute_targets` Postgres function, mirrored in `packages/shared` for instant preview; both pass the same vectors)

- BMR: Mifflin-St Jeor; Katch-McArdle when body fat is provided.
- TDEE = BMR × activity multiplier (1.2 / 1.375 / 1.55 / 1.725) + training sessions × estimated kcal per session spread over the week.
- Daily kcal = TDEE ± (rate_kg_per_week × 7700 / 7). Floor at max(BMR, 1400) for lose; warn above +20% for gain.
- Protein: 1.8 g/kg (standard) or 2.2 g/kg (high); lean-mass-based on a cut when body fat is known.
- Fat: 25% of kcal, floor 0.6 g/kg. Carbs: remainder. Fiber: 14 g per 1000 kcal.
- Day types: training day kcal = base × 1.10, rest day = base × (1 − 0.10 × training_days / rest_days). Carbs absorb the difference.

**Output and lifecycle**

- Summary screen: TDEE, daily kcal, macros, projected goal date. Every number overridable before saving.
- Saved as a `targets` row with `effective_from = today`; history kept.
- Recalculation prompts: 7-day average weight moved ≥ 2 kg from last calculation weight, 4 weeks elapsed, or goal changed.
- Phase 3: **adaptive targets** from actual vs planned weight-trend slope, capped at ±150 kcal per adjustment.

### 3.2 Diet

**Food diary**

- Day view with meal slots (Breakfast, Lunch, Dinner, Snacks; rename/add/reorder). Entry = food, recipe, or quick-add with quantity and serving → kcal, protein, carbs, fat, fiber (+ optional sugar, saturated fat, sodium).
- Totals and remaining vs. today's target at the top. Day boundary hour configurable.
- Copy a meal or whole day from any previous day. Move entries between meals. Swipe actions and long-press multi-select.

**Food search and entry**

- Single search field. Sections: recents, favorites, my foods & recipes, then USDA and Open Food Facts via `food-search`. Source badge per row.
- Barcode scan → `barcode` → confirm → saved into `foods`.
- Quick add: macros only. Custom foods: name, brand, one or more servings, macro panel. Per-100 g canonical; servings in grams. Last-used serving remembered per food.

**Recipes**  *(required, must be simple)*

Three entry points, one editor:

1. **Recipe builder**: name → add ingredients with the same search sheet as the diary → "makes N servings" → per-serving macros update live → save.
2. **Save a meal as a recipe** from any diary meal, one tap.
3. **Duplicate and tweak** an existing recipe.

Behaviour: logged like any food, by servings or by grams if cooked weight was entered; editing changes future logs only; on-the-fly scaling; ingredient lines reorderable, editable inline, swappable; recipes searchable and favoritable. Phase 3: paste an ingredient list as text and auto-match lines.

**Body**

- Weight log (multiple per day; day value = last). 7-day trailing average as trend. Measurements in cm. Progress photos not in MVP.

### 3.3 Training

**Exercise library** seeded from free-exercise-db; custom exercises; per-exercise default rest and notes; detail screen with history, PRs, chart.

**Routines**: ordered exercises with target sets, folders, start-from-routine, "update routine with today's sets" after finishing.

**Workout logging** (core loop)

- Active workout screen: exercises with set rows. Set: kg, reps, type (warm-up / working / drop / failure), optional RPE. Cardio: duration, distance, optional kcal.
- Previous performance greyed in each row; tap to copy.
- Rest timer per set with default per exercise. Add/reorder/remove/replace exercises mid-workout. Supersets Phase 2. Notes.
- **Draft persisted to AsyncStorage on every change**; backgrounding, reloading, or losing signal never loses a set. One active workout at a time; resume banner on launch.
- Finish → summary: duration, volume, PRs → upload.

**History and analytics**: calendar with markers; per exercise best set, Epley 1RM, best volume, chart; weekly sets per muscle group; frequency.

### 3.4 Cross-cutting

- **Today**: kcal remaining, macro bars, collapsed meals, weight quick-log, Start/Resume workout.
- **Trends**: weight trend vs. average daily kcal; weekly adherence; pinned exercise charts.
- **Settings**: day start hour, default rest timer, meal slots, profile/targets, export (JSON + CSV), import own JSON, sign out, delete all data. Metric only in MVP; storage is SI.
- **Layout**: bottom tabs on phone (native and web under 768 px); on wider web viewports the same screens render in a centered column with a side rail for tabs.

---

## 4. Data model

All user tables: `id uuid pk default gen_random_uuid()`, `user_id uuid references auth.users`, `created_at`, `updated_at` (trigger), `deleted_at` (soft delete). RLS: `user_id = auth.uid()`.

**Profile and targets**
- `profiles` — sex, birth_date, height_cm, body_fat_pct, activity_level, training_sessions_per_week, session_minutes, goal, rate_kg_per_week, goal_weight_kg, goal_date, protein_pref, day_types_enabled, last_calc_weight_kg, last_calc_at
- `targets` — effective_from, day_type (`any|training|rest`), kcal, protein_g, carbs_g, fat_g, fiber_g, source (`computed|manual|adaptive`)

**Diet**
- `foods` — name, brand, source (`custom|usda|off|recipe`), external_id, barcode, per-100 g panel (kcal, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sat_fat_g, sodium_mg), is_favorite, last_used_at, use_count
- `food_servings` — food_id, label, grams, is_default
- `recipes` — food_id, name, servings_count, cooked_weight_g, notes
- `recipe_items` — recipe_id, food_id, quantity, serving_id, sort_order
- `meals` — name, sort_order
- `diary_entries` — date, meal_id, food_id (null for quick add), quantity, serving_id, macro snapshot (kcal, protein_g, carbs_g, fat_g, fiber_g), note
- `weight_logs` — measured_at, weight_kg, note, source
- `measurements` — measured_at, type, value_cm

**Training**
- `exercises` — user_id nullable (null = seed), name, category, primary_muscles text[], secondary_muscles text[], equipment, instructions, image_url, default_rest_seconds, notes
- `routine_folders` — name, sort_order
- `routines` — name, folder_id, notes, sort_order
- `routine_exercises` — routine_id, exercise_id, sort_order, superset_group, rest_seconds
- `routine_sets` — routine_exercise_id, sort_order, set_type, target_reps, target_weight_kg, target_rpe
- `workouts` — started_at, finished_at, routine_id, name, notes, duration_seconds, total_volume_kg
- `workout_exercises` — workout_id, exercise_id, sort_order, superset_group, notes
- `sets` — workout_exercise_id, sort_order, set_type, weight_kg, reps, rpe, duration_seconds, distance_m, completed_at, is_pr

**System**
- `settings` — one row per user, jsonb

**Device only (AsyncStorage)**
- `activeWorkoutDraft`, `pendingWriteQueue`, TanStack Query persisted cache.

---

## 5. Online-first with a safety net

The app reads from and writes to Supabase directly. Two narrow exceptions cover the gym:

1. **Active workout draft** in AsyncStorage, uploaded on Finish and opportunistically every few minutes while online. On web the service worker precaches the shell so the app opens with no signal; on iOS the bundle is already local.
2. **Pending write queue.** Any mutation failing with a network error is appended to AsyncStorage and replayed in order when connectivity returns (`NetInfo` on native, `online` event on web) or the app foregrounds. Mutations are idempotent upserts keyed by client UUIDs; the UI applies them optimistically.

Reads offline show the persisted query cache with an "offline" pill. `updated_at` on every row leaves room for last-writer-wins sync if it is ever needed.

---

## 6. Integrations

| Integration | What | Phase |
|---|---|---|
| USDA FoodData Central | Generic food search behind `food-search`. | 2 |
| Open Food Facts | Barcodes and branded foods behind `food-search` and `barcode`. | 2 |
| Camera barcode | `expo-camera` (iOS), `zxing-wasm` (web). | 2 |
| Local notifications | Rest timer on iOS. | 1 |
| Web Push | Rest timer on installed PWA. | 2 |
| HealthKit | Weight in, workouts and nutrition out. Needs an EAS dev client. | 3 |
| Live Activity / widget | Rest timer on lock screen; kcal remaining widget. Config plugins, EAS build. | 4 |

---

## 7. Cost model

| Item | Cost | Notes |
|---|---|---|
| Supabase free tier | $0 | Keep-alive cron prevents the 7-day pause. |
| Cloudflare Pages | $0 | |
| EAS Build free tier | $0 | Limited builds per month with queueing; ample for a personal app. |
| Expo Go | $0 | iOS dev loop without any build. |
| GitHub Actions | $0 | Linux minutes only. |
| USDA, Open Food Facts | $0 | |
| Apple Developer Program | $99/yr, **deferred** | Needed when the first EAS iOS build is made (dev client or TestFlight). Not needed for Expo Go or the web app. |

---

## 8. Phased plan

**Phase 0 — Foundations and agentic tooling**

Backend
- Supabase CLI as dev dependency; local stack running; hosted project in an EU region.
- Full schema migration, RLS, `updated_at` triggers, exercise seed, `seed.sql` with test user and fixtures.
- `compute_targets` function with vectors; pgTAP for RLS and functions. Keep-alive workflow.

App
- pnpm workspace with hoisted linker: `apps/tracker`, `packages/shared`. Expo, Expo Router, NativeWind, react-native-reusables, TanStack Query, Biome, Jest, Playwright.
- Auth (password) with dev auto-login; platform storage adapters; generated DB types.
- `packages/shared`: types, zod schemas, targets calculator passing the shared vectors.
- App shell: tabs, dark mode, design tokens, `diettracker://` scheme, web manifest and service worker, SPA export verified on Cloudflare Pages.
- AsyncStorage stores: `activeWorkoutDraft`, `pendingWriteQueue`. Query persister.
- `/debug` route (dev only) with fixture injection. `testID` convention.
- Expo Go on your iPhone confirmed working against the hosted dev backend.

Agent workflow (§10)
- `CLAUDE.md`, hooks, skills (`run-web`, `db-reset`, `new-migration`, `new-feature`).
- Playwright MCP verified against the web build: navigate → interact → screenshot at phone and desktop viewports.
- CI: Biome, typecheck, Jest, `supabase test db`, Playwright smoke, web deploy with PR previews.
- `docs/tasks/` populated with Phase 1 slices.

**Phase 1 — MVP (usable daily on the phone)**
- Onboarding → targets summary → save.
- Diet: day view, meals, custom foods, quick add, recents/favorites, copy from yesterday, **recipe builder and save-meal-as-recipe**.
- Training: empty workouts, exercise picker, sets, previous performance, rest timer, draft/resume, history list.
- Weight log with trend. Today screen. JSON export. Installable PWA; Expo Go for native feel.

**Phase 2 — Parity**
- `food-search` and `barcode` Edge Functions, camera scanning on both platforms.
- Routines with folders, start-from-routine, update-routine-from-workout, supersets. Web Push rest timer.
- PRs, 1RM, exercise charts, weekly muscle volume, calendar.
- Day-type targets, recalculation prompts, measurements, Sign in with Apple.
- **First EAS build** → TestFlight. Apple Developer account purchased here.

**Phase 3 — Smarts and native**
- Adaptive targets. Trends screen. CSV export. Paste-to-recipe parsing.
- EAS dev client with HealthKit read/write.

**Phase 4 — Later**
- Live Activity, widget, MFP/Hevy import, progress photos, desktop web polish.

---

## 9. Remaining open points

1. Supabase region: pick the nearest (probably EU).
2. Cloudflare account for Pages hosting.
3. Sandbox: Docker's Unix socket for `supabase start`; Playwright browser cache inside the repo (`PLAYWRIGHT_BROWSERS_PATH`); pnpm store inside the repo if the default store is blocked; Metro dev server port 8081 reachable from your phone on the LAN for Expo Go.
4. Deno: install only if Edge Function unit tests are wanted locally.

---

## 10. Agentic development workflow

Principle: **every layer gives the agent fast, deterministic, machine-readable feedback; the slowest layer (a real browser) is touched last and least; iOS is verified by you on your phone, not by the agent.**

### Feedback loops, fastest first

| Layer | Command | Time | Verifies |
|---|---|---|---|
| Types + lint | `pnpm typecheck && pnpm lint` | seconds | Whole workspace. |
| Shared logic | `pnpm -F shared test` | seconds | Calculations, schemas, vectors. Most work stops here. |
| Components / hooks | `pnpm -F tracker test` (Jest + RNTL) | seconds | Rendering and behaviour with mocked Supabase, platform-agnostic. |
| Database | `pnpm db:reset && pnpm db:test` | ~10 s | Migrations, RLS, SQL functions vs vectors. |
| API | `curl` against local PostgREST / functions with the test user's JWT | seconds | Contracts the app depends on. |
| Web build | Playwright e2e, or Playwright MCP against `expo start --web`: navigate → act → screenshot | ~1 min | End-to-end on the real UI at phone and desktop viewports. |
| iOS | Expo Go on your iPhone | manual | Native feel, gestures, camera. You test; the agent cannot see it. |

### Conventions that make automation cheap

- **Routes are deep links** on both platforms: `/diary/2026-09-17`, `/workout/active`, `/recipes/new`, `/debug`. The agent navigates by URL, never by tapping through tabs.
- **`testID`** on every interactive element (renders as `data-testid` on web): `<screen>.<element>[.<index>]`, e.g. `diary.addFood`, `workout.set.3.reps`.
- **`/debug`** (dev only) with fixture injection: `empty`, `typicalDay`, `activeWorkout`, `eightWeeks`; reset local stores, force offline, replay queue.
- **Dev auto-login** as the seeded local user.
- **Platform splits are files, not branches**: `Scanner.tsx` / `Scanner.web.tsx`, never `Platform.OS` conditionals scattered through components. Keeps the web build fully testable.
- **Structured logging** via `log(scope, message, data?)`, prefix `[dt]`, filterable in Playwright console capture and in Metro output.
- **Idempotent mutations** keyed by client UUIDs.
- **Two Playwright projects**: `iphone` (390×844, touch) and `desktop`. Screenshots from both on UI changes.

### Repo tooling

- `CLAUDE.md`: exact commands, architecture rules, definition of done.
- Hooks: Biome format on every edited file; `pnpm typecheck && pnpm test` and `tracker check` on stop.
- Skills: `next-issue` (runs the loop below), `run-web`, `db-reset`, `new-migration`, `new-issue`.
- Agents: `code-reviewer`, `typescript-reviewer`, `security-reviewer` on anything touching auth, RLS, Edge Functions, or user input.
- CI: Biome, typecheck, Jest, `supabase test db`, `tracker check`, Playwright smoke, web export and deploy with previews.

### Tracking: the repo is the tracker

`[DECISION]` Issues and milestones live in `tracker/` as markdown files, not in GitHub Issues. Git history is the audit log. `scripts/tracker.mjs` validates the files, computes readiness from `blocked_by`, and regenerates `tracker/BOARD.md`. Full process in `tracker/README.md`.

- Milestones = phases from §8, each with an exit criterion. Issues for a milestone are written when it becomes current (M0 and M1 exist now).
- Issue = one vertical slice sized to a session: goal, scope, acceptance criteria as checkboxes, verification commands, verification log. `owner: human` marks the few things only Matheo can do (accounts, secrets, phone testing); they block dependents until done.
- The loop per issue: `next` → `start` → build against criteria, cheapest verification first → reviewer agents → definition of done → squash-merge to `main` → `done` → report. `/loop /next-issue` repeats it until `next` reports only human work remains.
- Disjoint issues (different `area`) run in parallel git worktrees.
- Merge policy: the agent merges its own branches when the definition of done holds; Matheo reviews `main` in batches. `review: human` in an issue's frontmatter gates it.
