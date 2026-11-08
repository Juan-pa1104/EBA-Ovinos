// ============================================================
// SEED DE PARAMETRIZACIÓN - ICA BIENESTAR ANIMAL (proyecto OVINO)
// Inserta/actualiza las 5 libertades, 9 criterios y 31 indicadores ovinos.
// Es IDEMPOTENTE: puede volver a ejecutarse sin borrar evaluaciones.
// Ejecutar:  node src/seed.js   (o: npm run seed)
// ============================================================
require('dotenv').config();
const mysql = require('mysql2/promise');

// ---------- Definición base: OVINO (5 libertades) ----------
const parametrizacionOvino = [
    { nombre: 'Libre de Hambre, Sed y Desnutrición', peso: 20, criterios: [
        { nombre: 'Acceso y disponibilidad de agua', peso: 50, indicadores: [
            { nombre: 'Acceso a agua de bebida', metodo: 'visual', tipo: 'si_no' },
            { nombre: 'Cantidad y calidad del agua', metodo: 'visual', tipo: 'si_no' },
            { nombre: 'Estado y limpieza de bebederos', metodo: 'visual', tipo: 'si_no' },
        ]},
        { nombre: 'Acceso y disponibilidad de alimento', peso: 50, indicadores: [
            { nombre: 'Acceso y disponibilidad del alimento', metodo: 'visual', tipo: 'si_no' },
            { nombre: 'Cantidad y calidad del alimento', metodo: 'visual', tipo: 'si_no' },
            { nombre: 'Estado y limpieza de comederos', metodo: 'visual', tipo: 'si_no' },
            { nombre: 'Condición corporal (escala 1-5)', metodo: 'muestreo', tipo: 'seleccion_unica' },
        ]},
    ]},
    { nombre: 'Libre de Molestias Físicas y Térmicas', peso: 20, criterios: [
        { nombre: 'Confort térmico', peso: 50, indicadores: [
            { nombre: 'Signos de estrés térmico', metodo: 'muestreo', tipo: 'si_no' },
            { nombre: 'Acceso a sombra en corrales y potreros', metodo: 'muestreo', tipo: 'si_no' },
            { nombre: 'Encharcamiento en corrales y potreros', metodo: 'muestreo', tipo: 'si_no' },
        ]},
        { nombre: 'Confort de alojamiento', peso: 50, indicadores: [
            { nombre: 'Espacio mínimo por animal en confinamiento', metodo: 'muestreo', tipo: 'si_no' },
            { nombre: 'Tipo, estado del piso y limpieza de corrales', metodo: 'muestreo', tipo: 'si_no' },
            { nombre: 'Condición e higiene de la cama', metodo: 'muestreo', tipo: 'si_no' },
            { nombre: 'Iluminación y ventilación en corrales', metodo: 'muestreo', tipo: 'si_no' },
        ]},
    ]},
    { nombre: 'Libre de Dolor, de Lesión y de Enfermedad', peso: 25, criterios: [
        { nombre: 'Sanidad animal', peso: 60, indicadores: [
            { nombre: 'Sintomatología respiratoria (secreción nasal, tos)', metodo: 'muestreo', tipo: 'si_no' },
            { nombre: 'Secreción ocular', metodo: 'muestreo', tipo: 'si_no' },
            { nombre: 'FAMACHA (calificación 4 o 5)', metodo: 'muestreo', tipo: 'seleccion_unica' },
            { nombre: 'Presencia de ectoparásitos (nuchens, miasis, garrapatas)', metodo: 'muestreo', tipo: 'si_no' },
            { nombre: 'Lesiones, heridas o pérdida de pelo/lana', metodo: 'muestreo', tipo: 'si_no' },
            { nombre: 'Mastitis clínica', metodo: 'muestreo', tipo: 'si_no' },
            { nombre: 'Cojeras', metodo: 'muestreo', tipo: 'si_no' },
            { nombre: 'Sobre crecimiento de pezuñas', metodo: 'muestreo', tipo: 'si_no' },
        ]},
        { nombre: 'Prácticas dolorosas', peso: 20, indicadores: [
            { nombre: 'Topizado y descorne (uso de anestesia/analgesia)', metodo: 'muestreo', tipo: 'seleccion_unica' },
            { nombre: 'Castración (uso de anestesia/analgesia)', metodo: 'muestreo', tipo: 'seleccion_unica' },
            { nombre: 'Descole (ovinos)', metodo: 'muestreo', tipo: 'seleccion_unica' },
        ]},
        { nombre: 'Mortalidad', peso: 20, indicadores: [
            { nombre: 'Mortalidad en crías (últimos 12 meses)', metodo: 'documental', tipo: 'numerica', umbral: 5 },
            { nombre: 'Mortalidad en adultos (últimos 12 meses)', metodo: 'documental', tipo: 'numerica', umbral: 3 },
        ]},
    ]},
    { nombre: 'Libre de Temor y Angustia', peso: 17.5, criterios: [
        { nombre: 'Relación humano-animal', peso: 100, indicadores: [
            { nombre: 'Respuesta a la interacción con el humano', metodo: 'visual', tipo: 'seleccion_unica' },
            { nombre: 'Conocimiento y capacitación en bienestar animal', metodo: 'documental', tipo: 'seleccion_unica' },
        ]},
    ]},
    { nombre: 'Libre de Impedimentos de Manifestar Comportamiento Natural', peso: 17.5, criterios: [
        { nombre: 'Expresión del comportamiento natural', peso: 100, indicadores: [
            { nombre: 'Agrupamiento social', metodo: 'visual', tipo: 'si_no' },
            { nombre: 'Animales amarrados (con justa causa y condiciones)', metodo: 'visual', tipo: 'seleccion_unica' },
        ]},
    ]},
];

