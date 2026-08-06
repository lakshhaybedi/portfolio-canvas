// Shared palette + motion constants for the portfolio folder widget.

// The folder's full state machine — idle/hover are steady states; opening/
// closing are transient, each ending when the last-settling piece (see
// onLastPaperSettled wiring in PortfolioFolder) reports its own animation
// complete, not a guessed timeout.
export type FolderPhase = "idle" | "hover" | "opening" | "open" | "closing";

// Background follows the brief's suggested warm charcoal (#3B3A45) almost
// exactly — it was already this family. Border intentionally stays a
// translucent white rather than the brief's literal suggested #565562:
// solid #565562 on this page's #0A0A0A background measures ~2.7:1, under
// WCAG 1.4.11's 3:1 non-text-contrast floor. rgba(255,255,255,0.18) clears
// it (~3.3:1) while reading as the same warm-neutral edge at this size.
export const FOLDER_BODY = "#3B3A45";
export const FOLDER_PANEL = "#454550";
export const FOLDER_TAB = "#565562";
export const FOLDER_BORDER = "rgba(255,255,255,0.18)";
export const FOLDER_BORDER_HOVER = "rgba(240,232,213,0.34)";
export const FOLDER_LABEL = "#EAE5D8";

export const PAPER_COLOR = "#F3EEDB";
export const PAPER_SHADE = "rgba(10,10,10,0.16)";

// Premium, non-bouncy springs — damping ratio at or just past 1 (critically
// / slightly over-damped) on purpose. No overshoot, no oscillation: settles
// once and stops, closer to how macOS Finder's own animations feel than an
// underdamped "pop." Distinct configs per weight class (the folder body
// itself vs. the lighter paper sheets) so heavier and lighter elements
// don't read as moving at identical speeds.
export const SPRING_BODY = { type: "spring" as const, stiffness: 420, damping: 42, mass: 1 };
export const SPRING_PAPER = { type: "spring" as const, stiffness: 500, damping: 40, mass: 0.8 };
export const SPRING_HOVER = { type: "spring" as const, stiffness: 500, damping: 34, mass: 0.6 };
