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

// Developer Experience section — positioned well below the onboarding flow
// above (row 4 ends at y=1645) so the two persona/modules read as visually
// distinct sections, not a continuation of the same journey.
const DEV_TITLE_Y = 2050;
const HUB_Y = 2100;
const HUB_CX = 240; // horizontal center of the hub screen (x=60, w=360)
const SPOKE_Y = 2520;
const CHAIN_Y = 2940, CHAIN_CY = CHAIN_Y + H / 2;

export const MAIA_FLOW_ELEMENTS = [
  text("maia-title", "MAIA: First-Time User Onboarding", 60, 30, 1400, 44, 26, "#EDEAD4", 100),
  text("maia-subtitle", "Real screens from the Maia 2.0 prototype: requesting application access, an optional guided tour, and the resulting dashboard.", 60, 80, 1600, 28, 13, DIM, 100),

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

  // ── Developer Experience — a separate persona/module (the "Ankit
  // Brodiya" admin login vs. the onboarding flow's "Asha Chandran"), not a
  // continuation of the onboarding journey above. Real screens from the
  // "Developer Experience" section of the same Figma file (node
  // 4007:293292): a dev-facing dashboard hub fanning out into applications
  // (with its own drill-down + tabs), violations, resources, activities,
  // alerts, a "scope of work" switcher (Myself vs. Manager view of the same
  // screens), and a contribution marketplace. The source section has ~45
  // frames across these groups, mostly hover-state variants of the same
  // tables (e.g. 5 near-identical "Applications" hover states) — condensed
  // to one representative screen per meaningfully distinct destination.
  text("maia-dev-title", "Developer Experience: Application Management", 60, DEV_TITLE_Y, 1400, 32, 20, "#EDEAD4", 100),

  img("maia-dev-dashboard", `${BASE}/dev-dashboard.png`, 60, HUB_Y, W, H, 10),

  arrow("maia-arr-dev-apps", HUB_CX, HUB_Y + H, 240, SPOKE_Y, ACCENT),
  text("maia-lbl-dev-apps", "Applications tab", 60, SPOKE_Y - 30, 300, 20, 11, DIM),
  img("maia-dev-applications", `${BASE}/dev-applications.png`, 60, SPOKE_Y, W, H, 10),

  arrow("maia-arr-dev-violations", HUB_CX, HUB_Y + H, 660, SPOKE_Y, ACCENT),
  text("maia-lbl-dev-violations", "Open Violations", 480, SPOKE_Y - 30, 300, 20, 11, DIM),
  img("maia-dev-violations", `${BASE}/dev-violations.png`, 480, SPOKE_Y, W, H, 10),

  arrow("maia-arr-dev-resources", HUB_CX, HUB_Y + H, 1080, SPOKE_Y, ACCENT),
  text("maia-lbl-dev-resources", "Resources tab", 900, SPOKE_Y - 30, 300, 20, 11, DIM),
  img("maia-dev-resources", `${BASE}/dev-resources.png`, 900, SPOKE_Y, W, H, 10),

  arrow("maia-arr-dev-activities", HUB_CX, HUB_Y + H, 1500, SPOKE_Y, ACCENT),
  text("maia-lbl-dev-activities", "Activities tab", 1320, SPOKE_Y - 30, 300, 20, 11, DIM),
  img("maia-dev-activities", `${BASE}/dev-activities.png`, 1320, SPOKE_Y, W, H, 10),

  arrow("maia-arr-dev-alerts", HUB_CX, HUB_Y + H, 1920, SPOKE_Y, ACCENT),
  text("maia-lbl-dev-alerts", "Alerts", 1740, SPOKE_Y - 30, 300, 20, 11, DIM),
  img("maia-dev-alerts", `${BASE}/dev-alerts.png`, 1740, SPOKE_Y, W, H, 10),

  arrow("maia-arr-dev-scope", HUB_CX, HUB_Y + H, 2340, SPOKE_Y, ACCENT),
  text("maia-lbl-dev-scope", "Switch to Manager scope", 2160, SPOKE_Y - 30, 300, 20, 11, DIM),
  img("maia-dev-scope", `${BASE}/dev-scope-manager.png`, 2160, SPOKE_Y, W, H, 10),

  arrow("maia-arr-dev-contrib", HUB_CX, HUB_Y + H, 2760, SPOKE_Y, ACCENT),
  text("maia-lbl-dev-contrib", "MAIA Contribution Center", 2580, SPOKE_Y - 30, 300, 20, 11, DIM),
  img("maia-dev-contrib", `${BASE}/dev-contribution-center.png`, 2580, SPOKE_Y, W, H, 10),

  // Applications → detail drill-down chain, continuing straight down from
  // the Applications spoke rather than fanning out again.
  arrow("maia-arr-dev-app-detail", 240, SPOKE_Y + H, 240, CHAIN_Y, ACCENT),
  text("maia-lbl-dev-app-detail", "Open an application", 245, CHAIN_Y - 30, 250, 20, 10, DIM),
  img("maia-dev-app-overview", `${BASE}/dev-app-overview.png`, 60, CHAIN_Y, W, H, 10),

  arrow("maia-arr-dev-app-services", 420, CHAIN_CY, 480, CHAIN_CY, ACCENT),
  text("maia-lbl-dev-app-services", "App Services tab", 425, CHAIN_CY - 32, 200, 20, 10, DIM),
  img("maia-dev-app-services", `${BASE}/dev-app-services.png`, 480, CHAIN_Y, W, H, 10),
];

export function maiaFlowPage() {
  return { id: "maia-flow", name: "MAIA: Onboarding Flow", elements: MAIA_FLOW_ELEMENTS };
}
