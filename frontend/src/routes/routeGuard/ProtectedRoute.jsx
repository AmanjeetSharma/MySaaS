import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}