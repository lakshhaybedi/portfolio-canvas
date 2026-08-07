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

  // Add any seed pages (Find Care flow, T-Cloud flow, Standard Bank flow)
  // a visitor's persisted store is still missing. Must wait for zustand
  // `persist` to actually finish reading localStorage first — calling this
  // before hydration completes would add the pages to the in-memory default
  // state, only for hydration to then overwrite `pages` wholesale with the
  // persisted array, silently discarding them.
  useEffect(() => {
    if (useCanvasStore.persist.hasHydrated()) {
      useCanvasStore.getState().ensureSeedPages();
      return;
    }
    return useCanvasStore.persist.onFinishHydration(() => {
      useCanvasStore.getState().ensureSeedPages();
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
