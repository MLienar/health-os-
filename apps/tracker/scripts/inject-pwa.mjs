#!/usr/bin/env node
// Post-export step: turns the static Expo web export into an installable PWA.
//  1. Walks dist/ to build the precache list and a build hash, fills them into dist/sw.js.
//  2. Injects manifest link, theme-color (light/dark), Apple meta tags, and the worker
//     registration + "refresh to update" toast into dist/index.html.
// Zero dependencies. Usage: node scripts/inject-pwa.mjs [distDir]
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const dist = resolve(process.argv[2] ?? "dist");
const indexPath = join(dist, "index.html");
const swPath = join(dist, "sw.js");

if (!existsSync(indexPath) || !existsSync(swPath)) {
  console.error(
    "inject-pwa: dist/index.html or dist/sw.js missing. Run `expo export --platform web` first.",
  );
  process.exit(1);
}

// ---- 1. precache list ----
const SKIP = new Set(["sw.js", "metadata.json", "_redirects"]);
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full);
    else {
      const rel = relative(dist, full).split("\\").join("/");
      if (!SKIP.has(rel) && !rel.endsWith(".map")) files.push(`/${rel}`);
    }
  }
})(dist);
files.sort();

const hash = createHash("sha256");
for (const f of files) hash.update(f).update(readFileSync(join(dist, f.slice(1))));
const build = hash.digest("hex").slice(0, 12);

let sw = readFileSync(swPath, "utf8");
if (!sw.includes("__PRECACHE_LIST__") || !sw.includes("__BUILD_HASH__")) {
  console.error("inject-pwa: dist/sw.js has no placeholders; was it already injected?");
  process.exit(1);
}
sw = sw.replace("__BUILD_HASH__", build).replace("__PRECACHE_LIST__", JSON.stringify(files));
writeFileSync(swPath, sw);

// ---- 2. index.html ----
let html = readFileSync(indexPath, "utf8");
if (html.includes('rel="manifest"')) {
  console.error(
    "inject-pwa: dist/index.html already has a manifest link; refusing to inject twice.",
  );
  process.exit(1);
}

const head = `
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
    <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0b0f14" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="health-os" />
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="48x48" href="/icons/favicon-48.png" />
    <meta name="x-build" content="${build}" />`;

const script = `
    <script>
      (function () {
        if (!("serviceWorker" in navigator)) return;
        var toast;
        // Only reload on controllerchange when the user asked for the update. The first install
        // also fires controllerchange (clients.claim), and reloading then would be a jarring flash.
        var userRequestedUpdate = false;
        function showToast(worker) {
          if (toast) return;
          toast = document.createElement("button");
          toast.setAttribute("data-testid", "pwa.updateToast");
          toast.textContent = "Update available — tap to refresh";
          toast.style.cssText =
            "position:fixed;left:50%;bottom:calc(16px + env(safe-area-inset-bottom));transform:translateX(-50%);" +
            "z-index:9999;padding:10px 16px;border-radius:999px;border:0;background:#f59e0b;color:#0b0f14;" +
            "font:600 14px system-ui,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.35);cursor:pointer";
          toast.onclick = function () {
            userRequestedUpdate = true;
            worker.postMessage({ type: "SKIP_WAITING" });
          };
          document.body.appendChild(toast);
        }
        window.addEventListener("load", function () {
          navigator.serviceWorker.register("/sw.js").then(function (reg) {
            if (reg.waiting && navigator.serviceWorker.controller) showToast(reg.waiting);
            reg.addEventListener("updatefound", function () {
              var nw = reg.installing;
              if (!nw) return;
              nw.addEventListener("statechange", function () {
                if (nw.state === "installed" && navigator.serviceWorker.controller) showToast(nw);
              });
            });
          }).catch(function (err) { console.warn("[dt] pwa: registration failed", err); });
          var reloading = false;
          navigator.serviceWorker.addEventListener("controllerchange", function () {
            if (!userRequestedUpdate || reloading) return;
            reloading = true;
            window.location.reload();
          });
        });
      })();
    </script>`;

if (!html.includes("</head>") || !html.includes("</body>")) {
  console.error("inject-pwa: dist/index.html has no </head> or </body> marker; template changed?");
  process.exit(1);
}
html = html.replace("</head>", `${head}\n  </head>`).replace("</body>", `${script}\n  </body>`);
if (!html.includes('rel="manifest"') || !html.includes("serviceWorker.register")) {
  console.error("inject-pwa: injection did not take effect; refusing to write.");
  process.exit(1);
}
writeFileSync(indexPath, html);

console.log(`inject-pwa: build ${build}, ${files.length} files precached, index.html updated`);
