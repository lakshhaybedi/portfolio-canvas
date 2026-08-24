"use client";

import { useEffect, useRef, useState } from "react";

// Classic Winamp 2.x re-skin over the YouTube IFrame API. The iframe itself
// renders 0x0 (audio only); everything visible is bitmap-era chrome.
const PLAYLIST_ID = "PLgZlXf3nSyPEUWGKrnFgi-flfPODiryUn";

// Winamp's actual palette: near-black LCD, phosphor green, and a grey chrome
// built from a light top-left / dark bottom-right bevel pair.
const LCD_BG = "#000000";
const GREEN = "#18E018";
const GREEN_DIM = "#0A7A0A";
const CHROME = "#3B3B4B";
const BEVEL_LIGHT = "#6E6E82";
const BEVEL_DARK = "#16161E";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const fmt = (s: number) => {
  if (!s || !isFinite(s)) return "00:00";
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

export default function WinampPlayer() {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [playing, setPlaying] = useState(false);
  const [title, setTitle] = useState("*** LOADING PLAYLIST ***");
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [queue, setQueue] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    function createPlayer() {
      if (playerRef.current || !hostRef.current) return;
      playerRef.current = new window.YT.Player(hostRef.current, {
        height: "0",
        width: "0",
        playerVars: { listType: "playlist", list: PLAYLIST_ID },
        events: {
          onReady: (e: any) => e.target.setVolume(volume),
          onStateChange: (e: any) => {
            const p = playerRef.current;
            setPlaying(e.data === window.YT.PlayerState.PLAYING);
            if (e.data === window.YT.PlayerState.PLAYING) {
              setTitle((p?.getVideoData?.()?.title || "UNKNOWN").toUpperCase());
              setDuration(p?.getDuration?.() || 0);
              setQueue(p?.getPlaylist?.() || []);
              setIndex(p?.getPlaylistIndex?.() ?? 0);
            }
          },
        },
      });
    }

    if (window.YT?.Player) createPlayer();
    else if (!document.getElementById("yt-iframe-api")) {
      const tag = document.createElement("script");
      tag.id = "yt-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = createPlayer;
    } else window.onYouTubeIframeAPIReady = createPlayer;

    return () => playerRef.current?.destroy?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setElapsed(playerRef.current?.getCurrentTime?.() || 0);
    }, 250);
    return () => clearInterval(id);
  }, [playing]);

  const p = () => playerRef.current;
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    p()?.seekTo(((e.clientX - r.left) / r.width) * duration, true);
  };
  const setVol = (v: number) => { setVolume(v); p()?.setVolume(v); };

  const kbps = playing ? "192" : "---";
  const progress = duration ? elapsed / duration : 0;

  return (
    <div style={{ width: "100%", maxWidth: 460, fontFamily: "'Tahoma','Geneva',sans-serif", userSelect: "none" }}>
      <div ref={hostRef} style={{ display: "none" }} />

      {/* ── Main window ─────────────────────────────────────── */}
      <div style={{ ...bevelOut, background: CHROME, padding: 2 }}>
        <TitleBar label="WINAMP" />

        <div style={{ padding: "6px 8px 8px" }}>
          {/* LCD display */}
          <div style={{ ...bevelIn, background: LCD_BG, padding: "6px 8px", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{
                fontFamily: "'Courier New',monospace", fontSize: 26, fontWeight: 700,
                color: GREEN, letterSpacing: "0.04em", lineHeight: 1,
                textShadow: `0 0 8px ${GREEN}88`, minWidth: 108,
              }}>
                {fmt(elapsed)}
              </div>
              <Visualizer playing={playing} />
            </div>

            {/* Scrolling title — the marquee is the whole point of this row */}
            <div style={{ overflow: "hidden", marginTop: 6, height: 14 }}>
              <div style={{
                whiteSpace: "nowrap", fontFamily: "'Courier New',monospace",
                fontSize: 11, color: GREEN, letterSpacing: "0.06em",
                animation: playing ? "wa-scroll 14s linear infinite" : undefined,
              }}>
                {index + 1}. {title} ✦ {fmt(duration)} ✦ KING GIZZARD RADIO ✦
              </div>
            </div>

            <div style={{
              display: "flex", gap: 12, marginTop: 6,
              fontFamily: "'Courier New',monospace", fontSize: 9, color: GREEN_DIM,
            }}>
              <span>{kbps} KBPS</span>
              <span>44 KHZ</span>
              <span>STEREO</span>
              <span style={{ color: playing ? GREEN : GREEN_DIM }}>
                {playing ? "▶ PLAYING" : "❚❚ PAUSED"}
              </span>
            </div>
          </div>

          {/* Seek bar */}
          <div onClick={seek} style={{ ...bevelIn, background: "#12121A", height: 12, cursor: "pointer", padding: 1, marginBottom: 6 }}>
            <div style={{ width: `${progress * 100}%`, height: "100%", background: `linear-gradient(180deg,${GREEN} 0%,${GREEN_DIM} 100%)` }} />
          </div>

          {/* Transport + volume */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Btn onClick={() => p()?.previousVideo()} label="Previous">◀◀</Btn>
            <Btn onClick={() => p()?.playVideo()} label="Play">▶</Btn>
            <Btn onClick={() => p()?.pauseVideo()} label="Pause">❚❚</Btn>
            <Btn onClick={() => { p()?.stopVideo(); setElapsed(0); }} label="Stop">■</Btn>
            <Btn onClick={() => p()?.nextVideo()} label="Next">▶▶</Btn>

            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, marginLeft: 8 }}>
              <span style={{ fontSize: 9, color: "#C8C8D8", letterSpacing: "0.08em" }}>VOL</span>
              <input
                type="range" min={0} max={100} value={volume}
                onChange={(e) => setVol(Number(e.target.value))}
                aria-label="Volume"
                style={{ flex: 1, accentColor: GREEN, height: 4 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Playlist window ─────────────────────────────────── */}
      <div style={{ ...bevelOut, background: CHROME, padding: 2, marginTop: 8 }}>
        <TitleBar label="PLAYLIST EDITOR" />
        <div style={{ ...bevelIn, background: LCD_BG, margin: 6, padding: 4, height: 132, overflowY: "auto" }}>
          {queue.length === 0 && (
            <div style={{ fontFamily: "'Courier New',monospace", fontSize: 11, color: GREEN_DIM, padding: 4 }}>
              press ▶ to load the playlist…
            </div>
          )}
          {queue.map((vid, i) => (
            <button
              key={vid + i}
              onClick={() => p()?.playVideoAt(i)}
              style={{
                display: "block", width: "100%", textAlign: "left", border: "none",
                background: i === index ? "#00007F" : "transparent",
                color: i === index ? "#FFFFFF" : GREEN,
                fontFamily: "'Courier New',monospace", fontSize: 11,
                padding: "2px 4px", cursor: "pointer",
              }}
            >
              {String(i + 1).padStart(2, "0")}. {i === index ? title : `TRACK ${String(i + 1).padStart(2, "0")}`}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes wa-scroll { from { transform: translateX(100%); } to { transform: translateX(-100%); } }
        @keyframes wa-bar { 0%,100% { height: 10%; } 50% { height: 100%; } }
      `}</style>
    </div>
  );
}

// Decorative only — a cross-origin YouTube iframe can't be tapped by the Web
// Audio API, so there's no real FFT to draw. Bars run on staggered CSS
// keyframes while playing and flatline when paused, which is the honest
// version of the effect rather than faking a spectrum from nothing.
function Visualizer({ playing }: { playing: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 26, flex: 1 }} aria-hidden="true">
      {Array.from({ length: 18 }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: playing ? undefined : "8%",
            background: `linear-gradient(180deg,#B6FF00 0%,${GREEN} 45%,${GREEN_DIM} 100%)`,
            animation: playing ? `wa-bar ${0.5 + (i % 5) * 0.18}s ease-in-out ${i * 0.06}s infinite` : undefined,
          }}
        />
      ))}
    </div>
  );
}

