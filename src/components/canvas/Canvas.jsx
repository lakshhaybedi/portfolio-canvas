"use client";
import {
  useRef, useState, useCallback, useEffect, createContext,
} from "react";
import { useCanvasStore } from "@/lib/useCanvasStore";
import CanvasElement from "./CanvasElement";
import CanvasToolbar from "./CanvasToolbar";

const MIN_SCALE = 0.1;
const MAX_SCALE = 5;
const CLAMP = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// Shift-constrain a drag box to a square, anchored at the original
// mousedown point (ox,oy) and growing toward wherever the cursor (cx,cy)
// currently is — used both while drawing a new rect/ellipse/frame and
// while resizing one from a corner handle, so shift behaves identically
// in both cases (matches Figma: the fixed corner never moves, only the
// opposite one follows the larger of the two axis deltas).
function squareConstrain(ox, oy, cx, cy, shiftKey) {
  const w = Math.abs(cx - ox), h = Math.abs(cy - oy);
  if (!shiftKey) {
    return { x: Math.min(ox, cx), y: Math.min(oy, cy), w, h };
  }
  const size = Math.max(w, h);
  const x = cx >= ox ? ox : ox - size;
  const y = cy >= oy ? oy : oy - size;
  return { x, y, w: size, h: size };
}

// Per-unit-deltaY multiplier for ctrl/pinch zoom. Went through two passes:
// the original (0.998, ~21%/120px notch) was reported too slow, a first
// retune toward a documented Figma rate (0.99912, ~10%/notch) was then
// reported *still* too slow — so actual deltaY magnitudes on real trackpads
// clearly run smaller than the ~120px/notch this was calibrated against.
// This pass prioritizes a decisive, clearly-perceptible jump (~55%/120px)
// over precise calibration against an assumption that was already twice
// wrong; easy to retune again if this overshoots.
const ZOOM_WHEEL_FACTOR = 0.985;

// Guest-drawn elements always render above the published page, regardless
// of the published elements' own z values — they're an annotation layer on
// top of real content, not part of it.
const GUEST_Z_BASE = 100000;
const guestUid = () => Math.random().toString(36).slice(2, 10);

// Shared ref so CanvasElement can read live scale without a re-render
export const TransformContext = createContext({ current: { x: 0, y: 0, scale: 1 } });

