"use client";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { TransformContext } from "./Canvas";

const HANDLE = 10;

/**
 * `editable` (not `isAdmin` directly — Canvas.jsx computes it per element)
 * gates every interaction: drag, resize, rotate, text edit, and the
 * select/delete/reorder handles. Mutations go through the onUpdate/onDelete
 * /onBringForward/onSendBackward callbacks rather than calling the Zustand
 * store directly — Canvas.jsx binds these to either the persisted store
 * (admin editing a published element) or local, non-persisted session
 * state (a guest editing something they drew this session), so this
 * component doesn't need to know or care which.
 */
export default function CanvasElement({ el, editable, selected, showHandles, isMultiSelected, onSelect, onEnlarge, onUpdate, onDelete, onBringForward, onSendBackward, onInteractionStart, onGroupMoveStart, onGroupMove, autoEdit }) {
  const transformRef = useContext(TransformContext);

  // Captures whether this element was *already* selected before the
  // current pointerdown — read by handleClick below instead of the
  // `selected` prop directly, because React re-renders (with the new
  // selected=true from onSelect() just below) between the pointerdown and
  // click events of the same physical click. Reading the prop directly in
  // handleClick would see the just-updated value and treat every first
  // click as if the element were already selected, jumping straight to
  // text-edit mode instead of selecting first.
  const wasSelectedRef = useRef(false);
  // True for the duration between a pointerdown that actually moved the
  // mouse and the click event that follows it — the browser still fires a
  // native "click" after a drag on the same element, and without this,
  // that trailing click's onSelect(el.id) would collapse a multi-selection
  // right back down to just this one element the instant a group-drag
  // finishes.
  const dragMovedRef = useRef(false);

  // ── Drag ──────────────────────────────────────────────────
  // onInteractionStart fires on the *first actual pointermove*, not at
  // pointerdown — a plain click-to-select is a pointerdown+pointerup with
  // no movement in between, and snapshotting there would push a no-op
  // entry onto undo history. A user who clicks a few things then makes one
  // real edit would then need several Cmd+Z presses before anything
  // visibly changes, which reads as "undo doesn't work."
  const onPointerDownMove = useCallback((e) => {
    if (!editable) return;
    wasSelectedRef.current = selected;
    dragMovedRef.current = false;
    e.stopPropagation();
    // Selecting on pointerdown would collapse a marquee'd multi-selection
    // to just this element before the drag even starts, making it
    // impossible to drag the group — skip it here and let the trailing
    // click (if the pointer never actually moved) do the selecting instead.
    if (isMultiSelected) onGroupMoveStart?.();
    else onSelect(el.id);
    const startX = e.clientX, startY = e.clientY;
    const origX = el.x, origY = el.y;
    let snapshotted = false;

    const onMove = (ev) => {
      dragMovedRef.current = true;
      if (!snapshotted) { snapshotted = true; onInteractionStart?.(); }
      const s = transformRef.current.scale;
      if (isMultiSelected) {
        onGroupMove?.((ev.clientX - startX) / s, (ev.clientY - startY) / s);
      } else {
        onUpdate({
          x: origX + (ev.clientX - startX) / s,
          y: origY + (ev.clientY - startY) / s,
        });
      }
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup",   onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup",   onUp);
  }, [el.id, el.x, el.y, editable, selected, isMultiSelected, transformRef, onUpdate, onSelect, onInteractionStart, onGroupMoveStart, onGroupMove]);

  // ── Resize ────────────────────────────────────────────────
  const onPointerDownResize = useCallback((e) => {
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const origW = el.w, origH = el.h;
    let snapshotted = false;

    const onMove = (ev) => {
      if (!snapshotted) { snapshotted = true; onInteractionStart?.(); }
      const s = transformRef.current.scale;
      let newW = origW + (ev.clientX - startX) / s;
      let newH = origH + (ev.clientY - startY) / s;
      // Shift constrains to the shape's original aspect ratio — driven by
      // whichever axis moved proportionally further, matching Figma's
      // corner-handle behavior rather than forcing width === height.
      if (ev.shiftKey) {
        const factor = Math.max(newW / origW, newH / origH);
        newW = origW * factor;
        newH = origH * factor;
      }
      onUpdate({ w: Math.max(20, newW), h: Math.max(20, newH) });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup",   onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup",   onUp);
  }, [el.w, el.h, transformRef, onUpdate, onInteractionStart]);

  // ── Rotate ────────────────────────────────────────────────
  const onPointerDownRotate = useCallback((e) => {
    e.stopPropagation();
    const cx = el.x + el.w / 2;
    const cy = el.y + el.h / 2;
    let snapshotted = false;

    const onMove = (ev) => {
      if (!snapshotted) { snapshotted = true; onInteractionStart?.(); }
      const s = transformRef.current.scale;
      const { x: tx, y: ty } = transformRef.current;
      const angle =
        Math.atan2((ev.clientY - ty) / s - cy, (ev.clientX - tx) / s - cx) * (180 / Math.PI) + 90;
      onUpdate({ rotation: angle });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup",   onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup",   onUp);
  }, [el.x, el.y, el.w, el.h, transformRef, onUpdate, onInteractionStart]);

  // Text elements previously rendered their <textarea> the instant they
  // were editable at all — not just while selected — so the full-size
  // textarea permanently sat on top of the element and swallowed every
  // pointerdown via its own stopPropagation (needed so clicking in to type
  // doesn't also start a drag). Net effect: text elements could never be
  // dragged by their body at all, which is very likely what "undo doesn't
  // work" actually was — there was nothing to undo because the move never
  // happened in the first place. Fixed to match Figma: one click selects
  // (drag works normally, nothing here blocks it), a second click *while
  // already selected* enters edit mode.
  // `autoEdit` is only meaningful on this element's *first* render — Canvas
  // .jsx sets it for one tick right after creating a new text element by
  // clicking with the text tool, so it mounts straight into edit mode
  // instead of needing a separate click to select and another to edit. The
  // lazy initializer form only runs once at mount, so it's safe even though
  // autoEditId gets cleared again almost immediately.
  const [isEditingText, setIsEditingText] = useState(() => !!autoEdit);
  useEffect(() => { if (!selected) setIsEditingText(false); }, [selected]);

  const handleClick = (e) => {
    e.stopPropagation();
    if (!editable) { if (el.type === "image") onEnlarge(el); return; }
    // A real drag just happened (single move or group move) — the browser
    // still fires this click afterward, but it shouldn't also re-select
    // (which would collapse a group selection) or jump into text-edit mode.
    if (dragMovedRef.current) { dragMovedRef.current = false; return; }
    if (el.type === "text" && wasSelectedRef.current) { setIsEditingText(true); return; }
    onSelect(el.id);
  };

  // Same lazy-snapshot idea as the drag/resize/rotate handlers above —
  // focusing the textarea to look at it (then clicking away without typing)
  // shouldn't create an undo checkpoint. Snapshot on the first keystroke of
  // an edit session instead, reset on blur so the next session gets its own.
  const textEditStartedRef = useRef(false);

  return (
    <div
      onPointerDown={editable ? onPointerDownMove : undefined}
      onClick={handleClick}
      style={{
        position: "absolute",
        left: el.x, top: el.y,
        width: el.w,
        height: el.h,
        transform: `rotate(${el.rotation ?? 0}deg)`,
        zIndex: el.z ?? 0,
        cursor: editable ? "move" : (el.type === "image" ? "zoom-in" : "default"),
        boxSizing: "border-box",
        outline: selected && editable ? "2px solid #7C6AF7" : "none",
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
          {editable && isEditingText ? (
            <textarea
              autoFocus
              value={el.text ?? ""}
              onChange={(e) => {
                if (!textEditStartedRef.current) { textEditStartedRef.current = true; onInteractionStart?.(); }
                onUpdate({ text: e.target.value });
              }}
              onBlur={() => {
                textEditStartedRef.current = false;
                setIsEditingText(false);
                // A text box left empty (new, never typed into, or emptied
                // back out) isn't a real element worth keeping around —
                // matches Figma discarding empty text layers on blur.
                if (!(el.text ?? "").trim()) onDelete();
              }}
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

      {/* ── Selection handles ── */}
      {editable && showHandles && el.type !== "arrow" && (
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
          <FloatingToolbar onBringForward={onBringForward} onSendBackward={onSendBackward} onDelete={onDelete} />
        </>
      )}

      {editable && showHandles && el.type === "arrow" && (
        <FloatingToolbar onBringForward={onBringForward} onSendBackward={onSendBackward} onDelete={onDelete} />
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
  // Multi-segment elbow connectors (a shared trunk fanning into several
  // branches) chain several arrow elements end to end — only the final
  // segment should carry an arrowhead, or every bend reads as its own
  // "done" endpoint. Defaults to true so existing/user-drawn arrows are
  // unaffected.
  const showHead = el.showHead !== false;

  return (
    <svg
      width={el.w || 1}
      height={el.h || 1}
      style={{ position: "absolute", top: 0, left: 0, overflow: "visible", pointerEvents: "none" }}
    >
      {showHead && (
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
      )}
      <line
        x1={ax} y1={ay} x2={bx} y2={by}
        stroke={strokeColor}
        strokeWidth={sw}
        markerEnd={showHead ? `url(#${markId})` : undefined}
        strokeLinecap="round"
      />
    </svg>
  );
}

// Reorders which element draws on top when shapes overlap (the same idea
// as Figma's "Bring forward"/"Send backward") and deletes the selected
// element. Real functionality, worth keeping — but bare ↑/↓ glyphs with
// only a hover tooltip weren't self-explanatory, so this spells it out
// with icon + label instead of relying on hover-to-discover.
function FloatingToolbar({ onBringForward, onSendBackward, onDelete }) {
  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        position: "absolute", top: -36, left: 0,
        display: "flex", alignItems: "center", gap: 2,
        background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 7, padding: 3, whiteSpace: "nowrap",
        zIndex: 20,
      }}
    >
      {[
        { icon: <LayerForwardIcon />, label: "Forward", title: "Bring forward, move above overlapping shapes", fn: onBringForward },
        { icon: <LayerBackwardIcon />, label: "Backward", title: "Send backward, move below overlapping shapes", fn: onSendBackward },
      ].map(({ icon, label, title, fn }) => (
        <button
          key={label}
          onClick={(e) => { e.stopPropagation(); fn(); }}
          title={title}
          aria-label={title}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            background: "transparent", border: "none", color: "#EDEAD4",
            cursor: "pointer", fontSize: 11, fontFamily: "'Space Grotesk',sans-serif",
            padding: "4px 7px", borderRadius: 5, opacity: 0.75,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.75"; e.currentTarget.style.background = "transparent"; }}
        >
          {icon}
          {label}
        </button>
      ))}
      <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.1)", margin: "0 2px" }} />
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        title="Delete"
        aria-label="Delete"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 24, height: 24,
          background: "transparent", border: "none", color: "#EDEAD4",
          cursor: "pointer", borderRadius: 5, opacity: 0.75,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.background = "rgba(255,59,48,0.18)"; e.currentTarget.style.color = "#FF3B30"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.75"; e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#EDEAD4"; }}
      >
        <TrashIcon />
      </button>
    </div>
  );
}

function LayerForwardIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
      <rect x="2" y="4" width="8" height="8" rx="1" fill="rgba(237,234,212,0.3)" />
      <rect x="4" y="2" width="8" height="8" rx="1" fill="currentColor" />
    </svg>
  );
}
function LayerBackwardIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
      <rect x="4" y="2" width="8" height="8" rx="1" fill="rgba(237,234,212,0.3)" />
      <rect x="2" y="4" width="8" height="8" rx="1" fill="currentColor" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <path d="M2.5 3.5h9M5.5 3.5V2h3v1.5M3.5 3.5l.5 8.5h6l.5-8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
