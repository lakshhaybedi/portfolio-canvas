// The track the ball chain crawls along.
//
// The whole game is 1-D: every ball stores a single scalar "distance along
// the path", and this module turns that scalar into an (x, y). Sampling the
// curve once into a table of points plus cumulative arc length is what makes
// that lookup cheap, and it's why the chain never needs 2-D collision.

export type Pt = { x: number; y: number };

export type Path = {
  /** Sampled points, evenly spaced in curve parameter (not in distance). */
  pts: Pt[];
  /** cum[i] = arc length from the start up to pts[i]. */
  cum: number[];
  length: number;
  /** Where the balls disappear — reaching it loses the game. */
  hole: Pt;
};

/**
 * An elliptical spiral winding inward. Guaranteed smooth and never
 * self-intersecting, which a hand-placed control-point path is not — and a
 * crossing would let the chain collide with itself, which the 1-D model
 * has no way to represent.
 */
export function buildSpiralPath(w: number, h: number, turns = 2.6): Path {
  const cx = w / 2;
  const cy = h / 2;
  const rOuter = Math.min(w, h) * 0.52;
  const rInner = Math.min(w, h) * 0.19;
  const aspect = w / h;

  const N = 1600;
  const pts: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const angle = t * turns * Math.PI * 2;
    const r = rOuter + (rInner - rOuter) * t;
    pts.push({
      x: cx + Math.cos(angle) * r * aspect * 0.78,
      y: cy + Math.sin(angle) * r,
    });
  }

  const cum: number[] = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  }

  return { pts, cum, length: cum[cum.length - 1], hole: pts[pts.length - 1] };
}

/** Position at an arc distance along the path, clamped to both ends. */
export function posAt(path: Path, d: number): Pt {
  const { pts, cum } = path;
  if (d <= 0) return pts[0];
  if (d >= path.length) return pts[pts.length - 1];

  // Binary search the cumulative table, then lerp within the segment.
  let lo = 0;
  let hi = cum.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] <= d) lo = mid;
    else hi = mid;
  }
  const span = cum[hi] - cum[lo] || 1;
  const f = (d - cum[lo]) / span;
  return {
    x: pts[lo].x + (pts[hi].x - pts[lo].x) * f,
    y: pts[lo].y + (pts[hi].y - pts[lo].y) * f,
  };
}

/** Unit vector pointing toward the hole at a given distance. */
export function tangentAt(path: Path, d: number): Pt {
  const a = posAt(path, Math.max(0, d - 2));
  const b = posAt(path, Math.min(path.length, d + 2));
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const m = Math.hypot(dx, dy) || 1;
  return { x: dx / m, y: dy / m };
}
