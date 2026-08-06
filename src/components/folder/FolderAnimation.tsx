"use client";

import { motion } from "framer-motion";
import DocumentStack from "./DocumentStack";
import {
  type FolderPhase,
  FOLDER_BODY,
  FOLDER_BORDER,
  FOLDER_BORDER_HOVER,
  FOLDER_PANEL,
  FOLDER_TAB,
  SPRING_BODY,
} from "./folderPalette";

const FOLDER_WIDTH = 92;
const FOLDER_HEIGHT = 78;

// Stage delays (seconds) relative to the phase change, per the brief's
// staged sequence — flap first, back panel just behind it, then papers
// (own 40ms-per-sheet stagger starting after PAPERS_BASE_DELAY, see
// DocumentStack). All state-driven: each of these is a `transition.delay`
// Framer owns, not a setTimeout we're racing against.
const FLAP_DELAY = 0.04;
const BACK_TILT_DELAY = 0.1;
// 84deg reduced ~60% per feedback — the full hinge-flat open read as too
// much motion; this keeps a real hinge rotation but far more restrained.
const FLAP_OPEN_DEG = 34;

/**
 * The folder as one physical object: a back panel, the paper stack, and a
 * front flap hinged at the bottom, all sharing real 3D transforms under one
 * `perspective` — not independently-animated rectangles. Closed → open is a
 * single staged sequence (flap rotates open on its hinge, the back panel
 * tilts back very slightly for depth, papers rise last), all driven by
 * `phase` rather than separate isOpen/isHovered booleans.
 */
export default function FolderAnimation({
  phase,
  reduceMotion,
  onLastPaperSettled,
}: {
  phase: FolderPhase;
  reduceMotion: boolean;
  onLastPaperSettled: () => void;
}) {
  const active = phase !== "idle";
  const isOpenish = phase === "opening" || phase === "open";
  const border = active ? FOLDER_BORDER_HOVER : FOLDER_BORDER;
  const flapTransition = reduceMotion
    ? { duration: 0.12 }
    : { ...SPRING_BODY, delay: isOpenish ? FLAP_DELAY : 0 };
  const backTransition = reduceMotion
    ? { duration: 0.12 }
    : { ...SPRING_BODY, delay: isOpenish ? BACK_TILT_DELAY : 0 };

  return (
    <div
      style={{
        width: FOLDER_WIDTH,
        height: FOLDER_HEIGHT,
        position: "relative",
        perspective: 900,
      }}
    >
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
          borderTop: `1px solid ${border}`,
          borderLeft: `1px solid ${border}`,
          borderRight: `1px solid ${border}`,
          borderBottom: "none",
          transition: "border-color 0.25s ease",
        }}
      />

      {/* Back panel — tilts back a few degrees on open (Stage 3: "very
          subtle, creates depth"). Hinged at the bottom so its top edge is
          what moves, opening a sliver of space above the flap. */}
      <motion.div
        initial={false}
        animate={{ rotateX: isOpenish ? -7 : 0 }}
        transition={backTransition}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 12,
          background: FOLDER_BODY,
          border: `1px solid ${border}`,
          boxShadow: active ? "0 18px 40px rgba(0,0,0,0.5)" : "0 6px 16px rgba(0,0,0,0.35)",
          transformOrigin: "bottom center",
          transition: "border-color 0.25s ease, box-shadow 0.3s ease",
        }}
      />

      {/* Documents — between the back panel and the flap in both z-order
          and physical position, so nothing clips through either. */}
      <DocumentStack phase={phase} reduceMotion={reduceMotion} onLastSettled={onLastPaperSettled} />

      {/* Front flap — a real hinge rotation on its bottom edge, not a
          resize or fade. Rotates away from the viewer (down and back),
          the way a real folder cover falls open. */}
      <motion.div
        initial={false}
        animate={{ rotateX: isOpenish ? FLAP_OPEN_DEG : 0 }}
        transition={flapTransition}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "58%",
          borderRadius: "6px 6px 12px 12px",
          background: FOLDER_PANEL,
          border: `1px solid ${border}`,
          transformOrigin: "bottom center",
          transformStyle: "preserve-3d",
          transition: "border-color 0.25s ease",
          zIndex: 10,
        }}
      />
    </div>
  );
}
