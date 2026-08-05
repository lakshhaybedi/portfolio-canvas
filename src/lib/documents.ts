// Single source of truth for the portfolio folder's contents — both the
// document rows shown when the folder opens and the windows they open into
// read from this list. Swap fileUrl to a real PDF and everything else
// (folder row, window title/icon, download link) updates automatically.
export interface PortfolioDocument {
  id: string;
  name: string;
  fileUrl: string;
  sizeLabel: string;
  updatedLabel: string;
}

export const DOCUMENTS: PortfolioDocument[] = [
  {
    id: "resume",
    name: "Resume.pdf",
    fileUrl: "/documents/resume.pdf",
    sizeLabel: "1 KB",
    updatedLabel: "Aug 2024",
  },
  {
    id: "ux-portfolio",
    name: "UX Portfolio.pdf",
    fileUrl: "/documents/ux-portfolio.pdf",
    sizeLabel: "1 KB",
    updatedLabel: "Jul 2024",
  },
  {
    id: "certificates",
    name: "Certificates.pdf",
    fileUrl: "/documents/certificates.pdf",
    sizeLabel: "1 KB",
    updatedLabel: "Jun 2024",
  },
  {
    id: "case-studies",
    name: "Case Studies.pdf",
    fileUrl: "/documents/case-studies.pdf",
    sizeLabel: "1 KB",
    updatedLabel: "Aug 2024",
  },
  {
    id: "awards",
    name: "Awards.pdf",
    fileUrl: "/documents/awards.pdf",
    sizeLabel: "1 KB",
    updatedLabel: "May 2024",
  },
];
