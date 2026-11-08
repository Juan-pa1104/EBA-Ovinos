import {
  AlertCircle,
  ArrowLeft,
  Info,
  Mountain,
  PawPrint,
  Save,
  Trash2,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, detallesDeError, mensajeDeError } from '../api/client';
import type {
  Especie,
  PredioConResumen,
  ResponsableOption,
  SistemaProductivo,
} from '../api/types';
import {
  Button,
  Card,
  Checkbox,
  ConfirmDialog,
  ErrorState,
  Input,
  LoadingBlock,
  PageHeader,
  SectionTitle,
  Select,
} from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { cn } from '../lib/format';

interface FormPredio {
  nombre: string;
  municipio: string;
  direccion: string;
  especie: Especie;
  sistema_productivo: SistemaProductivo;
  es_ovino_de_lana: boolean;
  numero_animales: number;
  responsable_id: number | null;
}

const FORM_INICIAL: FormPredio = {
  nombre: '',
  municipio: '',
  direccion: '',
  especie: 'OVINO',
  sistema_productivo: 'SEMI_INTENSIVO',
  es_ovino_de_lana: false,
  numero_animales: 1,
  responsable_id: null,
};

const SISTEMAS: Array<{ valor: SistemaProductivo; titulo: string; detalle: string }> = [
  { valor: 'EXTENSIVO', titulo: 'Extensivo', detalle: 'Pastoreo en potreros, baja infraestructura.' },
  { valor: 'SEMI_INTENSIVO', titulo: 'Semi intensivo', detalle: 'Pastoreo con suplementación y corrales.' },
  { valor: 'INTENSIVO', titulo: 'Intensivo', detalle: 'Confinamiento permanente o alta suplementación.' },
  { valor: 'FAMILIAR', titulo: 'Familiar', detalle: 'Producción de traspatio o pequeña escala.' },
];

