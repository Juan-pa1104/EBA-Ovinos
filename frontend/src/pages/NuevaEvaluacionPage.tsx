import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Info,
  Leaf,
  MapPin,
  PawPrint,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api, detallesDeError, mensajeDeError } from '../api/client';
import type {
  EvaluacionDetalle,
  Indicador,
  PredioConResumen,
} from '../api/types';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  LoadingBlock,
  PageHeader,
  SectionTitle,
  Select,
  Textarea,
} from '../components/ui';
import { ETIQUETA_ESPECIE, ETIQUETA_SISTEMA, hoyISO, porcentajePeso } from '../lib/format';
import { filtrarIndicadoresAplicables } from '../lib/scoring';

interface GrupoLibertad {
  id: number;
  nombre: string;
  peso: number;
  cantidad: number;
}

export function NuevaEvaluacionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [predios, setPredios] = useState<PredioConResumen[]>([]);
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [predioId, setPredioId] = useState(searchParams.get('predio') ?? '');
  const [fecha, setFecha] = useState(hoyISO());
  const [observaciones, setObservaciones] = useState('');
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detalles, setDetalles] = useState<string[]>([]);
  const [creando, setCreando] = useState(false);

  useEffect(() => {
    let activo = true;
    const cargar = async () => {
      setCargando(true);
      setErrorCarga(null);
      try {
        const [listaPredios, catalogo] = await Promise.all([
          api.get<PredioConResumen[]>('/predios'),
          api.get<Indicador[]>('/indicadores'),
        ]);
        if (!activo) return;
        setPredios(listaPredios);
        setIndicadores(catalogo);
      } catch (err) {
        if (activo) setErrorCarga(mensajeDeError(err));
      } finally {
        if (activo) setCargando(false);
      }
    };
    void cargar();
    return () => {
      activo = false;
    };
  }, []);

  const predioSeleccionado = useMemo(
    () => predios.find((predio) => String(predio.id) === predioId) ?? null,
    [predios, predioId],
  );

  const aplicables = useMemo(
    () => (predioSeleccionado ? filtrarIndicadoresAplicables(indicadores, predioSeleccionado) : []),
    [indicadores, predioSeleccionado],
  );

  const grupos = useMemo<GrupoLibertad[]>(() => {
    const mapa = new Map<number, GrupoLibertad>();
    aplicables.forEach((indicador) => {
      const existente = mapa.get(indicador.libertad_id);
      if (existente) {
        existente.cantidad += 1;
      } else {
        mapa.set(indicador.libertad_id, {
          id: indicador.libertad_id,
          nombre: indicador.libertad_nombre,
          peso: indicador.libertad_peso,
          cantidad: 1,
        });
      }
    });
    return Array.from(mapa.values()).sort((a, b) => a.id - b.id);
  }, [aplicables]);

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    setError(null);
    setDetalles([]);

    if (!predioSeleccionado) {
      setError('Seleccione el predio que desea evaluar.');
      return;
    }

    setCreando(true);
    try {
      const evaluacion = await api.post<EvaluacionDetalle>('/evaluaciones', {
        predio_id: predioSeleccionado.id,
        fecha,
        observaciones: observaciones.trim() || null,
      });
      navigate(`/evaluaciones/${evaluacion.id}`);
    } catch (err) {
      setError(mensajeDeError(err));
      setDetalles(detallesDeError(err));
    } finally {
      setCreando(false);
    }
  };

  if (cargando) return <LoadingBlock label="Preparando la evaluación..." />;
  if (errorCarga) return <ErrorState message={errorCarga} onRetry={() => window.location.reload()} />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Nueva evaluación"
        title="Iniciar evaluación de bienestar"
        subtitle="Seleccione el predio. El sistema cargará automáticamente los indicadores aplicables según su especie y sistema productivo."
        actions={
          <Link to="/evaluaciones">
            <Button variant="outline" icon={ArrowLeft}>
              Volver
            </Button>
          </Link>
        }
      />

      {predios.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No hay predios registrados"
          description="Antes de iniciar una evaluación debe registrar el predio con su especie y sistema productivo."
          action={
            <Link to="/predios/nuevo">
              <Button icon={MapPin}>Registrar predio</Button>
            </Link>
          }
        />
      ) : (
        <>
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold">{error}</p>
                {detalles.length > 0 && (
                  <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs">
                    {detalles.map((detalle) => (
                      <li key={detalle}>{detalle}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          <form onSubmit={enviar} className="grid gap-5 lg:grid-cols-[1fr_380px]">
            <div className="space-y-5">
              <Card className="p-5">
                <SectionTitle
                  title="Predio a evaluar"
                  description="Solo se muestran los predios a los que tiene acceso según su rol."
                />
                <Select
                  label="Predio"
                  required
                  value={predioId}
                  onChange={(evento) => setPredioId(evento.target.value)}
                >
                  <option value="">Seleccione un predio...</option>
                  {predios.map((predio) => (
                    <option key={predio.id} value={predio.id}>
                      {predio.nombre} · {predio.municipio} · {ETIQUETA_ESPECIE[predio.especie]}
                    </option>
                  ))}
                </Select>

                {predioSeleccionado ? (
                  <div className="mt-4 rounded-2xl border border-brand-900/[0.08] bg-brand-50/50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-lg font-semibold text-ink">
                          {predioSeleccionado.nombre}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-brand-900/50">
                          <MapPin className="h-3.5 w-3.5" />
                          {predioSeleccionado.municipio}
                          {predioSeleccionado.direccion ? ` · ${predioSeleccionado.direccion}` : ''}
                        </p>
                      </div>
                      <Link
                        to={`/predios/${predioSeleccionado.id}`}
                        className="text-xs font-bold text-brand-700 hover:text-brand-900"
                      >
                        Ver ficha
                      </Link>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Badge variant={predioSeleccionado.especie === 'OVINO' ? 'green' : 'earth'}>
                        {ETIQUETA_ESPECIE[predioSeleccionado.especie]}
                      </Badge>
                      <Badge variant="outline">
                        {ETIQUETA_SISTEMA[predioSeleccionado.sistema_productivo]}
                      </Badge>
                      {predioSeleccionado.especie === 'OVINO' && predioSeleccionado.es_ovino_de_lana && (
                        <Badge variant="amber">Ovino de lana</Badge>
                      )}
                      <Badge variant="neutral">{predioSeleccionado.numero_animales} animales</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-brand-900/[0.07] pt-3 text-[11px] text-brand-900/50">
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {predioSeleccionado.responsable_nombre ?? 'Sin responsable asignado'}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <ClipboardCheck className="h-3.5 w-3.5" />
                        {predioSeleccionado.total_evaluaciones} evaluación(es) cerrada(s)
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs leading-relaxed text-brand-900/55">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                    Seleccione un predio para ver cuántos indicadores se aplicarán en esta evaluación.
                  </p>
                )}
              </Card>

              <Card className="p-5">
                <SectionTitle
                  title="Datos de la evaluación"
                  description="La fecha corresponde al día de la visita o levantamiento de información."
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Fecha de evaluación"
                    type="date"
                    required
                    value={fecha}
                    onChange={(evento) => setFecha(evento.target.value)}
                  />
                  <div className="hidden sm:block" />
                  <div className="sm:col-span-2">
                    <Textarea
                      label="Observaciones generales (opcional)"
                      value={observaciones}
                      onChange={(evento) => setObservaciones(evento.target.value)}
                      placeholder="Contexto de la visita, condiciones climáticas, manejo general, etc."
                      rows={4}
                      maxLength={2000}
                      hint="Podrá ampliar o ajustar estas observaciones mientras la evaluación esté en borrador."
                    />
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-5">
              <Card className="p-5 lg:sticky lg:top-6">
                <SectionTitle
                  title="Alcance de la evaluación"
                  description="Indicadores aplicables calculados a partir de la ficha del predio."
                />
                <div className="rounded-2xl bg-brand-900 p-4 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-300">
                    Indicadores aplicables
                  </p>
                  <div className="mt-1 flex items-end gap-2">
                    <span className="font-display text-4xl font-semibold leading-none">
                      {aplicables.length}
                    </span>
                    <span className="pb-1 text-xs text-brand-200">de 38 del catálogo</span>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-brand-200/80">
                    {predioSeleccionado
                      ? `Filtrados para ${ETIQUETA_ESPECIE[predioSeleccionado.especie].toLowerCase()} en sistema ${ETIQUETA_SISTEMA[predioSeleccionado.sistema_productivo].toLowerCase()}.`
                      : 'Seleccione un predio para calcular el alcance.'}
                  </p>
                </div>

                {grupos.length > 0 && (
                  <div className="mt-4 space-y-2.5">
                    {grupos.map((grupo) => (
                      <div
                        key={grupo.id}
                        className="flex items-center justify-between gap-3 rounded-xl bg-brand-50/70 px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-brand-900/75">{grupo.nombre}</p>
                          <p className="text-[10px] text-brand-900/40">Peso {porcentajePeso(grupo.peso)}</p>
                        </div>
                        <Badge variant="neutral">{grupo.cantidad}</Badge>
                      </div>
                    ))}
                  </div>
                )}

                {predioSeleccionado && aplicables.length === 0 && (
                  <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
                    No hay indicadores aplicables con la configuración actual. Revise la especie y el
                    sistema productivo del predio antes de continuar.
                  </p>
                )}

                <div className="mt-5 border-t border-brand-900/[0.07] pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    icon={ClipboardCheck}
                    loading={creando}
                    disabled={!predioSeleccionado || aplicables.length === 0}
                  >
                    Crear evaluación
                  </Button>
                  <Link to="/evaluaciones">
                    <Button variant="ghost" className="mt-2 w-full" disabled={creando}>
                      Cancelar
                    </Button>
                  </Link>
                </div>
              </Card>

              <Card className="p-5">
                <SectionTitle title="Cómo funciona" />
                <ol className="space-y-3">
                  {[
                    'Se crea un borrador con los indicadores aplicables del predio.',
                    'Califique cada indicador con 0, 20, 55 o 100 según los criterios.',
                    'El puntaje parcial se actualiza y se guarda automáticamente.',
                    'Al cerrar, el resultado queda congelado y se genera el reporte.',
                  ].map((paso, indice) => (
                    <li key={paso} className="flex gap-3 text-xs leading-relaxed text-brand-900/60">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-extrabold text-brand-800">
                        {indice + 1}
                      </span>
                      {paso}
                    </li>
                  ))}
                </ol>
                <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-earth-50 p-3 text-[11px] leading-relaxed text-earth-800">
                  <Leaf className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Pesos de las libertades: L1 {porcentajePeso(0.2)} · L2 {porcentajePeso(0.2)} · L3{' '}
                    {porcentajePeso(0.35)} · L4 {porcentajePeso(0.1)} · L5 {porcentajePeso(0.15)}.
                  </span>
                </div>
              </Card>
            </div>
          </form>
        </>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-4 text-[11px] text-brand-900/40">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          Fecha de hoy: {hoyISO()}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <PawPrint className="h-3.5 w-3.5" />
          Ovinos y caprinos
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Metodología ICA
        </span>
      </div>
    </div>
  );
}