// Opciones de respuesta estándar por tipo de indicador
const OPCIONES_ESCALA = [
    { opcion: 'Excelente', valor: 100, orden: 1 },
    { opcion: 'Bueno', valor: 75, orden: 2 },
    { opcion: 'Regular', valor: 50, orden: 3 },
    { opcion: 'Deficiente', valor: 25, orden: 4 },
    { opcion: 'Crítico', valor: 0, orden: 5 },
];

// Elimina una fila si no está referenciada por evaluaciones; si lo está, la desactiva.
async function tryDeleteOrDeactivate(conn, tabla, id) {
    try {
        await conn.query(`DELETE FROM ${tabla} WHERE id = ?`, [id]);
    } catch (e) {
        if (e.errno === 1451 || e.code === 'ER_ROW_IS_REFERENCED_2') {
            await conn.query(`UPDATE ${tabla} SET activo = FALSE WHERE id = ?`, [id]);
        } else {
            throw e;
        }
    }
}

// Sincroniza la parametrización de una especie de forma IDEMPOTENTE.
// No borra filas referenciadas por evaluaciones: hace "upsert" por nombre y,
// si algo deja de estar en la definición, lo desactiva en vez de eliminarlo.
// Así el seed se puede volver a ejecutar en cualquier momento sin errores.
async function seedParametrizacion(conn, especieId, definicion) {
    const dimIds = new Set(), critIds = new Set(), indIds = new Set();

    for (let d = 0; d < definicion.length; d++) {
        const dim = definicion[d];
        const [exd] = await conn.query(
            'SELECT id FROM dimensiones WHERE especie_id = ? AND nombre = ?', [especieId, dim.nombre]
        );
        let dimId;
        if (exd.length) {
            dimId = exd[0].id;
            await conn.query(
                'UPDATE dimensiones SET descripcion = ?, peso = ?, orden = ?, activo = TRUE WHERE id = ?',
                [dim.nombre, dim.peso, d + 1, dimId]
            );
        } else {
            const [r] = await conn.query(
                'INSERT INTO dimensiones (especie_id, nombre, descripcion, peso, orden) VALUES (?,?,?,?,?)',
                [especieId, dim.nombre, dim.nombre, dim.peso, d + 1]
            );
            dimId = r.insertId;
        }
        dimIds.add(dimId);

        for (let c = 0; c < dim.criterios.length; c++) {
            const crit = dim.criterios[c];
            const [exc] = await conn.query(
                'SELECT id FROM criterios WHERE dimension_id = ? AND nombre = ?', [dimId, crit.nombre]
            );
            let critId;
            if (exc.length) {
                critId = exc[0].id;
                await conn.query(
                    'UPDATE criterios SET descripcion = ?, peso = ?, orden = ?, activo = TRUE WHERE id = ?',
                    [crit.nombre, crit.peso, c + 1, critId]
                );
            } else {
                const [r] = await conn.query(
                    'INSERT INTO criterios (dimension_id, nombre, descripcion, peso, orden) VALUES (?,?,?,?,?)',
                    [dimId, crit.nombre, crit.nombre, crit.peso, c + 1]
                );
                critId = r.insertId;
            }
            critIds.add(critId);

            for (let i = 0; i < crit.indicadores.length; i++) {
                const ind = crit.indicadores[i];
                const [exi] = await conn.query(
                    'SELECT id FROM indicadores WHERE criterio_id = ? AND nombre = ?', [critId, ind.nombre]
                );
                let indId;
                if (exi.length) {
                    indId = exi[0].id;
                    await conn.query(
                        `UPDATE indicadores SET descripcion = ?, metodo_evaluacion = ?, tipo_respuesta = ?,
                            umbral_aprobacion = ?, peso = ?, orden = ?, activo = TRUE WHERE id = ?`,
                        [ind.nombre, ind.metodo, ind.tipo, ind.umbral || null, 100, i + 1, indId]
                    );
                } else {
                    const [r] = await conn.query(
                        `INSERT INTO indicadores (criterio_id, nombre, descripcion, metodo_evaluacion, tipo_respuesta, umbral_aprobacion, peso, orden)
                         VALUES (?,?,?,?,?,?,?,?)`,
                        [critId, ind.nombre, ind.nombre, ind.metodo, ind.tipo, ind.umbral || null, 100, i + 1]
                    );
                    indId = r.insertId;
                }
                indIds.add(indId);

                // Las opciones de respuesta no están referenciadas por evaluaciones → se refrescan
                await conn.query('DELETE FROM opciones_respuesta WHERE indicador_id = ?', [indId]);
                if (ind.tipo === 'seleccion_unica' || ind.tipo === 'seleccion_multiple') {
                    for (const op of OPCIONES_ESCALA) {
                        await conn.query(
                            'INSERT INTO opciones_respuesta (indicador_id, opcion, valor, orden) VALUES (?,?,?,?)',
                            [indId, op.opcion, op.valor, op.orden]
                        );
                    }
                }
            }
        }
    }

    // Lo que ya no está en la definición: se elimina o se desactiva si está referenciado
    const lista = (set) => (set.size ? [...set] : [0]);

    const [indsViejos] = await conn.query(
        `SELECT i.id FROM indicadores i
         JOIN criterios c ON i.criterio_id = c.id
         JOIN dimensiones d ON c.dimension_id = d.id
         WHERE d.especie_id = ? AND i.id NOT IN (?)`, [especieId, lista(indIds)]);
    for (const row of indsViejos) await tryDeleteOrDeactivate(conn, 'indicadores', row.id);

    const [critsViejos] = await conn.query(
        `SELECT c.id FROM criterios c JOIN dimensiones d ON c.dimension_id = d.id
         WHERE d.especie_id = ? AND c.id NOT IN (?)`, [especieId, lista(critIds)]);
    for (const row of critsViejos) await tryDeleteOrDeactivate(conn, 'criterios', row.id);

    const [dimsViejas] = await conn.query(
        'SELECT id FROM dimensiones WHERE especie_id = ? AND id NOT IN (?)', [especieId, lista(dimIds)]);
    for (const row of dimsViejas) await tryDeleteOrDeactivate(conn, 'dimensiones', row.id);

    return { nDim: dimIds.size, nCrit: critIds.size, nInd: indIds.size };
}

async function main() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'ica_bienestar_animal'
    });

    try {
        // Proyecto enfocado únicamente en OVINO
        const [especies] = await conn.query("SELECT id, nombre FROM especies WHERE nombre = 'Ovino'");
        if (!especies.length) {
            throw new Error("No existe la especie 'Ovino'. Ejecuta primero el script BaseDatos_ICA_Bienestar_MariaDB.sql");
        }
        console.log('🌱 Poblando parametrización OVINA...\n');
        for (const esp of especies) {
            const r = await seedParametrizacion(conn, esp.id, parametrizacionOvino);
            console.log(`   ✅ ${esp.nombre.padEnd(10)} → ${r.nDim} libertades, ${r.nCrit} criterios, ${r.nInd} indicadores`);
        }
        console.log('\n✅ Parametrización ovina sincronizada correctamente.');
    } catch (err) {
        console.error('❌ Error en el seed:', err.message);
        process.exitCode = 1;
    } finally {
        await conn.end();
    }
}

main();
