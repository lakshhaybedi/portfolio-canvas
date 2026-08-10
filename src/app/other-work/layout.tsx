import type { Metadata } from "next";

// The page itself is a client component (lightbox state, keyboard nav), and
// client components can't export metadata — this thin server layout carries
// it instead. Same pattern for /canvas and the magazine route.
export const metadata: Metadata = {
  title: "Other Work",
  description:
    "Branding, identity and experimental work alongside the flagship case studies: Yurbban Trafalgar, Lo Bello Estates, Mi Casa, Sabato Locale and more.",
};

export default function OtherWorkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
