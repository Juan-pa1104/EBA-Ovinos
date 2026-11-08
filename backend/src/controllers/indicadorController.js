import { pool } from '../config/db.js';
import { ah } from '../utils/asyncHandler.js';

const CAMPOS_APLICABILIDAD = {
  EXTENSIVO: 'aplica_extensivo',
  SEMI_INTENSIVO: 'aplica_semi_intensivo',
  INTENSIVO: 'aplica_intensivo',
  FAMILIAR: 'aplica_familiar',
};

export function normalizarIndicador(indicador) {
  if (!indicador) return null;
  return {
    ...indicador,
    aplica_extensivo: Boolean(indicador.aplica_extensivo),
    aplica_semi_intensivo: Boolean(indicador.aplica_semi_intensivo),
    aplica_intensivo: Boolean(indicador.aplica_intensivo),
    aplica_familiar: Boolean(indicador.aplica_familiar),
    solo_ovino_lana: Boolean(indicador.solo_ovino_lana),
    libertad_peso: Number(indicador.libertad_peso ?? 0),
    criterios: [],
  };
}

function aplicaAlFiltro(indicador, { especie, sistema_productivo, es_ovino_de_lana }) {
  const campo = CAMPOS_APLICABILIDAD[sistema_productivo];
  if (campo && !indicador[campo]) return false;
  if (indicador.solo_especie && indicador.solo_especie !== especie) return false;
  if (indicador.solo_ovino_lana) {
    const esLana = especie === 'OVINO' && Boolean(es_ovino_de_lana);
    if (!esLana) return false;
  }
  return true;
}

export const listarIndicadores = ah(async (req, res) => {
  const { especie, sistema_productivo, es_ovino_de_lana } = req.query;

  const [rows] = await pool.query('SELECT * FROM indicadores ORDER BY numero ASC, id ASC');
  let resultado = rows.map(normalizarIndicador);

  if (especie && sistema_productivo) {
    resultado = resultado.filter((indicador) =>
      aplicaAlFiltro(indicador, {
        especie,
        sistema_productivo,
        es_ovino_de_lana: es_ovino_de_lana === 'true' || es_ovino_de_lana === '1',
      }),
    );
  }

  return res.json(resultado.sort((a, b) => a.numero - b.numero));
});

export const obtenerIndicadorPorId = ah(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM indicadores WHERE id = ? LIMIT 1', [req.params.id]);

  if (!rows[0]) {
    return res.status(404).json({ error: 'Indicador no encontrado' });
  }

  return res.json(normalizarIndicador(rows[0]));
});

export const actualizarIndicador = ah(async (req, res) => {
  const indicadorId = Number(req.params.id);

  const [existentes] = await pool.query('SELECT * FROM indicadores WHERE id = ? LIMIT 1', [indicadorId]);
  const actual = existentes[0];

  if (!actual) {
    return res.status(404).json({ error: 'Indicador no encontrado' });
  }

  const {
    descripcion,
    metodo_evaluacion,
    criterio_100,
    criterio_55,
    criterio_20,
    criterio_0,
  } = req.body ?? {};

  await pool.query(
    `UPDATE indicadores SET
       descripcion = ?, metodo_evaluacion = ?,
       criterio_100 = ?, criterio_55 = ?, criterio_20 = ?, criterio_0 = ?
     WHERE id = ?`,
    [
      descripcion !== undefined ? descripcion || null : actual.descripcion,
      metodo_evaluacion ?? actual.metodo_evaluacion,
      criterio_100 !== undefined ? criterio_100 || null : actual.criterio_100,
      criterio_55 !== undefined ? criterio_55 || null : actual.criterio_55,
      criterio_20 !== undefined ? criterio_20 || null : actual.criterio_20,
      criterio_0 !== undefined ? criterio_0 || null : actual.criterio_0,
      indicadorId,
    ],
  );

  const [rows] = await pool.query('SELECT * FROM indicadores WHERE id = ? LIMIT 1', [indicadorId]);
  return res.json(normalizarIndicador(rows[0]));
});

export const listarLibertades = ah(async (_req, res) => {
  const [rows] = await pool.query('SELECT id, nombre, peso FROM libertades ORDER BY id ASC');
  return res.json(rows.map((libertad) => ({ ...libertad, peso: Number(libertad.peso) })));
});
