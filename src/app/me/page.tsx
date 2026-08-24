"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ExplorerWindow from "@/components/me/ExplorerWindow";

// A Windows 7 desktop, not the site's design system: this page is a period
// piece, so it runs its own palette, fonts and chrome. Everything visible
// here is CSS — the wallpaper is layered gradients rather than a bitmap, so
// the page ships no extra image weight for a decorative background.

export default function MePage() {
  return (
    <div style={{
      minHeight: "100vh",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Segoe UI','Tahoma','Verdana',sans-serif",
      // Bliss-style wallpaper, built from gradients rather than a bitmap so
      // the page ships no image weight for decoration. Order matters: cloud
      // puffs sit above the hill crest, which sits above the sky/grass ramp.
      background: `
        radial-gradient(38% 13% at 16% 20%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.55) 45%, rgba(255,255,255,0) 72%),
        radial-gradient(26% 10% at 30% 15%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%),
        radial-gradient(30% 11% at 64% 12%, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0) 72%),
        radial-gradient(20% 8% at 78% 22%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 72%),
        radial-gradient(24% 9% at 46% 30%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 74%),
        radial-gradient(16% 7% at 88% 34%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 74%),
        radial-gradient(120% 26% at 50% 63%, #A8D96B 0%, #7FC348 34%, rgba(127,195,72,0) 68%),
        linear-gradient(180deg,
          #2F7FC8 0%, #4E9EDC 14%, #7BC0EC 28%, #A9D8F2 40%, #D3EAF8 52%,
          #8FC85C 58%, #6DB33C 70%, #52992C 84%, #3C7A20 100%)
      `,
      paddingBottom: 46,
    }}>
      <DesktopClock />
      <Gadgets />

      <div style={{ paddingTop: 96, paddingBottom: 40 }}>
        <ExplorerWindow />
      </div>

      <Taskbar />
    </div>
  );
}

// The big translucent clock sitting over the wallpaper in the reference.
function DesktopClock() {
  const [now, setNow] = useState<Date | null>(null);
  // Rendered only after mount: the server has no idea what time it is in the
  // visitor's zone, and prerendering one would hydrate into a mismatch.
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      position: "absolute", top: 8, left: 0, right: 0, textAlign: "center",
      color: "#FFFFFF", textShadow: "0 2px 6px rgba(0,40,80,0.45)", pointerEvents: "none",
    }}>
      <div style={{ fontSize: 34, fontWeight: 300, letterSpacing: "0.02em", lineHeight: 1.1 }}>
        {now ? now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "--:--"}
      </div>
      <div style={{ fontSize: 12, fontWeight: 400, opacity: 0.95 }}>
        {now ? now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : ""}
      </div>
    </div>
  );
}

// Sidebar gadgets, top-right, exactly as the reference stacks them.
function Gadgets() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); }, []);

  return (
    <div style={{
      position: "absolute", top: 62, right: 18, width: 92,
      display: "grid", gap: 10, zIndex: 2,
    }}>
      <Gadget>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 16 }} aria-hidden="true">💽</span>
          <div style={{ fontSize: 8.5, lineHeight: 1.35, color: "#F0F4FA" }}>
            <div style={{ fontWeight: 700 }}>C:</div>
            <div style={{ opacity: 0.85 }}>465 GB</div>
            <div style={{ opacity: 0.85 }}>Free: 368 GB</div>
          </div>
        </div>
      </Gadget>

      <Gadget pad={0}>
        <div style={{
          height: 58,
          background: "linear-gradient(180deg,#1E6FA8 0%,#0C3F66 100%)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
        }} aria-hidden="true">
          🐠
        </div>
      </Gadget>

      <Gadget>
        <div style={{ textAlign: "center", color: "#F0F4FA" }}>
          <div style={{ fontSize: 8, opacity: 0.85 }}>
            {now ? now.toLocaleDateString("en-GB", { weekday: "long" }).toLowerCase() : ""}
          </div>
          <div style={{ fontSize: 26, fontWeight: 300, lineHeight: 1.1 }}>
            {now ? now.getDate() : "--"}
          </div>
          <div style={{ fontSize: 8, opacity: 0.85 }}>
            {now ? now.toLocaleDateString("en-GB", { month: "long", year: "numeric" }).toLowerCase() : ""}
          </div>
        </div>
      </Gadget>

      <Gadget>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#F0F4FA" }}>
          <span style={{ fontSize: 18 }} aria-hidden="true">⛅</span>
          <div style={{ fontSize: 8.5, lineHeight: 1.35 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>8°C</div>
            <div style={{ opacity: 0.85 }}>Partly cloudy</div>
          </div>
        </div>
      </Gadget>
    </div>
  );
}

function Gadget({ children, pad = 8 }: { children: React.ReactNode; pad?: number }) {
  return (
    <div style={{
      background: "rgba(12,32,56,0.55)",
      border: "1px solid rgba(255,255,255,0.35)",
      borderRadius: 4,
      boxShadow: "0 4px 14px rgba(0,20,40,0.35), inset 0 1px 0 rgba(255,255,255,0.28)",
      backdropFilter: "blur(6px)",
      padding: pad,
      overflow: "hidden",
    }}>
      {children}
    </div>
  );
}

function Taskbar() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, height: 40, zIndex: 50,
      display: "flex", alignItems: "center", gap: 4, padding: "0 6px",
      background: "linear-gradient(180deg, rgba(40,58,80,0.92) 0%, rgba(14,26,44,0.95) 48%, rgba(8,16,30,0.96) 100%)",
      borderTop: "1px solid rgba(150,190,240,0.5)",
      boxShadow: "0 -2px 12px rgba(0,10,30,0.5)",
      backdropFilter: "blur(8px)",
    }}>
      {/* Start orb — the one control that has to be right or the whole
          taskbar stops reading as Windows. */}
      <Link href="/" aria-label="Back to portfolio" style={{
        width: 46, height: 32, borderRadius: 20,
        background: "radial-gradient(circle at 38% 32%, #BFE6FF 0%, #4FA8E0 38%, #1E6FD9 62%, #0B3C8C 100%)",
        border: "1px solid rgba(255,255,255,0.55)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 0 10px rgba(80,170,240,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#FFFFFF", fontSize: 11, fontWeight: 700, textDecoration: "none",
      }}>
        ⊞
      </Link>

      {[["🌐", "Browser"], ["📁", "Explorer"], ["🎵", "Winamp"]].map(([g, label]) => (
        <span key={label} aria-label={label} style={{
          width: 34, height: 30, borderRadius: 3,
          background: "rgba(255,255,255,0.10)",
          border: "1px solid rgba(255,255,255,0.18)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
        }}>
          {g}
        </span>
      ))}

      <div style={{ flex: 1 }} />

      <div style={{
        display: "flex", alignItems: "center", gap: 10, padding: "0 10px",
        color: "#E8F0FA", fontSize: 11, lineHeight: 1.25, textAlign: "right",
      }}>
        <span style={{ opacity: 0.8 }} aria-hidden="true">▲ 🔊 🛜</span>
        <div>
          <div>{now ? now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "--:--"}</div>
          <div style={{ opacity: 0.85 }}>
            {now ? now.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
