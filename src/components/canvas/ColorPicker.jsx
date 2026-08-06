"use client";
import { useState, useRef, useCallback, useMemo } from "react";

// ── Colour math ───────────────────────────────────────────
// Works in {r,g,b (0-255), a (0-1)} + {h (0-360), s,v (0-1)} throughout —
// alpha is tracked separately from HSV/RGB the whole way through, which the
// previous version didn't do at all (it only ever read/wrote 6-digit hex,
// so picking a colour silently dropped any existing transparency).
function hsvToRgb(h, s, v) {
  const i = Math.floor(h / 60) % 6;
  const f = h / 60 - Math.floor(h / 60);
  const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
  const m = [[v,t,p,p,q,v],[q,v,v,t,p,p],[p,p,q,v,v,t]];
  const [r,g,b] = m.map(c => Math.round(c[i] * 255));
  return { r, g, b };
}

function rgbToHsv(r, g, b) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn,gn,bn), min = Math.min(rn,gn,bn), d = max - min;
  let hue = 0;
  if (d) {
    if (max === rn) hue = ((gn-bn)/d + 6) % 6;
    else if (max === gn) hue = (bn-rn)/d + 2;
    else hue = (rn-gn)/d + 4;
    hue *= 60;
  }
  return { h: hue, s: max ? d/max : 0, v: max };
}

function rgbToHex(r, g, b) {
  return "#" + [r,g,b].map(x => Math.round(x).toString(16).padStart(2,"0")).join("");
}

// Accepts "#rgb"/"#rrggbb" or "rgb()"/"rgba()" — the app hands both around
// interchangeably (defaults are rgba with alpha < 1, hand-picked colours
// used to always come back as opaque hex).
function parseColor(input) {
  const fallback = { r: 124, g: 106, b: 247, a: 1 };
  if (!input) return fallback;
  const str = input.trim();
  if (str.startsWith("rgb")) {
    const nums = str.match(/[\d.]+/g);
    if (!nums || nums.length < 3) return fallback;
    return { r: +nums[0], g: +nums[1], b: +nums[2], a: nums[3] !== undefined ? +nums[3] : 1 };
  }
  if (str.startsWith("#")) {
    let hex = str.slice(1);
    if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
    hex = hex.padEnd(6, "0");
    return {
      r: parseInt(hex.slice(0,2),16),
      g: parseInt(hex.slice(2,4),16),
      b: parseInt(hex.slice(4,6),16),
      a: 1,
    };
  }
  return fallback;
}

function toRgba(r, g, b, a) {
  const rr = Math.round(r), gg = Math.round(g), bb = Math.round(b);
  const aa = Math.round(a * 100) / 100;
  return aa >= 1 ? `rgba(${rr}, ${gg}, ${bb}, 1)` : `rgba(${rr}, ${gg}, ${bb}, ${aa})`;
}

const W = 220, SV_H = 140, ALPHA_H = 12;
const CHECKER =
  "linear-gradient(45deg, #666 25%, transparent 25%, transparent 75%, #666 75%), " +
  "linear-gradient(45deg, #666 25%, transparent 25%, transparent 75%, #666 75%)";

