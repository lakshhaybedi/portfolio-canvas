"use client";

import { motion } from "framer-motion";
import {
  PAPER_COLOR,
  PAPER_SHADE,
  RIBBON_ACCENT,
  SPRING_CALM,
  SPRING_OPEN,
  TAB_ACCENT,
} from "./folderPalette";

type Decoration = "corner-fold" | "lines" | "pdf-tag" | "color-tab" | "ribbon";

interface SheetConfig {
  decoration: Decoration;
  width: number;
  left: number;
  top: number;
  rotate: number;
  // Deterministic (not random) per-sheet idle timing so independent float
  // doesn't hydration-mismatch and doesn't sync all five sheets together.
  idleDuration: number;
  idleDelay: number;
}

// Five sheets — matches the five real documents in the folder. Each carries
// a distinct, tiny motif so the stack reads as "documents," not one flat
// block: a folded corner, faint text lines, a PDF tag, a muted folder-tab
// accent, and a certificate ribbon. Only two of five carry any hue (tab,
// ribbon), both heavily muted, to stay monochromatic at a glance.
//
// Ordered back-to-front with `top` *decreasing* down the list (each sheet
// peeks a little higher than the one behind it) and z-index increasing to
// match — get this pairing backwards and a more-revealed sheet renders
// *behind* a less-revealed one, hiding it almost entirely, which is what
// the first pass at this got wrong. left/rotate jitter is deliberately not
// monotonic, so the stack reads as dropped-into-place rather than a neat
// fan of index cards.
const SHEETS: SheetConfig[] = [
  { decoration: "corner-fold", width: 44, left: 9, top: 16, rotate: -7, idleDuration: 4.6, idleDelay: 0 },
  { decoration: "lines", width: 46, left: 13, top: 12, rotate: -3, idleDuration: 5.4, idleDelay: 0.35 },
  { decoration: "pdf-tag", width: 47, left: 17, top: 8, rotate: 1, idleDuration: 5.0, idleDelay: 0.7 },
  { decoration: "color-tab", width: 46, left: 12, top: 4, rotate: 5, idleDuration: 5.8, idleDelay: 0.15 },
  { decoration: "ribbon", width: 48, left: 15, top: 0, rotate: -2, idleDuration: 4.9, idleDelay: 0.5 },
];

// The frontmost sheet (rendered last, highest z-index) is the one that
// tilts independently on hover — "top sheet tilts a few degrees."
const TOP_SHEET_INDEX = SHEETS.length - 1;

function SheetDecoration({ type }: { type: Decoration }) {
  switch (type) {
    case "corner-fold":
      return (
        <div
          style={{
            position: "absolute", top: 0, right: 0, width: 0, height: 0,
            borderStyle: "solid", borderWidth: "0 9px 9px 0",
            borderColor: `transparent ${PAPER_SHADE} transparent transparent`,
          }}
        />
      );
    case "lines":
      return (
        <div style={{ position: "absolute", top: 3, left: 6, right: 8, display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ height: 1.4, borderRadius: 1, background: PAPER_SHADE, width: "100%" }} />
          <div style={{ height: 1.4, borderRadius: 1, background: PAPER_SHADE, width: "80%" }} />
          <div style={{ height: 1.4, borderRadius: 1, background: PAPER_SHADE, width: "62%" }} />
        </div>
      );
    case "pdf-tag":
      return (
        <div
          style={{
            position: "absolute", top: 2, left: 5,
            padding: "1px 4px", borderRadius: 2,
            background: "rgba(10,10,10,0.7)",
            fontSize: 6, fontWeight: 800, letterSpacing: "0.03em",
            color: PAPER_COLOR, lineHeight: "7px",
          }}
        >
          PDF
        </div>
      );
    case "color-tab":
      return (
        <div
          style={{
            position: "absolute", top: -4, left: 10,
            width: 16, height: 6, borderRadius: "2px 2px 0 0",
            background: TAB_ACCENT,
          }}
        />
      );
    case "ribbon":
      return (
        <div style={{ position: "absolute", top: -3, left: 8, width: 12, height: 14 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: RIBBON_ACCENT, margin: "0 auto" }} />
          <div
            style={{
              position: "absolute", top: 5, left: 0, width: 0, height: 0,
              borderStyle: "solid", borderWidth: "8px 4px 0 0",
              borderColor: `${RIBBON_ACCENT} transparent transparent transparent`,
            }}
          />
          <div
            style={{
              position: "absolute", top: 5, right: 0, width: 0, height: 0,
              borderStyle: "solid", borderWidth: "8px 0 0 4px",
              borderColor: `${RIBBON_ACCENT} transparent transparent transparent`,
            }}
          />
        </div>
      );
  }
}

export default function DocumentStack({
  phase,
  reduceMotion,
}: {
  phase: "idle" | "hover" | "open";
  reduceMotion: boolean;
}) {
  return (
    <>
      {SHEETS.map((sheet, i) => {
        const isTopSheet = i === TOP_SHEET_INDEX;

        // Rise: idle (resting peek) → hover (6–10px pre-open cue) → open
        // (further rise, revealed by the flap swinging away).
        const rise = phase === "open" ? 16 : phase === "hover" ? 7 : 0;
        const y = sheet.top - rise;

        // Fan: rotation spread doubles on open — "documents fan out
        // slightly before settling" — plus the top sheet gets an extra
        // independent tilt on hover as a "click me" cue.
        const rotate =
          phase === "open"
            ? sheet.rotate * 2
            : phase === "hover" && isTopSheet
            ? sheet.rotate + 5
            : sheet.rotate;

        if (reduceMotion) {
          // Still visible at rest (that's the whole point — the folder
          // should read as full without needing to be opened first) —
          // just no float/rise/fan motion, only an instant position jump
          // between phases.
          return (
            <div
              key={sheet.decoration}
              style={{
                position: "absolute",
                left: sheet.left, width: sheet.width, top: y,
                height: 36, borderRadius: "3px 6px 4px 4px",
                background: PAPER_COLOR,
                transform: `rotate(${rotate}deg)`,
                zIndex: 2 + i,
              }}
            >
              <SheetDecoration type={sheet.decoration} />
            </div>
          );
        }

        return (
          <motion.div
            key={sheet.decoration}
            initial={false}
            animate={{
              y: [y - 0.6, y, y - 0.6],
              rotate,
              opacity: 1,
            }}
            transition={{
              y: {
                duration: sheet.idleDuration,
                delay: sheet.idleDelay,
                repeat: Infinity,
                ease: "easeInOut",
                // Occasional tiny settling pause rather than a smooth,
                // perfectly regular bob.
                times: [0, 0.55, 1],
              },
              rotate: phase === "open" ? SPRING_OPEN : SPRING_CALM,
              opacity: { duration: 0.2 },
            }}
            style={{
              position: "absolute",
              left: sheet.left, width: sheet.width, top: 0,
              height: 36, borderRadius: "3px 6px 4px 4px",
              background: PAPER_COLOR,
              boxShadow: "0 3px 8px rgba(0,0,0,0.28)",
              zIndex: 2 + i,
            }}
          >
            <SheetDecoration type={sheet.decoration} />
          </motion.div>
        );
      })}
    </>
  );
}
