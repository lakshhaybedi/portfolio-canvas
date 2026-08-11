// Page 4 seed: the Standard Bank cross-border payment flow, using 4 real
// screens from the /work/standard-bank case study's full screens gallery
// (public/case-studies/standard-bank/*.png) — a linear send-money task:
// add a beneficiary, review the fee-transparent payment details, verify
// with an OTP, land on the save-for-next-time confirmation.

const ACCENT = "#7C6AF7";
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

// Screens are portrait phone captures (~336×800) — a taller, narrower box
// than Find Care/T-Cloud's landscape screens.
const W = 200;
const H = 480;
const Y = 160;
const CY = Y + H / 2;
// Wide enough to hold a full-width caption (190px) with margin either side —
// the original 80px gap was narrower than the caption text it held, so
// captions like "Beneficiary selected" spilled into the next phone screen.
const GAP = 220;
const CAP_W = 190;
const PITCH = W + GAP;
const X = (n) => 60 + n * PITCH;

export const STANDARD_BANK_FLOW_ELEMENTS = [
  text("sb-title", "Standard Bank: Cross-Border Payment Flow", 60, 30, 1400, 44, 26, "#EDEAD4", 100),
  text("sb-subtitle", "Real screens from the Standard Bank case study: sending a payment to a new beneficiary.", 60, 80, 1400, 28, 13, DIM, 100),

  text("sb-lbl-1", "1. Add beneficiary", X(0), 130, W, 20, 12, DIM),
  img("sb-add-beneficiary", "/case-studies/standard-bank/13-save-beneficiary.png", X(0), Y, W, H, 10),

  arrow("sb-arr-1", X(0) + W, CY, X(1), CY, ACCENT),
  text("sb-lbl-arr-1", "Beneficiary selected", X(0) + W + 5, CY - 32, CAP_W, 20, 11, DIM),

  text("sb-lbl-2", "2. Payment details", X(1), 130, W, 20, 12, DIM),
  img("sb-payment-details", "/case-studies/standard-bank/06-payment-details.png", X(1), Y, W, H, 10),

  arrow("sb-arr-2", X(1) + W, CY, X(2), CY, ACCENT),
  text("sb-lbl-arr-2", "Confirm & pay", X(1) + W + 5, CY - 32, CAP_W, 20, 11, DIM),

  text("sb-lbl-3", "3. One-time PIN", X(2), 130, W, 20, 12, DIM),
  img("sb-otp", "/case-studies/standard-bank/10-otp-entry.png", X(2), Y, W, H, 10),

  arrow("sb-arr-3", X(2) + W, CY, X(3), CY, ACCENT),
  text("sb-lbl-arr-3", "Payment confirmed", X(2) + W + 5, CY - 32, CAP_W, 20, 11, DIM),

  text("sb-lbl-4", "4. Beneficiary saved", X(3), 130, W, 20, 12, DIM),
  img("sb-saved", "/case-studies/standard-bank/14-beneficiary-saved.png", X(3), Y, W, H, 10),
];

export function standardBankFlowPage() {
  return { id: "standard-bank-flow", name: "Standard Bank: Payment Flow", elements: STANDARD_BANK_FLOW_ELEMENTS };
}
