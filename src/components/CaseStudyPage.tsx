"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { CASE_STUDIES, CaseStudy } from "@/lib/caseStudies";
import { revealVariant, viewportOnce, easeOutExpo } from "@/lib/motion";
import { useHasFinePointer } from "@/lib/useHasFinePointer";
import { useIsLowEndDevice } from "@/lib/useIsLowEndDevice";

export default function CaseStudyPage({ slug }: { slug: string }) {
  const idx   = CASE_STUDIES.findIndex((c) => c.slug === slug);
  const study = CASE_STUDIES[idx];
  const prev  = idx > 0                       ? CASE_STUDIES[idx - 1] : null;
  const next  = idx < CASE_STUDIES.length - 1 ? CASE_STUDIES[idx + 1] : null;

  const [cursor, setCursor]       = useState({ x: 0, y: 0 });
  const [cursorLarge, setLarge]   = useState(false);
  const [lightbox, setLightbox]   = useState<number | null>(null);
  const [activeScreen, setActive] = useState(0);
  const [hoveredScreen, setHoveredScreen] = useState<number | null>(null);
  const [navHovered, setNavHov]   = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [resizing, setResizing]   = useState(false);

  const isFinePointer = useHasFinePointer();
  const lowEndDevice = useIsLowEndDevice();
  const reduceMotion = useReducedMotion();
  const reveal = revealVariant(!!reduceMotion);
  const { scrollYProgress } = useScroll();
  const scrollProgressX = useTransform(scrollYProgress, [0, 1], reduceMotion ? [1, 1] : [0, 1]);
  const screens = study?.screens ?? [];

  // Restore a previously-dragged sidebar width so it doesn't reset to
  // default every time the reader moves between case studies.
  useEffect(() => {
    const saved = sessionStorage.getItem("case-sidebar-width");
    if (saved) setSidebarWidth(Number(saved));
  }, []);

  // Panel resize — drag the divider between the narrative column and the
  // screens sidebar. Width is clamped so neither side collapses to
  // something unusable, and tracked on `window` (not the handle) since the
  // cursor easily outruns a 6px-wide target during a fast drag.
  useEffect(() => {
    if (!resizing) return;
    const MIN_SIDEBAR = 220;
    const MAX_SIDEBAR = 560;
    const MIN_LEFT = 420;
    const move = (e: MouseEvent) => {
      const fromRight = window.innerWidth - e.clientX;
      const maxAllowed = Math.min(MAX_SIDEBAR, window.innerWidth - MIN_LEFT);
      const next = Math.max(MIN_SIDEBAR, Math.min(fromRight, maxAllowed));
      setSidebarWidth(next);
    };
    const up = () => {
      setResizing(false);
      setSidebarWidth((w) => { sessionStorage.setItem("case-sidebar-width", String(w)); return w; });
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    const prevCursor = document.body.style.cursor;
    const prevSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevSelect;
    };
  }, [resizing]);

  useEffect(() => {
    document.body.classList.toggle("has-fine-pointer", isFinePointer);
  }, [isFinePointer]);

  useEffect(() => {
    if (!study || !isFinePointer) return;
    let frame: number;
    const move = (e: MouseEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setCursor({ x: e.clientX, y: e.clientY }));
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [study, isFinePointer]);

  const closeLightbox = useCallback(() => setLightbox(null), []);
  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setLightbox((i) => i !== null ? Math.min(i + 1, screens.length - 1) : null);
      if (e.key === "ArrowLeft")  setLightbox((i) => i !== null ? Math.max(i - 1, 0) : null);
      if (e.key === "Escape")     closeLightbox();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, screens.length, closeLightbox]);

  if (!study) {
    return (
      <div style={{ padding: "100px 48px", fontFamily: "'Space Grotesk', sans-serif" }}>
        <a href="/" style={{ color: "var(--muted)", textDecoration: "none", fontSize: 13 }}>← Back</a>
        <p style={{ marginTop: 40, fontSize: 18 }}>Project not found.</p>
      </div>
    );
  }

  const { accent, accentText, badgeOnAccent } = study;

  return (
    <>
      {/* Custom cursor — fine-pointer devices only */}
      {isFinePointer && (
        <div
          className={`cursor-dot${cursorLarge ? " cursor-large" : ""}`}
          style={{ left: cursor.x, top: cursor.y }}
        />
      )}

      {/* ── Scroll progress ── */}
      <motion.div
        aria-hidden="true"
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 300,
          height: 2, transformOrigin: "0% 50%",
          scaleX: scrollProgressX,
          background: accent,
        }}
      />

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${screens[lightbox].label} — expanded screen`}
            onClick={closeLightbox}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed", inset: 0, zIndex: 1000,
              background: "rgba(0,0,0,0.92)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {lightbox > 0 && (
              <button
                aria-label="Previous screen"
                onClick={(e) => { e.stopPropagation(); const n = lightbox - 1; setLightbox(n); setActive(n); }}
                style={{
                  position: "absolute", left: 32,
                  background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff", width: 48, height: 48, borderRadius: "50%", fontSize: 20,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: isFinePointer ? "none" : "pointer",
                }}
              >←</button>
            )}

            <motion.div
              key={lightbox}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, ease: easeOutExpo }}
              style={{ maxWidth: "80vw", maxHeight: "85vh", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}
            >
              <img
                src={screens[lightbox].src}
                alt={screens[lightbox].label}
                style={{ maxWidth: "100%", maxHeight: "72vh", objectFit: "contain", borderRadius: 8, boxShadow: "0 40px 120px rgba(0,0,0,0.6)" }}
              />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: accentText, marginBottom: 6 }}>
                  {screens[lightbox].label}
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 560 }}>
                  {screens[lightbox].caption}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {screens.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`View screen ${i + 1}: ${screens[i].label}`}
                    aria-current={i === lightbox}
                    onClick={(e) => { e.stopPropagation(); setLightbox(i); setActive(i); }}
                    style={{
                      width: i === lightbox ? 20 : 6, height: 6, borderRadius: 3,
                      background: i === lightbox ? accent : "rgba(255,255,255,0.25)",
                      border: "none", cursor: isFinePointer ? "none" : "pointer",
                      transition: "width 0.25s ease, background 0.2s",
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {lightbox < screens.length - 1 && (
              <button
                aria-label="Next screen"
                onClick={(e) => { e.stopPropagation(); const n = lightbox + 1; setLightbox(n); setActive(n); }}
                style={{
                  position: "absolute", right: 32,
                  background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff", width: 48, height: 48, borderRadius: "50%", fontSize: 20,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: isFinePointer ? "none" : "pointer",
                }}
              >→</button>
            )}

            {/* A text-only "ESC to close" was the sole close affordance —
                fine as a hint for keyboard/mouse users, meaningless on a
                touchscreen with no Escape key and no visible button
                styling to signal it's tappable. The icon button is the
                real close control on every device; the text becomes a
                secondary hint, shown only where Escape is actually a key
                that exists. */}
            <button
              aria-label="Close expanded view"
              onClick={closeLightbox}
              style={{
                position: "absolute", top: 24, right: 32,
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff", width: 40, height: 40, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: isFinePointer ? "none" : "pointer",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
            {isFinePointer && (
              <div
                aria-hidden="true"
                style={{
                  position: "absolute", top: 32, right: 84,
                  fontSize: 11, fontWeight: 600, letterSpacing: "0.12em",
                  textTransform: "uppercase", color: "rgba(255,255,255,0.6)",
                }}
              >
                Esc to close
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sticky nav ── */}
      {/* Tabs column is `minmax(0, 1fr)`, not `auto` — with only 3 case
          studies the tab strip's natural width always fit, but a 4th (and
          any future) project can make it wider than the viewport has room
          for. An `auto` middle column has no ceiling and pushed Back/Year
          off two-thirds of viewports once four tabs' worth of text and
          padding exceeded the space actually available. `minmax(0, 1fr)`
          caps it to whatever's left after Back/Year, and .case-nav-tabs
          (globals.css) scrolls horizontally instead of clipping. */}
      <nav className="case-nav" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        display: "grid", gridTemplateColumns: "auto minmax(0, 1fr) auto",
        alignItems: "center",
        padding: "0 48px", height: 64,
        background: lowEndDevice ? "rgba(10,10,10,0.94)" : "rgba(10,10,10,0.75)",
        backdropFilter: lowEndDevice ? undefined : "blur(12px)",
        borderBottom: "1px solid var(--border)",
      }}>
        {/* Back */}
        <Link
          href="/"
          onMouseEnter={() => setLarge(true)}
          onMouseLeave={() => setLarge(false)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", textDecoration: "none", color: "var(--fg)",
            transition: "opacity 0.2s", width: "fit-content",
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = "0.5")}
          onMouseOut={(e)  => (e.currentTarget.style.opacity = "1")}
        >
          ← Back
        </Link>

        {/* Project tabs — centred; scrolls horizontally on narrow screens
            instead of clipping (see .case-nav-tabs in globals.css) */}
        <div className="case-nav-tabs" style={{ display: "flex", alignItems: "stretch", height: 64 }}>
          {CASE_STUDIES.map((c) => {
            const isCurrent = c.slug === slug;
            const isHov     = navHovered === c.slug;
            return (
              <Link
                key={c.slug}
                href={`/work/${c.slug}`}
                onMouseEnter={() => { setNavHov(c.slug); setLarge(false); }}
                onMouseLeave={() => setNavHov(null)}
                style={{
                  // `center` aligns the two spans' box midpoints, not their
                  // text — with a 10px number next to an 11px label, equal
                  // line-heights still left a visible vertical offset since
                  // centered boxes of different heights don't share a
                  // baseline. `baseline` aligns the actual glyphs.
                  display: "flex", alignItems: "baseline", gap: 8,
                  padding: "0 20px",
                  textDecoration: "none",
                  borderBottom: isCurrent ? `3px solid ${c.accent}` : "3px solid transparent",
                  transition: "border-color 0.25s, background 0.2s",
                  background: isHov && !isCurrent ? "rgba(237,234,212,0.05)" : "transparent",
                  position: "relative",
                }}
              >
                <span style={{
                  fontSize: 10, fontWeight: 700, lineHeight: 1,
                  color: isCurrent ? c.accentText : "var(--muted)",
                  transition: "color 0.2s",
                  letterSpacing: "0.06em",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {c.index}
                </span>
                <span style={{
                  fontSize: 11, fontWeight: isCurrent ? 700 : 500, lineHeight: 1,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  color: isCurrent ? "var(--fg)" : isHov ? "rgba(237,234,212,0.8)" : "var(--muted)",
                  transition: "color 0.2s",
                  whiteSpace: "nowrap",
                }}>
                  {c.title}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Year — right aligned */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", color: "var(--muted)" }}>
            {study.year}
          </span>
        </div>
      </nav>

      <main className="case-main" style={{ paddingTop: 64, fontFamily: "'Space Grotesk', sans-serif" }}>

        {/* ── Hero ── */}
        <section style={{
          padding: "72px 48px 0",
          borderBottom: "1px solid var(--border)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: accent }} />

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 64, alignItems: "flex-end",
          }}>
            {/* Text */}
            <div style={{ paddingBottom: 64 }}>
              <motion.div
                initial="hidden" animate="visible" variants={reveal}
                style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.2em",
                  textTransform: "uppercase", color: "var(--muted)", marginBottom: 24,
                }}
              >
                Case Study · {study.company} · {study.year}
              </motion.div>
              <motion.h1
                initial="hidden" animate="visible" variants={reveal} transition={{ delay: 0.1 }}
                style={{
                  fontSize: "clamp(40px, 6vw, 96px)",
                  fontWeight: 700, lineHeight: 0.95,
                  letterSpacing: "-0.03em", textTransform: "uppercase",
                  marginBottom: 32,
                }}
              >
                {study.title}
              </motion.h1>
              <motion.p
                initial="hidden" animate="visible" variants={reveal} transition={{ delay: 0.2 }}
                style={{
                  fontSize: "clamp(14px, 1.2vw, 18px)",
                  fontWeight: 300, lineHeight: 1.8, color: "var(--muted-strong)",
                }}
              >
                {study.overview}
              </motion.p>
            </div>

            {/* Hero image or placeholder */}
            <motion.div
              initial="hidden" animate="visible" variants={reveal} transition={{ delay: 0.2 }}
              style={{ alignSelf: "flex-end" }}
            >
              {/* Browser chrome */}
              <div style={{
                background: "#1a1a1a",
                borderRadius: "10px 10px 0 0",
                padding: "10px 14px",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
                <div style={{
                  flex: 1, marginLeft: 8, background: "#2a2a2a",
                  borderRadius: 4, padding: "3px 10px",
                  fontSize: 10, color: "rgba(255,255,255,0.55)", fontFamily: "monospace",
                }}>
                  {study.heroUrl ?? `${study.slug}.internal`}
                </div>
              </div>
              {/* Screen or placeholder */}
              <div style={{
                overflow: "hidden",
                boxShadow: "0 32px 80px rgba(0,0,0,0.22), 0 8px 24px var(--border)",
                maxHeight: "60vh",
                background: study.heroImage ? "transparent" : "#1c1c1e",
                minHeight: study.heroImage ? "auto" : 320,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {study.heroImage ? (
                  <img src={study.heroImage} alt="Hero screen" style={{ width: "100%", display: "block" }} />
                ) : (
                  <div style={{ textAlign: "center", padding: 40 }}>
                    <div style={{
                      fontSize: 64, fontWeight: 800, lineHeight: 1,
                      color: `${accent}30`, letterSpacing: "-0.04em",
                    }}>
                      {study.index}
                    </div>
                    <div style={{
                      marginTop: 12, fontSize: 10, fontWeight: 700,
                      letterSpacing: "0.2em", textTransform: "uppercase",
                      color: "rgba(255,255,255,0.5)",
                    }}>
                      Hero screen uploading
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Two-column body ── */}
        <div className="case-body-grid" style={{
          display: "grid",
          gridTemplateColumns: `1fr 6px ${sidebarWidth}px`,
          alignItems: "start", minHeight: "100vh",
        }}>

          {/* LEFT: narrative */}
          <div style={{ borderRight: "1px solid var(--border)" }}>

            {/* Scope, Constraints & Reality */}
            <section style={{ padding: "72px 48px", background: "var(--bg-elevated)" }}>
              <motion.div
                initial="hidden" whileInView="visible" viewport={viewportOnce} variants={reveal}
                style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.2em",
                  textTransform: "uppercase", color: "var(--muted)",
                  display: "flex", alignItems: "center", gap: 16, marginBottom: 48,
                }}
              >
                Scope, Constraints &amp; Reality
                <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
              </motion.div>
              <div style={{ borderTop: "1px solid var(--border)" }}>
                {study.scopeConstraints.map((item, i) => (
                  <ScopeRow key={i} item={item} accentText={accentText} index={i} />
                ))}
              </div>
            </section>

            {/* Portfolio slides */}
            {study.slides && study.slides.length > 0 ? (
              <section style={{ padding: "72px 48px", background: "var(--bg-tint)" }}>
                <motion.div
                  initial="hidden" whileInView="visible" viewport={viewportOnce} variants={reveal}
                  style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.2em",
                    textTransform: "uppercase", color: "var(--muted)",
                    display: "flex", alignItems: "center", gap: 16, marginBottom: 72,
                  }}
                >
                  The Work
                  <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
                </motion.div>
                <div style={{ display: "flex", flexDirection: "column", gap: 88 }}>
                  {study.slides.map((slide, i) => (
                    <motion.div
                      key={i}
                      initial="hidden" whileInView="visible" viewport={viewportOnce} variants={reveal}
                      transition={{ delay: i * 0.06 }}
                    >
                      <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 18 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: accentText }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted-strong)" }}>
                          {slide.label}
                        </span>
                      </div>
                      <div style={{ borderRadius: 8, overflow: "hidden", boxShadow: "0 24px 72px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.25)", border: "1px solid var(--border)" }}>
                        <img src={slide.src} alt={slide.label} style={{ width: "100%", display: "block" }} />
                      </div>
                      <p style={{ marginTop: 16, fontSize: 14, color: "var(--muted-strong)", lineHeight: 1.75, maxWidth: 640 }}>
                        {slide.caption}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </section>
            ) : (
              /* Slides placeholder */
              <section style={{ padding: "72px 48px", background: "var(--bg-tint)" }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.2em",
                  textTransform: "uppercase", color: "var(--muted)",
                  display: "flex", alignItems: "center", gap: 16, marginBottom: 48,
                }}>
                  The Work
                  <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div key={n} style={{
                      height: 320, borderRadius: 8,
                      background: `linear-gradient(135deg, rgba(237,234,212,0.05) 0%, ${accent}0a 100%)`,
                      border: "1px dashed var(--border)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--muted)" }}>
                          Slide {String(n).padStart(2, "0")} — uploading soon
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Design Decisions */}
            <section style={{ padding: "72px 48px", background: "var(--bg-elevated)" }}>
              <motion.div
                initial="hidden" whileInView="visible" viewport={viewportOnce} variants={reveal}
                style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.2em",
                  textTransform: "uppercase", color: "var(--muted)",
                  display: "flex", alignItems: "center", gap: 16, marginBottom: 48,
                }}
              >
                Design Decisions
                <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
              </motion.div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {study.decisions.map((d, i) => (
                  <DecisionCard key={i} decision={d} accent={accent} badgeOnAccent={badgeOnAccent} index={i} />
                ))}
              </div>
            </section>

            {/* Outcomes */}
            <section style={{ padding: "72px 48px" }}>
              <motion.div
                initial="hidden" whileInView="visible" viewport={viewportOnce} variants={reveal}
                style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.2em",
                  textTransform: "uppercase", color: "var(--muted)",
                  display: "flex", alignItems: "center", gap: 16, marginBottom: 48,
                }}
              >
                Impact
                <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
              </motion.div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 1, border: "1px solid var(--border)",
              }}>
                {study.outcomes.map((o, i) => (
                  <OutcomeCard key={i} outcome={o} accent={accent} accentText={accentText} index={i} />
                ))}
              </div>
            </section>
          </div>

          {/* Drag handle — resizes the screens sidebar. Tracked on `window`
              in the effect above, not here; this is just the visible/hit
              target and the drag-start trigger. */}
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize screens panel"
            className="case-resize-handle"
            onMouseDown={(e) => { e.preventDefault(); setResizing(true); }}
            onDoubleClick={() => { setSidebarWidth(300); sessionStorage.setItem("case-sidebar-width", "300"); }}
            style={{
              alignSelf: "stretch",
              cursor: isFinePointer ? "col-resize" : undefined,
              position: "relative",
              background: "transparent",
            }}
          >
            <div style={{
              position: "absolute", top: 0, bottom: 0, left: "50%",
              width: 1, transform: "translateX(-50%)",
              background: resizing ? accent : "var(--border)",
              transition: resizing ? "none" : "background 0.2s",
            }} />
            {/* Resize affordance — sticky (not absolute) so it tracks
                roughly the middle of the viewport as the reader scrolls,
                rather than sitting once at the vertical midpoint of a page
                that can run several thousand pixels tall and never be seen. */}
            <div style={{ position: "sticky", top: "calc(50vh - 18px)", height: 0 }}>
              <div
                aria-hidden="true"
                style={{
                  position: "absolute", left: "50%", top: 0,
                  transform: "translateX(-50%)",
                  width: 18, height: 36, borderRadius: 9,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: resizing ? accent : "var(--bg-elevated)",
                  border: `1px solid ${resizing ? accent : "var(--border)"}`,
                  transition: resizing ? "none" : "background 0.2s, border-color 0.2s",
                }}
              >
                <svg width="8" height="16" viewBox="0 0 8 16" fill="none">
                  <rect x="0" y="0" width="2" height="16" rx="1" fill={resizing ? badgeOnAccent : "var(--muted)"} />
                  <rect x="6" y="0" width="2" height="16" rx="1" fill={resizing ? badgeOnAccent : "var(--muted)"} />
                </svg>
              </div>
            </div>
          </div>

          {/* RIGHT: sticky screens panel — a fixed, scroll-locked carousel
              at the bottom of the viewport on mobile instead (see the
              .case-sidebar mobile override in globals.css); markup and
              click-to-lightbox behavior stay identical, only the layout
              class hooks differ. */}
          <div className="case-sidebar" style={{
            position: "sticky", top: 64,
            height: "calc(100vh - 64px)",
            display: "flex", flexDirection: "column",
            padding: "28px 20px", overflowY: "auto",
          }}>
            <div className="case-sidebar-header" style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "0.18em",
              textTransform: "uppercase", color: "var(--muted)",
              marginBottom: 16, paddingBottom: 12,
              borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span>Screens</span>
              <span style={{ color: accentText }}>{screens.length}</span>
            </div>

            <div
              className="case-screens-list"
              onMouseLeave={() => setHoveredScreen(null)}
              style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}
            >
              {screens.length > 0 ? screens.map((screen, i) => {
                // Hovering previews which screen is "selected" without
                // committing to it — falls back to the last-clicked/default
                // screen once the pointer leaves so there's always exactly
                // one highlighted, not zero.
                const highlighted = (hoveredScreen ?? activeScreen) === i;
                return (
                <button
                  key={i}
                  className="case-screen-btn"
                  onClick={() => { setLightbox(i); setActive(i); }}
                  onMouseEnter={() => setHoveredScreen(i)}
                  onFocus={() => setHoveredScreen(i)}
                  onBlur={() => setHoveredScreen(null)}
                  aria-label={`Open ${screen.label} in expanded view`}
                  aria-current={highlighted}
                  style={{ background: "none", border: "none", padding: 0, cursor: isFinePointer ? "none" : "pointer", textAlign: "left" }}
                >
                  <div className="case-screen-thumb" style={{
                    position: "relative",
                    borderRadius: 6, overflow: "hidden",
                    border: `2px solid ${highlighted ? accent : "var(--border)"}`,
                    boxShadow: highlighted ? `0 0 0 1px ${accent}22, 0 8px 24px rgba(0,0,0,0.10)` : "0 2px 8px rgba(0,0,0,0.06)",
                    transition: "border-color 0.25s, box-shadow 0.25s",
                  }}>
                    <img
                      src={screen.src} alt={screen.label}
                      style={{ width: "100%", display: "block", opacity: highlighted ? 1 : 0.7, transition: "opacity 0.25s" }}
                    />
                    <div className="case-screen-expand-icon" aria-hidden="true" style={{
                      position: "absolute", inset: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "rgba(0,0,0,0.35)", opacity: 0, transition: "opacity 0.2s",
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                      </svg>
                    </div>
                  </div>
                  <div className="case-screen-label" style={{
                    marginTop: 6, fontSize: 9, fontWeight: 700,
                    letterSpacing: "0.12em", textTransform: "uppercase",
                    color: highlighted ? accentText : "var(--muted)", transition: "color 0.25s",
                  }}>
                    {screen.label}
                  </div>
                </button>
                );
              }) : (
                /* Screens placeholder */
                [1, 2, 3].map((n) => (
                  <div key={n} className="case-screen-btn" style={{
                    borderRadius: 6, height: 120,
                    background: `linear-gradient(135deg, rgba(237,234,212,0.05) 0%, ${accent}0a 100%)`,
                    border: "1px dashed rgba(0,0,0,0.10)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)" }}>
                      Screen {n}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="case-sidebar-hint" style={{
              marginTop: 20, paddingTop: 16,
              borderTop: "1px solid var(--border)",
              fontSize: 9, fontWeight: 600, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "var(--muted)", textAlign: "center",
            }}>
              Click to expand · ← → to navigate
            </div>
          </div>
        </div>

        {/* ── Project navigation ── */}
        <nav style={{
          borderTop: "1px solid var(--border)",
          display: "grid", gridTemplateColumns: "1fr 1fr",
        }}>
          {prev ? (
            <Link
              href={`/work/${prev.slug}`}
              onMouseEnter={() => setLarge(true)}
              onMouseLeave={() => setLarge(false)}
              style={{
                display: "block", padding: "48px", textDecoration: "none",
                borderRight: "1px solid var(--border)", transition: "background 0.3s ease",
              }}
              onMouseOver={(e)  => (e.currentTarget.style.background = "var(--bg-elevated)")}
              onMouseOut={(e)   => (e.currentTarget.style.background = "transparent")}
            >
              <NavCard study={prev} direction="prev" />
            </Link>
          ) : <div />}
          {next ? (
            <Link
              href={`/work/${next.slug}`}
              onMouseEnter={() => setLarge(true)}
              onMouseLeave={() => setLarge(false)}
              style={{
                display: "block", padding: "48px", textDecoration: "none",
                textAlign: "right", transition: "background 0.3s ease",
              }}
              onMouseOver={(e)  => (e.currentTarget.style.background = "var(--bg-elevated)")}
              onMouseOut={(e)   => (e.currentTarget.style.background = "transparent")}
            >
              <NavCard study={next} direction="next" />
            </Link>
          ) : <div />}
        </nav>
      </main>
    </>
  );
}

function ScopeRow({ item, accentText, index }: {
  item: CaseStudy["scopeConstraints"][0]; accentText: string; index: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className="case-scope-row"
      initial="hidden" whileInView="visible" viewport={viewportOnce} variants={revealVariant(!!reduceMotion)}
      transition={{ delay: index * 0.06 }}
      style={{
        display: "grid",
        gridTemplateColumns: "200px 1fr",
        gap: 32,
        padding: "22px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.04em", color: accentText }}>
        {item.label}
      </div>
      <p style={{ fontSize: 14, fontWeight: 300, color: "var(--muted-strong)", lineHeight: 1.75, maxWidth: 720 }}>
        {item.desc}
      </p>
    </motion.div>
  );
}

function DecisionCard({ decision, accent, badgeOnAccent, index }: {
  decision: CaseStudy["decisions"][0]; accent: string; badgeOnAccent: string; index: number;
}) {
  const [hov, setHov] = useState(false);
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial="hidden" whileInView="visible" viewport={viewportOnce} variants={revealVariant(!!reduceMotion)}
      transition={{ delay: index * 0.07 }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "36px 32px",
        background: hov ? "rgba(255,255,255,0.05)" : "transparent",
        borderLeft: `2px solid ${hov ? accent : "rgba(255,255,255,0.06)"}`,
        transition: "background 0.25s, border-color 0.25s",
      }}
    >
      <div style={{
        width: 30, height: 30, borderRadius: "50%", background: accent,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 800, color: badgeOnAccent, marginBottom: 18,
      }}>
        {decision.num}
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 600, color: "var(--fg)", marginBottom: 12, lineHeight: 1.3 }}>
        {decision.title}
      </h3>
      <p style={{ fontSize: 14, fontWeight: 300, color: "var(--muted-strong)", lineHeight: 1.75 }}>
        {decision.desc}
      </p>
    </motion.div>
  );
}

function OutcomeCard({ outcome, accent, accentText, index }: {
  outcome: CaseStudy["outcomes"][0]; accent: string; accentText: string; index: number;
}) {
  const [hov, setHov] = useState(false);
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial="hidden" whileInView="visible" viewport={viewportOnce} variants={revealVariant(!!reduceMotion)}
      transition={{ delay: index * 0.07 }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "40px 36px",
        borderRight: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        background: hov ? "var(--bg-elevated)" : "transparent",
        transition: "background 0.3s ease",
      }}
    >
      <div style={{
        fontSize: "clamp(28px, 3.5vw, 48px)",
        fontWeight: 700, letterSpacing: "-0.03em",
        color: hov ? accentText : "var(--fg)", marginBottom: 10, lineHeight: 1,
        transition: "color 0.3s ease",
      }}>
        {outcome.num}
      </div>
      <div style={{
        fontSize: 14, fontWeight: 600,
        color: hov ? accentText : "var(--fg)", marginBottom: 8, transition: "color 0.3s ease",
      }}>
        {outcome.title}
      </div>
      <p style={{
        fontSize: 13, fontWeight: 300, lineHeight: 1.7,
        color: hov ? "var(--muted-strong)" : "var(--muted)", transition: "color 0.3s ease",
      }}>
        {outcome.desc}
      </p>
    </motion.div>
  );
}

function NavCard({ study, direction }: { study: CaseStudy; direction: "prev" | "next" }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase",
        color: hov ? "var(--muted-strong)" : "var(--muted)", marginBottom: 12, transition: "color 0.3s",
      }}>
        {direction === "prev" ? "← Previous" : "Next →"}
      </div>
      <div style={{
        fontSize: "clamp(20px, 3vw, 36px)",
        fontWeight: 700, letterSpacing: "-0.02em", textTransform: "uppercase",
        color: "var(--fg)", transition: "color 0.3s", marginBottom: 8,
      }}>
        {study.title}
      </div>
      <div style={{ fontSize: 12, color: hov ? "var(--muted-strong)" : "var(--muted)", transition: "color 0.3s" }}>
        {study.company} · {study.year}
      </div>
    </div>
  );
}
