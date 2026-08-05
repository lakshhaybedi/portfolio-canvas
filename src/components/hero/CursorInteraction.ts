"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

/**
 * Unprojects the pointer onto a fixed-height ground plane (the particle
 * grid's resting Y) each frame and writes the result into a ref — not React
 * state — so reading it never triggers a re-render. Must be called from a
 * component rendered inside `<Canvas>` (uses `useThree`/`useFrame`).
 *
 * Doesn't start raycasting until the pointer has actually moved at least
 * once. r3f's `pointer` defaults to (0,0) — screen center — before any real
 * mouse movement, and that used to get raycast onto the ground plane every
 * frame regardless, parking the cursor-repel effect at whatever the center
 * ray happens to hit (near the horizon in this scene) and showing up as a
 * permanent crater in the wave on page load, before the user ever touched
 * their mouse.
 */
export function useCursorWorldPosition(planeY: number, enabled: boolean) {
  // Parked far outside the grid until real movement is observed, so the
  // repel effect in the shader (which only kicks in within a small radius)
  // has nothing to react to yet.
  const worldPos = useRef(new THREE.Vector3(9999, planeY, 9999));
  const hasMoved = useRef(false);
  const { camera, pointer } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -planeY), [planeY]);

  useEffect(() => {
    const markMoved = () => {
      hasMoved.current = true;
    };
    window.addEventListener("pointermove", markMoved, { once: true });
    return () => window.removeEventListener("pointermove", markMoved);
  }, []);

  useFrame(() => {
    if (!enabled || !hasMoved.current) return;
    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.intersectPlane(plane, worldPos.current);
  });

  return worldPos;
}
