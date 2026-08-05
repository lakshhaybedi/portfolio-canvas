"use client";

import { type MotionValue, useSpring } from "framer-motion";

/**
 * Turns raw scroll progress (0 = wave grid, 1 = fully-formed globe — see
 * usePageMorphProgress for how that range is derived from page scroll) into
 * an eased value with a slight overshoot-and-settle, so the particle cloud
 * never "teleports" into shape. Bidirectional by construction: since this
 * just smooths whatever `scrollYProgress` is doing, scrolling back up drives
 * the spring back toward 0 exactly the same way.
 */
export function useMorphProgress(scrollYProgress: MotionValue<number>, reduced: boolean): MotionValue<number> {
  return useSpring(
    scrollYProgress,
    reduced
      ? { stiffness: 400, damping: 60, mass: 1 } // reduced motion: settle fast, no overshoot
      : { stiffness: 90, damping: 13, mass: 1 } // gives a small physical overshoot past the target before settling
  );
}
