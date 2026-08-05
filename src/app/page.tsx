"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useReducedMotion, useAnimationControls, useScroll, useTransform } from "framer-motion";
import { CASE_STUDIES } from "@/lib/caseStudies";
import { revealVariant, viewportOnce, easeOutExpo } from "@/lib/motion";
import { useHasFinePointer } from "@/lib/useHasFinePointer";
import { useHeroScrollProgress } from "@/components/hero/ScrollController";
import HeroContent from "@/components/hero/HeroContent";
import PortfolioFolder from "@/components/folder/PortfolioFolder";
import WindowManager from "@/components/windows/WindowManager";

// Three.js/WebGL needs a real browser context — never render during
// Next's static-export prerender.
const ParticleBackground = dynamic(() => import("@/components/hero/ParticleBackground"), { ssr: false });

const PROJECTS = [
  {
    slug: "t-cloud",
    num: "01",
    title: "T-Cloud Dashboard",
    company: "T-Mobile & MAIA",
    tags: ["Enterprise B2B", "Web & Tablet", "Dashboard"],
    year: "2024",
    desc: "Enterprise cloud infrastructure dashboard for T-Mobile's internal operations teams. Translates high-density monitoring data into a composable, role-specific interface across web and tablet — dark and light mode.",
  },
  {
    slug: "standard-bank",
    num: "02",
    title: "Standard Bank",
    company: "Standard Bank Africa",
    tags: ["FinTech", "Mobile", "Multi-Market"],
    year: "2024",
    desc: "Cross-border mobile wallet flows for Standard Bank across Uganda, Ghana, Lesotho, and 4 other African markets. Operator-aware selection (MTN, Vodafone Cash, AirtelTigo) with fee transparency before commit.",
  },
  {
    slug: "elevance-health",
    num: "03",
    title: "Find Care Experience",
    company: "Elevance Health",
    tags: ["Healthcare", "Web App", "Appointment Flow"],
    year: "2023",
    desc: "Redesigned the Find Care experience for Anthem members — provider search, scheduling, rescheduling, cancellation, and Get Care Now — using progressive disclosure, contextual actions, and a unified care pathway.",
  },
];

export default function Portfolio() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [cursorLarge, setCursorLarge] = useState(false);

  const reduceMotion = useReducedMotion();
  const isFinePointer = useHasFinePointer();
  const marqueeControls = useAnimationControls();
  const reveal = revealVariant(!!reduceMotion);

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
          background: "rgba(10,10,10,0.75)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Lakshhay Bedi
        </span>
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
        <HeroContent scrollYProgress={heroProgress} reduceMotion={reduceMotion} setLarge={setLarge} />

        <motion.div
          className="hero-scroll-cue"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.1 }}
          style={{
            position: "absolute", bottom: 52, left: "50%", transform: "translateX(-50%)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            fontSize: 10, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted)",
            zIndex: 1,
          }}
        >
          <span style={{ animation: reduceMotion ? "none" : "bounce 1.6s ease-in-out infinite", display: "block" }}>↓</span>
          Scroll
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
      <section id="work" style={{ padding: "100px 48px" }}>
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

        <div style={{ borderTop: "1px solid var(--border)" }}>
          {PROJECTS.map((p, i) => {
            const isOpen = hovered === i;
            return (
              <motion.div
                key={i}
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
                        color: isOpen ? "#EDEAD4" : "rgba(237,234,212,0.9)",
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
                    maxHeight: isOpen ? 140 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.55s cubic-bezier(0.16,1,0.3,1)",
                    paddingLeft: 84,
                  }}>
                    <p style={{
                      fontSize: 14, fontWeight: 300, lineHeight: 1.7,
                      color: "rgba(237,234,212,0.72)",
                      paddingTop: 16, paddingRight: 120,
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
      <section id="about" style={{ padding: "100px 48px", borderTop: "1px solid var(--border)" }}>
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
          <motion.a
            href="mailto:lakshhay@example.com"
            onMouseEnter={() => setLarge(true)}
            onMouseLeave={() => setLarge(false)}
            whileHover={{ color: "var(--fg)", borderColor: "var(--fg)" }}
            style={{
              fontSize: 20, fontWeight: 400, color: "var(--muted)",
              textDecoration: "none",
              borderBottom: "1px solid var(--border)", paddingBottom: 2,
            }}
          >
            lakshhay@example.com
          </motion.a>
          <span style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            © 2024 Lakshhay Bedi
          </span>
        </motion.div>
      </section>

      <PortfolioFolder />
      <WindowManager />
    </>
  );
}
