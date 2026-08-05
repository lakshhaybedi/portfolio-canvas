// Copies pdf.js's worker script into public/ so the PDF viewer can
// reference it by a plain static path (GlobalWorkerOptions.workerSrc =
// "/pdf.worker.min.mjs") instead of relying on webpack's asset-module
// resolution or a CDN. This is the most reliable option under Next's
// `output: "export"` static export and keeps the site fully self-contained.
// Wired as "postinstall" in package.json so it always matches whatever
// pdfjs-dist version react-pdf currently bundles.
import { copyFileSync, existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const src = join(root, "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs");
const destDir = join(root, "public");
const dest = join(destDir, "pdf.worker.min.mjs");

if (!existsSync(src)) {
  console.warn(`[copy-pdf-worker] source not found at ${src} — skipping (is react-pdf installed?)`);
  process.exit(0);
}

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.log(`[copy-pdf-worker] copied pdf.worker.min.mjs -> public/pdf.worker.min.mjs`);
