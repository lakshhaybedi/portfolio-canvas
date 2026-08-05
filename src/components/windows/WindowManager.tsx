"use client";

import { AnimatePresence } from "framer-motion";
import { useWindowStore } from "@/lib/useWindowStore";
import { DOCUMENTS } from "@/lib/documents";
import PDFWindow from "./PDFWindow";

/**
 * Mounted once (in page.tsx, alongside PortfolioFolder). Renders every open
 * window from the store — multiple can be open at once, each independently
 * draggable/closable/focusable (see DraggableWindow for the mechanics).
 *
 * Minimized windows stay mounted (just visually hidden) rather than
 * unmounted, so react-pdf's internal state — current page, zoom — survives
 * a minimize/restore cycle instead of resetting.
 */
export default function WindowManager() {
  const windows = useWindowStore((s) => s.windows);

  return (
    <div
      className="portfolio-folder-float"
      style={{ position: "fixed", inset: 0, zIndex: 500, pointerEvents: "none" }}
      aria-hidden="true"
    >
      <AnimatePresence>
        {windows.map((win) => {
          const doc = DOCUMENTS.find((d) => d.id === win.docId);
          if (!doc) return null;
          // PDFWindow/DraggableWindow must be the *direct* child of
          // AnimatePresence — no plain wrapper div in between. AnimatePresence
          // only intercepts removal for its immediate children; an
          // interposed div (previously used here for the minimize
          // visibility toggle) has no exit animation of its own, so React
          // unmounted the whole subtree synchronously on close, before
          // Framer ever got a chance to run the exit-toward-folder
          // animation. The minimized visibility toggle now lives inside
          // DraggableWindow itself instead.
          return <PDFWindow key={win.id} win={win} doc={doc} />;
        })}
      </AnimatePresence>
    </div>
  );
}
