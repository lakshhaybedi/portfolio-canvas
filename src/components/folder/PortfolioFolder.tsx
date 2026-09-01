"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useWindowStore } from "@/lib/useWindowStore";
import { useHasFinePointer } from "@/lib/useHasFinePointer";
import { DOCUMENTS } from "@/lib/documents";
import FolderAnimation from "./FolderAnimation";
import FolderContents from "./FolderContents";
// WormholeCard import removed with its render below — see the comment
// at the bottom of this file for how to restore both.
import { FOLDER_LABEL, SPRING_HOVER, type FolderPhase } from "./folderPalette";

const WIDGET_WIDTH = 140;
// Max cursor-tracked tilt, in degrees — subtle on purpose ("tilts slightly
// toward the cursor", not a full tilt-card effect).
const TILT_RANGE = 5;

/**
 * The folder as a single explicit state machine — idle, hover, opening,
 * open, closing — rather than a pair of loosely-related booleans. opening→
 * open and closing→idle/hover both fire from a real Framer Motion
 * onAnimationComplete callback (see handleSettled/FolderAnimation's
 * onLastPaperSettled), not a setTimeout guessing how long the animation
 * takes.
 *
 * Two independent motion layers, deliberately: the outer one owns the
 * phase-driven pose (idle float/rotate loop, hover lift+scale, opening/open
 * lift) and the inner one owns only the cursor-tracked tilt. Combining a
 * `repeat: Infinity` idle loop with a value that changes on every
 * pointermove in the same `animate` call risks Framer treating each
 * pointermove as a reason to restart the loop; splitting them into two
 * layers removes that risk entirely rather than hoping it doesn't happen.
 */
