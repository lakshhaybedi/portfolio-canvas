"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useDragControls, useMotionValue } from "framer-motion";
import { useIsLowEndDevice } from "@/lib/useIsLowEndDevice";

const NORMAL_WIDTH = 560;
const NORMAL_HEIGHT = 660;

// Resize bounds. Min is roughly "a PDF page is still legible"; max is capped
// to the viewport so a window can't be dragged bigger than the screen.
const MIN_W = 380;
const MIN_H = 320;

/**
 * Generic draggable/closable/focusable floating window shell — the drag,
 * z-index-focus, maximize, and close-toward-anchor mechanics live here so
 * any content (currently just PDFWindow) can be dropped in as `children`.
 *
 * Drag is header-only: `dragListener={false}` on the window itself plus
 * `dragControls` passed to the header, which starts the drag from its own
 * `onPointerDown` — the body stays scrollable/interactive rather than
 * accidentally dragging the window on every click inside it.
 */
export default function DraggableWindow({
  x,
  y,
  z,
  maximized,
  minimized,
  exitAnchor,
  title,
  icon,
  headerActions,
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  onDragEnd,
  children,
}: {
  x: number;
  y: number;
  z: number;
  maximized: boolean;
  minimized: boolean;
  exitAnchor: { x: number; y: number } | null;
  title: string;
  icon: ReactNode;
  headerActions?: ReactNode;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onDragEnd: (x: number, y: number) => void;
  children: ReactNode;
}) {
  const dragControls = useDragControls();
  const lowEndDevice = useIsLowEndDevice();
  const mx = useMotionValue(x);
  const my = useMotionValue(y);
  const prevPos = useRef<{ x: number; y: number } | null>(null);

  // User-set size, persisted for the lifetime of the window. Null until the
  // corner is actually dragged, so an untouched window keeps its default.
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [resizing, setResizing] = useState(false);
  // The gesture's anchor: pointer position and window size at mousedown.
  // A ref, not state, on purpose — see the dependency note on the effect.
  const resizeStart = useRef<{ px: number; py: number; w: number; h: number; x: number; y: number } | null>(null);

  const beginResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resizeStart.current = {
      px: e.clientX,
      py: e.clientY,
      w: size?.w ?? NORMAL_WIDTH,
      h: size?.h ?? NORMAL_HEIGHT,
      x: mx.get(),
      y: my.get(),
    };
    setResizing(true);
  }, [size, mx, my]);

  // Tracked on `window` rather than the 18px handle: during a fast drag the
  // cursor easily outruns a target that small, and a listener bound to the
  // handle would drop the gesture the moment it did.
  //
  // Deps are deliberately only [resizing]. Including `size` here re-ran this
  // effect on every mousemove, which tore the listeners down and re-anchored
  // the gesture mid-drag — the window then resized by the delta between
  // consecutive events instead of from the grab point, so it crawled and
  // stuttered. The anchor lives in a ref so updating size can't invalidate it.
  useEffect(() => {
    if (!resizing) return;

    const move = (e: MouseEvent) => {
      const s = resizeStart.current;
      if (!s) return;
      // Clamped to the viewport so a window can't be dragged off-screen,
      // and to MIN_* so it can't be collapsed into an unusable sliver.
      setSize({
        w: Math.max(MIN_W, Math.min(s.w + (e.clientX - s.px), window.innerWidth - s.x - 20)),
        h: Math.max(MIN_H, Math.min(s.h + (e.clientY - s.py), window.innerHeight - s.y - 20)),
      });
    };
    const up = () => setResizing(false);

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    const prevCursor = document.body.style.cursor;
    const prevSelect = document.body.style.userSelect;
    document.body.style.cursor = "nwse-resize";
    document.body.style.userSelect = "none";
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevSelect;
    };
  }, [resizing]);

  useEffect(() => {
    if (maximized) {
      prevPos.current = { x: mx.get(), y: my.get() };
      mx.set(20);
      my.set(20);
    } else if (prevPos.current) {
      mx.set(prevPos.current.x);
      my.set(prevPos.current.y);
      prevPos.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maximized]);

  const width = maximized ? "calc(100vw - 40px)" : (size?.w ?? NORMAL_WIDTH);
  const height = maximized ? "calc(100vh - 40px)" : (size?.h ?? NORMAL_HEIGHT);

  const exitTarget = exitAnchor
    ? { x: exitAnchor.x - NORMAL_WIDTH / 2, y: exitAnchor.y - NORMAL_HEIGHT / 2 }
    : { x: x, y: y };

  return (
    <motion.div
      drag
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      onPointerDown={onFocus}
      onDragEnd={() => onDragEnd(mx.get(), my.get())}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.08, x: exitTarget.x, y: exitTarget.y }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        x: mx,
        y: my,
        zIndex: 500 + z,
        width,
        height,
        // Minimized windows stay mounted (not unmounted/removed from the
        // AnimatePresence tree) so react-pdf's page/zoom state survives a
        // minimize/restore cycle — only visibility toggles.
        visibility: minimized ? "hidden" : "visible",
        pointerEvents: minimized ? "none" : "auto",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 18,
          overflow: "hidden",
          // This window is draggable — blurring its own backdrop means
          // recomputing that blur region on every drag frame, on top of
          // the position update itself. Skipped on weak hardware.
          background: lowEndDevice ? "rgba(21,21,23,0.97)" : "rgba(21,21,23,0.82)",
          backdropFilter: lowEndDevice ? undefined : "blur(16px)",
          border: "1px solid var(--border)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header — drag handle */}
        <div
          onPointerDown={(e) => dragControls.start(e)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            borderBottom: "1px solid var(--border)",
            cursor: maximized ? "default" : "grab",
            flexShrink: 0,
            userSelect: "none",
          }}
        >
          {/* Traffic lights */}
          <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={onClose}
              aria-label="Close"
              title="Close"
              style={{ ...dotStyle, background: "#FF5F57" }}
            />
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={onMinimize}
              aria-label="Minimize"
              title="Minimize"
              style={{ ...dotStyle, background: "#FEBC2E" }}
            />
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={onToggleMaximize}
              aria-label="Maximize"
              title="Maximize"
              style={{ ...dotStyle, background: "#28C840" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0, flex: 1 }}>
            {icon}
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--fg)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {title}
            </span>
          </div>

          {headerActions && (
            <div
              onPointerDown={(e) => e.stopPropagation()}
              style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}
            >
              {headerActions}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ flex: 1, minHeight: 0 }}>{children}</div>

        {/* Resize grip — bottom-right corner, hidden while maximized (there's
            nothing to resize to). Two short diagonal strokes, the same
            affordance macOS itself uses, rather than an invisible hit area
            nobody would find. */}
        {!maximized && (
          <div
            onMouseDown={beginResize}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize window"
            style={{
              position: "absolute", right: 0, bottom: 0,
              width: 18, height: 18,
              cursor: "nwse-resize",
              display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
              padding: 3,
              zIndex: 2,
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <path d="M9 1 1 9M9 5.5 5.5 9" stroke="var(--muted)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        )}
      </div>
    </motion.div>
  );
}

const dotStyle: React.CSSProperties = {
  width: 12,
  height: 12,
  borderRadius: "50%",
  border: "none",
  cursor: "pointer",
  padding: 0,
};
