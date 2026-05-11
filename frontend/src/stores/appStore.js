import { create } from 'zustand';

export const useAppStore = create((set) => ({
    isAppReady: false,

    setAppReady: (value) => {
        set({ isAppReady: value });
    }
}));