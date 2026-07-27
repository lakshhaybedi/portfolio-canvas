"use client";
import { useRef, useCallback, useContext } from "react";
import { useCanvasStore } from "@/lib/useCanvasStore";
import { TransformContext } from "./Canvas";

const HANDLE = 10;

export default function CanvasElement({ el, pageId, selected, onSelect, onEnlarge }) {
  const updateElement = useCanvasStore((s) => s.updateElement);
  const deleteElement = useCanvasStore((s) => s.deleteElement);
  const bringForward  = useCanvasStore((s) => s.bringForward);
  const sendBackward  = useCanvasStore((s) => s.sendBackward);
  const isAdmin       = useCanvasStore((s) => s.isAdmin);
  const transformRef  = useContext(TransformContext);

  // ── Drag ──────────────────────────────────────────────────
  const onPointerDownMove = useCallback((e) => {
    if (!isAdmin) return;
    e.stopPropagation();
    onSelect(el.id);
    const startX = e.clientX, startY = e.clientY;
    const origX = el.x, origY = el.y;

    const onMove = (ev) => {
      const s = transformRef.current.scale;
      updateElement(pageId, el.id, {
        x: origX + (ev.clientX - startX) / s,
        y: origY + (ev.clientY - startY) / s,
      });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup",   onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup",   onUp);
  }, [el.id, el.x, el.y, pageId, isAdmin, transformRef, updateElement, onSelect]);

  // ── Resize ────────────────────────────────────────────────
  const onPointerDownResize = useCallback((e) => {
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const origW = el.w, origH = el.h;

    const onMove = (ev) => {
      const s = transformRef.current.scale;
      updateElement(pageId, el.id, {
        w: Math.max(20, origW + (ev.clientX - startX) / s),
        h: Math.max(20, origH + (ev.clientY - startY) / s),
      });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup",   onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup",   onUp);
  }, [el.id, el.w, el.h, pageId, transformRef, updateElement]);

  // ── Rotate ────────────────────────────────────────────────
  const onPointerDownRotate = useCallback((e) => {
    e.stopPropagation();
    const cx = el.x + el.w / 2;
    const cy = el.y + el.h / 2;

    const onMove = (ev) => {
      const s = transformRef.current.scale;
      const { x: tx, y: ty } = transformRef.current;
      const angle =
        Math.atan2((ev.clientY - ty) / s - cy, (ev.clientX - tx) / s - cx) * (180 / Math.PI) + 90;
      updateElement(pageId, el.id, { rotation: angle });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup",   onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup",   onUp);
  }, [el.id, el.x, el.y, el.w, el.h, pageId, transformRef, updateElement]);

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isAdmin) { if (el.type === "image") onEnlarge(el); }
    else onSelect(el.id);
  };

  const isShape = ["rect", "ellipse", "frame"].includes(el.type);

  return (
    <div
      onPointerDown={isAdmin ? onPointerDownMove : undefined}
      onClick={handleClick}
      style={{
        position: "absolute",
        left: el.x, top: el.y,
        width: el.type === "arrow" ? el.w : el.w,
        height: el.type === "arrow" ? el.h : el.h,
        transform: `rotate(${el.rotation ?? 0}deg)`,
        zIndex: el.z ?? 0,
        cursor: isAdmin ? "move" : (el.type === "image" ? "zoom-in" : "default"),
        boxSizing: "border-box",
        outline: selected && isAdmin ? "2px solid #7C6AF7" : "none",
        outlineOffset: 2,
        userSelect: "none",
        willChange: "transform",
      }}
    >
      {/* ── Render by type ─── */}
      {el.type === "image" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={el.src}
          alt=""
          draggable={false}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      )}

      {el.type === "text" && (
        <div style={{
          width: "100%", height: "100%", padding: "8px 10px",
          background: el.fill ?? "rgba(255,255,255,0.06)",
          color: el.color ?? "#EDEAD4",
          fontSize: el.fontSize ?? 14,
          fontFamily: "'Space Grotesk',sans-serif",
          overflow: "hidden", whiteSpace: "pre-wrap", wordBreak: "break-word",
        }}>
          {isAdmin ? (
            <textarea
              value={el.text ?? ""}
              onChange={(e) => updateElement(pageId, el.id, { text: e.target.value })}
              onPointerDown={(e) => e.stopPropagation()}
              style={{
                width: "100%", height: "100%", background: "transparent",
                border: "none", outline: "none", color: "inherit",
                fontSize: "inherit", fontFamily: "inherit", resize: "none", cursor: "text",
              }}
            />
          ) : el.text}
        </div>
      )}

      {el.type === "rect" && (
        <div style={{
          width: "100%", height: "100%",
          background: el.fill ?? "rgba(124,106,247,0.15)",
          border: `${el.strokeWidth ?? 1}px solid ${el.stroke ?? "#7C6AF7"}`,
          borderRadius: 2, boxSizing: "border-box",
        }} />
      )}

      {el.type === "ellipse" && (
        <div style={{
          width: "100%", height: "100%",
          background: el.fill ?? "rgba(124,106,247,0.15)",
          border: `${el.strokeWidth ?? 1}px solid ${el.stroke ?? "#7C6AF7"}`,
          borderRadius: "50%", boxSizing: "border-box",
        }} />
      )}

      {el.type === "frame" && (
        <div style={{
          width: "100%", height: "100%",
          background: "transparent",
          border: `${el.strokeWidth ?? 1}px dashed ${el.stroke ?? "rgba(255,255,255,0.35)"}`,
          borderRadius: 2, boxSizing: "border-box",
          position: "relative",
        }}>
          {el.label && (
            <span style={{
              position: "absolute",
              top: -18, left: 0,
              fontSize: 10, fontFamily: "'Space Grotesk',sans-serif",
              color: el.stroke ?? "rgba(255,255,255,0.35)",
              letterSpacing: "0.06em", textTransform: "uppercase",
              pointerEvents: "none", whiteSpace: "nowrap",
            }}>
              {el.label}
            </span>
          )}
        </div>
      )}

      {el.type === "arrow" && (
        <ArrowElement el={el} />
      )}

      {/* ── Admin handles ── */}
      {isAdmin && selected && el.type !== "arrow" && (
        <>
          <div
            onPointerDown={onPointerDownResize}
            style={{
              position: "absolute", right: -HANDLE / 2, bottom: -HANDLE / 2,
              width: HANDLE, height: HANDLE, background: "#7C6AF7",
              borderRadius: 2, cursor: "nwse-resize", zIndex: 10,
            }}
          />
          <div
            onPointerDown={onPointerDownRotate}
            style={{
              position: "absolute", right: -HANDLE / 2, top: -HANDLE / 2,
              width: HANDLE, height: HANDLE, background: "#E20074",
              borderRadius: "50%", cursor: "crosshair", zIndex: 10,
            }}
          />
          <FloatingToolbar pageId={pageId} el={el} bringForward={bringForward} sendBackward={sendBackward} deleteElement={deleteElement} />
        </>
      )}

      {isAdmin && selected && el.type === "arrow" && (
        <FloatingToolbar pageId={pageId} el={el} bringForward={bringForward} sendBackward={sendBackward} deleteElement={deleteElement} />
      )}
    </div>
  );
}

