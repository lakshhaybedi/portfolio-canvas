"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import Picture from "@/components/Picture";

/**
 * Case-study hero: the project's real screens in a frame that matches the
 * platform they actually shipped on, layered into a shallow stack that
 * drifts apart as the page scrolls.
 *
 * Two things this replaces. First, every project used to sit inside the same
 * desktop browser chrome with an invented URL (`standard-bank.internal`) —
 * which for Standard Bank meant presenting an iOS app, status bar and home
 * indicator included, as a website. Frames are now device-true and no URL is
 * fabricated; the chrome's tab shows the screen's real label instead.
 *
 * Second, a lone screenshot says "here is a picture". Two or three screens
 * at different depths say "here is a system", which is the actual claim
 * these case studies make. The parallax is transform-only (compositor work,
 * no layout) and collapses to a static composition under reduced-motion.
 */

export type HeroDevice = "desktop" | "mobile";

export type HeroScreen = { src: string; label: string };

export default function HeroFrame({
  device,
  screens,
  accent,
}: {
  device: HeroDevice;
  /** Primary first; up to two more render behind it. */
  screens: HeroScreen[];
  accent: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // Offset matters more than distance here. The obvious `["start end", ...]`
  // starts counting from where the element enters the viewport bottom — but
  // this hero is already on screen at page load, so the reader begins around
  // halfway through the range and only ever sees the back half of the
  // motion. Anchoring the start to "hero top meets viewport top" means the
  // full 0→1 range maps onto scrolling that actually happens.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Each layer moves at its own rate — the further back, the further it
  // travels, which is what reads as depth. The spread (not the absolute
  // distance) is what makes it legible: ~300px between the front frame and
  // the back plate, so they visibly slide apart rather than drifting as a
  // block. Reduced-motion flattens every range to zero rather than skipping
  // the hooks.
  const m = reduceMotion ? 0 : 1;
  const yFront = useTransform(scrollYProgress, [0, 1], [0, -30 * m]);
  const yMid = useTransform(scrollYProgress, [0, 1], [0, -170 * m]);
  const yBack = useTransform(scrollYProgress, [0, 1], [0, -300 * m]);
  // Lateral drift on the back layers only. They already sit offset from the
  // primary, so pulling them further out as they rise reads as the stack
  // fanning open, which is far more visible than vertical spread alone.
  const xMid = useTransform(scrollYProgress, [0, 1], [0, 26 * m]);
  const xBack = useTransform(scrollYProgress, [0, 1], [0, 60 * m]);
  // Mirrored for the left-hand phone so the pair fans apart rather than both
  // sliding the same way. Declared here, not inline in the JSX branch, since
  // that branch is conditional and hooks can't be.
  const xMidLeft = useTransform(scrollYProgress, [0, 1], [0, -26 * m]);
  const xBackLeft = useTransform(scrollYProgress, [0, 1], [0, -60 * m]);

  const [primary, second, third] = screens;

  if (device === "mobile") {
    return (
      <div ref={ref} style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 0, minHeight: 420 }}>
        {/* Side phones sit behind and slightly lower, fanned out. Rendered
            before the primary so paint order alone handles stacking.
            `rotate` is a motion prop, not a `transform: rotate(...)` string:
            framer composes transform from x/y/rotate itself, so a static
            transform alongside an animated `y` gets overwritten and the tilt
            silently disappears. They fan outward as they rise (negative x
            left, positive x right). */}
        {second && (
          <motion.div style={{ y: yMid, x: xMidLeft, rotate: -7, position: "absolute", left: "6%", bottom: 0, width: "38%", opacity: 0.55, zIndex: 1 }}>
            <PhoneFrame screen={second} accent={accent} />
          </motion.div>
        )}
        {third && (
          <motion.div style={{ y: yBack, x: xBack, rotate: 7, position: "absolute", right: "6%", bottom: 24, width: "36%", opacity: 0.4, zIndex: 1 }}
          >
            <PhoneFrame screen={third} accent={accent} />
          </motion.div>
        )}
        <motion.div style={{ y: yFront, position: "relative", width: "46%", minWidth: 210, zIndex: 2 }}>
          <PhoneFrame screen={primary} accent={accent} priority />
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={ref} style={{ position: "relative", paddingTop: 56, paddingRight: 24 }}>
      {/* Back plates peek out top-right, scaled down and dimmed. Absolute so
          they never add height — the primary frame alone sets the layout. */}
      {third && (
        <motion.div style={{ y: yBack, x: xBack, position: "absolute", top: 0, right: 0, width: "82%", opacity: 0.3, zIndex: 1 }}>
          <BrowserFrame screen={third} accent={accent} />
        </motion.div>
      )}
      {second && (
        <motion.div style={{ y: yMid, x: xMid, position: "absolute", top: 28, right: 12, width: "91%", opacity: 0.5, zIndex: 2 }}>
          <BrowserFrame screen={second} accent={accent} />
        </motion.div>
      )}
      <motion.div style={{ y: yFront, position: "relative", zIndex: 3 }}>
        <BrowserFrame screen={primary} accent={accent} priority />
      </motion.div>
    </div>
  );
}

