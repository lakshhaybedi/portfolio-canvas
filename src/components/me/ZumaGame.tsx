"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { buildSpiralPath, posAt, tangentAt, type Path } from "@/lib/zumaPath";
import { advance, insertAt, resolve, SPACING, tailOf, distOf, type Segment } from "@/lib/zumaChain";

const W = 720;
const H = 520;
const R = 12;              // ball radius
const HIT = 22;            // bullet/ball contact distance
const BULLET_SPEED = 560;
// While balls are still entering the track the chain moves at FEED_SPEED —
// new balls push the line along rather than waiting for it to creep clear of
// the spawn point. At BASE_SPEED alone a 25px gap takes ~2s to open, so the
// full chain would take over a minute just to appear.
const FEED_SPEED = 110;
const BASE_SPEED = 20;     // chain creep once everything is on the track
const CATCH_UP = 260;      // gap-closing rush
const STEP = 1 / 60;       // fixed physics step
const START_BALLS = 46;
const HIGH_SCORE_KEY = "otc-zuma-high";

// Web-safe-ish brights, in keeping with the rest of the page.
const COLORS = ["#FF2D55", "#FFD400", "#00D6FF", "#00E05A", "#C46BFF"];

type Bullet = { x: number; y: number; vx: number; vy: number; c: number };
type Status = "ready" | "playing" | "won" | "lost";

const rnd = () => Math.floor(Math.random() * COLORS.length);

