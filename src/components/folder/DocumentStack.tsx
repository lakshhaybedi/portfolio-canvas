"use client";

import { motion } from "framer-motion";
import { type FolderPhase, PAPER_COLOR, PAPER_SHADE, SPRING_PAPER } from "./folderPalette";

interface SheetConfig {
  width: number;
  left: number;
  top: number;
  rotate: number;
  // Open-state targets are deliberately close to the resting values —
  // "documents rise upward naturally... spread only a little. Do not
  // scatter. Keep them aligned" — not a card-fan. Only the front-most
  // sheet leans out at all, and barely.
  openRotate: number;
  openRise: number;
  hoverRise: number;
}

// Five sheets, matching the five real documents. "Tiny offset stacking" —
// left/top/rotate all vary within a few px/degrees, not enough to read as
// individually animated pieces; the stack moves as one object because
// every sheet here shares the same phase-driven spring, staggered only by
// a flat 40ms per sheet (see `delay` below), not by independent timing.
const SHEETS: SheetConfig[] = [
  { width: 50, left: 19, top: 15, rotate: -2, openRotate: -3, openRise: 14, hoverRise: 2 },
  { width: 50, left: 20, top: 11, rotate: 1, openRotate: 1, openRise: 16, hoverRise: 3 },
  { width: 50, left: 21, top: 7, rotate: -1, openRotate: -2, openRise: 18, hoverRise: 3 },
  { width: 50, left: 20, top: 3, rotate: 2, openRotate: 3, openRise: 20, hoverRise: 4 },
  { width: 50, left: 19, top: 0, rotate: -1, openRotate: -4, openRise: 22, hoverRise: 4 },
];

/** Subtle folded corner + faint text lines — the same minimal treatment on
 * every sheet, on purpose. Distinct per-sheet icons (PDF badge, color tab,
 * ribbon) read as illustrative/cartoon-ish at this scale; a folder full of
 * plain paper edges reads as premium. */
function SheetMarks() {
  return (
    <>
      <div
        style={{
          position: "absolute", top: 0, right: 0, width: 0, height: 0,
          borderStyle: "solid", borderWidth: "0 8px 8px 0",
          borderColor: `transparent ${PAPER_SHADE} transparent transparent`,
        }}
      />
      <div style={{ position: "absolute", top: 8, left: 7, right: 9, display: "flex", flexDirection: "column", gap: 3 }}>
        <div style={{ height: 1.4, borderRadius: 1, background: PAPER_SHADE, width: "100%" }} />
        <div style={{ height: 1.4, borderRadius: 1, background: PAPER_SHADE, width: "72%" }} />
      </div>
    </>
  );
}

// Base delay before the first sheet starts rising — keeps papers visually
// following the flap/back-panel stages rather than moving simultaneously
// with them (see FLAP_DELAY/BACK_TILT_DELAY in FolderAnimation.tsx).
const PAPERS_BASE_DELAY = 0.14;

export default function DocumentStack({
  phase,
  reduceMotion,
  onLastSettled,
}: {
  phase: FolderPhase;
  reduceMotion: boolean;
  onLastSettled?: () => void;
}) {
  const rising = phase === "opening" || phase === "open";
  // Opening staggers 0→n (last sheet starts latest, so it also *finishes*
  // latest). Closing reverses the stagger — the front sheet tucks away
  // first, so index 0 now starts latest and finishes latest instead. The
  // settle callback has to track whichever index that actually is, or it
  // fires the instant the *first*-finishing sheet settles instead of the
  // last one.
  const gateIndex = phase === "closing" ? 0 : SHEETS.length - 1;

  return (
    <>
      {SHEETS.map((sheet, i) => {
        const y =
          phase === "hover" ? sheet.top - sheet.hoverRise
          : rising ? sheet.top - sheet.openRise
          : sheet.top;
        const rotate = rising ? sheet.openRotate : sheet.rotate;
        const isGate = i === gateIndex && (phase === "opening" || phase === "closing");

        if (reduceMotion) {
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: sheet.left, width: sheet.width, top: y,
                height: 38, borderRadius: "3px 6px 4px 4px",
                background: PAPER_COLOR,
                transform: `rotate(${rotate}deg)`,
                zIndex: 2 + i,
              }}
            >
              <SheetMarks />
            </div>
          );
        }

        // Flat 40ms-per-sheet stagger only while actually rising — this is
        // Stage 4 from the brief, not a continuous independent float.
        // Reverses on the way back in so the front sheet (last, tallest)
        // tucks away first.
        const delay = rising
          ? PAPERS_BASE_DELAY + i * 0.04
          : (SHEETS.length - 1 - i) * 0.03;

        return (
          <motion.div
            key={i}
            initial={false}
            animate={{ y, rotate }}
            transition={{ ...SPRING_PAPER, delay }}
            onAnimationComplete={isGate ? onLastSettled : undefined}
            style={{
              position: "absolute",
              left: sheet.left, width: sheet.width, top: 0,
              height: 38, borderRadius: "3px 6px 4px 4px",
              background: PAPER_COLOR,
              boxShadow: "0 3px 8px rgba(0,0,0,0.28)",
              zIndex: 2 + i,
            }}
          >
            <SheetMarks />
          </motion.div>
        );
      })}
    </>
  );
}
