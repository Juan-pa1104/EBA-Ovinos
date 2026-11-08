import {
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  FilePenLine,
  Gauge,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, mensajeDeError, queryString } from '../api/client';
import type { EvaluacionListado, PredioConResumen } from '../api/types';
import { EvaluacionTabla } from '../components/EvaluacionTabla';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingBlock,
  PageHeader,
  SearchField,
  Select,
  StatCard,
} from '../components/ui';
import { useAuth } from '../context/AuthContext';

export function EvaluacionesPage() {
  const { usuario } = useAuth();
  const [searchParams] = useSearchParams();
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionListado[]>([]);
  const [predios, setPredios] = useState<PredioConResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState(searchParams.get('search') ?? '');
  const [search, setSearch] = useState(busqueda);
  const [estado, setEstado] = useState(searchParams.get('estado') ?? '');
  const [predioId, setPredioId] = useState(searchParams.get('predio') ?? '');

  const esResponsable = usuario?.rol === 'RESPONSABLE';
  const puedeCrear = !esResponsable;

  useEffect(() => {
    const temporizador = window.setTimeout(() => setSearch(busqueda), 350);
    return () => window.clearTimeout(temporizador);
  }, [busqueda]);

  useEffect(() => {
    let activo = true;
    api
      .get<PredioConResumen[]>('/predios')
      .then((datos) => {
        if (activo) setPredios(datos);
      })
      .catch(() => {
        // El selector de predios es complementario; el error principal se
        // muestra al cargar las evaluaciones.
      });
    return () => {
      activo = false;
    };
  }, []);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const datos = await api.get<EvaluacionListado[]>(
        `/evaluaciones${queryString({
          search,
          estado,
          predioId: predioId || undefined,
          limit: 200,
        })}`,
      );
      setEvaluaciones(datos);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  }, [search, estado, predioId]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const resumen = useMemo(() => {
    const cerradas = evaluaciones.filter((evaluacion) => evaluacion.estado === 'CERRADA');
    const borradores = evaluaciones.filter((evaluacion) => evaluacion.estado === 'BORRADOR');
    const conPuntaje = cerradas.filter(
      (evaluacion): evaluacion is EvaluacionListado & { puntaje_total: number } =>
        evaluacion.puntaje_total !== null,
    );
    const promedio =
      conPuntaje.length > 0
        ? conPuntaje.reduce((total, evaluacion) => total + evaluacion.puntaje_total, 0) /
          conPuntaje.length
        : null;
    return { total: evaluaciones.length, cerradas: cerradas.length, borradores: borradores.length, promedio };
  }, [evaluaciones]);

  const limpiar = () => {
    setBusqueda('');
    setSearch('');
    setEstado('');
    setPredioId('');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow={esResponsable ? 'Mis resultados' : 'Evaluaciones'}
        title={esResponsable ? 'Resultados de mis predios' : 'Evaluaciones registradas'}
        subtitle={
          esResponsable
            ? 'Consulte únicamente las evaluaciones cerradas de los predios asignados a su cuenta.'
            : 'Retome borradores, consulte resultados y descargue los reportes de bienestar animal.'
        }
        actions={
          puedeCrear ? (
            <Link to="/evaluaciones/nueva">
              <Button icon={Plus}>Nueva evaluación</Button>
            </Link>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Evaluaciones"
          value={resumen.total}
          icon={ClipboardList}
          hint="Según los filtros actuales"
        />
        <StatCard
          label="Cerradas"
          value={resumen.cerradas}
          icon={CheckCircle2}
          tone="green"
          hint="Con resultado definitivo"
        />
        <StatCard
          label="Borradores"
          value={resumen.borradores}
          icon={FilePenLine}
          tone="amber"
          hint="Pendientes de cerrar"
        />
        <StatCard
          label="Promedio"
          value={resumen.promedio === null ? '—' : resumen.promedio.toFixed(2)}
          icon={Gauge}
          tone="blue"
          hint="Puntaje de evaluaciones cerradas"
        />
      </div>

      <Card className="mt-5 mb-5 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_200px_240px_auto]">
          <SearchField
            value={busqueda}
            onChange={setBusqueda}
            placeholder="Buscar por predio o municipio..."
          />
          <Select
            value={predioId}
            onChange={(evento) => setPredioId(evento.target.value)}
            aria-label="Filtrar por predio"
          >
            <option value="">Todos los predios</option>
            {predios.map((predio) => (
              <option key={predio.id} value={predio.id}>
                {predio.nombre}
              </option>
            ))}
          </Select>
          <Select
            value={estado}
            onChange={(evento) => setEstado(evento.target.value)}
            aria-label="Filtrar por estado"
          >
            <option value="">Todos los estados</option>
            {!esResponsable && <option value="BORRADOR">Borradores</option>}
            <option value="CERRADA">Cerradas</option>
          </Select>
          <Button variant="ghost" icon={SlidersHorizontal} onClick={limpiar}>
            Limpiar
          </Button>
        </div>
      </Card>

      {cargando ? (
        <LoadingBlock label="Cargando evaluaciones..." />
      ) : error ? (
        <ErrorState message={error} onRetry={cargar} />
      ) : evaluaciones.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No hay evaluaciones para mostrar"
          description={
            search || estado || predioId
              ? 'Pruebe con otros filtros de búsqueda.'
              : esResponsable
                ? 'Cuando se cierre una evaluación de sus predios, aparecerá en esta sección.'
                : 'Cree la primera evaluación desde un predio registrado.'
          }
          action={
            puedeCrear && !search && !estado && !predioId ? (
              <Link to="/evaluaciones/nueva">
                <Button icon={Plus}>Nueva evaluación</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <Card className="p-5">
          <EvaluacionTabla evaluaciones={evaluaciones} />
        </Card>
      )}
    </div>
  );
}
