"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Classic Winamp 2.x re-skin over the YouTube IFrame API. The iframe renders
// 0x0 (audio only); everything visible is bitmap-era chrome.
//
// Art and track names come from endpoints that need no API key: thumbnails
// from img.youtube.com, titles from the public oEmbed endpoint. The IFrame
// API itself only hands back video IDs for tracks it hasn't loaded yet.
const PLAYLIST_ID = "PLgZlXf3nSyPEUWGKrnFgi-flfPODiryUn";
const START_VOLUME = 20;

const LCD_BG = "#000000";
const GREEN = "#18E018";
const GREEN_DIM = "#0A7A0A";
const CHROME = "#3B3B4B";
const CHROME_HI = "#4A4A5E";
const BEVEL_LIGHT = "#6E6E82";
const BEVEL_DARK = "#16161E";
const TITLE_TEXT = "#B8B8CE";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const fmt = (s: number) => {
  if (!s || !isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

export default function WinampPlayer() {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [playing, setPlaying] = useState(false);
  const [title, setTitle] = useState("*** LOADING ***");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(START_VOLUME);
  const [queue, setQueue] = useState<string[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);
  // Browsers block unmuted autoplay until the visitor has interacted with the
  // page. We attempt it anyway (some profiles allow it), then fall back to a
  // click-to-start prompt rather than pretending the music is on.
  const [needsGesture, setNeedsGesture] = useState(false);

  useEffect(() => {
    function createPlayer() {
      if (playerRef.current || !hostRef.current) return;
      playerRef.current = new window.YT.Player(hostRef.current, {
        height: "0",
        width: "0",
        playerVars: { listType: "playlist", list: PLAYLIST_ID, autoplay: 1 },
        events: {
          onReady: (e: any) => {
            e.target.setVolume(START_VOLUME);
            e.target.playVideo();
            // If it hasn't actually started shortly after, autoplay was blocked.
            setTimeout(() => {
              if (playerRef.current?.getPlayerState?.() !== window.YT.PlayerState.PLAYING) {
                setNeedsGesture(true);
              }
            }, 1600);
          },
          onStateChange: (e: any) => {
            const p = playerRef.current;
            const isPlaying = e.data === window.YT.PlayerState.PLAYING;
            setPlaying(isPlaying);
            if (isPlaying) setNeedsGesture(false);
            const d = p?.getVideoData?.();
            if (d?.title) setTitle(d.title.toUpperCase());
            if (d?.video_id) setVideoId(d.video_id);
            setDuration(p?.getDuration?.() || 0);
            setQueue(p?.getPlaylist?.() || []);
            setIndex(p?.getPlaylistIndex?.() ?? 0);
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
  }, []);

  // Resolve real track names for the playlist rows. oEmbed is public, CORS-
  // enabled and key-free; anything that fails just keeps its placeholder.
  useEffect(() => {
    if (queue.length === 0) return;
    let cancelled = false;
    (async () => {
      for (const id of queue) {
        if (cancelled) return;
        if (names[id]) continue;
        try {
          const r = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
          if (!r.ok) continue;
          const j = await r.json();
          if (!cancelled && j?.title) setNames((m) => ({ ...m, [id]: j.title }));
        } catch { /* offline or blocked — placeholder stands */ }
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue]);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setElapsed(playerRef.current?.getCurrentTime?.() || 0), 250);
    return () => clearInterval(id);
  }, [playing]);

  const p = () => playerRef.current;
  const start = useCallback(() => { p()?.setVolume(volume); p()?.playVideo(); }, [volume]);
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    p()?.seekTo(((e.clientX - r.left) / r.width) * duration, true);
  };
  const setVol = (v: number) => { setVolume(v); p()?.setVolume(v); };

  const progress = duration ? elapsed / duration : 0;
  const cover = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;

  return (
    <div style={{ width: "100%", maxWidth: 460, fontFamily: "'Tahoma','Geneva',sans-serif", userSelect: "none" }}>
      <div ref={hostRef} style={{ display: "none" }} />

      {/* ── Main window ─────────────────────────────────────── */}
      <div style={{ ...bevelOut, background: CHROME }}>
        <TitleBar label="WINAMP" />
        <MenuBar items={["File", "Play", "Options", "View", "Help"]} />

        <div style={{ padding: "6px 8px 8px" }}>
          <div style={{ ...bevelIn, background: LCD_BG, padding: "6px 8px", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span style={{ color: GREEN, fontSize: 13, lineHeight: "26px" }}>{playing ? "▶" : "❚❚"}</span>
              <div style={{
                fontFamily: "'Courier New',monospace", fontSize: 26, fontWeight: 700,
                color: GREEN, letterSpacing: "0.04em", lineHeight: 1,
                textShadow: `0 0 8px ${GREEN}88`, minWidth: 92,
              }}>
                {fmt(elapsed)}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 1 }}>
                <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                  <Tag>KBPS</Tag><Lit>128</Lit>
                  <Tag>KHZ</Tag><Lit>44</Lit>
                </div>
                <div style={{ display: "flex", gap: 3 }}>
                  <Lit>CD STEREO</Lit>
                  <Tag>EQ</Tag>
                </div>
              </div>

              <Visualizer playing={playing} />
            </div>

            <div style={{ overflow: "hidden", marginTop: 6, height: 14 }}>
              <div style={{
                whiteSpace: "nowrap", fontFamily: "'Courier New',monospace",
                fontSize: 11, color: GREEN, letterSpacing: "0.06em",
                animation: playing ? "wa-scroll 16s linear infinite" : undefined,
              }}>
                {index + 1}. {title} ({fmt(duration)}) ✦ KING GIZZARD RADIO ✦
              </div>
            </div>
          </div>

          {/* Seek */}
          <div onClick={seek} style={{ ...bevelIn, background: "#12121A", height: 14, cursor: "pointer", padding: 1, marginBottom: 8, position: "relative" }}>
            <div style={{ width: `${progress * 100}%`, height: "100%", background: `linear-gradient(180deg,${GREEN} 0%,${GREEN_DIM} 100%)` }} />
            <div style={{
              position: "absolute", top: -1, left: `calc(${progress * 100}% - 5px)`,
              width: 10, height: 14, background: CHROME_HI, ...bevelOut, borderWidth: 1,
            }} />
          </div>

          {/* Transport + volume */}
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <RoundBtn onClick={() => p()?.previousVideo()} label="Previous">◀◀</RoundBtn>
            <RoundBtn onClick={start} label="Play" accent>▶</RoundBtn>
            <RoundBtn onClick={() => p()?.pauseVideo()} label="Pause">❚❚</RoundBtn>
            <RoundBtn onClick={() => { p()?.stopVideo(); setElapsed(0); }} label="Stop">■</RoundBtn>
            <RoundBtn onClick={() => p()?.nextVideo()} label="Next">▶▶</RoundBtn>

            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, marginLeft: 6 }}>
              <span style={{ fontSize: 12, color: TITLE_TEXT }}>🔈</span>
              <input
                type="range" min={0} max={100} value={volume}
                onChange={(e) => setVol(Number(e.target.value))}
                aria-label="Volume"
                style={{ flex: 1, accentColor: GREEN, height: 4 }}
              />
              <span style={{ fontSize: 9, color: TITLE_TEXT, minWidth: 22, textAlign: "right" }}>{volume}</span>
            </div>
          </div>

          {needsGesture && (
            <button
              onClick={start}
              style={{
                ...bevelOut, width: "100%", marginTop: 8, padding: "7px 0",
                background: "linear-gradient(180deg,#FFD24A 0%,#E0A000 100%)",
                color: "#3A2A00", fontWeight: 700, fontSize: 11, cursor: "pointer",
                fontFamily: "inherit", letterSpacing: "0.06em",
              }}
            >
              ♫ CLICK TO START THE MUSIC ♫
            </button>
          )}
        </div>
      </div>

      {/* ── Playlist editor ─────────────────────────────────── */}
      <div style={{ ...bevelOut, background: CHROME, marginTop: 8 }}>
        <TitleBar label="PLAYLIST EDITOR" />
        <MenuBar items={["File", "Playlist", "Sort", "Help"]} />
        <div style={{ ...bevelIn, background: LCD_BG, margin: 6, height: 150, overflowY: "auto" }}>
          {queue.length === 0 && (
            <div style={{ fontFamily: "'Courier New',monospace", fontSize: 11, color: GREEN_DIM, padding: 6 }}>
              loading playlist…
            </div>
          )}
          {queue.map((vid, i) => {
            const active = i === index;
            return (
              <button
                key={vid + i}
                onClick={() => p()?.playVideoAt(i)}
                style={{
                  display: "flex", justifyContent: "space-between", gap: 8,
                  width: "100%", textAlign: "left", border: "none",
                  background: active ? "#00007F" : "transparent",
                  color: active ? "#FFFFFF" : GREEN,
                  fontFamily: "'Courier New',monospace", fontSize: 11,
                  padding: "2px 6px", cursor: "pointer",
                }}
              >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {i + 1}. {names[vid] ?? (active ? title : "…")}
                </span>
                <span style={{ flexShrink: 0, opacity: 0.85 }}>{active ? fmt(duration) : ""}</span>
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 4, padding: "0 6px 6px", flexWrap: "wrap" }}>
          {["Add", "Rem", "Sel", "Misc"].map((l) => (
            <span key={l} style={{
              ...bevelOut, background: CHROME_HI, color: TITLE_TEXT,
              fontSize: 9, padding: "3px 8px", borderRadius: 2,
            }}>{l}</span>
          ))}
          <span style={{
            ...bevelIn, background: LCD_BG, color: GREEN, marginLeft: "auto",
            fontFamily: "'Courier New',monospace", fontSize: 9, padding: "3px 8px",
          }}>
            {queue.length} tracks
          </span>
        </div>
      </div>

      {/* ── Cover art ───────────────────────────────────────── */}
      <div style={{ ...bevelOut, background: CHROME, marginTop: 8 }}>
        <TitleBar label="COVER" />
        <div style={{ ...bevelIn, background: "#1A1A24", margin: 6, aspectRatio: "16/9", overflow: "hidden" }}>
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          ) : (
            <div style={{
              height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Courier New',monospace", fontSize: 11, color: GREEN_DIM,
            }}>
              no art loaded
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes wa-scroll { from { transform: translateX(100%); } to { transform: translateX(-100%); } }
        @keyframes wa-bar { 0%,100% { height: 12%; } 50% { height: 100%; } }
      `}</style>
    </div>
  );
}

// Decorative only — a cross-origin YouTube iframe can't be tapped by the Web
// Audio API, so there's no real FFT to draw. Bars run on staggered CSS
// keyframes while playing and flatline when paused.
function Visualizer({ playing }: { playing: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 28, flex: 1, minWidth: 60 }} aria-hidden="true">
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i} style={{
          flex: 1,
          height: playing ? undefined : "10%",
          background: `linear-gradient(180deg,#B6FF00 0%,${GREEN} 45%,${GREEN_DIM} 100%)`,
          animation: playing ? `wa-bar ${0.5 + (i % 5) * 0.18}s ease-in-out ${i * 0.06}s infinite` : undefined,
        }} />
      ))}
    </div>
  );
}

function TitleBar({ label }: { label: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6, height: 20, padding: "0 4px",
      background: "linear-gradient(180deg,#5A5A78 0%,#2A2A3A 100%)",
      borderBottom: `1px solid ${BEVEL_DARK}`,
    }}>
      <span style={{ width: 9, height: 9, background: CHROME_HI, border: `1px solid ${BEVEL_LIGHT}` }} aria-hidden="true" />
      <span style={{ flex: 1, overflow: "hidden", color: BEVEL_LIGHT, fontSize: 9, letterSpacing: "-1px" }} aria-hidden="true">
        {"═".repeat(40)}
      </span>
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", color: "#D8D8E8", whiteSpace: "nowrap" }}>
        {label}
      </span>
      <span style={{ flex: 1, overflow: "hidden", color: BEVEL_LIGHT, fontSize: 9, letterSpacing: "-1px" }} aria-hidden="true">
        {"═".repeat(40)}
      </span>
      <div style={{ display: "flex", gap: 2 }} aria-hidden="true">
        {["_", "▫", "✕"].map((g) => (
          <span key={g} style={{
            width: 11, height: 11, background: CHROME_HI, border: `1px solid ${BEVEL_LIGHT}`,
            fontSize: 7, lineHeight: "9px", textAlign: "center", color: "#D8D8E8",
          }}>{g}</span>
        ))}
      </div>
    </div>
  );
}

