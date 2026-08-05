"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  // Opacity-only: animating `y` here would apply a CSS transform to this
  // wrapper, which creates a new containing block and breaks every
  // `position: fixed` descendant (nav, cursor, ID card, scroll bar) — they'd
  // start tracking this div instead of the viewport.
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduceMotion ? 0.15 : 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
