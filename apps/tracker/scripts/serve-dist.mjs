#!/usr/bin/env node
// Minimal static server for the exported web build with SPA fallback, used by Playwright and CI.
// Zero dependencies. Usage: node scripts/serve-dist.mjs [port] [dir]
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const port = Number(process.argv[2] ?? process.env.PORT ?? 4173);
const root = resolve(process.argv[3] ?? "dist");

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".map": "application/json",
};

if (!existsSync(root)) {
  console.error(`serve-dist: ${root} does not exist. Run the web export first.`);
  process.exit(1);
}

createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  let file = join(root, normalize(decodeURIComponent(url.pathname)));
  if (!file.startsWith(root)) {
    res.writeHead(403).end();
    return;
  }
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(root, "index.html");
  res.writeHead(200, {
    "content-type": types[extname(file)] ?? "application/octet-stream",
    "cache-control": "no-store",
  });
  createReadStream(file).pipe(res);
}).listen(port, "127.0.0.1", () => {
  console.log(`serve-dist: http://127.0.0.1:${port} -> ${root}`);
});
