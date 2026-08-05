"use client";

import { motion } from "framer-motion";
import type { PortfolioDocument } from "@/lib/documents";
import { fadeUp } from "@/lib/motion";
import { PAPER_COLOR } from "./folderPalette";

export default function DocumentCard({
  doc,
  onOpen,
}: {
  doc: PortfolioDocument;
  onOpen: (id: string) => void;
}) {
  return (
    <motion.button
      variants={fadeUp}
      onClick={() => onOpen(doc.id)}
      whileHover={{ backgroundColor: "rgba(237,234,212,0.06)" }}
      whileTap={{ scale: 0.98 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        padding: "8px 10px",
        borderRadius: 10,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        textAlign: "left",
        font: "inherit",
        color: "inherit",
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: 30,
          height: 38,
          flexShrink: 0,
          borderRadius: 4,
          background: PAPER_COLOR,
          position: "relative",
          overflow: "hidden",
        }}
        aria-hidden="true"
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 0,
            height: 0,
            borderStyle: "solid",
            borderWidth: "0 8px 8px 0",
            borderColor: "transparent var(--bg) transparent transparent",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 4,
            left: 4,
            right: 4,
            fontSize: 6,
            fontWeight: 700,
            letterSpacing: "0.04em",
            color: "#0A0A0A",
          }}
        >
          PDF
        </div>
      </div>

      {/* Name + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--fg)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {doc.name}
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
          {doc.sizeLabel} · {doc.updatedLabel}
        </div>
      </div>
    </motion.button>
  );
}
