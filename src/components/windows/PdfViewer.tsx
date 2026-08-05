"use client";

import { useState } from "react";
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
 */
export default function PdfViewer({ fileUrl, onFullscreen }: { fileUrl: string; onFullscreen: () => void }) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          justifyContent: "center",
          padding: 16,
          background: "rgba(0,0,0,0.2)",
        }}
      >
        <Document
          file={fileUrl}
          onLoadSuccess={({ numPages: n }) => setNumPages(n)}
          loading={<div style={{ color: "var(--muted)", fontSize: 13, padding: 40 }}>Loading PDF…</div>}
          error={<div style={{ color: "var(--muted)", fontSize: 13, padding: 40 }}>Couldn't load this PDF.</div>}
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>

      <PdfToolbar
        scale={scale}
        onZoomIn={() => setScale((s) => Math.min(MAX_SCALE, +(s + 0.15).toFixed(2)))}
        onZoomOut={() => setScale((s) => Math.max(MIN_SCALE, +(s - 0.15).toFixed(2)))}
        pageNumber={pageNumber}
        numPages={numPages}
        onPrevPage={() => setPageNumber((p) => Math.max(1, p - 1))}
        onNextPage={() => setPageNumber((p) => Math.min(numPages, p + 1))}
        onDownload={() => {
          const a = document.createElement("a");
          a.href = fileUrl;
          a.download = fileUrl.split("/").pop() ?? "document.pdf";
          a.click();
        }}
        onFullscreen={onFullscreen}
      />
    </div>
  );
}
