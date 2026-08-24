"use client";

import { useState } from "react";
import Link from "next/link";
import WinampPlayer from "@/components/me/WinampPlayer";
import Guestbook from "@/components/me/Guestbook";
import MemeWall from "@/components/me/MemeWall";
import ZumaGame from "@/components/me/ZumaGame";

// A real Explorer window navigates *within itself* — double-click a folder
// and the breadcrumb/content swap, no new window spawns. That's also the
// cheap way to keep this page looking like the reference screenshot at
// rest (just the folder grid) while still reaching every feature: one
// window, one piece of state, four destinations.
type Loc = "home" | "music" | "pictures" | "documents" | "videos";

const FOLDERS: { id: Loc | "desktop" | "downloads" | "bookmarks"; label: string; accent: string; glyph: string }[] = [
  { id: "desktop", label: "Desktop", accent: "#5B8DEF", glyph: "🖥" },
  { id: "downloads", label: "Downloads", accent: "#4FA8E0", glyph: "⬇" },
  { id: "documents", label: "Documents", accent: "#6FA8DC", glyph: "📄" },
  { id: "pictures", label: "Pictures", accent: "#E0A85B", glyph: "🖼" },
  { id: "music", label: "Music", accent: "#C46BFF", glyph: "🎵" },
  { id: "videos", label: "Videos", accent: "#5BC0E0", glyph: "🎬" },
  { id: "bookmarks", label: "Bookmarks", accent: "#E0C24F", glyph: "⭐" },
];

const TITLES: Record<Loc, string> = {
  home: "Quick access",
  music: "Music — Winamp",
  pictures: "Pictures — Memes",
  documents: "Documents — Guestbook",
  videos: "Videos — Zuma.exe",
};

