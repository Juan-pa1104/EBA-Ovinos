import { pool } from '../config/db.js';
import {
  LIBERTADES,
  USUARIOS_SEED,
  PREDIO_SEED,
  INDICADORES_SEED,
  INDICADORES_ESPECIALES,
} from './seed.js';

/**
 * Puebla la base de datos MariaDB con los datos iniciales.
 * Vacía las tablas antes de insertar para poder ejecutarlo varias veces.
 */
export async function ejecutarSeed() {
  const conn = await pool.getConnection();
  try {
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    await conn.query('TRUNCATE TABLE recomendaciones_ia');
    await conn.query('TRUNCATE TABLE item_evaluacion');
    await conn.query('TRUNCATE TABLE evaluaciones');
    await conn.query('TRUNCATE TABLE predios');
    await conn.query('TRUNCATE TABLE indicadores');
    await conn.query('TRUNCATE TABLE usuarios');
    await conn.query('TRUNCATE TABLE libertades');
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    for (const l of LIBERTADES) {
      await conn.query('INSERT INTO libertades (id, nombre, peso) VALUES (?, ?, ?)', [
        l.id,
        l.nombre,
        l.peso,
      ]);
    }

    for (const u of USUARIOS_SEED) {
      await conn.query(
        'INSERT INTO usuarios (id, nombre, correo, password, rol, activo) VALUES (?, ?, ?, ?, ?, ?)',
        [u.id, u.nombre, u.correo, u.password, u.rol, u.activo ? 1 : 0],
      );
    }

    for (const p of PREDIO_SEED) {
      await conn.query(
        `INSERT INTO predios
          (id, nombre, municipio, direccion, especie, sistema_productivo, es_ovino_de_lana,
           numero_animales, responsable_id, creado_por)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.id,
          p.nombre,
          p.municipio,
          p.direccion,
          p.especie,
          p.sistema_productivo,
          p.es_ovino_de_lana ? 1 : 0,
          p.numero_animales,
          p.responsable_id,
          p.creado_por,
        ],
      );
    }

    const todosIndicadores = [...INDICADORES_SEED, ...INDICADORES_ESPECIALES];
    for (const i of todosIndicadores) {
      await conn.query(
        `INSERT INTO indicadores
          (id, numero, libertad_id, nombre, descripcion, metodo_evaluacion,
           aplica_extensivo, aplica_semi_intensivo, aplica_intensivo, aplica_familiar,
           solo_especie, solo_ovino_lana, criterio_100, criterio_55, criterio_20, criterio_0,
           libertad_nombre, libertad_peso)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          i.id,
          i.numero,
          i.libertad_id,
          i.nombre,
          i.descripcion,
          i.metodo_evaluacion,
          i.aplica_extensivo ? 1 : 0,
          i.aplica_semi_intensivo ? 1 : 0,
          i.aplica_intensivo ? 1 : 0,
          i.aplica_familiar ? 1 : 0,
          i.solo_especie,
          i.solo_ovino_lana ? 1 : 0,
          i.criterio_100,
          i.criterio_55,
          i.criterio_20,
          i.criterio_0,
          i.libertad_nombre,
          i.libertad_peso,
        ],
      );
    }

    console.log('✅ Seed ejecutado correctamente');
  } catch (error) {
    console.error('❌ Error ejecutando seed:', error.message);
    throw error;
  } finally {
    conn.release();
  }
}
