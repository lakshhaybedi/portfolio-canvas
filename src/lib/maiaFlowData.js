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
//
// Branch points route through a dedicated horizontal "channel" — a band
// with no labels or images in it, sitting between the label row above and
// the image row below — rather than drawing a single diagonal line from
// the fan-out origin straight to each destination. A shared point fanning
// out to destinations spread across the full width means a straight line
// to the far ones sweeps directly through whatever labels sit in the
// middle; routing trunk-then-branch through a clear channel avoids that
// regardless of how far apart the destinations are.

const ACCENT = "#E91E8C"; // MAIA's own brand pink/magenta
const DIM = "rgba(237,234,212,0.5)";
const BASE = "/canvas-flow/maia";

function img(id, src, x, y, w, h, z) {
  return { id, type: "image", src, x, y, w, h, rotation: 0, z };
}

function text(id, str, x, y, w, h, fontSize, color, z = 50) {
  return { id, type: "text", text: str, x, y, w, h, rotation: 0, z, fontSize, color, fill: "transparent" };
}

function arrow(id, x1, y1, x2, y2, stroke, z = 20, showHead = true) {
  const x = Math.min(x1, x2), y = Math.min(y1, y2);
  const w = Math.abs(x2 - x1), h = Math.abs(y2 - y1);
  return { id, type: "arrow", x, y, w, h, x1, y1, x2, y2, stroke, strokeWidth: 1.5, rotation: 0, z, showHead };
}

// A trunk (no arrowhead) down to a clear channel, then one branch per
// destination (arrowhead) — never a single diagonal from origin to a
// far-off destination.
function fanOut(prefix, originX, originY, channelY, destinations, stroke) {
  const els = [arrow(`${prefix}-trunk`, originX, originY, originX, channelY, stroke, 20, false)];
  destinations.forEach(({ id, x, y }) => {
    els.push(arrow(`${prefix}-h-${id}`, originX, channelY, x, channelY, stroke, 20, false));
    els.push(arrow(`${prefix}-v-${id}`, x, channelY, x, y, stroke, 20, true));
  });
  return els;
}

const W = 360;
const H = 225; // 1728×1080 source, 1.6:1

// ── Row 1: onboarding wizard ──────────────────────────────────
// Gap widened so inline arrow captions (e.g. "Reference Team Member") have
// room to sit without spilling into the next screen — the original 60px
// gap was narrower than several of these captions.
const ROW1_Y = 160, ROW1_BOT = ROW1_Y + H, ROW1_CY = ROW1_Y + H / 2;
const ROW1_GAP = 240;
const ROW1_PITCH = W + ROW1_GAP;
const ROW1_X = (n) => 60 + n * ROW1_PITCH;
const ROW1_CAP_W = 210;

// ── Branch channel (row 1 → the three onboarding branches) ─────
const BR1_LBL_Y = 425, BR1_LBL2_Y = 452; // "Branch: X" / description, stacked
const BR1_CHANNEL_Y = 500;
const ROW2_Y = 560, ROW2_BOT = ROW2_Y + H, ROW2_CY = ROW2_Y + H / 2;

const DEV_X = 60, DEV_CX = DEV_X + W / 2;
const TOUR_X0 = 660, TOUR_CX = TOUR_X0 + W / 2;
const RESLIB_X = 2880, RESLIB_CX = RESLIB_X + W / 2;
const CONFIG_CX = ROW1_X(4) + W / 2;

// ── Tour sequence (row 2) — same widened-gap fix as row 1 ───────
const TOUR_GAP = 240;
const TOUR_PITCH = W + TOUR_GAP;
const TOUR_X = (n) => TOUR_X0 + n * TOUR_PITCH;

