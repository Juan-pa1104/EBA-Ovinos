// ============================================================
// DATOS DE EJEMPLO - FINCAS Y EVALUACIONES
// Ejecutar con:  node src/seed-demo.js
// ============================================================
require('dotenv').config();
const { pool } = require('./db');

// Probabilidad de respuesta "buena" por evaluación (para variar las clasificaciones)
// Proyecto enfocado únicamente en OVINO (especie_id = 1)
const FINCAS = [
  { nombre: 'Finca La Esperanza',  propietario: 'Carlos Pérez',    documento: '12345678',  vereda: 'Villa Martín',  departamento_id: 1, municipio_id: 1,  sistema_productivo_id: 2, especie_id: 1, calidad: 0.95, obs: 'Predio modelo con buenas prácticas de bienestar.' },
  { nombre: 'Finca San Isidro',    propietario: 'Luisa Martínez',  documento: '55667788',  vereda: 'Pueblo Nuevo',  departamento_id: 5, municipio_id: 13, sistema_productivo_id: 3, especie_id: 1, calidad: 0.45, obs: 'Se identificaron problemas de espacio y sombra.' }
];

// Evaluaciones a generar (finca por nombre, especie, calidad, observación)
const EVALUACIONES = [
  { finca: 'Finca La Esperanza',  especie_id: 1, calidad: 0.95, obs: 'Evaluación inicial satisfactoria.' },
  { finca: 'Finca La Esperanza',  especie_id: 1, calidad: 0.80, obs: 'Seguimiento semestral.' },
  { finca: 'Finca San Isidro',    especie_id: 1, calidad: 0.45, obs: 'Requiere plan de mejoramiento urgente.' }
];

function clasificar(p) {
  if (p >= 90) return 'excelente';
  if (p >= 75) return 'alto';
  if (p >= 50) return 'medio';
  return 'bajo';
}

function generarRespuesta(ind, opciones, calidad) {
  switch (ind.tipo_respuesta) {
    case 'si_no':
      return Math.random() < calidad ? { respuesta: '100', puntaje: 100 } : { respuesta: '0', puntaje: 0 };
    case 'seleccion_unica':
    case 'seleccion_multiple': {
      if (!opciones.length) {
        const p = Math.round(calidad * 100);
        return { respuesta: String(p), puntaje: p };
      }
      const orden = [...opciones].sort((a, b) => Number(b.valor) - Number(a.valor));
      const idx = Math.min(orden.length - 1, Math.floor((1 - calidad) * orden.length));
      const o = orden[idx];
      return { respuesta: o.opcion, puntaje: Number(o.valor) };
    }
    default: { // escala, numerica
      const base = calidad * 100;
      const p = Math.max(0, Math.min(100, Math.round(base + (Math.random() * 20 - 10))));
      return { respuesta: String(p), puntaje: p };
    }
  }
}

async function main() {
  const conn = await pool.getConnection();
  try {
    console.log('\n🌱 Generando fincas y evaluaciones de ejemplo...\n');

    // 1) Fincas
    const idPorNombre = {};
    for (const f of FINCAS) {
      const [existe] = await conn.query('SELECT id FROM fincas WHERE nombre = ?', [f.nombre]);
      let fincaId;
      if (existe.length) {
        fincaId = existe[0].id;
        console.log(`   ↺ Finca ya existe: ${f.nombre} (id ${fincaId})`);
      } else {
        const [r] = await conn.query(
          `INSERT INTO fincas (nombre, propietario, documento_propietario, departamento_id, municipio_id,
             vereda, sistema_productivo_id, usuario_id)
           VALUES (?,?,?,?,?,?,?,1)`,
          [f.nombre, f.propietario, f.documento, f.departamento_id, f.municipio_id, f.vereda, f.sistema_productivo_id]
        );
        fincaId = r.insertId;
        await conn.query('INSERT INTO finca_especie (finca_id, especie_id) VALUES (?,?)', [fincaId, f.especie_id]);
        console.log(`   ✅ Finca creada: ${f.nombre} (id ${fincaId})`);
      }
      idPorNombre[f.nombre] = fincaId;
    }

    // 2) Evaluaciones
    console.log('');
    for (const ev of EVALUACIONES) {
      const fincaId = idPorNombre[ev.finca];

      // Indicadores de la especie con sus opciones
      const [indicadores] = await conn.query(
        `SELECT i.* FROM indicadores i
         JOIN criterios c ON i.criterio_id = c.id
         JOIN dimensiones d ON c.dimension_id = d.id
         WHERE d.especie_id = ? AND i.activo = TRUE ORDER BY i.orden`, [ev.especie_id]
      );
      const [opciones] = await conn.query(
        `SELECT o.* FROM opciones_respuesta o
         JOIN indicadores i ON o.indicador_id = i.id
         JOIN criterios c ON i.criterio_id = c.id
         JOIN dimensiones d ON c.dimension_id = d.id
         WHERE d.especie_id = ? ORDER BY o.orden`, [ev.especie_id]
      );

      const [rEv] = await conn.query(
        `INSERT INTO evaluaciones (finca_id, especie_id, evaluador_id, estado_id, observaciones_generales)
         VALUES (?,?,1,1,?)`, [fincaId, ev.especie_id, ev.obs]
      );
      const evaluacionId = rEv.insertId;

      for (const ind of indicadores) {
        const ops = opciones.filter(o => o.indicador_id === ind.id);
        const { respuesta, puntaje } = generarRespuesta(ind, ops, ev.calidad);
        await conn.query(
          `INSERT INTO detalle_evaluacion (evaluacion_id, indicador_id, respuesta, puntaje_obtenido, porcentaje_cumplimiento)
           VALUES (?,?,?,?,?)`,
          [evaluacionId, ind.id, respuesta, puntaje, puntaje]
        );
      }

      // Calcular con el procedimiento almacenado
      await conn.query('CALL sp_calcular_puntaje_evaluacion(?)', [evaluacionId]);
      const [[evRow]] = await conn.query('SELECT puntaje_total, clasificacion FROM evaluaciones WHERE id = ?', [evaluacionId]);
      const puntaje = Number(evRow.puntaje_total);

      // Marcar como finalizada
      await conn.query(
        `UPDATE evaluaciones SET estado_id = 3, clasificacion = ?, fecha_finalizacion = NOW() WHERE id = ?`,
        [clasificar(puntaje), evaluacionId]
      );

      console.log(`   ✅ Evaluación #${evaluacionId} · ${ev.finca} · ${indicadores.length} indicadores → ${puntaje.toFixed(1)} pts (${clasificar(puntaje)})`);
    }

    console.log('\n✅ Datos de ejemplo generados correctamente.\n');
  } catch (err) {
    console.error('\n❌ Error:', err.message, '\n');
    process.exitCode = 1;
  } finally {
    conn.release();
    await pool.end();
  }
}

main();
