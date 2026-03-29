import { create } from 'zustand';

export interface AppShellStoreState {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
}

export const useAppShellStore = create<AppShellStoreState>((set) => ({
  sidebarCollapsed: true,
  mobileSidebarOpen: false,

  toggleSidebarCollapsed: () => {
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed }));
  },

  setSidebarCollapsed: (collapsed) => {
    set({ sidebarCollapsed: collapsed });
  },

  setMobileSidebarOpen: (open) => {
    set({ mobileSidebarOpen: open });
  },

  toggleMobileSidebar: () => {
    set((s) => ({ mobileSidebarOpen: !s.mobileSidebarOpen }));
  },
}));
