"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, useAnimationControls, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { CASE_STUDIES } from "@/lib/caseStudies";
import { revealVariant, viewportOnce, easeOutExpo } from "@/lib/motion";
import { useHasFinePointer } from "@/lib/useHasFinePointer";
import { useIsLowEndDevice } from "@/lib/useIsLowEndDevice";
import { useHeroScrollProgress } from "@/components/hero/ScrollController";
import HeroContent from "@/components/hero/HeroContent";
import PortfolioFolder from "@/components/folder/PortfolioFolder";
import WindowManager from "@/components/windows/WindowManager";

// Three.js/WebGL needs a real browser context — never render during
// Next's static-export prerender.
const ParticleBackground = dynamic(() => import("@/components/hero/ParticleBackground"), { ssr: false });

// Scroll-cue ring geometry. A CSS `border: dashed` can't control dash count
// or weight directly (the browser picks both from the border-width), which
// is why it read as a fussy ring of many thin dashes — an SVG circle with
// an explicit stroke-dasharray gives exact control over both.
const SCROLL_CUE_SIZE = 68;
const SCROLL_CUE_STROKE = 2.5; // matches the arrow glyph's visual weight
const SCROLL_CUE_RADIUS = SCROLL_CUE_SIZE / 2 - SCROLL_CUE_STROKE / 2;
const SCROLL_CUE_CIRCUMFERENCE = 2 * Math.PI * SCROLL_CUE_RADIUS;
const SCROLL_CUE_DASH_COUNT = 8;
const SCROLL_CUE_PERIOD = SCROLL_CUE_CIRCUMFERENCE / SCROLL_CUE_DASH_COUNT;
// Gap is a smaller share of each dash+gap period than dash — tighter
// spacing between dashes than an even 50/50 split.
const SCROLL_CUE_GAP_RATIO = 0.3;
const SCROLL_CUE_GAP = SCROLL_CUE_PERIOD * SCROLL_CUE_GAP_RATIO;
const SCROLL_CUE_DASH = SCROLL_CUE_PERIOD - SCROLL_CUE_GAP;
const SCROLL_CUE_RING_OPACITY = 0.85;

// Homepage project list — derived from CASE_STUDIES (caseStudies.ts) rather
// than a second hand-maintained array. Adding or reordering a case study
// now only means editing one file; this used to be two arrays that had to
// be kept in sync by hand (and drifted the moment one was, e.g. a new
// project or a reorder landed in one but not the other).
const PROJECTS = CASE_STUDIES.map((c) => ({
  slug: c.slug,
  num: c.index,
  title: c.title,
  company: c.company,
  tags: c.tags,
  year: c.year,
  desc: c.homeDesc,
  heroColor: c.heroColor,
  previewImage: c.heroImage,
}));

// Every tag used across all projects, for the "Selected Work" filter pills
// — derived, not hand-maintained, so a new project's tags show up in the
// filter row automatically instead of needing a second edit.
const ALL_TAGS = Array.from(new Set(PROJECTS.flatMap((p) => p.tags))).sort();

