import { ArrowLeft, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, mensajeDeError } from '../api/client';
import { Button, Card, EmptyState, ErrorState, LoadingBlock, PageHeader } from '../components/ui';

interface Borrada {
  id: number;
  evaluacion_id: number;
  motivo: string;
  fecha_borrado: string;
}

export function EvaluacionesBorradasPage() {
  const [borradas, setBorradas] = useState<Borrada[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = () => {
    setCargando(true);
    setError(null);
    api.get<Borrada[]>('/evaluaciones/borradas').then((data) => {
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
        title="Evaluaciones borradas"
        subtitle={`Historial de evaluaciones eliminadas con el motivo del borrado. ${borradas.length} registro(s).`}
        actions={
          <Link to="/evaluaciones">
            <Button variant="outline" icon={ArrowLeft}>
              Volver a evaluaciones
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
          title="No hay evaluaciones borradas"
          description="Cuando borras una evaluación con su motivo, aparecerá registrada aquí."
        />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full border-collapse text-left">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">ID Evaluación</th>
                <th className="px-4 py-3">Motivo</th>
                <th className="px-4 py-3">Fecha borrado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-900/[0.06] bg-white">
              {borradas.map((b) => (
                <tr key={b.id} className="transition hover:bg-brand-50/40">
                  <td className="px-4 py-3.5"><span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">#{b.evaluacion_id}</span></td>
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