export default function Canvas({ pageId }) {
  const isAdmin              = useCanvasStore((s) => s.isAdmin);
  const pages                = useCanvasStore((s) => s.pages);
  const addElementStore      = useCanvasStore((s) => s.addElement);
  const updateElementStore   = useCanvasStore((s) => s.updateElement);
  const deleteElementStore   = useCanvasStore((s) => s.deleteElement);
  const updateElementStyle   = useCanvasStore((s) => s.updateElementStyle);
  const bringForwardStore    = useCanvasStore((s) => s.bringForward);
  const sendBackwardStore    = useCanvasStore((s) => s.sendBackward);
  const snapshotStore        = useCanvasStore((s) => s._snapshot);
  const undo                 = useCanvasStore((s) => s.undo);
  const redo                 = useCanvasStore((s) => s.redo);

  const page = pages.find((p) => p.id === pageId);
  const publishedElements = page?.elements ?? [];

  // ── Guest session state — deliberately plain useState, never touching
  // the persisted (zustand `persist`) store. Everyone can use the tools;
  // only admin's changes are saved. A guest's own scribbles live only
  // here, so a refresh clears them for free — there's no persistence to
  // undo. ──────────────────────────────────────────────────────────────
  const [guestElements, setGuestElements] = useState([]);
  const guestElementsRef = useRef(guestElements);
  useEffect(() => { guestElementsRef.current = guestElements; }, [guestElements]);

  const addGuestElement = useCallback((patch) => {
    const element = { id: guestUid(), rotation: 0, ...patch, z: GUEST_Z_BASE + guestElementsRef.current.length };
    setGuestElements((prev) => [...prev, element]);
    return element.id;
  }, []);
  const updateGuestElement = useCallback((id, patch) => {
    setGuestElements((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, []);
  const deleteGuestElement = useCallback((id) => {
    setGuestElements((prev) => prev.filter((e) => e.id !== id));
  }, []);
  const bringForwardGuest = useCallback((id) => {
    setGuestElements((prev) => {
      const max = prev.length ? Math.max(...prev.map((e) => e.z)) : GUEST_Z_BASE;
      return prev.map((e) => (e.id === id ? { ...e, z: max + 1 } : e));
    });
  }, []);
  const sendBackwardGuest = useCallback((id) => {
    setGuestElements((prev) => {
      const min = prev.length ? Math.min(...prev.map((e) => e.z)) : GUEST_Z_BASE;
      return prev.map((e) => (e.id === id ? { ...e, z: min - 1 } : e));
    });
  }, []);

  // Combined list for rendering — guests see the real page plus their own
  // session-only additions on top; admin sees (and edits) only the real,
  // persisted page.
  const elements = isAdmin ? publishedElements : [...publishedElements, ...guestElements];

  const isSessionElement = useCallback((id) => guestElementsRef.current.some((e) => e.id === id), []);

  // ── Transform stored in a ref — zero React re-renders on pan/zoom ──
  const transformRef = useRef({ x: 0, y: 0, scale: 1 });
  const innerRef     = useRef(null);   // the translated/scaled div
  const containerRef = useRef(null);   // the viewport div
  const zoomLabelRef = useRef(null);   // zoom % text node

  const applyTransform = useCallback(() => {
    const { x, y, scale } = transformRef.current;
    if (innerRef.current) {
      innerRef.current.style.transform = `translate3d(${x}px,${y}px,0) scale(${scale})`;
    }
    // grid tracks pan/zoom via background-position/size on the container
    if (containerRef.current) {
      containerRef.current.style.backgroundSize     = `${20 * scale}px ${20 * scale}px`;
      containerRef.current.style.backgroundPosition = `${x}px ${y}px`;
    }
    if (zoomLabelRef.current) {
      zoomLabelRef.current.textContent = `${Math.round(scale * 100)}%`;
    }
  }, []);

  // Wheel events (especially trackpad pinch/pan) can fire dozens of times
  // per frame — calling applyTransform() directly from every one of them
  // was the actual cause of zoom feeling "laggy/stuttery," not the zoom
  // math itself. transformRef.current still updates synchronously on every
  // event (cheap, no DOM touch); the expensive part — writing style.
  // transform and, worse, recomputing the grid's background-size/position
  // (a repaint, not just a composite) — now happens at most once per
  // animation frame, coalescing however many wheel events arrived since.
  const rafRef = useRef(null);
  const scheduleApply = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      applyTransform();
    });
  }, [applyTransform]);

  useEffect(() => () => { if (rafRef.current != null) cancelAnimationFrame(rafRef.current); }, []);

  // ── Tool state ─────────────────────────────────────────────
  const [activeTool,  setActiveTool]  = useState("select");
  // New shapes start unfilled with a red outline — a deliberate "unstyled
  // placeholder" look, distinct from the purple used for the app's own UI
  // chrome/selection state elsewhere.
  const [fillColor,   setFillColor]   = useState("transparent");
  const [strokeColor, setStrokeColor] = useState("#FF3B30");
  const [strokeWidth, setStrokeWidth] = useState(1);
  const [fontSize,    setFontSize]    = useState(14);
  const [fontColor,   setFontColor]   = useState("#EDEAD4");
  const [drawPreview, setDrawPreview] = useState(null);
  const drawStartRef = useRef(null);

  // React state only for things that change the DOM structure
  const [selectedId, setSelectedId]   = useState(null);
  const [lightbox,   setLightbox]     = useState(null);
  const [cursorStyle, setCursorStyle] = useState("default");
  const spaceRef    = useRef(false);
  const isPanRef    = useRef(false);
  const fileInputRef = useRef(null);

  // helper: screen → canvas coords
  const screenToCanvas = useCallback((clientX, clientY) => {
    const rect = containerRef.current.getBoundingClientRect();
    const { x, y, scale } = transformRef.current;
    return { cx: (clientX - rect.left - x) / scale, cy: (clientY - rect.top - y) / scale };
  }, []);

  // update cursor when tool changes
  useEffect(() => {
    if (!isPanRef.current && !spaceRef.current)
      setCursorStyle(activeTool === "select" ? "default" : "crosshair");
  }, [activeTool]);

  // ── Sync selected element → toolbar colors ─────────────────
  useEffect(() => {
    if (!selectedId) return;
    const el = elements.find((e) => e.id === selectedId);
    if (!el) return;
    if (el.fill   !== undefined) setFillColor(el.fill);
    if (el.stroke !== undefined) setStrokeColor(el.stroke);
    if (el.strokeWidth !== undefined) setStrokeWidth(el.strokeWidth);
    if (el.fontSize !== undefined) setFontSize(el.fontSize);
    if (el.color !== undefined) setFontColor(el.color);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]); // only on selection change, not on every element update

  // ── Apply toolbar fill/stroke to selected element — routes to the
  // persisted store for a published element (admin only) or to local
  // session state for a guest's own element. ─────────────────────────
  const handleFillChange = useCallback((color) => {
    setFillColor(color);
    if (!selectedId) return;
    if (isSessionElement(selectedId)) updateGuestElement(selectedId, { fill: color });
    else if (isAdmin) updateElementStyle(pageId, selectedId, { fill: color });
  }, [selectedId, pageId, isAdmin, isSessionElement, updateElementStyle, updateGuestElement]);

  const handleStrokeChange = useCallback((color) => {
    setStrokeColor(color);
    if (!selectedId) return;
    if (isSessionElement(selectedId)) updateGuestElement(selectedId, { stroke: color });
    else if (isAdmin) updateElementStyle(pageId, selectedId, { stroke: color });
  }, [selectedId, pageId, isAdmin, isSessionElement, updateElementStyle, updateGuestElement]);

  const handleStrokeWidthChange = useCallback((w) => {
    setStrokeWidth(w);
    if (!selectedId) return;
    if (isSessionElement(selectedId)) updateGuestElement(selectedId, { strokeWidth: w });
    else if (isAdmin) updateElementStyle(pageId, selectedId, { strokeWidth: w });
  }, [selectedId, pageId, isAdmin, isSessionElement, updateElementStyle, updateGuestElement]);

  const handleFontSizeChange = useCallback((size) => {
    setFontSize(size);
    if (!selectedId) return;
    if (isSessionElement(selectedId)) updateGuestElement(selectedId, { fontSize: size });
    else if (isAdmin) updateElementStyle(pageId, selectedId, { fontSize: size });
  }, [selectedId, pageId, isAdmin, isSessionElement, updateElementStyle, updateGuestElement]);

  const handleFontColorChange = useCallback((color) => {
    setFontColor(color);
    if (!selectedId) return;
    if (isSessionElement(selectedId)) updateGuestElement(selectedId, { color });
    else if (isAdmin) updateElementStyle(pageId, selectedId, { color });
  }, [selectedId, pageId, isAdmin, isSessionElement, updateElementStyle, updateGuestElement]);

  // ── Keyboard ──────────────────────────────────────────────
  // Use a ref so the handler always sees the latest selectedId without stale closure
  const selectedIdRef = useRef(null);
  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);

  useEffect(() => {
    const down = (e) => {
      const tag = e.target.tagName;
      const inInput = tag === "INPUT" || tag === "TEXTAREA";

      if (e.code === "Space" && !inInput) {
        e.preventDefault();
        spaceRef.current = true;
        setCursorStyle("grab");
      }
      if (e.key === "Escape") { setLightbox(null); setSelectedId(null); setActiveTool("select"); setDrawPreview(null); }

      // Undo / Redo — admin only; guest scribbles have no history to undo,
      // they just clear on refresh.
      if ((e.metaKey || e.ctrlKey) && !inInput && isAdmin) {
        if (e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
        if ((e.key === "z" && e.shiftKey) || e.key === "y") { e.preventDefault(); redo(); }
      }

      // Delete selected element
      if ((e.key === "Backspace" || e.key === "Delete") && !inInput) {
        const sid = selectedIdRef.current;
        if (sid) {
          e.preventDefault();
          if (isSessionElement(sid)) deleteGuestElement(sid);
          else if (isAdmin) deleteElementStore(pageId, sid);
          setSelectedId(null);
        }
      }
    };
    const up = (e) => {
      if (e.code === "Space") {
        spaceRef.current = false;
        if (!isPanRef.current) setCursorStyle(activeTool === "select" ? "default" : "crosshair");
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup",   up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [undo, redo, deleteElementStore, isSessionElement, deleteGuestElement, pageId, activeTool, isAdmin]);

  // ── Wheel — runs completely outside React render ───────────
  const onWheel = useCallback((e) => {
    e.preventDefault();
    const t = transformRef.current;
    if (e.ctrlKey) {
      // pinch-to-zoom
      const rect = containerRef.current.getBoundingClientRect();
      const mx   = e.clientX - rect.left;
      const my   = e.clientY - rect.top;
      const newScale = CLAMP(t.scale * Math.pow(ZOOM_WHEEL_FACTOR, e.deltaY), MIN_SCALE, MAX_SCALE);
      const ratio    = newScale / t.scale;
      transformRef.current = { scale: newScale, x: mx - ratio * (mx - t.x), y: my - ratio * (my - t.y) };
    } else {
      // two-finger pan
      transformRef.current = { ...t, x: t.x - e.deltaX, y: t.y - e.deltaY };
    }
    scheduleApply();
  }, [scheduleApply]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  // ── Pointer down — pan or draw ────────────────────────────
  const onPointerDown = useCallback((e) => {
    // Pan: middle-click or space+left
    if (e.button === 1 || (spaceRef.current && e.button === 0)) {
      e.preventDefault();
      isPanRef.current = true;
      setCursorStyle("grabbing");
      const startX = e.clientX - transformRef.current.x;
      const startY = e.clientY - transformRef.current.y;
      const onMove = (ev) => {
        transformRef.current = { ...transformRef.current, x: ev.clientX - startX, y: ev.clientY - startY };
        scheduleApply();
      };
      const onUp = () => {
        isPanRef.current = false;
        setCursorStyle(spaceRef.current ? "grab" : (activeTool === "select" ? "default" : "crosshair"));
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup",   onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup",   onUp);
      return;
    }

    // Draw: left button + non-select tool — everyone can draw now; whether
    // it's saved depends on isAdmin, decided at commit time below.
    if (e.button !== 0 || activeTool === "select") return;
    e.preventDefault();
    e.stopPropagation();
    const { cx: sx, cy: sy } = screenToCanvas(e.clientX, e.clientY);
    drawStartRef.current = { sx, sy };
    setDrawPreview({ type: activeTool, x: sx, y: sy, w: 0, h: 0, fill: fillColor, stroke: strokeColor, strokeWidth });

    const commit = (patch) => (isAdmin ? addElementStore(pageId, patch) : addGuestElement(patch));

    const onMove = (ev) => {
      const { cx, cy } = screenToCanvas(ev.clientX, ev.clientY);
      const { sx: ox, sy: oy } = drawStartRef.current;
      if (activeTool === "arrow") {
        setDrawPreview({ type: "arrow", x: Math.min(ox, cx), y: Math.min(oy, cy), w: Math.abs(cx - ox), h: Math.abs(cy - oy), x1: ox, y1: oy, x2: cx, y2: cy, stroke: strokeColor, strokeWidth });
      } else if (activeTool === "text") {
        const x = Math.min(ox, cx), y = Math.min(oy, cy);
        const w = Math.abs(cx - ox), h = Math.abs(cy - oy);
        setDrawPreview({ type: "text-preview", x, y, w: Math.max(40, w), h: Math.max(20, h) });
      } else {
        // Shift constrains rect/ellipse/frame to a square/circle while
        // drawing — not just when resizing afterward. Anchored at the
        // original mousedown point, growing toward wherever the cursor is.
        const { x, y, w, h } = squareConstrain(ox, oy, cx, cy, ev.shiftKey);
        setDrawPreview({ type: activeTool, x, y, w: Math.max(2, w), h: Math.max(2, h), fill: fillColor, stroke: strokeColor, strokeWidth });
      }
    };
    const onUp = (ev) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup",   onUp);
      const { cx: ex, cy: ey } = screenToCanvas(ev.clientX, ev.clientY);
      const { sx: ox, sy: oy } = drawStartRef.current;
      const dx = Math.abs(ex - ox), dy = Math.abs(ey - oy);
      if (dx > 4 || dy > 4) {
        const squarable = activeTool !== "arrow" && activeTool !== "text";
        const box = squarable ? squareConstrain(ox, oy, ex, ey, ev.shiftKey) : { x: Math.min(ox, ex), y: Math.min(oy, ey), w: Math.abs(ex - ox), h: Math.abs(ey - oy) };
        const x = box.x, y = box.y;
        const w = Math.max(20, box.w), h = Math.max(20, box.h);
        if (activeTool === "arrow") {
          commit({ type: "arrow", x, y, w, h, x1: ox, y1: oy, x2: ex, y2: ey, stroke: strokeColor, strokeWidth });
        } else if (activeTool === "text") {
          commit({ type: "text", text: "Text", x, y, w, h, fill: "transparent", color: fontColor, fontSize });
        } else if (activeTool === "frame") {
          commit({ type: "frame", label: "Frame", x, y, w, h, stroke: strokeColor, strokeWidth });
        } else {
          commit({ type: activeTool, x, y, w, h, fill: fillColor, stroke: strokeColor, strokeWidth });
        }
      } else if (activeTool === "text") {
        commit({ type: "text", text: "Text", x: ox, y: oy, w: 160, h: 48, fill: "transparent", color: fontColor, fontSize });
      }
      setDrawPreview(null);
      drawStartRef.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup",   onUp);
  }, [isAdmin, activeTool, fillColor, strokeColor, strokeWidth, fontColor, fontSize, pageId, addElementStore, addGuestElement, scheduleApply, screenToCanvas]);

  // ── Drop image — admin only; guest image uploads would sit as
  // multi-MB base64 strings in memory with no cleanup story, unlike the
  // lightweight shapes/text the toolbar draws. ───────────────────────
  const onDrop = useCallback((e) => {
    if (!isAdmin) return;
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const { x, y, scale } = transformRef.current;
    const cx = (e.clientX - rect.left - x) / scale;
    const cy = (e.clientY - rect.top  - y) / scale;
    Array.from(e.dataTransfer.files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (ev) => addElementStore(pageId, { type: "image", src: ev.target.result, x: cx - 150, y: cy - 100, w: 300, h: 200 });
      reader.readAsDataURL(file);
    });
  }, [isAdmin, pageId, addElementStore]);

  const onFileChange = useCallback((e) => {
    Array.from(e.target.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => addElementStore(pageId, { type: "image", src: ev.target.result, x: 100 + Math.random() * 200, y: 100 + Math.random() * 100, w: 320, h: 220 });
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }, [pageId, addElementStore]);

  // Font controls only make sense for text — shown while the text tool is
  // active (styling whatever gets drawn next) or while a text element is
  // selected (styling that element), not for rect/ellipse/arrow/frame.
  const selectedElement = selectedId ? elements.find((e) => e.id === selectedId) : null;
  const showTextControls = activeTool === "text" || selectedElement?.type === "text";

  return (
    <TransformContext.Provider value={transformRef}>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", position: "relative" }}>

        {/* Zoom label — always shown, independently positioned bottom-right
            so it never affects the toolbar's centering below. */}
        <span ref={zoomLabelRef} style={{ ...zoomLabelStyle, position: "absolute", bottom: 16, right: 16, zIndex: 10 }}>
          100%
        </span>

        {/* Canvas viewport */}
        <div
          ref={containerRef}
          onPointerDown={onPointerDown}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => { if (activeTool === "select") setSelectedId(null); }}
          style={{
            flex: 1, overflow: "hidden", position: "relative",
            background: "#0d0d0d",
            backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            cursor: cursorStyle,
          }}
        >
          {/* Inner transform layer — GPU composited */}
          <div
            ref={innerRef}
            style={{
              position: "absolute",
              transformOrigin: "0 0",
              transform: "translate3d(0,0,0) scale(1)",
              willChange: "transform",
            }}
          >
            {[...elements]
              .sort((a, b) => (a.z ?? 0) - (b.z ?? 0))
              .map((el) => {
                const isSession = isSessionElement(el.id);
                const editable = isAdmin || isSession;
                return (
                  <CanvasElement
                    key={el.id}
                    el={el}
                    editable={editable}
                    selected={selectedId === el.id}
                    onSelect={setSelectedId}
                    onEnlarge={setLightbox}
                    onUpdate={(patch) => (isSession ? updateGuestElement(el.id, patch) : updateElementStore(pageId, el.id, patch))}
                    onDelete={() => (isSession ? deleteGuestElement(el.id) : deleteElementStore(pageId, el.id))}
                    onBringForward={() => (isSession ? bringForwardGuest(el.id) : bringForwardStore(pageId, el.id))}
                    onSendBackward={() => (isSession ? sendBackwardGuest(el.id) : sendBackwardStore(pageId, el.id))}
                    // One snapshot per drag/resize/rotate/text-edit *gesture*
                    // (fired once at pointerdown/focus), not per pointermove
                    // or keystroke — updateElement itself never snapshots
                    // (it's called continuously mid-drag), so without this,
                    // Cmd+Z had nothing to revert to for moves/resizes/
                    // rotates/text edits, only for style changes and
                    // create/delete/reorder. Session-only guest elements
                    // still have no undo, matching the earlier design.
                    onInteractionStart={isSession ? undefined : snapshotStore}
                  />
                );
              })}

            {/* Draw preview ghost */}
            {drawPreview && <DrawPreview p={drawPreview} />}
          </div>

          {elements.length === 0 && !drawPreview && (
            <div style={emptyStyle}>
              <p style={{ fontFamily: "'Space Grotesk',sans-serif", color: "rgba(237,234,212,0.15)", fontSize: 14 }}>
                {isAdmin ? "Pick a tool below to draw, or drop images here" : "Pick a tool below to try it out — nothing is saved"}
              </p>
            </div>
          )}
        </div>

        {/* ── Floating bottom toolbar — visible for everyone. Guests can
            draw/edit freely; only admin's changes are persisted (see
            CanvasToolbar's "Not saved" indicator for guests). Kept in its
            own centered wrapper with nothing else sharing the row, so
            nothing skews it off-center. ── */}
        <div style={{
          position: "absolute", bottom: 20, left: "50%",
          transform: "translateX(-50%)",
          zIndex: 50,
          pointerEvents: "auto",
        }}>
          <CanvasToolbar
            activeTool={activeTool}
            onToolChange={(t) => { setActiveTool(t); setSelectedId(null); }}
            fillColor={fillColor}     onFillChange={handleFillChange}
            strokeColor={strokeColor} onStrokeChange={handleStrokeChange}
            strokeWidth={strokeWidth} onStrokeWidthChange={handleStrokeWidthChange}
            fontSize={fontSize}   onFontSizeChange={handleFontSizeChange}
            fontColor={fontColor} onFontColorChange={handleFontColorChange}
            showTextControls={showTextControls}
            hasSelection={!!selectedId}
            isAdmin={isAdmin}
          />
        </div>
        {isAdmin && (
          <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={onFileChange} />
        )}

        {/* Lightbox */}
        {lightbox && (
          <div onClick={() => setLightbox(null)} style={lightboxOverlay}>
            {lightbox.type === "image"
              ? <img src={lightbox.src} alt="" style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain" }} />
              : <div style={lightboxText}>{lightbox.text}</div>
            }
          </div>
        )}
      </div>
    </TransformContext.Provider>
  );
}

// ── Draw preview ghost ────────────────────────────────────
function DrawPreview({ p }) {
  if (!p) return null;
  if (p.type === "arrow") {
    const markId = "dp-arr";
    const ax = (p.x1 ?? p.x) - p.x, ay = (p.y1 ?? p.y) - p.y;
    const bx = (p.x2 ?? p.x + p.w) - p.x, by = (p.y2 ?? p.y + p.h) - p.y;
    return (
      <svg width={Math.max(p.w, 1)} height={Math.max(p.h, 1)}
        style={{ position: "absolute", left: p.x, top: p.y, overflow: "visible", pointerEvents: "none", zIndex: 999 }}>
        <defs>
          <marker id={markId} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L8,3 z" fill={p.stroke} />
          </marker>
        </defs>
        <line x1={ax} y1={ay} x2={bx} y2={by}
          stroke={p.stroke} strokeWidth={p.strokeWidth ?? 1.5}
          markerEnd={`url(#${markId})`} strokeLinecap="round" opacity={0.7} />
      </svg>
    );
  }
  if (p.type === "text-preview") {
    return (
      <div style={{
        position: "absolute", left: p.x, top: p.y, width: Math.max(p.w, 20), height: Math.max(p.h, 20),
        border: "1px dashed rgba(237,234,212,0.3)", borderRadius: 2,
        pointerEvents: "none", zIndex: 999,
      }} />
    );
  }
  return (
    <div style={{
      position: "absolute", left: p.x, top: p.y, width: Math.max(p.w, 2), height: Math.max(p.h, 2),
      background: p.fill, borderRadius: p.type === "ellipse" ? "50%" : 2,
      border: `${p.strokeWidth ?? 1}px ${p.type === "frame" ? "dashed" : "solid"} ${p.stroke}`,
      pointerEvents: "none", opacity: 0.7, zIndex: 999, boxSizing: "border-box",
    }} />
  );
}

// ── Static styles ─────────────────────────────────────────
const zoomLabelStyle = {
  fontSize: 11, color: "rgba(237,234,212,0.3)",
  fontFamily: "'Space Grotesk',sans-serif",
  background: "rgba(18,18,18,0.8)",
  padding: "4px 8px", borderRadius: 6,
  border: "1px solid rgba(255,255,255,0.07)",
};
const emptyStyle = {
  position: "absolute", inset: 0, display: "flex", alignItems: "center",
  justifyContent: "center", pointerEvents: "none",
};
const lightboxOverlay = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 9999, cursor: "zoom-out",
};
const lightboxText = {
  maxWidth: "80vw", maxHeight: "80vh", background: "#1a1a1a", padding: "32px",
  borderRadius: 12, color: "#EDEAD4", fontFamily: "'Space Grotesk',sans-serif",
  fontSize: 18, whiteSpace: "pre-wrap", overflow: "auto",
};