function TitleBar({ label }: { label: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      height: 20, padding: "0 4px",
      background: "linear-gradient(180deg,#5A5A78 0%,#2A2A3A 100%)",
      borderBottom: `1px solid ${BEVEL_DARK}`,
    }}>
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", color: "#D8D8E8" }}>
        {label}
      </span>
      <div style={{ display: "flex", gap: 3 }} aria-hidden="true">
        {["_", "□", "×"].map((g) => (
          <span key={g} style={{
            width: 14, height: 12, background: CHROME, border: `1px solid ${BEVEL_LIGHT}`,
            fontSize: 8, lineHeight: "10px", textAlign: "center", color: "#D8D8E8",
          }}>{g}</span>
        ))}
      </div>
    </div>
  );
}

function Btn({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        ...bevelOut, background: CHROME, color: "#D8D8E8",
        width: 34, height: 26, fontSize: 10, cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

// The 3D bevel is the entire visual grammar of this era's chrome: light
// source top-left, so every raised control gets a light top/left edge and a
// dark bottom/right one, and every sunken well gets the inverse.
const bevelOut: React.CSSProperties = {
  borderTop: `2px solid ${BEVEL_LIGHT}`,
  borderLeft: `2px solid ${BEVEL_LIGHT}`,
  borderBottom: `2px solid ${BEVEL_DARK}`,
  borderRight: `2px solid ${BEVEL_DARK}`,
};
const bevelIn: React.CSSProperties = {
  borderTop: `2px solid ${BEVEL_DARK}`,
  borderLeft: `2px solid ${BEVEL_DARK}`,
  borderBottom: `2px solid ${BEVEL_LIGHT}`,
  borderRight: `2px solid ${BEVEL_LIGHT}`,
};
