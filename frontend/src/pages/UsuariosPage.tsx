import {
  AlertCircle,
  Check,
  MapPin,
  Pencil,
  Plus,
  Power,
  Search,
  ShieldCheck,
  UserCog,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { api, detallesDeError, mensajeDeError, queryString } from '../api/client';
import type { PredioConResumen, Rol, Usuario } from '../api/types';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Input,
  LoadingBlock,
  Modal,
  PageHeader,
  SearchField,
  Select,
  StatCard,
} from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ETIQUETA_ESPECIE, formatFecha } from '../lib/format';

interface FormUsuario {
  nombre: string;
  correo: string;
  password: string;
  rol: Rol;
  activo: boolean;
}

const FORM_INICIAL: FormUsuario = {
  nombre: '',
  correo: '',
  password: '',
  rol: 'RESPONSABLE',
  activo: true,
};

const ETIQUETA_ROL: Record<Rol, string> = {
  ADMIN: 'Administrador',
  EVALUADOR: 'Evaluador',
  RESPONSABLE: 'Responsable',
};

const VARIANTE_ROL: Record<Rol, 'earth' | 'blue' | 'green'> = {
  ADMIN: 'earth',
  EVALUADOR: 'blue',
  RESPONSABLE: 'green',
};

export function UsuariosPage() {
  const { usuario: usuarioActual } = useAuth();
  const { toast } = useToast();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [predios, setPredios] = useState<PredioConResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [search, setSearch] = useState('');
  const [rol, setRol] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [form, setForm] = useState<FormUsuario>(FORM_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formDetalles, setFormDetalles] = useState<string[]>([]);

  const [cambioEstado, setCambioEstado] = useState<Usuario | null>(null);
  const [procesandoEstado, setProcesandoEstado] = useState(false);

  const [asignando, setAsignando] = useState<Usuario | null>(null);
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [guardandoAsignacion, setGuardandoAsignacion] = useState(false);

  useEffect(() => {
    const temporizador = window.setTimeout(() => setSearch(busqueda), 350);
    return () => window.clearTimeout(temporizador);
  }, [busqueda]);

  const cargarPredios = useCallback(async () => {
    setPredios(await api.get<PredioConResumen[]>('/predios'));
  }, []);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const [lista, listaPredios] = await Promise.all([
        api.get<Usuario[]>(`/usuarios${queryString({ rol, search })}`),
        api.get<PredioConResumen[]>('/predios'),
      ]);
      setUsuarios(lista);
      setPredios(listaPredios);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  }, [rol, search]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const metricas = useMemo(() => {
    return {
      total: usuarios.length,
      admins: usuarios.filter((item) => item.rol === 'ADMIN').length,
      evaluadores: usuarios.filter((item) => item.rol === 'EVALUADOR').length,
      responsables: usuarios.filter((item) => item.rol === 'RESPONSABLE').length,
    };
  }, [usuarios]);

  const prediosDe = (usuarioId: number) =>
    predios.filter((predio) => predio.responsable_id === usuarioId).length;

  const abrirCrear = () => {
    setEditando(null);
    setForm(FORM_INICIAL);
    setFormError(null);
    setFormDetalles([]);
    setModalAbierto(true);
  };

  const abrirEditar = (usuario: Usuario) => {
    setEditando(usuario);
    setForm({
      nombre: usuario.nombre,
      correo: usuario.correo,
      password: '',
      rol: usuario.rol,
      activo: usuario.activo,
    });
    setFormError(null);
    setFormDetalles([]);
    setModalAbierto(true);
  };

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    setFormError(null);
    setFormDetalles([]);
    setGuardando(true);

    try {
      if (editando) {
        const payload: Record<string, unknown> = {
          nombre: form.nombre.trim(),
          correo: form.correo.trim(),
          rol: form.rol,
          activo: form.activo,
        };
        if (form.password) payload.password = form.password;
        await api.put<Usuario>(`/usuarios/${editando.id}`, payload);
        toast('Usuario actualizado correctamente.');
      } else {
        await api.post<Usuario>('/usuarios', {
          nombre: form.nombre.trim(),
          correo: form.correo.trim(),
          password: form.password,
          rol: form.rol,
          activo: form.activo,
        });
        toast('Usuario creado correctamente.');
      }
      setModalAbierto(false);
      await cargar();
    } catch (err) {
      setFormError(mensajeDeError(err));
      setFormDetalles(detallesDeError(err));
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstado = async () => {
    if (!cambioEstado) return;
    setProcesandoEstado(true);
    try {
      await api.patch<Usuario>(`/usuarios/${cambioEstado.id}/estado`, {
        activo: !cambioEstado.activo,
      });
      toast(
        cambioEstado.activo
          ? 'Usuario desactivado. Ya no podrá iniciar sesión.'
          : 'Usuario activado correctamente.',
      );
      setCambioEstado(null);
      await cargar();
    } catch (err) {
      toast(mensajeDeError(err), 'error');
      setCambioEstado(null);
    } finally {
      setProcesandoEstado(false);
    }
  };

  const abrirAsignacion = (usuario: Usuario) => {
    setAsignando(usuario);
    setSeleccionados(
      predios.filter((predio) => predio.responsable_id === usuario.id).map((predio) => predio.id),
    );
  };

  const alternarPredio = (predioId: number) => {
    setSeleccionados((actuales) =>
      actuales.includes(predioId)
        ? actuales.filter((id) => id !== predioId)
        : [...actuales, predioId],
    );
  };

  const guardarAsignacion = async () => {
    if (!asignando) return;
    setGuardandoAsignacion(true);
    try {
      await api.patch(`/usuarios/${asignando.id}/predios`, { predioIds: seleccionados });
      toast('Predios asignados correctamente.');
      setAsignando(null);
      await Promise.all([cargar(), cargarPredios()]);
    } catch (err) {
      toast(mensajeDeError(err), 'error');
    } finally {
      setGuardandoAsignacion(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Administración"
        title="Gestión de usuarios"
        subtitle="Cree usuarios, asigne roles, controle el acceso y distribuya los predios entre los responsables."
        actions={
          <Button icon={Plus} onClick={abrirCrear}>
            Nuevo usuario
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Usuarios" value={metricas.total} icon={Users} hint="Según los filtros" />
        <StatCard label="Administradores" value={metricas.admins} icon={ShieldCheck} tone="earth" hint="Acceso total" />
        <StatCard label="Evaluadores" value={metricas.evaluadores} icon={UserCog} tone="blue" hint="Registran evaluaciones" />
        <StatCard label="Responsables" value={metricas.responsables} icon={MapPin} tone="green" hint="Consulta de predios" />
      </div>

      <Card className="mt-5 mb-5 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <SearchField
            value={busqueda}
            onChange={setBusqueda}
            placeholder="Buscar por nombre o correo..."
          />
          <Select value={rol} onChange={(evento) => setRol(evento.target.value)} aria-label="Filtrar por rol">
            <option value="">Todos los roles</option>
            <option value="ADMIN">Administradores</option>
            <option value="EVALUADOR">Evaluadores</option>
            <option value="RESPONSABLE">Responsables</option>
          </Select>
          <Button
            variant="ghost"
            icon={Search}
            onClick={() => {
              setBusqueda('');
              setSearch('');
              setRol('');
            }}
          >
            Limpiar
          </Button>
        </div>
      </Card>

      {cargando ? (
        <LoadingBlock label="Cargando usuarios..." />
      ) : error ? (
        <ErrorState message={error} onRetry={cargar} />
      ) : usuarios.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No hay usuarios para mostrar"
          description="Cree el primer usuario o ajuste los filtros de búsqueda."
          action={
            !search && !rol ? (
              <Button icon={Plus} onClick={abrirCrear}>
                Nuevo usuario
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead className="table-head">
                <tr>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Predios</th>
                  <th className="px-4 py-3">Creado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/[0.06] bg-white">
                {usuarios.map((item) => {
                  const esActual = item.id === usuarioActual?.id;
                  return (
                    <tr key={item.id} className="transition hover:bg-brand-50/40">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar nombre={item.nombre} />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-ink">
                              {item.nombre}
                              {esActual && (
                                <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.08em] text-brand-500">
                                  Usted
                                </span>
                              )}
                            </p>
                            <p className="truncate text-[11px] text-brand-900/45">{item.correo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={VARIANTE_ROL[item.rol]}>{ETIQUETA_ROL[item.rol]}</Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={item.activo ? 'green' : 'red'}>
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${item.activo ? 'bg-emerald-500' : 'bg-red-500'}`}
                          />
                          {item.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-sm tabular-nums text-brand-900/60">
                        {item.rol === 'RESPONSABLE' ? (
                          <span>
                            {prediosDe(item.id)}{' '}
                            <span className="text-[11px] text-brand-900/40">asignado(s)</span>
                          </span>
                        ) : (
                          <span className="text-xs text-brand-900/30">No aplica</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-brand-900/50">{formatFecha(item.created_at)}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.rol === 'RESPONSABLE' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                              icon={MapPin}
                              onClick={() => abrirAsignacion(item)}
                              title="Asignar predios"
                            >
                              Predios
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            icon={Pencil}
                            onClick={() => abrirEditar(item)}
                            title="Editar usuario"
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 px-2 ${item.activo ? 'text-red-700 hover:bg-red-50' : 'text-emerald-700 hover:bg-emerald-50'}`}
                            icon={Power}
                            disabled={esActual}
                            onClick={() => setCambioEstado(item)}
                            title={esActual ? 'No puede desactivar su propio usuario' : undefined}
                          >
                            {item.activo ? 'Desactivar' : 'Activar'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={editando ? 'Editar usuario' : 'Nuevo usuario'}
        description={
          editando
            ? 'Actualice los datos, el rol o el estado del usuario.'
            : 'Cree una cuenta con el rol y las credenciales iniciales.'
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setModalAbierto(false)} disabled={guardando}>
              Cancelar
            </Button>
            <Button form="form-usuario" type="submit" loading={guardando} icon={Check}>
              {editando ? 'Guardar cambios' : 'Crear usuario'}
            </Button>
          </>
        }
      >
        <form id="form-usuario" onSubmit={enviar} className="space-y-4">
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

          <Input
            label="Nombre completo"
            required
            value={form.nombre}
            onChange={(evento) => setForm((actual) => ({ ...actual, nombre: evento.target.value }))}
            placeholder="Ej. María Fernanda Gómez"
            maxLength={120}
          />
          <Input
            label="Correo electrónico"
            type="email"
            required
            value={form.correo}
            onChange={(evento) => setForm((actual) => ({ ...actual, correo: evento.target.value }))}
            placeholder="usuario@entidad.gov.co"
            maxLength={160}
          />
          <Input
            label={editando ? 'Nueva contraseña (opcional)' : 'Contraseña'}
            type="password"
            required={!editando}
            value={form.password}
            onChange={(evento) => setForm((actual) => ({ ...actual, password: evento.target.value }))}
            placeholder={editando ? 'Dejar vacío para conservar la actual' : 'Mínimo 8 caracteres'}
            minLength={8}
            maxLength={100}
            hint={
              editando
                ? 'Solo se actualiza si escribe una contraseña nueva.'
                : 'La contraseña se almacena cifrada con bcrypt.'
            }
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Rol"
              value={form.rol}
              onChange={(evento) =>
                setForm((actual) => ({ ...actual, rol: evento.target.value as Rol }))
              }
              disabled={editando?.id === usuarioActual?.id}
              hint={
                editando?.id === usuarioActual?.id
                  ? 'No puede cambiar su propio rol.'
                  : 'Define los permisos dentro del sistema.'
              }
            >
              <option value="ADMIN">Administrador</option>
              <option value="EVALUADOR">Evaluador</option>
              <option value="RESPONSABLE">Responsable de predio</option>
            </Select>
            <div className="flex items-end pb-1">
              <Checkbox
                label="Usuario activo"
                description="Puede iniciar sesión y usar el sistema."
                checked={form.activo}
                disabled={editando?.id === usuarioActual?.id}
                onChange={(evento) =>
                  setForm((actual) => ({ ...actual, activo: evento.target.checked }))
                }
              />
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(cambioEstado)}
        title={cambioEstado?.activo ? 'Desactivar usuario' : 'Activar usuario'}
        description={
          cambioEstado?.activo
            ? `El usuario ${cambioEstado?.nombre ?? ''} no podrá iniciar sesión mientras esté inactivo. Sus predios y evaluaciones se conservan.`
            : `El usuario ${cambioEstado?.nombre ?? ''} podrá iniciar sesión nuevamente con sus credenciales actuales.`
        }
        confirmLabel={cambioEstado?.activo ? 'Desactivar' : 'Activar'}
        danger={cambioEstado?.activo}
        loading={procesandoEstado}
        onCancel={() => setCambioEstado(null)}
        onConfirm={() => void cambiarEstado()}
      />

      <Modal
        open={Boolean(asignando)}
        onClose={() => setAsignando(null)}
        title="Asignar predios"
        description={
          asignando
            ? `Seleccione los predios que quedarán a cargo de ${asignando.nombre}. Los predios que no seleccione se desasignarán de este usuario.`
            : undefined
        }
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setAsignando(null)} disabled={guardandoAsignacion}>
              Cancelar
            </Button>
            <Button loading={guardandoAsignacion} icon={Check} onClick={() => void guardarAsignacion()}>
              Guardar asignación
            </Button>
          </>
        }
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold text-brand-900/50">
            {seleccionados.length} de {predios.length} predio(s) seleccionado(s)
          </p>
          <div className="flex gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSeleccionados(predios.map((predio) => predio.id))}
            >
              Seleccionar todos
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSeleccionados([])}>
              Quitar todos
            </Button>
          </div>
        </div>

        {predios.length === 0 ? (
          <p className="rounded-2xl bg-brand-50 p-4 text-sm text-brand-900/55">
            No hay predios registrados. Cree predios antes de asignarlos a un responsable.
          </p>
        ) : (
          <div className="max-h-[52vh] space-y-2 overflow-y-auto pr-1">
            {predios.map((predio) => (
              <label
                key={predio.id}
                className="flex cursor-pointer items-start gap-3 rounded-2xl border border-brand-900/[0.08] bg-white p-3.5 transition hover:border-brand-500/30"
              >
                <input
                  type="checkbox"
                  checked={seleccionados.includes(predio.id)}
                  onChange={() => alternarPredio(predio.id)}
                  className="mt-0.5 h-4 w-4 rounded border-brand-900/20 accent-brand-600"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-ink">{predio.nombre}</span>
                  <span className="mt-0.5 block text-[11px] text-brand-900/45">
                    {predio.municipio} · {ETIQUETA_ESPECIE[predio.especie]} · {predio.numero_animales}{' '}
                    animales
                    {predio.responsable_id && predio.responsable_id !== asignando?.id
                      ? ` · Asignado actualmente a ${predio.responsable_nombre ?? 'otro usuario'}`
                      : ''}
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          Al guardar, los predios seleccionados se reasignan a este responsable y los no
          seleccionados que tenía asignados quedarán sin responsable.
        </div>
      </Modal>
    </div>
  );
}
