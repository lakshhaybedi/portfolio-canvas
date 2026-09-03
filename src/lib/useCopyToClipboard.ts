"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Copies text and flips `copied` true for `holdMs`, for a click-to-copy
 * button's icon/toast to key off. Falls back to the old execCommand trick
 * when `navigator.clipboard` is unavailable (non-secure context, or a
 * browser old enough not to have it) rather than silently doing nothing.
 */
export function useCopyToClipboard(holdMs = 1800) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch { /* nothing left to try */ }
      document.body.removeChild(ta);
    }
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), holdMs);
  }, [holdMs]);

  return { copy, copied };
}
