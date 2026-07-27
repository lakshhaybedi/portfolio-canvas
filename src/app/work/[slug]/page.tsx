import { CASE_STUDIES } from "@/lib/caseStudies";
import CaseStudyPage from "@/components/CaseStudyPage";

export function generateStaticParams() {
  return CASE_STUDIES.map((c) => ({ slug: c.slug }));
}

export default function Page({ params }: { params: { slug: string } }) {
  return <CaseStudyPage slug={params.slug} />;
}
