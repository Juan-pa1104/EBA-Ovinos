import {
  Activity,
  ArrowLeft,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  FilePenLine,
  History,
  MapPin,
  PawPrint,
  Pencil,
  Plus,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, mensajeDeError } from '../api/client';
import type {
  EvaluacionListado,
  HistorialResponse,
  PredioConResumen,
} from '../api/types';
import { EvolucionChart } from '../components/EvolucionChart';
import { EvaluacionTabla } from '../components/EvaluacionTabla';
import {
  Badge,
  Button,
  Card,
  ClasificacionBadge,
  EmptyState,
  ErrorState,
  InfoRow,
  LoadingBlock,
  PageHeader,
  SectionTitle,
  StatCard,
} from '../components/ui';
import { useAuth } from '../context/AuthContext';
import {
  ETIQUETA_ESPECIE,
  ETIQUETA_SISTEMA,
  formatFecha,
  formatFechaHora,
  porcentajePeso,
} from '../lib/format';

export function PredioDetallePage() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const [predio, setPredio] = useState<PredioConResumen | null>(null);
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionListado[]>([]);
  const [historial, setHistorial] = useState<HistorialResponse | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const puedeGestionar = usuario?.rol === 'ADMIN' || usuario?.rol === 'EVALUADOR';

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const [datosPredio, listaEvaluaciones, datosHistorial] = await Promise.all([
        api.get<PredioConResumen>(`/predios/${id}`),
        api.get<EvaluacionListado[]>(`/evaluaciones?predioId=${id}&limit=100`),
        api.get<HistorialResponse>(`/predios/${id}/historial`),
      ]);
      setPredio(datosPredio);
      setEvaluaciones(listaEvaluaciones);
      setHistorial(datosHistorial);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  if (cargando) return <LoadingBlock label="Cargando predio..." />;
  if (error || !predio) {
    return <ErrorState message={error ?? 'Predio no encontrado.'} onRetry={cargar} />;
  }

  const ultimaEvaluacion = historial?.evaluaciones[historial.evaluaciones.length - 1] ?? null;

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Ficha del predio"
        title={predio.nombre}
        subtitle={`${ETIQUETA_ESPECIE[predio.especie]} · ${ETIQUETA_SISTEMA[predio.sistema_productivo]} · ${predio.municipio}`}
        actions={
          <>
            <Link to="/predios">
              <Button variant="outline" icon={ArrowLeft}>
                Predios
              </Button>
            </Link>
            {puedeGestionar && (
              <>
                <Link to={`/predios/${predio.id}/editar`}>
                  <Button variant="outline" icon={Pencil}>
                    Editar
                  </Button>
                </Link>
                <Link to={`/evaluaciones/nueva?predio=${predio.id}`}>
                  <Button icon={ClipboardCheck}>Nueva evaluación</Button>
                </Link>
              </>
            )}
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Evaluaciones cerradas"
          value={predio.total_evaluaciones}
          icon={ClipboardList}
          hint={predio.ultima_fecha ? `Última: ${formatFecha(predio.ultima_fecha)}` : 'Sin resultados'}
        />
        {usuario?.rol === 'RESPONSABLE' ? (
          <StatCard
            label="Última evaluación"
            value={predio.ultima_fecha ? formatFecha(predio.ultima_fecha) : '—'}
            icon={CalendarDays}
            tone="earth"
            hint="Fecha del último resultado"
          />
        ) : (
          <StatCard
            label="Borradores"
            value={predio.borradores}
            icon={FilePenLine}
            tone="amber"
            hint="Evaluaciones en curso"
          />
        )}
        <StatCard
          label="Animales"
          value={predio.numero_animales}
          icon={PawPrint}
          tone="earth"
          hint="Inventario reportado"
        />
        <StatCard
          label="Última clasificación"
          value={
            predio.ultima_clasificacion
              ? predio.ultima_clasificacion === 'EXCELENTE BIENESTAR'
                ? 'Excelente'
                : predio.ultima_clasificacion.charAt(0) +
                  predio.ultima_clasificacion.slice(1).toLowerCase()
              : 'Sin evaluar'
          }
          icon={Activity}
          tone={predio.ultima_clasificacion ? 'green' : 'blue'}
          hint={
            ultimaEvaluacion?.puntaje_total !== null && ultimaEvaluacion?.puntaje_total !== undefined
              ? `${ultimaEvaluacion.puntaje_total.toFixed(2)} / 100`
              : 'Aún no hay evaluación cerrada'
          }
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="p-5">
          <SectionTitle
            title="Información general"
            description="Datos del predio y su configuración para la evaluación EBA."
          />
          <dl className="divide-y divide-brand-900/[0.06]">
            <InfoRow label="Municipio" value={predio.municipio} />
            <InfoRow label="Dirección / vereda" value={predio.direccion || 'Sin registrar'} />
            <InfoRow
              label="Especie"
              value={
                <span className="inline-flex flex-wrap justify-end gap-1.5">
                  <Badge variant={predio.especie === 'OVINO' ? 'green' : 'earth'}>
                    {ETIQUETA_ESPECIE[predio.especie]}
                  </Badge>
                  {predio.especie === 'OVINO' && predio.es_ovino_de_lana && (
                    <Badge variant="amber">Lana</Badge>
                  )}
                </span>
              }
            />
            <InfoRow label="Sistema productivo" value={ETIQUETA_SISTEMA[predio.sistema_productivo]} />
            <InfoRow label="Número de animales" value={predio.numero_animales} />
            <InfoRow
              label="Responsable"
              value={predio.responsable_nombre ?? <span className="text-amber-700">Sin asignar</span>}
            />
            <InfoRow label="Última clasificación" value={<ClasificacionBadge clasificacion={predio.ultima_clasificacion} />} />
            <InfoRow label="Registrado" value={formatFechaHora(predio.created_at)} />
          </dl>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <SectionTitle
            title="Evolución del bienestar"
            description="Puntaje total y por libertad en las evaluaciones cerradas."
            actions={
              historial && historial.evaluaciones.length > 0 ? (
                <Link
                  to={`/historial?predio=${predio.id}`}
                  className="text-xs font-bold text-brand-700 hover:text-brand-900"
                >
                  Ver historial completo
                </Link>
              ) : undefined
            }
          />
          {historial && historial.evaluaciones.length > 0 ? (
            <>
              <EvolucionChart evaluaciones={historial.evaluaciones} altura={280} />
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-brand-900/[0.06] pt-3 text-[11px] text-brand-900/45">
                <span className="inline-flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5" />
                  {historial.evaluaciones.length} evaluación(es) cerrada(s)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Pesos: L1 {porcentajePeso(0.2)} · L2 {porcentajePeso(0.2)} · L3 {porcentajePeso(0.35)} · L4{' '}
                  {porcentajePeso(0.1)} · L5 {porcentajePeso(0.15)}
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-brand-900/15 bg-brand-50/40 px-5 py-12 text-center">
              <History className="h-7 w-7 text-brand-400" />
              <p className="text-sm font-bold text-brand-900/70">Todavía no hay historial</p>
              <p className="max-w-sm text-xs leading-relaxed text-brand-900/45">
                Cuando se cierre la primera evaluación, aquí aparecerá la evolución del puntaje del
                predio.
              </p>
              {puedeGestionar && (
                <Link to={`/evaluaciones/nueva?predio=${predio.id}`}>
                  <Button size="sm" icon={Plus}>
                    Iniciar evaluación
                  </Button>
                </Link>
              )}
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-5 p-5">
        <SectionTitle
          title="Evaluaciones del predio"
          description={
            usuario?.rol === 'RESPONSABLE'
              ? 'Resultados cerrados disponibles para consulta.'
              : 'Historial de evaluaciones registradas, incluidos los borradores.'
          }
          actions={
            puedeGestionar ? (
              <Link to={`/evaluaciones/nueva?predio=${predio.id}`}>
                <Button size="sm" variant="outline" icon={Plus}>
                  Evaluar
                </Button>
              </Link>
            ) : undefined
          }
        />
        {evaluaciones.length === 0 ? (
          <EmptyState
            icon={ClipboardCheck}
            title="Sin evaluaciones registradas"
            description="Cree la primera evaluación para este predio y califique los indicadores aplicables."
            action={
              puedeGestionar ? (
                <Link to={`/evaluaciones/nueva?predio=${predio.id}`}>
                  <Button icon={ClipboardCheck}>Crear evaluación</Button>
                </Link>
              ) : undefined
            }
          />
        ) : (
          <EvaluacionTabla evaluaciones={evaluaciones} mostrarPredio={false} />
        )}
      </Card>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="surface-muted flex items-start gap-3 p-4">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          <p className="text-xs leading-relaxed text-brand-900/55">
            <span className="font-bold text-brand-900/75">Ubicación:</span> {predio.municipio}
            {predio.direccion ? ` · ${predio.direccion}` : ''}
          </p>
        </div>
        <div className="surface-muted flex items-start gap-3 p-4">
          <Users className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          <p className="text-xs leading-relaxed text-brand-900/55">
            <span className="font-bold text-brand-900/75">Responsable:</span>{' '}
            {predio.responsable_nombre ?? 'Sin asignar. El administrador puede asignarlo.'}
          </p>
        </div>
        <div className="surface-muted flex items-start gap-3 p-4">
          <ClipboardList className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          <p className="text-xs leading-relaxed text-brand-900/55">
            <span className="font-bold text-brand-900/75">Evaluaciones:</span> {predio.total_evaluaciones}{' '}
            cerrada(s)
            {usuario?.rol !== 'RESPONSABLE' ? ` y ${predio.borradores} borrador(es).` : '.'}
          </p>
        </div>
      </div>
    </div>
  );
}
