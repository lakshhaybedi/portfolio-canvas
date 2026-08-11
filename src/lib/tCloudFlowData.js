// Page 3 seed: the T-Cloud dashboard-building flow, using the same 4 real
// screens already shown on the /work/t-cloud case study page (see
// caseStudies.ts's TC_SCR_* constants) — not a branching task flow like
// Find Care's, T-Cloud is an operator building their own view, so this is a
// single linear path: empty state → add a widget → populated dashboard →
// drill into an asset.

const ACCENT = "#E62689"; // T-Cloud's case-study accent (T-Mobile magenta)
const DIM = "rgba(237,234,212,0.5)";
const BASE = "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b";

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

const W = 400;
const H = 252; // matches the case study's own 460:290 screen aspect ratio
const Y = 160;
const CY = Y + H / 2;
// Gap between screens is wide enough to hold a caption at its full declared
// width (210px) with a small margin on both sides — a narrower gap here was
// the original bug: captions like "[+ Add Widget]" were wider than the
// space between screens, so their text spilled into the next screen.
const GAP = 220;
const CAP_W = 210;
const PITCH = W + GAP;
const X = (n) => 60 + n * PITCH;

export const TCLOUD_FLOW_ELEMENTS = [
  text("tc-title", "T-Cloud Dashboard: Widget Flow", 60, 30, 1400, 44, 26, "#EDEAD4", 100),
  text("tc-subtitle", "Real screens from the T-Cloud case study: an operator building their own view from an empty dashboard.", 60, 80, 1400, 28, 13, DIM, 100),

  text("tc-lbl-1", "1. Empty state", X(0), 130, W, 20, 12, DIM),
  img("tc-empty", `${BASE}/4e2a76af-2f40-4473-b4f5-b137a8f67743/Dashboard_Screen_10.png`, X(0), Y, W, H, 10),

  arrow("tc-arr-1", X(0) + W, CY, X(1), CY, ACCENT),
  text("tc-lbl-arr-1", "[+ Add Widget]", X(0) + W + 5, CY - 32, CAP_W, 20, 11, DIM),

  text("tc-lbl-2", "2. Widget catalog", X(1), 130, W, 20, 12, DIM),
  img("tc-widget", `${BASE}/6e422788-d364-4f5b-94ef-f5bf55d78f7c/Dashboard_Screen_16.png`, X(1), Y, W, H, 10),

  arrow("tc-arr-2", X(1) + W, CY, X(2), CY, ACCENT),
  text("tc-lbl-arr-2", "Widgets added", X(1) + W + 5, CY - 32, CAP_W, 20, 11, DIM),

  text("tc-lbl-3", "3. Populated dashboard", X(2), 130, W, 20, 12, DIM),
  img("tc-main", `${BASE}/59614753-9ba1-4fb1-9ada-f220b20e09ce/Dashboard_Screen_1.png`, X(2), Y, W, H, 10),

  arrow("tc-arr-3", X(2) + W, CY, X(3), CY, ACCENT),
  text("tc-lbl-arr-3", "View asset details", X(2) + W + 5, CY - 32, CAP_W, 20, 11, DIM),

  text("tc-lbl-4", "4. Asset drill-down", X(3), 130, W, 20, 12, DIM),
  img("tc-asset", `${BASE}/657743f8-1d8d-4a23-b0a3-64e3533e511d/Security_360-Overview.png`, X(3), Y, W, H, 10),
];

export function tCloudFlowPage() {
  return { id: "tcloud-flow", name: "T-Cloud: Widget Flow", elements: TCLOUD_FLOW_ELEMENTS };
}
