"use client";

import { motion } from "framer-motion";
import DocumentStack from "./DocumentStack";
import {
  FOLDER_BODY,
  FOLDER_BORDER,
  FOLDER_BORDER_HOVER,
  FOLDER_TAB,
  SPRING_CALM,
  SPRING_OPEN,
} from "./folderPalette";

const FOLDER_WIDTH = 92;
const FOLDER_HEIGHT = 78;
// The SVG canvas is 10px taller than the folder body itself, purely to give
// the open-state "ear" peaks (see below) room to rise above the body's flat
// closed-state top edge without getting clipped. The body occupies y=10..88
// in this canvas in both states; only the top edge's shape changes.
const SVG_HEIGHT = FOLDER_HEIGHT + 10;

// One shape, not two overlapping divs. The previous version used a static
// "back panel" rect plus a separately-rounded "flap" rect narrowing on top
// of it — closer inspection (real screenshots, not just this pane's flaky
// rendering) showed that reads as a visible seam/second-rectangle artifact
// rather than a folder, because two independently-rounded corners never
// align into one silhouette. A single path morphing its top edge between a
// flat line (closed) and two "ear" peaks with a center dip (open) is what
// actually produces the reference's cohesive open-basket outline — and
// Framer Motion animates an SVG path's `d` attribute directly as long as
// both strings share the same command sequence, which these do (only the
// three middle top-edge points' coordinates differ).
const CLOSED_PATH =
  "M12,10 L32,10 L46,10 L60,10 L80,10 Q92,10 92,22 L92,76 Q92,88 80,88 L12,88 Q0,88 0,76 L0,22 Q0,10 12,10 Z";
const OPEN_PATH =
  "M12,10 L24,3 L46,15 L68,3 L80,10 Q92,10 92,22 L92,76 Q92,88 80,88 L12,88 Q0,88 0,76 L0,22 Q0,10 12,10 Z";

/**
 * Pure visual folder graphic — closed/open shape morph, the document-stack
 * peeking out, and the palette that makes the whole thing read as an object
 * sitting in front of the page rather than part of it. No position or
 * page-level state lives here; the parent (PortfolioFolder) owns idle bob
 * and open/closed/focus state. Hover/focus only brighten the border and
 * shadow below — no hover-triggered movement (papers rising) on purpose,
 * per explicit "remove the move hover effects" request.
 */
export default function FolderAnimation({
  isOpen,
  isHovered,
  reduceMotion,
}: {
  isOpen: boolean;
  isHovered: boolean;
  reduceMotion: boolean;
}) {
  const phase: "idle" | "open" = isOpen ? "open" : "idle";
  const active = isOpen || isHovered;
  const border = active ? FOLDER_BORDER_HOVER : FOLDER_BORDER;
  const spring = isOpen ? SPRING_OPEN : SPRING_CALM;

  return (
    <div style={{ width: FOLDER_WIDTH, height: FOLDER_HEIGHT, position: "relative" }}>
      {/* Tab */}
      <div
        style={{
          position: "absolute",
          top: -8,
          left: 12,
          width: 36,
          height: 14,
          borderRadius: "6px 6px 0 0",
          background: FOLDER_TAB,
          // Longhand-only on purpose: mixing the `border` shorthand with a
          // `borderBottom` override on the same element is unreliable once
          // the color actually changes between renders (React warns —
          // shorthand vs. longhand for the same sides can lose updates).
          borderTop: `1px solid ${border}`,
          borderLeft: `1px solid ${border}`,
          borderRight: `1px solid ${border}`,
          borderBottom: "none",
          transition: "border-color 0.25s ease",
          zIndex: 1,
        }}
      />

      {/* Documents peeking out — visible at rest, not just once opened, so
          the folder reads as "full" immediately. Sits above the body path
          in z-order but below nothing else — the body's own top edge dips
          in open state specifically to give this room. */}
      <DocumentStack phase={phase} reduceMotion={reduceMotion} />

      {/* Body — a single path, not layered rectangles. Its top edge morphs
          from a flat line into two raised "ears" with a center dip, which
          is what actually reads as an open folder/basket, not a rotation
          or a second shape sliding on top. */}
      <svg
        width={FOLDER_WIDTH}
        height={SVG_HEIGHT}
        viewBox={`0 0 ${FOLDER_WIDTH} ${SVG_HEIGHT}`}
        style={{
          position: "absolute",
          left: 0,
          top: -10,
          overflow: "visible",
          filter: active
            ? "drop-shadow(0 18px 26px rgba(0,0,0,0.5))"
            : "drop-shadow(0 6px 10px rgba(0,0,0,0.35))",
          transition: "filter 0.3s ease",
        }}
      >
        <motion.path
          initial={false}
          animate={{ d: isOpen ? OPEN_PATH : CLOSED_PATH }}
          transition={reduceMotion ? { duration: 0.12 } : spring}
          fill={FOLDER_BODY}
          stroke={border}
          strokeWidth={1}
          style={{ transition: "stroke 0.25s ease" }}
        />
      </svg>
    </div>
  );
}