export function PredioFormPage() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { toast } = useToast();

  const [form, setForm] = useState<FormPredio>(FORM_INICIAL);
  const [responsables, setResponsables] = useState<ResponsableOption[]>([]);
  const [cargando, setCargando] = useState(editando);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detalles, setDetalles] = useState<string[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      setCargando(editando);
      setErrorCarga(null);
      try {
        const [listaResponsables, predio] = await Promise.all([
          api.get<ResponsableOption[]>('/usuarios/responsables'),
          editando ? api.get<PredioConResumen>(`/predios/${id}`) : Promise.resolve(null),
        ]);

        if (!activo) return;
        setResponsables(listaResponsables);

        if (predio) {
          setForm({
            nombre: predio.nombre,
            municipio: predio.municipio,
            direccion: predio.direccion ?? '',
            especie: predio.especie,
            sistema_productivo: predio.sistema_productivo,
            es_ovino_de_lana: predio.es_ovino_de_lana,
            numero_animales: predio.numero_animales,
            responsable_id: predio.responsable_id,
          });
        }
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
  }, [editando, id]);

  const actualizar = <K extends keyof FormPredio>(campo: K, valor: FormPredio[K]) => {
    setForm((actual) => ({ ...actual, [campo]: valor }));
  };

  const cambiarEspecie = (especie: Especie) => {
    setForm((actual) => ({
      ...actual,
      especie,
      es_ovino_de_lana: especie === 'OVINO' ? actual.es_ovino_de_lana : false,
    }));
  };

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    setError(null);
    setDetalles([]);
    setGuardando(true);

    try {
      const payload = {
        nombre: form.nombre.trim(),
        municipio: form.municipio.trim(),
        direccion: form.direccion.trim() || null,
        especie: form.especie,
        sistema_productivo: form.sistema_productivo,
        es_ovino_de_lana: form.especie === 'OVINO' ? form.es_ovino_de_lana : false,
        numero_animales: Number(form.numero_animales),
        responsable_id: form.responsable_id,
      };

      const guardado = editando
        ? await api.put<PredioConResumen>(`/predios/${id}`, payload)
        : await api.post<PredioConResumen>('/predios', payload);

      toast(editando ? 'Predio actualizado correctamente.' : 'Predio registrado correctamente.');
      navigate(`/predios/${guardado.id}`);
    } catch (err) {
      setError(mensajeDeError(err));
      setDetalles(detallesDeError(err));
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    setEliminando(true);
    try {
      await api.delete(`/predios/${id}`);
      toast('Predio eliminado correctamente.');
      navigate('/predios');
    } catch (err) {
      toast(mensajeDeError(err), 'error');
      setConfirmarEliminar(false);
    } finally {
      setEliminando(false);
    }
  };

  if (cargando) return <LoadingBlock label="Cargando predio..." />;
  if (errorCarga) {
    return (
      <ErrorState
        message={errorCarga}
        onRetry={() => {
          setErrorCarga(null);
          setCargando(true);
          window.location.reload();
        }}
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow={editando ? 'Editar predio' : 'Nuevo predio'}
        title={editando ? form.nombre || 'Editar predio' : 'Registrar predio'}
        subtitle="La especie y el sistema productivo determinan los indicadores que se evaluarán."
        actions={
          <Link to={editando ? `/predios/${id}` : '/predios'}>
            <Button variant="outline" icon={ArrowLeft}>
              Volver
            </Button>
          </Link>
        }
      />

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

      <form onSubmit={enviar} className="grid gap-5 lg:grid-cols-[1fr_370px]">
        <div className="space-y-5">
          <Card className="p-5">
            <SectionTitle
              title="Identificación del predio"
              description="Datos generales para ubicar y reconocer el predio en campo."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  label="Nombre del predio"
                  required
                  value={form.nombre}
                  onChange={(evento) => actualizar('nombre', evento.target.value)}
                  placeholder="Ej. Predio La Esperanza"
                  maxLength={150}
                />
              </div>
              <Input
                label="Municipio"
                required
                value={form.municipio}
                onChange={(evento) => actualizar('municipio', evento.target.value)}
                placeholder="Ej. Villa de Leyva"
                maxLength={120}
              />
              <Input
                label="Dirección o vereda (opcional)"
                value={form.direccion}
                onChange={(evento) => actualizar('direccion', evento.target.value)}
                placeholder="Ej. Vereda Rupavita, km 3"
                maxLength={200}
              />
            </div>
          </Card>

          <Card className="p-5">
            <SectionTitle
              title="Especie"
              description="El sistema filtra automáticamente los indicadores según la especie."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  {
                    valor: 'OVINO' as Especie,
                    titulo: 'Ovino',
                    detalle: 'Incluye indicadores de descole y, si aplica, de lana.',
                    Icono: PawPrint,
                  },
                  {
                    valor: 'CAPRINO' as Especie,
                    titulo: 'Caprino',
                    detalle: 'Incluye el indicador de topizado y descorne.',
                    Icono: Mountain,
                  },
                ] as const
              ).map((opcion) => {
                const activo = form.especie === opcion.valor;
                return (
                  <button
                    key={opcion.valor}
                    type="button"
                    onClick={() => cambiarEspecie(opcion.valor)}
                    className={cn(
                      'focus-ring flex items-start gap-3 rounded-2xl border p-4 text-left transition',
                      activo
                        ? 'border-brand-500 bg-brand-50 ring-4 ring-brand-500/10'
                        : 'border-brand-900/10 bg-white hover:border-brand-500/30',
                    )}
                    aria-pressed={activo}
                  >
                    <span
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                        activo ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-700',
                      )}
                    >
                      <opcion.Icono className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-ink">{opcion.titulo}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-brand-900/50">
                        {opcion.detalle}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4">
              {form.especie === 'OVINO' ? (
                <Checkbox
                  label="Es ovino de lana"
                  description="Activa indicadores específicos como la suciedad del tren posterior."
                  checked={form.es_ovino_de_lana}
                  onChange={(evento) => actualizar('es_ovino_de_lana', evento.target.checked)}
                />
              ) : (
                <div className="flex items-start gap-2.5 rounded-2xl bg-earth-50 p-3.5 text-xs leading-relaxed text-earth-800">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  La condición de ovino de lana no aplica para caprinos. Los indicadores se ajustarán
                  automáticamente.
                </div>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <SectionTitle
              title="Sistema productivo"
              description="Determina la aplicabilidad de indicadores de instalaciones y manejo."
            />
            <div className="grid gap-2.5 sm:grid-cols-2">
              {SISTEMAS.map((sistema) => {
                const activo = form.sistema_productivo === sistema.valor;
                return (
                  <button
                    key={sistema.valor}
                    type="button"
                    onClick={() => actualizar('sistema_productivo', sistema.valor)}
                    className={cn(
                      'focus-ring rounded-2xl border p-3.5 text-left transition',
                      activo
                        ? 'border-brand-500 bg-brand-50 ring-4 ring-brand-500/10'
                        : 'border-brand-900/10 bg-white hover:border-brand-500/30',
                    )}
                    aria-pressed={activo}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-ink">{sistema.titulo}</span>
                      <span
                        className={cn(
                          'h-2.5 w-2.5 rounded-full',
                          activo ? 'bg-brand-600' : 'bg-brand-900/15',
                        )}
                      />
                    </span>
                    <span className="mt-1 block text-[11px] leading-relaxed text-brand-900/50">
                      {sistema.detalle}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5 lg:sticky lg:top-6">
            <SectionTitle
              title="Datos de manejo"
              description="Información utilizada en la evaluación y el reporte."
            />
            <div className="space-y-4">
              <Input
                label="Número de animales"
                type="number"
                min={1}
                max={10_000_000}
                required
                value={form.numero_animales}
                onChange={(evento) =>
                  actualizar('numero_animales', Number(evento.target.value) || 0)
                }
              />
              <Select
                label="Responsable del predio"
                value={form.responsable_id ?? ''}
                onChange={(evento) =>
                  actualizar(
                    'responsable_id',
                    evento.target.value ? Number(evento.target.value) : null,
                  )
                }
                hint="El responsable podrá consultar únicamente sus predios y evaluaciones cerradas."
              >
                <option value="">Sin asignar</option>
                {responsables.map((responsable) => (
                  <option key={responsable.id} value={responsable.id}>
                    {responsable.nombre} · {responsable.correo}
                  </option>
                ))}
              </Select>

              {responsables.length === 0 && (
                <p className="rounded-xl bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-800">
                  No hay responsables activos. El administrador puede crearlos desde la sección
                  Usuarios y asignar el predio después.
                </p>
              )}

              <div className="rounded-2xl bg-brand-50/70 p-3.5 text-[11px] leading-relaxed text-brand-900/60">
                <p className="font-bold text-brand-800">Resumen de configuración</p>
                <p className="mt-1">
                  {form.especie === 'OVINO' ? 'Ovino' : 'Caprino'}
                  {form.especie === 'OVINO' && form.es_ovino_de_lana ? ' de lana' : ''} ·{' '}
                  {SISTEMAS.find((sistema) => sistema.valor === form.sistema_productivo)?.titulo}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 border-t border-brand-900/[0.07] pt-4">
              <Button type="submit" size="lg" loading={guardando} icon={Save} className="w-full">
                {editando ? 'Guardar cambios' : 'Registrar predio'}
              </Button>
              <Link to={editando ? `/predios/${id}` : '/predios'}>
                <Button variant="ghost" className="w-full" disabled={guardando}>
                  Cancelar
                </Button>
              </Link>
            </div>
          </Card>

          {editando && usuario?.rol === 'ADMIN' && (
            <Card className="border-red-100 p-5">
              <SectionTitle
                title="Zona de riesgo"
                description="Solo se pueden eliminar predios sin evaluaciones asociadas."
              />
              <Button
                variant="outline"
                icon={Trash2}
                className="w-full border-red-200 text-red-700 hover:bg-red-50"
                onClick={() => setConfirmarEliminar(true)}
              >
                Eliminar predio
              </Button>
            </Card>
          )}
        </div>
      </form>

      <ConfirmDialog
        open={confirmarEliminar}
        title="Eliminar predio"
        description="Esta acción no se puede deshacer. Si el predio tiene evaluaciones asociadas, el sistema no permitirá eliminarlo."
        confirmLabel="Eliminar"
        danger
        loading={eliminando}
        onCancel={() => setConfirmarEliminar(false)}
        onConfirm={eliminar}
      />
    </div>
  );
}
