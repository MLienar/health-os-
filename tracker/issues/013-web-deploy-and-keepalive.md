---
id: 13
title: Deploy web build to Cloudflare Pages from CI, push migrations, enable keep-alive
milestone: M0
status: todo
owner: agent
area: [infra]
size: M
blocked_by: [10, 11, 12]
branch: ""
merged: ""
---

## Goal

Pushing to `main` publishes the web app and applies pending migrations to the hosted project; the free project never pauses. `SPEC.md` §2 hosting and keep-alive.

## Scope

`.github/workflows/deploy.yml`, `.github/workflows/keepalive.yml`, `apps/tracker/.env.production` template handling.

## Acceptance criteria

- [ ] `deploy.yml` on push to `main`, after `ci.yml` succeeds: `supabase db push` with the linked project, then `expo export --platform web` with production `EXPO_PUBLIC_*` values injected from secrets, then `wrangler pages deploy dist`.
- [ ] Branch pushes deploy a Cloudflare preview URL and the URL is printed in the job summary.
- [ ] `keepalive.yml` pings `SUPABASE_KEEPALIVE_URL` twice weekly and fails loudly (workflow red) on non-2xx.
- [ ] The deployed URL loads, sign-in with the hosted test user works, the PWA installs on an iPhone (Matheo confirms in #015).
- [ ] `README.md` gains the live URL.

## Verification

Link the green deploy run and the live URL in the log; open the live URL with Playwright once and screenshot Today.

## Out of scope

Custom domain. EAS builds.

## Verification log
