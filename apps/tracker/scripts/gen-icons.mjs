#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
// Generates the app icons as PNGs with no dependencies: a dark rounded square with an amber
// "calories" ring and a blue "protein" dot. Deterministic, so the output is committed and stable.
// Usage: node scripts/gen-icons.mjs
import { deflateSync } from "node:zlib";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const BG = [0x0b, 0x0f, 0x14];
const RING = [0xf5, 0x9e, 0x0b];
const DOT = [0x3b, 0x82, 0xf6];

/** Returns [r,g,b,a] for pixel (x,y) on a size×size canvas, supersampled for smooth edges. */
function shade(x, y, size, { transparentCorners }) {
  const SS = 3;
  let r = 0;
  let g = 0;
  let b = 0;
  let a = 0;
  for (let i = 0; i < SS; i++) {
    for (let j = 0; j < SS; j++) {
      const px = x + (i + 0.5) / SS;
      const py = y + (j + 0.5) / SS;
      const [cr, cg, cb, ca] = sample(px, py, size, transparentCorners);
      r += cr;
      g += cg;
      b += cb;
      a += ca;
    }
  }
  const n = SS * SS;
  return [r / n, g / n, b / n, a / n].map(Math.round);
}

function sample(px, py, size, transparentCorners) {
  const c = size / 2;
  const radius = size * 0.22;
  // Rounded-square mask (only when corners should be transparent, e.g. favicon).
  if (transparentCorners) {
    const dx = Math.max(Math.abs(px - c) - (c - radius), 0);
    const dy = Math.max(Math.abs(py - c) - (c - radius), 0);
    if (dx * dx + dy * dy > radius * radius) return [0, 0, 0, 0];
  }
  const dx = px - c;
  const dy = py - c;
  const d = Math.hypot(dx, dy);
  const ringR = size * 0.3;
  const ringW = size * 0.085;
  // Ring with a gap at the top-right (an "in progress" arc), like the kcal ring on Today.
  const angle = Math.atan2(dy, dx); // -PI..PI, 0 = right, -PI/2 = up
  const inGap = angle > -Math.PI / 2 && angle < -Math.PI / 2 + Math.PI * 0.35;
  if (Math.abs(d - ringR) <= ringW / 2 && !inGap) return [...RING, 255];
  // Protein dot at the arc end.
  const endAngle = -Math.PI / 2 + Math.PI * 0.35;
  const ex = c + Math.cos(endAngle) * ringR;
  const ey = c + Math.sin(endAngle) * ringR;
  if (Math.hypot(px - ex, py - ey) <= ringW * 0.62) return [...DOT, 255];
  return [...BG, 255];
}

// ---- PNG encoding ----
const CRC_TABLE = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
function crc32(buf) {
  let c = -1;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}
function png(size, opts) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = shade(x, y, size, opts);
      const o = y * (size * 4 + 1) + 1 + x * 4;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
      raw[o + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const outputs = [
  // PWA icons: opaque (maskable-safe: the ring sits well inside the 80% safe zone).
  ["public/icons/icon-192.png", 192, { transparentCorners: false }],
  ["public/icons/icon-512.png", 512, { transparentCorners: false }],
  ["public/icons/apple-touch-icon.png", 180, { transparentCorners: false }],
  ["public/icons/favicon-48.png", 48, { transparentCorners: true }],
  // Native app icon for EAS builds (referenced from app.json). iOS applies its own mask.
  ["assets/icon.png", 1024, { transparentCorners: false }],
  ["assets/favicon.png", 48, { transparentCorners: true }],
];

for (const [rel, size, opts] of outputs) {
  const file = join(ROOT, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, png(size, opts));
  console.log(`wrote ${rel} (${size}px)`);
}
