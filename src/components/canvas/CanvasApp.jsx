"use client";
import { useEffect } from "react";
import { useCanvasStore } from "@/lib/useCanvasStore";
import Sidebar from "./Sidebar";
import Canvas from "./Canvas";

export default function CanvasApp() {
  const pages = useCanvasStore((s) => s.pages);
  const activePageId = useCanvasStore((s) => s.activePageId);
  const setActivePage = useCanvasStore((s) => s.setActivePage);

  // Init activePageId if null
  useEffect(() => {
    if (!activePageId && pages.length > 0) {
      setActivePage(pages[0].id);
    }
  }, [activePageId, pages, setActivePage]);

  // Add/refresh any seed pages (Find Care flow, T-Cloud flow, Standard Bank
  // flow, MAIA flow) against a visitor's persisted store. Must wait for
  // zustand `persist` to actually finish reading localStorage first —
  // calling this before hydration completes would sync the pages into the
  // in-memory default state, only for hydration to then overwrite `pages`
  // wholesale with the persisted array, silently discarding the sync.
  useEffect(() => {
    if (useCanvasStore.persist.hasHydrated()) {
      useCanvasStore.getState().syncSeedPages();
      return;
    }
    return useCanvasStore.persist.onFinishHydration(() => {
      useCanvasStore.getState().syncSeedPages();
    });
  }, []);

  const resolvedPageId = activePageId ?? pages[0]?.id;

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background: "#0d0d0d",
        cursor: "default",
      }}
    >
      <Sidebar activePageId={resolvedPageId} onSelect={setActivePage} />
      {resolvedPageId && (
        <Canvas key={resolvedPageId} pageId={resolvedPageId} />
      )}
    </div>
  );
}