export default function ZumaGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathRef = useRef<Path | null>(null);
  const segsRef = useRef<Segment[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const toSpawnRef = useRef(START_BALLS);
  const aimRef = useRef(0);
  const ammoRef = useRef({ current: rnd(), next: rnd() });
  const statusRef = useRef<Status>("ready");
  const scoreRef = useRef(0);
  const accRef = useRef(0);
  const lastRef = useRef(0);

  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<Status>("ready");
  const [high, setHigh] = useState(0);

  useEffect(() => {
    pathRef.current = buildSpiralPath(W, H);
    try { setHigh(Number(localStorage.getItem(HIGH_SCORE_KEY) || 0)); } catch { /* private mode */ }
  }, []);

  const reset = useCallback(() => {
    segsRef.current = [];
    bulletsRef.current = [];
    toSpawnRef.current = START_BALLS;
    ammoRef.current = { current: rnd(), next: rnd() };
    scoreRef.current = 0;
    statusRef.current = "playing";
    setScore(0);
    setStatus("playing");
  }, []);

  const finish = useCallback((s: Status) => {
    statusRef.current = s;
    setStatus(s);
    if (scoreRef.current > 0) {
      try {
        const prev = Number(localStorage.getItem(HIGH_SCORE_KEY) || 0);
        if (scoreRef.current > prev) {
          localStorage.setItem(HIGH_SCORE_KEY, String(scoreRef.current));
          setHigh(scoreRef.current);
        }
      } catch { /* private mode */ }
    }
  }, []);

  // ── simulation ────────────────────────────────────────────
  const step = useCallback((dt: number) => {
    const path = pathRef.current;
    if (!path || statusRef.current !== "playing") return;

    // Feed new balls in from the start of the track.
    const last = segsRef.current[segsRef.current.length - 1];
    if (toSpawnRef.current > 0) {
      if (!last) {
        segsRef.current.push({ balls: [rnd()], head: 0 });
        toSpawnRef.current--;
      } else if (tailOf(last) >= SPACING) {
        last.balls.push(rnd());
        toSpawnRef.current--;
      }
    }

    const speed = toSpawnRef.current > 0 ? FEED_SPEED : BASE_SPEED;
    segsRef.current = advance(segsRef.current, dt, speed, CATCH_UP);

    // Merges/combos that the movement made possible.
    const settled = resolve(segsRef.current);
    if (settled.popped > 0) {
      scoreRef.current += settled.popped * 10;
      setScore(scoreRef.current);
    }
    segsRef.current = settled.segs;

    // Bullets.
    const kept: Bullet[] = [];
    for (const b of bulletsRef.current) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.x < -40 || b.x > W + 40 || b.y < -40 || b.y > H + 40) continue;

      let hit = false;
      outer: for (let si = 0; si < segsRef.current.length; si++) {
        const seg = segsRef.current[si];
        for (let j = 0; j < seg.balls.length; j++) {
          const p = posAt(path, distOf(seg, j));
          if (Math.hypot(p.x - b.x, p.y - b.y) > HIT) continue;

          // Front or back of the ball it touched? The path tangent points
          // toward the hole, so the sign of the dot product decides which
          // slot the new ball takes.
          const t = tangentAt(path, distOf(seg, j));
          const ahead = (b.x - p.x) * t.x + (b.y - p.y) * t.y > 0;
          const idx = ahead ? j : j + 1;

          segsRef.current[si] = insertAt(seg, idx, b.c);
          const out = resolve(segsRef.current, { seg: si, ball: idx });
          if (out.popped > 0) {
            scoreRef.current += out.popped * 10;
            setScore(scoreRef.current);
          }
          segsRef.current = out.segs;
          hit = true;
          break outer;
        }
      }
      if (!hit) kept.push(b);
    }
    bulletsRef.current = kept;

    // End states.
    if (segsRef.current.length === 0 && toSpawnRef.current === 0) finish("won");
    else if (segsRef.current[0] && segsRef.current[0].head >= path.length) finish("lost");
  }, [finish]);

  // ── render ────────────────────────────────────────────────
  const draw = useCallback(() => {
    const cv = canvasRef.current;
    const path = pathRef.current;
    if (!cv || !path) return;
    const g = cv.getContext("2d");
    if (!g) return;

    g.clearRect(0, 0, W, H);
    g.fillStyle = "#0B1020";
    g.fillRect(0, 0, W, H);

    // Track groove.
    g.strokeStyle = "rgba(255,255,255,0.09)";
    g.lineWidth = R * 2 + 6;
    g.lineCap = "round";
    g.beginPath();
    path.pts.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)));
    g.stroke();

    // The hole.
    g.fillStyle = "#05070F";
    g.beginPath();
    g.arc(path.hole.x, path.hole.y, R + 9, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "#FF2D55";
    g.lineWidth = 2;
    g.stroke();

    // Balls.
    for (const seg of segsRef.current) {
      for (let j = 0; j < seg.balls.length; j++) {
        const p = posAt(path, distOf(seg, j));
        const c = COLORS[seg.balls[j]];
        const grad = g.createRadialGradient(p.x - 4, p.y - 5, 1, p.x, p.y, R);
        grad.addColorStop(0, "#FFFFFF");
        grad.addColorStop(0.35, c);
        grad.addColorStop(1, "rgba(0,0,0,0.55)");
        g.fillStyle = grad;
        g.beginPath();
        g.arc(p.x, p.y, R, 0, Math.PI * 2);
        g.fill();
      }
    }

    // Bullets.
    for (const b of bulletsRef.current) {
      g.fillStyle = COLORS[b.c];
      g.beginPath();
      g.arc(b.x, b.y, R - 1, 0, Math.PI * 2);
      g.fill();
    }

    // Shooter.
    const cx = W / 2;
    const cy = H / 2;
    g.save();
    g.translate(cx, cy);
    g.rotate(aimRef.current);
    g.fillStyle = "#2A3550";
    g.beginPath();
    g.moveTo(26, 0);
    g.lineTo(-14, -15);
    g.lineTo(-14, 15);
    g.closePath();
    g.fill();
    g.restore();

    g.fillStyle = "#1B2440";
    g.beginPath();
    g.arc(cx, cy, 20, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = COLORS[ammoRef.current.current];
    g.beginPath();
    g.arc(cx, cy, 11, 0, Math.PI * 2);
    g.fill();

    // Next-up chip.
    g.fillStyle = "rgba(255,255,255,0.35)";
    g.font = "9px 'Courier New', monospace";
    g.fillText("NEXT", cx - 34, cy + 40);
    g.fillStyle = COLORS[ammoRef.current.next];
    g.beginPath();
    g.arc(cx - 2, cy + 36, 7, 0, Math.PI * 2);
    g.fill();

    // Remaining-balls gauge.
    g.fillStyle = "rgba(255,255,255,0.5)";
    g.font = "11px 'Courier New', monospace";
    g.fillText(`LEFT ${toSpawnRef.current}`, 12, H - 14);
  }, []);

  // ── loop ──────────────────────────────────────────────────
  useEffect(() => {
    let raf = 0;
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (!lastRef.current) lastRef.current = t;
      const dt = Math.min(0.1, (t - lastRef.current) / 1000);
      lastRef.current = t;

      // Fixed steps keep the chain and bullets deterministic regardless of
      // frame rate; a variable dt lets a fast bullet skip past a ball.
      accRef.current += dt;
      while (accRef.current >= STEP) {
        step(STEP);
        accRef.current -= STEP;
      }
      draw();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [step, draw]);

  // ── input ─────────────────────────────────────────────────
  const toLocal = (e: React.MouseEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * W,
      y: ((e.clientY - r.top) / r.height) * H,
    };
  };

  const onMove = (e: React.MouseEvent) => {
    const { x, y } = toLocal(e);
    aimRef.current = Math.atan2(y - H / 2, x - W / 2);
  };

  const onClick = (e: React.MouseEvent) => {
    if (statusRef.current !== "playing") { reset(); return; }
    const { x, y } = toLocal(e);
    const a = Math.atan2(y - H / 2, x - W / 2);
    aimRef.current = a;
    bulletsRef.current.push({
      x: W / 2 + Math.cos(a) * 24,
      y: H / 2 + Math.sin(a) * 24,
      vx: Math.cos(a) * BULLET_SPEED,
      vy: Math.sin(a) * BULLET_SPEED,
      c: ammoRef.current.current,
    });
    ammoRef.current = { current: ammoRef.current.next, next: rnd() };
  };

  const overlay =
    status === "ready" ? { t: "ZUMA.EXE", s: "click anywhere to start" } :
    status === "won" ? { t: "YOU WIN!!", s: `score ${score} — click to play again` } :
    status === "lost" ? { t: "GAME OVER", s: `score ${score} — click to try again` } : null;

  return (
    <div style={{ padding: 14, fontFamily: "'Tahoma','Geneva',sans-serif" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        fontSize: 11, fontWeight: 700, color: "#10336E", marginBottom: 8,
      }}>
        <span>SCORE: {score}</span>
        <span>HI: {Math.max(high, score)}</span>
      </div>

      <div style={{ position: "relative", border: "2px inset #B8B8C8", lineHeight: 0 }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onMouseMove={onMove}
          onClick={onClick}
          style={{ width: "100%", height: "auto", display: "block", cursor: "crosshair", touchAction: "none" }}
        />
        {overlay && (
          <div
            onClick={reset}
            style={{
              position: "absolute", inset: 0, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer",
              background: "rgba(5,8,20,0.78)",
            }}
          >
            <div style={{
              fontFamily: "'Impact','Arial Black',sans-serif", fontSize: 40,
              letterSpacing: "0.04em", color: "#FFD400",
              textShadow: "3px 3px 0 #FF2D55",
            }}>
              {overlay.t}
            </div>
            <div style={{ fontFamily: "'Courier New',monospace", fontSize: 12, color: "#00FF00" }}>
              {overlay.s}
            </div>
          </div>
        )}
      </div>

      <div style={{ fontSize: 9, color: "#2A4A80", marginTop: 8, lineHeight: 1.5 }}>
        aim with the mouse, click to fire. match 3+ to pop. don't let them reach the hole!
      </div>
    </div>
  );
}
