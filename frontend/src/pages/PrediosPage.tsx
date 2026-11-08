import {
  ClipboardCheck,
  Eye,
  History,
  MapPin,
  Pencil,
  Plus,
  SlidersHorizontal,
  Trash2,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, mensajeDeError, queryString } from '../api/client';
import type { PredioConResumen } from '../api/types';
import {
  Badge,
  Button,
  Card,
  ClasificacionBadge,
  BorrarPredioModal,
  EmptyState,
  ErrorState,
  LoadingBlock,
  PageHeader,
  SearchField,
  Select,
} from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { ETIQUETA_ESPECIE, ETIQUETA_SISTEMA, formatFecha } from '../lib/format';

export function PrediosPage() {
  const { usuario } = useAuth();
  const [predios, setPredios] = useState<PredioConResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [search, setSearch] = useState('');
  const [especie, setEspecie] = useState('');
  const [sistema, setSistema] = useState('');
  const [abiertoBorrar, setAbiertoBorrar] = useState(false);
  const [predioBorrar, setPredioBorrar] = useState<PredioConResumen | null>(null);
  const [borrando, setBorrando] = useState(false);

  const puedeGestionar = usuario?.rol === 'ADMIN' || usuario?.rol === 'EVALUADOR';

  useEffect(() => {
    const temporizador = window.setTimeout(() => setSearch(busqueda), 350);
    return () => window.clearTimeout(temporizador);
  }, [busqueda]);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const datos = await api.get<PredioConResumen[]>(
        `/predios${queryString({ search, especie, sistema })}`,
      );
      setPredios(datos);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  }, [search, especie, sistema]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const limpiar = () => {
    setBusqueda('');
    setSearch('');
    setEspecie('');
    setSistema('');
  };

  const pedirBorrar = (predio: PredioConResumen) => {
    setPredioBorrar(predio);
    setAbiertoBorrar(true);
  };

  const borrarPredio = async (motivo: string) => {
    if (!predioBorrar) return;
    const motivoLimpio = (motivo ?? '').trim() || 'Sin especificar';
    setAbiertoBorrar(false);
    setBorrando(true);
    try {
      await api.post(`/predios/${predioBorrar.id}/borrar`, { motivo: motivoLimpio });
      // Toast simple (sin ToastContext aquí)
      window.alert(`Predio borrado. Motivo: ${motivoLimpio}`);
      void cargar();
    } catch (err) {
      window.alert(`Error al borrar: ${mensajeDeError(err)}`);
    } finally {
      setBorrando(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Predios"
        title={usuario?.rol === 'RESPONSABLE' ? 'Mis predios' : 'Predios registrados'}
        subtitle={
          usuario?.rol === 'RESPONSABLE'
            ? 'Consulte la información de los predios asignados a su cuenta.'
            : 'Administre los predios y consulte su última clasificación de bienestar.'
        }
        actions={
          puedeGestionar ? (
            <div className="flex gap-2">
              <Link to="/predios/borrados">
                <Button variant="outline" icon={History}>
                  Historial de borrados
                </Button>
              </Link>
              <Link to="/predios/nuevo">
                <Button icon={Plus}>Nuevo predio</Button>
              </Link>
            </div>
          ) : undefined
        }
      />

      <Card className="mb-5 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_190px_190px_auto]">
          <SearchField
            value={busqueda}
            onChange={setBusqueda}
            placeholder="Buscar por nombre o municipio..."
          />
          <Select value={especie} onChange={(evento) => setEspecie(evento.target.value)} aria-label="Filtrar por especie">
            <option value="">Todas las especies</option>
            <option value="OVINO">Ovinos</option>
            <option value="CAPRINO">Caprinos</option>
          </Select>
          <Select value={sistema} onChange={(evento) => setSistema(evento.target.value)} aria-label="Filtrar por sistema">
            <option value="">Todos los sistemas</option>
            <option value="EXTENSIVO">Extensivo</option>
            <option value="SEMI_INTENSIVO">Semi intensivo</option>
            <option value="INTENSIVO">Intensivo</option>
            <option value="FAMILIAR">Familiar</option>
          </Select>
          <Button variant="ghost" icon={SlidersHorizontal} onClick={limpiar}>
            Limpiar
          </Button>
        </div>
      </Card>

      {cargando ? (
        <LoadingBlock label="Cargando predios..." />
      ) : error ? (
        <ErrorState message={error} onRetry={cargar} />
      ) : predios.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No hay predios para mostrar"
          description={
            search || especie || sistema
              ? 'Pruebe con otros filtros de búsqueda.'
              : 'Registre el primer predio para comenzar una evaluación.'
          }
          action={
            puedeGestionar && !search && !especie && !sistema ? (
              <Link to="/predios/nuevo">
                <Button icon={Plus}>Registrar predio</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <p className="mb-3 text-xs font-semibold text-brand-900/45">
            {predios.length} predio(s) encontrado(s)
          </p>

          <div className="hidden overflow-hidden rounded-2xl border border-brand-900/[0.07] md:block">
            <table className="w-full border-collapse text-left">
              <thead className="table-head">
                <tr>
                  <th className="px-4 py-3">Predio</th>
                  <th className="px-4 py-3">Especie / sistema</th>
                  <th className="px-4 py-3">Animales</th>
                  <th className="px-4 py-3">Responsable</th>
                  <th className="px-4 py-3">Última evaluación</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/[0.06] bg-white">
                {predios.map((predio) => (
                  <tr key={predio.id} className="transition hover:bg-brand-50/40">
                    <td className="px-4 py-3.5">
                      <Link to={`/predios/${predio.id}`} className="text-sm font-bold text-ink hover:text-brand-700">
                        {predio.nombre}
                      </Link>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-brand-900/40">
                        <MapPin className="h-3 w-3" />
                        {predio.municipio}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant={predio.especie === 'OVINO' ? 'green' : 'earth'}>
                          {ETIQUETA_ESPECIE[predio.especie]}
                          {predio.especie === 'OVINO' && predio.es_ovino_de_lana ? ' · lana' : ''}
                        </Badge>
                        <Badge variant="outline">{ETIQUETA_SISTEMA[predio.sistema_productivo]}</Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm tabular-nums text-brand-900/65">
                      {predio.numero_animales}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-brand-900/65">
                      {predio.responsable_nombre ?? (
                        <span className="text-xs font-semibold text-amber-700">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <ClasificacionBadge clasificacion={predio.ultima_clasificacion} />
                      {predio.ultima_fecha && (
                        <p className="mt-1 text-[11px] text-brand-900/40">{formatFecha(predio.ultima_fecha)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/predios/${predio.id}`}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 text-[11px] font-bold text-brand-800 transition hover:bg-brand-100"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Ver
                        </Link>
                        {puedeGestionar && (
                          <>
                            <Link
                              to={`/evaluaciones/nueva?predio=${predio.id}`}
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand-100 px-2.5 text-[11px] font-bold text-brand-800 transition hover:bg-brand-200"
                            >
                              <ClipboardCheck className="h-3.5 w-3.5" />
                              Evaluar
                            </Link>
                            <Link
                              to={`/predios/${predio.id}/editar`}
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-bold text-brand-700 transition hover:bg-brand-50"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Editar
                            </Link>
                            <button
                              type="button"
                              onClick={() => pedirBorrar(predio)}
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-red-50 px-2.5 text-[11px] font-bold text-red-700 transition hover:bg-red-100"
                              aria-label="Borrar predio"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Borrar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {predios.map((predio) => (
              <Card key={predio.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link to={`/predios/${predio.id}`} className="text-sm font-bold text-ink">
                      {predio.nombre}
                    </Link>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-brand-900/45">
                      <MapPin className="h-3 w-3" />
                      {predio.municipio}
                    </p>
                  </div>
                  <ClasificacionBadge clasificacion={predio.ultima_clasificacion} />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge variant={predio.especie === 'OVINO' ? 'green' : 'earth'}>
                    {ETIQUETA_ESPECIE[predio.especie]}
                  </Badge>
                  <Badge variant="outline">{ETIQUETA_SISTEMA[predio.sistema_productivo]}</Badge>
                  <Badge variant="neutral">{predio.numero_animales} animales</Badge>
                </div>
                <p className="mt-2.5 flex items-center gap-1.5 text-[11px] text-brand-900/45">
                  <Users className="h-3 w-3" />
                  {predio.responsable_nombre ?? 'Sin responsable asignado'}
                </p>
                <div className="mt-3 flex gap-2 border-t border-brand-900/[0.06] pt-3">
                  <Link
                    to={`/predios/${predio.id}`}
                    className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-50 text-xs font-bold text-brand-800"
                  >
                    <Eye className="h-4 w-4" />
                    Ver predio
                  </Link>
                  {puedeGestionar && (
                    <>
                      <Link
                        to={`/evaluaciones/nueva?predio=${predio.id}`}
                        className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-100 text-xs font-bold text-brand-800"
                      >
                        <ClipboardCheck className="h-4 w-4" />
                        Evaluar
                      </Link>
                      <button
                        type="button"
                        onClick={() => pedirBorrar(predio)}
                        className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-50 text-xs font-bold text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Borrar
                      </button>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <BorrarPredioModal
        open={abiertoBorrar}
        onClose={() => setAbiertoBorrar(false)}
        loading={borrando}
        title="Borrar predio"
        description="El motivo es obligatorio y quedará guardado en el registro de predios borrados. El predio se eliminará permanentemente."
        confirmLabel="Borrar predio"
        extraInfo={
          predioBorrar
            ? `El predio ${predioBorrar.nombre} (${predioBorrar.municipio}) se eliminará de la lista. ${predioBorrar.total_evaluaciones > 0 ? 'Si tiene evaluaciones asociadas, el sistema bloqueará el borrado.' : ''}`
            : undefined
        }
        onConfirm={(motivo) => void borrarPredio(motivo)}
      />
    </div>
  );
}
