"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { OTHER_PROJECTS, CATEGORY_LABELS, type OtherProjectCategory } from "@/lib/otherProjects";
import { revealVariant, viewportOnce } from "@/lib/motion";
import Picture from "@/components/Picture";

const CATEGORY_ORDER: OtherProjectCategory[] = ["branding", "ux", "experimental"];

export default function OtherWorkPage() {
  const [lightboxSlug, setLightboxSlug] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const reveal = revealVariant(!!reduceMotion);

  const lightboxProject = OTHER_PROJECTS.find((p) => p.slug === lightboxSlug) ?? null;
  const lightboxRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const activeThumbRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeThumbRef.current?.scrollIntoView({ block: "nearest", behavior: reduceMotion ? "instant" : "smooth" });
  }, [imageIndex, reduceMotion]);

  // Same pattern as the case-study lightbox: plain conditional render (not
  // AnimatePresence) so closing is instant and tied directly to state, no
  // separate exit-animation machinery that can lose sync and leave an
  // invisible copy blocking the page (a real bug hit and fixed there).
  useEffect(() => {
    if (!lightboxProject) return;
    triggerRef.current = document.activeElement as HTMLElement;
    const focusables = () =>
      Array.from(
        lightboxRef.current?.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])') ?? []
      ).filter((el) => !el.hasAttribute("disabled"));
    focusables()[0]?.focus();

    const handler = (e: KeyboardEvent) => {
      const imgs = lightboxProject.images;
      if (e.key === "ArrowRight" && imgs.length > 0) setImageIndex((i) => Math.min(i + 1, imgs.length - 1));
      if (e.key === "ArrowLeft" && imgs.length > 0) setImageIndex((i) => Math.max(i - 1, 0));
      if (e.key === "Escape") setLightboxSlug(null);
      if (e.key === "Tab") {
        const els = focusables();
        if (els.length === 0) return;
        const first = els[0], last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      triggerRef.current?.focus();
    };
  }, [lightboxProject]);

  const openLightbox = (slug: string) => {
    setLightboxSlug(slug);
    setImageIndex(0);
  };

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
          Other Work
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
            Other Work
          </motion.h1>
          <motion.p
            initial="hidden" animate="visible" variants={reveal} transition={{ delay: 0.08 }}
            style={{ fontSize: 16, fontWeight: 300, color: "var(--muted-strong)", maxWidth: 560, lineHeight: 1.7 }}
          >
            The broader body of work alongside the four main case studies:
            branding, UX projects outside the flagship four, and a few personal
            and experimental pieces.
          </motion.p>
        </section>

        {CATEGORY_ORDER.map((cat) => {
          const projects = OTHER_PROJECTS.filter((p) => p.category === cat);
          if (projects.length === 0) return null;
          return (
            <section key={cat} style={{ padding: "56px 48px", borderBottom: "1px solid var(--border)" }}>
              <motion.div
                initial="hidden" whileInView="visible" viewport={viewportOnce} variants={reveal}
                style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: "0.14em",
                  textTransform: "uppercase", color: "var(--muted)",
                  display: "flex", alignItems: "center", gap: 16, marginBottom: 32,
                }}
              >
                {CATEGORY_LABELS[cat]}
                <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
              </motion.div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 24,
              }}>
                {projects.map((project, i) => {
                  const cover = project.coverImage ?? project.images[0];
                  // Yurbban Trafalgar's spreads are a print-ready file, so
                  // instead of the standard lightbox it opens as a page-flip
                  // 3D magazine on its own route. It's the flagship "other
                  // work" piece, so the card is deliberately featured: wider,
                  // accent-bordered, and the cover keeps a slow 3D tumble to
                  // signal there's more than a flat image behind it.
                  const isMagazine = project.slug === "yurbban-trafalgar";

                  const coverContent = (
                    <>
                      <div style={{
                        position: "relative", aspectRatio: "4 / 3", borderRadius: 8,
                        overflow: "hidden", background: "var(--bg-elevated)",
                        border: isMagazine ? "1px solid rgba(226,0,116,0.4)" : "1px solid var(--border)",
                        marginBottom: 12,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        ...(isMagazine ? { perspective: 1200 } : {}),
                      }}>
                        {cover ? (
                          isMagazine ? (
                            // Hand-rolled <picture> rather than the shared
                            // component: this one is a motion.img (the slow 3D
                            // tumble), which Picture can't wrap without losing
                            // the animation props. A <source> works with any
                            // <img> descendant, motion-driven or not.
                            <picture style={{ display: "contents" }}>
                              <source srcSet={cover.replace(/\.(png|jpe?g)$/i, ".webp")} type="image/webp" />
                              <motion.img
                                src={cover}
                                alt={project.title}
                                decoding="async"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                animate={reduceMotion ? undefined : {
                                  rotateY: [-14, 14, -14],
                                  scale: [1.08, 1.14, 1.08],
                                }}
                                transition={reduceMotion ? undefined : {
                                  duration: 8, repeat: Infinity, ease: "easeInOut",
                                }}
                              />
                            </picture>
                          ) : (
                            // Card covers are full-resolution source images
                            // rendered into a ~260px cell, and there are 15 of
                            // them — all previously fetched eagerly on load.
                            // Lazy + async decode defers everything below the
                            // fold; see scripts/generate-thumbnails.mjs for the
                            // matching size reduction.
                            <Picture
                              src={cover}
                              alt={project.title}
                              loading="lazy"
                              decoding="async"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          )
                        ) : (
                          <a
                            href={project.behanceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                              textTransform: "uppercase", color: "var(--muted)",
                              textDecoration: "none", padding: 16, textAlign: "center",
                            }}
                          >
                            View on Behance ↗
                          </a>
                        )}
                        {project.video && (
                          <div aria-hidden="true" style={{
                            position: "absolute", inset: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: "rgba(0,0,0,0.25)",
                          }}>
                            <div style={{
                              width: 44, height: 44, borderRadius: "50%",
                              background: "rgba(255,255,255,0.9)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A0A0A"><path d="M8 5v14l11-7z" /></svg>
                            </div>
                          </div>
                        )}
                        {isMagazine && (
                          <div aria-hidden="true" style={{
                            position: "absolute", top: 10, right: 10,
                            padding: "5px 10px", borderRadius: 999,
                            background: "rgba(226,0,116,0.9)", backdropFilter: "blur(4px)",
                            fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
                            textTransform: "uppercase", color: "#fff",
                          }}>
                            ★ Featured — 3D Magazine
                          </div>
                        )}
                      </div>
                      <div style={{
                        fontSize: isMagazine ? 18 : 14, fontWeight: 600, color: "var(--fg)",
                        marginBottom: 4, lineHeight: 1.4,
                      }}>
                        {project.title}
                      </div>
                      <p style={{
                        fontSize: isMagazine ? 13 : 12, fontWeight: 300, color: "var(--muted)",
                        lineHeight: 1.6, margin: 0, maxWidth: isMagazine ? 480 : undefined,
                      }}>
                        {project.description}
                      </p>
                    </>
                  );

                  if (isMagazine) {
                    return (
                      <motion.div
                        key={project.slug}
                        id={project.slug}
                        initial="hidden" whileInView="visible" viewport={viewportOnce} variants={reveal}
                        transition={{ delay: i * 0.05 }}
                        style={{ scrollMarginTop: 88, gridColumn: "span 2" }}
                      >
                        <Link
                          href="/other-work/yurbban-trafalgar"
                          style={{ display: "block", textAlign: "left", textDecoration: "none", color: "inherit" }}
                        >
                          {coverContent}
                        </Link>
                      </motion.div>
                    );
                  }

                  return (
                    <motion.button
                      key={project.slug}
                      id={project.slug}
                      onClick={() => cover && openLightbox(project.slug)}
                      initial="hidden" whileInView="visible" viewport={viewportOnce} variants={reveal}
                      transition={{ delay: i * 0.05 }}
                      style={{
                        textAlign: "left", background: "none", border: "none", padding: 0,
                        scrollMarginTop: 88,
                        cursor: cover ? "pointer" : "default", fontFamily: "inherit",
                      }}
                    >
                      {coverContent}
                    </motion.button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>

      {lightboxProject && (
        <motion.div
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${lightboxProject.title}, expanded view`}
          onClick={() => setLightboxSlug(null)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.92)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 32,
          }}
        >
          <button
            aria-label="Close expanded view"
            onClick={() => setLightboxSlug(null)}
            style={{
              position: "absolute", top: 24, right: 32,
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
              color: "#fff", width: 40, height: 40, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          {lightboxProject.images.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "flex", flexDirection: "column", gap: 10,
                maxHeight: "85vh", overflowY: "auto", flexShrink: 0,
                padding: "4px 2px",
              }}
            >
              {lightboxProject.images.map((src, i) => (
                <button
                  key={src}
                  ref={i === imageIndex ? activeThumbRef : undefined}
                  aria-label={`View image ${i + 1} of ${lightboxProject.images.length}`}
                  aria-current={i === imageIndex}
                  onClick={() => setImageIndex(i)}
                  style={{
                    width: 64, height: 64, flexShrink: 0, padding: 0,
                    borderRadius: 6, overflow: "hidden", cursor: "pointer",
                    border: i === imageIndex ? "2px solid #fff" : "2px solid transparent",
                    opacity: i === imageIndex ? 1 : 0.5,
                    transition: "opacity 0.15s ease, border-color 0.15s ease",
                    background: "rgba(255,255,255,0.05)",
                  }}
                >
                  <img
                    src={src}
                    alt=""
                    aria-hidden="true"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </button>
              ))}
            </div>
          )}

          <div style={{ position: "relative", display: "flex", alignItems: "center", flex: 1, justifyContent: "center", minWidth: 0 }}>
            {lightboxProject.images.length > 1 && imageIndex > 0 && (
              <button
                aria-label="Previous image"
                onClick={(e) => { e.stopPropagation(); setImageIndex((i) => Math.max(i - 1, 0)); }}
                style={{
                  position: "absolute", left: 0,
                  background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff", width: 48, height: 48, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                }}
              >←</button>
            )}

            <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: "70vw", maxHeight: "85vh", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              {/* A video project shows just the video (or, failing that, the
                  Behance link below) — stacking the cover image above it as
                  well pushed the video past the viewport, forcing a scroll
                  to reach it. */}
              {lightboxProject.video ? (
                <video controls style={{ maxWidth: "100%", maxHeight: "68vh", borderRadius: 8, boxShadow: "0 40px 120px rgba(0,0,0,0.6)" }}>
                  <source src={lightboxProject.video} type="video/mp4" />
                </video>
              ) : lightboxProject.images.length > 0 ? (
                <Picture
                  src={lightboxProject.images[imageIndex]}
                  alt={`${lightboxProject.title}, image ${imageIndex + 1}`}
                  decoding="async"
                  style={{ maxWidth: "100%", maxHeight: "68vh", objectFit: "contain", borderRadius: 8, boxShadow: "0 40px 120px rgba(0,0,0,0.6)" }}
                />
              ) : (
                <p style={{ color: "var(--muted-strong)", fontSize: 14, maxWidth: 400, textAlign: "center" }}>
                  This project&apos;s content is no longer available on Behance.
                </p>
              )}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fg)", marginBottom: 6 }}>
                  {lightboxProject.title}
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 480, margin: "0 auto" }}>
                  {lightboxProject.description}
                </p>
                <a
                  href={lightboxProject.behanceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-block", marginTop: 10, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", textDecoration: "none" }}
                >
                  View on Behance ↗
                </a>
              </div>
              {lightboxProject.images.length > 1 && (
                <span style={{ fontSize: 11, color: "var(--muted)" }}>
                  {imageIndex + 1} / {lightboxProject.images.length}
                </span>
              )}
            </div>

            {lightboxProject.images.length > 1 && imageIndex < lightboxProject.images.length - 1 && (
              <button
                aria-label="Next image"
                onClick={(e) => { e.stopPropagation(); setImageIndex((i) => Math.min(i + 1, lightboxProject.images.length - 1)); }}
                style={{
                  position: "absolute", right: 0,
                  background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff", width: 48, height: 48, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                }}
              >→</button>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
}
