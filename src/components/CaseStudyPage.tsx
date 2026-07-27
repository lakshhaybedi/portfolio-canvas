"use client";

import { useEffect, useState, useCallback } from "react";
import { CASE_STUDIES, CaseStudy } from "@/lib/caseStudies";

export default function CaseStudyPage({ slug }: { slug: string }) {
  const idx   = CASE_STUDIES.findIndex((c) => c.slug === slug);
  const study = CASE_STUDIES[idx];
  const prev  = idx > 0                       ? CASE_STUDIES[idx - 1] : null;
  const next  = idx < CASE_STUDIES.length - 1 ? CASE_STUDIES[idx + 1] : null;

  const [cursor, setCursor]       = useState({ x: 0, y: 0 });
  const [cursorLarge, setLarge]   = useState(false);
  const [lightbox, setLightbox]   = useState<number | null>(null);
  const [activeScreen, setActive] = useState(0);
  const [navHovered, setNavHov]   = useState<string | null>(null);

  const screens = study?.screens ?? [];

  useEffect(() => {
    if (!study) return;
    let frame: number;
    const move = (e: MouseEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setCursor({ x: e.clientX, y: e.clientY }));
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [study]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.08 }
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

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
        <a href="/" style={{ color: "#888", textDecoration: "none", fontSize: 13 }}>← Back</a>
        <p style={{ marginTop: 40, fontSize: 18 }}>Project not found.</p>
      </div>
    );
  }

  const { accent } = study;

  return (
    <>
      {/* Custom cursor */}
      <div
        className={`cursor-dot${cursorLarge ? " cursor-large" : ""}`}
        style={{ left: cursor.x, top: cursor.y }}
      />

      {/* ── Lightbox ── */}
      {lightbox !== null && (
        <div
          onClick={closeLightbox}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.92)",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "fadeIn 0.2s ease",
          }}
        >
          {lightbox > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); const n = lightbox - 1; setLightbox(n); setActive(n); }}
              style={{
                position: "absolute", left: 32,
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff", width: 48, height: 48, borderRadius: "50%", fontSize: 20,
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "none",
              }}
            >←</button>
          )}

          <div
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "80vw", maxHeight: "85vh", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}
          >
            <img
              src={screens[lightbox].src}
              alt={screens[lightbox].label}
              style={{ maxWidth: "100%", maxHeight: "72vh", objectFit: "contain", borderRadius: 8, boxShadow: "0 40px 120px rgba(0,0,0,0.6)" }}
            />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: accent, marginBottom: 6 }}>
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
                  onClick={(e) => { e.stopPropagation(); setLightbox(i); setActive(i); }}
                  style={{
                    width: i === lightbox ? 20 : 6, height: 6, borderRadius: 3,
                    background: i === lightbox ? accent : "rgba(255,255,255,0.25)",
                    border: "none", cursor: "none", transition: "width 0.25s ease, background 0.2s",
                  }}
                />
              ))}
            </div>
          </div>

          {lightbox < screens.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); const n = lightbox + 1; setLightbox(n); setActive(n); }}
              style={{
                position: "absolute", right: 32,
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff", width: 48, height: 48, borderRadius: "50%", fontSize: 20,
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "none",
              }}
            >→</button>
          )}

          <div style={{
            position: "absolute", top: 24, right: 32,
            fontSize: 11, fontWeight: 600, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
          }}>
            ESC to close
          </div>
        </div>
      )}

      {/* ── Sticky nav ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        display: "grid", gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        padding: "0 48px", height: 64,
        background: "rgba(237,234,212,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
      }}>
        {/* Back */}
        <a
          href="/"
          onMouseEnter={() => setLarge(true)}
          onMouseLeave={() => setLarge(false)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", textDecoration: "none", color: "#111",
            transition: "opacity 0.2s", width: "fit-content",
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = "0.5")}
          onMouseOut={(e)  => (e.currentTarget.style.opacity = "1")}
        >
          ← Back
        </a>

        {/* Project tabs — centred */}
        <div style={{ display: "flex", alignItems: "stretch", height: 64 }}>
          {CASE_STUDIES.map((c) => {
            const isCurrent = c.slug === slug;
            const isHov     = navHovered === c.slug;
            return (
              <a
                key={c.slug}
                href={`/work/${c.slug}`}
                onMouseEnter={() => { setNavHov(c.slug); setLarge(false); }}
                onMouseLeave={() => setNavHov(null)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "0 20px",
                  textDecoration: "none",
                  borderBottom: isCurrent ? `3px solid ${c.accent}` : "3px solid transparent",
                  transition: "border-color 0.25s, background 0.2s",
                  background: isHov && !isCurrent ? "rgba(0,0,0,0.04)" : "transparent",
                  position: "relative",
                }}
              >
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  color: isCurrent ? c.accent : "#bbb",
                  transition: "color 0.2s",
                  letterSpacing: "0.06em",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {c.index}
                </span>
                <span style={{
                  fontSize: 11, fontWeight: isCurrent ? 700 : 500,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  color: isCurrent ? "#111" : isHov ? "#555" : "#999",
                  transition: "color 0.2s",
                  whiteSpace: "nowrap",
                }}>
                  {c.title}
                </span>
              </a>
            );
          })}
        </div>

        {/* Year — right aligned */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", color: "#bbb" }}>
            {study.year}
          </span>
        </div>
      </nav>

      <main style={{ paddingTop: 64, fontFamily: "'Space Grotesk', sans-serif" }}>

        {/* ── Hero ── */}
        <section style={{
          padding: "72px 48px 0",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: accent }} />

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64, alignItems: "flex-end",
          }}>
            {/* Text */}
            <div style={{ paddingBottom: 64 }}>
              <div className="reveal" style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.2em",
                textTransform: "uppercase", color: "#aaa", marginBottom: 24,
              }}>
                Case Study · {study.company} · {study.year}
              </div>
              <h1 className="reveal delay-1" style={{
                fontSize: "clamp(40px, 6vw, 96px)",
                fontWeight: 700, lineHeight: 0.95,
                letterSpacing: "-0.03em", textTransform: "uppercase",
                marginBottom: 32,
              }}>
                {study.title}
              </h1>
              <p className="reveal delay-2" style={{
                fontSize: "clamp(14px, 1.2vw, 18px)",
                fontWeight: 300, lineHeight: 1.8, color: "#555",
              }}>
                {study.overview}
              </p>
            </div>

            {/* Hero image or placeholder */}
            <div className="reveal delay-2" style={{ alignSelf: "flex-end" }}>
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
                  fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "monospace",
                }}>
                  {study.heroUrl ?? `${study.slug}.internal`}
                </div>
              </div>
              {/* Screen or placeholder */}
              <div style={{
                overflow: "hidden",
                boxShadow: "0 32px 80px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.12)",
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
                      color: "rgba(255,255,255,0.2)",
                    }}>
                      Hero screen uploading
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Two-column body ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          alignItems: "start", minHeight: "100vh",
        }}>

          {/* LEFT: narrative */}
          <div style={{ borderRight: "1px solid rgba(0,0,0,0.07)" }}>

            {/* Portfolio slides */}
            {study.slides && study.slides.length > 0 ? (
              <section style={{ padding: "72px 48px", background: "#F7F5EA" }}>
                <div className="reveal" style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.2em",
                  textTransform: "uppercase", color: "#aaa",
                  display: "flex", alignItems: "center", gap: 16, marginBottom: 72,
                }}>
                  The Work
                  <span style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.08)" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 88 }}>
                  {study.slides.map((slide, i) => (
                    <div key={i} className="reveal" style={{ transitionDelay: `${i * 0.06}s` }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 18 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: accent }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#666" }}>
                          {slide.label}
                        </span>
                      </div>
                      <div style={{ borderRadius: 8, overflow: "hidden", boxShadow: "0 24px 72px rgba(0,0,0,0.09), 0 4px 16px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.06)" }}>
                        <img src={slide.src} alt={slide.label} style={{ width: "100%", display: "block" }} />
                      </div>
                      <p style={{ marginTop: 16, fontSize: 14, color: "#666", lineHeight: 1.75, maxWidth: 640 }}>
                        {slide.caption}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              /* Slides placeholder */
              <section style={{ padding: "72px 48px", background: "#F7F5EA" }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.2em",
                  textTransform: "uppercase", color: "#aaa",
                  display: "flex", alignItems: "center", gap: 16, marginBottom: 48,
                }}>
                  The Work
                  <span style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.08)" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div key={n} style={{
                      height: 320, borderRadius: 8,
                      background: `linear-gradient(135deg, rgba(0,0,0,0.04) 0%, ${accent}0a 100%)`,
                      border: "1px dashed rgba(0,0,0,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#ccc" }}>
                          Slide {String(n).padStart(2, "0")} — uploading soon
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Design Decisions */}
            <section style={{ padding: "72px 48px", background: "#111" }}>
              <div className="reveal" style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.2em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
                display: "flex", alignItems: "center", gap: 16, marginBottom: 48,
              }}>
                Design Decisions
                <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {study.decisions.map((d, i) => (
                  <DecisionCard key={i} decision={d} accent={accent} index={i} />
                ))}
              </div>
            </section>

            {/* Outcomes */}
            <section style={{ padding: "72px 48px" }}>
              <div className="reveal" style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.2em",
                textTransform: "uppercase", color: "#aaa",
                display: "flex", alignItems: "center", gap: 16, marginBottom: 48,
              }}>
                Impact
                <span style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.08)" }} />
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 1, border: "1px solid rgba(0,0,0,0.08)",
              }}>
                {study.outcomes.map((o, i) => (
                  <OutcomeCard key={i} outcome={o} accent={accent} index={i} />
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT: sticky screens panel */}
          <div style={{
            position: "sticky", top: 64,
            height: "calc(100vh - 64px)",
            display: "flex", flexDirection: "column",
            padding: "28px 20px", overflowY: "auto",
          }}>
            <div style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "0.18em",
              textTransform: "uppercase", color: "#bbb",
              marginBottom: 16, paddingBottom: 12,
              borderBottom: "1px solid rgba(0,0,0,0.08)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span>Screens</span>
              <span style={{ color: accent }}>{screens.length}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
              {screens.length > 0 ? screens.map((screen, i) => (
                <button
                  key={i}
                  onClick={() => { setLightbox(i); setActive(i); }}
                  style={{ background: "none", border: "none", padding: 0, cursor: "none", textAlign: "left" }}
                >
                  <div style={{
                    borderRadius: 6, overflow: "hidden",
                    border: `2px solid ${activeScreen === i ? accent : "rgba(0,0,0,0.07)"}`,
                    boxShadow: activeScreen === i ? `0 0 0 1px ${accent}22, 0 8px 24px rgba(0,0,0,0.10)` : "0 2px 8px rgba(0,0,0,0.06)",
                    transition: "border-color 0.25s, box-shadow 0.25s",
                  }}>
                    <img
                      src={screen.src} alt={screen.label}
                      style={{ width: "100%", display: "block", opacity: activeScreen === i ? 1 : 0.7, transition: "opacity 0.25s" }}
                    />
                  </div>
                  <div style={{
                    marginTop: 6, fontSize: 9, fontWeight: 700,
                    letterSpacing: "0.12em", textTransform: "uppercase",
                    color: activeScreen === i ? accent : "#aaa", transition: "color 0.25s",
                  }}>
                    {screen.label}
                  </div>
                </button>
              )) : (
                /* Screens placeholder */
                [1, 2, 3].map((n) => (
                  <div key={n} style={{
                    borderRadius: 6, height: 120,
                    background: `linear-gradient(135deg, rgba(0,0,0,0.04) 0%, ${accent}0a 100%)`,
                    border: "1px dashed rgba(0,0,0,0.10)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ccc" }}>
                      Screen {n}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div style={{
              marginTop: 20, paddingTop: 16,
              borderTop: "1px solid rgba(0,0,0,0.07)",
              fontSize: 9, fontWeight: 600, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "#ccc", textAlign: "center",
            }}>
              Click to expand · ← → to navigate
            </div>
          </div>
        </div>

        {/* ── Project navigation ── */}
        <nav style={{
          borderTop: "1px solid rgba(0,0,0,0.08)",
          display: "grid", gridTemplateColumns: "1fr 1fr",
        }}>
          {prev ? (
            <a
              href={`/work/${prev.slug}`}
              onMouseEnter={() => setLarge(true)}
              onMouseLeave={() => setLarge(false)}
              style={{
                display: "block", padding: "48px", textDecoration: "none",
                borderRight: "1px solid rgba(0,0,0,0.08)", transition: "background 0.3s ease",
              }}
              onMouseOver={(e)  => (e.currentTarget.style.background = "#111")}
              onMouseOut={(e)   => (e.currentTarget.style.background = "transparent")}
            >
              <NavCard study={prev} direction="prev" />
            </a>
          ) : <div />}
          {next ? (
            <a
              href={`/work/${next.slug}`}
              onMouseEnter={() => setLarge(true)}
              onMouseLeave={() => setLarge(false)}
              style={{
                display: "block", padding: "48px", textDecoration: "none",
                textAlign: "right", transition: "background 0.3s ease",
              }}
              onMouseOver={(e)  => (e.currentTarget.style.background = "#111")}
              onMouseOut={(e)   => (e.currentTarget.style.background = "transparent")}
            >
              <NavCard study={next} direction="next" />
            </a>
          ) : <div />}
        </nav>
      </main>
    </>
  );
}

function DecisionCard({ decision, accent, index }: {
  decision: CaseStudy["decisions"][0]; accent: string; index: number;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      className="reveal"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "36px 32px",
        background: hov ? "rgba(255,255,255,0.05)" : "transparent",
        borderLeft: `2px solid ${hov ? accent : "rgba(255,255,255,0.06)"}`,
        transition: "background 0.25s, border-color 0.25s",
        transitionDelay: `${index * 0.07}s`,
      }}
    >
      <div style={{
        width: 30, height: 30, borderRadius: "50%", background: accent,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 800, color: "#fff", marginBottom: 18,
      }}>
        {decision.num}
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 600, color: "#fff", marginBottom: 12, lineHeight: 1.3 }}>
        {decision.title}
      </h3>
      <p style={{ fontSize: 14, fontWeight: 300, color: "rgba(255,255,255,0.5)", lineHeight: 1.75 }}>
        {decision.desc}
      </p>
    </div>
  );
}

