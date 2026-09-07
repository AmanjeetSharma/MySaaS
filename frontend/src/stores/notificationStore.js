import { create } from "zustand";


export const useNotificationStore = create((set, get) => ({
    notifications: [],
    unreadCount: 0,


    addNotification: (notification) => {
        set((state) => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
        }));
    },


    markAllRead: () => {
        set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
            unreadCount: 0,
        }));
    },


    removeNotification: (id) => {
        set((state) => {
            const notification = state.notifications.find((n) => n._id === id);
            const wasUnread = notification && !notification.read;
            return {
                notifications: state.notifications.filter((n) => n._id !== id),
                unreadCount: wasUnread
                    ? Math.max(0, state.unreadCount - 1)
                    : state.unreadCount,
            };
        });
    },


    clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
    },
}));
