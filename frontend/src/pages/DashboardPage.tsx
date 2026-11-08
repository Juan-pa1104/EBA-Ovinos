import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  FilePenLine,
  MapPin,
  Plus,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, mensajeDeError } from '../api/client';
import type { Clasificacion, DashboardData, PredioConResumen } from '../api/types';
import { EvaluacionTabla } from '../components/EvaluacionTabla';
import {
  Button,
  Card,
  ClasificacionBadge,
  ErrorState,
  LoadingBlock,
  PageHeader,
  ProgressBar,
  SectionTitle,
  StatCard,
} from '../components/ui';
import { useAuth } from '../context/AuthContext';
import {
  ETIQUETA_CLASIFICACION,
  estiloClasificacion,
  formatFecha,
  porcentajePeso,
} from '../lib/format';

const CLAVES_DISTRIBUCION: Array<Clasificacion | 'SIN EVALUACIÓN'> = [
  'EXCELENTE BIENESTAR',
  'ALTO',
  'MEDIO',
  'BAJO',
  'SIN EVALUACIÓN',
];

function PredioMini({ predio }: { predio: PredioConResumen }) {
  return (
    <Link
      to={`/predios/${predio.id}`}
      className="group flex items-center justify-between gap-3 rounded-2xl border border-brand-900/[0.07] bg-white p-3.5 transition hover:border-brand-500/30 hover:bg-brand-50/40"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-ink group-hover:text-brand-700">{predio.nombre}</p>
        <p className="mt-0.5 truncate text-[11px] text-brand-900/45">
          {predio.municipio} · {predio.numero_animales} animales
        </p>
      </div>
      <ClasificacionBadge clasificacion={predio.ultima_clasificacion} />
    </Link>
  );
}

