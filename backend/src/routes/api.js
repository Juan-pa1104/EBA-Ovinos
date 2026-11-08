const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// ============================================================
// UTILIDADES
// ============================================================
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function ok(res, data, meta) {
    res.json({ ok: true, data, ...(meta ? { meta } : {}) });
}
function fail(res, status, message) {
    res.status(status).json({ ok: false, error: message });
}

function clasificar(puntaje) {
    if (puntaje >= 90) return 'excelente';
    if (puntaje >= 75) return 'alto';
    if (puntaje >= 50) return 'medio';
    return 'bajo';
}

// ============================================================
// HEALTH
// ============================================================
router.get('/health', asyncHandler(async (req, res) => {
    const [rows] = await pool.query('SELECT 1 AS ok');
    ok(res, { status: 'up', db: rows[0].ok === 1, timestamp: new Date().toISOString() });
}));

// ============================================================
// CATÁLOGOS
// ============================================================
router.get('/especies', asyncHandler(async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM especies WHERE activo = TRUE ORDER BY id');
    ok(res, rows);
}));

router.get('/departamentos', asyncHandler(async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM departamentos WHERE activo = TRUE ORDER BY nombre');
    ok(res, rows);
}));

router.get('/municipios', asyncHandler(async (req, res) => {
    const { departamento_id } = req.query;
    let sql = 'SELECT * FROM municipios WHERE activo = TRUE';
    const params = [];
    if (departamento_id) { sql += ' AND departamento_id = ?'; params.push(departamento_id); }
    sql += ' ORDER BY nombre';
    const [rows] = await pool.query(sql, params);
    ok(res, rows);
}));

router.get('/sistemas-productivos', asyncHandler(async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM sistemas_productivos WHERE activo = TRUE ORDER BY id');
    ok(res, rows);
}));

router.get('/estados-evaluacion', asyncHandler(async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM estados_evaluacion ORDER BY id');
    ok(res, rows);
}));

router.get('/roles', asyncHandler(async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM roles ORDER BY id');
    ok(res, rows);
}));

// ============================================================
// PARAMETRIZACIÓN JERÁRQUICA (Dimensiones → Criterios → Indicadores)
// ============================================================
router.get('/parametrizacion/:especieId', asyncHandler(async (req, res) => {
    const { especieId } = req.params;
    const [dimensiones] = await pool.query(
        'SELECT * FROM dimensiones WHERE especie_id = ? AND activo = TRUE ORDER BY orden', [especieId]
    );
    const [criterios] = await pool.query(
        `SELECT c.* FROM criterios c
         JOIN dimensiones d ON c.dimension_id = d.id
         WHERE d.especie_id = ? AND c.activo = TRUE ORDER BY c.orden`, [especieId]
    );
    const [indicadores] = await pool.query(
        `SELECT i.* FROM indicadores i
         JOIN criterios c ON i.criterio_id = c.id
         JOIN dimensiones d ON c.dimension_id = d.id
         WHERE d.especie_id = ? AND i.activo = TRUE ORDER BY i.orden`, [especieId]
    );
    const [opciones] = await pool.query(
        `SELECT o.* FROM opciones_respuesta o
         JOIN indicadores i ON o.indicador_id = i.id
         JOIN criterios c ON i.criterio_id = c.id
         JOIN dimensiones d ON c.dimension_id = d.id
         WHERE d.especie_id = ? ORDER BY o.orden`, [especieId]
    );

    const jerarquia = dimensiones.map(d => ({
        ...d,
        criterios: criterios.filter(c => c.dimension_id === d.id).map(c => ({
            ...c,
            indicadores: indicadores.filter(i => i.criterio_id === c.id).map(i => ({
                ...i,
                opciones: opciones.filter(o => o.indicador_id === i.id)
            }))
        }))
    }));

    ok(res, jerarquia, {
        total_dimensiones: dimensiones.length,
        total_criterios: criterios.length,
        total_indicadores: indicadores.length
    });
}));

