import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Canvas",
  description:
    "An infinite, Figma-style board of the portfolio work — pan, zoom and arrange the case studies and UX flows spatially.",
  // A pannable infinite canvas has no meaningful crawlable content and no
  // stable URL per view; keeping it out of the index avoids competing with
  // the case-study pages for the same queries.
  robots: { index: false, follow: true },
};

export default function CanvasLayout({ children }: { children: React.ReactNode }) {
  return children;
}
