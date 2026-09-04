import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import { AppRoutes } from '../../routes/AppRoutes';
import { AppLoader } from '../loader/AppLoader';
import { RateLimitFallback } from './RateLimitFallback';

import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { useAppBootstrap } from '@/hooks/useAppBootstrap';
import { useUserStore } from '@/stores/userStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { applyPublicTheme, applyUserTheme } from '@/theme/theme.utils';

const PUBLIC_PATHS = [
    '/',
    '/signin',
    '/signup',
    '/forgot-password',
    '/reset-password',
];

const isPublicRoute = (pathname) => {
    return (
        PUBLIC_PATHS.includes(pathname) ||
        pathname.startsWith('/verify/') ||
        pathname.startsWith('/book/')
    );
};

const isPublicBookingRoute = (pathname) => pathname.startsWith('/book/');

export const AppContent = () => {
    const location = useLocation();

    useAppBootstrap();

    const isAppReady = useAppStore(
        (state) => state.isAppReady
    );
    const rateLimit = useAppStore((state) => state.rateLimit);
    const isAuthenticated = useAuthStore(
        (state) => state.isAuthenticated
    );
    const userProfile = useUserStore(
        (state) => state.userProfile
    );
    const theme = useSettingsStore((state) => state.theme);

    const isOnPublicRoute = isPublicRoute(location.pathname);
    const isOnPublicBookingRoute = isPublicBookingRoute(location.pathname);

    useEffect(() => {
        if (isOnPublicRoute) {
            applyPublicTheme();
            return;
        }

        if (isAuthenticated) {
            applyUserTheme(theme.name, theme.mode);
        }
    }, [isOnPublicRoute, isAuthenticated, theme.name, theme.mode]);

    const isProtectedHydrating = !isOnPublicRoute && isAuthenticated && !userProfile;

    if (!isOnPublicBookingRoute && (!isAppReady || isProtectedHydrating)) {
        return (
            <>
                <AppLoader />
                {rateLimit && <RateLimitFallback rateLimit={rateLimit} />}
            </>
        );
    }

    return (
        <>
            <AppRoutes />
            {rateLimit && <RateLimitFallback rateLimit={rateLimit} />}
        </>
    );
};
