// GPU particle shaders for the hero background.
//
// Everything that needs to run per-particle per-frame (noise drift, the
// cloud→shape morph, cursor repel, camera-distance size/alpha falloff) lives
// here in GLSL rather than in JS, so the animation loop touches uniforms and
// a handful of camera values only — not 10k individual particle objects.

// Classic Ashima Arts / Ian McEwan simplex noise (public-domain reference
// implementation, ubiquitous in WebGL shader work — not project-specific
// code, just the standard `snoise` building block).
export const simplexNoiseGLSL = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

export const particleVertexShader = /* glsl */ `
attribute vec3 aShapePos;
attribute float aSeed;

uniform float uTime;
uniform float uMorphProgress;
uniform vec3 uCursor;
uniform float uCursorStrength;
uniform float uPixelRatio;
uniform float uSize;
uniform vec3 uGlobeCenter;
uniform float uRotationSpeed;
uniform float uWaveAmplitude;
uniform float uWaveFrequency;

varying float vAlpha;
varying float vSeed;
varying float vCamDist;

${simplexNoiseGLSL}

mat3 rotateY(float a) {
  float s = sin(a), c = cos(a);
  return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c);
}

mat3 rotateX(float a) {
  float s = sin(a), c = cos(a);
  return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c);
}

void main() {
  vSeed = aSeed;

  // The globe rotates continuously on its own clock (Y axis, plus a slow
  // X wobble for depth) independent of scroll/morph — it keeps spinning
  // whether the user is actively scrolling or holding still.
  float rotY = uTime * uRotationSpeed;
  float rotX = sin(uTime * uRotationSpeed * 0.35) * 0.18;
  vec3 globePos = rotateX(rotX) * rotateY(rotY) * aShapePos + uGlobeCenter;

  // Grid → globe morph. Wave amplitude settles down as the globe resolves
  // so the final form reads as intentional rather than still-rippling.
  vec3 basePos = mix(position, globePos, uMorphProgress);
  float waveAmount = mix(uWaveAmplitude * 0.35, 0.0, uMorphProgress);

  // A single coherent noise field sampled in the *original* grid-space X/Z
  // (not the morphed position) so the ripple stays a stable traveling wave
  // across the landscape regardless of the morph, rather than per-particle
  // independent jitter.
  // Time multiplier raised 0.18 → 0.42 — noticeably faster ripple travel
  // across the field, per explicit "increase the speed of the wave" request.
  float wave = snoise(vec3(position.x * 0.1 * uWaveFrequency, position.z * 0.1 * uWaveFrequency, uTime * 0.42)) * waveAmount;
  // Kept minimal on purpose: this used to add a per-particle high-frequency
  // shimmer, but that read as scatter/noise between the grid lines rather
  // than the "clean continuous lines" the wave itself already provides.
  float shimmer = fract(sin(aSeed * 91.345) * 47453.1) * 0.012 * (1.0 - uMorphProgress);

  vec3 worldPos = basePos + vec3(0.0, wave + shimmer, 0.0);

  // Cursor repel — subtle lift near the world-space cursor point. Fades out
  // as the globe forms; a formed globe isn't meant to react to the cursor
  // the way the loose grid does. Radius and push both cut down (1.6→0.7,
  // 0.6→0.15) — at the old strength, combined with the wider point-size
  // range below, this read as an obvious crater with a blown-up bright dot
  // at its center (wherever the pointer's ray happens to hit the ground,
  // including its idle/default position) rather than a subtle deformation.
  //
  // Vertical-only, not radial: uCursor sits on the fixed ground plane, so a
  // radial push (worldPos - uCursor) is almost entirely a horizontal X/Z
  // shove — it slides a particle sideways off its grid column/row, leaving
  // a visible gap in the line behind it. Lifting along Y instead keeps every
  // particle in its column/row (line stays continuous) while still reading
  // as a reaction to the cursor.
  float cursorDist = distance(worldPos, uCursor);
  float cursorRadius = 0.7;
  float repel = smoothstep(cursorRadius, 0.0, cursorDist) * uCursorStrength * (1.0 - uMorphProgress);
  worldPos.y += repel * 0.4;

  vec4 mvPosition = modelViewMatrix * vec4(worldPos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  vCamDist = -mvPosition.z;

  // Perspective size attenuation + a gentle cursor-proximity swell, cheap to
  // compute per-vertex. The reference distance (7.0) matches the camera's
  // resting z, so uSize is roughly the on-screen pixel size at that distance
  // rather than an arbitrary blow-up. Variance kept narrow (not removed
  // entirely) — dots should read as a uniform structured grid, not twinkling
  // dust, but a perfectly identical size for every dot looks synthetic.
  float sizeVariance = 0.92 + fract(aSeed * 91.7) * 0.16;
  // Cut from 1.2 → 0.25 for the same reason as the repel push above — with
  // the wider size clamp, the old multiplier turned the nearest particle to
  // the cursor into an oversized bright blob instead of a gentle swell.
  float pulse = 1.0 + repel * 0.25;
  // Clamp widened from (1.0, 3.0) to (0.5, 7.0) — per reference image, near
  // dots should read noticeably larger and far ones noticeably smaller, not
  // a flat, narrow size band. Still nowhere near the ~300px-per-particle
  // scale that caused the original WebGL context-loss crash, so this stays
  // safe; the clamp itself (not just its bounds) is what guards against
  // that class of bug recurring. Floor raised 0.5→1.0 — below 1px, far dots
  // were anti-aliasing into a soft smudge instead of a small, sharp point.
  gl_PointSize = clamp(uSize * uPixelRatio * sizeVariance * pulse * (7.0 / vCamDist), 1.0, 7.0);

  // Camera-distance falloff stands in for depth-of-field: particles nearer
  // the camera stay crisp/bright, ones further toward the horizon soften
  // and dim out gradually rather than clipping off sharply. Range extended
  // 30→60 and floor raised 0.05→0.2 — the far rows were dropping to ~10-12%
  // combined brightness well before reaching the actual back edge of the
  // grid, reading as an undefined haze rather than a sharp, visible edge.
  vAlpha = clamp(1.6 - vCamDist / 60.0, 0.2, 1.0);
}
`;

