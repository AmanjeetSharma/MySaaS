import "./App.css";
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { Toaster } from '@/components/ui/sonner';
import { useEffect } from 'react';
import { initializeThemeFromLocalStorage } from './theme/themeSync.utils';

function App() {

  useEffect(() => {
    // Initialize theme from localStorage before app loads
    initializeThemeFromLocalStorage();
  }, []);


  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;