export default function Portfolio() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const visibleProjects = activeTag ? PROJECTS.filter((p) => p.tags.includes(activeTag)) : PROJECTS;
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [cursorLarge, setCursorLarge] = useState(false);
  const [scrollCueHovered, setScrollCueHovered] = useState(false);

  const reduceMotion = useReducedMotion();
  const isFinePointer = useHasFinePointer();
  const lowEndDevice = useIsLowEndDevice();
  const marqueeControls = useAnimationControls();
  const reveal = revealVariant(!!reduceMotion);

  // Project-preview image that follows the cursor while hovering a Work
  // row. `useSpring(plainNumber, ...)` only seeds itself from that number's
  // *first* render — it doesn't re-target on later renders, so binding it
  // directly to `cursor.x`/`cursor.y` (React state) left the preview stuck
  // at its very first position (0,0) instead of tracking the mouse. Real
  // MotionValues don't have that problem: they propagate on every `.set()`
  // regardless of React's render cycle, so the effect below pushes each
  // `cursor` update into one explicitly, and the spring follows *that*.
  const previewSpring = reduceMotion
    ? { stiffness: 1000, damping: 100 }
    : { stiffness: 260, damping: 26, mass: 0.4 };
  const rawPreviewX = useMotionValue(0);
  const rawPreviewY = useMotionValue(0);
  const previewX = useSpring(rawPreviewX, previewSpring);
  const previewY = useSpring(rawPreviewY, previewSpring);
  useEffect(() => {
    rawPreviewX.set(cursor.x);
    rawPreviewY.set(cursor.y);
  }, [cursor, rawPreviewX, rawPreviewY]);
  const previewProject = hovered !== null ? PROJECTS[hovered] : null;

  // Scroll progress — thin bar fixed to the top of the viewport
  const { scrollYProgress } = useScroll();
  const scrollProgressX = useTransform(scrollYProgress, [0, 1], reduceMotion ? [1, 1] : [0, 1]);

  // Shared scroll progress for the hero — drives the WebGL morph/camera and
  // the DOM content's fade/slide from a single source.
  const heroRef = useRef<HTMLElement>(null);
  const heroProgress = useHeroScrollProgress(heroRef);

  // Gate the custom cursor to fine-pointer devices only
  useEffect(() => {
    document.body.classList.toggle("has-fine-pointer", isFinePointer);
  }, [isFinePointer]);

  // Cursor tracking (fine pointer only)
  useEffect(() => {
    if (!isFinePointer) return;
    let frame: number;
    const move = (e: MouseEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setCursor({ x: e.clientX, y: e.clientY }));
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [isFinePointer]);

  // Marquee loop
  useEffect(() => {
    if (reduceMotion) return;
    marqueeControls.start({
      x: ["0%", "-50%"],
      transition: { duration: 20, ease: "linear", repeat: Infinity },
    });
  }, [reduceMotion, marqueeControls]);

  const setLarge = (v: boolean) => setCursorLarge(v);

  const marqueeItems = [
    "UX Design", "UI Design", "Enterprise", "FinTech", "Healthcare",
    "Design Systems", "Research", "Interaction Design", "Dark Mode", "Multi-market",
  ];

  return (
    <>
      {/* Fixed particle background — wave grid → rotating globe on scroll,
          behind all page content, not scoped to the hero section */}
      <ParticleBackground />

      {/* Custom Cursor — fine-pointer devices only */}
      {isFinePointer && (
        <div
          className={`cursor-dot${cursorLarge ? " cursor-large" : ""}`}
          style={{ left: cursor.x, top: cursor.y }}
        />
      )}

      {/* Project preview — follows the cursor while hovering a Work row;
          which image it shows swaps with `hovered`. The outer AnimatePresence
          only fires enter/exit for starting/stopping hover on the list as a
          whole; the inner one crossfades just the image when moving directly
          from one row to another, so the frame doesn't re-pop on every row
          change. Fine-pointer only — there's no persistent hover to attach
          to on touch. */}
      <AnimatePresence>
        {isFinePointer && previewProject && (
          <motion.div
            key="project-preview"
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: reduceMotion ? 0 : 0.25, ease: easeOutExpo }}
            style={{
              position: "fixed", left: previewX, top: previewY,
              // Right of the cursor (x offset), vertically centered on it
              // (y: -50% shifts the box up by half its own height so its
              // center — not its top edge — lines up with the cursor).
              x: 28, y: "-50%",
              width: 260, height: 170,
              zIndex: 500, pointerEvents: "none",
              borderRadius: 12, overflow: "hidden",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-strong)",
              boxShadow: "0 30px 70px rgba(0,0,0,0.55)",
            }}
          >
            <AnimatePresence mode="wait">
              {previewProject.previewImage && (
                <motion.img
                  key={previewProject.slug}
                  src={previewProject.previewImage}
                  alt=""
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.2 }}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scroll progress ── */}
      <motion.div
        aria-hidden="true"
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
          height: 2, transformOrigin: "0% 50%",
          scaleX: scrollProgressX,
          background: "linear-gradient(90deg, #E20074, #7C6AF7, #00B4AA)",
        }}
      />

      {/* ── Navigation ── */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 48px",
          // `backdrop-filter` is one of the most GPU-expensive CSS
          // properties there is — a full backdrop capture + blur pass every
          // frame it's on screen, worse still on a `position: fixed` bar
          // re-composited on every scroll tick. Skipped on weak hardware;
          // the solid-ish fallback background reads fine without it.
          background: lowEndDevice ? "rgba(10,10,10,0.94)" : "rgba(10,10,10,0.75)",
          backdropFilter: lowEndDevice ? undefined : "blur(10px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion ? "instant" : "smooth" })}
          onMouseEnter={() => setLarge(true)}
          onMouseLeave={() => setLarge(false)}
          whileHover={{ opacity: 0.7 }}
          whileTap={{ scale: 0.97 }}
          aria-label="Scroll to top"
          style={{
            fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
            background: "none", border: "none", padding: 0, color: "var(--fg)",
            fontFamily: "inherit", cursor: isFinePointer ? "none" : "pointer",
          }}
        >
          Lakshhay Bedi
        </motion.button>
        <ul style={{ display: "flex", gap: 36, listStyle: "none" }}>
          {["Work", "About", "Contact"].map((link) => (
            <li key={link}>
              <motion.a
                href={`#${link.toLowerCase()}`}
                onMouseEnter={() => setLarge(true)}
                onMouseLeave={() => setLarge(false)}
                whileHover={{ opacity: 0.55 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: "0.12em",
                  textTransform: "uppercase", textDecoration: "none", color: "var(--fg)",
                  display: "inline-block",
                }}
              >
                {link}
              </motion.a>
            </li>
          ))}
        </ul>
      </motion.nav>

      {/* ── Hero ── */}
      <section ref={heroRef} style={{
        position: "relative", height: "100vh", minHeight: 700,
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
        padding: "0 48px 52px", overflow: "hidden",
      }}>
        <HeroContent scrollYProgress={heroProgress} reduceMotion={reduceMotion} />

        <motion.div
          className="hero-scroll-cue"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.1 }}
          style={{
            position: "absolute", bottom: 52, left: "50%", transform: "translateX(-50%)",
            zIndex: 1,
          }}
        >
          <Link
            href="#work"
            aria-label="Scroll to projects"
            onMouseEnter={() => { setScrollCueHovered(true); setLarge(true); }}
            onMouseLeave={() => { setScrollCueHovered(false); setLarge(false); }}
            style={{
              position: "relative",
              display: "flex", alignItems: "center", justifyContent: "center",
              width: SCROLL_CUE_SIZE, height: SCROLL_CUE_SIZE,
              textDecoration: "none",
              cursor: isFinePointer ? "none" : "pointer",
            }}
          >
            {/* Solid fill — the resting state. Fades out on hover as the
                dashed ring below fades in, so the circle reads as
                "transforming" from filled to an outlined ring rather than
                two unrelated elements swapping. */}
            <span
              aria-hidden="true"
              style={{
                position: "absolute", inset: 0,
                borderRadius: "50%",
                background: "var(--fg)",
                opacity: scrollCueHovered ? 0 : 1,
                transition: "opacity 0.3s ease",
              }}
            />
            {/* Dashed ring — an SVG stroke, not a CSS border: a border's
                dash count/weight aren't controllable and rendered as a lot
                of thin dashes. This gives 8 dashes as bold as the arrow
                glyph. Always slowly rotating (imperceptibly, since it's
                invisible at rest) so the instant it's revealed on hover it
                already reads as spinning rather than starting from a
                static pose.
                Opacity lives on this plain wrapping span, not on the
                motion.svg itself — a motion element with an active
                `animate` prop takes direct imperative control of its own
                style, so a plain conditional value in its `style` (like
                this hover-driven opacity) goes stale instead of updating
                on every render. Isolating it here keeps the toggle on
                normal React/CSS, which updates reliably. */}
            <span
              aria-hidden="true"
              style={{
                position: "absolute", inset: 0,
                opacity: scrollCueHovered ? SCROLL_CUE_RING_OPACITY : 0,
                transition: "opacity 0.3s ease",
              }}
            >
              <motion.svg
                width={SCROLL_CUE_SIZE}
                height={SCROLL_CUE_SIZE}
                viewBox={`0 0 ${SCROLL_CUE_SIZE} ${SCROLL_CUE_SIZE}`}
                animate={reduceMotion ? undefined : { rotate: 360 }}
                transition={reduceMotion ? undefined : { duration: 18, repeat: Infinity, ease: "linear" }}
                style={{ display: "block" }}
              >
                <circle
                  cx={SCROLL_CUE_SIZE / 2}
                  cy={SCROLL_CUE_SIZE / 2}
                  r={SCROLL_CUE_RADIUS}
                  fill="none"
                  stroke="var(--fg)"
                  strokeWidth={SCROLL_CUE_STROKE}
                  strokeDasharray={`${SCROLL_CUE_DASH} ${SCROLL_CUE_GAP}`}
                />
              </motion.svg>
            </span>
            <span
              aria-hidden="true"
              style={{
                position: "relative", zIndex: 1,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase",
                color: scrollCueHovered ? "var(--fg)" : "var(--fg-invert)",
                transition: "color 0.3s ease",
              }}
            >
              <span style={{ fontSize: 14, animation: reduceMotion ? "none" : "bounce 1.6s ease-in-out infinite", display: "block" }}>↓</span>
              Scroll
            </span>
          </Link>
        </motion.div>
      </section>

      {/* ── Marquee ── */}
      <div
        style={{
          overflow: "hidden",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          padding: "14px 0",
          background: "var(--bg-elevated)",
        }}
        onMouseEnter={() => marqueeControls.stop()}
        onMouseLeave={() => {
          if (!reduceMotion) {
            marqueeControls.start({ x: ["0%", "-50%"], transition: { duration: 20, ease: "linear", repeat: Infinity } });
          }
        }}
      >
        <motion.div animate={marqueeControls} style={{ display: "flex", whiteSpace: "nowrap" }}>
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} style={{
              display: "inline-flex", alignItems: "center", gap: 20, padding: "0 20px",
              fontSize: 12, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase",
              color: "rgba(237,234,212,0.75)",
            }}>
              {item}
              <span style={{ width: 4, height: 4, background: "rgba(237,234,212,0.3)", borderRadius: "50%", display: "inline-block" }} />
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── Work ── */}
      {/* Bottom padding dropped — the Interactive Canvas card right below
          brings its own 72px padding, and stacking that on top of this
          section's usual 100px plus About's 100px top padding tripled up
          into a huge gap of mostly-empty space around the card. */}
      <section id="work" style={{ padding: "100px 48px 0" }}>
        <motion.div
          initial="hidden" whileInView="visible" viewport={viewportOnce} variants={reveal}
          style={{ marginBottom: 48 }}
        >
          <span style={{
            fontSize: 11, fontWeight: 600, letterSpacing: "0.14em",
            textTransform: "uppercase", color: "var(--muted)",
            display: "flex", alignItems: "center", gap: 16,
          }}>
            Selected Work
            <span style={{ flex: 1, height: 1, background: "var(--border)", display: "block" }} />
          </span>
        </motion.div>

        {/* Tag filter — a flat list of every project reads fine at 4 rows;
            past a handful it's just scrolling past ones you don't care
            about. Filtering by the same tags each row already shows keeps
            "Selected Work" a curated highlight reel instead of an
            ever-growing wall. */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }} role="group" aria-label="Filter projects by tag">
          <FilterPill active={activeTag === null} onClick={() => setActiveTag(null)}>All</FilterPill>
          {ALL_TAGS.map((tag) => (
            <FilterPill key={tag} active={activeTag === tag} onClick={() => setActiveTag((t) => (t === tag ? null : tag))}>
              {tag}
            </FilterPill>
          ))}
        </div>

        {/* A standalone line, not a wrapping border: this needs the same
            -24px bleed as each row's own margin (below) to span the same
            width, but if it were a `borderTop` on the div that *wraps* the
            rows, its own -24px margin would compound with each row's
            already-independent -24px margin (each relative to its own
            parent's box) — doubling the bleed to the full viewport width
            instead of matching it. Keeping it a sibling avoids that. */}
        <div style={{ height: 1, background: "var(--border)", margin: "0 -24px" }} />
        <div>
          {visibleProjects.length === 0 && (
            <div style={{ padding: "48px 0", textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
              No projects tagged &ldquo;{activeTag}&rdquo; yet.
            </div>
          )}
          {visibleProjects.map((p) => {
            // Original index into the full (unfiltered) PROJECTS array —
            // `hovered`/`previewProject` key off this, not position within
            // the filtered list, so the cursor-preview image still resolves
            // to the right project regardless of which filter is active.
            const i = PROJECTS.indexOf(p);
            const isOpen = hovered === i;
            return (
              <motion.div
                key={p.slug}
                initial="hidden" whileInView="visible" viewport={viewportOnce} variants={reveal}
                transition={{ duration: 0.85, ease: easeOutExpo, delay: i * 0.08 }}
              >
                <Link
                  href={`/work/${p.slug}`}
                  onMouseEnter={() => { setHovered(i); setLarge(true); }}
                  onMouseLeave={() => { setHovered(null); setLarge(false); }}
                  onFocus={() => { setHovered(i); setLarge(true); }}
                  onBlur={() => { setHovered(null); setLarge(false); }}
                  style={{
                    display: "block", textDecoration: "none", color: "inherit",
                    borderBottom: "1px solid var(--border)",
                    background: isOpen ? "var(--bg-elevated)" : "transparent",
                    transition: "background 0.5s cubic-bezier(0.16,1,0.3,1)",
                    cursor: isFinePointer ? "none" : "pointer",
                    // Negative margin + matching padding: the hover
                    // highlight bleeds 24px wider than the text column on
                    // each side, so the highlighted row has real breathing
                    // room around its own content instead of the text
                    // touching the highlight's edges — content's on-screen
                    // position is unchanged (margin and padding cancel out).
                    margin: "0 -24px",
                    padding: "0 24px",
                  }}
                >
                  <div
                    className="work-row"
                    style={{
                      padding: "28px 0",
                      display: "grid", gridTemplateColumns: "60px 1fr auto auto",
                      alignItems: "center", gap: 24,
                    }}
                  >
                    <span className="work-row-num" style={{
                      fontSize: 12, fontWeight: 500, letterSpacing: "0.05em",
                      color: isOpen ? "var(--muted-strong)" : "var(--muted)",
                      transition: "color 0.4s ease",
                    }}>
                      {p.num}
                    </span>

                    <div className="work-row-title">
                      <div style={{
                        fontSize: "clamp(26px, 3.5vw, 54px)",
                        fontWeight: 700, letterSpacing: "-0.02em", textTransform: "uppercase",
                        lineHeight: 1, marginBottom: 5,
                        color: isOpen ? p.heroColor : "rgba(237,234,212,0.9)",
                        transition: "color 0.4s ease",
                      }}>
                        {p.title}
                      </div>
                      <div style={{
                        fontSize: 13,
                        color: isOpen ? "rgba(237,234,212,0.5)" : "var(--muted)",
                        transition: "color 0.4s ease",
                      }}>
                        {p.company}
                      </div>
                    </div>

                    <div className="work-row-tags" style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      {p.tags.map((tag) => (
                        <span key={tag} style={{
                          fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          border: `1px solid ${isOpen ? "rgba(237,234,212,0.2)" : "var(--border)"}`,
                          padding: "4px 12px",
                          color: isOpen ? "rgba(237,234,212,0.65)" : "var(--muted)",
                          transition: "all 0.4s ease",
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="work-row-meta" style={{
                      fontSize: 13, textAlign: "right",
                      color: isOpen ? "var(--muted-strong)" : "var(--muted)",
                      transition: "color 0.4s ease",
                      display: "flex", alignItems: "center", gap: 14,
                    }}>
                      <span>{p.year}</span>
                      <motion.span
                        aria-hidden
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.3, ease: easeOutExpo }}
                        style={{
                          width: 20, height: 20, borderRadius: "50%",
                          border: `1px solid ${isOpen ? "rgba(237,234,212,0.35)" : "var(--border-strong)"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, lineHeight: 1,
                          color: isOpen ? "rgba(237,234,212,0.7)" : "var(--muted)",
                        }}
                      >
                        +
                      </motion.span>
                      <span style={{
                        fontSize: 22,
                        transform: isOpen ? "translate(3px,-3px)" : "translate(0,0)",
                        transition: "transform 0.3s ease",
                        color: isOpen ? "rgba(237,234,212,0.6)" : "var(--muted)",
                      }}>↗</span>
                    </div>
                  </div>

                  {/* Expandable description */}
                  <div className="work-row-desc" style={{
                    maxHeight: isOpen ? 200 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.55s cubic-bezier(0.16,1,0.3,1)",
                    paddingLeft: 84,
                  }}>
                    <p style={{
                      fontSize: 14, fontWeight: 300, lineHeight: 1.7,
                      color: "rgba(237,234,212,0.72)",
                      paddingTop: 16, paddingRight: 120, paddingBottom: 28,
                    }}>
                      {p.desc}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── View in Canvas ── */}
      <motion.section
        className="canvas-cta-section"
        initial="hidden" whileInView="visible" viewport={viewportOnce} variants={reveal}
        style={{
          margin: "0 48px",
          borderRadius: 16,
          overflow: "hidden",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          position: "relative",
        }}
      >
        {/* dot grid */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />

        <div className="canvas-cta-row" style={{
          position: "relative", zIndex: 1,
          padding: "72px 64px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 48,
          flexWrap: "wrap",
        }}>
          <div>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
              textTransform: "uppercase", color: "var(--muted)",
              marginBottom: 18,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontSize: 14 }}>◈</span> Interactive Canvas
            </div>
            <div style={{
              fontSize: "clamp(32px, 4.5vw, 64px)",
              fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.05,
              color: "var(--fg)", marginBottom: 20,
            }}>
              View the work<br />in an open canvas.
            </div>
            <p style={{
              fontSize: 15, fontWeight: 300, lineHeight: 1.7,
              color: "rgba(237,234,212,0.5)", maxWidth: 420,
            }}>
              Pan, zoom, and arrange the project work spatially — a Figma‑style infinite board built into this portfolio.
            </p>
          </div>

          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} style={{ flexShrink: 0 }}>
            <Link
              href="/canvas"
              onMouseEnter={() => setLarge(false)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 12,
                padding: "18px 36px",
                background: "var(--fg)", color: "var(--fg-invert)",
                fontSize: 13, fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", textDecoration: "none",
                borderRadius: 8,
                whiteSpace: "nowrap",
              }}
            >
              Open Canvas
              <span style={{ fontSize: 18, fontWeight: 400, lineHeight: 1 }}>↗</span>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* ── About ── */}
      {/* Top padding trimmed to match the Work-section fix above — the
          Interactive Canvas card's own 72px bottom padding already
          supplies the gap before this section starts. */}
      <section id="about" style={{ padding: "60px 48px 100px", borderTop: "1px solid var(--border)" }}>
        <motion.div
          initial="hidden" whileInView="visible" viewport={viewportOnce} variants={reveal}
          style={{ marginBottom: 64 }}
        >
          <span style={{
            fontSize: 11, fontWeight: 600, letterSpacing: "0.14em",
            textTransform: "uppercase", color: "var(--muted)",
            display: "flex", alignItems: "center", gap: 16,
          }}>
            About Me
            <span style={{ flex: 1, height: 1, background: "var(--border)", display: "block" }} />
          </span>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 80 }}>
          <motion.div
            initial="hidden" whileInView="visible" viewport={viewportOnce} variants={reveal}
            transition={{ delay: 0.1 }}
          >
            <p style={{ fontSize: 22, fontWeight: 300, lineHeight: 1.7, letterSpacing: "-0.01em" }}>
              I'm a <strong style={{ fontWeight: 600 }}>Senior UX Designer</strong> focused on complex systems — dashboards, financial products, and regulated workflows where the stakes are high and the edge cases are endless.
            </p>
            <p style={{ fontSize: 22, fontWeight: 300, lineHeight: 1.7, letterSpacing: "-0.01em", marginTop: 24 }}>
              My work spans enterprise B2B, financial services across Africa, and health insurance infrastructure. I design for users who are under pressure, not just users who are browsing.
            </p>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7, marginTop: 32, fontWeight: 400, letterSpacing: "0.01em" }}>
              Full process: research → flow architecture → high-fidelity UI → design system contribution.
            </p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={viewportOnce} variants={reveal}
            transition={{ delay: 0.2 }}
          >
            {[
              { label: "Tools", items: ["Figma", "FigJam", "Zeplin", "Maze", "Hotjar", "Miro", "JIRA", "Confluence"] },
              { label: "Domains", items: ["Enterprise B2B", "FinTech", "Healthcare", "Multi-market", "Design Systems"] },
              { label: "Capabilities", items: ["User Research", "Information Architecture", "UX Design", "UI Design", "Prototyping", "Responsive Design"] },
            ].map((block) => (
              <div key={block.label} style={{ marginBottom: 36 }}>
                <div style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: "0.14em",
                  textTransform: "uppercase", color: "var(--muted)",
                  marginBottom: 12, paddingBottom: 12,
                  borderBottom: "1px solid var(--border)",
                }}>
                  {block.label}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingTop: 4 }}>
                  {block.items.map((s) => (
                    <motion.span
                      key={s}
                      whileHover={{ background: "var(--fg)", color: "var(--fg-invert)" }}
                      transition={{ duration: 0.25 }}
                      style={{
                        fontSize: 13, fontWeight: 400, padding: "6px 14px",
                        border: "1px solid var(--border)",
                        cursor: "default", display: "inline-block",
                      }}
                    >
                      {s}
                    </motion.span>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" style={{ padding: "100px 48px 80px", borderTop: "1px solid var(--border)" }}>
        <motion.div initial="hidden" whileInView="visible" viewport={viewportOnce} variants={reveal}>
          <div style={{
            fontSize: "clamp(48px, 7vw, 112px)",
            fontWeight: 700, letterSpacing: "-0.03em", textTransform: "uppercase",
            lineHeight: 1, marginBottom: 52,
          }}>
            Let's Work<br />Together.
          </div>
        </motion.div>
        <motion.div
          initial="hidden" whileInView="visible" viewport={viewportOnce} variants={reveal}
          transition={{ delay: 0.1 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px 24px" }}
        >
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px 28px" }}>
            <motion.a
              href="mailto:lakshhaybedi@gmail.com"
              onMouseEnter={() => setLarge(true)}
              onMouseLeave={() => setLarge(false)}
              whileHover={{ color: "var(--fg)", borderColor: "var(--fg)" }}
              style={{
                fontSize: 20, fontWeight: 400, color: "var(--muted)",
                textDecoration: "none",
                borderBottom: "1px solid var(--border)", paddingBottom: 2,
              }}
            >
              lakshhaybedi@gmail.com
            </motion.a>
            <motion.a
              href="https://www.linkedin.com/in/lakshhaybedi/"
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setLarge(true)}
              onMouseLeave={() => setLarge(false)}
              whileHover={{ color: "var(--fg)", borderColor: "var(--fg)" }}
              style={{
                fontSize: 14, fontWeight: 500, color: "var(--muted)",
                textDecoration: "none", letterSpacing: "0.04em",
                borderBottom: "1px solid var(--border)", paddingBottom: 2,
              }}
            >
              LinkedIn
            </motion.a>
            <motion.a
              href="https://www.behance.net/lakshhaybedi/"
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setLarge(true)}
              onMouseLeave={() => setLarge(false)}
              whileHover={{ color: "var(--fg)", borderColor: "var(--fg)" }}
              style={{
                fontSize: 14, fontWeight: 500, color: "var(--muted)",
                textDecoration: "none", letterSpacing: "0.04em",
                borderBottom: "1px solid var(--border)", paddingBottom: 2,
              }}
            >
              Behance
            </motion.a>
          </div>
          <span style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            © 2026 Lakshhay Bedi
          </span>
        </motion.div>
      </section>

      <PortfolioFolder />
      <WindowManager />
    </>
  );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      style={{
        fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
        textTransform: "uppercase", cursor: "pointer",
        border: `1px solid ${active ? "var(--fg)" : "var(--border)"}`,
        background: active ? "var(--fg)" : "transparent",
        color: active ? "var(--fg-invert)" : "var(--muted)",
        padding: "6px 14px", borderRadius: 999,
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.color = "var(--muted-strong)"; } }}
      onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; } }}
    >
      {children}
    </button>
  );
}
