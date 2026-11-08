import { ClipboardCheck, Download, Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, descargarPdf, mensajeDeError } from '../api/client';
import type { EvaluacionListado } from '../api/types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatFecha } from '../lib/format';
import { ClasificacionBadge, EstadoBadge, EmptyState, Button, ConfirmDialog } from './ui';

export function EvaluacionTabla({
  evaluaciones,
  mostrarPredio = true,
  onBorrada,
}: {
  evaluaciones: EvaluacionListado[];
  mostrarPredio?: boolean;
  onBorrada?: () => void;
}) {
  const { usuario } = useAuth();
  const { toast } = useToast();
  const [descargando, setDescargando] = useState<number | null>(null);
  const [abiertoBorrar, setAbiertoBorrar] = useState(false);
  const [evaluacionBorrar, setEvaluacionBorrar] = useState<EvaluacionListado | null>(null);
  const [borrando, setBorrando] = useState(false);

  const descargar = async (evaluacion: EvaluacionListado) => {
    setDescargando(evaluacion.id);
    try {
      await descargarPdf(
        `/evaluaciones/${evaluacion.id}/reporte.pdf`,
        `reporte-eba-${evaluacion.id}.pdf`,
      );
      toast('Reporte descargado correctamente.');
    } catch (error) {
      toast(mensajeDeError(error), 'error');
    } finally {
      setDescargando(null);
    }
  };

  const pedirBorrar = (evaluacion: EvaluacionListado) => {
    setEvaluacionBorrar(evaluacion);
    setAbiertoBorrar(true);
  };

  const borrarEvaluacion = async () => {
    if (!evaluacionBorrar) return;
    const raw = window.prompt('¿Por qué se está borrando esta evaluación?\n\nOpciones sugeridas:\n- Error de prueba\n- Prueba equivocación\n- Otro (escribir razón)');
    const motivo = (raw && raw.trim()) || 'Sin especificar';
    if (!motivo) {
      setAbiertoBorrar(false);
      return;
    }
    setAbiertoBorrar(false);
    setBorrando(true);
    try {
      await api.post(`/evaluaciones/${evaluacionBorrar.id}/borrar`, { motivo });
      toast(`Evaluación borrada. Motivo: ${motivo}`);
      if (onBorrada) onBorrada();
      else window.location.reload();
    } catch (error) {
      toast(mensajeDeError(error), 'error');
    } finally {
      setBorrando(false);
    }
  };

  if (evaluaciones.length === 0) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="Sin evaluaciones"
        description="Todavía no hay evaluaciones que coincidan con este filtro."
      />
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-brand-900/[0.07] md:block">
        <table className="w-full border-collapse text-left">
          <thead className="table-head">
            <tr>
              {mostrarPredio && <th className="px-4 py-3">Predio</th>}
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Evaluador</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Puntaje</th>
              <th className="px-4 py-3">Clasificación</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-900/[0.06] bg-white">
            {evaluaciones.map((evaluacion) => (
              <tr key={evaluacion.id} className="transition hover:bg-brand-50/40">
                {mostrarPredio && (
                  <td className="px-4 py-3.5">
                    <Link
                      to={`/predios/${evaluacion.predio_id}`}
                      className="text-sm font-bold text-ink hover:text-brand-700"
                    >
                      {evaluacion.predio_nombre}
                    </Link>
                    <p className="mt-0.5 text-[11px] capitalize text-brand-900/40">
                      {evaluacion.predio_especie.toLowerCase()} ·{' '}
                      {evaluacion.predio_sistema_productivo.replace('_', ' ').toLowerCase()}
                    </p>
                  </td>
                )}
                <td className="px-4 py-3.5 text-sm text-brand-900/65">{formatFecha(evaluacion.fecha)}</td>
                <td className="px-4 py-3.5 text-sm text-brand-900/65">{evaluacion.evaluador_nombre}</td>
                <td className="px-4 py-3.5">
                  <EstadoBadge estado={evaluacion.estado} />
                </td>
                <td className="px-4 py-3.5 text-right">
                  {evaluacion.puntaje_total === null ? (
                    <span className="text-xs font-semibold text-brand-900/30">—</span>
                  ) : (
                    <span className="font-display text-base font-semibold tabular-nums text-ink">
                      {evaluacion.puntaje_total.toFixed(2)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <ClasificacionBadge clasificacion={evaluacion.clasificacion} />
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1.5">
                    {evaluacion.estado === 'BORRADOR' && usuario?.rol !== 'RESPONSABLE' ? (
                      <Link
                        to={`/evaluaciones/${evaluacion.id}`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand-100 px-2.5 text-[11px] font-bold text-brand-800 transition hover:bg-brand-200"
                      >
                        <ClipboardCheck className="h-3.5 w-3.5" />
                        Continuar
                      </Link>
                    ) : (
                      <Link
                        to={`/evaluaciones/${evaluacion.id}/resultados`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 text-[11px] font-bold text-brand-800 transition hover:bg-brand-100"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Resultados
                      </Link>
                    )}
                    {usuario?.rol !== 'RESPONSABLE' && (
                      <button
                        type="button"
                        onClick={() => pedirBorrar(evaluacion)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-red-50 px-2.5 text-[11px] font-bold text-red-700 transition hover:bg-red-100"
                        aria-label="Borrar evaluación"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Borrar
                      </button>
                    )}
                    {evaluacion.estado === 'CERRADA' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        loading={descargando === evaluacion.id}
                        onClick={() => descargar(evaluacion)}
                        aria-label="Descargar reporte PDF"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {evaluaciones.map((evaluacion) => (
          <div key={evaluacion.id} className="card-base p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link
                  to={`/predios/${evaluacion.predio_id}`}
                  className="text-sm font-bold text-ink hover:text-brand-700"
                >
                  {evaluacion.predio_nombre}
                </Link>
                <p className="mt-0.5 text-[11px] capitalize text-brand-900/40">
                  {formatFecha(evaluacion.fecha)} · {evaluacion.evaluador_nombre}
                </p>
              </div>
              <EstadoBadge estado={evaluacion.estado} />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ClasificacionBadge clasificacion={evaluacion.clasificacion} />
              </div>
              {evaluacion.puntaje_total !== null && (
                <span className="font-display text-lg font-semibold tabular-nums text-ink">
                  {evaluacion.puntaje_total.toFixed(2)}
                </span>
              )}
            </div>
            <div className="mt-3 flex gap-2 border-t border-brand-900/[0.06] pt-3">
              {evaluacion.estado === 'BORRADOR' && usuario?.rol !== 'RESPONSABLE' ? (
                <Link
                  to={`/evaluaciones/${evaluacion.id}`}
                  className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-100 text-xs font-bold text-brand-800"
                >
                  <ClipboardCheck className="h-4 w-4" />
                  Continuar
                </Link>
              ) : (
                <Link
                  to={`/evaluaciones/${evaluacion.id}/resultados`}
                  className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-50 text-xs font-bold text-brand-800"
                >
                  <Eye className="h-4 w-4" />
                  Resultados
                </Link>
              )}
              {usuario?.rol !== 'RESPONSABLE' && (
                <button
                  type="button"
                  onClick={() => pedirBorrar(evaluacion)}
                  className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-50 text-xs font-bold text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Borrar
                </button>
              )}
              {evaluacion.estado === 'CERRADA' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                  loading={descargando === evaluacion.id}
                  onClick={() => descargar(evaluacion)}
                >
                  <Download className="h-4 w-4" />
                  PDF
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={abiertoBorrar}
        title="Borrar evaluación"
        description={`Se pedirá el motivo del borrado y quedará guardado en el registro de evaluaciones borradas.${evaluacionBorrar ? ` La evaluación del predio ${evaluacionBorrar.predio_nombre} (${evaluacionBorrar.estado}) se eliminará permanentemente.` : ''}`}
        confirmLabel="Continuar con borrado"
        onCancel={() => setAbiertoBorrar(false)}
        onConfirm={() => void borrarEvaluacion()}
      />
    </>
  );
}
