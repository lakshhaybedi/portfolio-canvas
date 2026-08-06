"use client";
import { useState, useEffect, useRef } from "react";
import ColorPicker from "./ColorPicker";
import { useIsLowEndDevice } from "@/lib/useIsLowEndDevice";

// Every slot in the toolbar — tool buttons, the shape-group chevron, colour
// swatches, stroke-width buttons — shares this exact height. The previous
// version mixed 32px tool buttons with 28px swatches/width buttons, which
// is what actually read as "misaligned": everything centers on its own
// baseline via flex `align-items: center`, but differing box heights still
// look uneven at a glance. One height for the whole row fixes that.
const SLOT = 32;

const STANDALONE_TOOLS = [
  { id: "select", label: "Select", key: "V", icon: <SelectIcon /> },
  { id: "frame",  label: "Frame",  key: "F", icon: <FrameIcon /> },
];
const SHAPE_TOOLS = [
  { id: "rect",    label: "Rectangle", key: "R", icon: <RectIcon /> },
  { id: "ellipse", label: "Ellipse",   key: "O", icon: <EllipseIcon /> },
];
const TRAILING_TOOLS = [
  { id: "arrow", label: "Arrow", key: "A", icon: <ArrowIcon /> },
  { id: "text",  label: "Text",  key: "T", icon: <TextIcon /> },
];
const ALL_TOOLS = [...STANDALONE_TOOLS, ...SHAPE_TOOLS, ...TRAILING_TOOLS];

const SW_OPTIONS = [1, 2, 3, 4];

