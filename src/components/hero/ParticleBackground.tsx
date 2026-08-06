"use client";

import { Canvas } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import ParticleSystem from "./ParticleSystem";
import CameraRig from "./CameraRig";
import { useWebGLSupport } from "./useWebGLSupport";
import { useHasFinePointer } from "@/lib/useHasFinePointer";
import { useIsLowEndDevice } from "@/lib/useIsLowEndDevice";
import { usePageMorphProgress } from "./ScrollController";
import { HERO_CAMERA_BASE } from "./sceneConstants";

/**
 * Fixed, full-viewport particle background: wave grid at the top of the
 * page, morphing into a slowly-rotating globe as the page scrolls and back
 * again near the top. Self-contained — drives its own page scroll and
 * pointer-capability checks, so it drops into any page with no wiring.
 *
 * Dynamically imported with `ssr:false` wherever it's used — Three.js needs
 * a real browser/WebGL context, which doesn't exist during Next's static
 * export prerender.
 *
 * Falls back to a plain CSS glow (no Three.js mounted at all) when WebGL
 * isn't available or the user prefers reduced motion — cheapest and safest
 * way to fully honor that preference.
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

  return (
    <Canvas
      aria-hidden="true"
      camera={{ position: [HERO_CAMERA_BASE.x, HERO_CAMERA_BASE.y, HERO_CAMERA_BASE.z], fov: 55 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={fixedLayerStyle}
    >
      <ParticleSystem scrollYProgress={morphProgress} />
      <CameraRig scrollYProgress={morphProgress} interactive={interactive} />
    </Canvas>
  );
}
