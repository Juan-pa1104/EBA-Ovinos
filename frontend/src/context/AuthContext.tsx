import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, clearToken, getToken, setToken } from '../api/client';
import type { AuthResponse, Usuario } from '../api/types';

interface AuthContextValue {
  usuario: Usuario | null;
  cargando: boolean;
  login: (correo: string, password: string) => Promise<Usuario>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    const token = getToken();

    if (!token) {
      setCargando(false);
      return;
    }

    api
      .get<{ usuario: Usuario }>('/auth/me')
      .then((respuesta) => {
        if (activo) setUsuario(respuesta.usuario);
      })
      .catch(() => {
        clearToken();
        if (activo) setUsuario(null);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    const manejarSesionExpirada = () => setUsuario(null);
    window.addEventListener('eba:unauthorized', manejarSesionExpirada);
    return () => window.removeEventListener('eba:unauthorized', manejarSesionExpirada);
  }, []);

  const login = useCallback(async (correo: string, password: string) => {
    const respuesta = await api.post<AuthResponse>('/auth/login', { correo, password });
    setToken(respuesta.token);
    setUsuario(respuesta.usuario);
    return respuesta.usuario;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUsuario(null);
  }, []);

  const value = useMemo(
    () => ({ usuario, cargando, login, logout }),
    [usuario, cargando, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return contexto;
}
