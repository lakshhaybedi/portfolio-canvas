"use client";

import dynamic from "next/dynamic";
import type { PortfolioDocument } from "@/lib/documents";
import type { OpenWindow } from "@/lib/useWindowStore";
import { useWindowStore } from "@/lib/useWindowStore";
import DraggableWindow from "./DraggableWindow";

// pdf.js touches Canvas/Worker APIs that don't exist during the static-export
// prerender pass — same lazy-load pattern as the hero's WebGL background.
const PdfViewer = dynamic(() => import("./PdfViewer"), { ssr: false });

const actionBtnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 22,
  height: 22,
  borderRadius: 6,
  color: "var(--muted-strong)",
  textDecoration: "none",
  fontSize: 12,
};

function PdfIcon() {
  return (
    <div
      aria-hidden="true"
      style={{
        width: 16,
        height: 16,
        borderRadius: 3,
        background: "var(--accent-elevance)",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 7,
        fontWeight: 800,
        color: "#0A0A0A",
      }}
    >
      P
    </div>
  );
}

export default function PDFWindow({ win, doc }: { win: OpenWindow; doc: PortfolioDocument }) {
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const minimizeWindow = useWindowStore((s) => s.minimizeWindow);
  const toggleMaximize = useWindowStore((s) => s.toggleMaximize);
  const bringToFront = useWindowStore((s) => s.bringToFront);
  const updatePosition = useWindowStore((s) => s.updatePosition);
  const folderAnchor = useWindowStore((s) => s.folderAnchor);

  return (
    <DraggableWindow
      x={win.x}
      y={win.y}
      z={win.z}
      maximized={win.maximized}
      minimized={win.minimized}
      exitAnchor={folderAnchor}
      title={doc.name}
      icon={<PdfIcon />}
      onFocus={() => bringToFront(win.id)}
      onClose={() => closeWindow(win.id)}
      onMinimize={() => minimizeWindow(win.id)}
      onToggleMaximize={() => toggleMaximize(win.id)}
      onDragEnd={(x, y) => updatePosition(win.id, x, y)}
      headerActions={
        <>
          <a
            href={doc.fileUrl}
            download
            style={actionBtnStyle}
            aria-label="Download"
            title="Download"
          >
            ↓
          </a>
          <a
            href={doc.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={actionBtnStyle}
            aria-label="Open in new tab"
            title="Open in new tab"
          >
            ↗
          </a>
        </>
      }
    >
      <PdfViewer fileUrl={doc.fileUrl} onFullscreen={() => toggleMaximize(win.id)} />
    </DraggableWindow>
  );
}
