"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { revealVariant } from "@/lib/motion";
import MusicPlayer from "@/components/MusicPlayer";

export default function MePage() {
  const reduceMotion = useReducedMotion();
  const reveal = revealVariant(!!reduceMotion);

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 64, padding: "0 48px",
        background: "rgba(10,10,10,0.85)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
      }}>
        <Link href="/" style={{
          display: "flex", alignItems: "center", gap: 8,
          fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase", textDecoration: "none", color: "var(--fg)",
        }}>
          ← Back
        </Link>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>
          Me
        </span>
      </nav>

      <main style={{ paddingTop: 64, fontFamily: "'Space Grotesk', sans-serif" }}>
        <section style={{ padding: "72px 48px 48px", borderBottom: "1px solid var(--border)" }}>
          <motion.h1
            initial="hidden" animate="visible" variants={reveal}
            style={{
              fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 700,
              letterSpacing: "-0.02em", textTransform: "uppercase",
              lineHeight: 1.05, marginBottom: 20,
            }}
          >
            Off The Clock
          </motion.h1>
          <motion.p
            initial="hidden" animate="visible" variants={reveal} transition={{ delay: 0.08 }}
            style={{ fontSize: 16, fontWeight: 300, color: "var(--muted-strong)", maxWidth: 560, lineHeight: 1.7 }}
          >
            What's playing while the rest of this gets built.
          </motion.p>
        </section>

        <section style={{ padding: "56px 48px" }}>
          <MusicPlayer />
        </section>
      </main>
    </>
  );
}
