import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clipboard,
  Download,
  FileText,
  Leaf,
  Loader2,
  MapPin,
  Printer,
  Sparkles,
  TrendingUp,
  TriangleAlert,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { api, descargarPdf, mensajeDeError } from '../api/client';
import type { EvaluacionDetalle, ItemEvaluacion, RecomendacionIA } from '../api/types';
import {
  Badge,
  Button,
  Card,
  ClasificacionBadge,
  ErrorState,
  LoadingBlock,
  MetodoBadge,
  Modal,
  PageHeader,
  ProgressBar,
  ScorePill,
  SectionTitle,
} from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  ETIQUETA_CLASIFICACION,
  ETIQUETA_ESPECIE,
  ETIQUETA_SISTEMA,
  estiloClasificacion,
  formatFecha,
  formatFechaHora,
  porcentajePeso,
} from '../lib/format';

function PuntajeCircular({ puntaje, color }: { puntaje: number; color: string }) {
  const radio = 56;
  const circunferencia = 2 * Math.PI * radio;
  const avance = Math.max(0, Math.min(100, puntaje));

  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg viewBox="0 0 144 144" className="h-full w-full">
        <circle cx="72" cy="72" r={radio} fill="none" stroke="#e6ede8" strokeWidth="10" />
        <circle
          cx="72"
          cy="72"
          r={radio}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={circunferencia * (1 - avance / 100)}
          transform="rotate(-90 72 72)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-semibold tabular-nums text-ink">
          {puntaje.toFixed(1)}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-900/40">
          de 100
        </span>
      </div>
    </div>
  );
}

function IndicadorResultado({ item }: { item: ItemEvaluacion }) {
  return (
    <div className="rounded-2xl border border-brand-900/[0.08] bg-white p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-ink">
            <span className="mr-1.5 text-brand-900/35">#{item.numero}</span>
            {item.nombre}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-brand-900/45">{item.libertad_nombre}</p>
        </div>
        <ScorePill puntaje={item.puntaje} />
      </div>
      {item.observacion && (
        <p className="mt-2 rounded-xl bg-brand-50/70 px-2.5 py-2 text-[11px] leading-relaxed text-brand-900/55">
          {item.observacion}
        </p>
      )}
    </div>
  );
}

