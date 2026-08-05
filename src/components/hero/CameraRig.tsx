"use client";

import { useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";
import { HERO_CAMERA_BASE, HERO_LOOK_AT } from "./sceneConstants";

// Resting framing: elevated slightly, angled down across the particle
// landscape toward a horizon in the upper third of the frame. Must match
// ParticleBackground's initial `camera` prop so there's no jump on mount.
// LOOK_AT never moves, so the globe (centered there too, see
// ParticleSystem/sceneConstants) stays exactly screen-centered through the
// whole dolly regardless of scroll position.
const BASE_POSITION = HERO_CAMERA_BASE;
const LOOK_AT = HERO_LOOK_AT;

// Only ever mounted when reduced-motion is off (ParticleBackground gates
// that), so no internal reduced-motion branching is needed here.
export default function CameraRig({
  scrollYProgress,
  interactive,
}: {
  scrollYProgress: MotionValue<number>;
  interactive: boolean;
}) {
  const { camera, pointer } = useThree();

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Slow autonomous drift — always present, keeps the scene "alive" even
    // with no cursor input.
    const driftX = Math.sin(t * 0.07) * 0.3;
    const driftY = Math.cos(t * 0.05) * 0.15;

    // Mouse parallax — subtle, only for fine-pointer devices.
    const parallaxX = interactive ? pointer.x * 0.45 : 0;
    const parallaxY = interactive ? pointer.y * 0.25 : 0;

    // Gentle scroll-driven dolly deeper into the landscape as it morphs.
    const scroll = clamp01(scrollYProgress.get());
    const targetZ = THREE.MathUtils.lerp(BASE_POSITION.z, BASE_POSITION.z - 2, scroll);

    const targetX = BASE_POSITION.x + driftX + parallaxX;
    const targetY = BASE_POSITION.y + driftY + parallaxY;

    // Heavily damped lerp toward targets — calm, no snapping, no dizziness.
    camera.position.x += (targetX - camera.position.x) * 0.02;
    camera.position.y += (targetY - camera.position.y) * 0.02;
    camera.position.z += (targetZ - camera.position.z) * 0.02;
    camera.lookAt(LOOK_AT);
  });

  return null;
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}
