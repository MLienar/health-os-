---
id: 8
title: Offline safety net: active workout draft, pending write queue, query persister
milestone: M0
status: todo
owner: agent
area: [app]
size: M
blocked_by: [7]
branch: ""
merged: ""
---

## Goal

The two mechanisms from `SPEC.md` §5 exist and are tested before any feature depends on them: a draft store for the active workout and a replayable queue for failed mutations, plus offline display of cached reads.

## Scope

`apps/tracker/src/lib/offline/` (draft store, write queue, connectivity, persister), `src/lib/queryClient.ts` wiring, tests.

## Acceptance criteria

- [ ] `draftStore` persists a `WorkoutDraft` to AsyncStorage on every `set()`, debounced at most 250 ms, and `load()` returns it after a simulated reload. Schema-versioned with a migration hook.
- [ ] `writeQueue.enqueue(mutation)` appends `{ id, table, op: 'upsert'|'softDelete', payload, createdAt }`; `replay()` sends in order, removes on success, stops on the first network failure, and drops with a logged warning on a non-network 4xx after 3 attempts.
- [ ] A `useMutationWithQueue` helper wraps TanStack mutations: optimistic update, and on network error enqueue instead of rollback.
- [ ] Connectivity: `NetInfo` on native, `online`/`offline` events on web (file suffix split); `replay()` runs on reconnect and on app foreground.
- [ ] TanStack Query persister to AsyncStorage for read caches; `useIsOffline()` hook drives an "offline" pill in the tab shell header.
- [ ] Jest tests cover: draft round-trip, queue ordering, stop-on-network-failure, drop-after-3, replay-on-reconnect. Supabase is mocked.
- [ ] Playwright: with the browser set offline, adding a queued mutation from `/debug` (stub until #009) shows the pill; going online drains the queue (asserted via the log).

## Verification

```bash
pnpm -F tracker test -- offline && pnpm -F tracker e2e -- --grep offline
```

## Out of scope

Any UI beyond the pill. Conflict resolution (deliberately not built, §5).

## Verification log
