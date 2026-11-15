import { create } from 'zustand';

export type DrawerRoute =
  | 'home'
  | 'categories'
  | 'statistics'
  | 'lend-borrow'
  | 'currency'
  | 'theme'
  | 'text-size'
  | 'history'
  | 'settings';

interface DrawerState {
  isOpen: boolean;
  activeRoute: DrawerRoute;
  openDrawer: (route?: DrawerRoute) => void;
  closeDrawer: () => void;
}

export const useDrawerStore = create<DrawerState>((set) => ({
  isOpen: false,
  activeRoute: 'home',
  openDrawer: (route = 'home') => set({ isOpen: true, activeRoute: route }),
  closeDrawer: () => set({ isOpen: false }),
}));
