import { ArrowLeft, Download, Leaf, Printer } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, descargarPdf, mensajeDeError } from '../api/client';
import type { EvaluacionDetalle } from '../api/types';
import { Button, ErrorState, LoadingScreen } from '../components/ui';
import { useToast } from '../context/ToastContext';
import {
  ETIQUETA_CLASIFICACION,
  ETIQUETA_ESPECIE,
  ETIQUETA_METODO,
  ETIQUETA_SISTEMA,
  estiloClasificacion,
  formatFecha,
  formatFechaHora,
  porcentajePeso,
} from '../lib/format';

function criterioDelPuntaje(item: EvaluacionDetalle['items'][number]): string | null {
  switch (item.puntaje) {
    case 100:
      return item.criterio_100;
    case 55:
      return item.criterio_55;
    case 20:
      return item.criterio_20;
    case 0:
      return item.criterio_0;
    default:
      return null;
  }
}

export function ReportePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<EvaluacionDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [descargando, setDescargando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setData(await api.get<EvaluacionDetalle>(`/evaluaciones/${id}`));
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const descargar = async () => {
    setDescargando(true);
    try {
      await descargarPdf(`/evaluaciones/${id}/reporte.pdf`, `reporte-eba-${id}.pdf`);
      toast('Reporte descargado correctamente.');
    } catch (err) {
      toast(mensajeDeError(err), 'error');
    } finally {
      setDescargando(false);
    }
  };

  if (cargando) return <LoadingScreen label="Preparando el reporte..." />;
  if (error || !data) return <ErrorState message={error ?? 'Evaluación no encontrada.'} onRetry={cargar} />;

  if (data.estado !== 'CERRADA') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream p-6">
        <div className="card-base max-w-lg p-8 text-center">
          <h1 className="font-display text-2xl font-semibold text-ink">Reporte no disponible</h1>
          <p className="mt-2 text-sm leading-relaxed text-brand-900/55">
            El reporte solo se genera para evaluaciones cerradas. Complete y cierre la evaluación
            para descargarlo.
          </p>
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
            <Link to={`/evaluaciones/${data.id}`}>
              <Button variant="outline" icon={ArrowLeft}>
                Volver a la evaluación
              </Button>
            </Link>
            <Link to="/evaluaciones">
              <Button>Ir a evaluaciones</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const resumen = data.resumen;
  const estilo = estiloClasificacion(data.clasificacion);
  const puntaje = data.puntaje_total ?? resumen.puntaje_total ?? 0;
  const fechaGeneracion = new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

  return (
    <div className="min-h-screen bg-cream py-6 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-4 flex max-w-[860px] flex-wrap items-center justify-between gap-2 px-4">
        <Button variant="outline" icon={ArrowLeft} onClick={() => navigate(-1)}>
          Volver
        </Button>
        <div className="flex flex-wrap gap-2">
          <Link to={`/evaluaciones/${data.id}/resultados`}>
            <Button variant="outline">Ver resultados</Button>
          </Link>
          <Button variant="outline" icon={Printer} onClick={() => window.print()}>
            Imprimir
          </Button>
          <Button icon={Download} loading={descargando} onClick={() => void descargar()}>
            Descargar PDF
          </Button>
        </div>
      </div>

      <article className="print-page mx-auto max-w-[860px] bg-white p-8 shadow-soft sm:p-10 print:max-w-none print:p-0 print:shadow-none">
        <header className="flex items-start justify-between gap-6 border-b-2 border-brand-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-800 text-white print:rounded-none">
              <Leaf className="h-7 w-7" />
            </div>
            <div>
              <p className="font-display text-xl font-semibold leading-tight text-ink">
                Evaluación de Bienestar Animal
              </p>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-600">
                Metodología ICA · Ovinos y caprinos
              </p>
            </div>
          </div>
          <div className="text-right text-[11px] text-brand-900/55">
            <p className="font-bold text-ink">Reporte EBA</p>
            <p>Evaluación #{data.id}</p>
            <p>{fechaGeneracion}</p>
          </div>
        </header>

        <section className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-900/40">
              Predio evaluado
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-ink">{data.predio.nombre}</h1>
            <p className="mt-1 text-xs text-brand-900/55">
              {data.predio.municipio}
              {data.predio.direccion ? ` · ${data.predio.direccion}` : ''}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
              <div>
                <span className="text-brand-900/45">Especie: </span>
                <span className="font-bold text-ink">{ETIQUETA_ESPECIE[data.predio.especie]}</span>
              </div>
              <div>
                <span className="text-brand-900/45">Sistema: </span>
                <span className="font-bold text-ink">
                  {ETIQUETA_SISTEMA[data.predio.sistema_productivo]}
                </span>
              </div>
              <div>
                <span className="text-brand-900/45">Animales: </span>
                <span className="font-bold text-ink">{data.predio.numero_animales}</span>
              </div>
              <div>
                <span className="text-brand-900/45">Lana: </span>
                <span className="font-bold text-ink">
                  {data.predio.especie === 'OVINO'
                    ? data.predio.es_ovino_de_lana
                      ? 'Sí'
                      : 'No'
                    : 'No aplica'}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-brand-900/45">Responsable: </span>
                <span className="font-bold text-ink">
                  {data.predio.responsable_nombre ?? 'Sin asignar'}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-brand-900/10 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-900/40">
                  Resultado final
                </p>
                <p className="mt-1 font-display text-4xl font-semibold tabular-nums text-ink">
                  {puntaje.toFixed(2)}
                  <span className="ml-1 text-sm font-medium text-brand-900/40">/ 100</span>
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] ${estilo.badge}`}
              >
                {data.clasificacion ? ETIQUETA_CLASIFICACION[data.clasificacion] : 'Sin clasificación'}
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-900/10">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.max(0, Math.min(100, puntaje))}%`, backgroundColor: estilo.hex }}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-brand-900/55">
              <p>
                <span className="block font-bold uppercase tracking-[0.08em] text-brand-900/35">
                  Fecha de evaluación
                </span>
                {formatFecha(data.fecha)}
              </p>
              <p>
                <span className="block font-bold uppercase tracking-[0.08em] text-brand-900/35">
                  Cierre
                </span>
                {formatFechaHora(data.cerrada_en)}
              </p>
              <p>
                <span className="block font-bold uppercase tracking-[0.08em] text-brand-900/35">
                  Evaluador
                </span>
                {data.evaluador.nombre}
              </p>
              <p>
                <span className="block font-bold uppercase tracking-[0.08em] text-brand-900/35">
                  Indicadores
                </span>
                {resumen.calificados} de {resumen.total}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="border-b border-brand-900/15 pb-1 font-display text-base font-semibold text-ink">
            Resultado por libertad
          </h2>
          <table className="mt-2 w-full border-collapse text-left text-[11px]">
            <thead>
              <tr className="bg-brand-50 text-[9px] font-bold uppercase tracking-[0.1em] text-brand-800/70">
                <th className="px-2 py-2">Libertad</th>
                <th className="px-2 py-2 text-center">Peso</th>
                <th className="px-2 py-2 text-center">Indicadores</th>
                <th className="px-2 py-2 text-center">Puntaje</th>
                <th className="px-2 py-2 text-center">Aporte</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-900/10">
              {resumen.libertades.map((libertad, indice) => (
                <tr key={libertad.libertad_id}>
                  <td className="px-2 py-2 font-semibold text-ink">
                    L{indice + 1} · {libertad.libertad_nombre}
                  </td>
                  <td className="px-2 py-2 text-center tabular-nums">
                    {porcentajePeso(libertad.peso)}
                  </td>
                  <td className="px-2 py-2 text-center tabular-nums">
                    {libertad.calificados}/{libertad.total}
                  </td>
                  <td className="px-2 py-2 text-center font-bold tabular-nums">
                    {libertad.puntaje === null ? '—' : libertad.puntaje.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 text-center tabular-nums">
                    {((libertad.puntaje ?? 0) * libertad.peso).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-brand-900/20 font-bold text-ink">
                <td className="px-2 py-2" colSpan={4}>
                  Puntaje total ponderado
                </td>
                <td className="px-2 py-2 text-center tabular-nums">{puntaje.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </section>

        <section className="mt-6">
          <h2 className="border-b border-brand-900/15 pb-1 font-display text-base font-semibold text-ink">
            Detalle de indicadores
          </h2>
          <table className="mt-2 w-full border-collapse text-left text-[10px]">
            <thead>
              <tr className="bg-brand-50 text-[8px] font-bold uppercase tracking-[0.1em] text-brand-800/70">
                <th className="px-1.5 py-1.5">#</th>
                <th className="px-1.5 py-1.5">Indicador</th>
                <th className="px-1.5 py-1.5">Libertad</th>
                <th className="px-1.5 py-1.5">Método</th>
                <th className="px-1.5 py-1.5 text-center">Puntaje</th>
                <th className="px-1.5 py-1.5">Observación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-900/10">
              {data.items.map((item) => (
                <tr key={item.indicador_id} className="break-inside-avoid align-top">
                  <td className="px-1.5 py-1.5 font-bold tabular-nums text-brand-900/45">
                    {item.numero}
                  </td>
                  <td className="px-1.5 py-1.5 font-semibold text-ink">
                    {item.nombre}
                    {item.puntaje !== null && (
                      <p className="mt-0.5 text-[8px] font-normal leading-relaxed text-brand-900/45">
                        Criterio aplicado: {criterioDelPuntaje(item) || 'No especificado en la norma.'}
                        {item.seccion ? ` (Norma EBA, sección ${item.seccion})` : ''}
                      </p>
                    )}
                  </td>
                  <td className="px-1.5 py-1.5 text-brand-900/60">{item.libertad_nombre}</td>
                  <td className="px-1.5 py-1.5 text-brand-900/60">
                    {ETIQUETA_METODO[item.metodo_evaluacion]}
                  </td>
                  <td className="px-1.5 py-1.5 text-center font-bold tabular-nums">
                    {item.puntaje ?? '—'}
                  </td>
                  <td className="max-w-[190px] px-1.5 py-1.5 text-brand-900/60">
                    {item.observacion || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-6">
          <h2 className="border-b border-brand-900/15 pb-1 font-display text-base font-semibold text-ink">
            Plan de mejora
          </h2>
          {data.plan_mejora.length === 0 ? (
            <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-[11px] leading-relaxed text-emerald-900">
              ¡Excelente! No hay indicadores con 55 puntos o menos. Mantenga las prácticas actuales.
            </p>
          ) : (
            <div className="mt-2 space-y-2">
              {data.plan_mejora.map((item) => (
                <div
                  key={item.indicador_id}
                  className="break-inside-avoid rounded-xl border border-brand-900/10 p-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold text-ink">
                        #{item.numero} · {item.nombre}
                      </p>
                      <p className="text-[8px] text-brand-900/50">
                        {item.libertad_nombre} · Puntaje {item.puntaje}
                        {item.seccion ? ` · Norma EBA, sección ${item.seccion}` : ''}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[8px] font-extrabold text-amber-800">
                      {item.puntaje} pts
                    </span>
                  </div>
                  <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-lg bg-amber-50/70 p-2">
                      <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-amber-800/70">
                        Por qué quedó así
                      </p>
                      <p className="mt-0.5 text-[9px] leading-relaxed text-brand-900/65">
                        {item.criterio_actual || 'No especificado en la norma para este nivel.'}
                      </p>
                      {item.observacion && (
                        <p className="mt-1 text-[9px] leading-relaxed text-brand-900/65">
                          <span className="font-bold">Observación:</span> {item.observacion}
                        </p>
                      )}
                    </div>
                    <div className="rounded-lg bg-emerald-50/70 p-2">
                      <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-emerald-800/70">
                        Cómo llegar a 100
                      </p>
                      <p className="mt-0.5 text-[9px] leading-relaxed text-brand-900/65">
                        {item.criterio_100 || 'No especificado en la norma para este indicador.'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {data.observaciones && (
          <section className="mt-6 break-inside-avoid">
            <h2 className="border-b border-brand-900/15 pb-1 font-display text-base font-semibold text-ink">
              Observaciones generales
            </h2>
            <p className="mt-2 whitespace-pre-line text-[11px] leading-relaxed text-brand-900/65">
              {data.observaciones}
            </p>
          </section>
        )}

        <section className="mt-8 grid grid-cols-2 gap-10 break-inside-avoid text-[10px] text-brand-900/50">
          <div>
            <div className="h-10 border-b border-brand-900/30" />
            <p className="mt-1 font-bold text-ink">Firma del evaluador</p>
            <p>{data.evaluador.nombre}</p>
          </div>
          <div>
            <div className="h-10 border-b border-brand-900/30" />
            <p className="mt-1 font-bold text-ink">Firma del responsable del predio</p>
            <p>{data.predio.responsable_nombre ?? 'Nombre y documento'}</p>
          </div>
        </section>

        <footer className="mt-6 border-t border-brand-900/15 pt-3 text-[9px] leading-relaxed text-brand-900/40">
          <p>
            Escala de clasificación: Excelente bienestar ≥ 90; Alto ≥ 75 y &lt; 90; Medio ≥ 50 y &lt; 75;
            Bajo &lt; 50. El puntaje total se obtiene de la suma del puntaje de cada libertad por su
            peso oficial.
          </p>
          <p className="mt-1">
            Documento generado por el sistema EBA · Instituto Colombiano Agropecuario · Evaluación #{data.id}.
          </p>
        </footer>
      </article>
    </div>
  );
}
