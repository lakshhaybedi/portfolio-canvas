"use client";

import { useEffect, useState } from "react";

// `navigator.deviceMemory` (Chrome/Edge/Android only — the exact browsers
// ChromeOS ships) reports RAM in GB; `hardwareConcurrency` reports logical
// cores and is broadly supported. Both are `undefined` where unsupported —
// treated as "not low-end" (fail open) so browsers that don't expose them
// (Safari, Firefox) never get downgraded just for lacking the API. A 2014
// Chromebook (dual-core Celeron, 2-4GB RAM) trips either threshold; a
// typical modern laptop trips neither.
function isLowEndDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const cores = navigator.hardwareConcurrency;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  return (cores !== undefined && cores <= 2) || (memory !== undefined && memory <= 2);
}

/**
 * Client-only low-end-hardware check — gates GPU-expensive effects (the
 * WebGL particle hero's persistent shader loop, `backdrop-filter` blur on
 * frequently-visible surfaces) off devices too weak to run them smoothly.
 * Same category of fallback as `prefers-reduced-motion`, just triggered by
 * hardware instead of a stated preference. Starts `false` to stay
 * SSR-safe, resolves on mount.
 */
export function useIsLowEndDevice(): boolean {
  const [lowEnd, setLowEnd] = useState(false);
  useEffect(() => {
    setLowEnd(isLowEndDevice());
  }, []);
  return lowEnd;
}
