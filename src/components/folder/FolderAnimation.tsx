"use client";

import { motion } from "framer-motion";
import DocumentStack from "./DocumentStack";
import {
  FOLDER_BODY,
  FOLDER_BORDER,
  FOLDER_BORDER_HOVER,
  FOLDER_PANEL,
  FOLDER_TAB,
  SPRING_CALM,
  SPRING_OPEN,
} from "./folderPalette";

const FOLDER_WIDTH = 92;
// Closed: flap spans the full body width. Open: it narrows and centers,
// so the back panel's own rounded corners peek out on either side as
// "ears" beside the fanned papers — this is what actually reads as an
// open folder/basket silhouette, not the flap's rotation.
const FLAP_WIDTH_CLOSED = FOLDER_WIDTH;
const FLAP_WIDTH_OPEN = 60;
const FLAP_LEFT_OPEN = (FOLDER_WIDTH - FLAP_WIDTH_OPEN) / 2;

/**
 * Pure visual folder graphic — closed/open cover-flap animation, the
 * document-stack peeking out, and the palette that makes the whole thing
 * read as an object sitting in front of the page rather than part of it.
 * No position or page-level state lives here; the parent (PortfolioFolder)
 * owns idle bob and open/closed/focus state. Hover/focus only brighten the
 * border and shadow below — no hover-triggered movement (flap peek, papers
 * rising) on purpose, per explicit "remove the move hover effects" request.
 *
 * The flap animates width/height/position rather than a 3D rotateX flip —
 * a flat 2D morph reads cleanly at this size and matches the reference
 * "open basket" silhouette; the earlier perspective flip didn't shrink the
 * flap at all, so the back panel's corners never had room to show through.
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
    <div style={{ width: FOLDER_WIDTH, height: 78, position: "relative" }}>
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
        }}
      />

      {/* Back panel (the folder's body) — shape never changes; it's the
          flap narrowing on top of it that reveals its corners as ears. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 12,
          background: FOLDER_BODY,
          border: `1px solid ${border}`,
          boxShadow: active ? "0 18px 40px rgba(0,0,0,0.55)" : "0 6px 16px rgba(0,0,0,0.4)",
          transition: "border-color 0.25s ease, box-shadow 0.3s ease",
        }}
      />

      {/* Documents peeking out — visible at rest, not just once opened, so
          the folder reads as "full" immediately. */}
      <DocumentStack phase={phase} reduceMotion={reduceMotion} />

      {/* Front flap — narrows and centers on open, tucking the papers into
          a "pocket" between it and the back panel's exposed corners. */}
      <motion.div
        initial={false}
        animate={{
          width: isOpen ? FLAP_WIDTH_OPEN : FLAP_WIDTH_CLOSED,
          left: isOpen ? FLAP_LEFT_OPEN : 0,
          height: isOpen ? "46%" : "62%",
        }}
        transition={reduceMotion ? { duration: 0.12 } : spring}
        style={{
          position: "absolute",
          bottom: 0,
          borderRadius: isOpen ? "10px 10px 12px 12px" : "6px 6px 12px 12px",
          background: FOLDER_PANEL,
          border: `1px solid ${border}`,
          transition: "border-color 0.25s ease, border-radius 0.25s ease",
          zIndex: 10,
        }}
      />
    </div>
  );
}
