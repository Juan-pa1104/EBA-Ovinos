import { pool } from '../config/db.js';
import {
  esAdmin,
  esEvaluador,
  esResponsable,
  puedeVerPredioPorId,
  puedeVerEvaluacionPorId,
  condicionPredioAutorizado,
  condicionEvaluacionAutorizada,
} from './permisos.js';
import { construirDetalle } from '../controllers/evaluacionController.js';
import { obtenerPredioCompleto } from '../controllers/predioController.js';
import { normalizarIndicador } from '../controllers/indicadorController.js';

class ErrorHerramienta extends Error {
  constructor(mensaje, codigo = 404) {
    super(mensaje);
    this.codigo = codigo;
  }
}

function clampLimite(limite, defecto = 20, maximo = 50) {
  const n = Number(limite);
  if (!Number.isFinite(n) || n <= 0) return defecto;
  return Math.min(Math.max(Math.floor(n), 1), maximo);
}

const CAMPOS_APLICABILIDAD = {
  EXTENSIVO: 'aplica_extensivo',
  SEMI_INTENSIVO: 'aplica_semi_intensivo',
  INTENSIVO: 'aplica_intensivo',
  FAMILIAR: 'aplica_familiar',
};

function aplicaAlFiltro(indicador, filtros) {
  const { especie, sistema_productivo, es_ovino_de_lana } = filtros;
  if (especie && indicador.solo_especie && indicador.solo_especie !== especie) return false;
  if (sistema_productivo) {
    const campo = CAMPOS_APLICABILIDAD[sistema_productivo];
    if (campo && !indicador[campo]) return false;
  }
  if (indicador.solo_ovino_lana) {
    const esLana = especie === 'OVINO' && Boolean(es_ovino_de_lana);
    if (!esLana) return false;
  }
  return true;
}

/**
 * Tot significa: usa solo req.usuario (JWT), nunca IDs libres del cliente para autorización.
 * Todas las consultas son parametrizadas. Ninguna herramienta escribe en BD.
 */

export async function consultarPrediosAutorizados(usuario, { busqueda, especie, sistema_productivo, limite } = {}) {
  if (!usuario) throw new ErrorHerramienta('Requiere autenticación', 401);
  const cond = condicionPredioAutorizado(usuario, 'p');
  const params = [...cond.params];
  const condiciones = [cond.sql];

  if (busqueda && String(busqueda).trim()) {
    condiciones.push('(p.nombre LIKE ? OR p.municipio LIKE ? OR p.direccion LIKE ?)');
    const q = `%${String(busqueda).trim()}%`;
    params.push(q, q, q);
  }
  if (especie) {
    const esp = ['OVINO', 'CAPRINO'].includes(especie) ? especie : null;
    if (esp) { condiciones.push('p.especie = ?'); params.push(esp); }
  }
  if (sistema_productivo) {
    const sis = ['EXTENSIVO', 'SEMI_INTENSIVO', 'INTENSIVO', 'FAMILIAR'].includes(sistema_productivo) ? sistema_productivo : null;
    if (sis) { condiciones.push('p.sistema_productivo = ?'); params.push(sis); }
  }

  const lim = clampLimite(limite, 20, 50);
  const [rows] = await pool.query(
    `SELECT p.id, p.nombre, p.municipio, p.especie, p.sistema_productivo, p.es_ovino_de_lana, p.numero_animales, p.responsable_id, p.creado_por, p.created_at
     FROM predios p
     WHERE ${condiciones.join(' AND ')}
     ORDER BY p.nombre ASC, p.id ASC
     LIMIT ?`,
    [...params, lim]
  );
  return { predios: rows, total: rows.length, limite: lim, rol: usuario.rol };
}

export async function consultarPredioDetalleAutorizado(usuario, predioId) {
  if (!usuario) throw new ErrorHerramienta('Requiere autenticación', 401);
  const idNum = Number(predioId);
  if (!Number.isFinite(idNum) || idNum <= 0) throw new ErrorHerramienta('ID de predio inválido', 400);
  const autorizado = await puedeVerPredioPorId(usuario, idNum);
  if (!autorizado) throw new ErrorHerramienta('Recurso no encontrado', 404);
  const predio = await obtenerPredioCompleto(idNum);
  if (!predio) throw new ErrorHerramienta('Recurso no encontrado', 404);
  return { predio };
}