// ============================================================
// FINCAS (CRUD)
// ============================================================
router.get('/fincas', asyncHandler(async (req, res) => {
    const { q, departamento_id, sistema_productivo_id, especie_id } = req.query;
    let sql = `
        SELECT f.*, d.nombre AS departamento, m.nombre AS municipio,
               sp.nombre AS sistema_productivo, u.nombre AS encargado
        FROM fincas f
        JOIN departamentos d ON f.departamento_id = d.id
        JOIN municipios m ON f.municipio_id = m.id
        JOIN sistemas_productivos sp ON f.sistema_productivo_id = sp.id
        JOIN usuarios u ON f.usuario_id = u.id
        WHERE f.activo = TRUE`;
    const params = [];
    if (especie_id) {
        sql += ` AND f.id IN (SELECT finca_id FROM finca_especie WHERE especie_id = ? AND activo = TRUE)`;
        params.push(especie_id);
    }
    if (q) { sql += ' AND f.nombre LIKE ?'; params.push(`%${q}%`); }
    if (departamento_id) { sql += ' AND f.departamento_id = ?'; params.push(departamento_id); }
    if (sistema_productivo_id) { sql += ' AND f.sistema_productivo_id = ?'; params.push(sistema_productivo_id); }
    sql += ' ORDER BY f.created_at DESC';
    const [rows] = await pool.query(sql, params);
    ok(res, rows);
}));

router.get('/fincas/:id', asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
        `SELECT f.*, d.nombre AS departamento, m.nombre AS municipio,
                sp.nombre AS sistema_productivo
         FROM fincas f
         JOIN departamentos d ON f.departamento_id = d.id
         JOIN municipios m ON f.municipio_id = m.id
         JOIN sistemas_productivos sp ON f.sistema_productivo_id = sp.id
         WHERE f.id = ?`, [req.params.id]
    );
    if (!rows.length) return fail(res, 404, 'Finca no encontrada');
    const [especies] = await pool.query(
        `SELECT e.* FROM finca_especie fe JOIN especies e ON fe.especie_id = e.id
         WHERE fe.finca_id = ? AND fe.activo = TRUE`, [req.params.id]
    );
    const [inventario] = await pool.query(
        'SELECT * FROM inventario_animal WHERE finca_id = ? ORDER BY fecha_registro DESC', [req.params.id]
    );
    ok(res, { ...rows[0], especies, inventario });
}));