// Inert on purpose — the menu bar is period furniture, not functionality.
// Real dropdowns here would be a lot of machinery for File > Exit.
function MenuBar({ items }: { items: string[] }) {
  return (
    <div style={{
      display: "flex", gap: 14, padding: "3px 10px",
      background: "#D6D6D6", borderBottom: `1px solid ${BEVEL_DARK}`,
    }} aria-hidden="true">
      {items.map((m) => (
        <span key={m} style={{ fontSize: 11, color: "#101010" }}>
          <u>{m[0]}</u>{m.slice(1)}
        </span>
      ))}
    </div>
  );
}

const Tag = ({ children }: { children: React.ReactNode }) => (
  <span style={{ fontSize: 7, color: GREEN_DIM, letterSpacing: "0.06em" }}>{children}</span>
);
const Lit = ({ children }: { children: React.ReactNode }) => (
  <span style={{
    fontSize: 7, color: LCD_BG, background: GREEN, padding: "1px 3px",
    fontFamily: "'Courier New',monospace", fontWeight: 700,
  }}>{children}</span>
);

function RoundBtn({ children, onClick, label, accent }: { children: React.ReactNode; onClick: () => void; label: string; accent?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        width: 30, height: 30, borderRadius: "50%", cursor: "pointer",
        background: `radial-gradient(circle at 35% 28%, ${CHROME_HI} 0%, ${CHROME} 55%, ${BEVEL_DARK} 100%)`,
        border: `1px solid ${BEVEL_LIGHT}`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.22), 0 1px 2px ${BEVEL_DARK}`,
        color: accent ? "#7FD8FF" : TITLE_TEXT,
        fontSize: 9, fontFamily: "inherit", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {children}
    </button>
  );
}

// Light source top-left: raised controls get a light top/left edge and a dark
// bottom/right one; sunken wells get the inverse.
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
