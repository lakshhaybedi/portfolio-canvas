// Single source of truth for the portfolio folder's contents — both the
// document rows shown when the folder opens and the windows they open into
// read from this list. Swap fileUrl to a real PDF and everything else
// (folder row, window title/icon, download link) updates automatically.
//
// `variants` is for documents that exist as several interchangeable files
// (the resume: EN/DE x Light/Dark) — the folder still shows one row, and
// PDFWindow renders a language/theme toggle that swaps which variant's
// fileUrl/sizeLabel is active, rather than listing all 4 as separate rows.
export interface DocumentVariant {
  id: string;
  lang: "EN" | "DE";
  theme: "Light" | "Dark";
  fileUrl: string;
  sizeLabel: string;
}

export interface PortfolioDocument {
  id: string;
  name: string;
  fileUrl: string;
  sizeLabel: string;
  updatedLabel: string;
  variants?: DocumentVariant[];
}

export const DOCUMENTS: PortfolioDocument[] = [
  {
    id: "resume",
    name: "Resume.pdf",
    // Default variant — English, dark, matching the site's own theme.
    fileUrl: "/documents/resume-en-dark.pdf",
    sizeLabel: "96 KB",
    updatedLabel: "Aug 2026",
    variants: [
      { id: "en-dark", lang: "EN", theme: "Dark", fileUrl: "/documents/resume-en-dark.pdf", sizeLabel: "96 KB" },
      { id: "en-light", lang: "EN", theme: "Light", fileUrl: "/documents/resume-en-light.pdf", sizeLabel: "96 KB" },
      { id: "de-dark", lang: "DE", theme: "Dark", fileUrl: "/documents/resume-de-dark.pdf", sizeLabel: "338 KB" },
      { id: "de-light", lang: "DE", theme: "Light", fileUrl: "/documents/resume-de-light.pdf", sizeLabel: "338 KB" },
    ],
  },
  {
    // Both files below have DOB, ID/candidate numbers, and (for the telc
    // one) birthplace genuinely removed before ever being written to
    // disk — not just visually covered. See scripts/redact-certificates.py.
    id: "ielts",
    name: "IELTS Score Report.pdf",
    fileUrl: "/documents/ielts-score-report.pdf",
    sizeLabel: "1015 KB",
    updatedLabel: "May 2026",
  },
  {
    id: "telc-b1",
    name: "telc Deutsch B1 Certificate.pdf",
    fileUrl: "/documents/telc-b1-certificate.pdf",
    sizeLabel: "1001 KB",
    updatedLabel: "Mar 2026",
  },
];
