import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { cn } from '../lib/format';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  mensaje: string;
  tipo: ToastType;
}

interface ToastContextValue {
  toast: (mensaje: string, tipo?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const contador = useRef(0);

  const quitar = useCallback((id: number) => {
    setToasts((actuales) => actuales.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (mensaje: string, tipo: ToastType = 'success') => {
      contador.current += 1;
      const id = contador.current;
      setToasts((actuales) => [...actuales, { id, mensaje, tipo }]);
      window.setTimeout(() => quitar(id), 4500);
    },
    [quitar],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((item) => {
          const Icono =
            item.tipo === 'success' ? CheckCircle2 : item.tipo === 'error' ? XCircle : Info;
          return (
            <div
              key={item.id}
              className={cn(
                'pointer-events-auto flex animate-slide-in items-start gap-3 rounded-2xl border bg-white p-3.5 shadow-lift',
                item.tipo === 'success' && 'border-emerald-200',
                item.tipo === 'error' && 'border-red-200',
                item.tipo === 'info' && 'border-sky-200',
              )}
              role="status"
            >
              <Icono
                className={cn(
                  'mt-0.5 h-5 w-5 shrink-0',
                  item.tipo === 'success' && 'text-emerald-600',
                  item.tipo === 'error' && 'text-red-600',
                  item.tipo === 'info' && 'text-sky-600',
                )}
              />
              <p className="flex-1 text-sm font-medium leading-snug text-ink">{item.mensaje}</p>
              <button
                type="button"
                onClick={() => quitar(item.id)}
                className="rounded-lg p-1 text-brand-900/35 transition hover:bg-brand-50 hover:text-brand-900/70"
                aria-label="Cerrar notificación"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const contexto = useContext(ToastContext);
  if (!contexto) {
    throw new Error('useToast debe usarse dentro de ToastProvider');
  }
  return contexto;
}
