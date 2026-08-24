// Chain mechanics for the Zuma clone. Pure data, no rendering — this is the
// part with all the edge cases, so it's kept testable on its own.
//
// A segment is a contiguous run of touching balls. `balls[0]` is the FRONT
// (nearest the hole) and `head` is its arc distance, so ball j sits at
// `head - j * SPACING`. Popping mid-chain splits one segment into two, and
// the back one then slides forward to catch the front one — when they touch
// and the colours line up, that's the combo cascade, which falls out of the
// merge logic rather than needing special-casing.

export const SPACING = 25;

export type Segment = { balls: number[]; head: number };

export const tailOf = (s: Segment) => s.head - (s.balls.length - 1) * SPACING;
export const distOf = (s: Segment, i: number) => s.head - i * SPACING;

/** Widest run of one colour containing `idx`. */
export function runAt(balls: number[], idx: number): { start: number; end: number } {
  const c = balls[idx];
  let start = idx;
  let end = idx;
  while (start > 0 && balls[start - 1] === c) start--;
  while (end < balls.length - 1 && balls[end + 1] === c) end++;
  return { start, end };
}

/**
 * Removes balls[start..end]. Returns the pieces left over — two segments if
 * the gap was in the middle, one if it was at an edge, none if it emptied.
 * The back piece keeps its real distance, so it has a visible gap to close.
 */
export function splitOnRemoval(seg: Segment, start: number, end: number): Segment[] {
  const out: Segment[] = [];
  if (start > 0) out.push({ balls: seg.balls.slice(0, start), head: seg.head });
  if (end < seg.balls.length - 1) {
    out.push({ balls: seg.balls.slice(end + 1), head: distOf(seg, end + 1) });
  }
  return out;
}

/** Inserts a ball, pushing everything behind it further from the hole. */
export function insertAt(seg: Segment, idx: number, color: number): Segment {
  const balls = [...seg.balls];
  balls.splice(idx, 0, color);
  return { balls, head: seg.head }; // head unchanged: the chain grows backwards
}

/**
 * Pops any run of 3+ at `idx`, then keeps resolving: merged neighbours can
 * form new runs, which is the cascade. Returns the resulting segments and
 * how many balls went away.
 *
 * `segs` must be ordered front-to-back.
 */
export function resolve(segs: Segment[], idx?: { seg: number; ball: number }): { segs: Segment[]; popped: number } {
  let list = segs.filter((s) => s.balls.length > 0);
  let popped = 0;

  // First pass: an explicit insertion point, if one was given.
  if (idx) {
    const s = list[idx.seg];
    if (s) {
      const { start, end } = runAt(s.balls, idx.ball);
      if (end - start + 1 >= 3) {
        popped += end - start + 1;
        list.splice(idx.seg, 1, ...splitOnRemoval(s, start, end));
      }
    }
  }

  // Then settle: close gaps, merge on contact, pop anything the merge made.
  // Loops until stable so one shot can chain several times.
  for (let guard = 0; guard < 64; guard++) {
    let changed = false;

    for (let i = 1; i < list.length; i++) {
      const front = list[i - 1];
      const back = list[i];
      if (back.head < tailOf(front) - SPACING - 0.001) continue; // still a gap

      const junction = front.balls.length;
      const merged: Segment = { balls: [...front.balls, ...back.balls], head: front.head };
      list.splice(i - 1, 2, merged);

      // The new adjacency is at `junction`; check both sides of the seam.
      for (const probe of [junction - 1, junction]) {
        if (probe < 0 || probe >= merged.balls.length) continue;
        const { start, end } = runAt(merged.balls, probe);
        if (end - start + 1 >= 3) {
          popped += end - start + 1;
          list.splice(i - 1, 1, ...splitOnRemoval(merged, start, end));
          break;
        }
      }
      changed = true;
      break;
    }

    list = list.filter((s) => s.balls.length > 0);
    if (!changed) break;
  }

  return { segs: list, popped };
}

/**
 * Advances the chain. The front segment creeps toward the hole; every
 * segment behind rushes to close its gap. Merging/popping is left to
 * `resolve` so the two concerns stay separate.
 */
export function advance(segs: Segment[], dt: number, baseSpeed: number, catchUp: number): Segment[] {
  if (segs.length === 0) return segs;
  const out = segs.map((s) => ({ ...s, balls: [...s.balls] }));
  out[0].head += baseSpeed * dt;
  for (let i = 1; i < out.length; i++) {
    const target = tailOf(out[i - 1]) - SPACING;
    if (out[i].head < target) out[i].head = Math.min(target, out[i].head + catchUp * dt);
  }
  return out;
}

// ── self-check ────────────────────────────────────────────────────────
// Run with: npx tsx src/lib/zumaChain.ts
if (require.main === module) {
  let failed = 0;
  const check = (label: string, cond: boolean) => { if (!cond) { console.error(`FAIL ${label}`); failed++; } };

  // A middle removal must leave two pieces, with the back one holding a gap.
  const seg: Segment = { balls: [0, 1, 1, 1, 2], head: 500 };
  const parts = splitOnRemoval(seg, 1, 3);
  check("split yields two pieces", parts.length === 2);
  check("front piece keeps head", parts[0].head === 500 && parts[0].balls.length === 1);
  check("back piece keeps its distance", parts[1].head === 500 - 4 * SPACING);

  // Inserting a third match pops all three.
  const r1 = resolve([insertAt({ balls: [1, 1, 2], head: 300 }, 0, 1)], { seg: 0, ball: 0 });
  check("run of 3 pops", r1.popped === 3);
  check("survivor remains", r1.segs.length === 1 && r1.segs[0].balls.length === 1);

  // Edge removal leaves one piece, not two empties.
  const r2 = resolve([{ balls: [1, 1, 1, 2, 2], head: 300 }], { seg: 0, ball: 1 });
  check("edge removal leaves one piece", r2.segs.length === 1 && r2.segs[0].balls.length === 2);

  // Cascade is deliberately NOT instant: popping the 1s leaves a gap, the
  // back piece slides forward over the next frames, and only when it touches
  // does the combo fire. Doing it in one resolve would rob the player of the
  // moment the gap closes — the best part of the game.
  const cascade: Segment[] = [
    { balls: [2, 2], head: 400 },
    { balls: [1, 1, 1, 2], head: 400 - 2 * SPACING },
  ];
  const r3a = resolve(cascade, { seg: 1, ball: 1 });
  check("first pop takes the run of 1s", r3a.popped === 3);
  check("a gap is left behind", r3a.segs.length === 2);

  const closed = advance(r3a.segs, 1, 0, 1000); // let the gap close
  const r3b = resolve(closed);
  check("combo fires once the gap closes", r3b.popped === 3);
  check("cascade clears the board", r3b.segs.length === 0);

  // A real gap must NOT merge.
  const gapped = advance(
    [{ balls: [0], head: 400 }, { balls: [1], head: 100 }],
    0, 0, 0,
  );
  const r4 = resolve(gapped);
  check("distant segments stay apart", r4.segs.length === 2 && r4.popped === 0);

  // Catch-up must stop exactly at contact, never overlap.
  const closing = advance([{ balls: [0], head: 400 }, { balls: [1], head: 300 }], 1, 0, 1000);
  check("catch-up clamps at contact", closing[1].head === 400 - SPACING);

  if (failed) { console.error(`${failed} check(s) failed`); process.exit(1); }
  console.log("zuma chain self-check passed");
}
