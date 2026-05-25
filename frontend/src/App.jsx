import "./App.css";
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AppContent } from './components/app/AppContent';

function App() {
  return (
    <BrowserRouter>
      <AppContent />
      <Toaster closeButton />
    </BrowserRouter>
  );
}

export default App;