export default function CanvasToolbar({
  activeTool, onToolChange,
  fillColor,   onFillChange,
  strokeColor, onStrokeChange,
  strokeWidth, onStrokeWidthChange,
  fontSize,    onFontSizeChange,
  fontColor,   onFontColorChange,
  showTextControls,
  hasSelection,
  isAdmin,
}) {
  const [picker, setPicker]   = useState(null); // "fill" | "stroke" | "font" | null
  const [shapeMenuOpen, setShapeMenuOpen] = useState(false);
  // Which shape the combined Rectangle/Ellipse slot shows and activates on a
  // plain click — Figma-style: the group remembers whichever variant you
  // used last, the chevron is the only way to switch it.
  const [lastShape, setLastShape] = useState("rect");
  const lowEndDevice = useIsLowEndDevice();

  const closeMenus = () => { setPicker(null); setShapeMenuOpen(false); };

  // Keyboard shortcuts — unchanged behavior, just also keeps the shape
  // group's remembered icon in sync when you press R/O directly.
  useEffect(() => {
    const down = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      const tool = ALL_TOOLS.find(t => t.key === e.key.toUpperCase());
      if (tool) {
        onToolChange(tool.id);
        if (tool.id === "rect" || tool.id === "ellipse") setLastShape(tool.id);
        closeMenus();
      }
      if (e.key === "Escape") { onToolChange("select"); closeMenus(); }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onToolChange]);

  const togglePicker = (which) => { setShapeMenuOpen(false); setPicker(p => p === which ? null : which); };

  const selectTool = (id) => { onToolChange(id); closeMenus(); };

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
      {STANDALONE_TOOLS.map((t) => (
        <ToolButton key={t.id} tool={t} active={activeTool === t.id} onClick={() => selectTool(t.id)} />
      ))}

      <ShapeToolGroup
        activeTool={activeTool}
        lastShape={lastShape}
        open={shapeMenuOpen}
        onToggleMenu={() => { setPicker(null); setShapeMenuOpen(o => !o); }}
        onPick={(id) => { selectTool(id); setLastShape(id); }}
      />

      {TRAILING_TOOLS.map((t) => (
        <ToolButton key={t.id} tool={t} active={activeTool === t.id} onClick={() => selectTool(t.id)} />
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
            width: SLOT - 4, height: SLOT - 4, boxSizing: "border-box",
            display: "flex",
            ...swatchStyle(fillColor),
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
            width: SLOT - 4, height: SLOT - 4, boxSizing: "border-box",
            background: "transparent",
            border: picker === "stroke"
              ? `3px solid #7C6AF7`
              : `3px solid ${strokeColor}`,
            borderRadius: 5, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "border-color 0.15s",
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: "50%", ...swatchStyle(strokeColor) }} />
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
              width: SLOT - 8, height: SLOT, boxSizing: "border-box",
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

      {showTextControls && (
        <>
          <Divider />
          {/* Font size — a plain editable number, like Figma's own field,
              not a fixed preset list; text can reasonably be any size. */}
          <div style={{
            width: 44, height: SLOT, boxSizing: "border-box",
            display: "flex", alignItems: "center",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 6, overflow: "hidden", flexShrink: 0,
          }}>
            <input
              type="number"
              min={1}
              max={400}
              value={fontSize}
              aria-label="Font size"
              title="Font size"
              onChange={e => {
                const n = Math.max(1, Math.min(400, Math.round(Number(e.target.value)) || 1));
                onFontSizeChange(n);
              }}
              style={{
                width: 0, flex: 1, minWidth: 0, background: "transparent", border: "none",
                color: "#EDEAD4", fontSize: 11, padding: "4px 2px 4px 8px",
                outline: "none", fontFamily: "'Space Grotesk',sans-serif",
              }}
            />
            <span style={{ fontSize: 9, color: "rgba(237,234,212,0.4)", padding: "0 6px 0 1px" }}>px</span>
          </div>

          {/* Font colour */}
          <div style={{ position: "relative" }}>
            <button
              title={hasSelection ? "Font colour (edits selection)" : "Font colour"}
              aria-label={hasSelection ? "Font colour (edits selection)" : "Font colour"}
              aria-expanded={picker === "font"}
              onClick={() => togglePicker("font")}
              style={{
                width: SLOT - 4, height: SLOT - 4, boxSizing: "border-box",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "transparent",
                border: picker === "font" ? "2px solid #7C6AF7" : "2px solid rgba(255,255,255,0.18)",
                borderRadius: 5, cursor: "pointer",
                transition: "border-color 0.15s",
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: fontColor, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1 }}>A</span>
            </button>
            {picker === "font" && (
              <PickerPopover>
                <ColorPicker color={fontColor} onChange={onFontColorChange} onClose={() => setPicker(null)} />
              </PickerPopover>
            )}
          </div>
        </>
      )}

      {!isAdmin && (
        <>
          <Divider />
          <span
            title="Draw and edit freely — nothing here is saved, it clears on refresh"
            style={{
              fontSize: 9, color: "rgba(237,234,212,0.4)", letterSpacing: "0.06em",
              textTransform: "uppercase", fontFamily: "'Space Grotesk',sans-serif",
              paddingRight: 2, whiteSpace: "nowrap",
            }}
          >
            Not saved
          </span>
        </>
      )}
    </div>
  );
}

// A colour value may be a plain hex (fully opaque) or an rgba() string with
// alpha < 1 — swatches render it directly as a CSS background, which is
// correct either way, but semi-transparent values need a checkerboard
// backdrop or they just look like a dim solid (no way to tell "this fill is
// 15% opaque" from "this fill is a dim solid colour").
function swatchStyle(color) {
  const checker =
    "linear-gradient(45deg, rgba(255,255,255,0.18) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.18) 75%), " +
    "linear-gradient(45deg, rgba(255,255,255,0.18) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.18) 75%)";
  return {
    backgroundColor: "#3a3a3a",
    backgroundImage: `linear-gradient(${color}, ${color}), ${checker}`,
    backgroundSize: "auto, 8px 8px, 8px 8px",
    backgroundPosition: "0 0, 0 0, 4px 4px",
  };
}

