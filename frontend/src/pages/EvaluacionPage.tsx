import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Info,
  Lock,
  MapPin,
  Save,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, mensajeDeError } from '../api/client';
import type {
  EvaluacionDetalle,
  ItemEvaluacion,
  Puntaje,
  ResumenEvaluacion,
} from '../api/types';
import {
  Badge,
  Button,
  Card,
  ClasificacionBadge,
  ConfirmDialog,
  ErrorState,
  LoadingBlock,
  MetodoBadge,
  PageHeader,
  ProgressBar,
  ScorePill,
  ScoreSelector,
  SectionTitle,
  Textarea,
} from '../components/ui';
import { useToast } from '../context/ToastContext';
import {
  cn,
  ETIQUETA_ESPECIE,
  ETIQUETA_SISTEMA,
  estiloClasificacion,
  formatFecha,
  porcentajePeso,
} from '../lib/format';

interface RespuestaCalificacion {
  item: ItemEvaluacion;
  resumen: ResumenEvaluacion;
}

const CRITERIOS: Array<{
  campo: 'criterio_100' | 'criterio_55' | 'criterio_20' | 'criterio_0';
  puntaje: Puntaje;
  etiqueta: string;
  caja: string;
  punto: string;
}> = [
  {
    campo: 'criterio_100',
    puntaje: 100,
    etiqueta: '100 · Óptimo',
    caja: 'border-emerald-200/70 bg-emerald-50/60',
    punto: 'bg-emerald-500',
  },
  {
    campo: 'criterio_55',
    puntaje: 55,
    etiqueta: '55 · Aceptable',
    caja: 'border-amber-200/70 bg-amber-50/60',
    punto: 'bg-amber-500',
  },
  {
    campo: 'criterio_20',
    puntaje: 20,
    etiqueta: '20 · Bajo',
    caja: 'border-orange-200/70 bg-orange-50/60',
    punto: 'bg-orange-500',
  },
  {
    campo: 'criterio_0',
    puntaje: 0,
    etiqueta: '0 · Crítico',
    caja: 'border-red-200/70 bg-red-50/60',
    punto: 'bg-red-500',
  },
];

