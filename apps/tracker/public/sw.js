/* health-os service worker.
 * scripts/inject-pwa.mjs replaces the two placeholders below at build time with the exported
 * shell's file list and a hash of it, so every build gets its own cache and old ones are purged.
 *
 * Strategy (SPEC §5):
 *  - Shell (HTML, JS, CSS, fonts, icons, manifest): precached at install, served cache-first.
 *    Hashed asset filenames make this safe; index.html is refreshed on every online navigation.
 *  - Anything on another origin (Supabase API, Auth, external food APIs): network only, never
 *    cached. Auth responses in particular must never be stored.
 *  - Update flow: a new worker waits; the page shows "refresh to update" and asks us to
 *    skipWaiting on tap, then reloads on controllerchange.
 *  - Every cache write is kept alive with event.waitUntil: iOS Safari tears workers down
 *    aggressively once respondWith settles, and a detached put() may never complete.
 */
const BUILD = "__BUILD_HASH__";
const PRECACHE = __PRECACHE_LIST__;
const CACHE = `health-os-${BUILD}`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE.map((p) => new Request(p, { cache: "reload" })))),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k.startsWith("health-os-") && k !== CACHE).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

/** Store `res` under `key` only if it is a successful, non-opaque response. Returns the promise. */
function store(key, res) {
  if (!res.ok || res.type === "opaque") return Promise.resolve();
  const copy = res.clone();
  return caches.open(CACHE).then((cache) => cache.put(key, copy));
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Only handle http(s) on our own origin. Cross-origin (data, auth) and extension URLs are
  // left entirely to the network and never cached.
  if (url.origin !== self.location.origin) return;
  if (url.protocol !== "http:" && url.protocol !== "https:") return;
  // Range requests (media) are not cacheable as-is.
  if (req.headers.has("range")) return;

  // Navigations: network first so a fresh index.html wins when online; fall back to the shell.
  // Only a 2xx replaces the cached shell, so a 5xx or maintenance page can never become it.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          event.waitUntil(store("/index.html", res));
          return res;
        })
        .catch(() => caches.match("/index.html")),
    );
    return;
  }

  // Same-origin assets: cache first, then network (and cache the fresh copy for next time).
  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          event.waitUntil(store(req, res));
          return res;
        }),
    ),
  );
});
