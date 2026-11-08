import {
  AlertCircle,
  BookOpen,
  Check,
  Filter,
  Info,
  Pencil,
  Scale,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { api, detallesDeError, mensajeDeError } from '../api/client';
import type { Indicador, Libertad, MetodoEvaluacion } from '../api/types';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingBlock,
  MetodoBadge,
  Modal,
  PageHeader,
  ProgressBar,
  SearchField,
  SectionTitle,
  Select,
  Textarea,
} from '../components/ui';
import { useToast } from '../context/ToastContext';
import {
  cn,
  ETIQUETA_METODO,
  porcentajePeso,
} from '../lib/format';

interface FormIndicador {
  descripcion: string;
  metodo_evaluacion: MetodoEvaluacion;
  criterio_100: string;
  criterio_55: string;
  criterio_20: string;
  criterio_0: string;
}

const FORM_INICIAL: FormIndicador = {
  descripcion: '',
  metodo_evaluacion: 'VISUAL',
  criterio_100: '',
  criterio_55: '',
  criterio_20: '',
  criterio_0: '',
};

const APLICABILIDADES: Array<{
  campo: 'aplica_extensivo' | 'aplica_semi_intensivo' | 'aplica_intensivo' | 'aplica_familiar';
  etiqueta: string;
}> = [
  { campo: 'aplica_extensivo', etiqueta: 'Extensivo' },
  { campo: 'aplica_semi_intensivo', etiqueta: 'Semi intensivo' },
  { campo: 'aplica_intensivo', etiqueta: 'Intensivo' },
  { campo: 'aplica_familiar', etiqueta: 'Familiar' },
];

function activo(valor: boolean | number): boolean {
  return valor === true || valor === 1;
}

