import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function UserRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export function AdminRoute() {
  const { userRole } = useAuth();
  return userRole === 'ADMIN' ? <Outlet /> : <Navigate to="/" replace />;
}
