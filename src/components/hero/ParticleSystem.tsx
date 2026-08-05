"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { generateWaveGridPositions, generateSpherePositions } from "./shapePresets";
import { particleFragmentShader, particleVertexShader } from "./particleShaders";
import { useMorphProgress } from "./MorphController";
import { HERO_LOOK_AT } from "./sceneConstants";

// Pure white now (was the warmer #EAEAE8) — brighter, crisper dots per
// reference image, still with only per-particle opacity variance (done in
// the fragment shader), not hue variance.
const PARTICLE_COLOR = new THREE.Color("#FFFFFF");

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

// Perf-guideline particle-count tiers: mobile/tablet/desktop. Bumped again
// (16k/8k/4k → 18k/9k/4.5k) so density holds up over the extended far reach
// in shapePresets.ts (aspect 1.0→0.75, more rows) — still well within budget
// (the very first version of this hero ran ~11.7k on desktop with no issues).
function tieredParticleCount(): number {
  if (typeof window === "undefined") return 18000;
  const w = window.innerWidth;
  if (w < 768) return 4500;
  if (w < 1024) return 9000;
  return 18000;
}

// Brief's stated ceiling (8-15%) reads as functionally invisible against
// this site's near-black (#0A0A0A) background on a real display — confirmed
// by user report through several rounds (0.24, 0.45, 0.72, 1.152 all still
// not bright enough). 1.8 per explicit "make the dots brighter" request.
export default function ParticleSystem({
  scrollYProgress,
  particleCount,
  particleSize = 1.8,
  waveAmplitude = 1.2,
  waveFrequency = 1.6,
  globeRadius = 6,
  opacity = 1.8,
  rotationSpeed = 0.15,
}: {
  scrollYProgress: MotionValue<number>;
  particleCount?: number;
  particleSize?: number;
  waveAmplitude?: number;
  waveFrequency?: number;
  globeRadius?: number;
  opacity?: number;
  rotationSpeed?: number;
}) {
  const { gl } = useThree();
  const morphProgress = useMorphProgress(scrollYProgress, false);

  const targetCount = useMemo(() => particleCount ?? tieredParticleCount(), [particleCount]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const { positions: grid, count } = generateWaveGridPositions(targetCount);
    const shape = generateSpherePositions(count, { radius: globeRadius });
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) seeds[i] = Math.random();

    geo.setAttribute("position", new THREE.BufferAttribute(grid, 3));
    geo.setAttribute("aShapePos", new THREE.BufferAttribute(shape, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    return geo;
  }, [targetCount, globeRadius]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMorphProgress: { value: 0 },
        uPixelRatio: { value: gl.getPixelRatio() },
        uSize: { value: particleSize },
        uColor: { value: PARTICLE_COLOR },
        uOpacity: { value: opacity },
        uGlobeCenter: { value: HERO_LOOK_AT.clone() },
        uRotationSpeed: { value: rotationSpeed },
        uWaveAmplitude: { value: waveAmplitude },
        uWaveFrequency: { value: waveFrequency },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl]);

  // Dispose GPU resources when this particle system is torn down.
  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((_state, delta) => {
    material.uniforms.uTime.value += delta;
    // Small clamp keeps the spring's overshoot "slight" rather than wild.
    material.uniforms.uMorphProgress.value = clamp(morphProgress.get(), -0.15, 1.15);
  });

  // frustumCulled disabled: Three derives the auto bounding sphere from the
  // `position` attribute (the flat grid) only, which doesn't account for
  // the globe's much larger Y extent applied in the vertex shader — culling
  // against that stale bounds would clip the top/bottom of the formed globe.
  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