// ── Channel (tour → dashboard, row 2 → row 3) ────────────────────
const CH2_LBL_Y = 800;
const CH2_CHANNEL_Y = 850;
const ROW3_Y = 920, ROW3_BOT = ROW3_Y + H, ROW3_CY = ROW3_Y + H / 2;
const ROW3_GAP = 240;
const DASH_EMPTY_X = TOUR_X0, DASH_EMPTY_CX = DASH_EMPTY_X + W / 2;
const DASH_FULL_X = DASH_EMPTY_X + W + ROW3_GAP, DASH_FULL_CX = DASH_FULL_X + W / 2;

// ── Channel (dashboard → 5 tab destinations, row 3 → row 4) ──────
const CH3_LBL_Y = ROW3_BOT + 50;
const CH3_CHANNEL_Y = ROW3_BOT + 100;
const ROW4_Y = ROW3_BOT + 160, ROW4_BOT = ROW4_Y + H;
const ROW4_GAP = 140;
const ROW4_PITCH = W + ROW4_GAP;
const ROW4_X = (n) => 60 + n * ROW4_PITCH;
const ROW4_CX = (n) => ROW4_X(n) + W / 2;

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
const DEV_TITLE_Y = ROW4_BOT + 130;
const HUB_Y = DEV_TITLE_Y + 50, HUB_BOT = HUB_Y + H;
const HUB_CX = 60 + W / 2;
const CH4_LBL_Y = HUB_BOT + 20;
const CH4_CHANNEL_Y = HUB_BOT + 70;
const SPOKE_Y = HUB_BOT + 130;
const SPOKE_GAP = 140;
const SPOKE_PITCH = W + SPOKE_GAP;
const SPOKE_X = (n) => 60 + n * SPOKE_PITCH;
const SPOKE_CX = (n) => SPOKE_X(n) + W / 2;

// Applications → detail drill-down chain, continuing straight down from
// the Applications spoke rather than fanning out again.
const CHAIN_Y = SPOKE_Y + H + 160, CHAIN_CY = CHAIN_Y + H / 2;
const CHAIN_GAP = 240;