export default function ColorPicker({ color, onChange, onClose }) {
  const initial = useMemo(() => parseColor(color), [color]);
  const [hsv, setHsv] = useState(() => rgbToHsv(initial.r, initial.g, initial.b));
  const [alpha, setAlpha] = useState(initial.a);
  const [hexInput, setHexInput] = useState(rgbToHex(initial.r, initial.g, initial.b).toUpperCase().slice(1));
  const svRef    = useRef(null);
  const hueRef   = useRef(null);
  const alphaRef = useRef(null);

  const commit = useCallback((h, s, v, a) => {
    const { r, g, b } = hsvToRgb(h, s, v);
    setHexInput(rgbToHex(r, g, b).toUpperCase().slice(1));
    onChange(toRgba(r, g, b, a));
  }, [onChange]);

  const trackSV = useCallback((e) => {
    const rect = svRef.current.getBoundingClientRect();
    const s = Math.max(0, Math.min(1, (e.clientX - rect.left)  / rect.width));
    const v = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
    setHsv(prev => { commit(prev.h, s, v, alpha); return { ...prev, s, v }; });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commit, alpha]);

  const trackHue = useCallback((e) => {
    const rect = hueRef.current.getBoundingClientRect();
    const h = Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360));
    setHsv(prev => { commit(h, prev.s, prev.v, alpha); return { ...prev, h }; });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commit, alpha]);

  const trackAlpha = useCallback((e) => {
    const rect = alphaRef.current.getBoundingClientRect();
    const a = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setAlpha(a);
    commit(hsv.h, hsv.s, hsv.v, a);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commit, hsv]);

  const startDrag = (trackFn) => (e) => {
    e.stopPropagation();
    trackFn(e);
    const up = () => { window.removeEventListener("pointermove", trackFn); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", trackFn);
    window.addEventListener("pointerup", up);
  };

  const handleHexChange = (raw) => {
    const v = raw.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
    setHexInput(v.toUpperCase());
    if (v.length === 6) {
      const { r, g, b } = parseColor("#" + v);
      setHsv(rgbToHsv(r, g, b));
      onChange(toRgba(r, g, b, alpha));
    }
  };

  const handleAlphaInput = (raw) => {
    const n = Math.max(0, Math.min(100, Number(raw.replace(/[^0-9]/g, "")) || 0));
    setAlpha(n / 100);
    const { r, g, b } = hsvToRgb(hsv.h, hsv.s, hsv.v);
    onChange(toRgba(r, g, b, n / 100));
  };

  const { r: curR, g: curG, b: curB } = hsvToRgb(hsv.h, hsv.s, hsv.v);
  const { r: hr, g: hg, b: hb } = hsvToRgb(hsv.h, 1, 1);
  const hueHex = rgbToHex(hr, hg, hb);
  const currentHex = rgbToHex(curR, curG, curB);
  const currentRgba = toRgba(curR, curG, curB, alpha);

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
          width: W, height: 12, borderRadius: 6, marginBottom: 8,
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

      {/* Alpha slider — checkerboard backdrop so 0% reads as "transparent",
          not "black". This control didn't exist before; the old picker
          could only ever write fully-opaque hex. */}
      <div
        ref={alphaRef}
        onPointerDown={startDrag(trackAlpha)}
        style={{
          width: W, height: ALPHA_H, borderRadius: 6, marginBottom: 10,
          backgroundImage: `linear-gradient(to right, transparent, ${currentHex}), ${CHECKER}`,
          backgroundSize: "auto, 8px 8px, 8px 8px",
          backgroundPosition: "0 0, 0 0, 4px 4px",
          position: "relative", cursor: "ew-resize",
        }}
      >
        <div style={{
          position: "absolute",
          left: alpha * W - 7, top: -2,
          width: 14, height: 16, borderRadius: 4,
          border: "2px solid #fff",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.4)",
          background: currentRgba, pointerEvents: "none",
        }} />
      </div>

      {/* Hex + alpha row */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 5, flexShrink: 0,
          backgroundImage: `linear-gradient(${currentRgba}, ${currentRgba}), ${CHECKER}`,
          backgroundSize: "auto, 8px 8px, 8px 8px",
          backgroundPosition: "0 0, 0 0, 4px 4px",
          border: "1px solid rgba(255,255,255,0.15)",
        }} />
        <div style={{
          flex: 1, display: "flex", alignItems: "center",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 5, overflow: "hidden",
        }}>
          <span style={{ fontSize: 10, color: "rgba(237,234,212,0.4)", padding: "0 0 0 8px" }}>#</span>
          <input
            value={hexInput}
            onChange={e => handleHexChange(e.target.value)}
            spellCheck={false}
            maxLength={6}
            style={{
              flex: 1, minWidth: 0, background: "transparent", border: "none",
              color: "#EDEAD4", fontSize: 11, padding: "4px 8px 4px 4px",
              outline: "none", fontFamily: "monospace", letterSpacing: "0.05em",
            }}
          />
        </div>
        <div style={{
          width: 48, display: "flex", alignItems: "center", flexShrink: 0,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 5, overflow: "hidden",
        }}>
          <input
            value={Math.round(alpha * 100)}
            onChange={e => handleAlphaInput(e.target.value)}
            spellCheck={false}
            style={{
              width: 0, flex: 1, background: "transparent", border: "none",
              color: "#EDEAD4", fontSize: 11, padding: "4px 2px 4px 6px",
              outline: "none", fontFamily: "monospace", textAlign: "right",
            }}
          />
          <span style={{ fontSize: 10, color: "rgba(237,234,212,0.4)", padding: "0 6px 0 1px" }}>%</span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close colour picker"
          style={{
            background: "transparent", border: "none",
            color: "rgba(237,234,212,0.35)", cursor: "pointer",
            fontSize: 14, padding: "2px 2px", lineHeight: 1, flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.color = "#EDEAD4"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(237,234,212,0.35)"}
        >✕</button>
      </div>
    </div>
  );
}