function criterioDelPuntaje(item: ItemEvaluacion): string | null {
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

export function ResultadosPage() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<EvaluacionDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [descargando, setDescargando] = useState(false);
  const [recomendacionIA, setRecomendacionIA] = useState<RecomendacionIA | null>(null);
  const [cargandoIA, setCargandoIA] = useState(false);
  const [abiertoIA, setAbiertoIA] = useState(false);
  const [errorIA, setErrorIA] = useState<string | null>(null);

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
    if (data?.estado === 'CERRADA') {
      void cargarRecomendacionIA();
    }
  }, [data]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const datosRadar = useMemo(
    () =>
      data?.resumen.libertades.map((libertad, indice) => ({
        libertad: `L${indice + 1}`,
        nombre: libertad.libertad_nombre,
        puntaje: libertad.puntaje ?? 0,
        peso: libertad.peso,
      })) ?? [],
    [data],
  );

  const mejoresIndicadores = useMemo(() => {
    if (!data) return [];
    return data.items
      .filter((item) => item.puntaje !== null)
      .sort((a, b) => (b.puntaje ?? 0) - (a.puntaje ?? 0) || a.numero - b.numero)
      .slice(0, 6);
  }, [data]);

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

  const cargarRecomendacionIA = async () => {
    setErrorIA(null);
    setCargandoIA(true);
    try {
      const respuesta = await api.get<{ recomendacion: RecomendacionIA | null; modelo: string }>(
        `/evaluaciones/${id}/recomendaciones-ia`,
      );
      setRecomendacionIA(respuesta.recomendacion ?? null);
      setAbiertoIA(Boolean(respuesta.recomendacion));
    } catch (err) {
      setErrorIA(mensajeDeError(err));
    } finally {
      setCargandoIA(false);
    }
  };

  const generarRecomendacionIA = async () => {
    setErrorIA(null);
    setCargandoIA(true);
    try {
      const respuesta = await api.post<{ recomendacion: RecomendacionIA; modelo: string; regenerado: boolean }>(
        `/evaluaciones/${id}/recomendaciones-ia?regenerar=true`,
      );
      setRecomendacionIA(respuesta.recomendacion);
      setAbiertoIA(true);
      toast('Recomendaciones generadas con IA.');
    } catch (err) {
      setErrorIA(mensajeDeError(err));
    } finally {
      setCargandoIA(false);
    }
  };

  const copiarRecomendacion = () => {
    if (!recomendacionIA?.contenido) return;
    navigator.clipboard.writeText(recomendacionIA.contenido).then(() => {
      toast('Recomendación copiada al portapapeles.');
    });
  };

  if (cargando) return <LoadingBlock label="Cargando resultados..." />;
  if (error || !data) return <ErrorState message={error ?? 'Evaluación no encontrada.'} onRetry={cargar} />;

  if (data.estado !== 'CERRADA') {
    return (
      <div className="animate-fade-in">
        <PageHeader
          eyebrow="Resultados"
          title={data.predio.nombre}
          subtitle="La evaluación aún no ha sido cerrada."
          actions={
            <Link to="/evaluaciones">
              <Button variant="outline" icon={ArrowLeft}>
                Volver
              </Button>
            </Link>
          }
        />
        <Card className="p-6">
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <TriangleAlert className="h-7 w-7" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">
                La evaluación está en borrador
              </h2>
              <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-brand-900/55">
                Los resultados definitivos y el reporte están disponibles cuando la evaluación se
                cierra. Complete los indicadores pendientes para finalizarla.
              </p>
            </div>
            {usuario?.rol !== 'RESPONSABLE' ? (
              <Link to={`/evaluaciones/${data.id}`}>
                <Button icon={ArrowRight}>Continuar evaluación</Button>
              </Link>
            ) : null}
          </div>
        </Card>
      </div>
    );
  }

  const resumen = data.resumen;
  const estilo = estiloClasificacion(data.clasificacion);
  const puntaje = data.puntaje_total ?? resumen.puntaje_total ?? 0;
  const grupos = resumen.libertades.map((libertad) => ({
    libertad,
    items: data.items.filter((item) => item.libertad_id === libertad.libertad_id),
  }));

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Resultados de bienestar"
        title={data.predio.nombre}
        subtitle={`${ETIQUETA_ESPECIE[data.predio.especie]} · ${ETIQUETA_SISTEMA[data.predio.sistema_productivo]} · ${formatFecha(data.fecha)} · Evaluador: ${data.evaluador.nombre}`}
        actions={
          <>
            <Link to="/evaluaciones">
              <Button variant="outline" icon={ArrowLeft}>
                Evaluaciones
              </Button>
            </Link>
            <Link to={`/evaluaciones/${data.id}/reporte`}>
              <Button variant="outline" icon={Printer}>
                Ver reporte
              </Button>
            </Link>
            <Button icon={Download} loading={descargando} onClick={() => void descargar()}>
              Descargar PDF
            </Button>
            <Button
              variant="outline"
              icon={Sparkles}
              loading={cargandoIA}
              disabled={cargandoIA}
              onClick={() => void generarRecomendacionIA()}
            >
              Recomendaciones IA
            </Button>
          </>
        }
      />

      <Card className={`overflow-hidden border ${estilo.border}`}>
        <div className={`grid gap-6 p-6 lg:grid-cols-[auto_1fr] ${estilo.bg}`}>
          <div className="flex items-center gap-5">
            <PuntajeCircular puntaje={puntaje} color={estilo.hex} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-900/45">
                Clasificación final
              </p>
              <p className={`mt-1 font-display text-3xl font-semibold leading-tight ${estilo.text}`}>
                {data.clasificacion ? ETIQUETA_CLASIFICACION[data.clasificacion] : 'Sin clasificación'}
              </p>
              <div className="mt-2">
                <ClasificacionBadge clasificacion={data.clasificacion} />
              </div>
              <p className="mt-2 max-w-sm text-xs leading-relaxed text-brand-900/55">
                Puntaje total calculado con el promedio de cada libertad ponderado por su peso
                oficial.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:border-l lg:border-brand-900/[0.08] lg:pl-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-900/40">
                Indicadores
              </p>
              <p className="mt-1 font-display text-xl font-semibold tabular-nums text-ink">
                {resumen.calificados}/{resumen.total}
              </p>
              <p className="text-[10px] text-brand-900/40">calificados</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-900/40">
                Cerrada el
              </p>
              <p className="mt-1 text-sm font-bold text-ink">{formatFecha(data.cerrada_en)}</p>
              <p className="text-[10px] text-brand-900/40">{formatFechaHora(data.cerrada_en)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-900/40">
                Predio
              </p>
              <p className="mt-1 text-sm font-bold text-ink">{data.predio.municipio}</p>
              <p className="text-[10px] text-brand-900/40">{data.predio.numero_animales} animales</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-900/40">
                Responsable
              </p>
              <p className="mt-1 truncate text-sm font-bold text-ink">
                {data.predio.responsable_nombre ?? 'Sin asignar'}
              </p>
              <p className="text-[10px] text-brand-900/40">del predio</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <SectionTitle
            title="Perfil por libertad"
            description="Puntaje obtenido en cada una de las cinco libertades."
          />
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={datosRadar} outerRadius="72%">
                <PolarGrid stroke="#163c2926" />
                <PolarAngleAxis dataKey="libertad" tick={{ fontSize: 12, fill: '#66756b', fontWeight: 700 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#9aa8a0' }} axisLine={false} />
                <Radar
                  name="Puntaje"
                  dataKey="puntaje"
                  stroke={estilo.hex}
                  fill={estilo.hex}
                  fillOpacity={0.18}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: estilo.hex }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 14,
                    border: '1px solid #163c291f',
                    fontSize: 12,
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid gap-1.5">
            {resumen.libertades.map((libertad, indice) => (
              <div key={libertad.libertad_id} className="flex items-center justify-between gap-2 text-[11px]">
                <span className="truncate text-brand-900/55">
                  L{indice + 1} · {libertad.libertad_nombre}
                </span>
                <span className="font-bold tabular-nums text-ink">
                  {libertad.puntaje === null ? '—' : libertad.puntaje.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle
            title="Detalle por libertad"
            description="Peso oficial y aporte de cada libertad al puntaje total."
          />
          <div className="space-y-4">
            {resumen.libertades.map((libertad, indice) => (
              <div key={libertad.libertad_id}>
                <div className="mb-1.5 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-ink">
                      L{indice + 1} · {libertad.libertad_nombre}
                    </p>
                    <p className="text-[10px] text-brand-900/40">
                      Peso {porcentajePeso(libertad.peso)} · {libertad.calificados}/{libertad.total}{' '}
                      indicadores
                    </p>
                  </div>
                  <span className="font-display text-lg font-semibold tabular-nums text-ink">
                    {libertad.puntaje === null ? '—' : libertad.puntaje.toFixed(2)}
                  </span>
                </div>
                <ProgressBar value={libertad.puntaje ?? 0} color={estilo.hex} />
                <p className="mt-1 text-right text-[10px] text-brand-900/35">
                  Aporte: {((libertad.puntaje ?? 0) * libertad.peso).toFixed(2)} pts
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl bg-brand-50/70 p-3 text-[11px] leading-relaxed text-brand-900/55">
            <span className="font-bold text-brand-800">Fórmula:</span> suma de (puntaje de la libertad
            × peso). Los pesos son L1 {porcentajePeso(0.2)}, L2 {porcentajePeso(0.2)}, L3{' '}
            {porcentajePeso(0.35)}, L4 {porcentajePeso(0.1)} y L5 {porcentajePeso(0.15)}.
          </div>
        </Card>
      </div>

      <Card className="mt-5 p-5">
        <SectionTitle
          title="Mejores indicadores"
          description="Indicadores con mayor puntaje en esta evaluación."
        />
        {mejoresIndicadores.length === 0 ? (
          <div className="flex items-start gap-3 rounded-2xl bg-brand-50 p-4 text-sm text-brand-900/60">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
            <p className="font-semibold">No hay indicadores calificados en esta evaluación.</p>
          </div>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {mejoresIndicadores.map((item) => (
              <IndicadorResultado key={item.indicador_id} item={item} />
            ))}
          </div>
        )}
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-emerald-50 p-3 text-[11px] leading-relaxed text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          Fortalezas identificadas. Mantenga las prácticas asociadas a estos indicadores para
          conservar el nivel de bienestar alcanzado.
        </div>
      </Card>

      <Card className="mt-5 p-5">
        <SectionTitle
          title="Plan de mejora"
          description="Indicadores con 55 puntos o menos, ordenados de menor a mayor puntaje. A igual puntaje se prioriza la libertad con mayor peso."
        />
        {data.plan_mejora.length === 0 ? (
          <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="font-bold">¡Excelente! No hay indicadores en 55 puntos o menos.</p>
              <p className="mt-0.5 text-xs leading-relaxed text-emerald-800/75">
                Mantenga las prácticas actuales y siga registrando la evaluación periódicamente.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {data.plan_mejora.map((item) => (
              <div
                key={item.indicador_id}
                className="rounded-2xl border border-brand-900/[0.08] bg-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-ink">
                      <span className="mr-1.5 text-brand-900/35">#{item.numero}</span>
                      {item.nombre}
                    </p>
                    <p className="mt-0.5 text-[11px] text-brand-900/45">
                      {item.libertad_nombre} · Peso {porcentajePeso(item.libertad_peso)}
                      {item.seccion ? ` · Norma EBA, sección ${item.seccion}` : ''}
                    </p>
                  </div>
                  <ScorePill puntaje={item.puntaje} />
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-amber-200/70 bg-amber-50/60 p-3">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-amber-800/70">
                      Por qué quedó así
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-brand-900/65">
                      {item.criterio_actual || 'No especificado en la norma para este nivel.'}
                    </p>
                    {item.observacion && (
                      <p className="mt-2 border-t border-amber-200/70 pt-2 text-[11px] leading-relaxed text-brand-900/65">
                        <span className="font-bold">Observación del evaluador:</span>{' '}
                        {item.observacion}
                      </p>
                    )}
                  </div>
                  <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/60 p-3">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-emerald-800/70">
                      Cómo llegar a 100
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-brand-900/65">
                      {item.criterio_100 || 'No especificado en la norma para este indicador.'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-earth-50 p-3 text-[11px] leading-relaxed text-earth-800">
          <TrendingUp className="mt-0.5 h-4 w-4 shrink-0" />
          Empiece por los puntajes 0 y 20: son los de mayor impacto en el bienestar y en la
          clasificación final.
        </div>
      </Card>

      <Card className="mt-5 p-5">
        <SectionTitle title="Resumen del predio" description="Datos de la evaluación cerrada." />
        <div className="grid gap-x-8 gap-y-2.5 text-xs sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-brand-900/45">Predio</span>
            <Link
              to={`/predios/${data.predio.id}`}
              className="inline-flex items-center gap-1 font-bold text-brand-700 hover:text-brand-900"
            >
              <MapPin className="h-3.5 w-3.5" />
              {data.predio.nombre}
            </Link>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-brand-900/45">Municipio</span>
            <span className="font-bold text-ink">{data.predio.municipio}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-brand-900/45">Especie</span>
            <Badge variant={data.predio.especie === 'OVINO' ? 'green' : 'earth'}>
              {ETIQUETA_ESPECIE[data.predio.especie]}
              {data.predio.especie === 'OVINO' && data.predio.es_ovino_de_lana ? ' · lana' : ''}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-brand-900/45">Sistema</span>
            <span className="font-bold text-ink">
              {ETIQUETA_SISTEMA[data.predio.sistema_productivo]}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-brand-900/45">Animales</span>
            <span className="font-bold text-ink">{data.predio.numero_animales}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-brand-900/45">Evaluador</span>
            <span className="font-bold text-ink">{data.evaluador.nombre}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-brand-900/45">Fecha de evaluación</span>
            <span className="font-bold text-ink">{formatFecha(data.fecha)}</span>
          </div>
        </div>

        {data.observaciones && (
          <div className="mt-4 rounded-2xl bg-brand-50/70 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-900/45">
              Observaciones generales
            </p>
            <p className="mt-1 whitespace-pre-line text-[11px] leading-relaxed text-brand-900/60">
              {data.observaciones}
            </p>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Link to={`/evaluaciones/${data.id}/reporte`}>
            <Button variant="outline" className="w-full" icon={FileText}>
              Abrir reporte imprimible
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full"
            icon={Download}
            loading={descargando}
            onClick={() => void descargar()}
          >
            Descargar PDF
          </Button>
        </div>
      </Card>

      <Card className="mt-5 p-5">
        <SectionTitle
          title="Detalle de indicadores"
          description="Puntaje y observación registrados para cada indicador aplicable."
        />
        <div className="space-y-5">
          {grupos.map(({ libertad, items }, indice) => (
            <div key={libertad.libertad_id}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-ink">
                  L{indice + 1} · {libertad.libertad_nombre}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Peso {porcentajePeso(libertad.peso)}</Badge>
                  <Badge variant="neutral">
                    {libertad.puntaje === null ? 'Sin puntaje' : `${libertad.puntaje.toFixed(2)} pts`}
                  </Badge>
                </div>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-brand-900/[0.07]">
                <table className="w-full min-w-[640px] border-collapse text-left">
                  <thead className="table-head">
                    <tr>
                      <th className="px-3 py-2.5">#</th>
                      <th className="px-3 py-2.5">Indicador</th>
                      <th className="px-3 py-2.5">Método</th>
                      <th className="px-3 py-2.5 text-center">Puntaje</th>
                      <th className="px-3 py-2.5">Observación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-900/[0.06] bg-white">
                    {items.map((item) => (
                      <tr key={item.indicador_id} className="align-top">
                        <td className="px-3 py-2.5 text-xs font-bold tabular-nums text-brand-900/40">
                          {item.numero}
                        </td>
                        <td className="px-3 py-2.5 text-xs font-semibold text-ink">
                          {item.nombre}
                          {item.puntaje !== null && (
                            <p className="mt-1 max-w-[360px] text-[10px] font-normal leading-relaxed text-brand-900/45">
                              <span className="font-bold text-brand-900/60">Criterio aplicado:</span>{' '}
                              {criterioDelPuntaje(item) || 'No especificado en la norma para este nivel.'}
                              {item.seccion ? ` (Norma EBA, sección ${item.seccion})` : ''}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <MetodoBadge metodo={item.metodo_evaluacion} />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <ScorePill puntaje={item.puntaje} />
                        </td>
                        <td className="max-w-[280px] px-3 py-2.5 text-[11px] leading-relaxed text-brand-900/55">
                          {item.observacion || <span className="text-brand-900/25">Sin observación</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-900/[0.07] bg-white px-4 py-3 text-[11px] text-brand-900/45">
        <span className="inline-flex items-center gap-1.5">
          <Leaf className="h-3.5 w-3.5 text-brand-500" />
          Metodología ICA · Evaluación de Bienestar Animal en ovinos y caprinos
        </span>
        <span>Evaluación #{data.id} · {formatFechaHora(data.cerrada_en)}</span>
      </div>

      <Modal
        open={abiertoIA}
        onClose={() => setAbiertoIA(false)}
        title={recomendacionIA ? 'Recomendaciones con IA' : 'Recomendaciones IA'}
        description={
          errorIA
            ? errorIA
            : 'Orientación generada con IA a partir de la evaluación. No reemplaza el concepto del ICA ni de un veterinario.'
        }
        size="lg"
      >
        {cargandoIA ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
            <p className="text-sm text-brand-900/55">Generando recomendaciones...</p>
          </div>
        ) : errorIA ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-red-800">
            <p>{errorIA}</p>
          </div>
        ) : recomendacionIA ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-brand-900/[0.07] bg-brand-50 p-4 text-[11px] leading-relaxed text-brand-900/60 whitespace-pre-wrap">
              {recomendacionIA.contenido}
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-brand-900/[0.07] pt-3">
              <span className="text-[10px] font-bold text-brand-900/45">
                Modelo: {recomendacionIA.modelo}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" icon={Clipboard} size="sm" onClick={copiarRecomendacion}>
                  Copiar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void generarRecomendacionIA()}
                >
                  Regenerar
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