export function EvaluacionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [data, setData] = useState<EvaluacionDetalle | null>(null);
  const [items, setItems] = useState<ItemEvaluacion[]>([]);
  const [resumen, setResumen] = useState<ResumenEvaluacion | null>(null);
  const [observaciones, setObservaciones] = useState<Record<number, string>>({});
  const [obsGenerales, setObsGenerales] = useState('');
  const [libertadActiva, setLibertadActiva] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [guardando, setGuardando] = useState<Record<number, boolean>>({});
  const [guardandoObs, setGuardandoObs] = useState<Record<number, boolean>>({});
  const [guardandoCabecera, setGuardandoCabecera] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [confirmarCierre, setConfirmarCierre] = useState(false);

  const itemsRef = useRef<ItemEvaluacion[]>([]);
  const observacionesRef = useRef<Record<number, string>>({});
  const timersObservacion = useRef<Record<number, number>>({});
  const timerCabecera = useRef<number | null>(null);
  const seccionRef = useRef<HTMLDivElement>(null);
  const resumenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    observacionesRef.current = observaciones;
  }, [observaciones]);

  useEffect(
    () => () => {
      Object.values(timersObservacion.current).forEach((timer) => window.clearTimeout(timer));
      if (timerCabecera.current) window.clearTimeout(timerCabecera.current);
    },
    [],
  );

  const cargar = useCallback(async () => {
    setCargando(true);
    setErrorCarga(null);
    try {
      const detalle = await api.get<EvaluacionDetalle>(`/evaluaciones/${id}`);
      setData(detalle);
      setItems(detalle.items);
      setResumen(detalle.resumen);
      setObservaciones(
        Object.fromEntries(
          detalle.items.map((item) => [item.indicador_id, item.observacion ?? '']),
        ),
      );
      setObsGenerales(detalle.observaciones ?? '');
      setLibertadActiva((actual) => actual ?? detalle.resumen.libertades[0]?.libertad_id ?? null);
    } catch (err) {
      setErrorCarga(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  useEffect(() => {
    if (libertadActiva === null && resumen?.libertades[0]) {
      setLibertadActiva(resumen.libertades[0].libertad_id);
    }
  }, [libertadActiva, resumen]);

  const cerrada = data?.estado === 'CERRADA';

  const itemsVisibles = useMemo(
    () => items.filter((item) => item.libertad_id === libertadActiva),
    [items, libertadActiva],
  );

  const libertadSeleccionada = useMemo(
    () => resumen?.libertades.find((libertad) => libertad.libertad_id === libertadActiva) ?? null,
    [resumen, libertadActiva],
  );

  const indiceLibertad = resumen?.libertades.findIndex(
    (libertad) => libertad.libertad_id === libertadActiva,
  ) ?? -1;

  const irALibertad = (indice: number) => {
    const libertad = resumen?.libertades[indice];
    if (!libertad) return;
    setLibertadActiva(libertad.libertad_id);
    window.setTimeout(() => {
      seccionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const irAResumen = () => {
    resumenRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const actualizarItem = (indicadorId: number, cambios: Partial<ItemEvaluacion>) => {
    setItems((actuales) =>
      actuales.map((item) =>
        item.indicador_id === indicadorId ? { ...item, ...cambios } : item,
      ),
    );
  };

  const calificar = async (item: ItemEvaluacion, puntaje: Puntaje) => {
    if (!data || cerrada) return;
    const anterior = item.puntaje;

    actualizarItem(item.indicador_id, { puntaje });
    setGuardando((actuales) => ({ ...actuales, [item.indicador_id]: true }));

    try {
      const respuesta = await api.patch<RespuestaCalificacion>(
        `/evaluaciones/${id}/indicadores/${item.indicador_id}`,
        {
          puntaje,
          observacion: observacionesRef.current[item.indicador_id]?.trim() || null,
        },
      );
      actualizarItem(item.indicador_id, respuesta.item);
      setResumen(respuesta.resumen);
      setObservaciones((actuales) => ({
        ...actuales,
        [item.indicador_id]: respuesta.item.observacion ?? '',
      }));
    } catch (err) {
      actualizarItem(item.indicador_id, { puntaje: anterior });
      toast(mensajeDeError(err), 'error');
    } finally {
      setGuardando((actuales) => {
        const copia = { ...actuales };
        delete copia[item.indicador_id];
        return copia;
      });
    }
  };

  const guardarObservacion = async (indicadorId: number) => {
    const item = itemsRef.current.find((actual) => actual.indicador_id === indicadorId);
    if (!item || item.puntaje === null || cerrada) return;

    const texto = (observacionesRef.current[indicadorId] ?? '').trim();
    if ((item.observacion ?? '').trim() === texto) return;

    setGuardandoObs((actuales) => ({ ...actuales, [indicadorId]: true }));
    try {
      const respuesta = await api.patch<RespuestaCalificacion>(
        `/evaluaciones/${id}/indicadores/${indicadorId}`,
        { puntaje: item.puntaje, observacion: texto || null },
      );
      actualizarItem(indicadorId, respuesta.item);
      setResumen(respuesta.resumen);
    } catch (err) {
      toast(mensajeDeError(err), 'error');
    } finally {
      setGuardandoObs((actuales) => {
        const copia = { ...actuales };
        delete copia[indicadorId];
        return copia;
      });
    }
  };

  const cambiarObservacion = (indicadorId: number, valor: string) => {
    setObservaciones((actuales) => ({ ...actuales, [indicadorId]: valor }));
    if (timersObservacion.current[indicadorId]) {
      window.clearTimeout(timersObservacion.current[indicadorId]);
    }
    timersObservacion.current[indicadorId] = window.setTimeout(() => {
      void guardarObservacion(indicadorId);
    }, 900);
  };

  const guardarCabecera = async (valor: string) => {
    if (!data || cerrada) return;
    setGuardandoCabecera(true);
    try {
      await api.patch(`/evaluaciones/${id}`, { observaciones: valor.trim() || null });
      setData((actual) => (actual ? { ...actual, observaciones: valor.trim() || null } : actual));
    } catch (err) {
      toast(mensajeDeError(err), 'error');
    } finally {
      setGuardandoCabecera(false);
    }
  };

  const cambiarObsGenerales = (valor: string) => {
    setObsGenerales(valor);
    if (timerCabecera.current) window.clearTimeout(timerCabecera.current);
    timerCabecera.current = window.setTimeout(() => {
      void guardarCabecera(valor);
    }, 900);
  };

  const cerrarEvaluacion = async () => {
    setCerrando(true);
    try {
      const detalle = await api.post<EvaluacionDetalle>(`/evaluaciones/${id}/cerrar`);
      setData(detalle);
      setItems(detalle.items);
      setResumen(detalle.resumen);
      setConfirmarCierre(false);
      toast('Evaluación cerrada. El resultado quedó registrado.');
      navigate(`/evaluaciones/${id}/resultados`);
    } catch (err) {
      toast(mensajeDeError(err), 'error');
      setConfirmarCierre(false);
    } finally {
      setCerrando(false);
    }
  };

  if (cargando) return <LoadingBlock label="Cargando evaluación..." />;
  if (errorCarga || !data || !resumen) {
    return <ErrorState message={errorCarga ?? 'Evaluación no encontrada.'} onRetry={cargar} />;
  }

  const estilo = estiloClasificacion(resumen.clasificacion);
  const progreso = resumen.total > 0 ? (resumen.calificados / resumen.total) * 100 : 0;
  const faltantes = resumen.total - resumen.calificados;
  const totalMostrado =
    resumen.puntaje_total === null ? '—' : resumen.puntaje_total.toFixed(2);

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow={cerrada ? 'Evaluación cerrada' : 'Evaluación en curso'}
        title={data.predio.nombre}
        subtitle={`${ETIQUETA_ESPECIE[data.predio.especie]} · ${ETIQUETA_SISTEMA[data.predio.sistema_productivo]} · ${formatFecha(data.fecha)} · Evaluador: ${data.evaluador.nombre}`}
        actions={
          <>
            <Link to="/evaluaciones">
              <Button variant="outline" icon={ArrowLeft}>
                Evaluaciones
              </Button>
            </Link>
            <Link to={`/predios/${data.predio.id}`}>
              <Button variant="outline" icon={MapPin}>
                Ver predio
              </Button>
            </Link>
            {cerrada && (
              <Link to={`/evaluaciones/${data.id}/resultados`}>
                <Button icon={FileText}>Ver resultados</Button>
              </Link>
            )}
          </>
        }
      />

      {cerrada && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-bold">Esta evaluación está cerrada.</p>
            <p className="mt-0.5 text-xs leading-relaxed text-emerald-800/80">
              Los puntajes y la clasificación quedaron congelados y no pueden modificarse. Puede
              consultar los resultados o descargar el reporte.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          <Card className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-900/45">
                  Progreso de la evaluación
                </p>
                <p className="mt-1 text-sm font-semibold text-ink">
                  {resumen.calificados} de {resumen.total} indicadores calificados
                </p>
              </div>
              <Badge variant={resumen.completo ? 'green' : 'amber'}>
                {resumen.completo ? 'Completa' : `${faltantes} pendiente(s)`}
              </Badge>
            </div>
            <ProgressBar
              value={progreso}
              color={resumen.completo ? '#1f7a4d' : '#b7791f'}
              showLabel
              className="mt-3"
            />
          </Card>

          <div className="mt-4 overflow-x-auto pb-1">
            <div className="flex min-w-max gap-2">
              {resumen.libertades.map((libertad, indice) => {
                const activa = libertad.libertad_id === libertadActiva;
                return (
                  <button
                    key={libertad.libertad_id}
                    type="button"
                    onClick={() => setLibertadActiva(libertad.libertad_id)}
                    className={cn(
                      'focus-ring w-[190px] rounded-2xl border p-3 text-left transition',
                      activa
                        ? 'border-brand-500 bg-brand-50 ring-4 ring-brand-500/10'
                        : 'border-brand-900/10 bg-white hover:border-brand-500/30',
                    )}
                    aria-pressed={activa}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-900/40">
                        L{indice + 1} · {porcentajePeso(libertad.peso)}
                      </span>
                      {libertad.puntaje !== null && (
                        <span className="text-xs font-extrabold tabular-nums text-ink">
                          {libertad.puntaje.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs font-bold leading-snug text-brand-900/80">
                      {libertad.libertad_nombre}
                    </p>
                    <div className="mt-2">
                      <ProgressBar
                        value={libertad.total > 0 ? (libertad.calificados / libertad.total) * 100 : 0}
                        color={activa ? '#1e5a3a' : '#57ab78'}
                      />
                    </div>
                    <p className="mt-1.5 text-[10px] font-semibold text-brand-900/40">
                      {libertad.calificados}/{libertad.total} calificados
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {libertadSeleccionada && (
            <div ref={seccionRef} className="scroll-mt-6">
            <Card className="mt-4 p-5">
              <SectionTitle
                title={libertadSeleccionada.libertad_nombre}
                description={`${libertadSeleccionada.calificados} de ${libertadSeleccionada.total} indicadores calificados · Peso ${porcentajePeso(libertadSeleccionada.peso)}`}
                actions={
                  libertadSeleccionada.puntaje !== null ? (
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-900/40">
                        Puntaje de la libertad
                      </p>
                      <p className="font-display text-xl font-semibold tabular-nums text-ink">
                        {libertadSeleccionada.puntaje.toFixed(2)}
                      </p>
                    </div>
                  ) : undefined
                }
              />

              <div className="space-y-4">
                {itemsVisibles.map((item) => (
                  <div
                    key={item.indicador_id}
                    className="rounded-2xl border border-brand-900/[0.08] bg-white p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex min-w-0 items-start gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-900 text-[11px] font-extrabold text-white">
                          {item.numero}
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold leading-snug text-ink">{item.nombre}</h3>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <MetodoBadge metodo={item.metodo_evaluacion} />
                            {item.seccion && (
                              <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                                Norma EBA, sección {item.seccion}
                              </span>
                            )}
                            <ScorePill puntaje={item.puntaje} />
                            {guardando[item.indicador_id] && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-600">
                                <Save className="h-3 w-3 animate-pulse" />
                                Guardando...
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {item.descripcion && (
                      <p className="mt-3 text-xs leading-relaxed text-brand-900/55">
                        {item.descripcion}
                      </p>
                    )}

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {CRITERIOS.map((criterio) => {
                        const texto = item[criterio.campo];
                        return (
                          <div
                            key={criterio.campo}
                            className={cn('rounded-xl border p-2.5', criterio.caja)}
                          >
                            <div className="flex items-center gap-1.5">
                              <span className={cn('h-2 w-2 rounded-full', criterio.punto)} />
                              <span className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-brand-900/60">
                                {criterio.etiqueta}
                              </span>
                            </div>
                            <p
                              className={cn(
                                'mt-1 text-[11px] leading-relaxed',
                                texto?.trim() ? 'text-brand-900/65' : 'italic text-brand-900/35',
                              )}
                            >
                              {texto?.trim() || 'No especificado en la norma para este indicador.'}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4">
                      <p className="field-label">Calificación</p>
                      <ScoreSelector
                        value={item.puntaje}
                        onChange={(puntaje) => void calificar(item, puntaje)}
                        disabled={cerrada || Boolean(guardando[item.indicador_id])}
                      />
                    </div>

                    <div className="mt-3">
                      <Textarea
                        label="Observación del indicador (opcional)"
                        value={observaciones[item.indicador_id] ?? ''}
                        onChange={(evento) =>
                          cambiarObservacion(item.indicador_id, evento.target.value)
                        }
                        onBlur={() => {
                          if (timersObservacion.current[item.indicador_id]) {
                            window.clearTimeout(timersObservacion.current[item.indicador_id]);
                          }
                          void guardarObservacion(item.indicador_id);
                        }}
                        disabled={cerrada || item.puntaje === null}
                        rows={2}
                        maxLength={1000}
                        placeholder={
                          item.puntaje === null
                            ? 'Seleccione un puntaje para habilitar la observación.'
                            : 'Evidencias, hallazgos o justificación del puntaje...'
                        }
                        hint={
                          guardandoObs[item.indicador_id]
                            ? 'Guardando observación...'
                            : item.puntaje === null
                              ? 'La observación se habilita al calificar el indicador.'
                              : 'La observación se guarda automáticamente.'
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-3 border-t border-brand-900/[0.07] pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    icon={ArrowLeft}
                    disabled={indiceLibertad <= 0}
                    onClick={() => irALibertad(indiceLibertad - 1)}
                  >
                    Anterior
                  </Button>
                  {indiceLibertad < resumen.libertades.length - 1 ? (
                    <Button icon={ArrowRight} onClick={() => irALibertad(indiceLibertad + 1)}>
                      Siguiente: {resumen.libertades[indiceLibertad + 1]?.libertad_nombre}
                    </Button>
                  ) : (
                    <Button icon={ArrowRight} onClick={irAResumen}>
                      Siguiente: resumen y cierre
                    </Button>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed text-brand-900/45">
                  {faltantes === 0
                    ? 'Todos los indicadores están calificados.'
                    : `Faltan ${faltantes} indicador(es) por calificar en la evaluación.`}
                </p>
              </div>
            </Card>
            </div>
          )}
        </div>

        <div ref={resumenRef} className="scroll-mt-6 space-y-5">
          <Card className="p-5 lg:sticky lg:top-6">
            <SectionTitle
              title={resumen.completo ? 'Resultado de la evaluación' : 'Puntaje parcial'}
              description={
                resumen.completo
                  ? 'Todos los indicadores aplicables están calificados.'
                  : 'Proyección calculada con los indicadores ya calificados.'
              }
            />

            <div className={cn('rounded-2xl border p-4', estilo.bg, estilo.border)}>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-900/45">
                    Puntaje total
                  </p>
                  <p className="mt-1 font-display text-5xl font-semibold leading-none tabular-nums text-ink">
                    {totalMostrado}
                  </p>
                  <p className="mt-1 text-[11px] text-brand-900/45">sobre 100 puntos</p>
                </div>
                <ClasificacionBadge clasificacion={resumen.clasificacion} />
              </div>
              <ProgressBar value={resumen.puntaje_total ?? 0} color={estilo.hex} className="mt-4" />
              <p className="mt-2 text-[11px] leading-relaxed text-brand-900/50">
                {resumen.clasificacion
                  ? `Clasificación: ${resumen.clasificacion}.`
                  : 'Califique al menos un indicador para ver la proyección.'}
              </p>
            </div>

            <div className="mt-4 space-y-2.5">
              {resumen.libertades.map((libertad, indice) => (
                <button
                  key={libertad.libertad_id}
                  type="button"
                  onClick={() => setLibertadActiva(libertad.libertad_id)}
                  className="block w-full rounded-xl px-1 py-1 text-left transition hover:bg-brand-50/70"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[11px] font-semibold text-brand-900/60">
                      L{indice + 1} · {libertad.libertad_nombre}
                    </span>
                    <span className="text-xs font-extrabold tabular-nums text-ink">
                      {libertad.puntaje === null ? '—' : libertad.puntaje.toFixed(1)}
                    </span>
                  </div>
                  <ProgressBar
                    value={libertad.puntaje ?? 0}
                    color={libertad.libertad_id === libertadActiva ? '#1e5a3a' : '#8bc9a2'}
                    className="mt-1"
                  />
                </button>
              ))}
            </div>

            <div className="mt-5 border-t border-brand-900/[0.07] pt-4">
              {cerrada ? (
                <Link to={`/evaluaciones/${data.id}/resultados`}>
                  <Button className="w-full" icon={FileText}>
                    Ver resultados
                  </Button>
                </Link>
              ) : (
                <>
                  <Button
                    className="w-full"
                    icon={CheckCircle2}
                    disabled={!resumen.completo}
                    onClick={() => setConfirmarCierre(true)}
                  >
                    Cerrar evaluación
                  </Button>
                  {!resumen.completo && (
                    <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-amber-700">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      Faltan {faltantes} indicador(es) por calificar. Debe completar todos los
                      indicadores aplicables para cerrar.
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="mt-4 rounded-2xl bg-brand-50/70 p-3 text-[11px] leading-relaxed text-brand-900/50">
              <p className="flex items-center gap-1.5 font-bold text-brand-800">
                <Info className="h-3.5 w-3.5" />
                Guardado automático
              </p>
              <p className="mt-1">
                Cada calificación se guarda al instante. Puede cerrar la sesión y retomar el
                borrador más tarde.
              </p>
            </div>
          </Card>

          <Card className="p-5">
            <SectionTitle
              title="Observaciones generales"
              description="Se incluyen en el reporte final."
              actions={
                guardandoCabecera ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-600">
                    <Save className="h-3 w-3 animate-pulse" />
                    Guardando
                  </span>
                ) : undefined
              }
            />
            <Textarea
              value={obsGenerales}
              onChange={(evento) => cambiarObsGenerales(evento.target.value)}
              onBlur={() => {
                if (timerCabecera.current) window.clearTimeout(timerCabecera.current);
                void guardarCabecera(obsGenerales);
              }}
              disabled={cerrada}
              rows={5}
              maxLength={2000}
              placeholder="Contexto de la visita, manejo general, condiciones climáticas..."
              hint={cerrada ? undefined : 'Se guarda automáticamente al escribir.'}
            />
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmarCierre}
        title="Cerrar evaluación"
        description="Al cerrar la evaluación, los puntajes y la clasificación quedarán congelados y no podrán modificarse. Verifique que todos los indicadores estén correctamente calificados antes de continuar."
        confirmLabel="Cerrar evaluación"
        loading={cerrando}
        onCancel={() => setConfirmarCierre(false)}
        onConfirm={() => void cerrarEvaluacion()}
      />
    </div>
  );
}
