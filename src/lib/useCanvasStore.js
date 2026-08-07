"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_PAGE_ELEMENTS } from "./defaultCanvasData";
import { findCareFlowPage } from "./findCareFlowData";
import { tCloudFlowPage } from "./tCloudFlowData";
import { standardBankFlowPage } from "./standardBankFlowData";
import { maiaFlowPage } from "./maiaFlowData";

// Seed pages added after initial launch — each keyed by a fixed page id so
// syncSeedPages (below) can add whichever ones a given visitor's persisted
// store is still missing, and refresh ones it already has. These are
// reference material generated from data files, not admin-hand-edited
// content (unlike the main "Portfolio" page), so keeping them in sync with
// the latest data on every load — rather than only adding them once — is
// the right call: a later addition to e.g. maiaFlowData.js should reach
// visitors who already have that page, not just brand-new ones.
const SEED_PAGES = [findCareFlowPage, tCloudFlowPage, standardBankFlowPage, maiaFlowPage];

// Exported so the sidebar can group these apart from admin-editable pages
// (e.g. the main "Portfolio" page) without guessing by id-naming convention.
// Computed once at module load — cheap even though each factory rebuilds
// its full elements array, since this only runs once per page load, not
// per render.
export const SEED_PAGE_IDS = new Set(SEED_PAGES.map((make) => make().id));

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
        if (password === (process.env.NEXT_PUBLIC_CANVAS_PASS || "1@Adm1n3-(")) {
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

      // Adds any seed pages (SEED_PAGES above) a visitor's persisted store
      // is still missing, and refreshes the ones it already has to the
      // latest data-file content — new visitors get them from the initial
      // `pages` array below, but zustand `persist` rehydrates existing
      // visitors' localStorage over that initial value, so a code change to
      // the default alone would never reach them on its own. Existing pages
      // are replaced in place (same array position, so the sidebar order
      // doesn't jump around), not removed and re-appended.
      syncSeedPages() {
        set((s) => {
          const fresh = SEED_PAGES.map((make) => make());
          const freshById = new Map(fresh.map((p) => [p.id, p]));
          const existingIds = new Set(s.pages.map((p) => p.id));
          const updated = s.pages.map((p) => freshById.get(p.id) ?? p);
          const missing = fresh.filter((p) => !existingIds.has(p.id));
          return { pages: [...updated, ...missing] };
        });
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

      // Batch delete for marquee multi-select — one snapshot for the whole
      // group, not one per element, so a single Cmd+Z restores everything
      // that was selected instead of bringing elements back one at a time.
      deleteElements(pageId, ids) {
        get()._snapshot();
        const idSet = new Set(ids);
        set((s) => ({
          pages: s.pages.map((p) =>
            p.id !== pageId
              ? p
              : { ...p, elements: p.elements.filter((el) => !idSet.has(el.id)) }
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
