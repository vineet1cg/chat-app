import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useWorkspace = create(
  persist(
    (set) => ({
      sidebarWidth: 340,
      layout: "split",
      setSidebarWidth: (width) =>
        set({ sidebarWidth: Math.max(280, Math.min(420, width)) }),
      toggleLayout: () =>
        set((state) => ({
          layout: state.layout === "split" ? "focus" : "split",
        })),
      resetLayout: () => set({ sidebarWidth: 340, layout: "split" }),
    }),
    {
      name: "chime-workspace",
      partialize: ({ sidebarWidth, layout }) => ({ sidebarWidth, layout }),
      merge: (saved, current) => ({
        ...current,
        sidebarWidth: Number.isFinite(saved?.sidebarWidth)
          ? Math.max(280, Math.min(420, saved.sidebarWidth))
          : 340,
        layout: saved?.layout === "focus" ? "focus" : "split",
      }),
    },
  ),
);
