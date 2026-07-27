"use client";

import { useEffect, useRef } from "react";

export default function IDCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const velRef = useRef({ x: 2.5, y: 1.8 });
  const posRef = useRef({ x: -999, y: -999 });
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>();

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;
    const cW = card.offsetWidth;
    const cH = card.offsetHeight;

    posRef.current = { x: W() - cW - 60, y: H() * 0.18 };

    const loop = () => {
      if (!dragging.current) {
        posRef.current.x += velRef.current.x;
        posRef.current.y += velRef.current.y;

        if (posRef.current.x <= 0) { posRef.current.x = 0; velRef.current.x = Math.abs(velRef.current.x); }
        if (posRef.current.x >= W() - cW) { posRef.current.x = W() - cW; velRef.current.x = -Math.abs(velRef.current.x); }
        if (posRef.current.y <= 0) { posRef.current.y = 0; velRef.current.y = Math.abs(velRef.current.y); }
        if (posRef.current.y >= H() - cH) { posRef.current.y = H() - cH; velRef.current.y = -Math.abs(velRef.current.y); }
      }
      card.style.left = `${posRef.current.x}px`;
      card.style.top = `${posRef.current.y}px`;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    const onDown = (e: MouseEvent | TouchEvent) => {
      dragging.current = true;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      dragOffset.current = { x: clientX - posRef.current.x, y: clientY - posRef.current.y };
      velRef.current = { x: 0, y: 0 };
    };
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const nx = clientX - dragOffset.current.x;
      const ny = clientY - dragOffset.current.y;
      const dx = nx - posRef.current.x;
      const dy = ny - posRef.current.y;
      velRef.current = { x: dx * 0.3, y: dy * 0.3 };
      posRef.current = { x: nx, y: ny };
    };
    const onUp = () => { dragging.current = false; };

    card.addEventListener("mousedown", onDown);
    card.addEventListener("touchstart", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      card.removeEventListener("mousedown", onDown);
      card.removeEventListener("touchstart", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      style={{
        position: "fixed",
        zIndex: 50,
        cursor: "grab",
        userSelect: "none",
        width: 220,
      }}
    >
      <div style={{
        background: "#111",
        color: "#EDEAD4",
        borderRadius: 16,
        padding: "20px 20px 16px",
        fontFamily: "'Space Grotesk', sans-serif",
        boxShadow: "0 8px 40px rgba(0,0,0,0.35)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}>
        {/* Header stripe */}
        <div style={{
          fontSize: 8, fontWeight: 700, letterSpacing: "0.18em",
          textTransform: "uppercase", color: "rgba(237,234,212,0.35)",
          marginBottom: 14,
        }}>
          Portfolio · 2024
        </div>

        {/* Avatar */}
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: "linear-gradient(135deg, #E20074 0%, #7C6AF7 100%)",
          marginBottom: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, fontWeight: 700,
        }}>
          L
        </div>

        {/* Name */}
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 2 }}>
          Lakshhay Bedi
        </div>
        <div style={{ fontSize: 11, color: "rgba(237,234,212,0.45)", fontWeight: 400, marginBottom: 16 }}>
          Senior UX Designer
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(237,234,212,0.08)", marginBottom: 14 }} />

        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {["Enterprise", "FinTech", "Healthcare"].map((t) => (
            <span key={t} style={{
              fontSize: 9, fontWeight: 600, letterSpacing: "0.1em",
              textTransform: "uppercase",
              border: "1px solid rgba(237,234,212,0.15)",
              padding: "3px 8px",
              color: "rgba(237,234,212,0.5)",
            }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