export function IndicadoresPage() {
  const { toast } = useToast();
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [libertades, setLibertades] = useState<Libertad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [search, setSearch] = useState('');
  const [libertadId, setLibertadId] = useState('');

  const [editando, setEditando] = useState<Indicador | null>(null);
  const [form, setForm] = useState<FormIndicador>(FORM_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formDetalles, setFormDetalles] = useState<string[]>([]);

  useEffect(() => {
    const temporizador = window.setTimeout(() => setSearch(busqueda), 300);
    return () => window.clearTimeout(temporizador);
  }, [busqueda]);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const [listaIndicadores, listaLibertades] = await Promise.all([
        api.get<Indicador[]>('/indicadores'),
        api.get<Libertad[]>('/libertades'),
      ]);
      setIndicadores(listaIndicadores);
      setLibertades(listaLibertades);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const filtrados = useMemo(() => {
    const termino = search.trim().toLowerCase();
    return indicadores.filter((indicador) => {
      if (libertadId && String(indicador.libertad_id) !== libertadId) return false;
      if (!termino) return true;
      return (
        indicador.nombre.toLowerCase().includes(termino) ||
        String(indicador.numero).includes(termino) ||
        (indicador.descripcion ?? '').toLowerCase().includes(termino)
      );
    });
  }, [indicadores, search, libertadId]);

  const grupos = useMemo(() => {
    return libertades
      .map((libertad) => ({
        libertad,
        indicadores: filtrados.filter((indicador) => indicador.libertad_id === libertad.id),
      }))
      .filter((grupo) => grupo.indicadores.length > 0);
  }, [libertades, filtrados]);

  const abrirEditar = (indicador: Indicador) => {
    setEditando(indicador);
    setForm({
      descripcion: indicador.descripcion ?? '',
      metodo_evaluacion: indicador.metodo_evaluacion,
      criterio_100: indicador.criterio_100 ?? '',
      criterio_55: indicador.criterio_55 ?? '',
      criterio_20: indicador.criterio_20 ?? '',
      criterio_0: indicador.criterio_0 ?? '',
    });
    setFormError(null);
    setFormDetalles([]);
  };

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    if (!editando) return;
    setFormError(null);
    setFormDetalles([]);
    setGuardando(true);

    try {
      const actualizado = await api.put<Indicador>(`/indicadores/${editando.id}`, {
        descripcion: form.descripcion.trim() || null,
        metodo_evaluacion: form.metodo_evaluacion,
        criterio_100: form.criterio_100.trim() || null,
        criterio_55: form.criterio_55.trim() || null,
        criterio_20: form.criterio_20.trim() || null,
        criterio_0: form.criterio_0.trim() || null,
      });
      setIndicadores((actuales) =>
        actuales.map((indicador) => (indicador.id === actualizado.id ? actualizado : indicador)),
      );
      setEditando(null);
      toast('Indicador actualizado correctamente.');
    } catch (err) {
      setFormError(mensajeDeError(err));
      setFormDetalles(detallesDeError(err));
    } finally {
      setGuardando(false);
    }
  };

  const criteriosDefinidos = (indicador: Indicador) =>
    [indicador.criterio_100, indicador.criterio_55, indicador.criterio_20, indicador.criterio_0].filter(
      (criterio) => Boolean(criterio?.trim()),
    ).length;

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Catálogo metodológico"
        title="Indicadores de bienestar"
        subtitle="Consulte los 38 indicadores, sus pesos, reglas de aplicabilidad y edite las descripciones y criterios de calificación."
      />

      <Card className="mb-5 p-5">
        <SectionTitle
          title="Pesos oficiales de las libertades"
          description="Los pesos y las reglas de aplicabilidad están fijados por la metodología ICA y no se editan desde aquí."
          actions={
            <Badge variant="earth">
              <Scale className="h-3 w-3" />
              38 indicadores
            </Badge>
          }
        />
        <div className="grid gap-3 sm:grid-cols-5">
          {libertades.map((libertad, indice) => (
            <div key={libertad.id} className="rounded-2xl bg-brand-50/70 p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-900/40">
                L{indice + 1}
              </p>
              <p className="mt-1 line-clamp-2 min-h-[32px] text-xs font-bold leading-snug text-brand-900/75">
                {libertad.nombre}
              </p>
              <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-ink">
                {porcentajePeso(libertad.peso)}
              </p>
              <ProgressBar value={libertad.peso * 100} color="#348d58" className="mt-1.5" />
            </div>
          ))}
        </div>
      </Card>

      <Card className="mb-5 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_260px_auto]">
          <SearchField
            value={busqueda}
            onChange={setBusqueda}
            placeholder="Buscar por nombre, número o descripción..."
          />
          <Select
            value={libertadId}
            onChange={(evento) => setLibertadId(evento.target.value)}
            aria-label="Filtrar por libertad"
          >
            <option value="">Todas las libertades</option>
            {libertades.map((libertad, indice) => (
              <option key={libertad.id} value={libertad.id}>
                L{indice + 1} · {libertad.nombre}
              </option>
            ))}
          </Select>
          <Button
            variant="ghost"
            icon={Filter}
            onClick={() => {
              setBusqueda('');
              setSearch('');
              setLibertadId('');
            }}
          >
            Limpiar
          </Button>
        </div>
      </Card>

      {cargando ? (
        <LoadingBlock label="Cargando catálogo..." />
      ) : error ? (
        <ErrorState message={error} onRetry={cargar} />
      ) : grupos.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No hay indicadores para mostrar"
          description="Ajuste la búsqueda o el filtro de libertad para encontrar indicadores."
        />
      ) : (
        <div className="space-y-6">
          {grupos.map(({ libertad, indicadores: lista }, indice) => (
            <Card key={libertad.id} className="p-5">
              <SectionTitle
                title={`L${indice + 1} · ${libertad.nombre}`}
                description={`${lista.length} indicador(es) · Peso ${porcentajePeso(libertad.peso)}`}
              />
              <div className="grid gap-3 xl:grid-cols-2">
                {lista.map((indicador) => (
                  <div
                    key={indicador.id}
                    className="rounded-2xl border border-brand-900/[0.08] bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-900 text-[11px] font-extrabold text-white">
                          {indicador.numero}
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold leading-snug text-ink">
                            {indicador.nombre}
                          </h3>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <MetodoBadge metodo={indicador.metodo_evaluacion} />
                            {indicador.solo_especie && (
                              <Badge variant={indicador.solo_especie === 'OVINO' ? 'green' : 'earth'}>
                                Solo {indicador.solo_especie.toLowerCase()}
                              </Badge>
                            )}
                            {activo(indicador.solo_ovino_lana) && (
                              <Badge variant="amber">Solo ovino de lana</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 shrink-0 px-2"
                        icon={Pencil}
                        onClick={() => abrirEditar(indicador)}
                      >
                        Editar
                      </Button>
                    </div>

                    {indicador.descripcion ? (
                      <p className="mt-3 text-[11px] leading-relaxed text-brand-900/55">
                        {indicador.descripcion}
                      </p>
                    ) : (
                      <p className="mt-3 text-[11px] italic text-brand-900/30">
                        Sin descripción registrada.
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-1">
                      {APLICABILIDADES.map((aplicabilidad) => {
                        const aplica = activo(indicador[aplicabilidad.campo]);
                        return (
                          <span
                            key={aplicabilidad.campo}
                            className={cn(
                              'rounded-full px-2 py-0.5 text-[10px] font-bold',
                              aplica
                                ? 'bg-brand-100 text-brand-800'
                                : 'bg-brand-900/[0.04] text-brand-900/25 line-through',
                            )}
                          >
                            {aplicabilidad.etiqueta}
                          </span>
                        );
                      })}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-brand-900/[0.06] pt-2.5">
                      <span className="text-[10px] font-semibold text-brand-900/40">
                        Criterios definidos: {criteriosDefinidos(indicador)}/4
                      </span>
                      <div className="flex gap-1">
                        {[100, 55, 20, 0].map((puntaje) => {
                          const campo =
                            puntaje === 100
                              ? indicador.criterio_100
                              : puntaje === 55
                                ? indicador.criterio_55
                                : puntaje === 20
                                  ? indicador.criterio_20
                                  : indicador.criterio_0;
                          return (
                            <span
                              key={puntaje}
                              className={cn(
                                'flex h-5 w-7 items-center justify-center rounded text-[9px] font-extrabold',
                                campo?.trim()
                                  ? 'bg-brand-100 text-brand-800'
                                  : 'bg-brand-900/[0.04] text-brand-900/25',
                              )}
                              title={campo?.trim() ? `Criterio ${puntaje} definido` : `Criterio ${puntaje} pendiente`}
                            >
                              {puntaje}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(editando)}
        onClose={() => setEditando(null)}
        title={editando ? `Editar indicador ${editando.numero}` : 'Editar indicador'}
        description={
          editando
            ? `${editando.nombre} · ${editando.libertad_nombre}`
            : undefined
        }
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditando(null)} disabled={guardando}>
              Cancelar
            </Button>
            <Button form="form-indicador" type="submit" loading={guardando} icon={Check}>
              Guardar cambios
            </Button>
          </>
        }
      >
        <form id="form-indicador" onSubmit={enviar} className="space-y-4">
          {formError && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold">{formError}</p>
                {formDetalles.length > 0 && (
                  <ul className="mt-1 list-inside list-disc">
                    {formDetalles.map((detalle) => (
                      <li key={detalle}>{detalle}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          <Textarea
            label="Descripción del indicador"
            value={form.descripcion}
            onChange={(evento) => setForm((actual) => ({ ...actual, descripcion: evento.target.value }))}
            rows={3}
            maxLength={3000}
            placeholder="Qué se observa, cómo se mide y qué evidencia se requiere..."
          />

          <Select
            label="Método de evaluación"
            value={form.metodo_evaluacion}
            onChange={(evento) =>
              setForm((actual) => ({
                ...actual,
                metodo_evaluacion: evento.target.value as MetodoEvaluacion,
              }))
            }
          >
            <option value="DOCUMENTAL">{ETIQUETA_METODO.DOCUMENTAL}</option>
            <option value="VISUAL">{ETIQUETA_METODO.VISUAL}</option>
            <option value="VISUAL_MUESTREO">{ETIQUETA_METODO.VISUAL_MUESTREO}</option>
          </Select>

          <div>
            <p className="field-label">Criterios de calificación</p>
            <p className="mb-3 text-[11px] leading-relaxed text-brand-900/45">
              Describa la condición observable que corresponde a cada puntaje. Estos textos se
              muestran al evaluador durante la calificación.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/50 p-3">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-emerald-800">
                    100 · Óptimo
                  </span>
                </div>
                <Textarea
                  value={form.criterio_100}
                  onChange={(evento) =>
                    setForm((actual) => ({ ...actual, criterio_100: evento.target.value }))
                  }
                  rows={3}
                  maxLength={3000}
                  placeholder="Condición ideal..."
                />
              </div>
              <div className="rounded-2xl border border-amber-200/70 bg-amber-50/50 p-3">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-amber-800">
                    55 · Aceptable
                  </span>
                </div>
                <Textarea
                  value={form.criterio_55}
                  onChange={(evento) =>
                    setForm((actual) => ({ ...actual, criterio_55: evento.target.value }))
                  }
                  rows={3}
                  maxLength={3000}
                  placeholder="Condición aceptable..."
                />
              </div>
              <div className="rounded-2xl border border-orange-200/70 bg-orange-50/50 p-3">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-orange-800">
                    20 · Bajo
                  </span>
                </div>
                <Textarea
                  value={form.criterio_20}
                  onChange={(evento) =>
                    setForm((actual) => ({ ...actual, criterio_20: evento.target.value }))
                  }
                  rows={3}
                  maxLength={3000}
                  placeholder="Condición deficiente..."
                />
              </div>
              <div className="rounded-2xl border border-red-200/70 bg-red-50/50 p-3">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-red-800">
                    0 · Crítico
                  </span>
                </div>
                <Textarea
                  value={form.criterio_0}
                  onChange={(evento) =>
                    setForm((actual) => ({ ...actual, criterio_0: evento.target.value }))
                  }
                  rows={3}
                  maxLength={3000}
                  placeholder="Condición crítica..."
                />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-[11px] leading-relaxed text-brand-900/55">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
            El número, la libertad, el peso, la especie y la aplicabilidad por sistema productivo
            están fijados por la metodología y no se modifican desde este formulario.
          </div>
        </form>
      </Modal>
    </div>
  );
}
