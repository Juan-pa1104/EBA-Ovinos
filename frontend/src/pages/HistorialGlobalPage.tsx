import {
  ArrowUpRight,
  BarChart3,
  ClipboardCheck,
  History,
  MapPin,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, mensajeDeError, queryString } from '../api/client';
import type {
  Clasificacion,
  HistorialGlobalEvaluacion,
  HistorialGlobalResponse,
  PredioConResumen,
} from '../api/types';
import { EvolucionGlobalChart } from '../components/EvolucionGlobalChart';
import {
  Badge,
  Button,
  Card,
  Checkbox,
  ClasificacionBadge,
  EmptyState,
  ErrorState,
  Input,
  LoadingBlock,
  PageHeader,
  SectionTitle,
  Select,
  StatCard,
} from '../components/ui';
import {
  ETIQUETA_CLASIFICACION,
  ETIQUETA_ESPECIE,
  ETIQUETA_SISTEMA,
  formatFecha,
  formatFechaHora,
} from '../lib/format';

const CLASIFICACIONES: Clasificacion[] = [
  'EXCELENTE BIENESTAR',
  'ALTO',
  'MEDIO',
  'BAJO',
];

export function HistorialGlobalPage() {
  const [predios, setPredios] = useState<PredioConResumen[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<HistorialGlobalEvaluacion[]>([]);
  const [predioId, setPredioId] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [clasificacion, setClasificacion] = useState('');
  const [mostrarLibertades, setMostrarLibertades] = useState(true);
  const [cargandoPredios, setCargandoPredios] = useState(true);
  const [errorPredios, setErrorPredios] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const solicitudRef = useRef(0);

  const cargarPredios = useCallback(async () => {
    setCargandoPredios(true);
    setErrorPredios(null);
    try {
      setPredios(await api.get<PredioConResumen[]>('/predios'));
    } catch (err) {
      setErrorPredios(mensajeDeError(err));
    } finally {
      setCargandoPredios(false);
    }
  }, []);

  useEffect(() => {
    void cargarPredios();
  }, [cargarPredios]);

  const cargarHistorial = useCallback(async () => {
    const solicitud = ++solicitudRef.current;
    setCargando(true);
    setError(null);
    try {
      const data = await api.get<HistorialGlobalResponse>(
        `/evaluaciones/historial-global${queryString({
          predioId: predioId || undefined,
          fechaDesde: fechaDesde || undefined,
          fechaHasta: fechaHasta || undefined,
          clasificacion: clasificacion || undefined,
        })}`,
      );
      if (solicitud !== solicitudRef.current) return;
      setEvaluaciones(data.evaluaciones);
    } catch (err) {
      if (solicitud !== solicitudRef.current) return;
      setError(mensajeDeError(err));
    } finally {
      if (solicitud === solicitudRef.current) setCargando(false);
    }
  }, [clasificacion, fechaDesde, fechaHasta, predioId]);

  useEffect(() => {
    void cargarHistorial();
  }, [cargarHistorial]);

  useEffect(
    () => () => {
      solicitudRef.current += 1;
    },
    [],
  );

  const filtrosActivos = Boolean(predioId || fechaDesde || fechaHasta || clasificacion);

  const metricas = useMemo(() => {
    const conPuntaje = evaluaciones.filter((evaluacion) => evaluacion.puntaje_total !== null);
    const suma = conPuntaje.reduce(
      (total, evaluacion) => total + (evaluacion.puntaje_total ?? 0),
      0,
    );
    const promedio = conPuntaje.length > 0 ? Math.round((suma / conPuntaje.length) * 100) / 100 : null;
    const mejor = conPuntaje.reduce<number | null>(
      (maximo, evaluacion) =>
        maximo === null || (evaluacion.puntaje_total ?? 0) > maximo
          ? evaluacion.puntaje_total
          : maximo,
      null,
    );

    return {
      total: evaluaciones.length,
      predios: new Set(evaluaciones.map((evaluacion) => evaluacion.predio_id)).size,
      promedio,
      mejor,
    };
  }, [evaluaciones]);

  const evaluacionesOrdenadas = useMemo(
    () => [...evaluaciones].reverse(),
    [evaluaciones],
  );

  const limpiarFiltros = () => {
    setPredioId('');
    setFechaDesde('');
    setFechaHasta('');
    setClasificacion('');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Administración"
        title="Historial global"
        subtitle="Consulte todas las evaluaciones cerradas, filtre los resultados y compare la evolución del bienestar entre predios y fechas."
        actions={
          <Link to="/historial">
            <Button variant="outline" icon={History}>
              Historial por predio
            </Button>
          </Link>
        }
      />

      {cargandoPredios ? (
        <LoadingBlock label="Cargando filtros..." />
      ) : errorPredios ? (
        <ErrorState message={errorPredios} onRetry={cargarPredios} />
      ) : (
        <>
          <Card className="mb-5 p-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_auto] xl:items-end">
              <Select
                label="Predio"
                value={predioId}
                onChange={(evento) => setPredioId(evento.target.value)}
              >
                <option value="">Todos los predios</option>
                {predios.map((predio) => (
                  <option key={predio.id} value={predio.id}>
                    {predio.nombre} · {predio.municipio}
                  </option>
                ))}
              </Select>
              <Input
                label="Fecha desde"
                type="date"
                value={fechaDesde}
                max={fechaHasta || undefined}
                onChange={(evento) => setFechaDesde(evento.target.value)}
              />
              <Input
                label="Fecha hasta"
                type="date"
                value={fechaHasta}
                min={fechaDesde || undefined}
                onChange={(evento) => setFechaHasta(evento.target.value)}
              />
              <Select
                label="Clasificación"
                value={clasificacion}
                onChange={(evento) => setClasificacion(evento.target.value)}
              >
                <option value="">Todas las clasificaciones</option>
                {CLASIFICACIONES.map((valor) => (
                  <option key={valor} value={valor}>
                    {ETIQUETA_CLASIFICACION[valor]}
                  </option>
                ))}
              </Select>
              <Button
                variant="outline"
                icon={X}
                className="w-full xl:w-auto"
                disabled={!filtrosActivos}
                onClick={limpiarFiltros}
              >
                Limpiar
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-brand-900/45">
              <span>
                {evaluaciones.length} evaluación(es) cerrada(s) con los filtros actuales.
              </span>
              {filtrosActivos && <Badge variant="outline">Filtros activos</Badge>}
            </div>
          </Card>

          {cargando ? (
            <LoadingBlock label="Cargando historial global..." />
          ) : error ? (
            <ErrorState message={error} onRetry={cargarHistorial} />
          ) : evaluaciones.length === 0 ? (
            <EmptyState
              icon={History}
              title="Sin evaluaciones cerradas"
              description={
                filtrosActivos
                  ? 'No hay resultados que coincidan con los filtros seleccionados.'
                  : 'Aún no existen evaluaciones cerradas en el sistema.'
              }
              action={
                filtrosActivos ? (
                  <Button variant="outline" icon={X} onClick={limpiarFiltros}>
                    Limpiar filtros
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <StatCard
                  label="Evaluaciones cerradas"
                  value={metricas.total}
                  icon={ClipboardCheck}
                  hint="Resultados definitivos"
                />
                <StatCard
                  label="Predios evaluados"
                  value={metricas.predios}
                  icon={MapPin}
                  tone="earth"
                  hint="Con al menos un cierre"
                />
                <StatCard
                  label="Promedio global"
                  value={metricas.promedio === null ? '—' : metricas.promedio.toFixed(2)}
                  icon={BarChart3}
                  tone="blue"
                  hint="Sobre las evaluaciones filtradas"
                />
                <StatCard
                  label="Mejor puntaje"
                  value={metricas.mejor === null ? '—' : metricas.mejor.toFixed(2)}
                  icon={TrendingUp}
                  hint="Máximo resultado del periodo"
                />
              </div>

              <Card className="mt-5 p-5">
                <SectionTitle
                  title="Evolución global"
                  description="Promedio de las evaluaciones cerradas por fecha. Si filtra un predio, la línea muestra su evolución."
                  actions={
                    <Checkbox
                      label="Mostrar libertades"
                      checked={mostrarLibertades}
                      onChange={(evento) => setMostrarLibertades(evento.target.checked)}
                      className="w-full sm:w-auto"
                    />
                  }
                />
                <EvolucionGlobalChart
                  evaluaciones={evaluaciones}
                  mostrarLibertades={mostrarLibertades}
                  altura={330}
                />
              </Card>

              <Card className="mt-5 p-5">
                <SectionTitle
                  title="Evaluaciones cerradas"
                  description="Resultados definitivos ordenados del más reciente al más antiguo."
                />
                <div className="overflow-x-auto rounded-2xl border border-brand-900/[0.07]">
                  <table className="w-full min-w-[980px] border-collapse text-left">
                    <thead className="table-head">
                      <tr>
                        <th className="px-4 py-3">Fecha</th>
                        <th className="px-4 py-3">Predio</th>
                        <th className="px-4 py-3">Especie / sistema</th>
                        <th className="px-4 py-3">Evaluador</th>
                        <th className="px-4 py-3">Libertades</th>
                        <th className="px-4 py-3">Puntaje</th>
                        <th className="px-4 py-3">Clasificación</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-900/[0.06] bg-white">
                      {evaluacionesOrdenadas.map((evaluacion) => (
                        <tr key={evaluacion.id} className="transition hover:bg-brand-50/40">
                          <td className="px-4 py-3.5">
                            <p className="text-sm font-semibold text-ink">
                              {formatFecha(evaluacion.fecha)}
                            </p>
                            <p className="text-[10px] text-brand-900/40">
                              Cerrada {formatFechaHora(evaluacion.cerrada_en)}
                            </p>
                          </td>
                          <td className="px-4 py-3.5">
                            <Link
                              to={`/predios/${evaluacion.predio_id}`}
                              className="inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:text-brand-900"
                            >
                              <MapPin className="h-3.5 w-3.5" />
                              {evaluacion.predio_nombre}
                            </Link>
                            <p className="mt-0.5 text-[11px] text-brand-900/45">
                              {evaluacion.predio_municipio}
                            </p>
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge variant={evaluacion.predio_especie === 'OVINO' ? 'green' : 'earth'}>
                              {ETIQUETA_ESPECIE[evaluacion.predio_especie]}
                            </Badge>
                            <p className="mt-1 text-[11px] text-brand-900/45">
                              {ETIQUETA_SISTEMA[evaluacion.predio_sistema_productivo]}
                            </p>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-900/65">
                              <Users className="h-3.5 w-3.5 text-brand-900/35" />
                              {evaluacion.evaluador_nombre}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex flex-wrap gap-1">
                              {evaluacion.libertades.map((libertad, indice) => (
                                <span
                                  key={libertad.libertad_id}
                                  className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-brand-800"
                                  title={libertad.libertad_nombre}
                                >
                                  L{indice + 1} {libertad.puntaje.toFixed(1)}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-display text-lg font-semibold tabular-nums text-ink">
                              {evaluacion.puntaje_total === null
                                ? '—'
                                : evaluacion.puntaje_total.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <ClasificacionBadge clasificacion={evaluacion.clasificacion} />
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <Link
                              to={`/evaluaciones/${evaluacion.id}/resultados`}
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 text-[11px] font-bold text-brand-800 transition hover:bg-brand-100"
                            >
                              Resultados
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
