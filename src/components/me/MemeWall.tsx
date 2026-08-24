"use client";

import { useEffect, useState } from "react";
import { MEMES } from "@/lib/memes";

export default function MemeWall() {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : Math.min(i + 1, MEMES.length - 1)));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : Math.max(i - 1, 0)));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (MEMES.length === 0) {
    return (
      <div style={{ padding: 20, textAlign: "center", fontFamily: "'Tahoma',sans-serif" }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🖼️</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#10336E" }}>NO MEMES YET</div>
        <div style={{ fontSize: 10, color: "#2A4A80", marginTop: 6, lineHeight: 1.6 }}>
          drop images in <code style={{ background: "rgba(255,255,255,0.6)", padding: "1px 4px" }}>public/memes/</code>
          <br />and list them in <code style={{ background: "rgba(255,255,255,0.6)", padding: "1px 4px" }}>src/lib/memes.ts</code>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{
        padding: 14, display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 10,
      }}>
        {MEMES.map((m, i) => (
          <button
            key={m.src}
            onClick={() => setOpen(i)}
            style={{
              border: "2px outset #C8C8D8", background: "#fff", padding: 3,
              cursor: "pointer", display: "block",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={m.src} alt={m.caption} loading="lazy" decoding="async"
              style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }}
            />
            <div style={{
              fontSize: 9, color: "#101010", fontFamily: "'Tahoma',sans-serif",
              padding: "4px 2px 2px", lineHeight: 1.3,
            }}>
              {m.caption}
            </div>
          </button>
        ))}
      </div>

      {open !== null && (
        <div
          onClick={() => setOpen(null)}
          role="dialog"
          aria-modal="true"
          aria-label={MEMES[open].caption}
          style={{
            position: "fixed", inset: 0, zIndex: 999,
            background: "rgba(0,0,20,0.86)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
          }}
        >
          <figure style={{ margin: 0, maxWidth: "min(900px,92vw)", textAlign: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={MEMES[open].src} alt={MEMES[open].caption}
              style={{ maxWidth: "100%", maxHeight: "78vh", border: "3px ridge #C8C8D8", display: "block", margin: "0 auto" }}
            />
            <figcaption style={{
              color: "#00FF00", fontFamily: "'Courier New',monospace",
              fontSize: 12, marginTop: 10,
            }}>
              {MEMES[open].caption} — [esc] to close, ← → to browse
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
