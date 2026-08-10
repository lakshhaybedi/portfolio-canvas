import type { Metadata, Viewport } from "next";
import "./globals.css";

// The tab title, the Google result, and every Slack/LinkedIn/WhatsApp link
// preview all read from here. This is the first thing a recruiter sees —
// often before the site itself finishes painting — so it carries the same
// positioning line as the hero rather than a generic site name.
const SITE_NAME = "Lakshhay Bedi";
const TITLE = "Lakshhay Bedi — Senior UX / Product Designer";
const DESCRIPTION =
  "Senior UX / Product Designer working on enterprise platforms, FinTech and healthcare. Case studies on T-Cloud, MAIA, Standard Bank and Elevance Health.";

// Open Graph image paths are root-relative, and social scrapers need them
// absolute — without a base, Next resolves them against localhost and every
// shared link previews with a broken image. Set NEXT_PUBLIC_SITE_URL to the
// real domain at build time; the placeholder below only keeps local builds
// warning-free.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lakshhaybedi.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    // Sub-pages set their own title and inherit this suffix.
    template: `%s — ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  keywords: [
    "UX Designer", "Product Designer", "Senior UX Designer",
    "Enterprise UX", "FinTech", "Healthcare", "Design Systems",
    "Interaction Design", "Portfolio",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
  // No `icons` entry: Next picks up src/app/favicon.ico and src/app/icon.svg
  // by convention and emits the link tags itself. The .ico is deliberately a
  // real multi-size icon (16/32/48) rather than only an SVG — browsers probe
  // /favicon.ico regardless of what's declared, and without it every page
  // load logged a 404 in the console.
};

// themeColor belongs in `viewport`, not `metadata`, in the App Router —
// it tints the browser chrome on mobile to match the page background so
// the dark theme doesn't stop abruptly at the address bar.
export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
