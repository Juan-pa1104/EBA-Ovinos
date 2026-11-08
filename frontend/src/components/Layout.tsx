import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  History,
  LayoutDashboard,
  Leaf,
  LogOut,
  MapPin,
  Menu,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/format';
import { Avatar } from './ui';

const ETIQUETA_ROL: Record<string, string> = {
  ADMIN: 'Administrador',
  EVALUADOR: 'Evaluador',
  RESPONSABLE: 'Responsable de predio',
};

interface ItemNav {
  to: string;
  label: string;
  shortLabel?: string;
  icon: typeof LayoutDashboard;
  roles: string[];
  end?: boolean;
}

const NAVEGACION: ItemNav[] = [
  { to: '/', label: 'Panel', icon: LayoutDashboard, roles: ['ADMIN', 'EVALUADOR', 'RESPONSABLE'], end: true },
  { to: '/predios', label: 'Predios', icon: MapPin, roles: ['ADMIN', 'EVALUADOR', 'RESPONSABLE'] },
  {
    to: '/evaluaciones',
    label: 'Evaluaciones',
    icon: ClipboardCheck,
    roles: ['ADMIN', 'EVALUADOR', 'RESPONSABLE'],
  },
  {
    to: '/historial',
    label: 'Historial',
    icon: History,
    roles: ['ADMIN', 'EVALUADOR', 'RESPONSABLE'],
    end: true,
  },
  {
    to: '/historial-global',
    label: 'Historial global',
    shortLabel: 'Global',
    icon: BarChart3,
    roles: ['ADMIN'],
    end: true,
  },
  { to: '/usuarios', label: 'Usuarios', icon: Users, roles: ['ADMIN'] },
  { to: '/indicadores', label: 'Catálogo', icon: BookOpen, roles: ['ADMIN'] },
];

export function Layout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    setMenuAbierto(false);
  }, [location.pathname]);

  if (!usuario) return null;

  const items = NAVEGACION.filter((item) => item.roles.includes(usuario.rol));
  const itemsMoviles = items.filter((item) => item.to !== '/usuarios' && item.to !== '/indicadores');

  const cerrarSesion = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const etiquetaEvaluaciones = usuario.rol === 'RESPONSABLE' ? 'Mis resultados' : 'Evaluaciones';

  return (
    <div className="min-h-screen bg-cream">
      {/* Sidebar escritorio */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col bg-brand-900 text-white lg:flex">
        <div className="flex items-center gap-3 px-6 pb-6 pt-7">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
            <Leaf className="h-6 w-6 text-brand-200" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold leading-tight">EBA</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-300">
              Bienestar animal
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          <p className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-400">
            Navegación
          </p>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                  isActive
                    ? 'bg-white/12 text-white shadow-sm ring-1 ring-white/10'
                    : 'text-brand-200/80 hover:bg-white/[0.06] hover:text-white',
                )
              }
            >
              <item.icon className="h-[18px] w-[18px] shrink-0 opacity-90" />
              {item.to === '/evaluaciones' ? etiquetaEvaluaciones : item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-4">
          <div className="rounded-2xl bg-white/[0.06] p-3 ring-1 ring-white/10">
            <div className="flex items-center gap-3">
              <Avatar nombre={usuario.nombre} className="bg-brand-500 text-brand-950" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{usuario.nombre}</p>
                <p className="truncate text-[11px] text-brand-300">{ETIQUETA_ROL[usuario.rol]}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={cerrarSesion}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-brand-200 transition hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              Cerrar sesión
            </button>
          </div>
          <p className="mt-3 px-2 text-center text-[10px] leading-relaxed text-brand-400/70">
            Metodología ICA · Ovinos y caprinos
          </p>
        </div>
      </aside>

      {/* Barra superior móvil */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-brand-900/[0.07] bg-cream/90 px-4 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setMenuAbierto(true)}
          className="rounded-xl p-2 text-brand-800 transition hover:bg-brand-100"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-brand-600" />
          <span className="font-display text-base font-semibold">EBA</span>
        </div>
        <Avatar nombre={usuario.nombre} />
      </header>

      {/* Drawer móvil */}
      {menuAbierto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-brand-950/45 backdrop-blur-sm"
            onClick={() => setMenuAbierto(false)}
            role="presentation"
          />
          <aside className="absolute inset-y-0 left-0 flex w-[290px] animate-slide-in flex-col bg-brand-900 text-white">
            <div className="flex items-center justify-between px-5 pb-4 pt-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <Leaf className="h-5 w-5 text-brand-200" />
                </div>
                <div>
                  <p className="font-display text-lg font-semibold">EBA</p>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-brand-300">Bienestar animal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMenuAbierto(false)}
                className="rounded-lg p-2 text-brand-200 hover:bg-white/10"
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-3 pt-2">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition',
                      isActive ? 'bg-white/12 text-white' : 'text-brand-200/80 hover:bg-white/[0.06]',
                    )
                  }
                >
                  <item.icon className="h-[18px] w-[18px]" />
                  {item.to === '/evaluaciones' ? etiquetaEvaluaciones : item.label}
                </NavLink>
              ))}
            </nav>
            <div className="border-t border-white/10 p-4">
              <div className="flex items-center gap-3">
                <Avatar nombre={usuario.nombre} className="bg-brand-500 text-brand-950" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{usuario.nombre}</p>
                  <p className="truncate text-[11px] text-brand-300">{ETIQUETA_ROL[usuario.rol]}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={cerrarSesion}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs font-bold text-brand-200"
              >
                <LogOut className="h-3.5 w-3.5" />
                Cerrar sesión
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Contenido */}
      <div className="lg:pl-[264px]">
        <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
          <Outlet />
        </main>
      </div>

      {/* Navegación inferior móvil */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-brand-900/[0.08] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-around px-2">
          {itemsMoviles.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center gap-1 px-2 py-2.5 text-[10px] font-bold transition',
                  isActive ? 'text-brand-700' : 'text-brand-900/40',
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.to === '/evaluaciones' ? 'Resultados' : (item.shortLabel ?? item.label)}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
