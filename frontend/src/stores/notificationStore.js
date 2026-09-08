import { create } from 'zustand';
import { toast } from 'sonner';
import { http } from '../api/httpClient';
import { toastIcon } from '../constants/toastIcon.constant';
import { getErrorMessage } from '../utils/crmStore.utils';

export const useNotificationStore = create((set, get) => ({
    // State
    notifications: [],
    notificationCounts: { all: 0, unread: 0, read: 0 },
    unreadCount: 0,

    // Cursor pagination
    nextCursor: null,
    hasMore: true,

    // Request state
    isLoading: false,
    isUpdating: false,
    error: null,

    fetchNotifications: async ({ append = false } = {}) => {
        if (get().isLoading) return;

        set({ isLoading: true, error: null });

        try {
            const params = {};
            if (append && get().nextCursor) {
                params.cursor = get().nextCursor;
            }

            const response = await http.get('/notifications', { params });
            const data = response.data?.data ?? {};
            const incoming = data.notifications ?? [];

            set((state) => {
                if (!append) {
                    const notifications = [...incoming];
                    const notificationCounts = data.counts ?? { all: 0, unread: 0, read: 0 };

                    return {
                        notifications,
                        notificationCounts,
                        unreadCount: notificationCounts.unread,
                        nextCursor: data.nextCursor ?? null,
                        hasMore: data.hasNextPage ?? false,
                        isLoading: false,
                        error: null,
                    };
                }

                const existingIds = new Set(
                    state.notifications.map((n) => n._id?.toString())
                );
                const newNotifications = incoming.filter(
                    (n) => !existingIds.has(n._id?.toString())
                );
                const notifications = [...state.notifications, ...newNotifications];
                const notificationCounts = data.counts ?? state.notificationCounts;

                return {
                    notifications,
                    notificationCounts,
                    unreadCount: notificationCounts.unread,
                    nextCursor: data.nextCursor ?? null,
                    hasMore: data.hasNextPage ?? false,
                    isLoading: false,
                    error: null,
                };
            });

            return data;
        } catch (error) {
            const errorMessage = getErrorMessage(error, 'Failed to fetch notifications');
            set({ isLoading: false, error: errorMessage });
            throw error;
        }
    },

    markSelectedRead: async (ids) => {
        if (!ids?.length) return;

        const previousNotifications = get().notifications;
        const previousCounts = get().notificationCounts;
        const previousUnreadCount = get().unreadCount;

        set((state) => {
            const updatedIds = new Set(ids.map(String));
            let newlyReadCount = 0;

            const notifications = state.notifications.map((notification) => {
                const id = notification._id?.toString();
                if (updatedIds.has(id) && !notification.read) {
                    newlyReadCount++;
                }

                return updatedIds.has(id)
                    ? {
                        ...notification,
                        read: true,
                        readAt: notification.readAt ?? new Date().toISOString(),
                    }
                    : notification;
            });

            const unread = Math.max(state.notificationCounts.unread - newlyReadCount, 0);
            const notificationCounts = {
                ...state.notificationCounts,
                unread,
                read: Math.max(state.notificationCounts.read + newlyReadCount, 0),
            };

            return { notifications, notificationCounts, unreadCount: unread };
        });

        try {
            set({ isUpdating: true });
            await http.patch('/notifications/read-selected', { notificationIds: ids });
            set({ isUpdating: false });
        } catch (error) {
            set({
                notifications: previousNotifications,
                notificationCounts: previousCounts,
                unreadCount: previousUnreadCount,
                isUpdating: false,
            });

            const errorMessage = getErrorMessage(error, 'Failed to mark notifications as read');
            toast.error(errorMessage, { icon: toastIcon('error') });
            throw error;
        }
    },

    markAllRead: async () => {
        const previousCounts = get().notificationCounts;
        const previousUnreadCount = get().unreadCount;

        set((state) => ({
            notifications: state.notifications.map((notification) => ({
                ...notification,
                read: true,
                readAt: notification.readAt ?? new Date().toISOString(),
            })),
            notificationCounts: {
                ...state.notificationCounts,
                unread: 0,
                read: state.notificationCounts.all,
            },
            unreadCount: 0,
        }));

        try {
            set({ isUpdating: true });
            await http.patch('/notifications/read-all');
            set({ isUpdating: false });
        } catch (error) {
            try {
                await get().fetchNotifications({ append: false });
            } catch {
                // Preserve original operation error
            }

            set({ isUpdating: false });
            const errorMessage = getErrorMessage(error, 'Failed to mark all notifications as read');
            toast.error(errorMessage, { icon: toastIcon('error') });
            throw error;
        }
    },

    deleteSelected: async (ids) => {
        if (!ids?.length) return;

        const removedIds = new Set(ids.map(String));
        const previousNotifications = get().notifications;
        const previousCounts = get().notificationCounts;
        const previousUnreadCount = get().unreadCount;

        set((state) => {
            let removedUnreadCount = 0;
            let removedTotalCount = 0;

            const notifications = state.notifications.filter((notification) => {
                const id = notification._id?.toString();
                if (!removedIds.has(id)) return true;

                removedTotalCount++;
                if (!notification.read) removedUnreadCount++;
                return false;
            });

            const notificationCounts = {
                all: Math.max(state.notificationCounts.all - removedTotalCount, 0),
                unread: Math.max(state.notificationCounts.unread - removedUnreadCount, 0),
                read: Math.max(
                    state.notificationCounts.read - (removedTotalCount - removedUnreadCount),
                    0
                ),
            };

            return {
                notifications,
                notificationCounts,
                unreadCount: notificationCounts.unread,
            };
        });

        try {
            set({ isUpdating: true });
            await http.delete('/notifications/delete-selected', {
                data: { notificationIds: ids },
            });
            set({ isUpdating: false });
        } catch (error) {
            set({
                notifications: previousNotifications,
                notificationCounts: previousCounts,
                unreadCount: previousUnreadCount,
                isUpdating: false,
            });

            const errorMessage = getErrorMessage(error, 'Failed to delete notifications');
            toast.error(errorMessage, { icon: toastIcon('error') });
            throw error;
        }
    },

    deleteAll: async () => {
        const previousNotifications = get().notifications;
        const previousCounts = get().notificationCounts;
        const previousUnreadCount = get().unreadCount;

        set({
            notifications: [],
            notificationCounts: { all: 0, unread: 0, read: 0 },
            unreadCount: 0,
            nextCursor: null,
            hasMore: false,
        });

        try {
            set({ isUpdating: true });
            await http.delete('/notifications/delete-all');
            set({ isUpdating: false, nextCursor: null, hasMore: false });
        } catch (error) {
            set({
                notifications: previousNotifications,
                notificationCounts: previousCounts,
                unreadCount: previousUnreadCount,
                isUpdating: false,
            });

            try {
                await get().fetchNotifications({ append: false });
            } catch {
                // Preserve original operation error
            }

            const errorMessage = getErrorMessage(error, 'Failed to clear notifications');
            toast.error(errorMessage, { icon: toastIcon('error') });
            throw error;
        }
    },

    receiveNotification: (notification) => {
        if (!notification) return;

        set((state) => {
            const exists = state.notifications.some(
                (n) => n._id?.toString() === notification._id?.toString()
            );

            if (exists) return state;

            const notifications = [notification, ...state.notifications];
            const notificationCounts = {
                ...state.notificationCounts,
                all: state.notificationCounts.all + 1,
                unread: state.notificationCounts.unread + (notification.read ? 0 : 1),
                read: state.notificationCounts.read + (notification.read ? 1 : 0),
            };

            return {
                notifications,
                notificationCounts,
                unreadCount: notificationCounts.unread,
            };
        });
    },

    clearAll: () => {
        set({
            notifications: [],
            notificationCounts: { all: 0, unread: 0, read: 0 },
            unreadCount: 0,
            nextCursor: null,
            hasMore: true,
            isLoading: false,
            isUpdating: false,
            error: null,
        });
    },

    clearError: () => {
        set({ error: null });
    },
}));