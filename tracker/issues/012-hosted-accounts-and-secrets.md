---
id: 12
title: Hosted Supabase project, Cloudflare Pages project, GitHub secrets
milestone: M0
status: todo
owner: human
area: [infra]
size: S
blocked_by: [3]
branch: ""
merged: ""
---

## Goal

The production backend and hosting exist so the web build can deploy and the phone can use the app away from the laptop. Only Matheo can create these accounts.

## Scope

External services and GitHub repository secrets. No repo files except `supabase/.env.example` updates if a variable name changes.

## Acceptance criteria

- [ ] Supabase project created on the free tier in an EU region. Email confirmations disabled (single user). Note the project ref, URL, and anon key.
- [ ] `supabase link --project-ref <ref>` run once locally and `supabase db push` applied the migrations from #003. Test user created in the hosted project with a strong password (not the local one).
- [ ] Cloudflare account with a Pages project named `health-os` (direct upload mode, deployed from CI, not from Git integration). API token with Pages edit scope created.
- [ ] GitHub repository secrets set: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `SUPABASE_KEEPALIVE_URL` (the REST URL of a tiny public view or the auth health endpoint).
- [ ] Nothing secret pasted into this repo or into the chat; the agent only needs the secret **names**.

## Verification

Tell the agent it is done; #013 will prove it by deploying.

## Out of scope

Apple Developer, Expo account, USDA key (M2 human issue).

## Verification log
