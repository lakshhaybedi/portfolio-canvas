"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useWindowStore } from "@/lib/useWindowStore";
import { DOCUMENTS } from "@/lib/documents";
import FolderAnimation from "./FolderAnimation";
import FolderContents from "./FolderContents";
import { FOLDER_LABEL } from "./folderPalette";

const WIDGET_WIDTH = 140;

/**
 * Replaces the old draggable ID card. Sits fixed in roughly the same screen
 * slot, but isn't itself draggable — no mouse-tilt or hover-triggered
 * movement either (removed per explicit request); only the idle float and
 * open/close stay animated. Hover/focus still brighten the border/shadow
 * (see FolderAnimation) — that's a color cue, not a "move" effect.
 */
export default function PortfolioFolder() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const reduceMotion = !!useReducedMotion();
  const openWindow = useWindowStore((s) => s.openWindow);
  const setFolderAnchor = useWindowStore((s) => s.setFolderAnchor);

  useEffect(() => {
    let placedOnce = false;

    const place = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (vw < 400 || vh < 300) return;

      if (!placedOnce) {
        setPos({ x: vw - WIDGET_WIDTH - 60, y: vh * 0.18 });
        placedOnce = true;
      }
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
  // target to fly back toward. Recomputed on resize since placement above
  // is viewport-relative.
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

  // Click-outside (and Escape) closes the open panel.
  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("mousedown", onDocClick);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const handleOpenDoc = (docId: string) => {
    openWindow(docId);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      // Space would otherwise scroll the page — this element isn't a
      // native <button>, so that default has to be suppressed by hand.
      e.preventDefault();
      setIsOpen((v) => !v);
    }
  };

  // Hover and keyboard focus both count as "actively pointed at" for the
  // folder's border/shadow highlight (color only, no movement) — a
  // keyboard user tabbing to the folder should see the same cue a mouse
  // user gets from hovering.
  const active = isHovered || isFocused;

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
        aria-expanded={isOpen}
        aria-label={`My Documents folder, ${DOCUMENTS.length} documents`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onClick={() => setIsOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        animate={
          reduceMotion
            ? undefined
            : { y: isOpen ? 0 : [0, -3, 0] }
        }
        transition={
          reduceMotion
            ? undefined
            : { duration: 3.6, repeat: isOpen ? 0 : Infinity, ease: "easeInOut" }
        }
        style={{
          position: "relative",
          width: WIDGET_WIDTH,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <FolderAnimation isOpen={isOpen} isHovered={active} reduceMotion={reduceMotion} />

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

        <AnimatePresence>
          {isOpen && <FolderContents onOpenDoc={handleOpenDoc} />}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
