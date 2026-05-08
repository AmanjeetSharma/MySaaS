import { useLocation } from 'react-router-dom';
import { AppRoutes } from '../../routes/AppRoutes';
import { useEffect } from 'react';
import { initializeThemeFromLocalStorage } from '../../theme/themeSync.utils';

export const AppContent = () => {
    const location = useLocation();

    const isAuthRoute = () => {
        const authPaths = [
            '/login',
            '/register',
            '/forgot-password',
            '/reset-password',
            '/',
        ];

        if (authPaths.includes(location.pathname)) {
            return true;
        }
        if (location.pathname.startsWith('/verify/')) {
            return true;
        }

        return false;
    };

    useEffect(() => {
        // Only initialize theme for non-auth routes
        if (!isAuthRoute()) {
            initializeThemeFromLocalStorage();
        } else {
            // Reset theme styles for auth pages
            const root = document.documentElement;
            root.removeAttribute('style');
        }
    }, [location.pathname]);

    return <AppRoutes />;
}