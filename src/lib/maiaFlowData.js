// Page 5 seed: MAIA's first-time-user onboarding flow — the platform
// T-Cloud's own case study says it's "built on" (see caseStudies.ts). Real
// screens pulled from the "First Time User" section of the Maia 2.0 Figma
// file (node 4007:248701): request access to applications, an optional
// guided product tour, then the resulting dashboard and its sections.
//
// The tour is genuinely 13 sequential tooltip screens in the source file —
// shown condensed here (4 representative steps) since most of them are
// near-identical tooltip overlays on the same dashboard; the onboarding
// wizard and destination screens are kept in full since each is visually
// and functionally distinct.

const ACCENT = "#E91E8C"; // MAIA's own brand pink/magenta
const DIM = "rgba(237,234,212,0.5)";
const BASE = "/canvas-flow/maia";

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

const W = 360;
const H = 225; // 1728×1080 source, 1.6:1
const ROW1_Y = 160, ROW1_CY = ROW1_Y + H / 2;
const ROW2_Y = 580, ROW2_CY = ROW2_Y + H / 2;
const ROW3_Y = 1000, ROW3_CY = ROW3_Y + H / 2;
const ROW4_Y = 1420;

export const MAIA_FLOW_ELEMENTS = [
  text("maia-title", "MAIA — First-Time User Onboarding", 60, 30, 1400, 44, 26, "#EDEAD4", 100),
  text("maia-subtitle", "Real screens from the Maia 2.0 prototype — requesting application access, an optional guided tour, and the resulting dashboard.", 60, 80, 1600, 28, 13, DIM, 100),

  // ── Row 1: onboarding wizard ────────────────────────────────
  text("maia-lbl-onboarding", "Onboarding wizard", 60, 130, 400, 20, 13, ACCENT),
  img("maia-welcome", `${BASE}/welcome.png`, 60, ROW1_Y, W, H, 10),
  arrow("maia-arr-1", 420, ROW1_CY, 480, ROW1_CY, ACCENT),
  text("maia-lbl-arr-1", "Reference Team Member", 425, ROW1_CY - 32, 220, 20, 10, DIM),

  img("maia-ref-empty", `${BASE}/reference-team-empty.png`, 480, ROW1_Y, W, H, 10),
  arrow("maia-arr-2", 840, ROW1_CY, 900, ROW1_CY, ACCENT),
  text("maia-lbl-arr-2", "Email entered", 845, ROW1_CY - 32, 200, 20, 10, DIM),

  img("maia-ref-filled", `${BASE}/reference-team-filled.png`, 900, ROW1_Y, W, H, 10),
  arrow("maia-arr-3", 1260, ROW1_CY, 1320, ROW1_CY, ACCENT),
  text("maia-lbl-arr-3", "All Applications", 1265, ROW1_CY - 32, 200, 20, 10, DIM),

  img("maia-all-apps", `${BASE}/all-applications.png`, 1320, ROW1_Y, W, H, 10),
  arrow("maia-arr-4", 1680, ROW1_CY, 1740, ROW1_CY, ACCENT),
  text("maia-lbl-arr-4", "Request access", 1685, ROW1_CY - 32, 200, 20, 10, DIM),

  img("maia-config-complete", `${BASE}/configuration-complete.png`, 1740, ROW1_Y, W, H, 10),

  // ── Three branches from "Configuration Complete" ────────────
  arrow("maia-arr-branch-devtools", 1920, ROW1_Y + H, 240, ROW2_Y, ACCENT),
  text("maia-lbl-branch-devtools", "Developer tools & resources", 60, ROW2_Y - 30, 300, 20, 11, DIM),
  text("maia-lbl-devtools", "Branch: dev tools", 60, ROW2_Y - 50, 300, 20, 13, ACCENT),
  img("maia-devtools", `${BASE}/developer-tools.png`, 60, ROW2_Y, W, H, 10),

  arrow("maia-arr-branch-tour", 1920, ROW1_Y + H, 660, ROW2_Y, ACCENT),
  text("maia-lbl-branch-tour", "Dashboard + virtual walkthrough", 480, ROW2_Y - 30, 320, 20, 11, DIM),
  text("maia-lbl-tour", "Branch: guided tour (13 steps, condensed to 4)", 480, ROW2_Y - 50, 500, 20, 13, ACCENT),

  arrow("maia-arr-branch-reslib", 1920, ROW1_Y + H, 2340, ROW2_Y, ACCENT),
  text("maia-lbl-branch-reslib", "Learn more about MAIA", 2160, ROW2_Y - 30, 300, 20, 11, DIM),
  text("maia-lbl-reslib", "Branch: resource library", 2160, ROW2_Y - 50, 300, 20, 13, ACCENT),
  img("maia-reslib", `${BASE}/resource-library.png`, 2160, ROW2_Y, W, H, 10),

  // ── Row 2: condensed tour sequence ───────────────────────────
  img("maia-tour-1", `${BASE}/tour-1.png`, 480, ROW2_Y, W, H, 10),
  arrow("maia-arr-tour-1", 840, ROW2_CY, 900, ROW2_CY, ACCENT),
  img("maia-tour-5", `${BASE}/tour-5.png`, 900, ROW2_Y, W, H, 10),
  arrow("maia-arr-tour-2", 1260, ROW2_CY, 1320, ROW2_CY, ACCENT),
  text("maia-lbl-tour-condensed", "9 steps condensed", 1130, ROW2_CY - 32, 160, 20, 10, DIM),
  img("maia-tour-9", `${BASE}/tour-9.png`, 1320, ROW2_Y, W, H, 10),
  arrow("maia-arr-tour-3", 1680, ROW2_CY, 1740, ROW2_CY, ACCENT),
  img("maia-tour-13", `${BASE}/tour-13.png`, 1740, ROW2_Y, W, H, 10),
  text("maia-lbl-tour-done", "Tour complete", 1745, ROW2_Y + H + 6, 200, 20, 10, DIM),

  // ── Row 3: dashboard before/after access ─────────────────────
  arrow("maia-arr-tour-to-dash", 1920, ROW2_Y + H, 660, ROW3_Y, ACCENT),
  text("maia-lbl-dashboards", "Dashboard", 480, ROW3_Y - 30, 400, 20, 13, ACCENT),
  img("maia-dash-empty", `${BASE}/dashboard-empty.png`, 480, ROW3_Y, W, H, 10),
  text("maia-lbl-dash-empty", "Before access is granted", 485, ROW3_Y + H + 6, 250, 20, 10, DIM),
  arrow("maia-arr-dash", 840, ROW3_CY, 900, ROW3_CY, ACCENT),
  text("maia-lbl-arr-dash", "Access granted", 845, ROW3_CY - 32, 200, 20, 10, DIM),
  img("maia-dash-full", `${BASE}/dashboard-populated.png`, 900, ROW3_Y, W, H, 10),
  text("maia-lbl-dash-full", "Populated dashboard", 905, ROW3_Y + H + 6, 250, 20, 10, DIM),

  // ── Row 4: dashboard tab destinations ─────────────────────────
  arrow("maia-arr-dash-apps", 1080, ROW3_Y + H, 240, ROW4_Y, ACCENT),
  text("maia-lbl-dash-apps", "Applications tab", 60, ROW4_Y - 30, 300, 20, 11, DIM),
  img("maia-applications", `${BASE}/applications.png`, 60, ROW4_Y, W, H, 10),

  arrow("maia-arr-dash-event", 1080, ROW3_Y + H, 660, ROW4_Y, ACCENT),
  text("maia-lbl-dash-event", "Event details", 480, ROW4_Y - 30, 300, 20, 11, DIM),
  img("maia-event-details", `${BASE}/event-details.png`, 480, ROW4_Y, W, H, 10),

  arrow("maia-arr-dash-resources", 1080, ROW3_Y + H, 1080, ROW4_Y, ACCENT),
  text("maia-lbl-dash-resources", "Resources tab", 900, ROW4_Y - 30, 300, 20, 11, DIM),
  img("maia-resources", `${BASE}/resources.png`, 900, ROW4_Y, W, H, 10),

  arrow("maia-arr-dash-activities", 1080, ROW3_Y + H, 1500, ROW4_Y, ACCENT),
  text("maia-lbl-dash-activities", "Activities tab", 1320, ROW4_Y - 30, 300, 20, 11, DIM),
  img("maia-activities", `${BASE}/activities.png`, 1320, ROW4_Y, W, H, 10),

  arrow("maia-arr-dash-alerts", 1080, ROW3_Y + H, 1920, ROW4_Y, ACCENT),
  text("maia-lbl-dash-alerts", "Alerts", 1740, ROW4_Y - 30, 300, 20, 11, DIM),
  img("maia-alerts", `${BASE}/alerts.png`, 1740, ROW4_Y, W, H, 10),
];

export function maiaFlowPage() {
  return { id: "maia-flow", name: "MAIA — Onboarding Flow", elements: MAIA_FLOW_ELEMENTS };
}
