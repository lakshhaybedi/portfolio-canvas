"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import PdfToolbar from "./PdfToolbar";

// Worker copied into public/ by scripts/copy-pdf-worker.mjs (wired as
// "postinstall") — a plain static path is the most reliable option under
// Next's `output: "export"`, avoiding webpack asset-module/CDN concerns.
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

const MIN_SCALE = 0.5;
const MAX_SCALE = 2.5;

/**
 * The actual pdf.js-backed viewer. Dynamically imported with `ssr:false`
 * from PDFWindow.tsx — pdf.js touches Canvas/Worker APIs that don't exist
 * during Next's static-export prerender pass (same reason the WebGL hero
 * background is lazy-loaded the same way).
 *
 * All pages render in one continuous scroll rather than one-at-a-time. The
 * old paged mode hid page 2 of a 2-page CV behind a "next" click most
 * readers never made — the second page may as well not have existed. The
 * prev/next buttons now scroll to a page instead of swapping which one is
 * mounted, and the page counter follows the scroll position.
 */
export default function PdfViewer({
  fileUrl,
  downloadName,
  onFullscreen,
}: {
  fileUrl: string;
  downloadName?: string;
  onFullscreen: () => void;
}) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);

  const scrollRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Which page is "current" = whichever one covers the vertical middle of
  // the viewport. Measuring against the container's own box (not the
  // window) keeps this correct inside the draggable, resizable window.
  const syncCurrentPage = useCallback(() => {
    const root = scrollRef.current;
    if (!root || numPages === 0) return;
    const mid = root.getBoundingClientRect().top + root.clientHeight / 2;
    let best = 1;
    for (let i = 0; i < pageRefs.current.length; i++) {
      const el = pageRefs.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.top <= mid) best = i + 1;
    }
    setPageNumber(best);
  }, [numPages]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(syncCurrentPage);
    };
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      root.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [syncCurrentPage]);

  const goToPage = useCallback((n: number) => {
    const target = pageRefs.current[n - 1];
    const root = scrollRef.current;
    if (!target || !root) return;
    // scrollTop math rather than scrollIntoView: the latter also scrolls the
    // page behind the window when the target is inside a nested scroller.
    root.scrollTo({
      top: target.offsetTop - root.offsetTop,
      behavior: "smooth",
    });
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflow: "auto",
          padding: 16,
          background: "rgba(0,0,0,0.2)",
        }}
      >
        <Document
          file={fileUrl}
          onLoadSuccess={({ numPages: n }) => {
            setNumPages(n);
            pageRefs.current = new Array(n).fill(null);
          }}
          loading={<div style={{ color: "var(--muted)", fontSize: 13, padding: 40 }}>Loading PDF…</div>}
          error={<div style={{ color: "var(--muted)", fontSize: 13, padding: 40 }}>Couldn&apos;t load this PDF.</div>}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            {Array.from({ length: numPages }, (_, i) => (
              <div
                key={i}
                ref={(el) => { pageRefs.current[i] = el; }}
                style={{ position: "relative" }}
              >
                <Page
                  pageNumber={i + 1}
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  onRenderSuccess={i === 0 ? syncCurrentPage : undefined}
                />
              </div>
            ))}
          </div>
        </Document>
      </div>

      <PdfToolbar
        scale={scale}
        onZoomIn={() => setScale((s) => Math.min(MAX_SCALE, +(s + 0.15).toFixed(2)))}
        onZoomOut={() => setScale((s) => Math.max(MIN_SCALE, +(s - 0.15).toFixed(2)))}
        pageNumber={pageNumber}
        numPages={numPages}
        onPrevPage={() => goToPage(Math.max(1, pageNumber - 1))}
        onNextPage={() => goToPage(Math.min(numPages, pageNumber + 1))}
        onDownload={() => {
          const a = document.createElement("a");
          a.href = fileUrl;
          a.download = downloadName ?? fileUrl.split("/").pop() ?? "document.pdf";
          a.click();
        }}
        onFullscreen={onFullscreen}
      />
    </div>
  );
}
