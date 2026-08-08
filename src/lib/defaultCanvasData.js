// Seed layout: four project columns, full Figma slide decks (variable
// slide count per project — each column is as tall as its own deck).
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
// Each array is the project's complete deck, in Figma frame order, minus
// the two pure section-divider frames ("Part Two/The Work", "Part
// Three/The Outcome") which are chapter breaks rather than designed slides.
// "Part Two / The Work" and "Part Three / The Outcome" section-divider
// frames are included here — full decks means every named frame in the
// Figma sequence, not just the content slides either side of them.
const TC = [
  "/case-studies/slides/tcloud-01-cover.png",
  "/case-studies/slides/tcloud-02-context.png",
  "/case-studies/slides/tcloud-03-approach.png",
  "/case-studies/slides/tcloud-04-decisions.png",
  "/case-studies/slides/tcloud-05-part-two.png",
  "/case-studies/slides/tcloud-06-widget-system.png",
  "/case-studies/slides/tcloud-07-hierarchy.png",
  "/case-studies/slides/tcloud-08-surfaces.png",
  "/case-studies/slides/tcloud-09-part-three.png",
  "/case-studies/slides/tcloud-10-outcomes.png",
  "/case-studies/slides/tcloud-11-insights.png",
  "/case-studies/slides/tcloud-12-design-system.png",
];
const SB = [
  "/case-studies/slides/sb-01-cover.png",
  "/case-studies/slides/sb-02-context.png",
  "/case-studies/slides/sb-03-approach.png",
  "/case-studies/slides/sb-04-decisions.png",
  "/case-studies/slides/sb-05-part-two.png",
  "/case-studies/slides/sb-06-flow-architecture.png",
  "/case-studies/slides/sb-07-payment-flow.png",
  "/case-studies/slides/sb-08-verification.png",
  "/case-studies/slides/sb-09-market-modularity.png",
  "/case-studies/slides/sb-10-part-three.png",
  "/case-studies/slides/sb-11-outcomes.png",
  "/case-studies/slides/sb-12-insights.png",
  "/case-studies/slides/sb-13-design-system.png",
];
const EH = [
  "/case-studies/slides/anthem-01-cover.png",
  "/case-studies/slides/anthem-02-context.png",
  "/case-studies/slides/anthem-03-approach.png",
  "/case-studies/slides/anthem-04-decisions.png",
  "/case-studies/slides/anthem-05-part-two.png",
  "/case-studies/slides/anthem-06-findcare-architecture.png",
  "/case-studies/slides/anthem-07-appointment-flow.png",
  "/case-studies/slides/anthem-08-getcare-flow.png",
  "/case-studies/slides/anthem-09-part-three.png",
  "/case-studies/slides/anthem-10-outcomes.png",
  "/case-studies/slides/anthem-11-insights.png",
  "/case-studies/slides/anthem-12-design-system.png",
];
const MI = [
  "/case-studies/slides/maia-01-cover.png",
  "/case-studies/slides/maia-02-context.png",
  "/case-studies/slides/maia-03-approach.png",
  "/case-studies/slides/maia-04-decisions.png",
  "/case-studies/slides/maia-05-constraints.png",
  "/case-studies/slides/maia-06-part-two.png",
  "/case-studies/slides/maia-07-first-time-user.png",
  "/case-studies/slides/maia-08-virtual-tour.png",
  "/case-studies/slides/maia-09-core-platform.png",
  "/case-studies/slides/maia-10-data-density.png",
  "/case-studies/slides/maia-11-supporting-systems.png",
  "/case-studies/slides/maia-12-part-three.png",
  "/case-studies/slides/maia-13-outcomes.png",
  "/case-studies/slides/maia-14-insights.png",
  "/case-studies/slides/maia-15-design-system.png",
];

export const DEFAULT_PAGE_ELEMENTS = [
  // Column labels
  label("lbl-tc", "01  ·  T-CLOUD DASHBOARD", col(0), "rgba(255,255,255,0.35)"),
  label("lbl-sb", "02  ·  STANDARD BANK",      col(1), "rgba(0,180,170,0.7)"),
  label("lbl-eh", "03  ·  FIND CARE EXPERIENCE", col(2), "rgba(124,106,247,0.7)"),
  label("lbl-mi", "04  ·  MAIA",               col(3), "rgba(255,140,66,0.7)"),

  // T-Cloud deck
  ...TC.map((src, i) => img(`tc-${i}`, src, col(0), row(i), i)),
  // Standard Bank deck
  ...SB.map((src, i) => img(`sb-${i}`, src, col(1), row(i), i)),
  // Elevance Health / Find Care deck
  ...EH.map((src, i) => img(`eh-${i}`, src, col(2), row(i), i)),
  // MAIA deck
  ...MI.map((src, i) => img(`mi-${i}`, src, col(3), row(i), i)),
];
