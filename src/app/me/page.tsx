"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import WinampPlayer from "@/components/me/WinampPlayer";
import Guestbook from "@/components/me/Guestbook";
import MemeWall from "@/components/me/MemeWall";
import ZumaGame from "@/components/me/ZumaGame";

// Deliberately outside the site's design system: this page is a Y2K/Aero
// period piece, so it runs its own palette, its own fonts, and its own
// chrome rather than the cream-on-near-black tokens everything else uses.
const AERO_GLASS: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.14) 48%, rgba(255,255,255,0.06) 52%, rgba(255,255,255,0.16) 100%)",
  backdropFilter: "blur(18px) saturate(150%)",
  WebkitBackdropFilter: "blur(18px) saturate(150%)",
  border: "1px solid rgba(255,255,255,0.55)",
  borderRadius: 10,
  boxShadow: "0 18px 60px rgba(0,0,20,0.55), inset 0 1px 0 rgba(255,255,255,0.85)",
};

export default function MePage() {
  return (
    <div style={{
      minHeight: "100vh",
      // Vista-era desktop: deep blue with aurora glows behind the glass.
      background: `
        radial-gradient(1100px 620px at 18% -10%, #4FB9F5 0%, transparent 60%),
        radial-gradient(900px 540px at 88% 8%, #7B4FF5 0%, transparent 58%),
        radial-gradient(760px 520px at 55% 108%, #00D6C2 0%, transparent 62%),
        linear-gradient(175deg, #0B2B6B 0%, #071A45 55%, #04102B 100%)
      `,
      fontFamily: "'Tahoma','Geneva','Verdana',sans-serif",
      color: "#0A1A3A",
      padding: "0 0 60px",
    }}>
      <TopMarquee />

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 20px 0" }}>
        <AeroWindow title="Off The Clock — C:\\LAKSHHAY\\FUN.EXE">
          <div style={{ padding: 20 }}>
            <h1 style={{
              margin: "0 0 6px",
              fontSize: "clamp(30px,5vw,52px)",
              fontFamily: "'Impact','Haettenschweiler','Arial Black',sans-serif",
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              // The chrome/gradient wordmark, the single most Y2K thing there is.
              background: "linear-gradient(180deg,#FFFFFF 0%,#BFE6FF 38%,#1E6FD9 52%,#0B3C8C 70%,#7FD2FF 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitTextStroke: "1px rgba(255,255,255,0.55)",
              filter: "drop-shadow(0 3px 0 rgba(0,0,40,0.35))",
            }}>
              Off The Clock
            </h1>
            <p style={{ margin: "0 0 4px", fontSize: 13, color: "#10336E", fontWeight: 700 }}>
              welcome 2 my corner of the web!!{" "}
              <Blink><span style={{ color: "#D40000" }}>★ NEW ★</span></Blink>
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "#2A4A80" }}>
              no case studies here. just the stuff that plays while the rest of it gets built.
            </p>
          </div>
        </AeroWindow>

        <div className="me-grid">
          <div style={{ display: "grid", gap: 20 }}>
            <AeroWindow title="Winamp — it really whips the llama's ass">
              <div style={{ padding: 20, display: "flex", justifyContent: "center" }}>
                <WinampPlayer />
              </div>
            </AeroWindow>

            <AeroWindow title="Guestbook.htm — sign it!">
              <Guestbook />
            </AeroWindow>

            <AeroWindow title="Zuma.exe — match 3 or perish">
              <ZumaGame />
            </AeroWindow>

            <AeroWindow title="Memes.dir">
              <MemeWall />
            </AeroWindow>
          </div>

          <div style={{ display: "grid", gap: 20 }}>
            <AeroWindow title="Counter.cgi">
              <div style={{ padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#10336E", marginBottom: 8 }}>
                  YOU ARE VISITOR NUMBER
                </div>
                <VisitorCounter />
                <div style={{ fontSize: 10, color: "#2A4A80", marginTop: 8 }}>
                  thanks 4 stopping by :-)
                </div>
              </div>
            </AeroWindow>

            <AeroWindow title="Under Construction">
              <div style={{ padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 30, marginBottom: 6 }}>🚧</div>
                <Blink>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#B36B00" }}>
                    ARCADE COMING SOON
                  </div>
                </Blink>
                <div style={{ fontSize: 10, color: "#2A4A80", marginTop: 6 }}>
                  check back l8r!!1!
                </div>
              </div>
            </AeroWindow>

            <AeroWindow title="Web Ring">
              <div style={{ padding: 14, display: "grid", gap: 6 }}>
                <Badge bg="#000080" fg="#00FF00">BEST VIEWED IN 1024×768</Badge>
                <Badge bg="#FF00FF" fg="#FFFF00">MADE ON A MAC</Badge>
                <Badge bg="#008080" fg="#00FFFF">NO AI WAS HARMED</Badge>
                <Link href="/" style={{
                  display: "block", textAlign: "center", marginTop: 4,
                  fontSize: 11, color: "#0000EE", textDecoration: "underline", fontWeight: 700,
                }}>
                  ‹‹ back 2 the portfolio
                </Link>
              </div>
            </AeroWindow>
          </div>
        </div>

        <div style={{
          textAlign: "center", marginTop: 28, fontSize: 10,
          color: "rgba(255,255,255,0.55)", letterSpacing: "0.05em",
        }}>
          © 2026 LAKSHHAY BEDI · THIS PAGE IS BEST EXPERIENCED WITH THE SOUND ON
        </div>
      </div>
    </div>
  );
}

