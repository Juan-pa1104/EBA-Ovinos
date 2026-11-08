import { AlertCircle, Eye, EyeOff, Leaf, Lock, Mail } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { mensajeDeError } from '../api/client';
import { Button, LoadingScreen } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/format';

const LIBERTADES = [
  'Libre de hambre, sed y desnutrición',
  'Libre de molestias físicas y térmicas',
  'Libre de dolor, lesión y enfermedad',
  'Libre de temor y angustia',
  'Libre de impedimentos de comportamiento natural',
];

export function LoginPage() {
  const { usuario, cargando, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const destino =
    (location.state as { from?: string } | null)?.from &&
    (location.state as { from?: string }).from !== '/login'
      ? (location.state as { from?: string }).from!
      : '/';

  useEffect(() => {
    if (usuario) {
      navigate(destino, { replace: true });
    }
  }, [usuario, destino, navigate]);

  if (cargando) return <LoadingScreen label="Verificando sesión..." />;

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await login(correo.trim(), password);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-cream">
      <section className="relative hidden w-[52%] flex-col justify-between overflow-hidden bg-brand-900 p-12 text-white lg:flex">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 h-[28rem] w-[28rem] rounded-full bg-earth-500/15 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
            <Leaf className="h-7 w-7 text-brand-200" />
          </div>
          <div>
            <p className="font-display text-xl font-semibold leading-tight">EBA</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-300">
              Bienestar animal
            </p>
          </div>
        </div>

        <div className="relative max-w-xl">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-300">
            Metodología ICA · Versión 2.0
          </p>
          <h1 className="font-display text-[2.7rem] font-semibold leading-[1.1] tracking-tight">
            Evaluación de bienestar animal en ovinos y caprinos
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-brand-100/75">
            Digitalice la evaluación en campo, califique las cinco libertades y entregue
            resultados claros a cada responsable de predio.
          </p>

          <div className="mt-9 space-y-2.5">
            {LIBERTADES.map((libertad, indice) => (
              <div
                key={libertad}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 backdrop-blur-sm"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-500/25 text-[11px] font-extrabold text-brand-100">
                  {indice + 1}
                </span>
                <span className="text-sm font-medium text-brand-50/90">{libertad}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-[11px] text-brand-300/70">
          Instituto Colombiano Agropecuario · Sistema de Evaluación de Bienestar Animal
        </p>
      </section>

      <section className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-700 text-white">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display text-xl font-semibold leading-tight text-ink">EBA</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-600">
                Bienestar animal
              </p>
            </div>
          </div>

          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
            Acceso al sistema
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
            Inicie sesión
          </h2>
          <p className="mt-2 text-sm text-brand-900/55">
            Ingrese con el correo y la contraseña asignados por el administrador.
          </p>

          <form onSubmit={enviar} className="mt-8 space-y-5">
            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="font-medium leading-snug">{error}</p>
              </div>
            )}

            <div>
              <label className="field-label" htmlFor="correo">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-900/35" />
                <input
                  id="correo"
                  type="email"
                  autoComplete="email"
                  required
                  value={correo}
                  onChange={(evento) => setCorreo(evento.target.value)}
                  placeholder="nombre@entidad.gov.co"
                  className="input-base h-12 pl-10"
                />
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-900/35" />
                <input
                  id="password"
                  type={verPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(evento) => setPassword(evento.target.value)}
                  placeholder="••••••••"
                  className="input-base h-12 pl-10 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setVerPassword((valor) => !valor)}
                  className={cn(
                    'absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-brand-900/35 transition hover:bg-brand-50 hover:text-brand-800',
                  )}
                  aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {verPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" loading={enviando} className="w-full">
              Ingresar
            </Button>
          </form>

          <p className="mt-6 text-center text-xs leading-relaxed text-brand-900/45">
            ¿Olvidó su contraseña? Contacte al administrador del sistema para restablecerla.
          </p>
          <p className="mt-8 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-900/30">
            ICA · Evaluación de Bienestar Animal
          </p>
        </div>
      </section>
    </div>
  );
}
