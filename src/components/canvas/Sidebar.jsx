"use client";
import { useState, useRef } from "react";
import { useCanvasStore, SEED_PAGE_IDS } from "@/lib/useCanvasStore";

export default function Sidebar({ activePageId, onSelect }) {
  const isAdmin = useCanvasStore((s) => s.isAdmin);
  const pages = useCanvasStore((s) => s.pages);
  const addPage = useCanvasStore((s) => s.addPage);
  const renamePage = useCanvasStore((s) => s.renamePage);
  const deletePage = useCanvasStore((s) => s.deletePage);
  const reorderPages = useCanvasStore((s) => s.reorderPages);
  const unlock = useCanvasStore((s) => s.unlock);
  const lock = useCanvasStore((s) => s.lock);

  const [editingId, setEditingId] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [flowsOpen, setFlowsOpen] = useState(true);
  const dragIndexRef = useRef(null);

  const submitRename = (id) => {
    if (editVal.trim()) renamePage(id, editVal.trim());
    setEditingId(null);
  };

  const handleUnlock = () => {
    const ok = unlock(pwInput);
    if (!ok) { setPwError(true); setPwInput(""); }
    else { setShowPw(false); setPwInput(""); setPwError(false); }
  };

  // Auto-generated case-study flow pages (Figma-sourced reference material,
  // kept in sync with their data files) grouped apart from admin-editable
  // pages like the main "Portfolio" — a flat list of both together reads
  // fine at 5 pages, but the seed-page count grows with every new case
  // study, and mixing "content I hand-edit" with "content that regenerates
  // itself" in one undifferentiated list stops being legible well before
  // that.
  const mainPages = pages.filter((p) => !SEED_PAGE_IDS.has(p.id));
  const flowPages = pages.filter((p) => SEED_PAGE_IDS.has(p.id));

  const rowProps = {
    activePageId, onSelect, isAdmin,
    editingId, setEditingId, editVal, setEditVal, submitRename,
    deletePage, canDelete: pages.length > 1,
    dragIndexRef, reorderPages, pages,
  };

  return (
    <div
      style={{
        width: 200,
        flexShrink: 0,
        background: "#111",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Space Grotesk', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Logo / title */}
      <div
        style={{
          padding: "14px 16px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div style={{
          fontSize: 13, fontWeight: 700, color: "#EDEAD4",
          letterSpacing: "-0.01em",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontSize: 16 }}>◈</span> Canvas
        </div>
        <a
          href="/"
          style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
            textTransform: "uppercase", textDecoration: "none",
            color: "rgba(237,234,212,0.35)",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(237,234,212,0.8)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(237,234,212,0.35)")}
        >
          ← Portfolio
        </a>
      </div>

      {/* Pages list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {mainPages.map((page, idx) => (
          <PageRow key={page.id} page={page} displayIndex={idx} {...rowProps} />
        ))}

        {flowPages.length > 0 && (
          <>
            <button
              onClick={() => setFlowsOpen((o) => !o)}
              aria-expanded={flowsOpen}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 6,
                padding: "10px 14px 6px", marginTop: mainPages.length > 0 ? 4 : 0,
                background: "transparent", border: "none", cursor: "pointer",
                fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "rgba(237,234,212,0.35)",
              }}
            >
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{
                transform: flowsOpen ? "rotate(90deg)" : "none", transition: "transform 0.15s", flexShrink: 0,
              }}>
                <path d="M2.5 1l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
              Case Study Flows
              <span style={{ marginLeft: "auto", fontWeight: 500, opacity: 0.7 }}>{flowPages.length}</span>
            </button>
            {flowsOpen && flowPages.map((page, idx) => (
              <PageRow key={page.id} page={page} displayIndex={idx} {...rowProps} />
            ))}
          </>
        )}
      </div>

      {/* Admin: add page */}
      {isAdmin && (
        <button
          onClick={() => { addPage(); }}
          style={{
            margin: "8px 12px",
            padding: "7px",
            background: "rgba(255,255,255,0.05)",
            border: "1px dashed rgba(255,255,255,0.12)",
            borderRadius: 6,
            color: "rgba(237,234,212,0.4)",
            cursor: "pointer",
            fontSize: 12,
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          + New Page
        </button>
      )}

      {/* Auth footer */}
      <div
        style={{
          padding: "12px 14px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {isAdmin ? (
          <button
            onClick={lock}
            style={{
              width: "100%",
              padding: "6px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 6,
              color: "rgba(237,234,212,0.4)",
              cursor: "pointer",
              fontSize: 11,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Lock (exit admin)
          </button>
        ) : showPw ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <input
              type="password"
              placeholder="Password"
              aria-label="Admin password"
              value={pwInput}
              onChange={(e) => { setPwInput(e.target.value); setPwError(false); }}
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
              style={{
                padding: "6px 8px",
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${pwError ? "#E20074" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 6,
                color: "#EDEAD4",
                fontSize: 12,
                outline: "none",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            />
            {pwError && (
              <span style={{ fontSize: 10, color: "#E20074" }}>Wrong password</span>
            )}
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={handleUnlock} style={{ ...smallBtn, flex: 1, background: "#7C6AF7" }}>
                Unlock
              </button>
              <button onClick={() => setShowPw(false)} style={smallBtn}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowPw(true)}
            style={{
              width: "100%",
              padding: "6px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 6,
              color: "rgba(237,234,212,0.25)",
              cursor: "pointer",
              fontSize: 11,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Admin
          </button>
        )}
      </div>
    </div>
  );
}

// A single page row, shared by both the main-pages list and the collapsible
// Case Study Flows group. `displayIndex` drives the "01" label shown (reset
// per group, not a continuation across both), while drag-reorder resolves
// each page's position in the real, ungrouped `pages` array — the two are
// deliberately different numbers.
function PageRow({
  page, displayIndex, activePageId, onSelect, isAdmin,
  editingId, setEditingId, editVal, setEditVal, submitRename,
  deletePage, canDelete, dragIndexRef, reorderPages, pages,
}) {
  const isActive = page.id === activePageId;
  const globalIndex = pages.indexOf(page);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-current={isActive}
      draggable={isAdmin}
      onDragStart={() => (dragIndexRef.current = globalIndex)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => {
        if (dragIndexRef.current !== null && dragIndexRef.current !== globalIndex) {
          reorderPages(dragIndexRef.current, globalIndex);
          dragIndexRef.current = null;
        }
      }}
      onClick={() => onSelect(page.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(page.id); }
      }}
      style={{
        padding: "8px 14px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: isActive
          ? "rgba(124,106,247,0.15)"
          : "transparent",
        borderLeft: isActive
          ? "2px solid #7C6AF7"
          : "2px solid transparent",
        transition: "background 0.15s",
      }}
    >
      <span style={{ fontSize: 10, color: "rgba(237,234,212,0.3)", minWidth: 18 }}>
        {String(displayIndex + 1).padStart(2, "0")}
      </span>

      {editingId === page.id ? (
        <input
          autoFocus
          value={editVal}
          onChange={(e) => setEditVal(e.target.value)}
          onBlur={() => submitRename(page.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submitRename(page.id);
            if (e.key === "Escape") setEditingId(null);
            e.stopPropagation();
          }}
          onClick={(e) => e.stopPropagation()}
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(124,106,247,0.5)",
            borderRadius: 4,
            color: "#EDEAD4",
            fontSize: 12,
            padding: "2px 6px",
            outline: "none",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        />
      ) : (
        <span
          style={{
            flex: 1,
            fontSize: 13,
            color: isActive ? "#EDEAD4" : "rgba(237,234,212,0.55)",
            fontWeight: isActive ? 600 : 400,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {page.name}
        </span>
      )}

      {/* Admin per-page actions */}
      {isAdmin && editingId !== page.id && (
        <div style={{ display: "flex", gap: 2, marginLeft: "auto" }}>
          <IconBtn
            title="Rename"
            onClick={(e) => {
              e.stopPropagation();
              setEditingId(page.id);
              setEditVal(page.name);
            }}
          >
            ✎
          </IconBtn>
          {canDelete && (
            <IconBtn
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                deletePage(page.id);
              }}
            >
              ✕
            </IconBtn>
          )}
        </div>
      )}
    </div>
  );
}

function IconBtn({ children, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      style={{
        background: "transparent",
        border: "none",
        color: "rgba(237,234,212,0.3)",
        cursor: "pointer",
        fontSize: 11,
        padding: "2px 3px",
        lineHeight: 1,
        borderRadius: 3,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#EDEAD4")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(237,234,212,0.3)")}
    >
      {children}
    </button>
  );
}

const smallBtn = {
  padding: "5px 8px",
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 5,
  color: "#EDEAD4",
  cursor: "pointer",
  fontSize: 11,
  fontFamily: "'Space Grotesk', sans-serif",
};
