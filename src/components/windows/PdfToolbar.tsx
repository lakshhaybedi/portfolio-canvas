"use client";

const btnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 26,
  height: 26,
  borderRadius: 7,
  border: "1px solid var(--border)",
  background: "rgba(237,234,212,0.04)",
  color: "var(--muted-strong)",
  cursor: "pointer",
  fontSize: 13,
  lineHeight: 1,
};

export default function PdfToolbar({
  scale,
  onZoomIn,
  onZoomOut,
  pageNumber,
  numPages,
  onPrevPage,
  onNextPage,
  onDownload,
  onFullscreen,
}: {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  pageNumber: number;
  numPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onDownload: () => void;
  onFullscreen: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        padding: "8px 12px",
        borderTop: "1px solid var(--border)",
        background: "rgba(10,10,10,0.35)",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button style={btnStyle} onClick={onZoomOut} aria-label="Zoom out" title="Zoom out">
          −
        </button>
        <span style={{ fontSize: 11, color: "var(--muted)", width: 40, textAlign: "center" }}>
          {Math.round(scale * 100)}%
        </span>
        <button style={btnStyle} onClick={onZoomIn} aria-label="Zoom in" title="Zoom in">
          +
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          style={{ ...btnStyle, opacity: pageNumber <= 1 ? 0.4 : 1 }}
          onClick={onPrevPage}
          disabled={pageNumber <= 1}
          aria-label="Previous page"
          title="Previous page"
        >
          ‹
        </button>
        <span style={{ fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap" }}>
          Page {pageNumber} of {numPages || 1}
        </span>
        <button
          style={{ ...btnStyle, opacity: pageNumber >= numPages ? 0.4 : 1 }}
          onClick={onNextPage}
          disabled={pageNumber >= numPages}
          aria-label="Next page"
          title="Next page"
        >
          ›
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button style={btnStyle} onClick={onDownload} aria-label="Download" title="Download">
          ↓
        </button>
        <button style={btnStyle} onClick={onFullscreen} aria-label="Fullscreen" title="Fullscreen">
          ⤢
        </button>
      </div>
    </div>
  );
}
