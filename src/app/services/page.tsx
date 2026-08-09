"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { SERVICES } from "@/lib/services";
import { revealVariant, viewportOnce } from "@/lib/motion";

export default function ServicesPage() {
  const reduceMotion = useReducedMotion();
  const reveal = revealVariant(!!reduceMotion);
  const [active, setActive] = useState<number | null>(null);

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
          Services
        </span>
      </nav>

      <main id="main-content" style={{ paddingTop: 64, fontFamily: "'Space Grotesk', sans-serif" }}>
        <section style={{ padding: "72px 48px 48px", borderBottom: "1px solid var(--border)" }}>
          <motion.h1
            initial="hidden" animate="visible" variants={reveal}
            style={{
              fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 700,
              letterSpacing: "-0.02em", textTransform: "uppercase",
              lineHeight: 1.05, marginBottom: 20,
            }}
          >
            What I Offer
          </motion.h1>
          <motion.p
            initial="hidden" animate="visible" variants={reveal} transition={{ delay: 0.08 }}
            style={{ fontSize: 16, fontWeight: 300, color: "var(--muted-strong)", maxWidth: 560, lineHeight: 1.7 }}
          >
            Open to freelance and full-time work. Hover a line, or tap it on
            mobile — each one links to real work, not a promise.
          </motion.p>
        </section>

        <section
          style={{ padding: "40px 48px 80px" }}
          onMouseLeave={() => setActive(null)}
        >
          {SERVICES.map((service, i) => {
            const isActive = active === i;
            return (
              <motion.div
                key={service.slug}
                initial="hidden" whileInView="visible" viewport={viewportOnce} variants={reveal}
                transition={{ delay: i * 0.04 }}
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <button
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(isActive ? null : i)}
                  aria-expanded={isActive}
                  style={{
                    width: "100%", display: "flex", alignItems: "baseline", gap: 24,
                    padding: "24px 0", background: "none", border: "none",
                    textAlign: "left", cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  <span style={{
                    fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
                    color: "var(--muted)", minWidth: 28, flexShrink: 0,
                  }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{
                    fontSize: isActive ? "clamp(24px, 3.2vw, 38px)" : "clamp(19px, 2.4vw, 27px)",
                    fontWeight: 700, letterSpacing: "-0.01em", textTransform: "uppercase",
                    lineHeight: 1.15,
                    color: active === null ? "var(--fg)" : isActive ? "var(--fg)" : "var(--muted)",
                    transition: reduceMotion ? "none" : "color 0.3s ease, font-size 0.3s ease",
                  }}>
                    {service.title}
                  </span>
                </button>

                <motion.div
                  initial={false}
                  animate={{ height: isActive ? "auto" : 0, opacity: isActive ? 1 : 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.32, ease: "easeInOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{ paddingBottom: 28, paddingLeft: 52, maxWidth: 640 }}>
                    <p style={{ fontSize: 14, fontWeight: 300, color: "var(--muted-strong)", lineHeight: 1.7, marginBottom: 16 }}>
                      {service.description}
                    </p>
                    <Link
                      href={service.proofHref}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
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
          })}
        </section>

        <section style={{ padding: "60px 48px 100px", borderTop: "1px solid var(--border)", textAlign: "center" }}>
          <div style={{
            fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 700,
            letterSpacing: "-0.02em", textTransform: "uppercase",
            marginBottom: 24,
          }}>
            Let&apos;s talk about your project.
          </div>
          <a
            href="mailto:lakshhaybedi@gmail.com"
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "16px 32px",
              background: "var(--fg)", color: "var(--fg-invert)",
              fontSize: 13, fontWeight: 700, letterSpacing: "0.08em",
              textTransform: "uppercase", textDecoration: "none", borderRadius: 8,
            }}
          >
            lakshhaybedi@gmail.com
          </a>
        </section>
      </main>
    </>
  );
}