export default function PortfolioFolder() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [phase, setPhase] = useState<FolderPhase>("idle");
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const hoveringRef = useRef(false);
  const reduceMotion = !!useReducedMotion();
  const isFinePointer = useHasFinePointer();
  const openWindow = useWindowStore((s) => s.openWindow);
  const setFolderAnchor = useWindowStore((s) => s.setFolderAnchor);

  const isOpenish = phase === "opening" || phase === "open";

  useEffect(() => {
    const place = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (vw < 260 || vh < 300) return;
      setPos({ x: vw - WIDGET_WIDTH - 60, y: vh * 0.18 });
    };
    place();
    const raf = requestAnimationFrame(place);
    window.addEventListener("resize", place);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", place);
    };
  }, []);

  // Report the folder's on-screen center so window close animations have a
  // target to fly back toward.
  useEffect(() => {
    const report = () => {
      const el = wrapperRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setFolderAnchor({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    };
    report();
    window.addEventListener("resize", report);
    return () => window.removeEventListener("resize", report);
  }, [pos, setFolderAnchor]);

  const requestClose = useCallback(() => {
    setPhase((p) => (p === "open" ? "closing" : p));
  }, []);

  // Click-outside (and Escape) closes the open panel.
  useEffect(() => {
    if (phase !== "open") return;
    const onDocClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        requestClose();
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    window.addEventListener("mousedown", onDocClick);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [phase, requestClose]);

  const handleOpenDoc = (docId: string) => {
    openWindow(docId);
  };

  const handlePointerEnter = () => {
    hoveringRef.current = true;
    setPhase((p) => (p === "idle" ? "hover" : p));
  };

  const handlePointerLeave = () => {
    hoveringRef.current = false;
    setTilt({ x: 0, y: 0 });
    setPhase((p) => (p === "hover" ? "idle" : p));
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion || (phase !== "hover" && phase !== "idle")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -py * TILT_RANGE, y: px * TILT_RANGE });
  };

  const handleClick = () => {
    setTilt({ x: 0, y: 0 });
    setPhase((p) => {
      if (p === "idle" || p === "hover") return "opening";
      if (p === "open") return "closing";
      return p; // ignore clicks mid-transition
    });
  };

  // Keyboard focus gets the same hover-equivalent cue a mouse user gets —
  // tracked separately from hoveringRef so a blur only reverts to idle if
  // the mouse isn't *also* currently over the folder.
  const handleFocus = () => {
    setPhase((p) => (p === "idle" ? "hover" : p));
  };

  const handleBlur = () => {
    setPhase((p) => (p === "hover" && !hoveringRef.current ? "idle" : p));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  // The one real completion signal driving opening→open and closing→
  // idle/hover — fired by the last-settling paper sheet (see
  // FolderAnimation → DocumentStack's onAnimationComplete wiring).
  const handleSettled = useCallback(() => {
    setPhase((p) => {
      if (p === "opening") return "open";
      if (p === "closing") return hoveringRef.current ? "hover" : "idle";
      return p;
    });
  }, []);

  // Turn lives on the inner layer (with the cursor tilt), not here —
  // FolderContents is a sibling of that inner layer, not a child of it, so
  // the document list panel stays level and readable while the folder
  // graphic itself turns.
  const outerPose = reduceMotion
    ? undefined
    : phase === "idle"
    ? { y: [0, -3, 0], scale: 1, rotate: [0, 1.4, 0, -1.4, 0] }
    : phase === "hover"
    ? { y: -3, scale: 1.03, rotate: 0 }
    : { y: -4, scale: 1.02, rotate: 0 }; // opening / open / closing

  // A horizontal-axis turn (rotateY — the folder swivels left around its
  // vertical axis, like a door), not an in-plane rotate (rotateZ, which
  // would tilt it and read as clockwise/counter-clockwise spin instead).
  const openTurnY = phase === "opening" || phase === "open" ? -25 : 0;

  const outerTransition = reduceMotion
    ? undefined
    : phase === "idle"
    ? {
        y: { duration: 3.6, repeat: Infinity, ease: "easeInOut" as const },
        rotate: { duration: 5.4, repeat: Infinity, ease: "easeInOut" as const },
      }
    : SPRING_HOVER;

  return (
    <div
      ref={wrapperRef}
      className="portfolio-folder-float"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 300,
        width: WIDGET_WIDTH,
        opacity: pos ? 1 : 0,
        transform: pos ? `translate(${pos.x}px, ${pos.y}px)` : undefined,
        transition: "opacity 0.6s ease 0.5s",
      }}
    >
      <motion.div
        role="button"
        tabIndex={0}
        aria-haspopup="true"
        aria-expanded={isOpenish}
        aria-label={`My Documents folder, ${DOCUMENTS.length} documents`}
        onMouseEnter={handlePointerEnter}
        onMouseLeave={handlePointerLeave}
        onMouseMove={handlePointerMove}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        animate={outerPose}
        transition={outerTransition}
        style={{
          position: "relative",
          width: WIDGET_WIDTH,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          // `cursor: pointer` here overrode the page's `cursor: none`, so the
          // custom dot and the OS hand rendered on top of each other. Same
          // fine-pointer guard the rest of the page's interactive elements
          // already use.
          cursor: isFinePointer ? "none" : "pointer",
          userSelect: "none",
        }}
      >
        {/* Inner layer: cursor-tracked tilt plus the open-state horizontal
            turn, fully decoupled from the outer pose above. FolderContents
            is deliberately outside this layer (see outerPose comment). */}
        <motion.div
          animate={reduceMotion ? undefined : { rotateX: tilt.x, rotateY: tilt.y + openTurnY }}
          transition={reduceMotion ? undefined : SPRING_HOVER}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            transformStyle: "preserve-3d",
          }}
        >
          <FolderAnimation phase={phase} reduceMotion={reduceMotion} onLastPaperSettled={handleSettled} />

          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: FOLDER_LABEL,
            }}
          >
            My Documents
          </span>
        </motion.div>

        <AnimatePresence>
          {isOpenish && <FolderContents onOpenDoc={handleOpenDoc} />}
        </AnimatePresence>
      </motion.div>

      {/* WormholeCard (→ /me, "Off The Clock") is unplugged for now — that
          page is offline while it's reworked. Component and route are both
          still in the repo; re-add the block below to bring the entry point
          back once it's ready.
      <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
        <WormholeCard />
      </div>
      */}
    </div>
  );
}
