# Case study draft — Portfolio Site

Working draft for the fifth case study. Structured to drop into the existing
`CaseStudy` type in `src/lib/caseStudies.ts`, so the headings below map onto
the fields that type already has.

---

## Meta

- **slug:** `portfolio-site`
- **index:** `05`
- **title:** Portfolio Site
- **company:** Personal
- **year:** 2026
- **tags:** Design Systems, Interaction Design, Front-End
- **accent:** `#EDEAD4` (the site's own cream — this project's brand is itself)
- **heroDevice:** desktop

---

## Overview

A portfolio that had to survive being read by the kind of person it was built
to impress. Designers get judged on the thing they use to present their
judgement, which makes a portfolio site a uniquely unforgiving brief: every
shortcut in it is a claim about how you work.

It started from two places. A wireframe system worked out on paper — the
structure of the work list, the case-study layout, how the folder metaphor
would behave — and a generated starter site that supplied a working Next.js
shell and nothing else worth keeping. Everything after that was built by
describing intent to an AI pair and reviewing what came back, which is the
part most portfolios would leave out. It's in here because it's the honest
account of how the thing got made, and because knowing what to ask for and
what to reject turned out to be the entire job.

---

## Scope & Constraints

**No coding background.** Every line was written by an AI pair. My job was
specification, review, and rejection — deciding what "right" looked like and
sending back what wasn't. That constraint shaped the process more than any
technical one.

**A generated starting point, not a blank page.** The starter arrived with a
light/cream identity, placeholder copy, and its own defaults. Inverting it to
the dark identity was the first real decision, and it cascaded through every
token in the system.

**Static hosting, no backend.** The whole site is a static export. No server
means no server-side secrets, no database, and no runtime image processing —
performance had to be solved at build time or not at all.

**Real client work under NDA-adjacent care.** T-Mobile, Standard Bank and
Elevance screens are real product. Nothing could be invented, and nothing
could be represented as something it wasn't.

---

## Design Decisions

### 01 — Inverting the identity

The starter was cream-on-white. Flipping to cream-on-near-black wasn't a taste
call: the portfolio is mostly full-bleed product screenshots, and the majority
of that work is dark-mode enterprise UI. A light chrome fought every screen it
framed. Inverting meant the site receded and the work carried the contrast.

That one decision generated the token set. `#EDEAD4` on `#0A0A0A` forced
`muted` and `muted-strong` to exist as separate alpha steps, because a single
"secondary text" value can't serve both a 14px paragraph and an 11px label at
acceptable contrast on a dark surface.

### 02 — One accent per project, in three roles

Each case study carries its client's colour. The naive version — one hex per
project — broke immediately: T-Mobile magenta passes contrast as a *fill* but
fails as *text* on the dark background, and white text fails *on top of* the
lighter accents.

So each accent is three tokens, not one: `accent` for fills, `accentText` for
type, `badgeOnAccent` for text sitting on a filled shape. Verified against
4.5:1, not eyeballed. The lesson is that a colour token is a role, not a value.

### 03 — Frames that tell the truth about the platform

Every case-study hero originally sat in the same desktop browser chrome with a
fabricated URL. That put Standard Bank's iOS app — status bar, home indicator
and all — inside a browser window with a made-up address bar.

It's a small thing that quietly misrepresents the work. Frames are now
device-true: a phone bezel for the mobile product, browser chrome for the web
ones, and the chrome's tab shows the screen's real name instead of an invented
hostname. Elevance nearly got mis-assigned too — its screens are tall and
*look* mobile by aspect ratio, but they're full-page desktop captures with the
nav and footer visible.

### 04 — Motion that survives being scrolled past fast

The hero screens are layered and drift apart on scroll. The first build was
technically working and effectively invisible, and the reason was a range
error, not a distance one: the drift was mapped from where the hero *enters
the viewport*, but the hero is already on screen at load. Readers began
halfway through the range and only ever saw the back half of the motion.

Re-anchoring the range to the scroll that actually happens — plus widening the
spread — did more than any amount of increasing the numbers would have. The
general version of this: an animation nobody notices is more often mapped to
the wrong input range than tuned to the wrong output.

### 05 — Every animation has a reduced-motion counterpart