router.post('/fincas', asyncHandler(async (req, res) => {
    const {
        nombre, propietario, documento_propietario, departamento_id, municipio_id,
        vereda, direccion, latitud, longitud, sistema_productivo_id, usuario_id = 1,
        especies = []
    } = req.body;

    if (!nombre || !propietario || !departamento_id || !municipio_id || !sistema_productivo_id) {
        return fail(res, 400, 'Campos obligatorios: nombre, propietario, departamento_id, municipio_id, sistema_productivo_id');
    }

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const [result] = await conn.query(
            `INSERT INTO fincas (nombre, propietario, documento_propietario, departamento_id, municipio_id,
                vereda, direccion, latitud, longitud, sistema_productivo_id, usuario_id)
             VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
            [nombre, propietario, documento_propietario || null, departamento_id, municipio_id,
             vereda || null, direccion || null, latitud || null, longitud || null, sistema_productivo_id, usuario_id]
        );
        const fincaId = result.insertId;
        for (const esp of especies) {
            await conn.query('INSERT INTO finca_especie (finca_id, especie_id) VALUES (?,?)', [fincaId, esp]);
        }
        await conn.commit();
        ok(res, { id: fincaId }, { message: 'Finca registrada correctamente' });
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}));

router.put('/fincas/:id', asyncHandler(async (req, res) => {
    const {
        nombre, propietario, documento_propietario, departamento_id, municipio_id,
        vereda, direccion, latitud, longitud, sistema_productivo_id
    } = req.body;
    const [result] = await pool.query(
        `UPDATE fincas SET nombre=?, propietario=?, documento_propietario=?, departamento_id=?,
            municipio_id=?, vereda=?, direccion=?, latitud=?, longitud=?, sistema_productivo_id=?
         WHERE id=?`,
        [nombre, propietario, documento_propietario || null, departamento_id, municipio_id,
         vereda || null, direccion || null, latitud || null, longitud || null, sistema_productivo_id, req.params.id]
    );
    if (!result.affectedRows) return fail(res, 404, 'Finca no encontrada');
    ok(res, { id: Number(req.params.id) }, { message: 'Finca actualizada' });
}));

router.delete('/fincas/:id', asyncHandler(async (req, res) => {
    const [result] = await pool.query('UPDATE fincas SET activo = FALSE WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return fail(res, 404, 'Finca no encontrada');
    ok(res, { id: Number(req.params.id) }, { message: 'Finca inactivada' });
}));

// ============================================================
// EVALUACIONES
// ============================================================
router.get('/evaluaciones', asyncHandler(async (req, res) => {
    const { finca_id, especie_id, estado_id } = req.query;
    let sql = `
        SELECT ev.*, f.nombre AS finca, e.nombre AS especie, ee.nombre AS estado,
               u.nombre AS evaluador
        FROM evaluaciones ev
        JOIN fincas f ON ev.finca_id = f.id
        JOIN especies e ON ev.especie_id = e.id
        JOIN estados_evaluacion ee ON ev.estado_id = ee.id
        JOIN usuarios u ON ev.evaluador_id = u.id
        WHERE 1=1`;
    const params = [];
    if (finca_id) { sql += ' AND ev.finca_id = ?'; params.push(finca_id); }
    if (especie_id) { sql += ' AND ev.especie_id = ?'; params.push(especie_id); }
    if (estado_id) { sql += ' AND ev.estado_id = ?'; params.push(estado_id); }
    sql += ' ORDER BY ev.fecha_inicio DESC';
    const [rows] = await pool.query(sql, params);
    ok(res, rows);
}));

router.get('/evaluaciones/:id', asyncHandler(async (req, res) => {
    const [ev] = await pool.query(
        `SELECT ev.*, f.nombre AS finca, e.nombre AS especie, ee.nombre AS estado
         FROM evaluaciones ev
         JOIN fincas f ON ev.finca_id = f.id
         JOIN especies e ON ev.especie_id = e.id
         JOIN estados_evaluacion ee ON ev.estado_id = ee.id
         WHERE ev.id = ?`, [req.params.id]
    );
    if (!ev.length) return fail(res, 404, 'Evaluación no encontrada');
    const [detalle] = await pool.query(
        `SELECT de.*, i.nombre AS indicador, i.metodo_evaluacion, i.peso
         FROM detalle_evaluacion de
         JOIN indicadores i ON de.indicador_id = i.id
         WHERE de.evaluacion_id = ?`, [req.params.id]
    );
    const [diagnostico] = await pool.query('SELECT * FROM diagnosticos WHERE evaluacion_id = ?', [req.params.id]);
    const [recomendaciones] = await pool.query('SELECT * FROM recomendaciones WHERE evaluacion_id = ?', [req.params.id]);
    ok(res, { ...ev[0], detalle, diagnostico: diagnostico[0] || null, recomendaciones });
}));

// Crear evaluación con su detalle
router.post('/evaluaciones', asyncHandler(async (req, res) => {
    const { finca_id, especie_id, evaluador_id = 1, respuestas = [], observaciones_generales } = req.body;
    if (!finca_id || !especie_id) return fail(res, 400, 'finca_id y especie_id son obligatorios');

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const [result] = await conn.query(
            `INSERT INTO evaluaciones (finca_id, especie_id, evaluador_id, estado_id, observaciones_generales)
             VALUES (?,?,?,1,?)`,
            [finca_id, especie_id, evaluador_id, observaciones_generales || null]
        );
        const evaluacionId = result.insertId;

        for (const r of respuestas) {
            // Calcula el puntaje del indicador según su tipo de respuesta
            const [indRows] = await conn.query('SELECT * FROM indicadores WHERE id = ?', [r.indicador_id]);
            if (!indRows.length) continue;
            const ind = indRows[0];
            let puntaje = r.puntaje_obtenido;
            if (puntaje === undefined || puntaje === null) {
                puntaje = calcularPuntajeIndicador(ind, r.respuesta);
            }
            await conn.query(
                `INSERT INTO detalle_evaluacion (evaluacion_id, indicador_id, respuesta, puntaje_obtenido, observaciones)
                 VALUES (?,?,?,?,?)`,
                [evaluacionId, r.indicador_id, r.respuesta != null ? String(r.respuesta) : null, puntaje, r.observaciones || null]
            );
        }

        // Calcular puntaje total llamando al procedimiento almacenado
        await conn.query('CALL sp_calcular_puntaje_evaluacion(?)', [evaluacionId]);

        const [[ev]] = await conn.query('SELECT * FROM evaluaciones WHERE id = ?', [evaluacionId]);
        await conn.commit();
        ok(res, ev, { message: 'Evaluación creada y calculada' });
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}));

// Recalcular puntaje (invoca procedimiento almacenado)
router.post('/evaluaciones/:id/calcular', asyncHandler(async (req, res) => {
    await pool.query('CALL sp_calcular_puntaje_evaluacion(?)', [req.params.id]);
    const [[ev]] = await pool.query('SELECT * FROM evaluaciones WHERE id = ?', [req.params.id]);
    if (!ev) return fail(res, 404, 'Evaluación no encontrada');
    ok(res, ev, { message: 'Puntaje recalculado' });
}));

// Finalizar evaluación
router.post('/evaluaciones/:id/finalizar', asyncHandler(async (req, res) => {
    await pool.query('CALL sp_finalizar_evaluacion(?)', [req.params.id]);
    const [[ev]] = await pool.query('SELECT * FROM evaluaciones WHERE id = ?', [req.params.id]);
    ok(res, ev, { message: 'Evaluación finalizada' });
}));

// Guardado parcial
router.patch('/evaluaciones/:id/parcial', asyncHandler(async (req, res) => {
    const { respuestas = [], observaciones_generales } = req.body;
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        for (const r of respuestas) {
            const [indRows] = await conn.query('SELECT * FROM indicadores WHERE id = ?', [r.indicador_id]);
            if (!indRows.length) continue;
            const ind = indRows[0];
            let puntaje = r.puntaje_obtenido;
            if (puntaje === undefined || puntaje === null) puntaje = calcularPuntajeIndicador(ind, r.respuesta);
            await conn.query(
                `INSERT INTO detalle_evaluacion (evaluacion_id, indicador_id, respuesta, puntaje_obtenido, observaciones)
                 VALUES (?,?,?,?,?)
                 ON DUPLICATE KEY UPDATE respuesta=VALUES(respuesta),
                    puntaje_obtenido=VALUES(puntaje_obtenido), observaciones=VALUES(observaciones)`,
                [req.params.id, r.indicador_id, r.respuesta != null ? String(r.respuesta) : null, puntaje, r.observaciones || null]
            );
        }
        await conn.query(
            'UPDATE evaluaciones SET estado_id = 2, fecha_guardado_parcial = CURRENT_TIMESTAMP, observaciones_generales = COALESCE(?, observaciones_generales) WHERE id = ?',
            [observaciones_generales || null, req.params.id]
        );
        await conn.commit();
        ok(res, { id: Number(req.params.id) }, { message: 'Avance guardado' });
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}));

// Resumen por libertad/dimensión
router.get('/evaluaciones/:id/resumen', asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
        `SELECT d.nombre AS dimension, d.peso AS dimension_peso,
                AVG(de.puntaje_obtenido) AS promedio
         FROM detalle_evaluacion de
         JOIN indicadores i ON de.indicador_id = i.id
         JOIN criterios c ON i.criterio_id = c.id
         JOIN dimensiones d ON c.dimension_id = d.id
         WHERE de.evaluacion_id = ?
         GROUP BY d.id, d.nombre, d.peso
         ORDER BY d.orden`, [req.params.id]
    );
    const [[ev]] = await pool.query('SELECT puntaje_total, clasificacion FROM evaluaciones WHERE id = ?', [req.params.id]);
    ok(res, { dimensiones: rows, ...ev });
}));

// ============================================================
// INDICADORES (todos, con jerarquía)
// ============================================================
router.get('/indicadores', asyncHandler(async (req, res) => {
    const { especie_id } = req.query;
    let sql = `
        SELECT i.*, c.nombre AS criterio, d.nombre AS dimension, e.nombre AS especie
        FROM indicadores i
        JOIN criterios c ON i.criterio_id = c.id
        JOIN dimensiones d ON c.dimension_id = d.id
        JOIN especies e ON d.especie_id = e.id
        WHERE i.activo = TRUE`;
    const params = [];
    if (especie_id) { sql += ' AND e.id = ?'; params.push(especie_id); }
    sql += ' ORDER BY d.orden, c.orden, i.orden';
    const [rows] = await pool.query(sql, params);
    ok(res, rows);
}));

// ============================================================
// DASHBOARD / MÉTRICAS
// ============================================================
router.get('/dashboard', asyncHandler(async (req, res) => {
    const [[tablas]] = await pool.query(
        `SELECT COUNT(*) AS total FROM information_schema.tables
         WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE'`
    );
    const [[especies]] = await pool.query('SELECT COUNT(*) AS total FROM especies WHERE activo = TRUE');
    const [[dimensiones]] = await pool.query('SELECT COUNT(*) AS total FROM dimensiones WHERE activo = TRUE');
    const [[criterios]] = await pool.query('SELECT COUNT(*) AS total FROM criterios WHERE activo = TRUE');
    const [[indicadores]] = await pool.query('SELECT COUNT(*) AS total FROM indicadores WHERE activo = TRUE');
    const [[fincas]] = await pool.query('SELECT COUNT(*) AS total FROM fincas WHERE activo = TRUE');
    const [[evaluaciones]] = await pool.query('SELECT COUNT(*) AS total FROM evaluaciones');
    const [[promedio]] = await pool.query('SELECT ROUND(AVG(puntaje_total),1) AS promedio FROM evaluaciones WHERE puntaje_total IS NOT NULL');

    const [porEspecie] = await pool.query(
        `SELECT e.nombre AS especie, COUNT(ev.id) AS evaluaciones,
                ROUND(AVG(ev.puntaje_total),1) AS promedio
         FROM especies e
         LEFT JOIN evaluaciones ev ON ev.especie_id = e.id
         GROUP BY e.id, e.nombre`
    );
    const [porClasificacion] = await pool.query(
        `SELECT clasificacion, COUNT(*) AS total FROM evaluaciones
         WHERE clasificacion IS NOT NULL GROUP BY clasificacion`
    );

    ok(res, {
        tablas: tablas.total,
        especies: especies.total,
        dimensiones: dimensiones.total,
        criterios: criterios.total,
        indicadores: indicadores.total,
        fincas: fincas.total,
        evaluaciones: evaluaciones.total,
        promedio_general: promedio.promedio || 0,
        por_especie: porEspecie,
        por_clasificacion: porClasificacion
    });
}));