function ToolButton({ tool, active, onClick }) {
  return (
    <button
      title={`${tool.label}  ${tool.key}`}
      aria-label={tool.label}
      aria-pressed={active}
      onClick={onClick}
      style={{
        width: SLOT, height: SLOT,
        background: active ? "#7C6AF7" : "transparent",
        border: "none", borderRadius: 7,
        color: active ? "#fff" : "rgba(237,234,212,0.55)",
        cursor: "pointer", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.12s, color 0.12s",
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      {tool.icon}
    </button>
  );
}

// Figma's toolbar groups related tools behind one slot: a plain click
// activates whichever variant was used last, a small chevron opens a menu
// to switch it. We only have two interchangeable shapes (Rectangle/
// Ellipse) — this is the one real multi-option group in this canvas, so
// it's the one place that gets the chevron treatment rather than sprinkling
// non-functional chevrons on every button to look busier.
function ShapeToolGroup({ activeTool, lastShape, open, onToggleMenu, onPick }) {
  const menuRef = useRef(null);
  const current = SHAPE_TOOLS.find(t => t.id === lastShape) ?? SHAPE_TOOLS[0];
  const active = activeTool === "rect" || activeTool === "ellipse";

  useEffect(() => {
    if (!open) return;
    const onDocPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onToggleMenu();
    };
    window.addEventListener("pointerdown", onDocPointerDown);
    return () => window.removeEventListener("pointerdown", onDocPointerDown);
  }, [open, onToggleMenu]);

  return (
    <div ref={menuRef} style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <button
        title={`${current.label}  ${current.key}`}
        aria-label={current.label}
        aria-pressed={active}
        onClick={() => onPick(current.id)}
        style={{
          width: SLOT, height: SLOT,
          background: active ? "#7C6AF7" : "transparent",
          border: "none", borderRadius: "7px 0 0 7px",
          color: active ? "#fff" : "rgba(237,234,212,0.55)",
          cursor: "pointer", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.12s, color 0.12s",
        }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
      >
        {current.icon}
      </button>
      <button
        aria-label={`${current.label} options`}
        aria-expanded={open}
        onClick={onToggleMenu}
        style={{
          width: 14, height: SLOT,
          background: active ? "#7C6AF7" : "transparent",
          border: "none", borderRadius: "0 7px 7px 0",
          color: active ? "#fff" : "rgba(237,234,212,0.4)",
          cursor: "pointer", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.12s, color 0.12s",
        }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
      >
        <ChevronIcon />
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute", bottom: "calc(100% + 8px)", left: 0,
            background: "#1c1c1c", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8, padding: 4, minWidth: 140,
            boxShadow: "0 12px 40px rgba(0,0,0,0.7)", zIndex: 500,
          }}
        >
          {SHAPE_TOOLS.map((t) => (
            <button
              key={t.id}
              role="menuitem"
              onClick={() => onPick(t.id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 8,
                padding: "6px 8px", borderRadius: 5, border: "none",
                background: activeTool === t.id ? "rgba(124,106,247,0.18)" : "transparent",
                color: activeTool === t.id ? "#fff" : "rgba(237,234,212,0.8)",
                cursor: "pointer", fontSize: 12, fontFamily: "'Space Grotesk',sans-serif",
                textAlign: "left",
              }}
              onMouseEnter={e => { if (activeTool !== t.id) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { if (activeTool !== t.id) e.currentTarget.style.background = activeTool === t.id ? "rgba(124,106,247,0.18)" : "transparent"; }}
            >
              <span style={{ width: 14, display: "flex", justifyContent: "center" }}>{t.icon}</span>
              <span style={{ flex: 1 }}>{t.label}</span>
              <span style={{ opacity: 0.4, fontSize: 10 }}>{t.key}</span>
            </button>
          ))}
        </div>
      )}
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
// Filled, not stroked — Figma's own toolbar icons (move cursor, chevrons)
// are solid shapes, which is part of why they read as crisper at 14px than
// a thin 1.4px stroke does.
function SelectIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 1.5l8.5 8-3.6 0.7 1.9 3.7-1.7 0.9-1.9-3.7-2.6 2.6z" fill="currentColor" />
    </svg>
  );
}
// A crop/viewfinder hash mark — two short verticals + two short horizontals
// — matching Figma's current Frame icon, rather than four separate corner
// brackets (the previous, still-legible-but-not-figma-matching version).
function FrameIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M4.5 1.5v11M9.5 1.5v11M1.5 4.5h11M1.5 9.5h11"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"
      />
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
      <path d="M2.5 3h9M7 3v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
function ChevronIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
      <path d="M2 3l2 2 2-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
