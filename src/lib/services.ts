// Services offered — each links to real proof of work rather than a
// generic "see my portfolio" catch-all. UX Audits has no dedicated case
// study or Behance project to point at, so its link goes to the general
// Work section instead of inventing a specific audit engagement.

export type Service = {
  slug: string;
  title: string;
  description: string;
  proofLabel: string;
  proofHref: string;
};

export const SERVICES: Service[] = [
  {
    slug: "ux-ui-design",
    title: "UX/UI Design",
    description: "End-to-end product design: research, flows, information architecture, and high-fidelity UI for web and mobile.",
    proofLabel: "T-Cloud Dashboard",
    proofHref: "/work/t-cloud",
  },
  {
    slug: "ux-audits",
    title: "UX Audits",
    description: "A structured review of an existing product: usability issues, accessibility gaps, and a prioritized list of fixes.",
    proofLabel: "See the case studies",
    proofHref: "/#work",
  },
  {
    slug: "website-design",
    title: "Website Design",
    description: "Marketing and product websites designed to convert, not just look good.",
    proofLabel: "Mi Casa marketing site",
    proofHref: "/other-work#mi-casa-website",
  },
  {
    slug: "branding",
    title: "Branding & Visual Identity",
    description: "Logo, identity systems, and brand guidelines built to hold up across every surface they touch.",
    proofLabel: "Yurbban Trafalgar rebrand",
    proofHref: "/other-work#yurbban-trafalgar",
  },
  {
    slug: "design-systems",
    title: "Design Systems",
    description: "Component libraries and pattern languages that let a product team ship consistently without reinventing the wheel each time.",
    proofLabel: "T-Cloud & MAIA design systems",
    proofHref: "/work/t-cloud",
  },
  {
    slug: "user-research",
    title: "User Research & Service Design",
    description: "Interviews, journey mapping, and service-blueprint work to find where a product or experience is actually breaking down.",
    proofLabel: "Standard Bank field research",
    proofHref: "/work/standard-bank",
  },
  {
    slug: "presentation-design",
    title: "Presentation & Pitch Design",
    description: "Decks and proposals built to be read, not just presented: clear structure, one idea per slide.",
    proofLabel: "Sabato Locale proposal",
    proofHref: "/other-work#sabato-locale",
  },
];
