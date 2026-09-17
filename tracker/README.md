# Tracker

This directory is the project's issue tracker. No external service. Git history is the audit log.

```
tracker/
  README.md          this file: the process
  BOARD.md           generated overview, regenerate with `node scripts/tracker.mjs board`
  milestones/M*.md   one file per milestone: exit criterion, planned slices
  issues/NNN-*.md    one file per issue, frontmatter + body (see template below)
  TEMPLATE.md        copy this to create an issue
```

## Vocabulary

- **Milestone** = a phase from `SPEC.md` §8. Has an exit criterion. Issues are created for a milestone when it becomes current, not all up front (except M0 and M1, which exist now).
- **Issue** = one vertical slice sized for one agent session. Frontmatter fields:
  - `id` unique integer, zero-padded to 3 digits in filenames. M0 issues are 0xx, M1 are 1xx, and so on.
  - `status` one of `todo`, `in-progress`, `done`. Readiness is **computed**: an issue is ready when it is `todo` and every `blocked_by` id is `done`.
  - `owner` `agent` or `human`. Human issues are things only Matheo can do: accounts, secrets, testing on the phone. They surface in `humans` and block dependents until marked done.
  - `area` list from `db`, `shared`, `app`, `infra`, `docs`. Issues with disjoint areas may run in parallel.
  - `size` `S` (under an hour), `M` (a session), `L` (split if it grows).
  - `blocked_by` list of ids. `branch` and `merged` are filled by the script.

## Commands

```bash
node scripts/tracker.mjs check           # validate; run in CI and before every commit that touches tracker/
node scripts/tracker.mjs next            # what to work on now (prints the full issue)
node scripts/tracker.mjs ready M0        # everything unblocked in a milestone
node scripts/tracker.mjs humans          # what is waiting on Matheo
node scripts/tracker.mjs start 003       # claim an issue, get a branch name
node scripts/tracker.mjs done 003 a1b2c3 # close it with the merge commit
node scripts/tracker.mjs board           # regenerate BOARD.md
```

## The loop (one issue)

This is the procedure `/next-issue` follows. It must be the same every time.

1. **Pick.** `node scripts/tracker.mjs next`. If it exits 1, stop and report the human issues that are blocking.
2. **Claim.** `node scripts/tracker.mjs start <id>`. Create the branch it prints from `main` (in a worktree if another slice is in progress). Commit the tracker change on that branch.
3. **Read** the issue in full, plus the `SPEC.md` sections it names. Do not widen scope. If the acceptance criteria are wrong or impossible, edit the issue file and say why in the commit, then continue.
4. **Build** against the acceptance criteria, cheapest verification loop first (`CLAUDE.md` → Commands). Check off criteria in the issue file as they are met, with the command or screenshot that proved it.
5. **Review.** Run `typescript-reviewer` and `code-reviewer` on the diff. `security-reviewer` if the slice touches auth, RLS, Edge Functions, or user input. Fix what they find.
6. **Verify the definition of done** in `CLAUDE.md`. Record the actual result of each check in the issue's `## Verification log`, including "not verified on iOS".
7. **Merge.** Squash-merge into `main` with a conventional commit whose body lists the acceptance criteria met. `node scripts/tracker.mjs done <id> <sha>`, commit the tracker update on `main`, push, delete the branch.
8. **Report** in one short message: what shipped, what was skipped or is red, what just became ready.

Then go to 1. For a continuous run: `/loop /next-issue`. The loop stops by itself when `next` exits 1.

## Rules

- The issue file is the contract. Change it in the same commit if reality disagrees with it, never silently.
- One issue per branch. Nothing is committed to `main` directly except tracker bookkeeping and hotfixes labelled as such.
- `check` must pass before any commit touching `tracker/`.
- When a `[DECISION]` in `SPEC.md` needs to change, write `docs/decisions/NNN-title.md` first, then the issue.
- New work discovered mid-issue becomes a new issue file, not extra scope. Give it the next free id in the current milestone and set `blocked_by` honestly.
- Human issues get a comment in the body describing exactly what is needed and where to put it (which env var, which secret name).

## Merge policy

The agent merges its own branches when the definition of done holds. Matheo reviews `main` history in batches. To gate an issue on human review, add `review: human` to its frontmatter; the agent then stops at step 7 and reports instead of merging.
