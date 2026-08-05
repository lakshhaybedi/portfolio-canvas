"use client";

import { type RefObject, useEffect, useState } from "react";
import { useScroll, useTransform } from "framer-motion";

/**
 * Single shared scroll-progress source for the hero DOM content: 0 at the
 * top of the hero, 1 once it has scrolled fully out of view. Used only for
 * HeroContent's own fade/slide — the WebGL background now lives outside the
 * hero section (see usePageMorphProgress) so it can keep rendering as a
 * fixed layer for the rest of the page.
 */
export function useHeroScrollProgress(heroRef: RefObject<HTMLElement>) {
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  return scrollYProgress;
}

/**
 * Page-wide morph progress for the fixed particle background: 0 at the very
 * top of the document, ramping to 1 over roughly the first viewport height
 * of scrolling, then holding at 1 for the rest of the (much longer) page —
 * matching "forms near the top, stays formed while scrolling, reverses only
 * back near the top" rather than tracking whole-document scroll length.
 */
export function usePageMorphProgress() {
  const { scrollY } = useScroll();
  const [viewportHeight, setViewportHeight] = useState(800);

  useEffect(() => {
    const update = () => setViewportHeight(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return useTransform(scrollY, [0, viewportHeight * 0.9], [0, 1]);
}
