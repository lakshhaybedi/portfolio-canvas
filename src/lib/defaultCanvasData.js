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

// ── CDN URLs ──────────────────────────────────────────────
const TC = [
  "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/4c99d97a-f62e-44f1-98b1-48808c3827af/1.png",
  "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/8cc2e4ee-373e-43c8-9c50-04603d0abdef/2.png",
  "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/07ddbcd7-a854-4935-8ddb-b97c6309c7aa/3.png",
  "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/e3b790ff-5453-4a62-8070-683d51b8cd1f/4.png",
  "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/6006386b-f801-447d-9c7b-53dba0cb6a0d/5.png",
];
const SB = [
  "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/e91f85ac-621e-4272-acd4-23aea05d6209/2301.png",
  "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/43a6e294-89e5-4e9d-829b-2771a697cded/2302.png",
  "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/a4792eaa-1035-4619-ac7d-9414ccd71819/2303.png",
  "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/1e4ced7a-f8a0-4676-9e89-1c30422cb3d2/2304.png",
  "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/af608b01-7d67-40f4-afde-31b73a4250f6/2305.png",
];
const EH = [
  "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/61452706-3c67-43a7-9255-1df9f1a239e9/2306.png",
  "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/40c65dac-78e6-4561-abd3-b01aead2378c/2307.png",
  "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/f8e103d9-4c9f-4b05-b23d-4b049cc91bdf/2308.png",
  "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/e5ff90fc-76ee-49ba-a7c2-af2d4ec3fb15/2309.png",
  "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/5f64a66d-9c97-4531-8de0-91735c22f9cc/2310.png",
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
