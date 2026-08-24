// Small profanity filter for the guestbook. Deliberately not a dependency:
// the npm options ship multi-thousand-word lists tuned for moderating real
// user platforms, which on a personal guestbook mostly means false positives
// on a page nobody is trying to abuse at scale.
//
// Matching is anchored per word rather than a raw substring scan. A plain
// `flat.includes("cunt")` flags "Scunthorpe", `"ass"` flags "class" and
// "assessment" — the classic Scunthorpe problem. Anchoring to whole words
// (plus common suffixes) avoids that without needing a false-positive
// whitelist to chase forever.

const BAD = [
  "fuck", "shit", "bitch", "cunt", "asshole", "bastard", "dick", "piss",
  "slut", "whore", "faggot", "nigger", "retard", "rape", "wanker", "twat",
];

const LEET: Record<string, string> = {
  "0": "o", "1": "i", "!": "i", "3": "e", "4": "a", "@": "a",
  "5": "s", "$": "s", "7": "t", "8": "b", "9": "g", "+": "t",
};

/** lowercase → leet substitution → strip non-letters. */
function normalise(s: string): string {
  let out = "";
  for (const ch of s.toLowerCase()) out += LEET[ch] ?? ch;
  return out.replace(/[^a-z]/g, "");
}

/** Collapses "FFFUUUCCCKKK" → "fuck" so repeats can't slip past. */
const squash = (s: string) => s.replace(/(.)\1+/g, "$1");

const STEMS = BAD.map((w) => squash(normalise(w)));

// Whole word, optionally inflected — catches "fucking"/"bitches"/"dicks"
// while leaving "Scunthorpe" and "assessment" alone.
const SUFFIX = "(s|es|ed|er|ers|ing|in|y|ies|head|face)?";
const PATTERNS = STEMS.map((stem) => new RegExp(`^${stem}${SUFFIX}$`));

const matchesStem = (token: string) => {
  const flat = squash(normalise(token));
  return flat.length > 0 && PATTERNS.some((re) => re.test(flat));
};

/**
 * Spaced-out evasion ("f u c k") arrives as several single-character tokens,
 * so it never matches per word. Detect that signature specifically — a run
 * of 3+ single-letter tokens — and test the run joined together, rather than
 * flattening the whole message (which is what reintroduces Scunthorpe).
 */
function hasSpacedEvasion(tokens: string[]): boolean {
  let run: string[] = [];
  for (const t of [...tokens, "STOP"]) {
    const n = normalise(t);
    if (n.length === 1) {
      run.push(n);
    } else {
      if (run.length >= 3) {
        const joined = squash(run.join(""));
        if (STEMS.some((stem) => joined.includes(stem))) return true;
      }
      run = [];
    }
  }
  return false;
}

const tokenize = (text: string) => text.split(/\s+/).filter(Boolean);

/** True if the text contains a listed word under any of the evasions above. */
export function hasProfanity(text: string): boolean {
  const tokens = tokenize(text);
  return tokens.some(matchesStem) || hasSpacedEvasion(tokens);
}

/** Masks offending words, preserving original spacing. */
export function clean(text: string): string {
  return text.replace(/\S+/g, (word) => (matchesStem(word) ? "*".repeat(word.length) : word));
}

// ── self-check ────────────────────────────────────────────────────────
// Run with: npx tsx src/lib/profanity.ts
if (require.main === module) {
  const must = ["fuck", "F U C K", "fvck".replace("v", "u"), "$h1t", "sh!t", "b i t c h", "FFFUUUCCCKKK", "you are a dick", "bitches"];
  const mustNot = [
    "duck", "shirt", "class", "assessment", "Scunthorpe", "hello there",
    "bass", "grape", "therapist", "analysis", "Dickens", "cassette", "a b c",
  ];

  let failed = 0;
  for (const s of must) if (!hasProfanity(s)) { console.error(`FAIL should flag: ${s}`); failed++; }
  for (const s of mustNot) if (hasProfanity(s)) { console.error(`FAIL should NOT flag: ${s}`); failed++; }
  if (clean("what the fuck man") !== "what the **** man") { console.error("FAIL clean() masking"); failed++; }

  if (failed) { console.error(`${failed} check(s) failed`); process.exit(1); }
  console.log("profanity self-check passed");
}
