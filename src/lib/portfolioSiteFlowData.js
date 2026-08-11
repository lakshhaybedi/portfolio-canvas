// Page 6 seed: the Portfolio Site design-process flow, using the five
// slides from the Personal Deck (Figma page "23 · Case Study Decks") also
// shown as the "05 · PORTFOLIO SITE" column on the main Portfolio page —
// same source images, different presentation: a linear process flow with
// connecting arrows, matching how the other four projects' flow pages work.
// The other flows are user interaction flows through a shipped product;
// this project has no client and no such flow, so this one is the process
// flow instead — brief to shipped screens, the honest equivalent for a
// project where the "user" is a portfolio reader, not an app's operator.

const ACCENT = "#E3BE45"; // Portfolio Site's case-study accentText (gold)
const DIM = "rgba(237,234,212,0.5)";
const BASE = "/case-studies/slides";

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

const W = 380;
const H = 270; // matches the deck slides' 1440:1024 aspect ratio
const Y = 160;
const CY = Y + H / 2;
// Wide enough to hold a full-width caption (210px) with margin either side —
// a narrower gap here was the same bug the other flow pages had: captions
// like "Document the tokens" were wider than the space between slides, so
// their text spilled into the next slide.
const GAP = 220;
const CAP_W = 210;
const PITCH = W + GAP;
const X = (n) => 60 + n * PITCH;

export const PORTFOLIO_SITE_FLOW_ELEMENTS = [
  text("ps-title", "Portfolio Site: From Ideation to Ship", 60, 30, 1600, 44, 26, "#EDEAD4", 100),
  text("ps-subtitle", "The five slides from the personal deck, in the order the process actually ran: brief and inversion, tokens documented from the shipped product, the rebuilt final screens, and what I'd tell someone else doing this for the first time.", 60, 80, 1600, 28, 13, DIM, 100),

  text("ps-lbl-0", "1. Cover", X(0), 130, W, 20, 12, DIM),
  img("ps-cover", `${BASE}/portfolio-00-cover.png`, X(0), Y, W, H, 10),

  arrow("ps-arr-0", X(0) + W, CY, X(1), CY, ACCENT),
  text("ps-lbl-arr-0", "Frame the brief", X(0) + W + 5, CY - 32, CAP_W, 20, 11, DIM),

  text("ps-lbl-1", "2. Ideation", X(1), 130, W, 20, 12, DIM),
  img("ps-ideation", `${BASE}/portfolio-01-ideation.png`, X(1), Y, W, H, 10),

  arrow("ps-arr-1", X(1) + W, CY, X(2), CY, ACCENT),
  text("ps-lbl-arr-1", "Document the tokens", X(1) + W + 5, CY - 32, CAP_W, 20, 11, DIM),

  text("ps-lbl-2", "3. Design System", X(2), 130, W, 20, 12, DIM),
  img("ps-design-system", `${BASE}/portfolio-02-design-system.png`, X(2), Y, W, H, 10),

  arrow("ps-arr-2", X(2) + W, CY, X(3), CY, ACCENT),
  text("ps-lbl-arr-2", "Rebuild from tokens", X(2) + W + 5, CY - 32, CAP_W, 20, 11, DIM),

  text("ps-lbl-3", "4. Final Screens", X(3), 130, W, 20, 12, DIM),
  img("ps-final-screens", `${BASE}/portfolio-03-final-screens.png`, X(3), Y, W, H, 10),

  arrow("ps-arr-3", X(3) + W, CY, X(4), CY, ACCENT),
  text("ps-lbl-arr-3", "Look back", X(3) + W + 5, CY - 32, CAP_W, 20, 11, DIM),

  text("ps-lbl-4", "5. Reflection", X(4), 130, W, 20, 12, DIM),
  img("ps-reflection", `${BASE}/portfolio-04-reflection.png`, X(4), Y, W, H, 10),
];

export function portfolioSiteFlowPage() {
  return { id: "portfolio-site-flow", name: "Portfolio Site: Design Process", elements: PORTFOLIO_SITE_FLOW_ELEMENTS };
}
