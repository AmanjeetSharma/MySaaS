import axios from "axios";

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

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check if this endpoint should skip refresh
        const shouldSkipRefresh = skipRefreshEndpoints.some(endpoint =>
            originalRequest.url?.includes(endpoint)
        );

        // Don't retry if already retried or if it's an auth endpoint
        if (originalRequest._retry || shouldSkipRefresh) {
            return Promise.reject(error);
        }

        // If unauthorized (401) → Try refresh token
        if (error.response?.status === 401) {
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