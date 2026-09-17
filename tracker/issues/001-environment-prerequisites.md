---
id: 1
title: Dev-machine environment: accept sandbox constraints, set up per-session prerequisites
milestone: M0
status: todo
owner: human
area: [infra]
size: S
blocked_by: []
branch: ""
merged: ""
---

## Goal

The agent knows exactly what it can and cannot run on this machine, and the few things it cannot run are covered by you. Verified on 2026-09-17: the Bash sandbox is set by a higher-priority configuration and `/sandbox` cannot change it. Constraints found:

| Blocked in the sandbox | Consequence | Workaround |
|---|---|---|
| Loopback networking, both directions (`listen` and `connect` on 127.0.0.1 → EPERM) | No dev server, no Playwright against it, no `psql`/curl to local Supabase, from sandboxed Bash | Long-lived servers started by you with `!`; browser checks via the Playwright MCP server (runs outside the sandbox); DB commands unsandboxed with a prompt |
| Docker socket | Every `supabase` CLI command touching containers fails | Run unsandboxed (prompt) or via `!` |
| Reading `~/.gitconfig`, `~/.ssh`, `~/.npmrc`, `~/.config`; writing `.git/config` | Plain `git` fails; `git push` cannot use the SSH key | Git works with `GIT_CONFIG_GLOBAL=/dev/null` and identity passed per command; `push` runs unsandboxed |
| Any command containing `rm ` (PreToolUse hook) | The agent cannot delete files or containers | Agent never uses `rm`; asks you when deletion is genuinely needed |
| Reading `.env`, `.env.*`, `env*` | Agent can write env files but not read them back | Variables documented in `README.md`; values you add yourself |
| Writing `.claude/skills`, `.claude/hooks`, `.claude/settings.json` | Agent cannot install its own skills or hooks | Content lands in `docs/agent/`; you copy it (#014) |

Allowed and verified: file edits anywhere in the repo, `.git` objects/refs/index writes (commits), pnpm store under `~/claude_access/.pnpm-store`.

**Unverified:** npm registry egress. Node's `fetch` returned `ENOTFOUND` (it ignores proxy variables) and a `curl` test was not permitted. First real test is `pnpm install` in #002; if it fails, `pnpm install` runs via `!` and the agent works from the resulting `node_modules`.

## Scope

Your Claude Code configuration and Docker Desktop. Repo changes are in `CLAUDE.md` (done by the agent alongside this issue).

## Acceptance criteria

- [ ] Decide whether to keep the sandbox as is (the workarounds above are the plan) or relax it. To find the overriding source run `! grep -n -B2 -A30 '"sandbox"' ~/.claude/settings.json` and, if it is your own file rather than an org policy, allow loopback networking and the Docker socket there. Record the decision here.
- [ ] Fix `/mcp` so the Playwright plugin connects (it reported `CONNECTION_CLOSED`). This is the primary path for browser verification.
- [ ] In `.claude/settings.json`: fix the typo `Read(~./gitconfig)` → `Read(~/.gitconfig)`; remove the `peer-review` entries copied from another project (nothing here uses them).
- [ ] Docker Desktop running whenever a session touches the database.
- [ ] Per session once #003 and #006 exist: `! pnpm db:start` and `! pnpm -F tracker web` so the servers live outside the sandbox. Expect a permission prompt for each `git push` and each `supabase db reset` / `supabase test db`.

## Verification

Ask the agent to run `GIT_CONFIG_GLOBAL=/dev/null git status` sandboxed (must work) and to open `http://localhost:8081` through the Playwright MCP once #006 exists.

## Out of scope

Hosted accounts and secrets: #012.

## Verification log

- 2026-09-17 agent: `git status` with `GIT_CONFIG_GLOBAL=/dev/null` OK; `git hash-object -w`, `update-ref`, temp-index `add` OK; `git config --local` EPERM; `docker ps` socket missing; node `listen 127.0.0.1` EPERM; node `fetch 127.0.0.1` EPERM; Playwright MCP not connected this session.
