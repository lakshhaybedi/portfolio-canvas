"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { revealVariant, easeOutExpo } from "@/lib/motion";

/**
 * The DOM overlay above the WebGL canvas: identity block (name/clock/
 * availability — unchanged from the previous hero) plus the new headline,
 * subtitle, and CTA. Animates in independently of the particle system, and
 * fades/slides slightly with the same scroll progress the canvas uses.
 */
export default function HeroContent({
  scrollYProgress,
  reduceMotion,
  setLarge,
}: {
  scrollYProgress: MotionValue<number>;
  reduceMotion: boolean | null;
  setLarge: (v: boolean) => void;
}) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
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
        Lakshhay Bedi — Senior UX Designer
      </motion.div>

      <motion.h1
        variants={reveal}
        transition={{ duration: 1, ease: easeOutExpo, delay: 0.22 }}
        style={{
          fontSize: "clamp(40px, 6vw, 92px)",
          fontWeight: 700, lineHeight: 1.02,
          letterSpacing: "-0.02em", maxWidth: 900,
          margin: 0,
        }}
      >
        Designing products that feel magical.
      </motion.h1>

      <motion.div
        variants={reveal}
        transition={{ duration: 0.8, delay: 0.5 }}
        style={{
          display: "flex", alignItems: "flex-end", justifyContent: "space-between",
          marginTop: 32, gap: 32, flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: 28, flexWrap: "wrap" }}>
          <p style={{
            fontSize: 16, fontWeight: 300, lineHeight: 1.6,
            color: "var(--muted-strong)", maxWidth: 440, margin: 0,
          }}>
            UX Designer crafting premium digital experiences through interaction, motion and systems thinking.
          </p>

          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="#work"
              onMouseEnter={() => setLarge(true)}
              onMouseLeave={() => setLarge(false)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "14px 28px",
                background: "var(--fg)", color: "var(--fg-invert)",
                fontSize: 12, fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", textDecoration: "none",
                borderRadius: 8, whiteSpace: "nowrap",
              }}
            >
              View Projects
              <span style={{ fontSize: 16, fontWeight: 400, lineHeight: 1 }}>↗</span>
            </Link>
          </motion.div>
        </div>

        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
          <div style={{
            fontFamily: "'Space Grotesk', monospace",
            fontSize: 13, fontWeight: 500, letterSpacing: "0.05em", color: "var(--muted)",
          }}>
            <span style={{ display: "block" }}>{date}</span>
            <span style={{ display: "block", fontSize: 22, fontWeight: 600, color: "var(--fg)", marginTop: 2 }}>{time}</span>
          </div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            border: "1px solid var(--border)", padding: "6px 16px",
            fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            <span style={{
              width: 7, height: 7, background: "#22c55e", borderRadius: "50%",
              animation: reduceMotion ? "none" : "pulse-dot 2s ease-in-out infinite",
            }} />
            Available for work
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
