"use client";

import { Canvas } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import ParticleSystem from "./ParticleSystem";
import CameraRig from "./CameraRig";
import { HERO_CAMERA_BASE } from "./sceneConstants";

/**
 * The actual WebGL scene, split out from ParticleBackground so that Three.js
 * (~670KB — roughly half the homepage's JS) sits in its own chunk behind a
 * `dynamic()` boundary.
 *
 * The split is the whole point: `import * as THREE` is a static import, so
 * anything importing this module transitively downloads Three.js the moment
 * that module loads, regardless of what the component decides to render. With
 * the capability checks living in ParticleBackground and the import happening
 * only after they pass, a low-end phone or a reduced-motion visitor now
 * downloads none of it instead of parsing 670KB to then throw it away.
 */
export default function ParticleScene({
  morphProgress,
  interactive,
}: {
  morphProgress: MotionValue<number>;
  interactive: boolean;
}) {
  return (
    <Canvas
      aria-hidden="true"
      camera={{ position: [HERO_CAMERA_BASE.x, HERO_CAMERA_BASE.y, HERO_CAMERA_BASE.z], fov: 55 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" }}
    >
      <ParticleSystem scrollYProgress={morphProgress} />
      <CameraRig scrollYProgress={morphProgress} interactive={interactive} />
    </Canvas>
  );
}
