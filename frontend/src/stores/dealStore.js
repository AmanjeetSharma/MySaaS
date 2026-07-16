import { create } from 'zustand';
import { toast } from 'sonner';
import { http } from '../api/httpClient';
import { toastIcon } from '../config/toastIcon.config';
import { useCustomerStore } from './customerStore';
import {
    DEFAULT_DEAL_STATISTICS,
    DEFAULT_PAGINATION,
    compactObject,
    getApiMessage,
    getEntityId,
    getErrorMessage,
    mergeEntityById,
    normalizePagination,
    removeEntityById,
} from '../utils/crmStore.utils';

const getDeletedDealId = (payload, fallbackId) =>
    payload?.deletedDealId || payload?.dealId || fallbackId;

let dealsController = null;

export const useDealStore = create((set, get) => ({
    deals: [],
    currentDeal: null,
    currentOrganizationId: null,
    statistics: DEFAULT_DEAL_STATISTICS,
    pagination: {
        ...DEFAULT_PAGINATION,
        limit: 20,
    },
    activitiesByDealId: {},

    isLoading: false,
    isUpdating: false,
    isActivitiesLoading: false,
    error: null,

    getOrganizationDeals: async (organizationId, query = {}) => {
        if (!organizationId) {
            set({
                deals: [],
                currentOrganizationId: null,
                statistics: DEFAULT_DEAL_STATISTICS,
                pagination: {
                    ...DEFAULT_PAGINATION,
                    limit: 20,
                },
                isLoading: false,
                error: null,
            });

            return [];
        }

        set({
            isLoading: true,
            error: null,
        });

        let controller = null;

        try {

            dealsController?.abort();

            controller = new AbortController();
            dealsController = controller;

            const response = await http.get('/deals', {
                params: compactObject({
                    ...query,
                    orgId: organizationId,
                }),
                signal: controller.signal,
            });

            const data = response.data.data || {};

            set({
                deals: data.deals || [],
                currentOrganizationId: organizationId,
                statistics: data.statistics || DEFAULT_DEAL_STATISTICS,
                pagination: normalizePagination(data.pagination, {
                    ...DEFAULT_PAGINATION,
                    limit: 20,
                }),
                isLoading: false,
                error: null,
            });

            return data;
        } catch (error) {
            if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") {
                return;
            }

            const errorMessage = getErrorMessage(
                error,
                "Failed to fetch deals"
            );

            set({
                error: errorMessage,
            });

            toast.error(errorMessage, {
                icon: toastIcon("error"),
            });

            throw error;
        } finally {
            if (dealsController === controller) {
                dealsController = null;
            }

            set({
                isLoading: false,
            });
        }
    },

    createDeal: async (payload, options = {}) => {
        set({
            isUpdating: true,
            error: null,
        });

        try {
            const response = await http.post('/deals', payload);
            const deal = response.data.data;

            set(state => ({
                deals: mergeEntityById(state.deals, deal),
                currentDeal: deal,
                isUpdating: false,
                error: null,
            }));

            useCustomerStore.getState().upsertDealInCustomerDeals(deal);

            if (!options.silent) {
                toast.success(getApiMessage(response, 'Deal created'), {
                    icon: toastIcon('success'),
                });
            }

            return deal;
        } catch (error) {
            const errorMessage = getErrorMessage(error, 'Failed to create deal');

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

    updateDeal: async (dealId, payload, options = {}) => {
        set({
            isUpdating: true,
            error: null,
        });

        try {
            const response = await http.patch(
                `/deals/${dealId}`,
                payload
            );

            // Fetch fully hydrated deal
            const freshDeal = await get().getDealById(dealId);

            useCustomerStore
                .getState()
                .upsertDealInCustomerDeals(freshDeal);

            set({
                isUpdating: false,
                error: null,
            });

            if (!options.silent) {
                toast.success(
                    getApiMessage(response, "Deal updated"),
                    {
                        icon: toastIcon("success"),
                    }
                );
            }

            return freshDeal;
        } catch (error) {
            const errorMessage = getErrorMessage(
                error,
                "Failed to update deal"
            );

            set({
                isUpdating: false,
                error: errorMessage,
            });

            toast.error(errorMessage, {
                icon: toastIcon("error"),
            });

            throw error;
        }
    },

    updateDealStatus: async (
        dealId,
        status,
        options = {}
    ) => {
        set({
            isUpdating: true,
            error: null,
        });

        try {
            const response = await http.patch(
                `/deals/${dealId}/status`,
                { status }
            );

            // Fetch fully hydrated deal
            const freshDeal = await get().getDealById(dealId);

            useCustomerStore
                .getState()
                .upsertDealInCustomerDeals(freshDeal);

            set({
                isUpdating: false,
                error: null,
            });

            if (!options.silent) {
                toast.success(
                    getApiMessage(
                        response,
                        "Deal status updated"
                    ),
                    {
                        icon: toastIcon("success"),
                    }
                );
            }

            return freshDeal;
        } catch (error) {
            const errorMessage = getErrorMessage(
                error,
                "Failed to update deal status"
            );

            set({
                isUpdating: false,
                error: errorMessage,
            });

            toast.error(errorMessage, {
                icon: toastIcon("error"),
            });

            throw error;
        }
    },

    getDealById: async (dealId) => {
        set({
            isLoading: true,
            error: null,
        });

        try {
            const response = await http.get(`/deals/${dealId}`);
            const deal = response.data.data;

            set(state => ({
                deals: mergeEntityById(state.deals, deal),
                currentDeal: deal,
                isLoading: false,
                error: null,
            }));

            return deal;
        } catch (error) {
            const errorMessage = getErrorMessage(error, 'Failed to fetch deal');

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

    deleteDeal: async (dealId, options = {}) => {
        set({
            isUpdating: true,
            error: null,
        });

        try {
            const response = await http.delete(`/deals/${dealId}`);
            const data = response.data.data;
            const deletedDealId = getDeletedDealId(data, dealId);

            set(state => ({
                deals: removeEntityById(state.deals, deletedDealId),
                currentDeal: getEntityId(state.currentDeal) === deletedDealId
                    ? null
                    : state.currentDeal,
                isUpdating: false,
                error: null,
            }));

            useCustomerStore.getState().removeDealFromCustomerDeals(deletedDealId);

            if (!options.silent) {
                toast.success(data?.message || getApiMessage(response, 'Deal deleted'), {
                    icon: toastIcon('delete'),
                });
            }

            return data;
        } catch (error) {
            const errorMessage = getErrorMessage(error, 'Failed to delete deal');

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

    getDealActivities: async (dealId, options = {}) => {
        set({
            isActivitiesLoading: true,
            error: null,
        });

        try {
            const response = await http.get(`/deals/${dealId}/activities`, {
                params: compactObject({ cursor: options.cursor }),
            });
            const data = response.data.data || {};
            const existing = get().activitiesByDealId[dealId]?.activities || [];
            const activities = options.append
                ? [...existing, ...(data.activities || [])]
                : data.activities || [];

            set(state => ({
                activitiesByDealId: {
                    ...state.activitiesByDealId,
                    [dealId]: {
                        activities,
                        hasMore: !!data.hasMore,
                        nextCursor: data.nextCursor || null,
                    },
                },
                isActivitiesLoading: false,
                error: null,
            }));

            return data;
        } catch (error) {
            const errorMessage = getErrorMessage(error, 'Failed to fetch deal activities');

            set({
                isActivitiesLoading: false,
                error: errorMessage,
            });

            toast.error(errorMessage, {
                icon: toastIcon('error'),
            });
            throw error;
        }
    },

    upsertActivityInDealFeed: (activity) => {
        const dealId = getEntityId(activity?.deal);
        if (!dealId) return;

        set(state => {
            const feed = state.activitiesByDealId[dealId] || {
                activities: [],
                hasMore: false,
                nextCursor: null,
            };

            return {
                activitiesByDealId: {
                    ...state.activitiesByDealId,
                    [dealId]: {
                        ...feed,
                        activities: mergeEntityById(feed.activities, activity),
                    },
                },
            };
        });
    },

    removeActivityFromDealFeed: (activityId, dealId) => {
        if (!dealId) return;

        set(state => {
            const feed = state.activitiesByDealId[dealId];
            if (!feed) return state;

            return {
                activitiesByDealId: {
                    ...state.activitiesByDealId,
                    [dealId]: {
                        ...feed,
                        activities: removeEntityById(feed.activities, activityId),
                    },
                },
            };
        });
    },

    clearDealState: () => {
        set({
            deals: [],
            currentDeal: null,
            currentOrganizationId: null,
            statistics: DEFAULT_DEAL_STATISTICS,
            pagination: {
                ...DEFAULT_PAGINATION,
                limit: 20,
            },
            activitiesByDealId: {},
            isLoading: false,
            isUpdating: false,
            isActivitiesLoading: false,
            error: null,
        });
    },

    clearError: () => set({ error: null }),
}));
