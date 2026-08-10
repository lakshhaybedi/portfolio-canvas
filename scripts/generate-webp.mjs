#!/usr/bin/env node
/**
 * Generates a .webp sibling next to every .png/.jpg in public/.
 *
 * Nothing references these by path — `<Picture>` (src/components/Picture.tsx)
 * derives the .webp name from the original and offers it via a <source>, so
 * browsers that support WebP take it and everything else silently falls back
 * to the original file. That's why the originals stay: an old Safari on an
 * old Mac still gets a working image, it's just the larger one.
 *
 * Re-running is cheap — a .webp newer than its source is left alone, so this
 * only does work for images that were added or changed.
 *
 * Requires `cwebp` (brew install webp). Skipped silently if it's missing, so
 * a checkout without it still builds (just without the smaller variants).
 *
 *   node scripts/generate-webp.mjs [--force]
 */
import { execFileSync } from "node:child_process";
import { readdirSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

// fileURLToPath, not URL.pathname — the latter percent-encodes the spaces in
// this project's own directory name and then fails to open it.
const PUBLIC_DIR = fileURLToPath(new URL("../public/", import.meta.url));
const FORCE = process.argv.includes("--force");

// Visually lossless for UI screenshots and design work at a fraction of the
// bytes. Lower (75-80) starts softening fine text in the denser dashboard
// captures, which is most of what this portfolio is made of.
const QUALITY = 85;

try {
  execFileSync("cwebp", ["-version"], { stdio: "ignore" });
} catch {
  console.warn("cwebp not found — skipping WebP generation (brew install webp)");
  process.exit(0);
}

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

let converted = 0, skipped = 0, srcBytes = 0, outBytes = 0;

for (const file of walk(PUBLIC_DIR)) {
  const ext = extname(file).toLowerCase();
  if (![".png", ".jpg", ".jpeg"].includes(ext)) continue;

  const out = file.replace(/\.(png|jpe?g)$/i, ".webp");
  if (!FORCE && existsSync(out) && statSync(out).mtimeMs >= statSync(file).mtimeMs) {
    skipped++;
    continue;
  }

  execFileSync("cwebp", ["-q", String(QUALITY), "-quiet", "-metadata", "none", file, "-o", out]);
  srcBytes += statSync(file).size;
  outBytes += statSync(out).size;
  converted++;
}

const mb = (b) => (b / 1024 / 1024).toFixed(1);
console.log(`WebP: ${converted} converted, ${skipped} up to date`);
if (converted) {
  const saved = ((1 - outBytes / srcBytes) * 100).toFixed(0);
  console.log(`      ${mb(srcBytes)}MB source -> ${mb(outBytes)}MB webp (${saved}% smaller)`);
}
