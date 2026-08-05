// One-off dev-time generator for placeholder PDFs — hand-rolled PDF bytes,
// no dependency needed (a single-page, single-font PDF is a small, fixed
// byte format). Run with `node scripts/generate-placeholder-pdfs.mjs`.
// Real files can replace these in public/documents/ later with no code
// changes elsewhere (src/lib/documents.ts just points at the same paths).
import { mkdirSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "documents");
mkdirSync(outDir, { recursive: true });

function escapePdfText(text) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

/**
 * Builds a minimal, valid single-page PDF as a Buffer. Tracks exact byte
 * offsets for every object (required for a correct xref table) rather than
 * guessing — each xref entry must be exactly 20 bytes: a 10-digit
 * zero-padded offset, a space, a 5-digit generation, a space, "n"/"f", and
 * a 2-byte EOL.
 */
function buildPdf({ title, subtitle, lines }) {
  const chunks = [];
  const offsets = [];
  let pos = 0;

  const push = (str) => {
    const buf = Buffer.from(str, "ascii");
    chunks.push(buf);
    pos += buf.length;
  };

  const beginObj = (num) => {
    offsets[num] = pos;
    push(`${num} 0 obj\n`);
  };

  push("%PDF-1.4\n");

  beginObj(1);
  push("<</Type /Catalog /Pages 2 0 R>>\nendobj\n");

  beginObj(2);
  push("<</Type /Pages /Kids [3 0 R] /Count 1>>\nendobj\n");

  beginObj(3);
  push(
    "<</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] " +
      "/Resources <</Font <</F1 4 0 R /F2 6 0 R>>>> /Contents 5 0 R>>\nendobj\n"
  );

  beginObj(4);
  push("<</Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold>>\nendobj\n");

  // Content stream: title in bold at the top, subtitle + body lines below
  // in the regular face. Coordinates are PDF units from the bottom-left of
  // a 612x792 (US Letter) page.
  const contentOps = [];
  contentOps.push("BT /F1 22 Tf 72 700 Td (" + escapePdfText(title) + ") Tj ET");
  contentOps.push("BT /F2 12 Tf 72 670 Td (" + escapePdfText(subtitle) + ") Tj ET");
  let y = 630;
  for (const line of lines) {
    contentOps.push(`BT /F2 11 Tf 72 ${y} Td (${escapePdfText(line)}) Tj ET`);
    y -= 20;
  }
  const content = contentOps.join("\n") + "\n";
  const contentLength = Buffer.byteLength(content, "ascii");

  beginObj(5);
  push(`<</Length ${contentLength}>>\nstream\n${content}endstream\nendobj\n`);

  beginObj(6);
  push("<</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>\nendobj\n");

  const xrefOffset = pos;
  const objectCount = 7; // objects 0 (free) through 6
  push(`xref\n0 ${objectCount}\n`);
  push("0000000000 65535 f \n");
  for (let i = 1; i < objectCount; i++) {
    push(`${String(offsets[i]).padStart(10, "0")} 00000 n \n`);
  }

  push(
    `trailer\n<</Size ${objectCount} /Root 1 0 R>>\nstartxref\n${xrefOffset}\n%%EOF`
  );

  return Buffer.concat(chunks);
}

const DOCS = [
  {
    file: "resume.pdf",
    title: "Resume.pdf",
    subtitle: "Placeholder document - replace with the real file.",
    lines: [
      "Lakshhay Bedi - Senior UX Designer",
      "This is a placeholder standing in for a real resume PDF.",
      "Drop the real file at public/documents/resume.pdf to replace it.",
    ],
  },
  {
    file: "ux-portfolio.pdf",
    title: "UX Portfolio.pdf",
    subtitle: "Placeholder document - replace with the real file.",
    lines: [
      "A curated selection of UX design case studies.",
      "This is a placeholder standing in for the real portfolio PDF.",
      "Drop the real file at public/documents/ux-portfolio.pdf to replace it.",
    ],
  },
  {
    file: "certificates.pdf",
    title: "Certificates.pdf",
    subtitle: "Placeholder document - replace with the real file.",
    lines: [
      "Professional certifications and credentials.",
      "This is a placeholder standing in for the real certificates PDF.",
      "Drop the real file at public/documents/certificates.pdf to replace it.",
    ],
  },
  {
    file: "case-studies.pdf",
    title: "Case Studies.pdf",
    subtitle: "Placeholder document - replace with the real file.",
    lines: [
      "In-depth breakdowns of selected projects.",
      "This is a placeholder standing in for the real case studies PDF.",
      "Drop the real file at public/documents/case-studies.pdf to replace it.",
    ],
  },
  {
    file: "awards.pdf",
    title: "Awards.pdf",
    subtitle: "Placeholder document - replace with the real file.",
    lines: [
      "Recognition and awards.",
      "This is a placeholder standing in for the real awards PDF.",
      "Drop the real file at public/documents/awards.pdf to replace it.",
    ],
  },
];

for (const doc of DOCS) {
  const buf = buildPdf(doc);
  writeFileSync(join(outDir, doc.file), buf);
  console.log(`wrote ${doc.file} (${buf.length} bytes)`);
}
