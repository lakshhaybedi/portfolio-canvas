"use client";

import { useState, useEffect } from "react";
import { CASE_STUDIES } from "@/lib/caseStudies";

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
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [hovered, setHovered] = useState<number | null>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [cursorLarge, setCursorLarge] = useState(false);

  // Live clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }));
      setDate(now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase());
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Cursor tracking
  useEffect(() => {
    let frame: number;
    const move = (e: MouseEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setCursor({ x: e.clientX, y: e.clientY }));
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const setLarge = (v: boolean) => setCursorLarge(v);

  const marqueeItems = [
    "UX Design", "UI Design", "Enterprise", "FinTech", "Healthcare",
    "Design Systems", "Research", "Interaction Design", "Dark Mode", "Multi-market",
  ];

  return (
    <>
      {/* Custom Cursor */}
      <div
        className={`cursor-dot${cursorLarge ? " cursor-large" : ""}`}
        style={{ left: cursor.x, top: cursor.y }}
      />

      {/* ── Navigation ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 48px",
        background: "rgba(237,234,212,0.88)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        animation: "fadeIn 0.8s ease forwards",
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Lakshhay Bedi
        </span>
        <ul style={{ display: "flex", gap: 36, listStyle: "none" }}>
          {["Work", "About", "Contact"].map((link) => (
            <li key={link}>
              <a
                href={`#${link.toLowerCase()}`}
                onMouseEnter={() => setLarge(true)}
                onMouseLeave={() => setLarge(false)}
                style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: "0.12em",
                  textTransform: "uppercase", textDecoration: "none", color: "#111",
                  transition: "opacity 0.2s",
                }}
              >
                {link}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        position: "relative", height: "100vh", minHeight: 700,
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
        padding: "0 48px 52px", overflow: "hidden",
      }}>
        {/* Grid lines */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          backgroundImage: `repeating-linear-gradient(
            to right,
            transparent,
            transparent calc(14.285% - 1px),
            rgba(0,0,0,0.055) calc(14.285% - 1px),
            rgba(0,0,0,0.055) 14.285%
          )`,
          animation: "fadeIn 1.2s ease forwards",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            fontSize: "clamp(80px, 12vw, 178px)",
            fontWeight: 700, lineHeight: 0.92,
            letterSpacing: "-0.03em", textTransform: "uppercase",
            opacity: 0,
            animation: "fadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.15s forwards",
          }}>
            <span style={{ display: "block" }}>Lakshhay</span>
            <span style={{ display: "block" }}>Bedi</span>
          </div>

          <div style={{
            display: "flex", alignItems: "flex-end", justifyContent: "space-between",
            marginTop: 32, opacity: 0,
            animation: "fadeUp 0.8s ease 0.55s forwards",
          }}>
            <div>
              <p style={{
                fontSize: 13, fontWeight: 400, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "#888",
                lineHeight: 1.8, maxWidth: 520,
              }}>
                Senior UX Designer — Enterprise · FinTech · Healthcare<br />
                Designing systems that hold up under real-world pressure.
              </p>
            </div>
            <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
              <div style={{
                fontFamily: "'Space Grotesk', monospace",
                fontSize: 13, fontWeight: 500, letterSpacing: "0.05em", color: "#888",
              }}>
                <span style={{ display: "block" }}>{date}</span>
                <span style={{ display: "block", fontSize: 22, fontWeight: 600, color: "#111", marginTop: 2 }}>{time}</span>
              </div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                border: "1px solid rgba(0,0,0,0.12)", padding: "6px 16px",
                fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
              }}>
                <span style={{
                  width: 7, height: 7, background: "#22c55e", borderRadius: "50%",
                  animation: "pulse-dot 2s ease-in-out infinite",
                }} />
                Available for work
              </div>
            </div>
          </div>
        </div>

        <div style={{
          position: "absolute", bottom: 52, left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          fontSize: 10, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#888",
          opacity: 0, animation: "fadeIn 1s ease 1.1s forwards", zIndex: 1,
        }}>
          <span style={{ animation: "bounce 1.6s ease-in-out infinite", display: "block" }}>↓</span>
          Scroll
        </div>
      </section>

      {/* ── Marquee ── */}
      <div style={{
        overflow: "hidden",
        borderTop: "1px solid rgba(0,0,0,0.1)",
        borderBottom: "1px solid rgba(0,0,0,0.1)",
        padding: "14px 0",
        background: "#111",
      }}>
        <div style={{ display: "flex", whiteSpace: "nowrap", animation: "marquee 20s linear infinite" }}>
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
        </div>
      </div>

      {/* ── Work ── */}
      <section id="work" style={{ padding: "100px 48px" }}>
        <div className="reveal" style={{ marginBottom: 48 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, letterSpacing: "0.14em",
            textTransform: "uppercase", color: "#888",
            display: "flex", alignItems: "center", gap: 16,
          }}>
            Selected Work
            <span style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.1)", display: "block" }} />
          </span>
        </div>

        <div style={{ borderTop: "1px solid rgba(0,0,0,0.1)" }}>
          {PROJECTS.map((p, i) => (
            <div
              key={i}
              className="reveal"
              style={{ transitionDelay: `${i * 0.1}s` }}
              onMouseEnter={() => { setHovered(i); setLarge(false); }}
              onMouseLeave={() => { setHovered(null); setLarge(false); }}
              onClick={() => { window.location.href = `/work/${p.slug}`; }}
            >
              <div style={{
                borderBottom: "1px solid rgba(0,0,0,0.1)",
                padding: "28px 0",
                cursor: "none",
                background: hovered === i ? "#111" : "transparent",
                transition: "background 0.5s cubic-bezier(0.16,1,0.3,1)",
              }}>
                {/* Row header */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "60px 1fr auto auto",
                  alignItems: "center", gap: 24,
                }}>
                  <span style={{
                    fontSize: 12, fontWeight: 500, letterSpacing: "0.05em",
                    color: hovered === i ? "rgba(237,234,212,0.4)" : "#888",
                    transition: "color 0.4s ease",
                  }}>
                    {p.num}
                  </span>

                  <div>
                    <div style={{
                      fontSize: "clamp(26px, 3.5vw, 54px)",
                      fontWeight: 700, letterSpacing: "-0.02em", textTransform: "uppercase",
                      lineHeight: 1, marginBottom: 5,
                      color: hovered === i ? "#EDEAD4" : "#111",
                      transition: "color 0.4s ease",
                    }}>
                      {p.title}
                    </div>
                    <div style={{
                      fontSize: 13,
                      color: hovered === i ? "rgba(237,234,212,0.5)" : "#888",
                      transition: "color 0.4s ease",
                    }}>
                      {p.company}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {p.tags.map((tag) => (
                      <span key={tag} style={{
                        fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        border: `1px solid ${hovered === i ? "rgba(237,234,212,0.2)" : "rgba(0,0,0,0.12)"}`,
                        padding: "4px 12px",
                        color: hovered === i ? "rgba(237,234,212,0.65)" : "#555",
                        transition: "all 0.4s ease",
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div style={{
                    fontSize: 13, textAlign: "right",
                    color: hovered === i ? "rgba(237,234,212,0.45)" : "#888",
                    transition: "color 0.4s ease",
                    display: "flex", alignItems: "center", gap: 16,
                  }}>
                    <span>{p.year}</span>
                    <span style={{
                      fontSize: 22,
                      transform: hovered === i ? "translate(3px,-3px)" : "translate(0,0)",
                      transition: "transform 0.3s ease",
                      color: hovered === i ? "rgba(237,234,212,0.6)" : "#888",
                    }}>↗</span>
                  </div>
                </div>

                {/* Expandable description */}
                <div style={{
                  maxHeight: hovered === i ? 120 : 0,
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
                  {hovered === i && (
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      marginTop: 8, marginBottom: 4,
                      fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: CASE_STUDIES.find((c) => c.slug === p.slug)?.accent ?? "#888",
                    }}>
                      View case study →
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── View in Canvas ── */}
      <section
        className="reveal"
        style={{
          margin: "0 48px",
          borderRadius: 16,
          overflow: "hidden",
          background: "#111",
          position: "relative",
        }}
      >
        {/* dot grid */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />

        <div style={{
          position: "relative", zIndex: 1,
          padding: "72px 64px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 48,
        }}>
          <div>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
              textTransform: "uppercase", color: "rgba(237,234,212,0.3)",
              marginBottom: 18,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontSize: 14 }}>◈</span> Interactive Canvas
            </div>
            <div style={{
              fontSize: "clamp(32px, 4.5vw, 64px)",
              fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.05,
              color: "#EDEAD4", marginBottom: 20,
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

          <a
            href="/canvas"
            onMouseEnter={() => setLarge(false)}
            style={{
              flexShrink: 0,
              display: "inline-flex", alignItems: "center", gap: 12,
              padding: "18px 36px",
              background: "#EDEAD4", color: "#111",
              fontSize: 13, fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", textDecoration: "none",
              borderRadius: 8,
              transition: "opacity 0.2s, transform 0.2s",
              whiteSpace: "nowrap",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "0.88";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "1";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            Open Canvas
            <span style={{ fontSize: 18, fontWeight: 400, lineHeight: 1 }}>↗</span>
          </a>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" style={{ padding: "100px 48px", borderTop: "1px solid rgba(0,0,0,0.08)" }}>
        <div className="reveal" style={{ marginBottom: 64 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, letterSpacing: "0.14em",
            textTransform: "uppercase", color: "#888",
            display: "flex", alignItems: "center", gap: 16,
          }}>
            About Me
            <span style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.1)", display: "block" }} />
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80 }}>
          <div className="reveal delay-1">
            <p style={{ fontSize: 22, fontWeight: 300, lineHeight: 1.7, letterSpacing: "-0.01em" }}>
              I'm a <strong style={{ fontWeight: 600 }}>Senior UX Designer</strong> focused on complex systems — dashboards, financial products, and regulated workflows where the stakes are high and the edge cases are endless.
            </p>
            <p style={{ fontSize: 22, fontWeight: 300, lineHeight: 1.7, letterSpacing: "-0.01em", marginTop: 24 }}>
              My work spans enterprise B2B, financial services across Africa, and health insurance infrastructure. I design for users who are under pressure, not just users who are browsing.
            </p>
            <p style={{ fontSize: 14, color: "#888", lineHeight: 1.7, marginTop: 32, fontWeight: 400, letterSpacing: "0.01em" }}>
              Full process: research → flow architecture → high-fidelity UI → design system contribution.
            </p>
          </div>

          <div className="reveal delay-2">
            {[
              { label: "Tools", items: ["Figma", "FigJam", "Zeplin", "Maze", "Hotjar", "Miro", "JIRA", "Confluence"] },
              { label: "Domains", items: ["Enterprise B2B", "FinTech", "Healthcare", "Multi-market", "Design Systems"] },
              { label: "Capabilities", items: ["User Research", "Information Architecture", "UX Design", "UI Design", "Prototyping", "Responsive Design"] },
            ].map((block) => (
              <div key={block.label} style={{ marginBottom: 36 }}>
                <div style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: "0.14em",
                  textTransform: "uppercase", color: "#888",
                  marginBottom: 12, paddingBottom: 12,
                  borderBottom: "1px solid rgba(0,0,0,0.08)",
                }}>
                  {block.label}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingTop: 4 }}>
                  {block.items.map((s) => (
                    <span
                      key={s}
                      style={{
                        fontSize: 13, fontWeight: 400, padding: "6px 14px",
                        border: "1px solid rgba(0,0,0,0.12)",
                        transition: "background 0.25s, color 0.25s",
                        cursor: "default",
                      }}
                      onMouseOver={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "#111";
                        (e.currentTarget as HTMLElement).style.color = "#EDEAD4";
                      }}
                      onMouseOut={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "#111";
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" style={{ padding: "100px 48px 80px", borderTop: "1px solid rgba(0,0,0,0.08)" }}>
        <div className="reveal">
          <div style={{
            fontSize: "clamp(48px, 7vw, 112px)",
            fontWeight: 700, letterSpacing: "-0.03em", textTransform: "uppercase",
            lineHeight: 1, marginBottom: 52,
          }}>
            Let's Work<br />Together.
          </div>
        </div>
        <div className="reveal delay-1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a
            href="mailto:lakshhay@example.com"
            onMouseEnter={() => setLarge(true)}
            onMouseLeave={() => setLarge(false)}
            style={{
              fontSize: 20, fontWeight: 400, color: "#888",
              textDecoration: "none",
              borderBottom: "1px solid rgba(0,0,0,0.12)", paddingBottom: 2,
              transition: "color 0.2s, border-color 0.2s",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#111";
              (e.currentTarget as HTMLElement).style.borderColor = "#111";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#888";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,0,0,0.12)";
            }}
          >
            lakshhay@example.com
          </a>
          <span style={{ fontSize: 11, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            © 2024 Lakshhay Bedi
          </span>
        </div>
      </section>
    </>
  );
}
