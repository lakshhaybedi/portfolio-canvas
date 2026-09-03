"use client";

import { motion, AnimatePresence } from "framer-motion";

/** Clipboard glyph that swaps to a checkmark once the copy lands. */
export function ClipboardIcon({ size = 13, copied }: { size?: number; copied?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      {copied ? (
        <path d="M3.5 8.5l3 3 6-6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <>
          <rect x="4.5" y="2.5" width="7" height="2.4" rx="0.6" stroke="currentColor" strokeWidth="1.2" />
          <path d="M4.5 3.8H3.8a1 1 0 0 0-1 1v8.7a1 1 0 0 0 1 1h8.4a1 1 0 0 0 1-1V4.8a1 1 0 0 0-1-1h-.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

/** Small bubble anchored above the trigger — same pattern as this site's
 * other hover popovers, just click-triggered instead. */
export function CopiedToast({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          initial={{ opacity: 0, y: 4, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.96 }}
          transition={{ duration: 0.16 }}
          role="status"
          style={{
            position: "absolute", bottom: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)",
            whiteSpace: "nowrap", background: "var(--fg)", color: "var(--fg-invert)",
            fontSize: 11, fontWeight: 600, letterSpacing: "0.02em",
            padding: "6px 11px", borderRadius: 6, zIndex: 20, pointerEvents: "none",
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
          }}
        >
          Email ID copied to clipboard
        </motion.span>
      )}
    </AnimatePresence>
  );
}