export function DashboardPage() {
  const { usuario } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setData(await api.get<DashboardData>('/dashboard'));
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  if (cargando) return <LoadingBlock label="Preparando su panel..." />;
  if (error || !data) return <ErrorState message={error ?? 'No hay datos disponibles.'} onRetry={cargar} />;

  const { metricas, distribucion, ultimas_evaluaciones, predios } = data;
  const esAdmin = usuario?.rol === 'ADMIN';
  const esEvaluador = usuario?.rol === 'EVALUADOR';
  const esResponsable = usuario?.rol === 'RESPONSABLE';
  const totalDistribucion = Object.values(distribucion).reduce((total, valor) => total + valor, 0);
  const borradores = ultimas_evaluaciones.filter((evaluacion) => evaluacion.estado === 'BORRADOR');
  const primerNombre = usuario?.nombre.split(' ')[0] ?? '';
  const fechaActual = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const subtitulo = esAdmin
    ? 'Vista general del sistema, usuarios y estado de los predios evaluados.'
    : esEvaluador
      ? 'Retome sus borradores, registre predios y consulte los resultados de sus evaluaciones.'
      : 'Consulte el estado de bienestar de sus predios y los resultados de sus evaluaciones.';

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow={fechaActual}
        title={`Hola, ${primerNombre}`}
        subtitle={subtitulo}
        actions={
          esResponsable ? (
            <Link to="/evaluaciones">
              <Button variant="outline" icon={ClipboardList}>
                Mis resultados
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/predios/nuevo">
                <Button variant="outline" icon={Plus}>
                  Nuevo predio
                </Button>
              </Link>
              <Link to="/evaluaciones/nueva">
                <Button icon={ClipboardCheck}>Nueva evaluación</Button>
              </Link>
            </>
          )
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {esAdmin && (
          <>
            <StatCard label="Predios" value={metricas.predios ?? 0} icon={MapPin} hint="Registrados en el sistema" />
            <StatCard
              label="Evaluaciones"
              value={metricas.evaluaciones ?? 0}
              icon={ClipboardCheck}
              tone="blue"
              hint={`${metricas.cerradas ?? 0} cerradas`}
            />
            <StatCard
              label="Usuarios activos"
              value={metricas.usuarios_activos ?? 0}
              icon={Users}
              tone="earth"
              hint={`${metricas.evaluadores ?? 0} evaluadores · ${metricas.responsables ?? 0} responsables`}
            />
            <StatCard
              label="Borradores"
              value={metricas.borradores ?? 0}
              icon={FilePenLine}
              tone="amber"
              hint="Evaluaciones en curso"
            />
          </>
        )}

        {esEvaluador && (
          <>
            <StatCard label="Predios" value={metricas.predios ?? 0} icon={MapPin} hint="Disponibles para evaluar" />
            <StatCard
              label="Borradores"
              value={metricas.borradores ?? 0}
              icon={FilePenLine}
              tone="amber"
              hint="Pendientes de cerrar"
            />
            <StatCard
              label="Cerradas"
              value={metricas.cerradas ?? 0}
              icon={CheckCircle2}
              tone="blue"
              hint="Evaluaciones finalizadas"
            />
            <StatCard
              label="Predios evaluados"
              value={metricas.predios_evaluados ?? 0}
              icon={ClipboardList}
              tone="earth"
              hint="Con al menos un resultado"
            />
          </>
        )}

        {esResponsable && (
          <>
            <StatCard label="Mis predios" value={metricas.predios ?? 0} icon={MapPin} hint="Asignados a usted" />
            <StatCard
              label="Evaluaciones"
              value={metricas.cerradas ?? 0}
              icon={ClipboardCheck}
              tone="blue"
              hint="Resultados disponibles"
            />
            <StatCard
              label="Predios evaluados"
              value={metricas.predios_evaluados ?? 0}
              icon={CheckCircle2}
              tone="earth"
              hint="Con evaluación cerrada"
            />
            <StatCard
              label="Sin evaluar"
              value={Math.max(0, (metricas.predios ?? 0) - (metricas.predios_evaluados ?? 0))}
              icon={AlertTriangle}
              tone="amber"
              hint="Predios pendientes"
            />
          </>
        )}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {esEvaluador && (
            <Card className="p-5">
              <SectionTitle
                title="Borradores para retomar"
                description="Las evaluaciones guardadas se conservan indicador por indicador."
                actions={
                  borradores.length > 0 ? (
                    <Link to="/evaluaciones?estado=BORRADOR" className="text-xs font-bold text-brand-700 hover:text-brand-900">
                      Ver todos
                    </Link>
                  ) : undefined
                }
              />
              {borradores.length === 0 ? (
                <div className="surface-muted flex items-center gap-3 p-4 text-sm text-brand-900/55">
                  <CheckCircle2 className="h-5 w-5 text-brand-500" />
                  No tiene evaluaciones en borrador. Puede iniciar una nueva desde un predio.
                </div>
              ) : (
                <div className="space-y-2">
                  {borradores.slice(0, 4).map((evaluacion) => (
                    <Link
                      key={evaluacion.id}
                      to={`/evaluaciones/${evaluacion.id}`}
                      className="group flex items-center justify-between gap-3 rounded-2xl border border-amber-200/70 bg-amber-50/50 p-3.5 transition hover:border-amber-300 hover:bg-amber-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-ink">{evaluacion.predio_nombre}</p>
                        <p className="mt-0.5 text-[11px] text-brand-900/45">
                          {formatFecha(evaluacion.fecha)} · {evaluacion.evaluador_nombre}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800">
                        Continuar
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          )}

          <Card className="p-5">
            <SectionTitle
              title={esResponsable ? 'Últimos resultados' : 'Evaluaciones recientes'}
              description={
                esResponsable
                  ? 'Resultados cerrados de sus predios.'
                  : 'Últimas evaluaciones registradas según su rol.'
              }
              actions={
                <Link to="/evaluaciones" className="text-xs font-bold text-brand-700 hover:text-brand-900">
                  Ver historial
                </Link>
              }
            />
            <EvaluacionTabla evaluaciones={ultimas_evaluaciones.slice(0, 5)} />
          </Card>

          <Card className="p-5">
            <SectionTitle
              title={esResponsable ? 'Mis predios' : 'Predios'}
              description="Última clasificación registrada por predio."
              actions={
                <Link to="/predios" className="text-xs font-bold text-brand-700 hover:text-brand-900">
                  Ver todos
                </Link>
              }
            />
            {predios.length === 0 ? (
              <p className="surface-muted p-4 text-sm text-brand-900/55">Aún no hay predios registrados.</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {predios.map((predio) => (
                  <PredioMini key={predio.id} predio={predio} />
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <SectionTitle title="Distribución por clasificación" description="Según la última evaluación cerrada." />
            {totalDistribucion === 0 ? (
              <p className="surface-muted p-4 text-sm text-brand-900/55">Todavía no hay predios registrados.</p>
            ) : (
              <div className="space-y-3.5">
                {CLAVES_DISTRIBUCION.map((clave) => {
                  const cantidad = distribucion[clave] ?? 0;
                  const estilo = estiloClasificacion(clave === 'SIN EVALUACIÓN' ? null : clave);
                  return (
                    <div key={clave}>
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-brand-900/60">
                          {clave === 'SIN EVALUACIÓN' ? 'Sin evaluación' : ETIQUETA_CLASIFICACION[clave]}
                        </span>
                        <span className="text-xs font-extrabold tabular-nums text-ink">{cantidad}</span>
                      </div>
                      <ProgressBar value={(cantidad / totalDistribucion) * 100} color={estilo.hex} />
                    </div>
                  );
                })}
                <div className="border-t border-brand-900/[0.06] pt-3 text-[11px] text-brand-900/45">
                  {metricas.predios_evaluados ?? 0} de {metricas.predios ?? 0} predios con evaluación cerrada.
                </div>
              </div>
            )}
          </Card>

          {esAdmin && (
            <Card className="p-5">
              <SectionTitle title="Alertas de gestión" />
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-3.5">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <div>
                    <p className="text-sm font-bold text-amber-900">
                      {metricas.predios_sin_responsable ?? 0} predio(s) sin responsable
                    </p>
                    <Link to="/predios" className="mt-1 inline-block text-[11px] font-bold text-amber-800 underline-offset-2 hover:underline">
                      Asignar responsables
                    </Link>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl bg-brand-50 p-3.5">
                  <ClipboardList className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  <div>
                    <p className="text-sm font-bold text-brand-900">
                      {Math.max(0, (metricas.predios ?? 0) - (metricas.predios_evaluados ?? 0))} predio(s) sin evaluación cerrada
                    </p>
                    <Link to="/evaluaciones/nueva" className="mt-1 inline-block text-[11px] font-bold text-brand-700 underline-offset-2 hover:underline">
                      Iniciar evaluación
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {esAdmin && (
            <Card className="p-5">
              <SectionTitle title="Accesos rápidos" />
              <div className="grid gap-2">
                <Link to="/usuarios" className="surface-muted flex items-center gap-3 p-3 text-sm font-bold text-brand-800 transition hover:bg-brand-100/70">
                  <Users className="h-4 w-4" /> Gestionar usuarios
                </Link>
                <Link to="/indicadores" className="surface-muted flex items-center gap-3 p-3 text-sm font-bold text-brand-800 transition hover:bg-brand-100/70">
                  <BookOpen className="h-4 w-4" /> Editar catálogo de indicadores
                </Link>
              </div>
            </Card>
          )}

          {esEvaluador && (
            <Card className="p-5">
              <SectionTitle title="Cómo funciona" />
              <ol className="space-y-3">
                {[
                  'Registre el predio con su especie y sistema productivo.',
                  'Cree la evaluación: el sistema filtra los indicadores aplicables.',
                  'Califique cada indicador con 0, 20, 55 o 100.',
                  'Cierre la evaluación y descargue el reporte en PDF.',
                ].map((paso, indice) => (
                  <li key={paso} className="flex gap-3 text-xs leading-relaxed text-brand-900/60">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-extrabold text-brand-800">
                      {indice + 1}
                    </span>
                    {paso}
                  </li>
                ))}
              </ol>
              <div className="mt-4 rounded-2xl bg-earth-50 p-3 text-[11px] leading-relaxed text-earth-800">
                Pesos: L1 {porcentajePeso(0.2)} · L2 {porcentajePeso(0.2)} · L3 {porcentajePeso(0.35)} · L4{' '}
                {porcentajePeso(0.1)} · L5 {porcentajePeso(0.15)}
              </div>
            </Card>
          )}

          {esResponsable && (
            <Card className="p-5">
              <SectionTitle title="¿Cómo leer sus resultados?" />
              <p className="text-xs leading-relaxed text-brand-900/60">
                El puntaje total va de 0 a 100 y se calcula con el promedio de cada libertad ponderado
                por su peso. Una clasificación excelente indica ≥ 90 puntos; alto, entre 75 y 89,99;
                medio, entre 50 y 74,99; bajo, menos de 50.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <ClasificacionBadge clasificacion="EXCELENTE BIENESTAR" />
                <ClasificacionBadge clasificacion="ALTO" />
                <ClasificacionBadge clasificacion="MEDIO" />
                <ClasificacionBadge clasificacion="BAJO" />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