export async function consultarEvaluacionesAutorizadas(usuario, { predioId, estado, limite } = {}) {
  if (!usuario) throw new ErrorHerramienta('Requiere autenticación', 401);
  const cond = condicionEvaluacionAutorizada(usuario, 'e', 'p');
  const params = [...cond.params];
  const condiciones = [cond.sql];

  if (predioId !== undefined && predioId !== null && predioId !== '') {
    const pid = Number(predioId);
    if (Number.isFinite(pid) && pid > 0) { condiciones.push('e.predio_id = ?'); params.push(pid); }
  }
  if (estado && ['BORRADOR', 'CERRADA'].includes(estado)) {
    condiciones.push('e.estado = ?');
    params.push(estado);
  }

  const lim = clampLimite(limite, 20, 50);
  const [rows] = await pool.query(
    `SELECT e.id, e.predio_id, e.evaluador_id, e.fecha, e.estado, e.puntaje_total, e.clasificacion, e.created_at, e.updated_at,
            p.nombre AS predio_nombre, p.especie AS predio_especie, p.sistema_productivo AS predio_sistema_productivo
     FROM evaluaciones e
     JOIN predios p ON p.id = e.predio_id
     WHERE ${condiciones.join(' AND ')}
     ORDER BY e.created_at DESC, e.id DESC
     LIMIT ?`,
    [...params, lim]
  );
  const evaluaciones = rows.map((r) => ({
    ...r,
    puntaje_total: r.puntaje_total === null ? null : Number(r.puntaje_total),
  }));
  return { evaluaciones, total: evaluaciones.length, limite: lim, rol: usuario.rol };
}

export async function consultarResultadosOficiales(usuario, evaluacionId) {
  if (!usuario) throw new ErrorHerramienta('Requiere autenticación', 401);
  const idNum = Number(evaluacionId);
  if (!Number.isFinite(idNum) || idNum <= 0) throw new ErrorHerramienta('ID de evaluación inválido', 400);

  const autorizado = await puedeVerEvaluacionPorId(usuario, idNum);
  if (!autorizado) throw new ErrorHerramienta('Recurso no encontrado', 404);

  // Reutiliza el cálculo oficial, sin duplicar
  const detalle = await construirDetalle(idNum);
  if (!detalle) throw new ErrorHerramienta('Recurso no encontrado', 404);

  return {
    evaluacion_id: detalle.id,
    estado: detalle.estado,
    predio: {
      id: detalle.predio?.id ?? null,
      nombre: detalle.predio?.nombre ?? null,
      municipio: detalle.predio?.municipio ?? null,
      especie: detalle.predio?.especie ?? null,
      sistema_productivo: detalle.predio?.sistema_productivo ?? null,
    },
    fecha: detalle.fecha,
    puntaje_total: detalle.puntaje_total === null ? null : Number(detalle.puntaje_total),
    clasificacion: detalle.clasificacion,
    resumen: detalle.resumen,
    plan_mejora: detalle.plan_mejora,
    items_count: detalle.items?.length ?? 0,
  };
}

export async function consultarIndicadores(usuario, { numero, especie, sistema_productivo, es_ovino_de_lana, limite } = {}) {
  if (!usuario) throw new ErrorHerramienta('Requiere autenticación', 401);
  if (!esAdmin(usuario) && !esEvaluador(usuario) && !esResponsable(usuario)) {
    throw new ErrorHerramienta('Requiere autenticación', 401);
  }
  const lim = clampLimite(limite, 50, 100);
  const [rows] = await pool.query(
    'SELECT * FROM indicadores ORDER BY numero ASC, id ASC LIMIT ?',
    [lim]
  );
  let resultado = rows.map(normalizarIndicador);

  if (numero !== undefined && numero !== null && numero !== '') {
    const n = Number(numero);
    if (Number.isFinite(n)) resultado = resultado.filter((i) => i.numero === n);
  }
  if (especie || sistema_productivo) {
    resultado = resultado.filter((ind) => aplicaAlFiltro(ind, {
      especie: especie || null,
      sistema_productivo: sistema_productivo || null,
      es_ovino_de_lana: es_ovino_de_lana === true || es_ovino_de_lana === 1 || es_ovino_de_lana === 'true' || es_ovino_de_lana === '1',
    }));
  }

  return {
    indicadores: resultado,
    total_catalogo: 39,
    total_devueltos: resultado.length,
    escala: ['0', '20', '55', '100'],
  };
}

