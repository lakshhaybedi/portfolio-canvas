// Page 2 seed: the Find Care appointment-management UX flow, built from the
// real screens in the "Find Care" Figma case study (not placeholder boxes) —
// the cancel path and the reschedule path (with its error/no-slots branches),
// both starting from the same Care Team screen. Positions are hand-placed,
// not grid-generated like defaultCanvasData's slide grid, since this is a
// flow diagram, not a slide deck. Captions are offset clear of every
// connector's own path (not just centered under it) — a straight line
// between two points that happens to have a full-width caption sitting
// directly on top of it draws the line straight through the text.

const CANCEL = "#FF3B30";
const RESCHEDULE = "#7C6AF7";
const NO_SLOTS = "#F5A623";
const DIM = "rgba(237,234,212,0.5)";

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

const SCREEN_W = 300;
const SCREEN_H = 225;

export const FIND_CARE_FLOW_ELEMENTS = [
  text("fc-title", "Find Care · Appointment Management: UX Flow", 60, 30, 1400, 44, 26, "#EDEAD4", 100),
  text("fc-subtitle", "Real screens from the Find Care case study, arranged into the cancel and reschedule paths.", 60, 80, 1400, 28, 13, DIM, 100),

  // ── Shared starting point ──────────────────────────────────
  text("fc-lbl-care", "Care Dashboard", 60, 460, 300, 24, 12, DIM),
  img("fc-care-team", "/canvas-flow/care-team.png", 60, 490, SCREEN_W, SCREEN_H, 10),

  // Connector shifted to x=340 (the image's right portion) so the full-width
  // "Provider preferences" title below doesn't sit directly on top of it.
  text("fc-lbl-pref", "Provider preferences (related)", 60, 870, 260, 24, 12, DIM),
  img("fc-preferences", "/canvas-flow/preferences.png", 60, 900, SCREEN_W, SCREEN_H, 10),
  arrow("fc-arr-care-pref", 340, 715, 340, 900, "rgba(124,106,247,0.5)"),
  text("fc-lbl-care-pref", "Manage care preferences", 500, 790, 220, 20, 11, DIM),

  // ── Cancel appointment path ─────────────────────────────────
  text("fc-lbl-cancel-section", "Cancel Appointment", 460, 130, 300, 28, 15, CANCEL, 100),
  img("fc-cancel-dialog", "/canvas-flow/cancel-dialog.png", 460, 180, SCREEN_W, SCREEN_H, 10),
  img("fc-cancel-success", "/canvas-flow/cancel-success.png", 900, 180, SCREEN_W, SCREEN_H, 10),
  arrow("fc-arr-care-cancel", 360, 560, 460, 340, CANCEL),
  // Caption sits left of the connector's own x-span (360–460) instead of
  // centered on it, so the diagonal line doesn't cut through the text.
  text("fc-lbl-care-cancel", "[View Appointment] → [Cancel]", 100, 320, 250, 20, 10, DIM),
  arrow("fc-arr-cancel-success", 760, 292, 900, 292, CANCEL),
  text("fc-lbl-cancel-confirm", "[Confirm]", 765, 260, 130, 20, 11, DIM),

  // ── Reschedule appointment path ─────────────────────────────
  text("fc-lbl-reschedule-section", "Reschedule Appointment", 460, 762, 300, 28, 15, RESCHEDULE, 100),
  img("fc-select-date", "/canvas-flow/reschedule-select-date.png", 460, 812, SCREEN_W, SCREEN_H, 10),
  img("fc-select-time", "/canvas-flow/reschedule-select-time.png", 900, 812, SCREEN_W, SCREEN_H, 10),
  img("fc-review", "/canvas-flow/reschedule-review.png", 1340, 812, SCREEN_W, SCREEN_H, 10),
  img("fc-reschedule-success", "/canvas-flow/reschedule-success.png", 1780, 812, SCREEN_W, SCREEN_H, 10),

  arrow("fc-arr-care-reschedule", 360, 650, 460, 924, RESCHEDULE),
  // Same fix as the cancel-path caption above: offset left of the
  // connector's x-span (360–460) rather than sitting on top of it.
  text("fc-lbl-care-reschedule", "[Reschedule Appointment]", 100, 780, 220, 20, 10, DIM),
  arrow("fc-arr-date-time", 760, 924, 900, 924, RESCHEDULE),
  text("fc-lbl-slots-exist", "[Slots exist]", 765, 892, 130, 20, 11, DIM),
  arrow("fc-arr-time-review", 1200, 924, 1340, 924, RESCHEDULE),
  text("fc-lbl-time-selected", "Time selected", 1205, 892, 130, 20, 11, DIM),
  arrow("fc-arr-review-success", 1640, 924, 1780, 924, RESCHEDULE),
  text("fc-lbl-confirm-reschedule", "[Confirm Reschedule]", 1645, 892, 125, 20, 11, DIM),

  // Branches off "Select Date" — real dead ends in the case study's own
  // flow diagram, not just decoration: a failed slot fetch, and a date with
  // nothing available, both send the user back to picking a date.
  img("fc-error", "/canvas-flow/reschedule-error.png", 380, 1150, SCREEN_W, SCREEN_H, 10),
  arrow("fc-arr-date-error", 520, 1037, 530, 1150, CANCEL),
  text("fc-lbl-error", "Error: system failure", 390, 1075, 120, 32, 10, DIM),
  text("fc-lbl-error-retry", "↺ Retry loads available slots again", 380, 1385, 300, 20, 10, DIM),

  img("fc-no-slots", "/canvas-flow/reschedule-no-slots.png", 760, 1150, SCREEN_W, SCREEN_H, 10),
  arrow("fc-arr-date-no-slots", 700, 1037, 910, 1150, NO_SLOTS),
  text("fc-lbl-no-slots", "No slots in range", 850, 1075, 150, 32, 10, DIM),
  text("fc-lbl-no-slots-retry", "↺ User picks a different date", 760, 1385, 300, 20, 10, DIM),
];

export function findCareFlowPage() {
  return { id: "find-care-flow", name: "Find Care: UX Flow", elements: FIND_CARE_FLOW_ELEMENTS };
}