export const MAIA_FLOW_ELEMENTS = [
  text("maia-title", "MAIA: First-Time User Onboarding", 60, 30, 1400, 44, 26, "#EDEAD4", 100),
  text("maia-subtitle", "Real screens from the Maia 2.0 prototype: requesting application access, an optional guided tour, and the resulting dashboard.", 60, 80, 1600, 28, 13, DIM, 100),

  // ── Row 1: onboarding wizard ────────────────────────────────
  text("maia-lbl-onboarding", "Onboarding wizard", 60, 130, 400, 20, 13, ACCENT),
  img("maia-welcome", `${BASE}/welcome.png`, ROW1_X(0), ROW1_Y, W, H, 10),
  arrow("maia-arr-1", ROW1_X(0) + W, ROW1_CY, ROW1_X(1), ROW1_CY, ACCENT),
  text("maia-lbl-arr-1", "Reference Team Member", ROW1_X(0) + W + 5, ROW1_CY - 32, ROW1_CAP_W, 20, 10, DIM),

  img("maia-ref-empty", `${BASE}/reference-team-empty.png`, ROW1_X(1), ROW1_Y, W, H, 10),
  arrow("maia-arr-2", ROW1_X(1) + W, ROW1_CY, ROW1_X(2), ROW1_CY, ACCENT),
  text("maia-lbl-arr-2", "Email entered", ROW1_X(1) + W + 5, ROW1_CY - 32, ROW1_CAP_W, 20, 10, DIM),

  img("maia-ref-filled", `${BASE}/reference-team-filled.png`, ROW1_X(2), ROW1_Y, W, H, 10),
  arrow("maia-arr-3", ROW1_X(2) + W, ROW1_CY, ROW1_X(3), ROW1_CY, ACCENT),
  text("maia-lbl-arr-3", "All Applications", ROW1_X(2) + W + 5, ROW1_CY - 32, ROW1_CAP_W, 20, 10, DIM),

  img("maia-all-apps", `${BASE}/all-applications.png`, ROW1_X(3), ROW1_Y, W, H, 10),
  arrow("maia-arr-4", ROW1_X(3) + W, ROW1_CY, ROW1_X(4), ROW1_CY, ACCENT),
  text("maia-lbl-arr-4", "Request access", ROW1_X(3) + W + 5, ROW1_CY - 32, ROW1_CAP_W, 20, 10, DIM),

  img("maia-config-complete", `${BASE}/configuration-complete.png`, ROW1_X(4), ROW1_Y, W, H, 10),

  // ── Three branches from "Configuration Complete" ────────────
  // Routed trunk-then-branch through BR1_CHANNEL_Y, well clear of the
  // branch labels above it (BR1_LBL_Y/BR1_LBL2_Y) and the row-2 images
  // below it — a straight line from the shared origin to the far
  // destinations would otherwise sweep straight through the labels
  // sitting in between.
  ...fanOut("maia-branch", CONFIG_CX, ROW1_BOT, BR1_CHANNEL_Y, [
    { id: "devtools", x: DEV_CX, y: ROW2_Y },
    { id: "tour", x: TOUR_CX, y: ROW2_Y },
    { id: "reslib", x: RESLIB_CX, y: ROW2_Y },
  ], ACCENT),

  text("maia-lbl-devtools", "Branch: dev tools", DEV_X, BR1_LBL_Y, W, 20, 12, ACCENT),
  text("maia-lbl-branch-devtools", "Developer tools & resources", DEV_X, BR1_LBL2_Y, W, 20, 11, DIM),
  img("maia-devtools", `${BASE}/developer-tools.png`, DEV_X, ROW2_Y, W, H, 10),

  text("maia-lbl-tour", "Branch: guided tour (13 steps, condensed to 4)", TOUR_X0, BR1_LBL_Y, 480, 20, 12, ACCENT),
  text("maia-lbl-branch-tour", "Dashboard + virtual walkthrough", TOUR_X0, BR1_LBL2_Y, 400, 20, 11, DIM),

  text("maia-lbl-reslib", "Branch: resource library", RESLIB_X, BR1_LBL_Y, W, 20, 12, ACCENT),
  text("maia-lbl-branch-reslib", "Learn more about MAIA", RESLIB_X, BR1_LBL2_Y, W, 20, 11, DIM),
  img("maia-reslib", `${BASE}/resource-library.png`, RESLIB_X, ROW2_Y, W, H, 10),

  // ── Row 2: condensed tour sequence ───────────────────────────
  img("maia-tour-1", `${BASE}/tour-1.png`, TOUR_X(0), ROW2_Y, W, H, 10),
  arrow("maia-arr-tour-1", TOUR_X(0) + W, ROW2_CY, TOUR_X(1), ROW2_CY, ACCENT),
  img("maia-tour-5", `${BASE}/tour-5.png`, TOUR_X(1), ROW2_Y, W, H, 10),
  arrow("maia-arr-tour-2", TOUR_X(1) + W, ROW2_CY, TOUR_X(2), ROW2_CY, ACCENT),
  text("maia-lbl-tour-condensed", "9 steps condensed", TOUR_X(1) + W + 5, ROW2_CY - 32, 210, 20, 10, DIM),
  img("maia-tour-9", `${BASE}/tour-9.png`, TOUR_X(2), ROW2_Y, W, H, 10),
  arrow("maia-arr-tour-3", TOUR_X(2) + W, ROW2_CY, TOUR_X(3), ROW2_CY, ACCENT),
  img("maia-tour-13", `${BASE}/tour-13.png`, TOUR_X(3), ROW2_Y, W, H, 10),

  // ── Row 3: dashboard before/after access ─────────────────────
  // Single connector (not a fan-out) but still routed through a clear
  // channel: "Tour complete" and "Dashboard" both sit in the gap between
  // row 2 and row 3, so a direct diagonal would cross one or both.
  text("maia-lbl-tour-done", "Tour complete", TOUR_X(3) + 5, CH2_LBL_Y, 165, 20, 10, DIM),
  ...fanOut("maia-tour-to-dash", TOUR_X(3) + W / 2, ROW2_BOT, CH2_CHANNEL_Y, [
    { id: "dash", x: DASH_EMPTY_CX, y: ROW3_Y },
  ], ACCENT),
  text("maia-lbl-dashboards", "Dashboard", DASH_EMPTY_X, CH2_LBL_Y, 300, 20, 13, ACCENT),
  img("maia-dash-empty", `${BASE}/dashboard-empty.png`, DASH_EMPTY_X, ROW3_Y, W, H, 10),
  text("maia-lbl-dash-empty", "Before access is granted", DASH_EMPTY_X + 5, ROW3_BOT + 6, 160, 20, 10, DIM),

  arrow("maia-arr-dash", DASH_EMPTY_X + W, ROW3_CY, DASH_FULL_X, ROW3_CY, ACCENT),
  text("maia-lbl-arr-dash", "Access granted", DASH_EMPTY_X + W + 5, ROW3_CY - 32, 210, 20, 10, DIM),
  img("maia-dash-full", `${BASE}/dashboard-populated.png`, DASH_FULL_X, ROW3_Y, W, H, 10),
  text("maia-lbl-dash-full", "Populated dashboard", DASH_FULL_X + 5, ROW3_BOT + 6, 160, 20, 10, DIM),

  // ── Row 4: dashboard tab destinations ─────────────────────────
  // Fan-out from the populated-dashboard screen to five tab destinations,
  // routed through CH3_CHANNEL_Y — clear of "Populated dashboard" above it
  // and every "X tab" label below it.
  ...fanOut("maia-dash-fan", DASH_FULL_CX, ROW3_BOT, CH3_CHANNEL_Y, [
    { id: "apps", x: ROW4_CX(0), y: ROW4_Y },
    { id: "event", x: ROW4_CX(1), y: ROW4_Y },
    { id: "resources", x: ROW4_CX(2), y: ROW4_Y },
    { id: "activities", x: ROW4_CX(3), y: ROW4_Y },
    { id: "alerts", x: ROW4_CX(4), y: ROW4_Y },
  ], ACCENT),

  text("maia-lbl-dash-apps", "Applications tab", ROW4_X(0), CH3_LBL_Y, W, 20, 11, DIM),
  img("maia-applications", `${BASE}/applications.png`, ROW4_X(0), ROW4_Y, W, H, 10),

  text("maia-lbl-dash-event", "Event details", ROW4_X(1), CH3_LBL_Y, W, 20, 11, DIM),
  img("maia-event-details", `${BASE}/event-details.png`, ROW4_X(1), ROW4_Y, W, H, 10),

  text("maia-lbl-dash-resources", "Resources tab", ROW4_X(2), CH3_LBL_Y, W, 20, 11, DIM),
  img("maia-resources", `${BASE}/resources.png`, ROW4_X(2), ROW4_Y, W, H, 10),

  text("maia-lbl-dash-activities", "Activities tab", ROW4_X(3), CH3_LBL_Y, W, 20, 11, DIM),
  img("maia-activities", `${BASE}/activities.png`, ROW4_X(3), ROW4_Y, W, H, 10),

  text("maia-lbl-dash-alerts", "Alerts", ROW4_X(4), CH3_LBL_Y, W, 20, 11, DIM),
  img("maia-alerts", `${BASE}/alerts.png`, ROW4_X(4), ROW4_Y, W, H, 10),

  // ── Developer Experience ──────────────────────────────────────
  text("maia-dev-title", "Developer Experience: Application Management", 60, DEV_TITLE_Y, 1400, 32, 20, "#EDEAD4", 100),

  img("maia-dev-dashboard", `${BASE}/dev-dashboard.png`, 60, HUB_Y, W, H, 10),

  ...fanOut("maia-dev-fan", HUB_CX, HUB_BOT, CH4_CHANNEL_Y, [
    { id: "apps", x: SPOKE_CX(0), y: SPOKE_Y },
    { id: "violations", x: SPOKE_CX(1), y: SPOKE_Y },
    { id: "resources", x: SPOKE_CX(2), y: SPOKE_Y },
    { id: "activities", x: SPOKE_CX(3), y: SPOKE_Y },
    { id: "alerts", x: SPOKE_CX(4), y: SPOKE_Y },
    { id: "scope", x: SPOKE_CX(5), y: SPOKE_Y },
    { id: "contrib", x: SPOKE_CX(6), y: SPOKE_Y },
  ], ACCENT),

  text("maia-lbl-dev-apps", "Applications tab", SPOKE_X(0), CH4_LBL_Y, 160, 20, 11, DIM),
  img("maia-dev-applications", `${BASE}/dev-applications.png`, SPOKE_X(0), SPOKE_Y, W, H, 10),

  text("maia-lbl-dev-violations", "Open Violations", SPOKE_X(1), CH4_LBL_Y, W, 20, 11, DIM),
  img("maia-dev-violations", `${BASE}/dev-violations.png`, SPOKE_X(1), SPOKE_Y, W, H, 10),

  text("maia-lbl-dev-resources", "Resources tab", SPOKE_X(2), CH4_LBL_Y, W, 20, 11, DIM),
  img("maia-dev-resources", `${BASE}/dev-resources.png`, SPOKE_X(2), SPOKE_Y, W, H, 10),

  text("maia-lbl-dev-activities", "Activities tab", SPOKE_X(3), CH4_LBL_Y, W, 20, 11, DIM),
  img("maia-dev-activities", `${BASE}/dev-activities.png`, SPOKE_X(3), SPOKE_Y, W, H, 10),

  text("maia-lbl-dev-alerts", "Alerts", SPOKE_X(4), CH4_LBL_Y, W, 20, 11, DIM),
  img("maia-dev-alerts", `${BASE}/dev-alerts.png`, SPOKE_X(4), SPOKE_Y, W, H, 10),

  text("maia-lbl-dev-scope", "Switch to Manager scope", SPOKE_X(5), CH4_LBL_Y, W, 20, 11, DIM),
  img("maia-dev-scope", `${BASE}/dev-scope-manager.png`, SPOKE_X(5), SPOKE_Y, W, H, 10),

  text("maia-lbl-dev-contrib", "MAIA Contribution Center", SPOKE_X(6), CH4_LBL_Y, W, 20, 11, DIM),
  img("maia-dev-contrib", `${BASE}/dev-contribution-center.png`, SPOKE_X(6), SPOKE_Y, W, H, 10),

  // Applications → detail drill-down chain, continuing straight down from
  // the Applications spoke rather than fanning out again.
  arrow("maia-arr-dev-app-detail", SPOKE_CX(0), SPOKE_Y + H, SPOKE_CX(0), CHAIN_Y, ACCENT),
  text("maia-lbl-dev-app-detail", "Open an application", SPOKE_X(0) + 5, CHAIN_Y - 30, 160, 20, 10, DIM),
  img("maia-dev-app-overview", `${BASE}/dev-app-overview.png`, SPOKE_X(0), CHAIN_Y, W, H, 10),

  arrow("maia-arr-dev-app-services", SPOKE_X(0) + W, CHAIN_CY, SPOKE_X(0) + W + CHAIN_GAP, CHAIN_CY, ACCENT),
  text("maia-lbl-dev-app-services", "App Services tab", SPOKE_X(0) + W + 5, CHAIN_CY - 32, 210, 20, 10, DIM),
  img("maia-dev-app-services", `${BASE}/dev-app-services.png`, SPOKE_X(0) + W + CHAIN_GAP, CHAIN_Y, W, H, 10),
];

export function maiaFlowPage() {
  return { id: "maia-flow", name: "MAIA: Onboarding Flow", elements: MAIA_FLOW_ELEMENTS };
}
