"use client";

import { useEffect, useState } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { revealVariant, easeOutExpo } from "@/lib/motion";

/**
 * The DOM overlay above the WebGL canvas: identity block (name/clock/
 * availability — unchanged from the previous hero) plus the headline and
 * subtitle. Animates in independently of the particle system, and
 * fades/slides slightly with the same scroll progress the canvas uses.
 */
export default function HeroContent({
  scrollYProgress,
  reduceMotion,
}: {
  scrollYProgress: MotionValue<number>;
  reduceMotion: boolean | null;
}) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const reveal = revealVariant(!!reduceMotion);

  const contentY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -140]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, reduceMotion ? 1 : 0]);

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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      style={{ position: "relative", zIndex: 1, y: contentY, opacity: contentOpacity }}
    >
      <motion.div
        variants={reveal}
        transition={{ duration: 0.7, ease: easeOutExpo, delay: 0.1 }}
        style={{
          fontSize: 12, fontWeight: 700, letterSpacing: "0.16em",
          textTransform: "uppercase", color: "var(--muted)", marginBottom: 20,
        }}
      >
        Lakshhay Bedi, Senior UX / Product Designer
      </motion.div>

      <motion.h1
        variants={reveal}
        transition={{ duration: 1, ease: easeOutExpo, delay: 0.22 }}
        style={{
          fontSize: "clamp(28px, 3.8vw, 56px)",
          fontWeight: 700, lineHeight: 1.1,
          letterSpacing: "-0.02em", maxWidth: 1000,
          margin: 0,
        }}
      >
        I design complex products<br />people actually have to use.
      </motion.h1>

      <motion.div
        variants={reveal}
        transition={{ duration: 0.8, delay: 0.5 }}
        style={{
          display: "flex", alignItems: "flex-end", justifyContent: "space-between",
          marginTop: 32, gap: 32, flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 460 }}>
          <p style={{
            fontSize: 16, fontWeight: 300, lineHeight: 1.6,
            color: "var(--muted-strong)", margin: 0,
          }}>
            Enterprise platforms, FinTech and healthcare experiences, turning complex workflows, data and edge cases into clear, scalable products.
          </p>
        </div>

        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
          <div style={{
            fontFamily: "'Space Grotesk', monospace",
            fontSize: 13, fontWeight: 500, letterSpacing: "0.05em", color: "var(--muted)",
          }}>
            <span style={{ display: "block" }}>{date}</span>
            <span style={{ display: "block", fontSize: 22, fontWeight: 600, color: "var(--fg)", marginTop: 2 }}>{time}</span>
          </div>
          {/* "Available for work" is a claim with no way to act on it — the
              contact details live a full page away at the bottom. On hover
              the label swaps for the two links that make it actionable,
              in place, without adding permanent clutter to the hero.
              Focus-within (not just hover) so keyboard users get the same
              reveal when they tab into it, and the whole strip stays
              rendered rather than mounting on hover, so the links are
              always reachable by tab order. */}
          <div
            onMouseEnter={() => setContactOpen(true)}
            onMouseLeave={() => setContactOpen(false)}
            onFocus={() => setContactOpen(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setContactOpen(false);
            }}
            style={{
              position: "relative",
              display: "inline-flex", alignItems: "center", gap: 8,
              border: "1px solid var(--border)", padding: "6px 16px",
              fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
              overflow: "hidden",
              transition: reduceMotion ? "none" : "border-color 0.3s ease, background 0.3s ease",
              borderColor: contactOpen ? "var(--border-strong)" : "var(--border)",
              background: contactOpen ? "var(--bg-elevated)" : "transparent",
            }}
          >
            <span style={{
              width: 7, height: 7, background: "#22c55e", borderRadius: "50%", flexShrink: 0,
              animation: reduceMotion ? "none" : "pulse-dot 2s ease-in-out infinite",
            }} />

            {/* Both states occupy the same grid cell, so the badge keeps one
                width and the swap doesn't shove the clock around. */}
            <span style={{ display: "grid" }}>
              <span
                aria-hidden={contactOpen}
                style={{
                  gridArea: "1 / 1", whiteSpace: "nowrap",
                  opacity: contactOpen ? 0 : 1,
                  transform: contactOpen && !reduceMotion ? "translateY(-6px)" : "translateY(0)",
                  transition: reduceMotion ? "none" : "opacity 0.22s ease, transform 0.22s ease",
                  pointerEvents: contactOpen ? "none" : "auto",
                }}
              >
                Available for work
              </span>

              <span
                style={{
                  gridArea: "1 / 1", display: "inline-flex", alignItems: "center", gap: 14,
                  whiteSpace: "nowrap",
                  opacity: contactOpen ? 1 : 0,
                  transform: !contactOpen && !reduceMotion ? "translateY(6px)" : "translateY(0)",
                  transition: reduceMotion ? "none" : "opacity 0.22s ease 0.04s, transform 0.22s ease 0.04s",
                  pointerEvents: contactOpen ? "auto" : "none",
                }}
              >
                <a
                  href="mailto:lakshhaybedi@gmail.com"
                  tabIndex={contactOpen ? 0 : -1}
                  style={{ color: "var(--fg)", textDecoration: "none", borderBottom: "1px solid var(--border-strong)" }}
                >
                  Email
                </a>
                <a
                  href="https://www.linkedin.com/in/lakshhaybedi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={contactOpen ? 0 : -1}
                  style={{ color: "var(--fg)", textDecoration: "none", borderBottom: "1px solid var(--border-strong)" }}
                >
                  LinkedIn ↗
                </a>
              </span>
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
