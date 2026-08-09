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

export const STANDARD_BANK_FLOW_ELEMENTS = [
  text("sb-title", "Standard Bank: Cross-Border Payment Flow", 60, 30, 1400, 44, 26, "#EDEAD4", 100),
  text("sb-subtitle", "Real screens from the Standard Bank case study: sending a payment to a new beneficiary.", 60, 80, 1400, 28, 13, DIM, 100),

  text("sb-lbl-1", "1. Add beneficiary", 60, 130, W, 20, 12, DIM),
  img("sb-add-beneficiary", "/case-studies/standard-bank/13-save-beneficiary.png", 60, Y, W, H, 10),

  arrow("sb-arr-1", 260, CY, 340, CY, ACCENT),
  text("sb-lbl-arr-1", "Beneficiary selected", 265, CY - 32, 190, 20, 11, DIM),

  text("sb-lbl-2", "2. Payment details", 340, 130, W, 20, 12, DIM),
  img("sb-payment-details", "/case-studies/standard-bank/06-payment-details.png", 340, Y, W, H, 10),

  arrow("sb-arr-2", 540, CY, 620, CY, ACCENT),
  text("sb-lbl-arr-2", "Confirm & pay", 545, CY - 32, 190, 20, 11, DIM),

  text("sb-lbl-3", "3. One-time PIN", 620, 130, W, 20, 12, DIM),
  img("sb-otp", "/case-studies/standard-bank/10-otp-entry.png", 620, Y, W, H, 10),

  arrow("sb-arr-3", 820, CY, 900, CY, ACCENT),
  text("sb-lbl-arr-3", "Payment confirmed", 825, CY - 32, 190, 20, 11, DIM),

  text("sb-lbl-4", "4. Beneficiary saved", 900, 130, W, 20, 12, DIM),
  img("sb-saved", "/case-studies/standard-bank/14-beneficiary-saved.png", 900, Y, W, H, 10),
];

export function standardBankFlowPage() {
  return { id: "standard-bank-flow", name: "Standard Bank: Payment Flow", elements: STANDARD_BANK_FLOW_ELEMENTS };
}
