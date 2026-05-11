import { useLocation } from 'react-router-dom';

import { AppRoutes } from '../../routes/AppRoutes';
import { AppLoader } from '../loader/AppLoader';

import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { useAppBootstrap } from '@/hooks/useAppBootstrap';
import { useUserStore } from '@/stores/userStore';

const AUTH_PATHS = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
];

const isAuthRoute = (pathname) => {
    return (
        AUTH_PATHS.includes(pathname) ||
        pathname.startsWith('/verify/')
    );
};

export const AppContent = () => {
    const location = useLocation();

    useAppBootstrap();

    const isAppReady = useAppStore(
        (state) => state.isAppReady
    );
    const isAuthenticated = useAuthStore(
        (state) => state.isAuthenticated
    );
    const userProfile = useUserStore(
        (state) => state.userProfile
    );

    const isOnAuthRoute = isAuthRoute(location.pathname);
    const isProtectedHydrating =
        !isOnAuthRoute && isAuthenticated && !userProfile;

    if (!isAppReady || isProtectedHydrating) {
        return <AppLoader />;
    }

    return <AppRoutes />;
};