function OutcomeCard({ outcome, accent, index }: {
  outcome: CaseStudy["outcomes"][0]; accent: string; index: number;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      className="reveal"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "40px 36px",
        borderRight: "1px solid rgba(0,0,0,0.08)",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        background: hov ? "#111" : "transparent",
        transition: "background 0.3s ease",
        transitionDelay: `${index * 0.07}s`,
      }}
    >
      <div style={{
        fontSize: "clamp(28px, 3.5vw, 48px)",
        fontWeight: 700, letterSpacing: "-0.03em",
        color: hov ? accent : "#111", marginBottom: 10, lineHeight: 1,
        transition: "color 0.3s ease",
      }}>
        {outcome.num}
      </div>
      <div style={{
        fontSize: 14, fontWeight: 600,
        color: hov ? "#fff" : "#111", marginBottom: 8, transition: "color 0.3s ease",
      }}>
        {outcome.title}
      </div>
      <p style={{
        fontSize: 13, fontWeight: 300, lineHeight: 1.7,
        color: hov ? "rgba(255,255,255,0.5)" : "#888", transition: "color 0.3s ease",
      }}>
        {outcome.desc}
      </p>
    </div>
  );
}

function NavCard({ study, direction }: { study: CaseStudy; direction: "prev" | "next" }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase",
        color: hov ? "rgba(255,255,255,0.4)" : "#aaa", marginBottom: 12, transition: "color 0.3s",
      }}>
        {direction === "prev" ? "← Previous" : "Next →"}
      </div>
      <div style={{
        fontSize: "clamp(20px, 3vw, 36px)",
        fontWeight: 700, letterSpacing: "-0.02em", textTransform: "uppercase",
        color: hov ? "#fff" : "#111", transition: "color 0.3s", marginBottom: 8,
      }}>
        {study.title}
      </div>
      <div style={{ fontSize: 12, color: hov ? "rgba(255,255,255,0.4)" : "#888", transition: "color 0.3s" }}>
        {study.company} · {study.year}
      </div>
    </div>
  );
}