export const particleFragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;

varying float vAlpha;
varying float vSeed;
varying float vCamDist;

void main() {
  vec2 centered = gl_PointCoord - vec2(0.5);
  float dist = length(centered);
  if (dist > 0.5) discard;

  // Soft glowing dot rather than a hard circle. Exponent raised 1.2 → 1.5 —
  // a touch crisper at the edge than the brightness-focused pass, since the
  // far field was reading as an undefined smudge rather than a sharp point.
  float glow = smoothstep(0.5, 0.0, dist);
  glow = pow(glow, 1.5);

  // Monochrome off-white — only opacity varies per-particle, not hue, per
  // the "premium, subtle, futuristic, minimal" spec. Narrow range: rows and
  // columns need to read as consistent lines, not twinkling scatter.
  float alphaVariance = 0.82 + fract(vSeed * 12.9898) * 0.18;

  // Wider than a typical spherical-cloud fade — this scene's particles
  // recede much further into the distance (toward a horizon), so the fade
  // needs room to read as "distance haze" rather than a hard cutoff.
  // Extended 50→85 (render distance) — the grid's actual far edge
  // (~35-40 units, see shapePresets.ts) was landing well inside the old
  // fade zone, so the back of the wave was fading to a soft, undefined haze
  // well before its geometric end instead of rendering sharply out to it.
  float depthFade = smoothstep(85.0, 4.0, vCamDist);

  // uOpacity is the global ceiling (8-15% max) — everything else here only
  // ever attenuates further, never brightens past it.
  gl_FragColor = vec4(uColor, glow * vAlpha * depthFade * alphaVariance * uOpacity);
}
`;
