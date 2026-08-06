"use client";
import { useState, useEffect } from "react";
import ColorPicker from "./ColorPicker";
import { useIsLowEndDevice } from "@/lib/useIsLowEndDevice";

const TOOLS = [
  { id: "select",  label: "Select",    key: "V", icon: <SelectIcon /> },
  { id: "frame",   label: "Frame",     key: "F", icon: <FrameIcon /> },
  { id: "rect",    label: "Rectangle", key: "R", icon: <RectIcon /> },
  { id: "ellipse", label: "Ellipse",   key: "O", icon: <EllipseIcon /> },
  { id: "arrow",   label: "Arrow",     key: "A", icon: <ArrowIcon /> },
  { id: "text",    label: "Text",      key: "T", icon: <TextIcon /> },
];

const SW_OPTIONS = [1, 2, 3, 4];

export default function CanvasToolbar({
  activeTool, onToolChange,
  fillColor,   onFillChange,
  strokeColor, onStrokeChange,
  strokeWidth, onStrokeWidthChange,
  hasSelection,
}) {
  const [picker, setPicker]   = useState(null); // "fill" | "stroke" | null
  const lowEndDevice = useIsLowEndDevice();

  // Keyboard shortcuts
  useEffect(() => {
    const down = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      const tool = TOOLS.find(t => t.key === e.key.toUpperCase());
      if (tool) { onToolChange(tool.id); setPicker(null); }
      if (e.key === "Escape") { onToolChange("select"); setPicker(null); }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [onToolChange]);

  const togglePicker = (which) => setPicker(p => p === which ? null : which);

  return (
    <div
      onPointerDown={e => e.stopPropagation()}
      style={{
        display: "inline-flex", alignItems: "center", gap: 2,
        background: "rgba(18,18,18,0.97)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 12,
        padding: "5px 8px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04)",
        backdropFilter: lowEndDevice ? undefined : "blur(12px)",
        userSelect: "none",
      }}
    >
      {/* Tool buttons */}
      {TOOLS.map((t, i) => (
        <button
          key={t.id}
          title={`${t.label}  ${t.key}`}
          aria-label={t.label}
          aria-pressed={activeTool === t.id}
          onClick={() => { onToolChange(t.id); setPicker(null); }}
          style={{
            width: 32, height: 32,
            background: activeTool === t.id ? "#7C6AF7" : "transparent",
            border: "none", borderRadius: 7,
            color: activeTool === t.id ? "#fff" : "rgba(237,234,212,0.55)",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.12s, color 0.12s",
          }}
          onMouseEnter={e => { if (activeTool !== t.id) e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
          onMouseLeave={e => { if (activeTool !== t.id) e.currentTarget.style.background = "transparent"; }}
        >
          {t.icon}
        </button>
      ))}

      <Divider />

      {/* Selection indicator */}
      {hasSelection && (
        <span style={{
          fontSize: 9, color: "#7C6AF7", letterSpacing: "0.06em",
          textTransform: "uppercase", fontFamily: "'Space Grotesk',sans-serif",
          opacity: 0.8, paddingRight: 2,
        }}>
          ●
        </span>
      )}

      {/* Fill swatch */}
      <div style={{ position: "relative" }}>
        <button
          title={hasSelection ? "Fill colour (edits selection)" : "Fill colour"}
          aria-label={hasSelection ? "Fill colour (edits selection)" : "Fill colour"}
          aria-expanded={picker === "fill"}
          onClick={() => togglePicker("fill")}
          style={{
            width: 28, height: 28,
            background: fillColor,
            border: picker === "fill"
              ? "2px solid #7C6AF7"
              : hasSelection
              ? "2px solid rgba(124,106,247,0.5)"
              : "2px solid rgba(255,255,255,0.18)",
            borderRadius: 5, cursor: "pointer",
            transition: "border-color 0.15s",
          }}
        />
        {picker === "fill" && (
          <PickerPopover>
            <ColorPicker color={fillColor} onChange={onFillChange} onClose={() => setPicker(null)} />
          </PickerPopover>
        )}
      </div>

      {/* Stroke swatch */}
      <div style={{ position: "relative" }}>
        <button
          title={hasSelection ? "Stroke colour (edits selection)" : "Stroke colour"}
          aria-label={hasSelection ? "Stroke colour (edits selection)" : "Stroke colour"}
          aria-expanded={picker === "stroke"}
          onClick={() => togglePicker("stroke")}
          style={{
            width: 28, height: 28,
            background: "transparent",
            border: picker === "stroke"
              ? `3px solid #7C6AF7`
              : `3px solid ${strokeColor}`,
            borderRadius: 5, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "border-color 0.15s",
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: strokeColor }} />
        </button>
        {picker === "stroke" && (
          <PickerPopover>
            <ColorPicker color={strokeColor} onChange={onStrokeChange} onClose={() => setPicker(null)} />
          </PickerPopover>
        )}
      </div>

      <Divider />

      {/* Stroke width */}
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        {SW_OPTIONS.map(w => (
          <button
            key={w}
            title={`${w}px stroke`}
            aria-label={`${w}px stroke width`}
            aria-pressed={strokeWidth === w}
            onClick={() => onStrokeWidthChange(w)}
            style={{
              width: 24, height: 28,
              background: strokeWidth === w ? "rgba(124,106,247,0.25)" : "transparent",
              border: strokeWidth === w ? "1px solid rgba(124,106,247,0.5)" : "1px solid transparent",
              borderRadius: 5, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <div style={{
              width: 12,
              height: w,
              background: strokeWidth === w ? "#7C6AF7" : "rgba(237,234,212,0.4)",
              borderRadius: 99,
            }} />
          </button>
        ))}
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.08)", margin: "0 4px" }} />;
}

function PickerPopover({ children }) {
  return (
    <div style={{
      position: "absolute",
      bottom: "calc(100% + 10px)",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 500,
    }}>
      {children}
    </div>
  );
}

// ── SVG icons ─────────────────────────────────────────────
function SelectIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 2l4.5 10 1.8-4.2L12.5 6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}
function FrameIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="3" y="3" width="8" height="8" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 1.5" rx="0.5"/>
      <line x1="1" y1="3" x2="1" y2="3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="1" y1="1" x2="3" y2="1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="13" y1="1" x2="11" y2="1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="1" y1="13" x2="3" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="13" y1="13" x2="11" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
function RectIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1.5" y="3" width="11" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  );
}
function EllipseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <ellipse cx="7" cy="7" rx="5.5" ry="4.5" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  );
}
function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <line x1="2" y1="12" x2="11" y2="3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M6.5 3H11v4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function TextIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 3h10M7 3v8M5 11h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
