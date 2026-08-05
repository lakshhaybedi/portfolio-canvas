"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { useHasFinePointer } from "@/lib/useHasFinePointer";
import { useWindowStore } from "@/lib/useWindowStore";
import { DOCUMENTS } from "@/lib/documents";
import FolderAnimation from "./FolderAnimation";
import FolderContents from "./FolderContents";
import { FOLDER_LABEL } from "./folderPalette";

const WIDGET_WIDTH = 140;
// Cut from 10 to 3.5 and paired with an explicit, generous `perspective` on
// the wrapper below — the tilt read as a dramatic, lopsided lean rather
// than a subtle hover effect at the old range.
const TILT_RANGE = 3.5; // max degrees either direction

/**
 * Replaces the old draggable ID card. Sits fixed in roughly the same screen
 * slot, but isn't itself draggable — the spec's default/hover/click states
 * never mention dragging, only idle float + mouse-tilt + open/close.
 */
export default function PortfolioFolder() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const reduceMotion = !!useReducedMotion();
  const interactive = useHasFinePointer();
  const openWindow = useWindowStore((s) => s.openWindow);
  const setFolderAnchor = useWindowStore((s) => s.setFolderAnchor);

  const rotateXRaw = useMotionValue(0);
  const rotateYRaw = useMotionValue(0);
  const rotateX = useSpring(rotateXRaw, { stiffness: 260, damping: 24 });
  const rotateY = useSpring(rotateYRaw, { stiffness: 260, damping: 24 });

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || reduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const offsetY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    rotateYRaw.set(offsetX * TILT_RANGE);
    rotateXRaw.set(-offsetY * TILT_RANGE);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    rotateXRaw.set(0);
    rotateYRaw.set(0);
  };

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
  // folder's pre-open cues (rise, brighter border) — a keyboard user
  // tabbing to the folder should see the same "click me" signal a mouse
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
        aria-label={`Portfolio folder, ${DOCUMENTS.length} documents`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onClick={() => setIsOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        animate={
          reduceMotion
            ? undefined
            : { y: active || isOpen ? 0 : [0, -3, 0] }
        }
        transition={
          reduceMotion
            ? undefined
            : { duration: 3.6, repeat: active || isOpen ? 0 : Infinity, ease: "easeInOut" }
        }
        whileHover={{ y: -3 }}
        style={{
          position: "relative",
          width: WIDGET_WIDTH,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
          userSelect: "none",
          transformStyle: "preserve-3d",
          // Large, explicit perspective so the mouse-tilt reads as a gentle
          // parallax rather than a fisheye-like lean — the tilt distortion
          // per degree shrinks as this grows.
          perspective: 1400,
          rotateX,
          rotateY,
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
          Portfolio
        </span>

        <AnimatePresence>
          {isOpen && <FolderContents onOpenDoc={handleOpenDoc} />}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
