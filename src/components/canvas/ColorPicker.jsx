"use client";
import { useState, useRef, useCallback } from "react";

// ── Colour math ───────────────────────────────────────────
function hsvToHex(h, s, v) {
  const i = Math.floor(h / 60) % 6;
  const f = h / 60 - Math.floor(h / 60);
  const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
  const m = [[v,t,p,p,q,v],[q,v,v,t,p,p],[p,p,q,v,v,t]];
  const [r,g,b] = m.map(c => Math.round(c[i] * 255));
  return "#" + [r,g,b].map(x => x.toString(16).padStart(2,"0")).join("");
}

function hexToHsv(hex) {
  const h6 = hex.replace("#","").padEnd(6,"0").slice(0,6);
  const r = parseInt(h6.slice(0,2),16)/255;
  const g = parseInt(h6.slice(2,4),16)/255;
  const b = parseInt(h6.slice(4,6),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b), d = max - min;
  let hue = 0;
  if (d) {
    if (max===r) hue = ((g-b)/d+6)%6;
    else if (max===g) hue = (b-r)/d+2;
    else hue = (r-g)/d+4;
    hue *= 60;
  }
  return { h: hue, s: max ? d/max : 0, v: max };
}

const W = 220, SV_H = 140;

export default function ColorPicker({ color, onChange, onClose }) {
  const [hsv, setHsv] = useState(() => hexToHsv(color || "#7c6af7"));
  const [hexInput, setHexInput] = useState((color || "#7c6af7").toUpperCase());
  const svRef  = useRef(null);
  const hueRef = useRef(null);

  const commit = useCallback((h, s, v) => {
    const hex = hsvToHex(h, s, v);
    setHexInput(hex.toUpperCase());
    onChange(hex);
  }, [onChange]);

  const trackSV = useCallback((e) => {
    const rect = svRef.current.getBoundingClientRect();
    const s = Math.max(0, Math.min(1, (e.clientX - rect.left)  / rect.width));
    const v = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
    setHsv(prev => { commit(prev.h, s, v); return { ...prev, s, v }; });
  }, [commit]);

  const trackHue = useCallback((e) => {
    const rect = hueRef.current.getBoundingClientRect();
    const h = Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360));
    setHsv(prev => { commit(h, prev.s, prev.v); return { ...prev, h }; });
  }, [commit]);

  const startDrag = (trackFn) => (e) => {
    e.stopPropagation();
    trackFn(e);
    const up = () => { window.removeEventListener("pointermove", trackFn); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", trackFn);
    window.addEventListener("pointerup", up);
  };

  const hueHex = hsvToHex(hsv.h, 1, 1);
  const currentHex = hsvToHex(hsv.h, hsv.s, hsv.v);

  return (
    <div
      onPointerDown={e => e.stopPropagation()}
      style={{
        background: "#1c1c1c",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10,
        padding: "10px 10px 12px",
        width: W + 20,
        boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
        fontFamily: "'Space Grotesk', sans-serif",
        userSelect: "none",
      }}
    >
      {/* SV gradient box */}
      <div
        ref={svRef}
        onPointerDown={startDrag(trackSV)}
        style={{
          width: W, height: SV_H, borderRadius: 6, marginBottom: 8,
          background: `linear-gradient(to bottom, transparent, #000),
                       linear-gradient(to right, #fff, ${hueHex})`,
          position: "relative", cursor: "crosshair",
        }}
      >
        <div style={{
          position: "absolute",
          left: hsv.s * W - 6, top: (1 - hsv.v) * SV_H - 6,
          width: 12, height: 12, borderRadius: "50%",
          border: "2px solid #fff",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.5)",
          background: currentHex, pointerEvents: "none",
        }} />
      </div>

      {/* Hue slider */}
      <div
        ref={hueRef}
        onPointerDown={startDrag(trackHue)}
        style={{
          width: W, height: 12, borderRadius: 6, marginBottom: 10,
          background: "linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)",
          position: "relative", cursor: "ew-resize",
        }}
      >
        <div style={{
          position: "absolute",
          left: (hsv.h / 360) * W - 7, top: -2,
          width: 14, height: 16, borderRadius: 4,
          border: "2px solid #fff",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.4)",
          background: hueHex, pointerEvents: "none",
        }} />
      </div>

      {/* Hex row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 5, flexShrink: 0,
          background: currentHex, border: "1px solid rgba(255,255,255,0.15)",
        }} />
        <input
          value={hexInput}
          onChange={e => {
            const v = e.target.value;
            setHexInput(v);
            if (/^#[0-9a-fA-F]{6}$/.test(v)) {
              const h = hexToHsv(v);
              setHsv(h);
              onChange(v.toLowerCase());
            }
          }}
          spellCheck={false}
          style={{
            flex: 1, background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 5, color: "#EDEAD4",
            fontSize: 11, padding: "4px 8px",
            outline: "none", fontFamily: "monospace",
            letterSpacing: "0.05em",
          }}
        />
        <button
          onClick={onClose}
          style={{
            background: "transparent", border: "none",
            color: "rgba(237,234,212,0.35)", cursor: "pointer",
            fontSize: 14, padding: "2px 4px", lineHeight: 1,
          }}
          onMouseEnter={e => e.currentTarget.style.color = "#EDEAD4"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(237,234,212,0.35)"}
        >✕</button>
      </div>
    </div>
  );
}
