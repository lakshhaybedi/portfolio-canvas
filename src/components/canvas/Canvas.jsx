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
// Half-extent of the dot-grid's oversized transform layer, in canvas units
// — must be a multiple of the grid's own 20px tile so background-position
// "0 0" on the oversized box still lands on the same tile boundary as
// canvas-space (0,0). 4000px covers ±800% zoom-out or ±80000px of pan
// before the grid would visibly run out — comfortably beyond this app's
// own 10%-500% zoom range.
const GRID_HALF_SIZE = 4000;

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
  const deleteElementsStore  = useCanvasStore((s) => s.deleteElements);
  const updateElementStyle   = useCanvasStore((s) => s.updateElementStyle);
  const bringForwardStore    = useCanvasStore((s) => s.bringForward);
  const sendBackwardStore    = useCanvasStore((s) => s.sendBackward);
  const snapshotStore        = useCanvasStore((s) => s._snapshot);
  const undo                 = useCanvasStore((s) => s.undo);
  const redo                 = useCanvasStore((s) => s.redo);
  const canUndo               = useCanvasStore((s) => s._history.length > 0);
  const canRedo               = useCanvasStore((s) => s._future.length > 0);

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

  // Guest undo/redo — a parallel, non-persisted history stack mirroring the
  // admin store's _history/_future exactly, just scoped to this session's
  // own guestElements instead of the real pages. Every guestElements array
  // is always replaced wholesale (spread/map/filter, never mutated in
  // place), so a snapshot only needs to hold the array *reference* at that
  // moment — no deep clone required, unlike the store's JSON round-trip
  // (which has to cover a more complex multi-page shape).
  const [guestHistory, setGuestHistory] = useState([]);
  const [guestFuture,  setGuestFuture]  = useState([]);

  const snapshotGuest = useCallback(() => {
    setGuestHistory((h) => [...h.slice(-49), guestElementsRef.current]);
    setGuestFuture([]);
  }, []);

  const guestUndo = useCallback(() => {
    setGuestHistory((h) => {
      if (!h.length) return h;
      const prev = h[h.length - 1];
      setGuestFuture((f) => [guestElementsRef.current, ...f.slice(0, 49)]);
      setGuestElements(prev);
      return h.slice(0, -1);
    });
  }, []);

  const guestRedo = useCallback(() => {
    setGuestFuture((f) => {
      if (!f.length) return f;
      const next = f[0];
      setGuestHistory((h) => [...h.slice(-49), guestElementsRef.current]);
      setGuestElements(next);
      return f.slice(1);
    });
  }, []);

  // Create/delete/reorder are each already one discrete, meaningful action
  // (not a continuous drag), so — same as the admin store's addElement/
  // deleteElement/bringForward/sendBackward — these snapshot immediately
  // rather than waiting for a "first real mutation" signal.
  const addGuestElement = useCallback((patch) => {
    snapshotGuest();
    const element = { id: guestUid(), rotation: 0, ...patch, z: GUEST_Z_BASE + guestElementsRef.current.length };
    setGuestElements((prev) => [...prev, element]);
    return element.id;
  }, [snapshotGuest]);
  const updateGuestElement = useCallback((id, patch) => {
    setGuestElements((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, []);
  const deleteGuestElement = useCallback((id) => {
    snapshotGuest();
    setGuestElements((prev) => prev.filter((e) => e.id !== id));
  }, [snapshotGuest]);
  // Batch delete for marquee multi-select — one snapshot for the whole
  // group, matching deleteElements on the admin store.
  const deleteGuestElements = useCallback((ids) => {
    snapshotGuest();
    const idSet = new Set(ids);
    setGuestElements((prev) => prev.filter((e) => !idSet.has(e.id)));
  }, [snapshotGuest]);
  const bringForwardGuest = useCallback((id) => {
    snapshotGuest();
    setGuestElements((prev) => {
      const max = prev.length ? Math.max(...prev.map((e) => e.z)) : GUEST_Z_BASE;
      return prev.map((e) => (e.id === id ? { ...e, z: max + 1 } : e));
    });
  }, [snapshotGuest]);
  const sendBackwardGuest = useCallback((id) => {
    snapshotGuest();
    setGuestElements((prev) => {
      const min = prev.length ? Math.min(...prev.map((e) => e.z)) : GUEST_Z_BASE;
      return prev.map((e) => (e.id === id ? { ...e, z: min - 1 } : e));
    });
  }, [snapshotGuest]);

  // Combined list for rendering — guests see the real page plus their own
  // session-only additions on top; admin sees (and edits) only the real,
  // persisted page.
  const elements = isAdmin ? publishedElements : [...publishedElements, ...guestElements];

  const isSessionElement = useCallback((id) => guestElementsRef.current.some((e) => e.id === id), []);

  // ── Group move — dragging any element that's part of a >1 marquee
  // selection moves the whole group together, not just the one under the
  // cursor. groupDragOriginRef captures every selected element's position
  // once at drag start; each subsequent pointermove reapplies that same
  // (dx,dy) offset to all of them, rather than compounding per-frame
  // deltas onto positions that are also being written to (React state
  // updates are async, so reading "current" x/y mid-drag would race).
  const groupDragOriginRef = useRef(null);
  const beginGroupMove = useCallback(() => {
    const origins = {};
    selectedIdsRef.current.forEach((id) => {
      const el = elements.find((e) => e.id === id);
      if (el) origins[id] = { x: el.x, y: el.y };
    });
    groupDragOriginRef.current = origins;
  }, [elements]);
  const applyGroupMove = useCallback((dx, dy) => {
    const origins = groupDragOriginRef.current;
    if (!origins) return;
    Object.entries(origins).forEach(([id, pos]) => {
      const patch = { x: pos.x + dx, y: pos.y + dy };
      if (isSessionElement(id)) updateGuestElement(id, patch);
      else updateElementStore(pageId, id, patch);
    });
  }, [isSessionElement, updateGuestElement, updateElementStore, pageId]);

  // ── Transform stored in a ref — zero React re-renders on pan/zoom ──
  const transformRef = useRef({ x: 0, y: 0, scale: 1 });
  const innerRef     = useRef(null);   // the translated/scaled div
  const gridRef       = useRef(null);  // the translated/scaled dot-grid layer
  const containerRef = useRef(null);   // the viewport div
  const zoomLabelRef = useRef(null);   // zoom % text node

  const applyTransform = useCallback(() => {
    const { x, y, scale } = transformRef.current;
    const t = `translate3d(${x}px,${y}px,0) scale(${scale})`;
    if (innerRef.current) {
      innerRef.current.style.transform = t;
    }
    // The grid used to track zoom by rewriting background-size/position on
    // every frame — each write forces the browser to actually repaint that
    // radial-gradient tile across the full viewport, which turned out to be
    // the real cost behind "zoom feels laggy/stuttery on M5 Pro," not the
    // frequency of updates (rAF-batching alone didn't fix it, because a
    // single repaint per frame is still a repaint per frame). The grid now
    // lives on its own oversized, statically-tiled layer that gets the same
    // translate3d/scale transform as the content layer above — a pure
    // compositor operation, same as how innerRef already avoided repaints
    // for the actual case-study content.
    if (gridRef.current) {
      gridRef.current.style.transform = t;
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

  // ── Zoom/pan controls — a mouse-wheel/trackpad-only way to navigate the
  // canvas excludes anyone who can't do a precise pinch or two-finger pan
  // (motor impairments, some trackpads/mice, screen-magnifier users who
  // need predictable fixed steps). These give the same transform math a
  // set of discrete, keyboard-operable buttons. Anchored on the viewport's
  // own center (not the cursor, unlike wheel-zoom) since a button has no
  // meaningful cursor position of its own.
  const zoomStep = useCallback((factor) => {
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.width / 2, cy = rect.height / 2;
    const t = transformRef.current;
    const newScale = CLAMP(t.scale * factor, MIN_SCALE, MAX_SCALE);
    const ratio = newScale / t.scale;
    transformRef.current = { scale: newScale, x: cx - ratio * (cx - t.x), y: cy - ratio * (cy - t.y) };
    applyTransform();
  }, [applyTransform]);

  const resetZoom = useCallback(() => {
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.width / 2, cy = rect.height / 2;
    const t = transformRef.current;
    const ratio = 1 / t.scale;
    transformRef.current = { scale: 1, x: cx - ratio * (cx - t.x), y: cy - ratio * (cy - t.y) };
    applyTransform();
  }, [applyTransform]);

  // Fixed screen-space nudge, not scaled by zoom — panning should move the
  // same visible distance regardless of how far in you've zoomed.
  const PAN_STEP = 120;
  const panBy = useCallback((dx, dy) => {
    const t = transformRef.current;
    transformRef.current = { ...t, x: t.x + dx, y: t.y + dy };
    applyTransform();
  }, [applyTransform]);

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
  const [marquee, setMarquee] = useState(null); // {x,y,w,h} while rubber-band selecting
  const drawStartRef = useRef(null);
  // The pointerup that commits a new text element also switches activeTool
  // to "select" (so the *next* click doesn't spawn another box). The browser
  // then fires a native "click" for that same gesture on the container,
  // whose deselect-on-click handler below re-reads activeTool — which is
  // now "select" — and wipes the selection it was just given. This flag
  // suppresses exactly that one trailing click.
  const suppressClickRef = useRef(false);

  // React state only for things that change the DOM structure
  const [selectedId, setSelectedId]   = useState(null);
  // Marquee/rubber-band multi-select — the full set of currently-selected
  // ids. selectedId stays the "solo" selection (drives the style panel,
  // resize/rotate handles, autoEdit) and is kept in sync as a singleton
  // whenever exactly one element is selected; selectedIds is the source of
  // truth for "is this element part of the current selection" (outline)
  // and for group move/delete once more than one id is in it.
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const selectedIdsRef = useRef(selectedIds);
  useEffect(() => { selectedIdsRef.current = selectedIds; }, [selectedIds]);
  const selectSingle = useCallback((id) => {
    setSelectedId(id);
    setSelectedIds(new Set([id]));
  }, []);
  const clearSelection = useCallback(() => {
    setSelectedId(null);
    setSelectedIds(new Set());
  }, []);
  // Set for exactly one render right after a text element is created by
  // clicking with the text tool — tells that specific CanvasElement to
  // mount straight into edit mode instead of requiring a separate click to
  // select, then another to start typing. Cleared on the next tick; since
  // it only needs to be true for the new element's *first* render (a
  // useState lazy initializer, not a live prop), clearing it doesn't undo
  // the edit-mode it already kicked off.
  const [autoEditId,  setAutoEditId]  = useState(null);
  // Clears the very next tick after being set — the new CanvasElement only
  // needs to see autoEditId===its own id for its first render (captured
  // into a useState lazy initializer there), so this doesn't need to stay
  // true, just needs to not still be pointing at this id if the user later
  // deselects and reselects the same element (which shouldn't force edit
  // mode again).
  useEffect(() => {
    if (autoEditId == null) return;
    const t = setTimeout(() => setAutoEditId(null), 0);
    return () => clearTimeout(t);
  }, [autoEditId]);
  const [lightbox,   setLightbox]     = useState(null);
  const [cursorStyle, setCursorStyle] = useState("default");
  const spaceRef    = useRef(false);
  const isPanRef    = useRef(false);
  const fileInputRef = useRef(null);

  // Guest-mode landing toast — explains the session-only editing model up
  // front rather than letting someone draw for a while and only discover
  // on refresh that none of it stuck. Re-shows if isAdmin goes back to
  // false (locking out of admin), not just on first mount.
  const [showGuestToast, setShowGuestToast] = useState(false);
  useEffect(() => {
    if (isAdmin) { setShowGuestToast(false); return; }
    setShowGuestToast(true);
    const t = setTimeout(() => setShowGuestToast(false), 8000);
    return () => clearTimeout(t);
  }, [isAdmin]);

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
  //
  // These use plain updateElement (no auto-snapshot), not updateElementStyle
  // — dragging across the colour picker's gradient square fires onChange on
  // every pointermove, and updateElementStyle snapshots on *every* call, so
  // one colour pick was flooding undo history with dozens of entries (the
  // same bug the drag/resize/rotate fix addressed, just in a different
  // control). beginStyleEdit below snapshots once, when a picker opens or
  // the size field gains focus — the gesture boundary — not per intermediate
  // value.
  const beginStyleEdit = useCallback(() => {
    if (!selectedId) return;
    if (isSessionElement(selectedId)) snapshotGuest();
    else if (isAdmin) snapshotStore();
  }, [selectedId, isAdmin, isSessionElement, snapshotStore, snapshotGuest]);

  const handleFillChange = useCallback((color) => {
    setFillColor(color);
    if (!selectedId) return;
    if (isSessionElement(selectedId)) updateGuestElement(selectedId, { fill: color });
    else if (isAdmin) updateElementStore(pageId, selectedId, { fill: color });
  }, [selectedId, pageId, isAdmin, isSessionElement, updateElementStore, updateGuestElement]);

  const handleStrokeChange = useCallback((color) => {
    setStrokeColor(color);
    if (!selectedId) return;
    if (isSessionElement(selectedId)) updateGuestElement(selectedId, { stroke: color });
    else if (isAdmin) updateElementStore(pageId, selectedId, { stroke: color });
  }, [selectedId, pageId, isAdmin, isSessionElement, updateElementStore, updateGuestElement]);

  // Stroke width is a discrete button click, not a drag — each click is
  // already exactly one meaningful change, so updateElementStyle's per-call
  // snapshot is correct here as-is.
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
    else if (isAdmin) updateElementStore(pageId, selectedId, { fontSize: size });
  }, [selectedId, pageId, isAdmin, isSessionElement, updateElementStore, updateGuestElement]);

  const handleFontColorChange = useCallback((color) => {
    setFontColor(color);
    if (!selectedId) return;
    if (isSessionElement(selectedId)) updateGuestElement(selectedId, { color });
    else if (isAdmin) updateElementStore(pageId, selectedId, { color });
  }, [selectedId, pageId, isAdmin, isSessionElement, updateElementStore, updateGuestElement]);

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
      if (e.key === "Escape") { setLightbox(null); clearSelection(); setActiveTool("select"); setDrawPreview(null); }

      // Undo / Redo — routes to whichever history the current user actually
      // has: admin edits undo through the persisted store, guest scribbles
      // undo through the session-only guestHistory stack (still cleared on
      // refresh either way, just recoverable with Cmd+Z while it lasts).
      if ((e.metaKey || e.ctrlKey) && !inInput) {
        const doUndo = isAdmin ? undo : guestUndo;
        const doRedo = isAdmin ? redo : guestRedo;
        if (e.key === "z" && !e.shiftKey) { e.preventDefault(); doUndo(); }
        if ((e.key === "z" && e.shiftKey) || e.key === "y") { e.preventDefault(); doRedo(); }
        // Zoom — keyboard equivalents of the on-screen zoom buttons, for
        // anyone who can't do a precise trackpad pinch. "=" so Cmd+Plus
        // works without needing Shift on US keyboard layouts.
        if (e.key === "=" || e.key === "+") { e.preventDefault(); zoomStep(1.2); }
        if (e.key === "-" || e.key === "_") { e.preventDefault(); zoomStep(1 / 1.2); }
        if (e.key === "0") { e.preventDefault(); resetZoom(); }
      }

      // Delete selected element(s) — batches a marquee multi-selection into
      // a single deleteElements/deleteGuestElements call so undo restores
      // the whole group in one step, not one Cmd+Z per element.
      if ((e.key === "Backspace" || e.key === "Delete") && !inInput) {
        const ids = selectedIdsRef.current.size
          ? [...selectedIdsRef.current]
          : (selectedIdRef.current ? [selectedIdRef.current] : []);
        if (ids.length) {
          e.preventDefault();
          const guestIds = ids.filter((id) => isSessionElement(id));
          const adminIds = ids.filter((id) => !isSessionElement(id));
          if (guestIds.length) deleteGuestElements(guestIds);
          if (adminIds.length && isAdmin) deleteElementsStore(pageId, adminIds);
          clearSelection();
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
  }, [undo, redo, guestUndo, guestRedo, deleteElementsStore, isSessionElement, deleteGuestElements, clearSelection, pageId, activeTool, isAdmin, zoomStep, resetZoom]);

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

    // Marquee select — select tool, left-click-drag starting on empty
    // canvas (elements call stopPropagation on their own pointerdown, so
    // reaching here at all means this click started on the background, not
    // on a shape). Draws a selection rectangle and multi-selects whatever
    // it overlaps, like Figma's rubber-band select. A plain click with no
    // drag falls through untouched to the container's onClick deselect.
    if (activeTool === "select" && e.button === 0) {
      e.preventDefault();
      const { cx: sx, cy: sy } = screenToCanvas(e.clientX, e.clientY);
      let moved = false;
      const onMove = (ev) => {
        moved = true;
        const { cx, cy } = screenToCanvas(ev.clientX, ev.clientY);
        setMarquee({ x: Math.min(sx, cx), y: Math.min(sy, cy), w: Math.abs(cx - sx), h: Math.abs(cy - sy) });
      };
      const onUp = (ev) => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup",   onUp);
        if (moved) {
          // Same trailing-click race as text creation (see suppressClickRef
          // above) — a drag that ends on the container also fires a native
          // click right after, which would otherwise immediately wipe the
          // selection this drag just made.
          suppressClickRef.current = true;
          const { cx: ex, cy: ey } = screenToCanvas(ev.clientX, ev.clientY);
          const box = { x: Math.min(sx, ex), y: Math.min(sy, ey), w: Math.abs(ex - sx), h: Math.abs(ey - sy) };
          if (box.w > 2 || box.h > 2) {
            // Only elements this user could actually edit are selectable —
            // a guest marqueeing over published content shouldn't be able
            // to move or delete it.
            const hits = elements
              .filter((el) => isAdmin || isSessionElement(el.id))
              .filter((el) => el.x < box.x + box.w && el.x + el.w > box.x && el.y < box.y + box.h && el.y + el.h > box.y)
              .map((el) => el.id);
            setSelectedIds(new Set(hits));
            setSelectedId(hits.length === 1 ? hits[0] : null);
          } else {
            clearSelection();
          }
        }
        setMarquee(null);
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
    const commitText = (patch) => {
      const id = commit(patch);
      selectSingle(id);
      setAutoEditId(id);
      setActiveTool("select");
      suppressClickRef.current = true;
    };

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
          // Clicking with the text tool should go straight into typing, not
          // just spawn an unselected box that needs a separate click to
          // select and another to edit — commitText selects the new
          // element, switches back to the select tool (so the *next* click
          // doesn't spawn yet another text box), and flags it to mount
          // straight into edit mode. Starts with empty text (not a "Text"
          // placeholder to type over) — CanvasElement deletes it on blur if
          // still empty, matching Figma's "empty text layer vanishes" rule.
          commitText({ type: "text", text: "", x, y, w, h, fill: "transparent", color: fontColor, fontSize });
        } else if (activeTool === "frame") {
          commit({ type: "frame", label: "Frame", x, y, w, h, stroke: strokeColor, strokeWidth });
        } else {
          commit({ type: activeTool, x, y, w, h, fill: fillColor, stroke: strokeColor, strokeWidth });
        }
      } else if (activeTool === "text") {
        commitText({ type: "text", text: "", x: ox, y: oy, w: 160, h: 48, fill: "transparent", color: fontColor, fontSize });
      }
      setDrawPreview(null);
      drawStartRef.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup",   onUp);
  }, [isAdmin, activeTool, fillColor, strokeColor, strokeWidth, fontColor, fontSize, pageId, addElementStore, addGuestElement, scheduleApply, screenToCanvas, elements, isSessionElement, clearSelection, selectSingle]);

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

        {showGuestToast && (
          <div
            role="status"
            style={{
              position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)",
              zIndex: 60, display: "flex", alignItems: "center", gap: 10,
              background: "rgba(18,18,18,0.97)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 10, padding: "9px 10px 9px 14px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              fontFamily: "'Space Grotesk',sans-serif", fontSize: 12.5,
              color: "rgba(237,234,212,0.85)", maxWidth: "min(90vw, 480px)",
            }}
          >
            <span>
              You can draw and edit anything here — nothing is saved unless you&apos;re logged in as admin. Refreshing clears it.
            </span>
            <button
              onClick={() => setShowGuestToast(false)}
              aria-label="Dismiss"
              style={{
                flexShrink: 0, width: 20, height: 20, borderRadius: 5,
                background: "transparent", border: "none",
                color: "rgba(237,234,212,0.45)", cursor: "pointer",
                fontSize: 13, lineHeight: 1,
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#EDEAD4")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(237,234,212,0.45)")}
            >✕</button>
          </div>
        )}

        {/* Zoom/pan controls — mouse-wheel pinch and two-finger pan exclude
            anyone who can't do those precisely (motor impairments, some
            trackpads/mice, screen-magnifier users who want fixed discrete
            steps). Real, keyboard-operable <button>s give the same
            transform math an accessible alternative path. Independently
            positioned bottom-right so it never affects the toolbar's
            centering below. */}
        <div
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            position: "absolute", bottom: 16, right: 16, zIndex: 10,
            display: "flex", flexDirection: "column", alignItems: "stretch", gap: 6,
          }}
        >
          <div
            role="group"
            aria-label="Pan canvas"
            style={{
              display: "grid", gridTemplateColumns: "repeat(3, 26px)", gridTemplateRows: "repeat(3, 26px)",
              gap: 2, background: "rgba(18,18,18,0.9)", border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 8, padding: 4, alignSelf: "flex-end",
            }}
          >
            <span />
            <NavButton title="Pan up" onClick={() => panBy(0, PAN_STEP)}><ChevronUpIcon /></NavButton>
            <span />
            <NavButton title="Pan left" onClick={() => panBy(PAN_STEP, 0)}><ChevronLeftIcon /></NavButton>
            <NavButton title="Center view — reset pan" onClick={() => panBy(-transformRef.current.x, -transformRef.current.y)}><HomeIcon /></NavButton>
            <NavButton title="Pan right" onClick={() => panBy(-PAN_STEP, 0)}><ChevronRightIcon /></NavButton>
            <span />
            <NavButton title="Pan down" onClick={() => panBy(0, -PAN_STEP)}><ChevronDownIcon /></NavButton>
            <span />
          </div>

          <div
            role="group"
            aria-label="Zoom canvas"
            style={{
              display: "flex", alignItems: "center", gap: 2,
              background: "rgba(18,18,18,0.9)", border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 8, padding: 4,
            }}
          >
            <NavButton title="Zoom out" onClick={() => zoomStep(1 / 1.2)}><MinusIcon /></NavButton>
            <button
              title="Reset zoom to 100%"
              aria-label="Reset zoom to 100%"
              onClick={resetZoom}
              style={{
                ...zoomLabelStyle, background: "transparent", border: "none",
                cursor: "pointer", padding: "4px 8px", minWidth: 44,
              }}
            >
              <span ref={zoomLabelRef}>100%</span>
            </button>
            <NavButton title="Zoom in" onClick={() => zoomStep(1.2)}><PlusIcon /></NavButton>
          </div>
        </div>

        {/* Canvas viewport */}
        <div
          ref={containerRef}
          onPointerDown={onPointerDown}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => {
            if (suppressClickRef.current) { suppressClickRef.current = false; return; }
            if (activeTool === "select") clearSelection();
          }}
          style={{
            flex: 1, overflow: "hidden", position: "relative",
            background: "#0d0d0d",
            cursor: cursorStyle,
          }}
        >
          {/* Dot grid — its own oversized, statically-tiled layer that gets
              the same translate3d/scale transform as the content layer
              below, rather than having background-size/position rewritten
              (repainted) on every pan/zoom event. transformOrigin sits at
              this layer's own (GRID_HALF_SIZE, GRID_HALF_SIZE), which is
              exactly where canvas-space (0,0) falls given the -GRID_HALF_SIZE
              offset below — same pivot point innerRef uses at its own (0,0),
              so the two layers stay aligned under identical transforms. */}
          <div
            ref={gridRef}
            style={{
              position: "absolute",
              left: -GRID_HALF_SIZE, top: -GRID_HALF_SIZE,
              width: GRID_HALF_SIZE * 2, height: GRID_HALF_SIZE * 2,
              transformOrigin: `${GRID_HALF_SIZE}px ${GRID_HALF_SIZE}px`,
              transform: "translate3d(0,0,0) scale(1)",
              backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
              willChange: "transform",
              pointerEvents: "none",
            }}
          />

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
                const isMultiSelected = selectedIds.size > 1 && selectedIds.has(el.id);
                return (
                  <CanvasElement
                    key={el.id}
                    el={el}
                    editable={editable}
                    selected={selectedIds.has(el.id)}
                    // Resize/rotate handles and the floating layer toolbar
                    // only make sense for a single selected element — with
                    // several selected they'd render once per element,
                    // which is just noise, and there's no single element to
                    // resize/rotate as a group anyway.
                    showHandles={selectedIds.has(el.id) && selectedIds.size === 1}
                    isMultiSelected={isMultiSelected}
                    onSelect={selectSingle}
                    onEnlarge={setLightbox}
                    onUpdate={(patch) => (isSession ? updateGuestElement(el.id, patch) : updateElementStore(pageId, el.id, patch))}
                    onDelete={() => (isSession ? deleteGuestElement(el.id) : deleteElementStore(pageId, el.id))}
                    onBringForward={() => (isSession ? bringForwardGuest(el.id) : bringForwardStore(pageId, el.id))}
                    onSendBackward={() => (isSession ? sendBackwardGuest(el.id) : sendBackwardStore(pageId, el.id))}
                    // One snapshot per drag/resize/rotate/text-edit *gesture*
                    // (fired once at pointerdown/focus), not per pointermove
                    // or keystroke — updateElement itself never snapshots
                    // (it's called continuously mid-drag), so without this,
                    // there'd be nothing to revert to for moves/resizes/
                    // rotates/text edits, only for style changes and
                    // create/delete/reorder. Guests get their own
                    // session-only history now too, not just admin.
                    onInteractionStart={isSession ? snapshotGuest : snapshotStore}
                    onGroupMoveStart={beginGroupMove}
                    onGroupMove={applyGroupMove}
                    autoEdit={el.id === autoEditId}
                  />
                );
              })}

            {/* Draw preview ghost */}
            {drawPreview && <DrawPreview p={drawPreview} />}

            {/* Marquee selection rectangle */}
            {marquee && (
              <div style={{
                position: "absolute", left: marquee.x, top: marquee.y,
                width: marquee.w, height: marquee.h,
                background: "rgba(124,106,247,0.12)",
                border: "1px solid rgba(124,106,247,0.65)",
                pointerEvents: "none", zIndex: 999,
              }} />
            )}
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
            onToolChange={(t) => { setActiveTool(t); clearSelection(); }}
            fillColor={fillColor}     onFillChange={handleFillChange}
            strokeColor={strokeColor} onStrokeChange={handleStrokeChange}
            strokeWidth={strokeWidth} onStrokeWidthChange={handleStrokeWidthChange}
            fontSize={fontSize}   onFontSizeChange={handleFontSizeChange}
            fontColor={fontColor} onFontColorChange={handleFontColorChange}
            onStyleEditStart={beginStyleEdit}
            showTextControls={showTextControls}
            hasSelection={selectedIds.size > 0}
            isAdmin={isAdmin}
            // Undo/redo is available to everyone now — admin edits undo
            // through the persisted store, guest scribbles undo through
            // their own session-only history (still gone on refresh).
            onUndo={isAdmin ? undo : guestUndo}
            onRedo={isAdmin ? redo : guestRedo}
            canUndo={isAdmin ? canUndo : guestHistory.length > 0}
            canRedo={isAdmin ? canRedo : guestFuture.length > 0}
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

// ── Zoom/pan control button — a plain <button> (not a div with an onClick)
// so it's tab-focusable and Enter/Space-activatable for free; `title` also
// backs the aria-label so screen readers get a real name, not just "button".
function NavButton({ title, onClick, children }) {
  return (
    <button
      title={title}
      aria-label={title}
      onClick={onClick}
      style={{
        width: 26, height: 26, boxSizing: "border-box",
        background: "transparent", border: "none", borderRadius: 5,
        color: "rgba(237,234,212,0.6)", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.12s, color 0.12s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#EDEAD4"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(237,234,212,0.6)"; }}
    >
      {children}
    </button>
  );
}
function ChevronUpIcon() {
  return <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2.5 9l4.5-4.5L11.5 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function ChevronDownIcon() {
  return <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2.5 5l4.5 4.5L11.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function ChevronLeftIcon() {
  return <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M9 2.5L4.5 7 9 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function ChevronRightIcon() {
  return <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M5 2.5L9.5 7 5 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function HomeIcon() {
  return <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 6.5L7 2l5 4.5M3.5 5.5V12h7V5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function PlusIcon() {
  return <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 2.5v9M2.5 7h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>;
}
function MinusIcon() {
  return <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2.5 7h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>;
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