// Jerarquía resumida por especie (para poblar el simulador)
router.get('/especies/:id/resumen', asyncHandler(async (req, res) => {
    const [dim] = await pool.query(
        'SELECT id, nombre, peso FROM dimensiones WHERE especie_id = ? AND activo = TRUE ORDER BY orden', [req.params.id]
    );
    const [crit] = await pool.query(
        `SELECT c.id, c.nombre, c.dimension_id, c.peso FROM criterios c
         JOIN dimensiones d ON c.dimension_id = d.id WHERE d.especie_id = ? AND c.activo = TRUE ORDER BY c.orden`, [req.params.id]
    );
    const [ind] = await pool.query(
        `SELECT i.id, i.nombre, i.criterio_id, i.peso, i.metodo_evaluacion, i.tipo_respuesta, i.umbral_aprobacion
         FROM indicadores i JOIN criterios c ON i.criterio_id = c.id
         JOIN dimensiones d ON c.dimension_id = d.id
         WHERE d.especie_id = ? AND i.activo = TRUE ORDER BY i.orden`, [req.params.id]
    );
    ok(res, { dimensiones: dim, criterios: crit, indicadores: ind });
}));

// ============================================================
// ESTADÍSTICAS POR FINCA
// ============================================================
router.get('/fincas/:id/estadisticas', asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
        `SELECT e.nombre AS especie, COUNT(ev.id) AS total_evaluaciones,
                ROUND(AVG(ev.puntaje_total),1) AS puntaje_promedio,
                MAX(ev.puntaje_total) AS mejor, MIN(ev.puntaje_total) AS peor
         FROM evaluaciones ev
         JOIN especies e ON ev.especie_id = e.id
         WHERE ev.finca_id = ?
         GROUP BY e.id, e.nombre`, [req.params.id]
    );
    ok(res, rows);
}));

