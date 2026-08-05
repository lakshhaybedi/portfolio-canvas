"use client";

import { motion } from "framer-motion";
import DocumentStack from "./DocumentStack";
import {
  FOLDER_BODY,
  FOLDER_BORDER,
  FOLDER_BORDER_HOVER,
  FOLDER_PANEL,
  FOLDER_TAB,
} from "./folderPalette";

const FLAP_SPRING = { type: "spring" as const, stiffness: 300, damping: 26 };

/**
 * Pure visual folder graphic — closed/open cover-flap animation, the
 * document-stack peeking out, and the palette that makes the whole thing
 * read as an object sitting in front of the page rather than part of it.
 * No position, drag, or page-level state lives here; the parent
 * (PortfolioFolder) owns idle bob, mouse-tilt, and open/closed/focus state.
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
  const flapOpenDeg = reduceMotion ? (isOpen ? 38 : 0) : isOpen ? 38 : isHovered ? 2 : 0;
  const phase: "idle" | "hover" | "open" = isOpen ? "open" : isHovered ? "hover" : "idle";
  const active = isOpen || isHovered;
  const border = active ? FOLDER_BORDER_HOVER : FOLDER_BORDER;

  return (
    <div style={{ width: 92, height: 78, position: "relative", perspective: 700 }}>
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

      {/* Back panel (the folder's body) */}
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

      {/* Front flap — rotates open around its bottom edge, slightly delayed
          relative to the papers so the sequence reads as "papers rise
          first, then the folder opens" rather than everything at once. */}
      <motion.div
        animate={{ rotateX: flapOpenDeg }}
        transition={reduceMotion ? { duration: 0.12 } : { ...FLAP_SPRING, delay: isOpen ? 0.1 : 0 }}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "62%",
          borderRadius: "6px 6px 12px 12px",
          background: FOLDER_PANEL,
          border: `1px solid ${border}`,
          transformOrigin: "bottom center",
          transition: "border-color 0.25s ease",
          zIndex: 10,
        }}
      />
    </div>
  );
}
