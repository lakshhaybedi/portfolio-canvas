"use client";

import Link from "next/link";

// Off The Clock is offline while it's reworked. The full build (Windows 7
// desktop shell, Explorer window, Winamp/Guestbook/Zuma/memes) is still in
// the repo — src/components/me/ExplorerWindow.tsx and its siblings — this
// stub just stops importing any of it, so none of that code ships to this
// route and there's nothing half-finished for a visitor to land on. Swap
// this file's body back to `<ExplorerWindow />` (see git history on this
// file) to bring it back, and see PortfolioFolder.tsx for restoring the
// wormhole entry point.
export default function MePage() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 16,
      background: "var(--bg)", color: "var(--fg)",
      fontFamily: "'Space Grotesk', sans-serif", textAlign: "center", padding: 24,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>
        Off The Clock
      </div>
      <p style={{ fontSize: 15, color: "var(--muted-strong)", maxWidth: 380, lineHeight: 1.6 }}>
        This page is offline while it gets reworked. Back soon.
      </p>
      <Link href="/" style={{
        fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
        color: "var(--fg)", textDecoration: "underline",
      }}>
        ← Back to the portfolio
      </Link>
    </div>
  );
}
