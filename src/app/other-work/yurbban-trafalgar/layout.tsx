import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yurbban Trafalgar — Brand Design & Management",
  description:
    "Master's final project: a full brand design and management system for Hotel Yurbban Trafalgar, presented as a page-turning magazine.",
};

export default function YurbbanTrafalgarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