function AeroWindow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={AERO_GLASS}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 32, padding: "0 8px 0 12px",
        borderBottom: "1px solid rgba(255,255,255,0.35)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.30) 100%)",
        borderRadius: "9px 9px 0 0",
      }}>
        <span style={{
          fontSize: 11, fontWeight: 700, color: "#0A2A5E",
          textShadow: "0 1px 0 rgba(255,255,255,0.9)", whiteSpace: "nowrap",
          overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {title}
        </span>
        <div style={{ display: "flex", gap: 4 }} aria-hidden="true">
          {[["–", "#7FB2E8"], ["□", "#7FB2E8"], ["✕", "#E86A6A"]].map(([g, c]) => (
            <span key={g} style={{
              width: 22, height: 18, borderRadius: 3,
              background: `linear-gradient(180deg,#FFFFFF 0%,${c} 55%,${c} 100%)`,
              border: "1px solid rgba(255,255,255,0.8)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
              fontSize: 9, lineHeight: "17px", textAlign: "center", color: "#0A2A5E",
            }}>{g}</span>
          ))}
        </div>
      </div>
      {children}
    </section>
  );
}

function TopMarquee() {
  return (
    <div style={{
      overflow: "hidden", whiteSpace: "nowrap",
      background: "linear-gradient(180deg,#000080 0%,#0000C8 100%)",
      borderBottom: "2px solid #00FFFF", padding: "5px 0",
    }}>
      <div className="me-marquee-track" style={{
        display: "inline-block", fontSize: 12, fontWeight: 700,
        color: "#00FF00", letterSpacing: "0.08em",
        animation: "me-marquee 22s linear infinite",
      }}>
        ★彡 WELCOME 2 OFF THE CLOCK 彡★ ✦ NOW PLAYING: KING GIZZARD &amp; THE LIZARD WIZARD ✦
        ♫ TURN UR SPEAKERS UP ♫ ✦ SIGN MY GUESTBOOK ✦ 100% HAND-CODED HTML (kinda) ✦
      </div>
      <style>{`
        @keyframes me-marquee { from { transform: translateX(100vw); } to { transform: translateX(-100%); } }
        @keyframes me-blink { 0%,49% { opacity: 1; } 50%,100% { opacity: 0.15; } }
        .me-grid {
          display: grid;
          grid-template-columns: minmax(0,1fr) 280px;
          gap: 20px;
          margin-top: 20px;
          align-items: start;
        }
        /* The player needs ~500px of column before the sidebar is worth
           keeping alongside it — below that the two-column split is what
           squeezes the Winamp window out of its frame. */
        @media (max-width: 880px) {
          .me-grid { grid-template-columns: minmax(0,1fr); }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-me-anim], .me-marquee-track { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

function Blink({ children }: { children: React.ReactNode }) {
  return <span data-me-anim style={{ animation: "me-blink 1.1s steps(1) infinite" }}>{children}</span>;
}

function Badge({ bg, fg, children }: { bg: string; fg: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: bg, color: fg, fontSize: 9, fontWeight: 700,
      letterSpacing: "0.04em", textAlign: "center", padding: "5px 4px",
      border: "1px solid #FFFFFF", boxShadow: "1px 1px 0 rgba(0,0,0,0.5)",
    }}>
      {children}
    </div>
  );
}

// Odometer that ticks up while you're on the page — the counter was always
// theatre, so this one is honest about being theatre rather than pretending
// to be a real hit count.
function VisitorCounter() {
  const [n, setN] = useState(1337);
  useEffect(() => {
    const id = setInterval(() => setN((v) => v + 1), 4000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 2 }}>
      {String(n).padStart(6, "0").split("").map((d, i) => (
        <span key={i} style={{
          background: "#000", color: "#00FF00", fontFamily: "'Courier New',monospace",
          fontSize: 18, fontWeight: 700, width: 16, textAlign: "center",
          border: "1px solid #444", padding: "2px 0",
        }}>{d}</span>
      ))}
    </div>
  );
}
