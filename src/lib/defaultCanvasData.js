// Seed layout: three project columns, 5 slides each
// Slide dims: 460 × 290  |  col gap: 64  |  row gap: 20

const W = 460;
const H = 290;
const COL_GAP = 64;
const ROW_GAP = 20;
const START_X = 80;
const LABEL_Y = 52;
const START_Y = 116;

const col = (n) => START_X + n * (W + COL_GAP);
const row = (n) => START_Y + n * (H + ROW_GAP);

function img(id, src, col, row, z) {
  return { id, type: "image", src, x: col, y: row, w: W, h: H, rotation: 0, z };
}

function label(id, text, colX, color) {
  return {
    id,
    type: "text",
    text,
    x: colX,
    y: LABEL_Y,
    w: W,
    h: 48,
    rotation: 0,
    z: 100,
    fontSize: 11,
    color,
    bg: "transparent",
  };
}

// ── Slide image paths ────────────────────────────────────
// Full-page frame exports from the Figma case study deck (see
// caseStudies.ts's TC_SLIDE_*/SB_SLIDE_*/EH_SLIDE_* — same source images,
// duplicated here since this file has no import path back to that module).
const TC = [
  "/case-studies/slides/tcloud-01-context.png",
  "/case-studies/slides/tcloud-02-decisions.png",
  "/case-studies/slides/tcloud-03-widget-system.png",
  "/case-studies/slides/tcloud-04-hierarchy.png",
  "/case-studies/slides/tcloud-05-design-system.png",
];
const SB = [
  "/case-studies/slides/sb-01-context.png",
  "/case-studies/slides/sb-02-decisions.png",
  "/case-studies/slides/sb-03-payment-flow.png",
  "/case-studies/slides/sb-04-verification.png",
  "/case-studies/slides/sb-05-design-system.png",
];
const EH = [
  "/case-studies/slides/anthem-01-context.png",
  "/case-studies/slides/anthem-02-decisions.png",
  "/case-studies/slides/anthem-03-appointment-flow.png",
  "/case-studies/slides/anthem-04-getcare-flow.png",
  "/case-studies/slides/anthem-05-design-system.png",
];

export const DEFAULT_PAGE_ELEMENTS = [
  // Column labels
  label("lbl-tc", "01  ·  T-CLOUD DASHBOARD", col(0), "rgba(255,255,255,0.35)"),
  label("lbl-sb", "02  ·  STANDARD BANK",      col(1), "rgba(0,180,170,0.7)"),
  label("lbl-eh", "03  ·  FIND CARE EXPERIENCE", col(2), "rgba(124,106,247,0.7)"),

  // T-Cloud slides
  ...TC.map((src, i) => img(`tc-${i}`, src, col(0), row(i), i)),
  // Standard Bank slides
  ...SB.map((src, i) => img(`sb-${i}`, src, col(1), row(i), i)),
  // Elevance Health slides
  ...EH.map((src, i) => img(`eh-${i}`, src, col(2), row(i), i)),
];