export default function ExplorerWindow() {
  const [loc, setLoc] = useState<Loc>("home");

  const open = (id: string) => {
    if (id === "music" || id === "pictures" || id === "documents" || id === "videos") setLoc(id);
    // desktop/downloads/bookmarks have nowhere real to go — same "inert
    // chrome" call made for the Winamp menu bar: period-accurate furniture,
    // not every control needs to do something.
  };

  return (
    <div style={{
      width: "min(900px, 94vw)", margin: "0 auto",
      background: "#F5F6F8", borderRadius: 7, overflow: "hidden",
      border: "1px solid #8A8F99",
      boxShadow: "0 24px 70px rgba(0,0,10,0.45), 0 2px 0 rgba(255,255,255,0.4) inset",
      fontFamily: "'Segoe UI','Tahoma',sans-serif", color: "#1A1A1A",
    }}>
      {/* Glass title bar — window controls only, matching how little the
          reference gives this row versus the toolbar below it. */}
      <div style={{
        height: 30, display: "flex", alignItems: "center", justifyContent: "flex-end",
        padding: "0 6px", gap: 4,
        background: "linear-gradient(180deg,#DCE7F5 0%,#B9CDE8 100%)",
        borderBottom: "1px solid #A9B6C8",
      }}>
        {["–", "▢", "✕"].map((g, i) => (
          <span key={g} aria-hidden="true" style={{
            width: 26, height: 20, borderRadius: 2,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, color: "#2A3550",
            background: i === 2 ? "linear-gradient(180deg,#F0A0A0,#D65A5A)" : "rgba(255,255,255,0.4)",
          }}>{g}</span>
        ))}
      </div>

      {/* Nav toolbar: back / forward / breadcrumb / search — the single
          most recognisable row in the reference. */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
        background: "#F5F6F8", borderBottom: "1px solid #D6D9DE",
      }}>
        <NavArrow disabled={loc === "home"} onClick={() => setLoc("home")}>◀</NavArrow>
        <NavArrow disabled>▶</NavArrow>
        <NavArrow disabled>▾</NavArrow>
        <div style={{
          flex: 1, display: "flex", alignItems: "center", gap: 6,
          border: "1px solid #C7CBD1", borderRadius: 3, background: "#FFFFFF",
          padding: "4px 10px", fontSize: 12.5,
        }}>
          <span aria-hidden="true">📁</span>
          <button
            onClick={() => setLoc("home")}
            style={{ background: "none", border: "none", padding: 0, font: "inherit", color: loc === "home" ? "#1A1A1A" : "#0060C0", cursor: "pointer" }}
          >
            Quick access
          </button>
          {loc !== "home" && (
            <>
              <span style={{ color: "#9AA0AA" }}>›</span>
              <span>{FOLDERS.find((f) => f.id === loc)?.label}</span>
            </>
          )}
        </div>
        <div style={{
          width: 150, border: "1px solid #C7CBD1", borderRadius: 3, background: "#FFFFFF",
          padding: "4px 8px", fontSize: 11.5, color: "#9AA0AA",
        }}>
          🔍 Search
        </div>
      </div>

      {/* Command bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14, padding: "5px 10px",
        borderBottom: "1px solid #D6D9DE", fontSize: 11.5,
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#3A3A3A" }}>
          Organize <span style={{ fontSize: 9 }}>▾</span>
        </span>
        <span style={{ marginLeft: "auto", color: "#3A3A3A" }}>▦</span>
        <span style={{ color: "#3A3A3A" }}>☰</span>
        <span style={{ color: "#3A3A3A" }}>❓</span>
      </div>

      {/* Body: sidebar + content */}
      <div style={{ display: "flex", height: 430 }}>
        <div style={{
          width: 168, flexShrink: 0, background: "#F5F6F8",
          borderRight: "1px solid #D6D9DE", padding: "10px 0", fontSize: 12,
          overflowY: "auto",
        }}>
          <SideHeading>Quick access</SideHeading>
          {FOLDERS.map((f) => (
            <SideItem key={f.id} active={loc === f.id} onClick={() => open(f.id)}>
              {f.glyph} {f.label}
            </SideItem>
          ))}
          <div style={{ height: 10 }} />
          <SideHeading>This PC</SideHeading>
          <SideItem disabled>💽 Local Disk (C:)</SideItem>
          <SideItem disabled>💾 Main USB (G:)</SideItem>
        </div>

        <div style={{ flex: 1, minWidth: 0, padding: loc === "home" ? "16px 20px" : 0, overflow: "auto" }}>
          {loc === "home" ? (
            <>
              <div style={{ fontSize: 12.5, color: "#3A3A3A", marginBottom: 12 }}>
                Frequent folders ({FOLDERS.length})
              </div>
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(84px,1fr))",
                gap: 18,
              }}>
                {FOLDERS.map((f) => (
                  <button
                    key={f.id}
                    onDoubleClick={() => open(f.id)}
                    onClick={() => open(f.id)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                      padding: 6, borderRadius: 4, font: "inherit",
                    }}
                  >
                    <FolderIcon accent={f.accent} glyph={f.glyph} />
                    <span style={{ fontSize: 11.5, color: "#1A1A1A" }}>{f.label}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <FeaturePane loc={loc} />
          )}
        </div>
      </div>

      {/* Status bar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "3px 10px", fontSize: 11, color: "#4A4A4A",
        borderTop: "1px solid #D6D9DE", background: "#F0F1F3",
      }}>
        <span>{loc === "home" ? `${FOLDERS.length} items` : TITLES[loc]}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          🖥 <Link href="/" style={{ color: "#0060C0", textDecoration: "none" }}>Computer</Link>
        </span>
      </div>
    </div>
  );
}

function FeaturePane({ loc }: { loc: Exclude<Loc, "home"> }) {
  if (loc === "music") return <WinampPlayer />;
  if (loc === "pictures") return <MemeWall />;
  if (loc === "documents") return <Guestbook />;
  return <ZumaGame />;
}

function NavArrow({ children, disabled, onClick }: { children: React.ReactNode; disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-hidden={disabled}
      style={{
        width: 24, height: 24, border: "1px solid transparent", borderRadius: 3,
        background: "none", color: disabled ? "#B8BCC4" : "#3A3A3A",
        cursor: disabled ? "default" : "pointer", fontSize: 10,
      }}
    >
      {children}
    </button>
  );
}

function SideHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: "2px 14px", fontSize: 11, fontWeight: 700, color: "#3A3A3A" }}>
      {children}
    </div>
  );
}

function SideItem({ children, active, disabled, onClick }: { children: React.ReactNode; active?: boolean; disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{
        display: "block", width: "100%", textAlign: "left", border: "none",
        background: active ? "#D6E4F5" : "transparent",
        padding: "3px 14px", fontSize: 12, color: disabled ? "#9AA0AA" : "#1A1A1A",
        cursor: disabled ? "default" : "pointer", font: "inherit",
      }}
    >
      {children}
    </button>
  );
}

function FolderIcon({ accent, glyph }: { accent: string; glyph: string }) {
  return (
    <div style={{ position: "relative", width: 42, height: 34 }}>
      <svg width="42" height="34" viewBox="0 0 42 34" aria-hidden="true">
        <path
          d="M2 6c0-1.7 1.3-3 3-3h11l4 4h17c1.7 0 3 1.3 3 3v19c0 1.7-1.3 3-3 3H5c-1.7 0-3-1.3-3-3V6z"
          fill={`url(#g-${accent.slice(1)})`}
          stroke="#B8860B"
          strokeWidth="0.6"
        />
        <defs>
          <linearGradient id={`g-${accent.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFE28A" />
            <stop offset="1" stopColor="#F4B942" />
          </linearGradient>
        </defs>
      </svg>
      <span style={{
        position: "absolute", right: -2, bottom: -2, width: 16, height: 16,
        borderRadius: "50%", background: accent, border: "1.5px solid #FFFFFF",
        fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {glyph}
      </span>
    </div>
  );
}
