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

// The "Portfolio" page (id "default") is deliberately excluded from
// syncSeedPages — it's admin-hand-editable, so blanket-overwriting it on
// every load would clobber real customization. But its *initial* 15 slide
// images (ids tc-0..4, sb-0..4, eh-0..4) were auto-generated from
// defaultCanvasData.js, and those original CDN URLs went stale (see
// caseStudies.ts's slide constants for the matching fix there). This map
// pins down exactly the old hardcoded URLs so the migration below can
// tell "still exactly what auto-generation produced, never hand-edited"
// apart from a genuine admin customization, and only replace the former.
const STALE_DEFAULT_IMAGE_URLS = {
  "tc-0": "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/4c99d97a-f62e-44f1-98b1-48808c3827af/1.png",
  "tc-1": "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/8cc2e4ee-373e-43c8-9c50-04603d0abdef/2.png",
  "tc-2": "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/07ddbcd7-a854-4935-8ddb-b97c6309c7aa/3.png",
  "tc-3": "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/e3b790ff-5453-4a62-8070-683d51b8cd1f/4.png",
  "tc-4": "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/6006386b-f801-447d-9c7b-53dba0cb6a0d/5.png",
  "sb-0": "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/e91f85ac-621e-4272-acd4-23aea05d6209/2301.png",
  "sb-1": "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/43a6e294-89e5-4e9d-829b-2771a697cded/2302.png",
  "sb-2": "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/a4792eaa-1035-4619-ac7d-9414ccd71819/2303.png",
  "sb-3": "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/1e4ced7a-f8a0-4676-9e89-1c30422cb3d2/2304.png",
  "sb-4": "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/af608b01-7d67-40f4-afde-31b73a4250f6/2305.png",
  "eh-0": "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/61452706-3c67-43a7-9255-1df9f1a239e9/2306.png",
  "eh-1": "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/40c65dac-78e6-4561-abd3-b01aead2378c/2307.png",
  "eh-2": "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/f8e103d9-4c9f-4b05-b23d-4b049cc91bdf/2308.png",
  "eh-3": "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/e5ff90fc-76ee-49ba-a7c2-af2d4ec3fb15/2309.png",
  "eh-4": "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/5f64a66d-9c97-4531-8de0-91735c22f9cc/2310.png",
};

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

      // Narrow counterpart to syncSeedPages for the admin-editable
      // "Portfolio" page (see STALE_DEFAULT_IMAGE_URLS above): swaps just
      // the handful of slide images that still hold their original
      // auto-generated URL, leaving everything else on the page — admin
      // text edits, moved elements, added content — untouched.
      refreshStaleDefaultImages() {
        set((s) => ({
          pages: s.pages.map((p) => {
            if (p.id !== "default") return p;
            return {
              ...p,
              elements: p.elements.map((el) => {
                const staleUrl = STALE_DEFAULT_IMAGE_URLS[el.id];
                if (el.type !== "image" || !staleUrl || el.src !== staleUrl) return el;
                const fresh = DEFAULT_PAGE_ELEMENTS.find((d) => d.id === el.id);
                return fresh ? { ...el, src: fresh.src } : el;
              }),
            };
          }),
        }));
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
