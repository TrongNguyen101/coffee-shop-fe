import { Navigate, Outlet } from 'react-router-dom';
import { ENV } from '@/constants/evn';
import { useAppSelector } from '@/store/hooks';

export function ProtectedRoute() {
  const userId = useAppSelector((state) => state.auth.userId);

  // In mock mode, bypass authentication for development
  if (ENV.ENABLE_MOCK) {
    return <Outlet />;
  }

  // In production, require userId — redirect to login if missing
  if (!userId) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