function ArrowElement({ el }) {
  const strokeColor = el.stroke ?? "#7C6AF7";
  const sw = el.strokeWidth ?? 1.5;
  // Arrow coords relative to bounding rect
  const ax = el.x1 - el.x, ay = el.y1 - el.y;
  const bx = el.x2 - el.x, by = el.y2 - el.y;
  const markId = `arr-${el.id}`;

  return (
    <svg
      width={el.w || 1}
      height={el.h || 1}
      style={{ position: "absolute", top: 0, left: 0, overflow: "visible", pointerEvents: "none" }}
    >
      <defs>
        <marker
          id={markId}
          markerWidth="8" markerHeight="8"
          refX="6" refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L8,3 z" fill={strokeColor} />
        </marker>
      </defs>
      <line
        x1={ax} y1={ay} x2={bx} y2={by}
        stroke={strokeColor}
        strokeWidth={sw}
        markerEnd={`url(#${markId})`}
        strokeLinecap="round"
      />
    </svg>
  );
}

function FloatingToolbar({ pageId, el, bringForward, sendBackward, deleteElement }) {
  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        position: "absolute", top: -36, left: 0,
        display: "flex", gap: 4,
        background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 6, padding: "3px 5px", whiteSpace: "nowrap",
        zIndex: 20,
      }}
    >
      {[
        ["↑", () => bringForward(pageId, el.id),  "Bring forward"],
        ["↓", () => sendBackward(pageId, el.id),  "Send backward"],
        ["✕", () => deleteElement(pageId, el.id), "Delete"],
      ].map(([label, fn, title]) => (
        <button
          key={title}
          onClick={(e) => { e.stopPropagation(); fn(); }}
          title={title}
          style={{
            background: "transparent", border: "none", color: "#EDEAD4",
            cursor: "pointer", fontSize: 12, padding: "2px 5px",
            borderRadius: 4, opacity: 0.7,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
