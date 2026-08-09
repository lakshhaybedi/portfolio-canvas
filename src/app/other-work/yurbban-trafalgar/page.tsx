"use client";

import { useCallback, useEffect, useMemo, useRef, useState, forwardRef } from "react";
import Link from "next/link";
import HTMLFlipBook from "react-pageflip";
// react-pageflip re-exports the StPageFlip engine but not its stylesheet —
// without it, `.stf__block` has no `perspective` and `.stf__item` has no
// `transform-style: preserve-3d`, so the page's rotateY has nothing to
// render depth against and looks like a flat slide instead of a 3D curl.
import "page-flip/src/Style/stPageFlip.css";
import { OTHER_PROJECTS } from "@/lib/otherProjects";

const PROJECT = OTHER_PROJECTS.find((p) => p.slug === "yurbban-trafalgar")!;
// The physical cover goes first so the book opens from its actual closed
// cover into the spreads, rather than starting on the first interior page.
const PAGES = PROJECT.coverImage ? [PROJECT.coverImage, ...PROJECT.images] : PROJECT.images;
const COVER_COUNT = PROJECT.coverImage ? 1 : 0;

// Pages are rendered directly from the source PDF at 1600x1131 (a two-page
// A4 spread — width:height is ~1.414, i.e. sqrt(2), the ISO paper ratio
// doubled), so every spread shares this exact ratio.
const PAGE_RATIO = 1600 / 1131;
const BOOK_WIDTH = 860;
const BOOK_HEIGHT = Math.round(BOOK_WIDTH / PAGE_RATIO);

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.5;

type PageProps = { src: string; index: number; isCover?: boolean };

const MagazinePage = forwardRef<HTMLDivElement, PageProps>(({ src, index, isCover }, ref) => (
  <div
    ref={ref}
    style={{
      width: "100%", height: "100%",
      background: "#fff", position: "relative",
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden",
    }}
  >
    <img
      src={src}
      alt={isCover ? `${PROJECT.title}, cover` : `Page ${index + 1} of ${PAGES.length}`}
      draggable={false}
      style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
    />
    {/* Every interior page is a flattened two-page spread — this soft shadow
        band stands in for the spine/gutter of a real open book. The cover
        is a single page, not a spread, so it's skipped there. */}
    {!isCover && (
      <div aria-hidden="true" style={{
        position: "absolute", left: "50%", top: 0, bottom: 0, width: 28,
        transform: "translateX(-50%)", pointerEvents: "none",
        background: "linear-gradient(to right, rgba(0,0,0,0.16), rgba(0,0,0,0.03) 35%, rgba(0,0,0,0.03) 65%, rgba(0,0,0,0.16))",
      }} />
    )}
  </div>
));
MagazinePage.displayName = "MagazinePage";

export default function YurbbanTrafalgarMagazinePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = useRef<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const activeThumbRef = useRef<HTMLButtonElement>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragState = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  // react-pageflip watches `children` by reference: a new array on every
  // render (from re-mapping PAGES inline in JSX) makes it tear down and
  // rebuild the whole page collection via the underlying engine's
  // updateFromHtml — which corrupts any flip animation in progress and, on
  // frequent re-renders (zoom, pan, thumbnail jumps), visibly snaps the book
  // back to the current page. PAGES never changes, so memoizing once keeps
  // the array reference stable and the engine untouched across renders.
  const pageChildren = useMemo(
    () => PAGES.map((src, i) => (
      <MagazinePage key={src} src={src} index={i} isCover={i === 0 && COVER_COUNT > 0} />
    )),
    []
  );

  // StPageFlip reaches into `window`/layout during setup, so the book only
  // mounts client-side, after hydration — this also sidesteps a ref-
  // forwarding bug in next/dynamic's loading wrapper that broke the
  // imperative flip API when the library was loaded that way instead.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    activeThumbRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [currentPage]);

  // StPageFlip's `flip(index)` jump doesn't fire the `onFlip` event the way
  // flipNext/flipPrev do, so the counter and active thumbnail would silently
  // go stale after a thumbnail click or slider drag. Setting the state
  // directly here keeps the UI in sync regardless of what the library does.
  //
  // Guarded against overlapping calls: firing `.flip()` again while one is
  // still animating (e.g. clicking several thumbnails in quick succession)
  // leaves StPageFlip's temporary flipping-page copies stuck in the DOM
  // instead of cleaned up. Skipping the jump while mid-flip avoids that.
  const jumpToPage = useCallback((index: number) => {
    if (bookRef.current?.pageFlip()?.getState() === "flipping") return;
    bookRef.current?.pageFlip()?.flip(index);
    setCurrentPage(index);
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const zoomBy = useCallback((delta: number) => {
    setZoom((z) => {
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +(z + delta).toFixed(2)));
      if (next === MIN_ZOOM) setPan({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const flipNext = useCallback(() => bookRef.current?.pageFlip()?.flipNext(), []);
  const flipPrev = useCallback(() => bookRef.current?.pageFlip()?.flipPrev(), []);

  // Keyboard: arrows flip pages, +/- zoom, 0 resets, Escape leaves the book.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") flipNext();
      else if (e.key === "ArrowLeft") flipPrev();
      else if (e.key === "+" || e.key === "=") zoomBy(ZOOM_STEP);
      else if (e.key === "-" || e.key === "_") zoomBy(-ZOOM_STEP);
      else if (e.key === "0") resetZoom();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [flipNext, flipPrev, zoomBy, resetZoom]);

  // Wheel: plain scroll zooms in/out around the current view. React attaches
  // onWheel as a passive listener, so e.preventDefault() inside a JSX handler
  // silently no-ops (logs a console warning too) — the page would scroll
  // behind the book while the user tries to zoom. A native, explicitly
  // non-passive listener on the wrapper is the actual fix.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      zoomBy(e.deltaY < 0 ? ZOOM_STEP / 2 : -ZOOM_STEP / 2);
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [zoomBy]);

  // Pan drag — only engages once zoomed in, so it never fights the book's
  // own drag-to-turn-page gesture (that gesture is also disabled below via
  // `useMouseEvents` while zoomed, belt and suspenders).
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (zoom <= 1) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
    setDragging(true);
  }, [zoom, pan]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setPan({ x: dragState.current.panX + dx, y: dragState.current.panY + dy });
  }, []);

  const handlePointerUp = useCallback(() => {
    dragState.current = null;
    setDragging(false);
  }, []);

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 64, padding: "0 48px",
        background: "rgba(10,10,10,0.85)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
      }}>
        <Link href="/other-work" style={{
          display: "flex", alignItems: "center", gap: 8,
          fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase", textDecoration: "none", color: "var(--fg)",
        }}>
          ← Other Work
        </Link>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase", color: "var(--muted)",
          maxWidth: "50vw", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {PROJECT.title}
        </span>
        <a
          href={PROJECT.behanceUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", textDecoration: "none" }}
        >
          Behance ↗
        </a>
      </nav>

      <main id="main-content" style={{
        paddingTop: 64, minHeight: "100vh",
        display: "flex", alignItems: "stretch",
        background: "radial-gradient(ellipse at center, var(--bg-elevated) 0%, var(--bg) 70%)",
      }}>
        <div
          aria-label="Page thumbnails"
          style={{
            width: 96, flexShrink: 0,
            height: "calc(100vh - 64px)", overflowY: "auto",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
            padding: "20px 12px", borderRight: "1px solid var(--border)",
          }}
        >
          {PAGES.map((src, i) => (
            <button
              key={src}
              ref={i === currentPage ? activeThumbRef : undefined}
              aria-label={`Go to page ${i + 1} of ${PAGES.length}`}
              aria-current={i === currentPage}
              onClick={() => jumpToPage(i)}
              style={{
                width: 64, padding: 0, flexShrink: 0,
                borderRadius: 4, overflow: "hidden", cursor: "pointer",
                border: i === currentPage ? "2px solid #E20074" : "2px solid transparent",
                opacity: i === currentPage ? 1 : 0.55,
                transition: "opacity 0.15s ease, border-color 0.15s ease",
                background: "#fff",
              }}
            >
              <img
                src={src}
                alt=""
                aria-hidden="true"
                style={{ width: "100%", aspectRatio: PAGE_RATIO, objectFit: "cover", display: "block" }}
                loading="lazy"
              />
            </button>
          ))}
        </div>

        <div style={{
          flex: 1, minWidth: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 24, padding: "40px 24px 32px",
        }}>
          <div
            ref={wrapperRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            style={{
              width: BOOK_WIDTH, maxWidth: "100%",
              overflow: "hidden",
              cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "default",
              touchAction: "none",
            }}
          >
            <div
              style={{
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                transformOrigin: "center center",
                transition: dragging ? "none" : "transform 0.25s ease",
              }}
            >
              {mounted ? (
                <HTMLFlipBook
                  ref={bookRef}
                  width={BOOK_WIDTH}
                  height={BOOK_HEIGHT}
                  size="fixed"
                  minWidth={315}
                  maxWidth={BOOK_WIDTH}
                  minHeight={220}
                  maxHeight={BOOK_HEIGHT}
                  // `showCover` gives the first/last page StPageFlip's "hard
                  // page" treatment: a single rigid page that hinges open
                  // around the spine, instead of pairing with the next page
                  // as a soft interior spread. It desyncs the engine's
                  // internal page pointer from ours in this forced-single-
                  // page setup (a jump-then-flip sequence near the cover
                  // lands on the wrong page), so it's left off — every page,
                  // including the cover, shares the same soft flip.
                  showCover={false}
                  usePortrait={true}
                  mobileScrollSupport={true}
                  useMouseEvents={zoom <= 1}
                  drawShadow={true}
                  flippingTime={700}
                  maxShadowOpacity={0.4}
                  startPage={0}
                  startZIndex={0}
                  autoSize={true}
                  clickEventForward={true}
                  swipeDistance={30}
                  showPageCorners={true}
                  disableFlipByClick={false}
                  className="yurbban-magazine"
                  style={{ margin: "0 auto" }}
                  onFlip={(e: { data: number }) => setCurrentPage(e.data)}
                >
                  {pageChildren}
                </HTMLFlipBook>
              ) : (
                <div
                  aria-hidden="true"
                  style={{
                    width: BOOK_WIDTH, height: BOOK_HEIGHT, maxWidth: "100%",
                    margin: "0 auto", borderRadius: 4,
                    background: "var(--bg-elevated)", border: "1px solid var(--border)",
                  }}
                />
              )}
            </div>
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: 16,
            padding: "10px 18px", borderRadius: 999,
            background: "var(--bg-elevated)", border: "1px solid var(--border)",
          }}>
            <button
              aria-label="Previous page"
              onClick={flipPrev}
              disabled={currentPage === 0}
              style={navBtnStyle(currentPage === 0)}
            >←</button>

            <input
              type="range"
              min={0}
              max={PAGES.length - 1}
              value={currentPage}
              onChange={(e) => jumpToPage(Number(e.target.value))}
              aria-label="Jump to page"
              style={{ width: 160 }}
            />

            <span style={{ fontSize: 12, color: "var(--muted-strong)", minWidth: 64, textAlign: "center" }}>
              {currentPage + 1} / {PAGES.length}
            </span>

            <button
              aria-label="Next page"
              onClick={flipNext}
              disabled={currentPage === PAGES.length - 1}
              style={navBtnStyle(currentPage === PAGES.length - 1)}
            >→</button>

            <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />

            <button aria-label="Zoom out" onClick={() => zoomBy(-ZOOM_STEP)} disabled={zoom <= MIN_ZOOM} style={navBtnStyle(zoom <= MIN_ZOOM)}>−</button>
            <span style={{ fontSize: 12, color: "var(--muted-strong)", minWidth: 40, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
            <button aria-label="Zoom in" onClick={() => zoomBy(ZOOM_STEP)} disabled={zoom >= MAX_ZOOM} style={navBtnStyle(zoom >= MAX_ZOOM)}>+</button>
            <button aria-label="Reset zoom" onClick={resetZoom} disabled={zoom === 1 && pan.x === 0 && pan.y === 0} style={navBtnStyle(zoom === 1 && pan.x === 0 && pan.y === 0)}>Reset</button>
          </div>

          <p style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", maxWidth: 480 }}>
            Drag a corner to flip, or use the arrows. Scroll or use +/− to zoom, then drag to pan.
          </p>
        </div>
      </main>
    </>
  );
}

function navBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    width: 32, height: 32, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "transparent", border: "1px solid var(--border-strong)",
    color: disabled ? "var(--muted)" : "var(--fg)",
    opacity: disabled ? 0.4 : 1,
    cursor: disabled ? "default" : "pointer",
    fontSize: 14, fontFamily: "inherit",
  };
}