function BrowserFrame({ screen, accent, priority }: { screen: HeroScreen; accent: string; priority?: boolean }) {
  return (
    <div style={{
      borderRadius: 10,
      overflow: "hidden",
      border: "1px solid var(--border)",
      boxShadow: "0 32px 80px rgba(0,0,0,0.45), 0 8px 24px rgba(0,0,0,0.3)",
      background: "#1a1a1a",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 12px" }}>
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#ff5f57" }} />
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#febc2e" }} />
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#28c840" }} />
        {/* The screen's real label, not a made-up hostname. */}
        <div style={{
          marginLeft: 10, padding: "3px 12px", borderRadius: "6px 6px 0 0",
          background: "#242426",
          fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.62)",
          borderBottom: `2px solid ${accent}`,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "60%",
        }}>
          {screen.label}
        </div>
      </div>
      {/* Fixed viewport ratio with the image anchored to its top: several of
          these are full-page captures thousands of pixels tall, and this is
          exactly how a browser shows the top of a long page rather than
          squashing it. */}
      <div style={{ aspectRatio: "16 / 10", overflow: "hidden", background: "#0f0f10" }}>
        <Picture
          src={screen.src}
          alt={screen.label}
          fetchPriority={priority ? "high" : undefined}
          decoding="async"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }}
        />
      </div>
    </div>
  );
}

function PhoneFrame({ screen, accent, priority }: { screen: HeroScreen; accent: string; priority?: boolean }) {
  return (
    <div style={{
      borderRadius: 30,
      padding: 7,
      background: "linear-gradient(160deg, #3a3a3d 0%, #161618 45%, #2c2c2f 100%)",
      boxShadow: "0 30px 70px rgba(0,0,0,0.5), 0 6px 18px rgba(0,0,0,0.35)",
    }}>
      <div style={{
        position: "relative",
        borderRadius: 24,
        overflow: "hidden",
        background: "#000",
        // iPhone-ish. The Standard Bank captures are 0.42-0.50 wide-to-tall,
        // so they sit in this without letterboxing.
        aspectRatio: "9 / 19.5",
      }}>
        <Picture
          src={screen.src}
          alt={screen.label}
          fetchPriority={priority ? "high" : undefined}
          decoding="async"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }}
        />
        {/* Dynamic-island style pill — the screenshots already carry a real
            iOS status bar, so this just completes the hardware. */}
        <div aria-hidden="true" style={{
          position: "absolute", top: 7, left: "50%", transform: "translateX(-50%)",
          width: "26%", height: 14, borderRadius: 10, background: "#000",
        }} />
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.06)`,
          borderRadius: 24,
        }} />
      </div>
      <div aria-hidden="true" style={{ height: 2, marginTop: 5, marginInline: "auto", width: "26%", borderRadius: 2, background: accent, opacity: 0.35 }} />
    </div>
  );
}
