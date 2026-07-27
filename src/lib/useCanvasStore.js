"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_PAGE_ELEMENTS } from "./defaultCanvasData";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const defaultPage = () => ({
  id: "default",
  name: "Portfolio",
  elements: DEFAULT_PAGE_ELEMENTS,
});

export const useCanvasStore = create(
  persist(
    (set, get) => ({
      // ── Auth ──────────────────────────────────────────────
      isAdmin: false,
      unlock: (password) => {
        if (password === (process.env.NEXT_PUBLIC_CANVAS_PASS || "admin123")) {
          set({ isAdmin: true });
          return true;
        }
        return false;
      },
      lock: () => set({ isAdmin: false }),

      // ── Undo / Redo history (not persisted) ──────────────
      _history: [],
      _future:  [],

      _snapshot() {
        const { pages, _history } = get();
        // deep-clone pages so mutations don't corrupt history
        const snap = JSON.parse(JSON.stringify(pages));
        set({ _history: [..._history.slice(-49), snap], _future: [] });
      },

      undo() {
        const { _history, _future, pages } = get();
        if (!_history.length) return;
        const prev = _history[_history.length - 1];
        set({
          pages: prev,
          _history: _history.slice(0, -1),
          _future: [JSON.parse(JSON.stringify(pages)), ..._future.slice(0, 49)],
        });
      },

      redo() {
        const { _history, _future, pages } = get();
        if (!_future.length) return;
        const next = _future[0];
        set({
          pages: next,
          _future: _future.slice(1),
          _history: [..._history.slice(-49), JSON.parse(JSON.stringify(pages))],
        });
      },

      // ── Pages ─────────────────────────────────────────────
      pages: [defaultPage()],
      activePageId: "default",

      getActivePage() {
        const { pages, activePageId } = get();
        return pages.find((p) => p.id === activePageId) ?? pages[0];
      },

      setActivePage(id) {
        set({ activePageId: id });
      },

      addPage() {
        const n = get().pages.length + 1;
        const page = { id: uid(), name: `Page ${n}`, elements: [] };
        set((s) => ({ pages: [...s.pages, page], activePageId: page.id }));
      },

      renamePage(id, name) {
        set((s) => ({
          pages: s.pages.map((p) => (p.id === id ? { ...p, name } : p)),
        }));
      },

      deletePage(id) {
        set((s) => {
          const pages = s.pages.filter((p) => p.id !== id);
          if (pages.length === 0) {
            const fallback = defaultPage();
            return { pages: [fallback], activePageId: fallback.id };
          }
          const stillActive = pages.some((p) => p.id === s.activePageId);
          return { pages, activePageId: stillActive ? s.activePageId : pages[0].id };
        });
      },

      reorderPages(fromIndex, toIndex) {
        set((s) => {
          const pages = [...s.pages];
          const [moved] = pages.splice(fromIndex, 1);
          pages.splice(toIndex, 0, moved);
          return { pages };
        });
      },

      // ── Elements ──────────────────────────────────────────
      addElement(pageId, el) {
        get()._snapshot();
        const element = {
          id: uid(),
          rotation: 0,
          z: get().pages.find((p) => p.id === pageId)?.elements.length ?? 0,
          ...el,
        };
        set((s) => ({
          pages: s.pages.map((p) =>
            p.id === pageId ? { ...p, elements: [...p.elements, element] } : p
          ),
        }));
        return element.id;
      },

      updateElement(pageId, id, patch) {
        set((s) => ({
          pages: s.pages.map((p) =>
            p.id !== pageId
              ? p
              : {
                  ...p,
                  elements: p.elements.map((el) =>
                    el.id === id ? { ...el, ...patch } : el
                  ),
                }
          ),
        }));
      },

      // snapshot before a color/style change from the toolbar
      updateElementStyle(pageId, id, patch) {
        get()._snapshot();
        get().updateElement(pageId, id, patch);
      },

      deleteElement(pageId, id) {
        get()._snapshot();
        set((s) => ({
          pages: s.pages.map((p) =>
            p.id !== pageId
              ? p
              : { ...p, elements: p.elements.filter((el) => el.id !== id) }
          ),
        }));
      },

      bringForward(pageId, id) {
        get()._snapshot();
        set((s) => ({
          pages: s.pages.map((p) => {
            if (p.id !== pageId) return p;
            const max = Math.max(...p.elements.map((e) => e.z));
            return {
              ...p,
              elements: p.elements.map((el) =>
                el.id === id ? { ...el, z: max + 1 } : el
              ),
            };
          }),
        }));
      },

      sendBackward(pageId, id) {
        get()._snapshot();
        set((s) => ({
          pages: s.pages.map((p) => {
            if (p.id !== pageId) return p;
            const min = Math.min(...p.elements.map((e) => e.z));
            return {
              ...p,
              elements: p.elements.map((el) =>
                el.id === id ? { ...el, z: min - 1 } : el
              ),
            };
          }),
        }));
      },
    }),
    {
      name: "canvas-store-v2",
      partialize: (s) => ({ pages: s.pages, activePageId: s.activePageId }), // _history/_future intentionally excluded
    }
  )
);
