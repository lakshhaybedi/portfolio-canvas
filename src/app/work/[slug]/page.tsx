import type { Metadata } from "next";
import { CASE_STUDIES } from "@/lib/caseStudies";
import CaseStudyPage from "@/components/CaseStudyPage";

export function generateStaticParams() {
  return CASE_STUDIES.map((c) => ({ slug: c.slug }));
}

// Per-case-study titles and descriptions. Without these, all four pages
// shared one generic site title, so a shared link (or a search result) gave
// no indication which project it pointed at.
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const study = CASE_STUDIES.find((c) => c.slug === params.slug);
  if (!study) return {};

  const title = `${study.title} — ${study.company}`;
  return {
    title,
    description: study.overview,
    openGraph: {
      type: "article",
      title: `${title} — Lakshhay Bedi`,
      description: study.overview,
      images: study.heroImage ? [{ url: study.heroImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — Lakshhay Bedi`,
      description: study.overview,
      images: study.heroImage ? [study.heroImage] : undefined,
    },
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  return <CaseStudyPage slug={params.slug} />;
}