The site's entrances move, blur, and stagger. All of it collapses to a plain
0.15s opacity fade under `prefers-reduced-motion`, and the parallax flattens to
zero. This is enforced at the token level: `revealVariant()` picks the right
variant at every call site, so honouring the preference is the default path
rather than something to remember per component.

### 06 — The folder, and knowing when to stop

The documents folder is the one piece of pure interface personality: a 3D
folder that tilts toward the cursor and opens into a file list, with PDFs in
draggable, resizable windows. It's also where the most work got thrown away —
an earlier page-flip magazine animation was rebuilt three times and eventually
reverted to the library's native behaviour, because a hand-built version that
was subtly wrong in both directions was worse than a stock one that worked.

---

## What changed, measured

### Performance

The portfolio is 238 images of dense product UI — the heaviest thing about it
is unavoidable, so it had to be handled rather than reduced.

- **Images: 54.4MB → 19.8MB (−64%)** via WebP siblings served through
  `<picture>`, with the originals kept as fallback so older browsers still get
  a working image rather than a broken one.
- **Other Work initial load: 4073KB → 240KB (−94%)** — the page was eagerly
  fetching 15 full-resolution covers, including a 1167KB JPEG rendering into a
  260px card.
- **Three.js: 668KB, now conditional.** The WebGL hero already checked for
  low-end hardware and reduced-motion — but the check ran *after* the library
  had downloaded. Moving it behind a dynamic boundary means the devices that
  fall back to a CSS gradient no longer download the 670KB they'll never use:
  roughly half the homepage payload, removed for exactly the hardware least
  able to afford it.

### Accessibility

- **1 heading → 16.** The homepage had a single `h1` and nothing else; every
  section title and project name was a styled `<div>`. Screen-reader users had
  no outline to navigate and search engines saw a flat wall of divs. Rendering
  is pixel-identical — the fix was semantic, not visual.
- Contrast floors verified per token rather than per component.
- Full keyboard paths through the lightbox, folder, and PDF windows, with
  focus trapping and restoration.

### Security

A password sat in plaintext in a public repository, in git history, and in the
shipped JavaScript bundle. It gated nothing of value — local canvas edits in
the visitor's own browser — but a plaintext credential in a public repo is
what credential-scraping bots harvest to try against unrelated accounts. The
gate now compares a SHA-256 digest, so no reusable secret appears anywhere in
the repo.

The site's metadata also still said *"My Website"* and *"Built with Sintra"* —
which was the title on every browser tab, search result, and shared link
preview for the entire time it was live.

---

## Outcomes

- A design system documented from a shipped product rather than proposed ahead
  of one: 11 colour roles, a 13-step spacing ramp, 12 type styles, and a motion
  set with a reduced-motion pair for every entrance.
- 64% lighter image payload and a homepage that halves itself on low-end
  hardware, with no visual compromise on capable machines.
- A full semantic heading structure and verified contrast, retrofitted without
  changing a single rendered pixel.
- Built end-to-end without writing code — by specifying, reviewing, and
  rejecting until the result matched the intent.

---

## Reflection

The most useful skill turned out to be the least technical one. An AI pair will
produce something plausible for almost any request, and plausible is the
dangerous failure mode — the parallax that technically animated but was mapped
to the wrong range, the `<picture>` element that silently broke instead of
falling back, the hero frame that presented an iOS app as a website. None of
those threw an error. All of them needed someone to look at the result and say
that isn't right, and know why.

That's the same job as reviewing any engineer's work, which is the part of
design practice this project sharpened most.

---

## Screens to capture for Figma

Ordered for the case-study page's screens sidebar.

1. Homepage — hero
2. Homepage — Selected Work (with tag filter)
3. Homepage — Selected Work, row hover state
4. Homepage — Services accordion, expanded
5. Homepage — About, tool pills with brand hover
6. Case study — hero stack (desktop)
7. Case study — hero stack (mobile / Standard Bank)
8. Case study — decisions
9. Other Work — grid
10. Other Work — lightbox
11. Yurbban Trafalgar — page-flip magazine
12. Documents folder — open
13. PDF window — resume with EN/DE · Light/Dark toggle
14. Canvas — infinite board
15. Design system — token sheet
