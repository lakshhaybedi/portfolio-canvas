// Shared palette + motion constants for the portfolio folder widget.
//
// The brief's suggested hex values (#2A2A30 body / #32323A panel / #3A3A44
// tab, rgba(255,255,255,0.10) border) don't clear WCAG 1.4.11's 3:1
// non-text-contrast ratio against this page's #0A0A0A background in
// isolation (measured ~1.4–1.8:1) — no charcoal this dark can, short of
// abandoning "keep it dark." Brightened ~1.4x here (still the same warm
// slate-charcoal family, same body<panel<tab order) gets meaningfully
// closer without turning it into a light-grey card, and the border/shadow
// — the actual boundary a sighted user reads as "a shape sits here" — is
// pushed harder on top of that. The label text (the one element WCAG-AA
// text contrast strictly applies to) clears 15.7:1 against the page with
// room to spare.
export const FOLDER_BODY = "#3A3A42";
export const FOLDER_PANEL = "#454550";
export const FOLDER_TAB = "#50505E";
export const FOLDER_BORDER = "rgba(255,255,255,0.18)";
export const FOLDER_BORDER_HOVER = "rgba(240,232,213,0.34)";
export const FOLDER_LABEL = "#EAE5D8";

export const PAPER_COLOR = "rgba(237,234,212,0.95)";
export const PAPER_SHADE = "rgba(10,10,10,0.16)";
// Muted, desaturated touches only — two of five sheets, kept low-opacity so
// the stack still reads as monochromatic cream/charcoal at a glance.
export const TAB_ACCENT = "rgba(124,106,247,0.4)";
export const RIBBON_ACCENT = "rgba(214,178,94,0.6)";

export const SPRING_CALM = { type: "spring" as const, stiffness: 300, damping: 28 };
// Slightly underdamped on purpose — the small overshoot on open reads as
// "documents fan out, then settle" without hand-authoring keyframes.
export const SPRING_OPEN = { type: "spring" as const, stiffness: 320, damping: 19 };
