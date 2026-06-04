import { create } from 'zustand';
import { toast } from 'sonner';
import { http } from '../api/httpClient';
import { ACTIVITY_TYPES } from '../config/activityTypes.config';
import { toastIcon } from '../config/toastIcon.config';
import { useCustomerStore } from './customerStore';
import { useDealStore } from './dealStore';
import {
    compactObject,
    getApiMessage,
    getEntityId,
    getErrorMessage,
    mergeEntityById,
    removeEntityById,
} from '../utils/crmStore.utils';

const getActivityFromPayload = (payload) => payload?.activity || payload;

export const useActivityStore = create((set, get) => ({
    activityTypes: ACTIVITY_TYPES,
    activities: [],
    nextCursor: null,
    hasMore: true,
    lastDeletedActivity: null,

    isLoading: false,
    isUpdating: false,
    error: null,

    getActivities: async (options = {}) => {
        set({
            isLoading: true,
            error: null,
        });

        try {
            const response = await http.get('/activities', {
                params: compactObject({ cursor: options.cursor }),
            });
            const data = response.data.data || {};
            const activities = options.append
                ? [...get().activities, ...(data.activities || [])]
                : data.activities || [];

            set({
                activities,
                nextCursor: data.nextCursor || null,
                hasMore: !!data.hasMore,
                isLoading: false,
                error: null,
            });

            return data;
        } catch (error) {
            const errorMessage = getErrorMessage(error, 'Failed to fetch activities');

            set({
                isLoading: false,
                error: errorMessage,
            });

            toast.error(errorMessage, {
                icon: toastIcon('error'),
            });
            throw error;
        }
    },

    createActivity: async (payload, options = {}) => {
        set({
            isUpdating: true,
            error: null,
        });

        try {
            const response = await http.post('/activities', payload);
            const data = response.data.data;
            const activity = getActivityFromPayload(data);

            set(state => ({
                activities: mergeEntityById(state.activities, activity),
                isUpdating: false,
                error: null,
            }));

            useDealStore.getState().upsertActivityInDealFeed(activity);
            useCustomerStore.getState().upsertActivityInCustomerTimeline(activity);

            if (!options.silent) {
                toast.success(getApiMessage(response, data?.message || 'Activity created'), {
                    icon: toastIcon('success'),
                });
            }

            return data;
        } catch (error) {
            const errorMessage = getErrorMessage(error, 'Failed to create activity');

            set({
                isUpdating: false,
                error: errorMessage,
            });

            toast.error(errorMessage, {
                icon: toastIcon('error'),
            });
            throw error;
        }
    },

    updateActivity: async (activityId, payload, options = {}) => {
        set({
            isUpdating: true,
            error: null,
        });

        try {
            const response = await http.patch(`/activities/${activityId}`, payload);
            const data = response.data.data;
            const activity = getActivityFromPayload(data);

            set(state => ({
                activities: mergeEntityById(state.activities, activity),
                isUpdating: false,
                error: null,
            }));

            useDealStore.getState().upsertActivityInDealFeed(activity);
            useCustomerStore.getState().upsertActivityInCustomerTimeline(activity);

            if (!options.silent) {
                toast.success(getApiMessage(response, data?.message || 'Activity updated'), {
                    icon: toastIcon('success'),
                });
            }

            return data;
        } catch (error) {
            const errorMessage = getErrorMessage(error, 'Failed to update activity');

            set({
                isUpdating: false,
                error: errorMessage,
            });

            toast.error(errorMessage, {
                icon: toastIcon('error'),
            });
            throw error;
        }
    },

    deleteActivity: async (activityId, options = {}) => {
        const existingActivity =
            get().activities.find(activity => getEntityId(activity) === activityId) ||
            options.activity ||
            null;
        const dealId = getEntityId(existingActivity?.deal) || options.dealId || null;

        set({
            isUpdating: true,
            error: null,
        });

        try {
            const response = await http.delete(`/activities/${activityId}`);
            const data = response.data.data;

            set(state => ({
                activities: removeEntityById(state.activities, activityId),
                lastDeletedActivity: existingActivity,
                isUpdating: false,
                error: null,
            }));

            useDealStore.getState().removeActivityFromDealFeed(activityId, dealId);
            useCustomerStore.getState().removeActivityFromCustomerTimeline(activityId);

            if (!options.silent) {
                toast.success(data?.message || getApiMessage(response, 'Activity deleted'), {
                    icon: toastIcon('delete'),
                });
            }

            return data;
        } catch (error) {
            const errorMessage = getErrorMessage(error, 'Failed to delete activity');

            set({
                isUpdating: false,
                error: errorMessage,
            });

            toast.error(errorMessage, {
                icon: toastIcon('error'),
            });
            throw error;
        }
    },

    resetActivityFeed: () => {
        set({
            activities: [],
            nextCursor: null,
            hasMore: true,
            lastDeletedActivity: null,
            isLoading: false,
            isUpdating: false,
            error: null,
        });
    },

    clearError: () => set({ error: null }),
}));
