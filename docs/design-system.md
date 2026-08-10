# Design System — Portfolio Site

Extracted from the shipped product (`src/app/globals.css`, `src/lib/motion.ts`,
and the inline style objects across `src/`). Every value here is one the live
site actually uses — this is documentation of what exists, not a proposal.

Doubles as the authoring spec for the Figma variable collections: each table
below maps 1:1 onto a Figma variable group.

---

## 1. Colour

Figma collection: **Color** · modes: `Dark` (only mode shipped)

The identity was originally light/cream on white. It was inverted for the
build: cream became the foreground, near-black the surface. That inversion is
the single most consequential visual decision in the system — everything below
follows from it.

### Surface

| Variable | Value | Use |
|---|---|---|
| `bg` | `#0A0A0A` | Page background |
| `bg-elevated` | `#151517` | Cards, panels, hover rows, window chrome |
| `bg-tint` | `#121214` | Subtle fills between bg and bg-elevated |

### Content

| Variable | Value | Use |
|---|---|---|
| `fg` | `#EDEAD4` | Primary text, headlines |
| `fg-invert` | `#0A0A0A` | Text on a `fg`-filled surface (buttons) |
| `muted` | `rgba(237,234,212,0.60)` | Secondary text, labels, meta |
| `muted-strong` | `rgba(237,234,212,0.78)` | Body copy, readable secondary |

> `muted` at 0.60 alpha sits near the 4.5:1 floor on `bg`. It is safe for
> labels and meta, not for anything a reader must parse at length — body copy
> uses `muted-strong`. The contact email was moved off `muted` onto `fg` for
> exactly this reason.

### Line

| Variable | Value | Use |
|---|---|---|
| `border` | `rgba(237,234,212,0.12)` | Default hairlines, dividers |
| `border-strong` | `rgba(237,234,212,0.20)` | Emphasised edges, focus, active |

### Accent — per case study

Each project carries its own accent, derived from the client's brand. Three
values per accent, because one colour cannot do all three jobs on a dark
surface.

| Project | `accent` (fills) | `accentText` (as text) | `badgeOnAccent` (text on fill) |
|---|---|---|---|
| T-Cloud | `#E20074` | `#E83390` | `#FFFFFF` |
| Standard Bank | `#00B4AA` | — | — |
| Elevance | `#7C6AF7` | — | — |

> `accent` always clears contrast as a *fill*, but two of the three fall under
> 4.5:1 when used as *text* — hence `accentText`, a lightened variant. And pure
> white fails on the lighter accents when placed *on* a fill, hence
> `badgeOnAccent`. Three roles, not one token.

---

## 2. Typography

Figma collection: **Type** · Space Grotesk (300–700), system fallback.

Sizes are fluid `clamp(min, preferred, max)`. Figma has no fluid type, so each
style is authored twice: at its **min** (mobile, 375) and **max** (desktop,
1440). Both bounds are listed.

| Style | Min | Max | Weight | Tracking | Use |
|---|---|---|---|---|---|
| Display | 48 | 112 | 700 | −0.03em | Contact headline |
| H1 / Hero | 28 | 56 | 700 | −0.02em | Homepage hero |
| H1 / Case study | 40 | 96 | 700 | −0.03em | Case study title |
| H2 / Section | 36 | 64 | 700 | −0.02em | Page section headers |
| H3 / Project row | 26 | 54 | 700 | −0.02em | Work list titles |
| H3 / Card | 20 | 36 | 700 | −0.01em | Decision + outcome cards |
| Body / Large | 22 | 22 | 300 | −0.01em | About paragraphs |
| Body | 16 | 16 | 300 | 0 | Default paragraph |
| Body / Small | 14 | 14 | 300 | 0 | Captions, descriptions |
| Label | 11 | 11 | 600–700 | 0.10em | Uppercase section labels, nav |
| Label / Wide | 11 | 11 | 700 | 0.14em–0.20em | Eyebrow labels |
| Mono / Meta | 13 | 13 | 500 | 0.05em | Clock, timestamps |

**The label idiom.** Anything 11px is uppercase, 600–700 weight, and tracked
0.10em or wider. This one rule covers the nav, every section header, button
text, and meta — it is what makes the small text feel like a system rather
than a pile of one-offs. Tracking below 0.06em is reserved for large type,
where it goes *negative*.

---

## 3. Spacing

Figma collection: **Spacing** · 4px base grid.

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 36 · 48 · 64 · 72 · 80 · 100`

Named `space-1` … `space-25` where the number is the value ÷ 4.

Layout constants not in the ramp (they are structural, not spacing):
- Page gutter: `48px` desktop, `16px` ≤640px
- Nav height: `64px`
- Section rhythm: `100px` top padding, `72px` inside case studies

---

## 4. Radius

| Variable | Value | Use |
|---|---|---|
| `radius-sm` | `8px` | Buttons, inputs, small cards |
| `radius-md` | `16px` | Large cards, the canvas CTA |
| — | `999px` | Pills (filter chips, control bars) |
| — | `10px` | Browser-frame chrome |
| — | `24 / 30px` | Phone-frame screen / bezel |

---

## 5. Motion

Figma has no equivalent for these — documented for the prototype's transitions
and for engineering handoff.

| Token | Value | Use |
|---|---|---|
| `ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | Every entrance |
| Reveal | `opacity 0→1, y 32→0, blur 6→0`, 0.85s | Section entrances |
| Reveal (reduced) | `opacity 0→1`, 0.15s, no movement | `prefers-reduced-motion` |
| Stagger | `0.04–0.1s` between children | Lists |
| Viewport trigger | `once: true, amount: 0.12` | Fires at 12% visible, never repeats |
| Hero parallax | `−30 / −170 / −300px` across 3 depths | Case-study hero stack |

**Every motion token has a reduced-motion counterpart.** `revealVariant()`
picks between them at the call site, so honouring the preference is the default
path rather than something remembered per-component.

---

## 6. Components

The inventory to build as Figma components, with the variants each needs.

| Component | Variants |
|---|---|
| Nav bar | default · case-study (with project switcher) |
| Filter pill | default · active · hover |
| Work row | rest · hover (expanded description + accent title) |
| Service row | collapsed · expanded |
| Tool pill | rest · hover (brand icon + tint) |
| Browser frame | with tab label |
| Phone frame | — |
| Case-study hero stack | desktop (3 plates) · mobile (3 phones) |
| Decision card | numbered |
| Outcome tile | — |
| Document row | single file · multi-version |
| PDF window | default · maximised |
| Portfolio folder | closed · open |
| Lightbox | image · video · unavailable |
| Button | primary (fg fill) · secondary (outline) · text |

---

## 7. Breakpoints

| Name | Width | Behaviour |
|---|---|---|
| Mobile | ≤640px | Single column; work rows restack; case-study sidebar becomes a bottom carousel; gutters 16px |
| Desktop | >640px | Two-column case study, 48px gutters |

Only one breakpoint. The layouts are fluid between them rather than stepped —
which is why the type is `clamp()` rather than a set of fixed sizes.
