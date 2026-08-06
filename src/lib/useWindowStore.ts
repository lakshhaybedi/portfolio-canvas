"use client";
import { create } from "zustand";

export interface OpenWindow {
  id: string; // == docId, so re-opening the same doc reuses this entry
  docId: string;
  x: number;
  y: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
}

interface WindowStore {
  windows: OpenWindow[];
  folderAnchor: { x: number; y: number } | null;
  setFolderAnchor: (pos: { x: number; y: number }) => void;
  openWindow: (docId: string) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  bringToFront: (id: string) => void;
  updatePosition: (id: string, x: number, y: number) => void;
}

const nextZ = (windows: OpenWindow[]) =>
  windows.length ? Math.max(...windows.map((w) => w.z)) + 1 : 1;

// Cascades newly-opened windows a little so they don't stack in the exact
// same spot — each new window nudges further from a roughly-centered start.
function cascadePosition(count: number) {
  const vw = typeof window === "undefined" ? 1200 : window.innerWidth;
  const vh = typeof window === "undefined" ? 800 : window.innerHeight;
  const baseX = vw / 2 - 280;
  const baseY = vh / 2 - 320;
  const offset = (count % 6) * 28;
  return { x: baseX + offset, y: baseY + offset };
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  folderAnchor: null,

  setFolderAnchor: (pos) => set({ folderAnchor: pos }),

  openWindow: (docId) => {
    const { windows } = get();
    const existing = windows.find((w) => w.docId === docId);
    if (existing) {
      set({
        windows: windows.map((w) =>
          w.id === existing.id ? { ...w, minimized: false, z: nextZ(windows) } : w
        ),
      });
      return;
    }
    const pos = cascadePosition(windows.length);
    // Windows are a fixed 560x660 (DraggableWindow.tsx) — fine to cascade
    // and drag around a desktop viewport, but on a phone-width screen that
    // both overflows the frame and can open positioned partly off-screen
    // (cascadePosition centers around vw/2, which goes negative once vw is
    // narrower than the window itself). Opening maximized instead reuses
    // the existing maximize sizing (calc(100vw - 40px)), which is already
    // viewport-safe.
    const isNarrowViewport = typeof window !== "undefined" && window.innerWidth < 640;
    set({
      windows: [
        ...windows,
        {
          id: docId,
          docId,
          x: pos.x,
          y: pos.y,
          z: nextZ(windows),
          minimized: false,
          maximized: isNarrowViewport,
        },
      ],
    });
  },

  closeWindow: (id) => set({ windows: get().windows.filter((w) => w.id !== id) }),

  minimizeWindow: (id) =>
    set({
      windows: get().windows.map((w) => (w.id === id ? { ...w, minimized: true } : w)),
    }),

  toggleMaximize: (id) =>
    set({
      windows: get().windows.map((w) =>
        w.id === id ? { ...w, maximized: !w.maximized } : w
      ),
    }),

  bringToFront: (id) => {
    const { windows } = get();
    const z = nextZ(windows);
    set({ windows: windows.map((w) => (w.id === id ? { ...w, z } : w)) });
  },

  updatePosition: (id, x, y) =>
    set({ windows: get().windows.map((w) => (w.id === id ? { ...w, x, y } : w)) }),
}));
