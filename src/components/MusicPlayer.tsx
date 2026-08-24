"use client";

import { useEffect, useRef, useState } from "react";

// Free YouTube IFrame Player API — no key, no dev account, full tracks for
// anyone. The player itself renders at 0x0 (audio only); everything visible
// here is a custom control bar built on top of it via postMessage.
const PLAYLIST_ID = "PLgZlXf3nSyPEUWGKrnFgi-flfPODiryUn";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export default function MusicPlayer() {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [playing, setPlaying] = useState(false);
  const [title, setTitle] = useState("Loading playlist…");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function createPlayer() {
      if (playerRef.current || !hostRef.current) return;
      playerRef.current = new window.YT.Player(hostRef.current, {
        height: "0",
        width: "0",
        playerVars: { listType: "playlist", list: PLAYLIST_ID },
        events: {
          onStateChange: (e: any) => {
            const YT = window.YT;
            setPlaying(e.data === YT.PlayerState.PLAYING);
            if (e.data === YT.PlayerState.PLAYING) {
              setTitle(playerRef.current?.getVideoData?.()?.title || "");
            }
          },
        },
      });
    }

    if (window.YT?.Player) {
      createPlayer();
    } else if (!document.getElementById("yt-iframe-api")) {
      const tag = document.createElement("script");
      tag.id = "yt-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = createPlayer;
    } else {
      window.onYouTubeIframeAPIReady = createPlayer;
    }

    return () => playerRef.current?.destroy?.();
  }, []);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      const p = playerRef.current;
      const d = p?.getDuration?.() || 0;
      if (d > 0) setProgress(p.getCurrentTime() / d);
    }, 500);
    return () => clearInterval(id);
  }, [playing]);

  const toggle = () => (playing ? playerRef.current?.pauseVideo() : playerRef.current?.playVideo());
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const p = playerRef.current;
    const d = p?.getDuration?.() || 0;
    if (!d) return;
    const rect = e.currentTarget.getBoundingClientRect();
    p.seekTo(((e.clientX - rect.left) / rect.width) * d, true);
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 20,
      padding: "20px 24px", borderRadius: 12,
      background: "var(--bg-elevated)", border: "1px solid var(--border)",
      maxWidth: 640,
    }}>
      <div ref={hostRef} style={{ display: "none" }} />

      <button
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        style={{
          width: 40, height: 40, flexShrink: 0, borderRadius: "50%",
          background: "#E3BE45", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600, color: "var(--fg)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          marginBottom: 8,
        }}>
          {title}
        </div>
        <div
          onClick={seek}
          style={{ height: 4, borderRadius: 2, background: "var(--border)", cursor: "pointer" }}
        >
          <div style={{
            height: "100%", width: `${progress * 100}%`, borderRadius: 2,
            background: "#E3BE45",
          }} />
        </div>
      </div>

      <button onClick={() => playerRef.current?.previousVideo()} aria-label="Previous" style={ctrlBtn}>
        <SkipIcon flip />
      </button>
      <button onClick={() => playerRef.current?.nextVideo()} aria-label="Next" style={ctrlBtn}>
        <SkipIcon />
      </button>
    </div>
  );
}

const ctrlBtn: React.CSSProperties = {
  width: 28, height: 28, flexShrink: 0, background: "transparent", border: "none",
  color: "var(--muted-strong)", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
};

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3.5 2.2v9.6l8-4.8-8-4.8z" fill="#0A0A0A" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="3" y="2" width="3" height="10" fill="#0A0A0A" />
      <rect x="8" y="2" width="3" height="10" fill="#0A0A0A" />
    </svg>
  );
}
function SkipIcon({ flip }: { flip?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: flip ? "scaleX(-1)" : undefined }}>
      <path d="M2.5 2.5v9l7-4.5-7-4.5z" fill="currentColor" />
      <rect x="10.5" y="2.5" width="1.5" height="9" fill="currentColor" />
    </svg>
  );
}