export async function consultarLibertades(usuario) {
  if (!usuario) throw new ErrorHerramienta('Requiere autenticación', 401);
  const [libertades] = await pool.query('SELECT id, nombre, peso FROM libertades ORDER BY id ASC');
  const [indicadoresPorLibertad] = await pool.query(
    `SELECT l.id AS libertad_id, i.id AS indicador_id, i.numero, i.nombre AS indicador_nombre, i.metodo_evaluacion
     FROM libertades l
     LEFT JOIN indicadores i ON i.libertad_id = l.id
     ORDER BY l.id ASC, i.numero ASC`
  );
  const mapa = new Map();
  for (const l of libertades) {
    mapa.set(l.id, { id: l.id, nombre: l.nombre, peso: Number(l.peso), indicadores: [] });
  }
  for (const fila of indicadoresPorLibertad) {
    if (fila.indicador_id === null) continue;
    const entry = mapa.get(fila.libertad_id);
    if (entry) entry.indicadores.push({ id: fila.indicador_id, numero: fila.numero, nombre: fila.indicador_nombre, metodo_evaluacion: fila.metodo_evaluacion });
  }
  const lista = Array.from(mapa.values());
  const total = lista.reduce((sum, l) => sum + l.indicadores.length, 0);
  return { libertades: lista, total_indicadores: total, ponderaciones_oficiales: { L1: 0.2, L2: 0.2, L3: 0.35, L4: 0.1, L5: 0.15 } };
}

export async function analizarOportunidadesMejora(usuario, evaluacionId) {
  const resultados = await consultarResultadosOficiales(usuario, evaluacionId);
  const items = [];
  // plan_mejora ya viene ordenado por puntaje asc desde construirDetalle()
  const plan = resultados.plan_mejora ?? [];
  const prioridades = plan.map((item) => ({
    numero: item.numero,
    nombre: item.nombre,
    libertad_id: item.libertad_id,
    libertad_nombre: item.libertad_nombre,
    libertad_peso: item.libertad_peso,
    puntaje: item.puntaje,
    criterio_100: item.criterio_100,
    criterio_actual: item.criterio_actual ?? null,
    observacion: item.observacion ?? null,
  }));
  // Libertades con menor puntaje primero (solo con puntaje no nulo)
  const libertadesOrdenadas = [...(resultados.resumen?.libertades ?? [])]
    .filter((l) => l.puntaje !== null)
    .sort((a, b) => a.puntaje - b.puntaje)
    .map((l) => ({ id: l.libertad_id, nombre: l.libertad_nombre, peso: Number(l.peso), puntaje: Number(l.puntaje), calificados: l.calificados, total: l.total }));

  const conteo = {
    total_items: resultados.items_count ?? 0,
    criticos_0_20: prioridades.filter((p) => p.puntaje === 0 || p.puntaje === 20).length,
    medios_55: prioridades.filter((p) => p.puntaje === 55).length,
    optimos_100: Math.max(0, (resultados.items_count ?? 0) - prioridades.length),
  };

  return {
    evaluacion_id: resultados.evaluacion_id,
    estado: resultados.estado,
    puntaje_total: resultados.puntaje_total,
    clasificacion: resultados.clasificacion,
    predio: resultados.predio,
    libertades_ordenadas_mas_debil: libertadesOrdenadas,
    oportunidades: prioridades,
    conteo,
    nota: 'Oportunidades calculadas solo desde plan_mejora oficial de construirDetalle(); sin valores inventados.',
  };
}
