import { create } from 'zustand';
import { toast } from 'sonner';
import { http } from '../api/httpClient';
import { toastIcon } from '../config/toastIcon.config';
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

const getCustomerFromPayload = (payload) => payload?.customer || payload;

let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let customersController = null;
let customerDealsController = null;

export const useCustomerStore = create((set) => ({
    customers: [],
    currentCustomer: null,
    currentOrganizationId: null,
    pagination: DEFAULT_PAGINATION,
    organization: null,

    timeline: {
        customer: null,
        summary: {
            totalActivities: 0,
            uniqueDealsCount: 0,
            activityTypes: [],
        },
        activities: [],
        pagination: {
            ...DEFAULT_PAGINATION,
            limit: 20,
        },
    },

    customerDeals: {
        customer: null,
        statistics: DEFAULT_DEAL_STATISTICS,
        deals: [],
        pagination: DEFAULT_PAGINATION,
    },

    isLoading: false,
    isUpdating: false,
    isTimelineLoading: false,
    isCustomerDealsLoading: false,
    error: null,

    getCustomers: async (organizationId, query = {}) => {
        if (!organizationId) {
            set({
                customers: [],
                currentOrganizationId: null,
                organization: null,
                pagination: DEFAULT_PAGINATION,
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

            customersController?.abort();

            controller = new AbortController();

            customersController = controller;
            // await sleep(3000);// Simulate slow network for testing

            const response = await http.get(
                `/customers/organization/${organizationId}`,
                {
                    params: compactObject(query),
                    signal: controller.signal,
                }
            );
            const data = response.data.data || {};

            set({
                customers: data.customers || [],
                currentOrganizationId: organizationId,
                organization: data.organization || null,
                pagination: normalizePagination(data.pagination),
                error: null,
            });

            return data;

        } catch (error) {
            if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") {
                return;
            }

            const errorMessage = getErrorMessage(
                error,
                "Failed to fetch customers"
            );

            set({
                isLoading: false,
                error: errorMessage,
            });

            toast.error(errorMessage, {
                icon: toastIcon("error"),
            });

            throw error;
        } finally {
            if (customersController === controller) {
                customersController = null;
            }

            set({
                isLoading: false,
            });
        }
    },

    createCustomer: async (payload, options = {}) => {
        set({
            isUpdating: true,
            error: null,
        });

        try {
            const response = await http.post('/customers', payload);
            const data = response.data.data;
            const customer = getCustomerFromPayload(data);

            set(state => ({
                customers: mergeEntityById(state.customers, customer),
                currentCustomer: customer,
                isUpdating: false,
                error: null,
            }));

            if (!options.silent) {
                toast.success(getApiMessage(response, data?.message || 'Customer created'), {
                    icon: toastIcon('user'),
                });
            }

            return data;
        } catch (error) {
            const errorMessage = getErrorMessage(error, 'Failed to create customer');

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

    updateCustomer: async (customerId, payload, options = {}) => {
        set({
            isUpdating: true,
            error: null,
        });

        try {
            const response = await http.patch(`/customers/${customerId}`, payload);
            const data = response.data.data;
            const customer = getCustomerFromPayload(data);

            set(state => ({
                customers: mergeEntityById(state.customers, customer),
                currentCustomer: getEntityId(state.currentCustomer) === getEntityId(customer)
                    ? { ...state.currentCustomer, ...customer }
                    : state.currentCustomer,
                isUpdating: false,
                error: null,
            }));

            if (!options.silent) {
                toast.success(getApiMessage(response, data?.message || 'Customer updated'), {
                    icon: toastIcon('user'),
                });
            }

            return data;
        } catch (error) {
            const errorMessage = getErrorMessage(error, 'Failed to update customer');

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

    getCustomer: async (customerId) => {
        set({
            isLoading: true,
            error: null,
        });

        try {
            const response = await http.get(`/customers/${customerId}`);
            const customer = response.data.data;

            set(state => ({
                customers: mergeEntityById(state.customers, customer),
                currentCustomer: customer,
                isLoading: false,
                error: null,
            }));

            return customer;
        } catch (error) {
            const errorMessage = getErrorMessage(error, 'Failed to fetch customer');

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

    deleteCustomer: async (customerId, options = {}) => {
        set({
            isUpdating: true,
            error: null,
        });

        try {
            const response = await http.delete(`/customers/${customerId}`);

            set(state => ({
                customers: removeEntityById(state.customers, customerId),
                currentCustomer: getEntityId(state.currentCustomer) === customerId
                    ? null
                    : state.currentCustomer,
                isUpdating: false,
                error: null,
            }));

            if (!options.silent) {
                toast.success(getApiMessage(response, 'Customer deleted'), {
                    icon: toastIcon('delete'),
                });
            }

            return true;
        } catch (error) {
            const errorMessage = getErrorMessage(error, 'Failed to delete customer');

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

    getCustomerTimeline: async (customerId, query = {}) => {
        set({
            isTimelineLoading: true,
            error: null,
        });

        try {
            const response = await http.get(
                `/customers/${customerId}/timeline`,
                { params: compactObject(query) }
            );
            const data = response.data.data || {};

            set({
                timeline: {
                    customer: data.customer || null,
                    summary: data.summary || {
                        totalActivities: 0,
                        uniqueDealsCount: 0,
                        activityTypes: [],
                    },
                    activities: data.activities || [],
                    pagination: normalizePagination(data.pagination, {
                        ...DEFAULT_PAGINATION,
                        limit: 20,
                    }),
                },
                isTimelineLoading: false,
                error: null,
            });

            return data;
        } catch (error) {
            const errorMessage = getErrorMessage(error, 'Failed to fetch customer timeline');

            set({
                isTimelineLoading: false,
                error: errorMessage,
            });

            toast.error(errorMessage, {
                icon: toastIcon('error'),
            });
            throw error;
        }
    },

    getCustomerDeals: async (
        customerId,
        query = {}
    ) => {

        set({
            isCustomerDealsLoading: true,
            error: null,
        });

        let controller = null;

        try {
            customerDealsController?.abort();

            controller = new AbortController();

            customerDealsController = controller;

            // await sleep(3000);// Simulate slow network for testing

            const response =
                await http.get(
                    `/customers/${customerId}/deals`,
                    {
                        params: compactObject(query),

                        signal: controller.signal,
                    }
                );

            const data = response.data.data || {};

            set({
                customerDeals: {

                    customer: data.customer || null,

                    statistics: data.statistics || DEFAULT_DEAL_STATISTICS,

                    deals: data.deals || [],

                    pagination: normalizePagination(data.pagination),
                },

                error: null,
            });

            return data;

        } catch (error) {
            if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") {
                return;
            }

            const errorMessage = getErrorMessage(error, "Failed to fetch customer deals");

            set({
                error: errorMessage,
            });

            toast.error(errorMessage, {
                icon: toastIcon("error"),
            });

            throw error;
        } finally {
            if (customerDealsController === controller) {
                customerDealsController = null;
            }

            set({
                isCustomerDealsLoading: false,
            });
        }
    },

    upsertActivityInCustomerTimeline: (activity) => {
        set(state => ({
            timeline: {
                ...state.timeline,
                activities: mergeEntityById(state.timeline.activities, activity),
            },
        }));
    },

    removeActivityFromCustomerTimeline: (activityId) => {
        set(state => ({
            timeline: {
                ...state.timeline,
                activities: removeEntityById(state.timeline.activities, activityId),
            },
        }));
    },

    upsertDealInCustomerDeals: (deal) => {
        set(state => ({
            customerDeals: {
                ...state.customerDeals,
                deals: mergeEntityById(state.customerDeals.deals, deal),
            },
        }));
    },

    removeDealFromCustomerDeals: (dealId) => {
        set(state => ({
            customerDeals: {
                ...state.customerDeals,
                deals: removeEntityById(state.customerDeals.deals, dealId),
            },
        }));
    },

    clearCustomerState: () => {
        set({
            customers: [],
            currentCustomer: null,
            currentOrganizationId: null,
            organization: null,
            pagination: DEFAULT_PAGINATION,
            timeline: {
                customer: null,
                summary: {
                    totalActivities: 0,
                    uniqueDealsCount: 0,
                    activityTypes: [],
                },
                activities: [],
                pagination: {
                    ...DEFAULT_PAGINATION,
                    limit: 20,
                },
            },
            customerDeals: {
                customer: null,
                statistics: DEFAULT_DEAL_STATISTICS,
                deals: [],
                pagination: DEFAULT_PAGINATION,
            },
            isLoading: false,
            isUpdating: false,
            isTimelineLoading: false,
            isCustomerDealsLoading: false,
            error: null,
        });
    },

    clearError: () => set({ error: null }),
}));
