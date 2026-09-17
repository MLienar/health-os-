# Foundations and agentic tooling

**Exit criterion:** a fresh clone can run `pnpm install && pnpm db:start && pnpm db:reset && pnpm test && pnpm -F tracker web`, log in as the seeded user on the web build, see the tab shell in dark mode, and `/debug` can inject a fixture. CI is green on `main`, the web build deploys to Cloudflare Pages on push, and Expo Go on the phone shows the same shell against the hosted backend.

**Spec:** `SPEC.md` §2, §5, §8 Phase 0, §10.

## Issues

Created in `tracker/issues/0xx-*.md`. Rough order: environment → workspace → database → shared → app shell → auth → offline plumbing → debug → PWA → CI → deploy → agent tooling → phone check.

## Not in this milestone

Any user-visible feature. Screens are placeholders with the correct route and `testID` only.
