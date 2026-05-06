import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { Toaster } from '@/components/ui/sonner';
import { useEffect } from 'react';
import { useAuthStore, useUserStore, useSettingsStore } from './stores';
import { initializeThemeFromLocalStorage } from './theme/themeSync.utils';

function App() {
  const { isAuthenticated, getUserProfile } = useAuthStore();
  const { getUserProfile: fetchUserProfile } = useUserStore();
  const { syncThemeWithBackend } = useSettingsStore();

  useEffect(() => {
    // Initialize theme from localStorage before app loads
    initializeThemeFromLocalStorage();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated, fetchUserProfile]);

  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;