// ============================================================
// EXPLORADOR DE BASE DE DATOS (solo lectura)
// ============================================================
router.get('/tablas', asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
        `SELECT TABLE_NAME AS nombre, TABLE_TYPE AS tipo,
                COALESCE(TABLE_ROWS, 0) AS filas
         FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = DATABASE()
         ORDER BY CASE WHEN TABLE_TYPE = 'BASE TABLE' THEN 0 ELSE 1 END, TABLE_NAME`
    );
    ok(res, rows);
}));

router.get('/tablas/:nombre', asyncHandler(async (req, res) => {
    const { nombre } = req.params;
    const limit = Math.min(Number(req.query.limit) || 50, 500);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    // Validar contra information_schema para evitar inyección SQL
    const [existe] = await pool.query(
        `SELECT TABLE_NAME, TABLE_TYPE FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`, [nombre]
    );
    if (!existe.length) return fail(res, 404, `La tabla '${nombre}' no existe`);

    const [columnas] = await pool.query(
        `SELECT COLUMN_NAME AS columna, DATA_TYPE AS tipo, IS_NULLABLE AS nulo, COLUMN_KEY AS llave
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
         ORDER BY ORDINAL_POSITION`, [nombre]
    );
    const [[conteo]] = await pool.query(`SELECT COUNT(*) AS total FROM \`${nombre}\``);
    const [filas] = await pool.query(`SELECT * FROM \`${nombre}\` LIMIT ? OFFSET ?`, [limit, offset]);

    ok(res, {
        tabla: nombre,
        tipo: existe[0].TABLE_TYPE,
        columnas,
        filas,
        total: conteo.total,
        limit,
        offset
    });
}));

// ============================================================
// FUNCIÓN AUXILIAR: PUNTAJE POR TIPO DE RESPUESTA
// ============================================================
function calcularPuntajeIndicador(indicador, respuesta) {
    if (respuesta === undefined || respuesta === null || respuesta === '') return null;
    switch (indicador.tipo_respuesta) {
        case 'si_no': {
            const v = String(respuesta).toLowerCase();
            if (['si', 'sí', 'true', '1', 'cumple'].includes(v)) return 100;
            if (['no', 'false', '0', 'nc'].includes(v)) return 0;
            return null;
        }
        case 'escala':
        case 'numerica': {
            const n = Number(respuesta);
            if (isNaN(n)) return null;
            // Si supera 100 se asume escala tipo 1-5 u otra
            if (n > 100) return Math.min(100, (n / 5) * 100);
            return Math.max(0, Math.min(100, n));
        }
        case 'seleccion_unica':
        case 'seleccion_multiple': {
            const n = Number(respuesta);
            return isNaN(n) ? null : Math.max(0, Math.min(100, n));
        }
        default:
            return null;
    }
}

module.exports = router;
