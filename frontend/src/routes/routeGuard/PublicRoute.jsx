import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores';

export function PublicRoute() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}