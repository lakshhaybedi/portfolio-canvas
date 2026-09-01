// Page 7 seed: Guest Relations Rounds — how the sync actually works, told
// through five real screens (seeded demo data, not production KV) rather
// than a slide deck. There's no Figma file for this project — the process
// that matters here is the request → merge → poll loop, not a design
// system, so the flow follows that instead of the five-slide pattern the
// other pages use.

const ACCENT = "#E2793D"; // Guest Relations Rounds' case-study accent (warm amber)
const DIM = "rgba(237,234,212,0.5)";
const BASE = "/case-studies/guest-relations-rounds";

function img(id, src, x, y, w, h, z) {
  return { id, type: "image", src, x, y, w, h, rotation: 0, z };
}

function text(id, str, x, y, w, h, fontSize, color, z = 50) {
  return { id, type: "text", text: str, x, y, w, h, rotation: 0, z, fontSize, color, fill: "transparent" };
}

function arrow(id, x1, y1, x2, y2, stroke, z = 20) {
  const x = Math.min(x1, x2), y = Math.min(y1, y2);
  const w = Math.abs(x2 - x1), h = Math.abs(y2 - y1);
  return { id, type: "arrow", x, y, w, h, x1, y1, x2, y2, stroke, strokeWidth: 1.5, rotation: 0, z };
}

// Portrait screens (390:844), narrower columns than the landscape decks.
const W = 240;
const H = 518;
const Y = 160;
const CY = Y + H / 2;
const GAP = 160;
const CAP_W = 150;
const PITCH = W + GAP;
const X = (n) => 60 + n * PITCH;

export const GRR_FLOW_ELEMENTS = [
  text("grr-title", "Guest Relations Rounds: One Edit, Every Phone", 60, 30, 1600, 44, 26, "#EDEAD4", 100),
  text("grr-subtitle", "Five real screens from a seeded demo run (not production data) in the order a shift actually moves through them: today's round, a section mid-way through with a remark filed, the daily summary, the 30-day archive, and a second section picked up later in the shift.", 60, 80, 1600, 28, 13, DIM, 100),

  text("grr-lbl-0", "1. Today's Round", X(0), 130, W, 20, 12, DIM),
  img("grr-checklist", `${BASE}/01-checklist.png`, X(0), Y, W, H, 10),

  arrow("grr-arr-0", X(0) + W, CY, X(1), CY, ACCENT),
  text("grr-lbl-arr-0", "Tick a task, file a remark", X(0) + W + 5, CY - 40, CAP_W, 32, 11, DIM),

  text("grr-lbl-1", "2. Remark Filed", X(1), 130, W, 20, 12, DIM),
  img("grr-remarks", `${BASE}/02-remarks.png`, X(1), Y, W, H, 10),

  arrow("grr-arr-1", X(1) + W, CY, X(2), CY, ACCENT),
  text("grr-lbl-arr-1", "800ms debounce, push to KV", X(1) + W + 5, CY - 40, CAP_W, 32, 11, DIM),

  text("grr-lbl-2", "3. Daily Summary", X(2), 130, W, 20, 12, DIM),
  img("grr-summary", `${BASE}/03-summary.png`, X(2), Y, W, H, 10),

  arrow("grr-arr-2", X(2) + W, CY, X(3), CY, ACCENT),
  text("grr-lbl-arr-2", "Second phone polls every 20s", X(2) + W + 5, CY - 40, CAP_W, 32, 11, DIM),

  text("grr-lbl-3", "4. 30-Day Archive", X(3), 130, W, 20, 12, DIM),
  img("grr-archive", `${BASE}/04-archive.png`, X(3), Y, W, H, 10),

  arrow("grr-arr-3", X(3) + W, CY, X(4), CY, ACCENT),
  text("grr-lbl-arr-3", "Pending local edits always win", X(3) + W + 5, CY - 40, CAP_W, 32, 11, DIM),

  text("grr-lbl-4", "5. Next Section, Later in Shift", X(4), 130, W, 20, 12, DIM),
  img("grr-inprogress", `${BASE}/05-inprogress.png`, X(4), Y, W, H, 10),
];

export function guestRelationsFlowPage() {
  return { id: "guest-relations-rounds-flow", name: "Guest Relations Rounds: Sync Flow", elements: GRR_FLOW_ELEMENTS };
}
