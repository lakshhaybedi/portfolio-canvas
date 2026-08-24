"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useHasFinePointer } from "@/lib/useHasFinePointer";
import { FOLDER_LABEL, SPRING_HOVER } from "./folderPalette";

// Sits under the documents folder as its own widget — same icon-above-label
// anatomy as the folder so the pair reads as one shelf, but a rotating
// accretion disc instead of a folder body, since this one leaves the page
// rather than opening in place.
export default function WormholeCard() {
  const isFinePointer = useHasFinePointer();
  const reduceMotion = useReducedMotion();

  return (
    <motion.div whileHover={reduceMotion ? undefined : { scale: 1.08 }} transition={SPRING_HOVER}>
      <Link
        href="/me"
        aria-label="Off The Clock — music, games, other distractions"
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          textDecoration: "none", color: "inherit",
          cursor: isFinePointer ? "none" : "pointer",
        }}
      >
        <motion.svg
          width="64" height="64" viewBox="0 0 30 30"
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="wh-core">
              <stop offset="0%" stopColor="#0A0A0A" />
              <stop offset="55%" stopColor="#0A0A0A" />
              <stop offset="100%" stopColor="#C9A227" />
            </radialGradient>
          </defs>
          {/* Concentric rings at one shared tilt, each smaller and drifting
              up toward the core — same tilt is what reads as a funnel
              receding into a throat; varying the tilt per ring would read
              as a gyroscope instead. */}
          <g transform="rotate(-18 15 15)">
            <ellipse cx="15" cy="16.5" rx="13" ry="4.6" fill="none" stroke="#C9A227" strokeWidth="0.9" opacity="0.22" />
            <ellipse cx="15" cy="16.0" rx="10.4" ry="3.7" fill="none" stroke="#C9A227" strokeWidth="0.9" opacity="0.38" />
            <ellipse cx="15" cy="15.5" rx="8.0" ry="2.8" fill="none" stroke="#E3BE45" strokeWidth="0.9" opacity="0.58" />
            <ellipse cx="15" cy="15.1" rx="5.8" ry="2.0" fill="none" stroke="#E3BE45" strokeWidth="0.9" opacity="0.8" />
            <ellipse cx="15" cy="14.8" rx="3.8" ry="1.3" fill="none" stroke="#E3BE45" strokeWidth="0.9" opacity="1" />
            <ellipse cx="15" cy="14.6" rx="2.0" ry="0.7" fill="url(#wh-core)" />
          </g>
        </motion.svg>

        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
          textTransform: "uppercase", color: FOLDER_LABEL, whiteSpace: "nowrap",
        }}>
          Off The Clock
        </span>
      </Link>
    </motion.div>
  );
}
