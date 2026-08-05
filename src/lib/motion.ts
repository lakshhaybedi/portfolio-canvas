import type { Variants, Transition } from "framer-motion";

export const easeOutExpo: Transition["ease"] = [0.16, 1, 0.3, 1];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: easeOutExpo },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
};

export const staggerContainer = (staggerChildren = 0.1): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren },
  },
});

/** Reduced-motion-safe variant: instant opacity fade, no movement or blur. */
export const fadeUpReduced: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
};

/** Pick the right entrance variant for the current motion preference. */
export function revealVariant(reduced: boolean): Variants {
  return reduced ? fadeUpReduced : fadeUp;
}

export const viewportOnce = { once: true, amount: 0.12 } as const;
