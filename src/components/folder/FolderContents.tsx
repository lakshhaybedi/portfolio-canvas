"use client";

import { motion } from "framer-motion";
import { DOCUMENTS } from "@/lib/documents";
import { staggerContainer } from "@/lib/motion";
import { useIsLowEndDevice } from "@/lib/useIsLowEndDevice";
import DocumentCard from "./DocumentCard";
import { FOLDER_BORDER, FOLDER_LABEL, FOLDER_PANEL, SPRING_BODY } from "./folderPalette";

// Delayed to land after the papers have risen (Stage 5 — "the document
// list becomes visible" is the last step in the sequence, not simultaneous
// with the papers). Spring, not the page's usual easeOutExpo tween — the
// brief calls for spring motion throughout the folder specifically.
const CONTENTS_TRANSITION = { ...SPRING_BODY, delay: 0.2 };

export default function FolderContents({ onOpenDoc }: { onOpenDoc: (id: string) => void }) {
  const lowEndDevice = useIsLowEndDevice();
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97, transition: { ...SPRING_BODY, delay: 0 } }}
      transition={CONTENTS_TRANSITION}
      style={{
        position: "absolute",
        top: "calc(100% + 14px)",
        // Anchored to the folder's right edge rather than centered: Framer
        // Motion composes its own `transform` from animated props (y,
        // scale) each render, silently overriding a plain CSS
        // `translateX(-50%)` string — centering never actually applied.
        // Right-anchoring also keeps the panel on-screen given the folder
        // itself sits near the right edge of the viewport.
        right: 0,
        width: 260,
        padding: 10,
        borderRadius: 18,
        background: `${FOLDER_PANEL}${lowEndDevice ? "F5" : "E0"}`,
        backdropFilter: lowEndDevice ? undefined : "blur(16px)",
        border: `1px solid ${FOLDER_BORDER}`,
        boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: FOLDER_LABEL,
          opacity: 0.75,
          padding: "4px 10px 8px",
        }}
      >
        My Documents
      </div>
      <motion.div
        variants={staggerContainer(0.04)}
        initial="hidden"
        animate="visible"
        style={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        {DOCUMENTS.map((doc) => (
          <DocumentCard key={doc.id} doc={doc} onOpen={onOpenDoc} />
        ))}
      </motion.div>
    </motion.div>
  );
}
