import { create } from 'zustand';
import { toast } from 'sonner';
import { http } from '../api/httpClient';
import { toastIcon } from '../constants/toastIcon.constant';
import { getErrorMessage } from '../utils/crmStore.utils';


// Notification store — merges two sources of truth:

// 1. REST API  — fetched on page load, cursor-paginated, persisted in DB.
//    Routes (/notifications):
//    GET /  → fetchNotifications({ append })

// 2. WebSocket — `notification:new` events pushed in real time.
//    Handler: receiveNotification(notification)

export const useNotificationStore = create((set, get) => ({

    // State
    notifications: [],
    unreadCount: 0,

    nextCursor: null,
    hasMore: true,

    isLoading: false,
    isUpdating: false,
    error: null,

    //Fetch paginated notifications from the API.
    fetchNotifications: async ({ append = false } = {}) => {
        if (append && get().isLoading) return;

        set({ isLoading: true, error: null });

        try {
            const params = {};

            if (append && get().nextCursor) {
                params.cursor = get().nextCursor;
            }

            const response = await http.get("/notifications", { params });

            const data = response.data?.data ?? {};
            const incoming = data.notifications ?? [];

            set((state) => {
                const existingMap = new Map(
                    state.notifications.map((notification) => [
                        notification._id?.toString(),
                        notification,
                    ])
                );

                for (const notification of incoming) {
                    existingMap.set(
                        notification._id?.toString(),
                        notification
                    );
                }

                const merged = Array.from(existingMap.values()).sort(
                    (a, b) =>
                        new Date(b.createdAt) - new Date(a.createdAt)
                );

                return {
                    notifications: merged,
                    unreadCount: merged.filter((n) => !n.read).length,
                    nextCursor: data.nextCursor ?? null,
                    hasMore: data.hasNextPage ?? false,
                    isLoading: false,
                    error: null,
                };
            });

            return data;
        } catch (error) {
            const errorMessage = getErrorMessage(
                error,
                "Failed to fetch notifications"
            );

            set({
                isLoading: false,
                error: errorMessage,
            });

            throw error;
        }
    },


    //Mark a specific set of notifications as read (optimistic + API).
    markSelectedRead: async (ids) => {
        if (!ids?.length) return;

        // Optimistic update
        set((state) => {
            const updatedIds = new Set(ids.map(String));
            const notifications = state.notifications.map((n) =>
                updatedIds.has(n._id?.toString()) ? { ...n, read: true } : n
            );
            return {
                notifications,
                unreadCount: notifications.filter((n) => !n.read).length,
            };
        });

        try {
            set({ isUpdating: true });
            await http.patch('/notifications/read-selected', { notificationIds: ids });
            set({ isUpdating: false });
        } catch (error) {
            // Rollback optimistic update
            set((state) => {
                const revertedIds = new Set(ids.map(String));
                const notifications = state.notifications.map((n) =>
                    revertedIds.has(n._id?.toString()) ? { ...n, read: false } : n
                );
                return {
                    notifications,
                    unreadCount: notifications.filter((n) => !n.read).length,
                    isUpdating: false,
                };
            });

            const errorMessage = getErrorMessage(error, 'Failed to mark notifications as read');
            toast.error(errorMessage, { icon: toastIcon('error') });
            throw error;
        }
    },


    //      Mark all notifications as read.
    markAllRead: async () => {
        // Optimistic update
        set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
            unreadCount: 0,
        }));

        try {
            set({ isUpdating: true });
            await http.patch('/notifications/read-all');
            set({ isUpdating: false });
        } catch (error) {
            // Refetch to restore correct state
            get().fetchNotifications();
            set({ isUpdating: false });

            const errorMessage = getErrorMessage(error, 'Failed to mark all as read');
            toast.error(errorMessage, { icon: toastIcon('error') });
            throw error;
        }
    },


    //Delete a specific set of notifications (optimistic + API).

    deleteSelected: async (ids) => {
        if (!ids?.length) return;

        const removedIds = new Set(ids.map(String));
        const snapshot = get().notifications;

        // Optimistic removal
        set((state) => {
            const notifications = state.notifications.filter(
                (n) => !removedIds.has(n._id?.toString())
            );
            return {
                notifications,
                unreadCount: notifications.filter((n) => !n.read).length,
            };
        });

        try {
            set({ isUpdating: true });
            await http.delete('/notifications/delete-selected', {
                data: { notificationIds: ids },
            });
            set({ isUpdating: false });
        } catch (error) {
            // Rollback
            set({
                notifications: snapshot,
                unreadCount: snapshot.filter((n) => !n.read).length,
                isUpdating: false,
            });

            const errorMessage = getErrorMessage(error, 'Failed to delete notifications');
            toast.error(errorMessage, { icon: toastIcon('error') });
            throw error;
        }
    },


    // Delete all notifications.

    deleteAll: async () => {
        const snapshot = get().notifications;

        // Optimistic clear
        set({ notifications: [], unreadCount: 0 });

        try {
            set({ isUpdating: true });
            await http.delete('/notifications/delete-all');
            set({ isUpdating: false, nextCursor: null, hasMore: false });
        } catch (error) {
            // Rollback
            set({
                notifications: snapshot,
                unreadCount: snapshot.filter((n) => !n.read).length,
                isUpdating: false,
            });

            const errorMessage = getErrorMessage(error, 'Failed to clear notifications');
            toast.error(errorMessage, { icon: toastIcon('error') });
            throw error;
        }
    },



    //Receive a real-time notification pushed via `notification:new`.
    //Prepends to the list without hitting the API.
    receiveNotification: (notification) => {
        set((state) => {
            const exists = state.notifications.some(
                (n) => n._id?.toString() === notification._id?.toString()
            );

            if (exists) {
                return state;
            }

            const notifications = [
                notification,
                ...state.notifications,
            ];

            return {
                notifications,
                unreadCount: notifications.filter((n) => !n.read).length,
            };
        });
    },


    //Clean up

    // Reset the entire store (called on logout via useSocket).

    clearAll: () => {
        set({
            notifications: [],
            unreadCount: 0,
            nextCursor: null,
            hasMore: true,
            isLoading: false,
            isUpdating: false,
            error: null,
        });
    },

    clearError: () => set({ error: null }),
}));
