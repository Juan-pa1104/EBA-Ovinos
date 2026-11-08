import { ArrowLeft, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, mensajeDeError } from '../api/client';
import { Button, Card, EmptyState, ErrorState, LoadingBlock, PageHeader } from '../components/ui';

interface Borrada {
  id: number;
  predio_id: number;
  nombre: string;
  municipio: string;
  motivo: string;
  fecha_borrado: string;
}

export function PrediosBorradosPage() {
  const [borradas, setBorradas] = useState<Borrada[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = () => {
    setCargando(true);
    setError(null);
    api.get<Borrada[]>('/predios/borradas').then((data) => {
      setBorradas(data);
      setCargando(false);
    }).catch((err) => {
      setError(mensajeDeError(err));
      setCargando(false);
    });
  };

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Historial"
        title="Predios borrados"
        subtitle={`Historial de predios eliminados con el motivo del borrado. ${borradas.length} registro(s).`}
        actions={
          <Link to="/predios">
            <Button variant="outline" icon={ArrowLeft}>
              Volver a predios
            </Button>
          </Link>
        }
      />

      {cargando ? (
        <LoadingBlock label="Cargando historial de borradas..." />
      ) : error ? (
        <ErrorState message={error} onRetry={cargar} />
      ) : borradas.length === 0 ? (
        <EmptyState
          icon={Trash2}
          title="No hay predios borrados"
          description="Cuando borras un predio con su motivo, aparecerá registrado aquí."
        />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full border-collapse text-left">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">ID Predio</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Municipio</th>
                <th className="px-4 py-3">Motivo</th>
                <th className="px-4 py-3">Fecha borrado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-900/[0.06] bg-white">
              {borradas.map((b) => (
                <tr key={b.id} className="transition hover:bg-brand-50/40">
                  <td className="px-4 py-3.5"><span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">#{b.predio_id}</span></td>
                  <td className="px-4 py-3.5 text-sm font-bold text-ink">{b.nombre}</td>
                  <td className="px-4 py-3.5 text-sm text-brand-900/70">{b.municipio}</td>
                  <td className="px-4 py-3.5 text-sm text-brand-900/80">{b.motivo}</td>
                  <td className="px-4 py-3.5 text-sm text-brand-900/60">{new Date(b.fecha_borrado).toLocaleString('es-CO')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
