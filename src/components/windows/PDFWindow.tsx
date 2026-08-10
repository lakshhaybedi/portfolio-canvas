"use client";

import { useState } from "react";
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

// For documents that ship as several interchangeable files (currently just
// the resume: EN/DE x Light/Dark) rather than one PDF per folder row —
// swaps which variant's fileUrl is active instead of listing all 4 as
// separate rows.
function segBtnStyle(active: boolean): React.CSSProperties {
  return {
    padding: "3px 10px",
    fontSize: 11,
    fontWeight: 600,
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    color: active ? "var(--fg-invert)" : "var(--muted-strong)",
    background: active ? "var(--fg)" : "transparent",
    transition: "background 0.15s ease, color 0.15s ease",
  };
}

export default function PDFWindow({ win, doc }: { win: OpenWindow; doc: PortfolioDocument }) {
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const minimizeWindow = useWindowStore((s) => s.minimizeWindow);
  const toggleMaximize = useWindowStore((s) => s.toggleMaximize);
  const bringToFront = useWindowStore((s) => s.bringToFront);
  const updatePosition = useWindowStore((s) => s.updatePosition);
  const folderAnchor = useWindowStore((s) => s.folderAnchor);

  // Defaults to English + Dark — matches the site's own theme and the
  // widest-reach language — for documents with variants.
  const [lang, setLang] = useState<"EN" | "DE">("EN");
  const [theme, setTheme] = useState<"Light" | "Dark">("Dark");

  const activeVariant = doc.variants?.find((v) => v.lang === lang && v.theme === theme);
  const fileUrl = activeVariant?.fileUrl ?? doc.fileUrl;
  const downloadName = doc.variants
    ? `Lakshhay_Bedi_${lang === "DE" ? "Lebenslauf" : "CV"}_2026_${lang}_${theme}.pdf`
    : undefined;

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
            href={fileUrl}
            download={downloadName ?? true}
            style={actionBtnStyle}
            aria-label="Download"
            title="Download"
          >
            ↓
          </a>
          <a
            href={fileUrl}
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
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {doc.variants && (
          <div
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 16,
              padding: "8px 12px", borderBottom: "1px solid var(--border)", flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", gap: 2, padding: 2, background: "rgba(237,234,212,0.04)", borderRadius: 8 }}>
              {(["EN", "DE"] as const).map((l) => (
                <button key={l} onClick={() => setLang(l)} style={segBtnStyle(lang === l)}>
                  {l}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 2, padding: 2, background: "rgba(237,234,212,0.04)", borderRadius: 8 }}>
              {(["Light", "Dark"] as const).map((t) => (
                <button key={t} onClick={() => setTheme(t)} style={segBtnStyle(theme === t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
        <div style={{ flex: 1, minHeight: 0 }}>
          <PdfViewer fileUrl={fileUrl} downloadName={downloadName} onFullscreen={() => toggleMaximize(win.id)} />
        </div>
      </div>
    </DraggableWindow>
  );
}
