import { create } from 'zustand';

export const useAppStore = create((set) => ({
    isAppReady: false,
    rateLimit: null,

    setAppReady: (value) => {
        set({ isAppReady: value });
    },
    setRateLimit: (rateLimit) => {
        set({ rateLimit });
    },
    clearRateLimit: () => {
        set({ rateLimit: null });
    }
}));
