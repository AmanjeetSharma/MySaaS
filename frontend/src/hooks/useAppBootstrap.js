import { useEffect } from 'react';

import { useAppStore } from '../stores/appStore';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';
import { useSettingsStore } from '../stores/settingsStore';

import { http } from '../api/httpClient';
import {
    syncThemeWithBackend
} from '../theme/themeSync.utils';

const DEFAULT_SETTINGS = {
    theme: {
        name: 'default',
        mode: 'dark',
        tier: 'free'
    },
    timezone: 'Asia/Kolkata',
    notifications: {
        email: false,
        inApp: true
    }
};

const getHydratedSettings = (settings = {}) => ({
    theme: {
        name: settings.theme?.name || DEFAULT_SETTINGS.theme.name,
        mode: settings.theme?.mode || DEFAULT_SETTINGS.theme.mode,
        tier: settings.theme?.tier || DEFAULT_SETTINGS.theme.tier
    },
    timezone: settings.timezone || DEFAULT_SETTINGS.timezone,
    notifications:
        settings.notifications || DEFAULT_SETTINGS.notifications
});

const hydrateUserStores = (user) => {
    const settings = getHydratedSettings(user.settings);

    useAuthStore.setState({
        user,
        isAuthenticated: true
    });

    useUserStore.setState({
        userProfile: user,
        phoneNumber: user.phone?.number || null,
        isPhoneVerified: user.phone?.isVerified || false,
        isLoading: false,
        error: null
    });

    useSettingsStore.setState({
        ...settings,
        isLoading: false,
        error: null
    });

    syncThemeWithBackend(
        settings.theme.name,
        settings.theme.mode
    );
};

export const useAppBootstrap = () => {
    const setAppReady = useAppStore((state) => state.setAppReady);
    const setRateLimit = useAppStore((state) => state.setRateLimit);
    const clearRateLimit = useAppStore((state) => state.clearRateLimit);
    const isAuthenticated = useAuthStore(
        (state) => state.isAuthenticated
    );

    useEffect(() => {
        let isMounted = true;

        const bootstrap = async () => {
            if (!isAuthenticated) {
                clearRateLimit();
                useUserStore.getState().resetUserStore();
                setAppReady(true);
                return;
            }

            setAppReady(false);
            useUserStore.setState({
                isLoading: true,
                error: null
            });

            try {
                const response = await http.get('/users/me');
                const { data } = response.data;

                if (isMounted) {
                    clearRateLimit();
                    hydrateUserStores(data);
                }
            } catch (error) {
                console.error('Bootstrap failed:', error);

                if (isMounted) {
                    if (error.isRateLimited || error.response?.status === 429) {
                        setRateLimit({
                            message:
                                error.response?.data?.message ||
                                'Too many requests. Please try again shortly.',
                            retryAfter:
                                error.response?.data?.retryAfter ??
                                error.retryAfter ??
                                null,
                            retryAt:
                                error.response?.data?.retryAt ??
                                error.retryAt ??
                                null
                        });
                        return;
                    }

                    useAuthStore.setState({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false
                    });
                    useUserStore.getState().resetUserStore();
                    localStorage.removeItem('auth-storage');
                }
            } finally {
                if (isMounted) {
                    setAppReady(true);
                }
            }
        };

        bootstrap();

        return () => {
            isMounted = false;
        };
    }, [clearRateLimit, isAuthenticated, setAppReady, setRateLimit]);
};
