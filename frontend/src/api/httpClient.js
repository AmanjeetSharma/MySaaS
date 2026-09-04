import axios from "axios";

import { useAppStore } from "@/stores/appStore";

export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" }
});

// Store refresh promise to prevent multiple refresh calls
let refreshPromise = null;

// List of endpoints that should NOT trigger refresh token
const skipRefreshEndpoints = [
    "/auth/refresh",
    "/auth/login",
    "/auth/register",
    "/auth/verify",
    "/auth/logout",
    "/auth/login/google"
];

const parseRetryAfter = (retryAfterHeader, responseMessage = "") => {
    if (retryAfterHeader) {
        const numericRetryAfter = Number(retryAfterHeader);

        if (Number.isFinite(numericRetryAfter)) {
            return Math.max(0, Math.ceil(numericRetryAfter));
        }

        const retryAfterDate = Date.parse(retryAfterHeader);

        if (!Number.isNaN(retryAfterDate)) {
            return Math.max(0, Math.ceil((retryAfterDate - Date.now()) / 1000));
        }
    }

    const retryAfterMatch = String(responseMessage || "")
        .match(/after\s+(\d+)\s+seconds?/i);

    return retryAfterMatch ? Number(retryAfterMatch[1]) : null;
};

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;

        if (status === 429) {
            const responseData = error.response?.data;
            const responseMessage = responseData?.message;
            const retryAfter = parseRetryAfter(
                error.response?.headers?.["retry-after"],
                responseMessage
            );
            const message = responseMessage ||
                (retryAfter
                    ? `Too many requests. Please try again after ${retryAfter} seconds.`
                    : "Too many requests. Please try again shortly.");

            error.isRateLimited = true;
            error.retryAfter = retryAfter;
            error.retryAt = retryAfter ? Date.now() + retryAfter * 1000 : null;

            if (error.response) {
                error.response.data = {
                    ...(typeof responseData === "object" && responseData !== null
                        ? responseData
                        : {}),
                    message,
                    retryAfter,
                    retryAt: error.retryAt
                };
            }

            useAppStore.getState().setRateLimit({
                message,
                retryAfter,
                retryAt: error.retryAt
            });

            return Promise.reject(error);
        }

        // Check if this endpoint should skip refresh
        const shouldSkipRefresh = skipRefreshEndpoints.some(endpoint =>
            originalRequest.url?.includes(endpoint)
        );

        // Don't retry if already retried or if it's an auth endpoint
        if (originalRequest._retry || shouldSkipRefresh) {
            return Promise.reject(error);
        }

        // If unauthorized (401) → Try refresh token
        if (status === 401) {
            originalRequest._retry = true;

            try {
                // If there's already a refresh in progress, wait for it
                if (!refreshPromise) {
                    refreshPromise = axiosInstance.post("/auth/refresh", {}, { withCredentials: true })
                        .then(() => {
                            refreshPromise = null;
                        })
                        .catch((err) => {
                            refreshPromise = null;
                            throw err;
                        });
                }

                await refreshPromise;

                // Retry the original request
                return axiosInstance(originalRequest);
            } catch (refreshErr) {
                // Refresh failed - redirect to login
                localStorage.removeItem("backendReady");

                // Dispatch custom event for auth failure
                window.dispatchEvent(new CustomEvent("auth:logout"));

                return Promise.reject(refreshErr);
            }
        }

        return Promise.reject(error);
    }
);

export const http = axiosInstance;
