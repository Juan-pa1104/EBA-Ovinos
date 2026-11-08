import {
  ArrowUpRight,
  CalendarDays,
  ClipboardCheck,
  History,
  LineChart,
  MapPin,
  Plus,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, mensajeDeError } from '../api/client';
import type { HistorialResponse, PredioConResumen } from '../api/types';
import { EvolucionChart } from '../components/EvolucionChart';
import {
  Badge,
  Button,
  Card,
  Checkbox,
  ClasificacionBadge,
  EmptyState,
  ErrorState,
  LoadingBlock,
  PageHeader,
  SectionTitle,
  Select,
  StatCard,
} from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { ETIQUETA_ESPECIE, ETIQUETA_SISTEMA, formatFecha } from '../lib/format';

export function HistorialPage() {
  const { usuario } = useAuth();
  const [searchParams] = useSearchParams();
  const [predios, setPredios] = useState<PredioConResumen[]>([]);
  const [predioId, setPredioId] = useState(searchParams.get('predio') ?? '');
  const [historial, setHistorial] = useState<HistorialResponse | null>(null);
  const [mostrarLibertades, setMostrarLibertades] = useState(true);
  const [cargandoPredios, setCargandoPredios] = useState(true);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const puedeEvaluar = usuario?.rol === 'ADMIN' || usuario?.rol === 'EVALUADOR';

  useEffect(() => {
    let activo = true;
    api
      .get<PredioConResumen[]>('/predios')
      .then((datos) => {
        if (!activo) return;
        setPredios(datos);
        setPredioId((actual) => actual || (datos.length > 0 ? String(datos[0].id) : ''));
      })
      .catch((err) => {
        if (activo) setError(mensajeDeError(err));
      })
      .finally(() => {
        if (activo) setCargandoPredios(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  const cargarHistorial = useCallback(async () => {
    if (!predioId) {
      setHistorial(null);
      return;
    }
    setCargandoHistorial(true);
    setError(null);
    try {
      setHistorial(await api.get<HistorialResponse>(`/predios/${predioId}/historial`));
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCargandoHistorial(false);
    }
  }, [predioId]);

  useEffect(() => {
    void cargarHistorial();
  }, [cargarHistorial]);

  const metricas = useMemo(() => {
    const evaluaciones = historial?.evaluaciones ?? [];
    if (evaluaciones.length === 0) {
      return { total: 0, primero: null, ultimo: null, variacion: null };
    }
    const primero = evaluaciones[0].puntaje_total;
    const ultimo = evaluaciones[evaluaciones.length - 1].puntaje_total;
    return {
      total: evaluaciones.length,
      primero,
      ultimo,
      variacion:
        primero !== null && ultimo !== null ? Math.round((ultimo - primero) * 100) / 100 : null,
    };
  }, [historial]);

  const predio = historial?.predio ?? predios.find((actual) => String(actual.id) === predioId) ?? null;

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Historial"
        title="Evolución del bienestar"
        subtitle={
          usuario?.rol === 'RESPONSABLE'
            ? 'Consulte la evolución de los puntajes de sus predios en evaluaciones cerradas.'
            : 'Compare los resultados de un predio a lo largo del tiempo y detecte tendencias.'
        }
        actions={
          puedeEvaluar && predio ? (
            <Link to={`/evaluaciones/nueva?predio=${predio.id}`}>
              <Button icon={Plus}>Nueva evaluación</Button>
            </Link>
          ) : undefined
        }
      />

      {cargandoPredios ? (
        <LoadingBlock label="Cargando predios..." />
      ) : predios.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No hay predios disponibles"
          description="Registre un predio y realice evaluaciones para consultar su evolución."
          action={
            puedeEvaluar ? (
              <Link to="/predios/nuevo">
                <Button icon={Plus}>Registrar predio</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <Card className="mb-5 p-4">
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <Select
                label="Predio"
                value={predioId}
                onChange={(evento) => setPredioId(evento.target.value)}
              >
                <option value="">Seleccione un predio...</option>
                {predios.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nombre} · {item.municipio}
                  </option>
                ))}
              </Select>
              <Checkbox
                label="Mostrar libertades"
                description="Añade una línea por cada libertad al gráfico."
                checked={mostrarLibertades}
                onChange={(evento) => setMostrarLibertades(evento.target.checked)}
              />
              {predio && (
                <Link to={`/predios/${predio.id}`}>
                  <Button variant="outline" className="w-full md:w-auto">
                    Ver ficha del predio
                  </Button>
                </Link>
              )}
            </div>
          </Card>

          {cargandoHistorial ? (
            <LoadingBlock label="Cargando historial..." />
          ) : error ? (
            <ErrorState message={error} onRetry={cargarHistorial} />
          ) : !predio ? (
            <EmptyState
              icon={History}
              title="Seleccione un predio"
              description="Elija un predio en el filtro superior para consultar su evolución."
            />
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge variant={predio.especie === 'OVINO' ? 'green' : 'earth'}>
                  {ETIQUETA_ESPECIE[predio.especie]}
                  {predio.especie === 'OVINO' && predio.es_ovino_de_lana ? ' · lana' : ''}
                </Badge>
                <Badge variant="outline">{ETIQUETA_SISTEMA[predio.sistema_productivo]}</Badge>
                <Badge variant="neutral">{predio.numero_animales} animales</Badge>
                <span className="inline-flex items-center gap-1 text-xs text-brand-900/45">
                  <MapPin className="h-3.5 w-3.5" />
                  {predio.municipio}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <StatCard
                  label="Evaluaciones cerradas"
                  value={metricas.total}
                  icon={ClipboardCheck}
                  hint="Con resultado definitivo"
                />
                <StatCard
                  label="Primer puntaje"
                  value={metricas.primero === null ? '—' : metricas.primero.toFixed(2)}
                  icon={CalendarDays}
                  tone="earth"
                  hint="Línea base del predio"
                />
                <StatCard
                  label="Último puntaje"
                  value={metricas.ultimo === null ? '—' : metricas.ultimo.toFixed(2)}
                  icon={LineChart}
                  tone="blue"
                  hint="Resultado más reciente"
                />
                <StatCard
                  label="Variación"
                  value={
                    metricas.variacion === null
                      ? '—'
                      : `${metricas.variacion > 0 ? '+' : ''}${metricas.variacion.toFixed(2)}`
                  }
                  icon={metricas.variacion !== null && metricas.variacion < 0 ? TrendingDown : TrendingUp}
                  tone={
                    metricas.variacion === null
                      ? 'earth'
                      : metricas.variacion >= 0
                        ? 'green'
                        : 'red'
                  }
                  hint="Diferencia primer vs. último"
                />
              </div>

              {historial && historial.evaluaciones.length > 0 ? (
                <>
                  <Card className="mt-5 p-5">
                    <SectionTitle
                      title="Evolución del puntaje"
                      description="Puntaje total y, opcionalmente, puntaje de cada libertad en el tiempo."
                    />
                    <EvolucionChart
                      evaluaciones={historial.evaluaciones}
                      mostrarLibertades={mostrarLibertades}
                      altura={330}
                    />
                  </Card>

                  <Card className="mt-5 p-5">
                    <SectionTitle
                      title="Evaluaciones del predio"
                      description="Resultados cerrados ordenados cronológicamente."
                    />
                    <div className="overflow-x-auto rounded-2xl border border-brand-900/[0.07]">
                      <table className="w-full min-w-[560px] border-collapse text-left">
                        <thead className="table-head">
                          <tr>
                            <th className="px-4 py-3">Fecha</th>
                            <th className="px-4 py-3">Puntaje</th>
                            <th className="px-4 py-3">Clasificación</th>
                            <th className="px-4 py-3">Libertades</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-900/[0.06] bg-white">
                          {[...historial.evaluaciones].reverse().map((evaluacion) => (
                            <tr key={evaluacion.id} className="transition hover:bg-brand-50/40">
                              <td className="px-4 py-3.5 text-sm font-semibold text-ink">
                                {formatFecha(evaluacion.fecha)}
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
              ) : (
                <EmptyState
                  icon={History}
                  title="Sin evaluaciones cerradas"
                  description="Este predio todavía no tiene resultados definitivos. Cree una evaluación y ciérrela para comenzar el historial."
                  action={
                    puedeEvaluar ? (
                      <Link to={`/evaluaciones/nueva?predio=${predio.id}`}>
                        <Button icon={Plus}>Iniciar evaluación</Button>
                      </Link>
                    ) : undefined
                  }
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
