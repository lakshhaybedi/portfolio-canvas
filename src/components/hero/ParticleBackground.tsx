"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import { useWebGLSupport } from "./useWebGLSupport";
import { useHasFinePointer } from "@/lib/useHasFinePointer";
import { useIsLowEndDevice } from "@/lib/useIsLowEndDevice";
import { usePageMorphProgress } from "./ScrollController";

// Three.js and the whole @react-three stack live behind this boundary, in
// their own chunk, and are fetched only once the capability checks below
// pass. Nothing in this module statically imports them — that's deliberate,
// and the reason the scene is a separate file: a static import would pull
// ~670KB into the homepage bundle for every visitor, including the ones who
// then render the CSS fallback instead. `ssr: false` because WebGL has no
// browser context during Next's static-export prerender.
const ParticleScene = dynamic(() => import("./ParticleScene"), { ssr: false });

/**
 * Fixed, full-viewport particle background: wave grid at the top of the
 * page, morphing into a slowly-rotating globe as the page scrolls and back
 * again near the top. Self-contained — drives its own page scroll and
 * pointer-capability checks, so it drops into any page with no wiring.
 *
 * Falls back to a plain CSS glow (no Three.js downloaded or mounted at all)
 * when WebGL isn't available, the device is low-end, or the user prefers
 * reduced motion — cheapest and safest way to honor all three.
 */
export default function ParticleBackground() {
  const webglSupported = useWebGLSupport();
  const reducedMotion = useReducedMotion();
  const lowEndDevice = useIsLowEndDevice();
  const interactive = useHasFinePointer();
  const morphProgress = usePageMorphProgress();

  const fixedLayerStyle = {
    position: "fixed" as const,
    inset: 0,
    zIndex: -1,
    pointerEvents: "none" as const,
  };

  // Note this is also the first-paint state on capable devices: the checks
  // resolve on mount, so everyone gets the (free, instant) gradient first
  // and the scene fades in behind the content once it's ready. Nothing in
  // the page's layout depends on which branch wins, so there's no shift.
  if (!webglSupported || reducedMotion || lowEndDevice) {
    return (
      <div
        aria-hidden="true"
        style={{
          ...fixedLayerStyle,
          background:
            "radial-gradient(70% 45% at 50% 55%, rgba(237,234,212,0.08) 0%, rgba(237,234,212,0) 70%)",
        }}
      />
    );
  }

  return <ParticleScene morphProgress={morphProgress} interactive={interactive} />;
}
