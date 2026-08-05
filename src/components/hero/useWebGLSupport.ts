"use client";

import { useEffect, useState } from "react";

export function isWebGLSupported(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

/** Client-only WebGL capability check — starts `false` to stay SSR-safe, resolves on mount. */
export function useWebGLSupport(): boolean {
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    setSupported(isWebGLSupported());
  }, []);
  return supported;
}
