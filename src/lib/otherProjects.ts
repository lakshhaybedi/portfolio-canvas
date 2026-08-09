// "Other Projects" — the broader body of Behance work sitting alongside the
// four deep case studies. Lighter treatment than caseStudies.ts on purpose:
// title, category, and a gallery pulled from Behance, no full narrative.
// Nab. and Nothing Out There are deliberately left out: their source content
// on Behance is gone (an embedded Scribd document deleted by the owner, and
// a YouTube video taken down), confirmed by checking both directly, so
// there's nothing to show beyond a broken-looking placeholder card.

export type OtherProjectCategory = "ux" | "branding" | "experimental";

export type OtherProject = {
  slug: string;
  title: string;
  category: OtherProjectCategory;
  year?: string;
  description: string;
  images: string[];
  // The physical printed cover — used as the rotating "closed book" thumbnail
  // on the grid card and, for the 3D magazine, as page one so it opens from
  // its actual cover instead of straight into the first spread.
  coverImage?: string;
  video?: string;
  behanceUrl: string;
};

function seq(dir: string, count: number, ext = "jpg"): string[] {
  return Array.from({ length: count }, (_, i) => `/other-work/${dir}/${String(i + 1).padStart(2, "0")}.${ext}`);
}

export const OTHER_PROJECTS: OtherProject[] = [
  {
    // Unlike the rest of this file, these pages are rendered directly from
    // the source "Master Final Project" PDF, not pulled from Behance — a
    // sharper, unwatermarked source for the one project that gets the full
    // 3D magazine treatment.
    slug: "yurbban-trafalgar",
    title: "Hotel Yurbban Trafalgar, Barcelona: Rebranding",
    category: "branding",
    description: "Full rebrand for a boutique hotel in Barcelona: identity, collateral, and brand guidelines.",
    images: seq("yurbban-trafalgar", 71),
    coverImage: "/other-work/yurbban-trafalgar/cover.jpg",
    behanceUrl: "https://www.behance.net/gallery/129227345/Hotel-Yurbban-Trafalgar-Barcelona-Rebranding",
  },
  {
    slug: "lo-bello",
    title: "Lo Bello Estates Wine Rebranding",
    category: "branding",
    description: "Label and identity redesign for a Sicilian wine estate.",
    images: seq("lo-bello", 8),
    behanceUrl: "https://www.behance.net/gallery/129226475/Lo-Bello-Estates-Wine-Rebranding",
  },
  {
    slug: "yurbban-pass",
    title: "Yurbban Pass Application",
    category: "ux",
    year: "2021",
    description: "An app built for Yurbban Trafalgar, Barcelona: guest pass and hotel services in one place.",
    images: seq("yurbban-pass", 1),
    behanceUrl: "https://www.behance.net/gallery/121198617/Yurbban-Pass-Application",
  },
  {
    slug: "sabato-locale",
    title: "Sabato Locale: Event Proposal for Castello Del Nero",
    category: "branding",
    description: "Event concept and proposal design for a market event at Castello Del Nero.",
    images: [
      "/other-work/sabato-locale/04-cover.jpg",
      "/other-work/sabato-locale/01.jpg",
      "/other-work/sabato-locale/02.jpg",
      "/other-work/sabato-locale/03.jpg",
    ],
    behanceUrl: "https://www.behance.net/gallery/108469017/Sabato-Locale-Event-proposal-for-Castello-Del-Nero",
  },
  {
    slug: "mi-casa-ios",
    title: "iOS Presentation for Mi Casa App",
    category: "ux",
    year: "2019",
    description: "iOS app presentation deck for Mi Casa.",
    images: seq("mi-casa-ios", 1),
    behanceUrl: "https://www.behance.net/gallery/89789899/iOS-Presentation-for-Mi-Casa-app",
  },
  {
    slug: "mi-casa-website",
    title: "Marketing Website for Mi Casa App",
    category: "ux",
    description: "Marketing site design for the Mi Casa app launch.",
    images: seq("mi-casa-website", 1),
    behanceUrl: "https://www.behance.net/gallery/89789693/Marketing-website-for-Mi-Casa-app",
  },
  {
    slug: "solace",
    title: "Solace: AI vs Human Peg Solitaire Game",
    category: "experimental",
    year: "2019",
    description: "A peg solitaire game with an AI opponent, built as a personal project.",
    images: ["/other-work/solace/01-cover.jpg"],
    behanceUrl: "https://www.behance.net/gallery/78061449/Solace-AI-vs-Human-Peg-Solitaire-game",
  },
  {
    slug: "art-works",
    title: "Art Works (Multiple Mediums)",
    category: "experimental",
    description: "Personal art across painting, illustration, and mixed media.",
    images: seq("art-works", 15),
    behanceUrl: "https://www.behance.net/gallery/77966285/Art-works-(Multiple-Mediums)",
  },
  {
    slug: "logo-explainer",
    title: "Logo Explainer",
    category: "branding",
    description: "A short animated logo reveal and explainer.",
    images: ["/other-work/logo-explainer/01-cover.jpg"],
    video: "/other-work/logo-explainer/logo-explainer.mp4",
    behanceUrl: "https://www.behance.net/gallery/68444245/Logo-Explainer-(Project-2)",
  },
  {
    slug: "newsletter-design",
    title: "Newsletter Design",
    category: "branding",
    description: "Editorial layout design for a print newsletter.",
    images: seq("newsletter-design", 1),
    behanceUrl: "https://www.behance.net/gallery/68444159/Newsletter-Design",
  },
];

export const CATEGORY_LABELS: Record<OtherProjectCategory, string> = {
  ux: "UX / Product",
  branding: "Branding / Visual",
  experimental: "Experimental",
};
