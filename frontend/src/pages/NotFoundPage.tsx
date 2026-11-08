import { ArrowLeft, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-100 text-brand-700">
          <Leaf className="h-8 w-8" />
        </div>
        <p className="mt-6 font-display text-6xl font-semibold text-brand-700">404</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink">Página no encontrada</h1>
        <p className="mt-2 max-w-md text-sm text-brand-900/55">
          La dirección que ingresó no existe o ya no está disponible.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-brand-700 px-5 text-sm font-bold text-white transition hover:bg-brand-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al panel
        </Link>
      </div>
    </div>
  );
}
