// Procedural point-cloud generators for the hero particle system.
// No external model/asset needed — both the starting "cloud" and the
// morph-target shape are computed analytically, which keeps this dependency
// free and safe to lazy-load.

/**
 * An even grid of points spread across the XZ plane, receding away from the
 * camera into -Z — the particles' resting/idle formation. This is what
 * gives the hero its "landscape rolling into a horizon" read; the wave
 * motion itself is applied per-frame in the vertex shader, not baked in
 * here. Grid dimensions are derived from `targetCount` (not sized exactly
 * to it — rows*cols is returned as the real, usable count).
 *
 * Perfectly rectilinear on purpose — no per-particle position jitter. Rows
 * and columns need to read as clean continuous lines, not scattered dust;
 * all of the organic "flow" comes from the coherent per-frame wave in the
 * vertex shader, not from randomizing the rest positions.
 */
export function generateWaveGridPositions(
  targetCount: number,
  // Tighter spacing on both axes (0.28→0.22, 0.34→0.24) so lines read as
  // near-continuous streaks rather than dotted rows, per reference image.
  // aspect lowered 1.0→0.75 — favors rows over columns, extending the far
  // reach toward the horizon (paired with the relaxed distance falloff in
  // particleShaders.ts) so the back of the wave has real geometry to render
  // sharply instead of just less-faded emptiness.
  { aspect = 0.75, spacingX = 0.22, spacingZ = 0.24 }: { aspect?: number; spacingX?: number; spacingZ?: number } = {}
): { positions: Float32Array; count: number } {
  const cols = Math.max(2, Math.round(Math.sqrt(targetCount * aspect)));
  const rows = Math.max(2, Math.round(targetCount / cols));
  const count = cols * rows;
  const positions = new Float32Array(count * 3);

  // How close the first row sits to the camera. This isn't a free
  // aesthetic choice — for a downward-tilted camera, there's a ground
  // radius directly beneath/in front of it that the bottom of the frustum
  // can see, and the near-field rows need to reach at least that close or
  // it shows up as an empty band at the bottom of the frame (reported a few
  // times now). The required distance shrinks as the tilt steepens — the
  // last tilt increase (sceneConstants.ts, -2.0 → -8.0, to push the grid's
  // vanishing point off-screen) raised the minimum from ~2.35 to ~1.4 units
  // in front of the camera. 5.3 keeps a safety margin beyond that minimum.
  const nearZ = 5.3;

  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      positions[i * 3] = (c - cols / 2) * spacingX;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = nearZ - r * spacingZ;
      i++;
    }
  }

  return { positions, count };
}

/**
 * Points spread evenly across the surface of a sphere — the "globe" the
 * cloud morphs into on scroll. Uses a Fibonacci/golden-angle spiral, which
 * gives near-uniform coverage with no clustering at the poles (unlike naive
 * lat/long sampling) at O(n) cost and no trig-heavy rejection sampling.
 * Positions are centered at the origin; the caller translates to the
 * globe's world position (done in-shader so it can also be rotated there).
 */
export function generateSpherePositions(
  count: number,
  { radius = 6, jitter = 0.03 }: { radius?: number; jitter?: number } = {}
): Float32Array {
  const positions = new Float32Array(count * 3);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    // y sweeps linearly from +1 to -1; radius-at-y follows the sphere's
    // cross-section, and theta advances by the golden angle each step.
    const y = 1 - (i / (count - 1)) * 2;
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * i;

    const r = radius * (1 + (Math.random() - 0.5) * jitter);
    positions[i * 3] = Math.cos(theta) * radiusAtY * r;
    positions[i * 3 + 1] = y * r;
    positions[i * 3 + 2] = Math.sin(theta) * radiusAtY * r;
  }

  return positions;
}
