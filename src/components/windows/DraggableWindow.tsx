"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useDragControls, useMotionValue } from "framer-motion";
import { useIsLowEndDevice } from "@/lib/useIsLowEndDevice";

const NORMAL_WIDTH = 560;
const NORMAL_HEIGHT = 660;

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

  const width = maximized ? "calc(100vw - 40px)" : NORMAL_WIDTH;
  const height = maximized ? "calc(100vh - 40px)" : NORMAL_HEIGHT;

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
