# health-os

Personal diet and training tracker: a food diary in the spirit of MyFitnessPal plus a workout logger in the spirit of Hevy, in one Expo app. Web first (installable as a PWA), iOS through Expo Go today and EAS builds later. Supabase backend. Single user, zero running cost.

- Spec: [`SPEC.md`](SPEC.md)
- Agent workflow and rules: [`CLAUDE.md`](CLAUDE.md)
- Issue tracker (in-repo): [`tracker/BOARD.md`](tracker/BOARD.md), process in [`tracker/README.md`](tracker/README.md)

## Getting started

```bash
pnpm install
pnpm lint && pnpm typecheck && pnpm test
pnpm tracker next          # what to work on
```

Database and app commands arrive with issues #003 and #006; see `CLAUDE.md` → Commands.

## Environment variables

Real values never enter the repo. Copy the relevant table into a `.env.development` (app) or `supabase/.env` (backend) file yourself. The agent cannot read `.env*` files, so this table is the source of truth for names and meanings.

### App (`apps/tracker/.env.development`, `.env.production` injected by CI)

| Variable | Meaning | Dev value |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase API URL | `http://127.0.0.1:54321` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (safe for clients; RLS protects data) | printed by `supabase start` |
| `EXPO_PUBLIC_DEV_AUTOLOGIN` | `1` to sign in automatically as the seeded test user (dev builds only) | `1` |
| `EXPO_PUBLIC_DEV_USER_EMAIL` | Seeded test user email | `test@local.dev` |
| `EXPO_PUBLIC_DEV_USER_PASSWORD` | Seeded test user password (local stack only) | see `supabase/seed.sql` |

### Backend (`supabase/.env`, and GitHub Actions secrets for CI)

| Variable | Meaning | Where |
|---|---|---|
| `SUPABASE_PROJECT_REF` | Hosted project ref | GitHub secret |
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI token for `db push` | GitHub secret |
| `SUPABASE_DB_PASSWORD` | Hosted database password | GitHub secret |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | Hosted values injected into the production web build | GitHub secrets |
| `SUPABASE_KEEPALIVE_URL` | Endpoint pinged twice weekly to prevent the free-tier pause | GitHub secret |
| `USDA_API_KEY` | FoodData Central key, used only by the `food-search` Edge Function | Supabase function secret (M2) |
| `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` | Pages deploy | GitHub secrets |

## Layout

```
apps/tracker/      Expo app (web + iOS)
packages/shared/   types, zod schemas, calculations
supabase/          migrations, seed, pgTAP tests, Edge Functions
tracker/           milestones and issues
scripts/           tracker CLI
docs/              decisions, test vectors, agent tooling to copy into .claude/
```
