import { useLocation } from 'react-router-dom';
import { AppRoutes } from '../../routes/AppRoutes';
import { useEffect } from 'react';
import { initializeThemeFromLocalStorage } from '../../theme/themeSync.utils';
import { useUserStore, useAuthStore } from '@/stores'; 

export const AppContent = () => {
    const location = useLocation();
    const { getUserProfile, userProfile } = useUserStore();
 
    const isAuthRoute = () => {
        const authPaths = [
            '/login',
            '/register',
            '/forgot-password',
            '/reset-password',
            '/',
        ];

        return authPaths.includes(location.pathname) || location.pathname.startsWith('/verify/');
    };

    useEffect(() => {
        // 1. Theme Logic
        if (!isAuthRoute()) {
            initializeThemeFromLocalStorage();
        } else {
            const root = document.documentElement;
            root.removeAttribute('style');
        }

        // 2. Profile Hydration Logic
        // If the user is logged in and we don't have the profile yet, fetch it.
        // This ensures a refresh on any protected page triggers the fetch.
        if (!isAuthRoute() && !userProfile) {
            getUserProfile().catch(() => {
                console.error("Failed to hydrate user profile on refresh");
            });
        }
    }, [location.pathname]);

    return <AppRoutes />;
}