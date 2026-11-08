import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Rol } from '../api/types';
import { LoadingScreen } from './ui';

export function ProtectedRoute({ roles }: { roles?: Rol[] }) {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return <LoadingScreen label="Verificando sesión..." />;
  }

  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
