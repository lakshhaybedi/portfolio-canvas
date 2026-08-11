"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, useAnimationControls, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { CASE_STUDIES } from "@/lib/caseStudies";
import { SERVICES } from "@/lib/services";
import { TOOL_GROUPS } from "@/lib/tools";
import ToolIcon from "@/components/ToolIcon";
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
//
// Filtered to `featured` so this list stays a curated handful rather than
// growing with every new case study — a project with `featured: false`
// still gets its own /work/[slug] page, it just surfaces on /other-work's
// "More Case Studies" list instead of here.
const PROJECTS = CASE_STUDIES.filter((c) => c.featured).map((c) => ({
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

// Services split into two reading-order columns (left: 1-4, right: 5-7)
// rather than a CSS grid's row-major pairing, so opening one item never
// changes the row height of its unrelated neighbour in the other column.
const SERVICES_SPLIT = Math.ceil(SERVICES.length / 2);
const SERVICES_LEFT = SERVICES.slice(0, SERVICES_SPLIT);
const SERVICES_RIGHT = SERVICES.slice(SERVICES_SPLIT);

export default function Portfolio() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeService, setActiveService] = useState<string | null>(null);
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

  // Gate the custom cursor to fine-pointer devices only. Cleanup removes the
  // class on unmount so navigating to a page without a custom cursor (e.g.
  // /services, /other-work) doesn't inherit `cursor: none` with nothing to
  // replace it, leaving the pointer invisible there.
  useEffect(() => {
    document.body.classList.toggle("has-fine-pointer", isFinePointer);
    return () => document.body.classList.remove("has-fine-pointer");
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
          {[
            { label: "Work", href: "#work" },
            { label: "Services", href: "#services" },
            { label: "About", href: "#about" },
            { label: "Contact", href: "#contact" },
          ].map((link) => (
            <li key={link.label}>
              <motion.a
                href={link.href}
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
                {link.label}
              </motion.a>
            </li>
          ))}
        </ul>
      </motion.nav>

      <main id="main-content">
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
          {/* Real <h2>, not a styled span: the page previously shipped a
              single heading in total (the hero h1), so screen-reader users
              had no heading outline to navigate by and search engines saw a
              flat wall of divs. The visual result is unchanged — the global
              reset already zeroes heading margins, and every type property
              here is explicit. */}
          <h2 style={{
            fontSize: 11, fontWeight: 600, letterSpacing: "0.14em",
            textTransform: "uppercase", color: "var(--muted)",
            display: "flex", alignItems: "center", gap: 16,
          }}>
            Selected Work
            <span style={{ flex: 1, height: 1, background: "var(--border)", display: "block" }} />
          </h2>
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
                      <h3 style={{
                        fontSize: "clamp(26px, 3.5vw, 54px)",
                        fontWeight: 700, letterSpacing: "-0.02em", textTransform: "uppercase",
                        lineHeight: 1, marginBottom: 5,
                        color: isOpen ? p.heroColor : "rgba(237,234,212,0.9)",
                        transition: "color 0.4s ease",
                      }}>
                        {p.title}
                      </h3>
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

        <div style={{ paddingTop: 32, textAlign: "center" }}>
          <Link
            href="/other-work"
            onMouseEnter={() => setLarge(true)}
            onMouseLeave={() => setLarge(false)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontSize: 12, fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", textDecoration: "none",
              color: "var(--muted-strong)",
              borderBottom: "1px solid var(--border-strong)",
              paddingBottom: 3,
            }}
          >
            See more work <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* ── View in Canvas ── */}
      <motion.section
        className="canvas-cta-section"
        initial="hidden" whileInView="visible" viewport={viewportOnce} variants={reveal}
        style={{
          // This is a bordered, elevated card, not a full-bleed section, so
          // it needs to sit off its neighbours rather than butt against the
          // last project row above and the About rule below. The surrounding
          // sections deliberately contribute no padding here (see Work's
          // zeroed bottom), so this margin is the single place the card's
          // outer spacing is defined — kept below the horizontal 48px since
          // vertical space compounds with the card's own inner padding.
          margin: "40px 48px",
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
          padding: "56px 64px",
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
              Pan, zoom, and arrange the project work spatially, on a Figma-style infinite board built into this portfolio.
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

      {/* ── Services ── */}
      <section id="services" style={{ padding: "80px 48px 0" }}>
        <motion.div
          initial="hidden" whileInView="visible" viewport={viewportOnce} variants={reveal}
          style={{ marginBottom: 40 }}
        >
          <h2 style={{
            fontSize: 11, fontWeight: 600, letterSpacing: "0.14em",
            textTransform: "uppercase", color: "var(--muted)",
            display: "flex", alignItems: "center", gap: 16,
          }}>
            Services
            <span style={{ flex: 1, height: 1, background: "var(--border)", display: "block" }} />
          </h2>
        </motion.div>

        <div
          style={{ display: "flex", gap: 64, flexWrap: "wrap" }}
          onMouseLeave={() => setActiveService(null)}
        >
          <div style={{ flex: "1 1 360px", minWidth: 0 }}>
            {SERVICES_LEFT.map((service, i) => (
              <ServiceRow
                key={service.slug}
                service={service}
                num={i + 1}
                isActive={activeService === service.slug}
                dim={activeService !== null && activeService !== service.slug}
                delay={i * 0.05}
                reduceMotion={!!reduceMotion}
                isFinePointer={isFinePointer}
                onActivate={() => setActiveService(service.slug)}
                onToggle={() => setActiveService((s) => (s === service.slug ? null : service.slug))}
                onLinkHoverChange={setLarge}
              />
            ))}
          </div>
          <div style={{ flex: "1 1 360px", minWidth: 0 }}>
            {SERVICES_RIGHT.map((service, i) => (
              <ServiceRow
                key={service.slug}
                service={service}
                num={SERVICES_LEFT.length + i + 1}
                isActive={activeService === service.slug}
                dim={activeService !== null && activeService !== service.slug}
                delay={i * 0.05}
                reduceMotion={!!reduceMotion}
                isFinePointer={isFinePointer}
                onActivate={() => setActiveService(service.slug)}
                onToggle={() => setActiveService((s) => (s === service.slug ? null : service.slug))}
                onLinkHoverChange={setLarge}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      {/* Top padding is deliberately well under the site's usual 100px
          section rhythm: the canvas card above already contributes 56px of
          inner padding plus a 40px bottom margin, and at the full 100px all
          three stacked into a conspicuous void between the card's last line
          of copy and this heading. Bottom stays 100px — it faces Contact
          directly, with nothing else contributing space. */}
      <section id="about" style={{ padding: "48px 48px 100px", borderTop: "1px solid var(--border)" }}>
        <motion.div
          initial="hidden" whileInView="visible" viewport={viewportOnce} variants={reveal}
          style={{ marginBottom: 64 }}
        >
          <h2 style={{
            fontSize: 11, fontWeight: 600, letterSpacing: "0.14em",
            textTransform: "uppercase", color: "var(--muted)",
            display: "flex", alignItems: "center", gap: 16,
          }}>
            About Me
            <span style={{ flex: 1, height: 1, background: "var(--border)", display: "block" }} />
          </h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 80 }}>
          <motion.div
            initial="hidden" whileInView="visible" viewport={viewportOnce} variants={reveal}
            transition={{ delay: 0.1 }}
          >
            <p style={{ fontSize: 22, fontWeight: 300, lineHeight: 1.7, letterSpacing: "-0.01em" }}>
              I'm a <strong style={{ fontWeight: 600 }}>Senior UX Designer</strong> focused on complex products: enterprise platforms, FinTech and healthcare experiences where the stakes are high and the edge cases are endless.
            </p>
            <p style={{ fontSize: 22, fontWeight: 300, lineHeight: 1.7, letterSpacing: "-0.01em", marginTop: 24 }}>
              I enjoy the problems most designers avoid: complex workflows, information architecture, and the systems and interaction design that hold them together. The philosophy underneath all of it is simple. Design clear experiences for people who need to accomplish something important.
            </p>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7, marginTop: 32, fontWeight: 400, letterSpacing: "0.01em" }}>
              Full process: research → flow architecture → high-fidelity UI → design system contribution.
            </p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={viewportOnce} variants={reveal}
            transition={{ delay: 0.2 }}
          >
            {/* What I Bring — leads the right column so capability reads
                before tooling, per the "capabilities first, tools second"
                hierarchy below. Kept to one short sentence per item rather
                than a separate dedicated section, so it stays compact. */}
            <div style={{ marginBottom: 36 }}>
              <div style={{
                fontSize: 11, fontWeight: 600, letterSpacing: "0.14em",
                textTransform: "uppercase", color: "var(--muted)",
                marginBottom: 16, paddingBottom: 12,
                borderBottom: "1px solid var(--border)",
              }}>
                What I Bring
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { label: "Product thinking", desc: "Turning ambiguous requirements into coherent product experiences." },
                  { label: "Systems thinking", desc: "Creating scalable patterns across complex platforms." },
                  { label: "Interaction design", desc: "Designing states, transitions and behaviors, not just screens." },
                  { label: "Enterprise UX", desc: "Working within technical, organizational and regulatory constraints." },
                  { label: "Design systems", desc: "Creating reusable foundations that scale beyond one feature." },
                ].map((c) => (
                  <div key={c.label}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "var(--fg)", marginBottom: 2 }}>
                      {c.label}
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 300, color: "var(--muted-strong)", lineHeight: 1.6, margin: 0 }}>
                      {c.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 36 }}>
              <div style={{
                fontSize: 11, fontWeight: 600, letterSpacing: "0.14em",
                textTransform: "uppercase", color: "var(--muted)",
                marginBottom: 12, paddingBottom: 12,
                borderBottom: "1px solid var(--border)",
              }}>
                Domains
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingTop: 4 }}>
                {["Enterprise B2B", "FinTech", "Healthcare", "Multi-market", "Design Systems"].map((s) => (
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

            {/* Tools — resting state (border, muted label, no icon) is
                unchanged from the plain pill above; hovering reveals each
                tool's own mark in its real brand color instead of a generic
                invert, so "Figma" reads as Figma-orange, not just bold. CSS
                hover (not framer's whileHover) drives the reveal here since
                the icon needs to animate in as a distinct child element
                rather than the pill's own background/color interpolating. */}
            {TOOL_GROUPS.map((group) => (
              <div key={group.label} style={{ marginBottom: 36, opacity: 0.8 }}>
                <div style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: "0.14em",
                  textTransform: "uppercase", color: "var(--muted)",
                  marginBottom: 12, paddingBottom: 12,
                  borderBottom: "1px solid var(--border)",
                }}>
                  {group.label}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingTop: 4 }}>
                  {group.tools.map((tool) => (
                    <span
                      key={tool.name}
                      className="tool-pill"
                      style={{ "--tool-color": tool.color } as React.CSSProperties}
                    >
                      <span className="tool-icon"><ToolIcon tool={tool} size={13} /></span>
                      {tool.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <style jsx>{`
              .tool-pill {
                display: inline-flex;
                align-items: center;
                font-size: 12px;
                font-weight: 400;
                padding: 5px 12px;
                border: 1px solid var(--border);
                cursor: default;
                transition: border-color 0.25s ease, background 0.25s ease, color 0.25s ease;
              }
              .tool-pill:hover {
                border-color: var(--tool-color);
                background: color-mix(in srgb, var(--tool-color) 16%, transparent);
                color: var(--fg);
              }
              .tool-icon {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 0;
                opacity: 0;
                overflow: hidden;
                transition: width 0.25s ease, opacity 0.2s ease, margin-right 0.25s ease;
              }
              .tool-pill:hover .tool-icon {
                width: 15px;
                opacity: 1;
                margin-right: 6px;
              }
            `}</style>
          </motion.div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" style={{ padding: "100px 48px 80px", borderTop: "1px solid var(--border)" }}>
        <motion.div initial="hidden" whileInView="visible" viewport={viewportOnce} variants={reveal}>
          <h2 style={{
            fontSize: "clamp(48px, 7vw, 112px)",
            fontWeight: 700, letterSpacing: "-0.03em", textTransform: "uppercase",
            lineHeight: 1, marginBottom: 20,
          }}>
            Let&apos;s design<br />something useful.
          </h2>
          <p style={{
            fontSize: 16, fontWeight: 300, color: "var(--muted-strong)",
            marginBottom: 52, maxWidth: 640,
          }}>
            Open to conversations about Senior UX / Product Design opportunities.
          </p>
        </motion.div>
        <motion.div
          initial="hidden" whileInView="visible" viewport={viewportOnce} variants={reveal}
          transition={{ delay: 0.1 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px 24px" }}
        >
          {/* Three links that were each styled differently: the email (the
              primary action) was the *dimmest* of the three at --muted while
              the secondary profile links sat brighter at --muted-strong, and
              tracking ran 0 / 0.04em / 0.08em across the row with no system
              behind it. Now there are two deliberate tiers — the email reads
              as the CTA, the profiles share the site's standard small-label
              idiom (uppercase, 700, 0.1em) used in the nav and every section
              header. Bumping the email to --fg also lifts it clear of the
              4.5:1 contrast floor, which --muted at 0.6 alpha was under. */}
          <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "10px 28px" }}>
            <motion.a
              href="mailto:lakshhaybedi@gmail.com"
              onMouseEnter={() => setLarge(true)}
              onMouseLeave={() => setLarge(false)}
              whileHover={{ borderColor: "var(--fg)" }}
              style={{
                fontSize: 20, fontWeight: 500, color: "var(--fg)",
                letterSpacing: "-0.01em", textDecoration: "none",
                borderBottom: "1px solid var(--border-strong)", paddingBottom: 3,
              }}
            >
              lakshhaybedi@gmail.com
            </motion.a>
            {[
              { label: "LinkedIn", href: "https://www.linkedin.com/in/lakshhaybedi/" },
              { label: "Behance", href: "https://www.behance.net/lakshhaybedi/" },
            ].map((link) => (
              <motion.a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setLarge(true)}
                onMouseLeave={() => setLarge(false)}
                whileHover={{ color: "var(--fg)", borderColor: "var(--fg)" }}
                style={{
                  fontSize: 11, fontWeight: 700, color: "var(--muted-strong)",
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  textDecoration: "none",
                  borderBottom: "1px solid var(--border)", paddingBottom: 3,
                }}
              >
                {link.label} ↗
              </motion.a>
            ))}
          </div>
          <span style={{
            fontSize: 11, fontWeight: 600, color: "var(--muted)",
            letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            © 2026 Lakshhay Bedi
          </span>
        </motion.div>
      </section>
      </main>

      <PortfolioFolder />
      <WindowManager />
    </>
  );
}

function ServiceRow({
  service, num, isActive, dim, delay, reduceMotion, isFinePointer, onActivate, onToggle, onLinkHoverChange,
}: {
  service: { slug: string; title: string; description: string; proofLabel: string; proofHref: string };
  num: number;
  isActive: boolean;
  dim: boolean;
  delay: number;
  reduceMotion: boolean;
  isFinePointer: boolean;
  onActivate: () => void;
  onToggle: () => void;
  onLinkHoverChange: (large: boolean) => void;
}) {
  return (
    <motion.div
      initial="hidden" whileInView="visible" viewport={viewportOnce} variants={revealVariant(reduceMotion)}
      transition={{ delay }}
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <button
        onMouseEnter={onActivate}
        onFocus={onActivate}
        onClick={onToggle}
        aria-expanded={isActive}
        style={{
          width: "100%", display: "flex", alignItems: "baseline", gap: 16,
          padding: "20px 0", background: "none", border: "none",
          textAlign: "left", cursor: isFinePointer ? "none" : "pointer", fontFamily: "inherit",
        }}
      >
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
          color: "var(--muted)", minWidth: 24, flexShrink: 0,
        }}>
          {String(num).padStart(2, "0")}
        </span>
        <h3 style={{
          fontSize: isActive ? "clamp(18px, 2vw, 24px)" : "clamp(15px, 1.5vw, 18px)",
          fontWeight: 700, letterSpacing: "-0.01em", textTransform: "uppercase",
          lineHeight: 1.15,
          color: dim ? "var(--muted)" : "var(--fg)",
          transition: reduceMotion ? "none" : "color 0.3s ease, font-size 0.3s ease",
        }}>
          {service.title}
        </h3>
      </button>

      <motion.div
        initial={false}
        animate={{ height: isActive ? "auto" : 0, opacity: isActive ? 1 : 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.32, ease: "easeInOut" }}
        style={{ overflow: "hidden" }}
      >
        <div style={{ paddingBottom: 24, paddingLeft: 40 }}>
          <p style={{ fontSize: 13, fontWeight: 300, color: "var(--muted-strong)", lineHeight: 1.7, marginBottom: 14 }}>
            {service.description}
          </p>
          <Link
            href={service.proofHref}
            onMouseEnter={() => onLinkHoverChange(true)}
            onMouseLeave={() => onLinkHoverChange(false)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
              textTransform: "uppercase", color: "var(--fg)",
              textDecoration: "none", borderBottom: "1px solid var(--border-strong)",
              paddingBottom: 2,
            }}
          >
            {service.proofLabel} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </motion.div>
    </motion.div>
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
