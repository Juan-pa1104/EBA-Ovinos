-- ======================================================================================
-- ARCHIVO: 10_PreguntasSustentacion.sql
-- DESCRIPCIÓN: Preguntas de sustentación con respuestas académicas completas
-- ======================================================================================

-- ======================================================================================
-- PREGUNTA 1
-- ¿Por qué Medicamento y Médico tienen una relación M:M? Explica con un ejemplo real
-- por qué un médico puede recetar varios medicamentos y un medicamento puede ser
-- recetado por varios médicos.
-- ======================================================================================

SELECT '---' AS Separador;
SELECT 'PREGUNTA 1: ¿Por qué Medicamento y Médico tienen una relación M:M?' AS Pregunta;
SELECT '---' AS Separador;

-- Respuesta académica:
-- La relación muchos a muchos (M:M) entre Medicamento y Médico a través de la tabla Receta
-- es necesaria porque en la práctica farmacéutica se presentan dos escenarios fundamentales:

-- 1. Un mismo médico puede recetar diferentes medicamentos para un mismo paciente:
--    - Ejemplo: El Dr. Martínez (Médico ID 1) puede recetar Ibuprofeno para dolor,
--              Paracetamol como alternativa, y Cetirizina si el paciente tiene alergias.
--    - Esto permite un tratamiento personalizado y flexible por parte del profesional de la salud.

-- 2. Un mismo medicamento puede ser recetado por diferentes médicos:
--    - Ejemplo: La Amoxicilina 500mg puede ser recetada por el Dr. Gómez (Medicina General),
--              por el Dr. Rodríguez (Cardiología) o por la Dra. Martínez (Pediatría).
--    - Cada profesional evalúa la mejor opción de tratamiento según su especialidad y el caso del paciente.

-- Lógica implementada en la base de datos:
-- Se resolvió esta relación M:M mediante la tabla intermedia DetalleReceta, que contiene:
--   - FK a Receta (vínculo con Cliente)
--   - FK a Medicamento (el fármaco recetado)
--   - Campo cantidad (cantidad de dosis)
--   - Campo dosis (indicación posológica)
--   - Campo instrucciones_uso (indicaciones adicionales)
--
-- Esta estructura permite que una misma receta tenga varios medicamentos (una línea de receta)
-- y que un mismo medicamento aparezca en múltiples recetas de diferentes clientes y médicos.

-- ======================================================================================
-- PREGUNTA 2
-- El ejercicio exige 3 relaciones M:M. ¿Cuáles fueron y cómo las resolviste con tablas
-- intermedias? Explica la lógica de cada una.
-- ======================================================================================

SELECT '---' AS Separador;
SELECT 'PREGUNTA 2: Las 3 relaciones M:M y su implementación con tablas intermedias' AS Pregunta;
SELECT '---' AS Separador;

-- Respuesta académica:
-- El proyecto requiere 3 relaciones muchos a muchos, las cuales se resolvieron utilizando
-- tablas intermedias de relación (junction tables) para mantener la normalización y evitar
-- redundancia de datos. Cada una se explica a continuación:

-- 1. Relación Cliente - Médico (vía tabla Receta)
--    - Justificación: Un cliente puede tener múltiples recetas médicas a lo largo del tiempo,
--      y un mismo médico puede atender a múltiples clientes.
--    - Tabla intermedia: Receta
--    - Atributos clave: receta_id (PK), cliente_id (FK), medico_id (FK), fecha_emision,
--      fecha_vencimiento, estado, numero_receta
--    - Lógica: Un cliente puede tener muchas recetas (un cliente -> muchas recetas).
--      Un médico puede tener muchas recetas (un médico -> muchas recetas).
--    - Esto permite historial médico completo por cliente y control de qué médicos han
--      atendido a cada paciente.

-- 2. Relación Receta - Medicamento (vía tabla DetalleReceta)
--    - Justificación: Una receta médica puede contener varios medicamentos (múltiples líneas
--      de tratamiento), y un mismo medicamento puede aparecer en diferentes recetas emitidas
--      por diferentes médicos a diferentes pacientes.
--    - Tabla intermedia: DetalleReceta
--    - Atributos clave: detalle_id (PK), receta_id (FK), medicamento_id (FK), cantidad,
--      dosis, instrucciones_uso, fecha_agregacion
--    - Lógica: Una receta -> muchos medicamentos (una receta puede tener 1, 2, 3 o más fármacos).
--      Un medicamento -> muchas recetas (el mismo fármaco en diferentes recetas).
--    - Esto evita repetir datos del medicamento en cada receta y permite controlar la posología
--      específica por receta (cantidad, dosis, instrucciones).

-- 3. Relación Venta - Medicamento (vía tabla DetalleVenta)
--    - Justificación: Una venta (compra) puede incluir varios medicamentos adquiriéndose al
--      mismo tiempo, y un mismo medicamento puede venderse en numerosas transacciones diferentes.
--    - Tabla intermedia: DetalleVenta
--    - Atributos clave: detalle_venta_id (PK), venta_id (FK), medicamento_id (FK), cantidad,
--      precio_unitario, subtotal, fecha_agregacion
--    - Lógica: Una venta -> muchos medicamentos (un cliente compra varios productos en una sola transacción).
--      Un medicamento -> muchas ventas (el mismo producto se vende en diferentes ocasiones).
--    - Esto es esencial para el control de inventario, cálculo de totales de venta y reporte
--      de qué productos se venden con más frecuencia.

-- En todos los casos, las tablas intermedias permiten:
--   - Mantener la tercera forma normal (3FN) al eliminar redundancia
--   - Atributos propios de la relación (cantidad, precio, dosis, etc.)
--   - Integridad referencial mediante llaves foráneas
--   - Flexibilidad para representar la realidad del negocio farmacéutico

-- ======================================================================================
-- PREGUNTA 3
-- Explica al menos 2 reglas de negocio que convertiste en CHECK. ¿Por qué son importantes
-- para la seguridad del paciente?
-- ======================================================================================

SELECT '---' AS Separador;
SELECT 'PREGUNTA 3: Reglas de negocio implementadas con CHECK y su importancia' AS Pregunta;
SELECT '---' AS Separador;

-- Respuesta académica:
-- Se implementaron varias restricciones CHECK en la tabla Medicamento para garantizar la integridad
-- de los datos y, más importante, la seguridad del paciente. Se explican a continuación 2 de las más críticas:

-- Regla de negocio 1: CHECK (Precio > 0)
--   - Restricción: CK_Medicamento_PrecioMayorCero CHECK (precio > 0)
--   - Importancia para seguridad del paciente:
--     * Evita que se registren medicamentos gratuitos o con precio negativo en el sistema.
--     * Un precio por cero o negativo podría indicar error de digitación, lo que provocaría:
--       - Cálculos incorrectos en totales de venta
--       - Problemas de contabilidad y facturación
--       - Posible pérdida de ingresos para la farmacia
--     * A nivel de paciente: Evita confusiones en la dispensación donde un medicamento
--       aparentemente "gratis" podría ser administrado incorrectamente o no tener las condiciones
--       adecuadas de calidad y registro.
--     * A nivel administrativo: Asegura que cada medicamento tenga un valor comercial válido,
--       lo que es requisito para la operación legal de cualquier establecimiento farmacéutico.

-- Regla de negocio 2: CHECK (Stock >= 0)
--   - Restricción: CK_Medicamento_StockNoNegativo CHECK (stock >= 0)
--   - Importancia para seguridad del paciente:
--     * Evita que el inventario muestre cantidades negativas, lo que indicaría ventas o
--       dispensaciones que exceden el stock disponible.
--     * Evita dispensar medicamentos que físicamente no existen en el almacén, previniendo:
--       - Falsos positivos en sistemas de reabastecimiento automático
--       - Ventas sobre stock que luego no pueden ser cumplidas
--       - Pérdida de confianza del paciente en el sistema
--     * Permite identificar rápidamente qué medicamentos están por debajo del nivel mínimo
--       de existencia y requieren reposición urgente.
--     * En situaciones de emergencia o auditoría, un stock negativo indicaría un error del sistema
--       o posible fraude, por lo que su prevención es crítica para la integridad operativa.

-- Adicionalmente, también se implementó:
-- Regla 3: CHECK (FechaVencimiento > FechaFabricacion) - CK_Medicamento_FechaVencimientoMayor
--   - Evita registrar medicamentos con fecha de vencimiento anterior a la de fabricación,
--     lo que sería imposible y indicaría un error grave de datos que podría poner en riesgo la salud
--     del paciente si se dispensa un medicamento vencido sin la debida detección.

-- ======================================================================================
-- PREGUNTA 4
-- ¿Cómo aplicaste la restricción de precio mayor a 0 y stock no negativo? ¿Qué tipo de
-- restricción usaste en cada caso y por qué?
-- ======================================================================================

SELECT '---' AS Separador;
SELECT 'PREGUNTA 4: Aplicación de restricciones CHECK de precio y stock' AS Pregunta;
SELECT '---' AS Separador;

-- Respuesta académica:
-- Ambas restricciones fueron implementadas utilizando el tipo de restricción CHECK en SQL Server,
-- que valida la condición en el momento del INSERT o UPDATE sobre la tabla Medicamento.

-- Restricción de precio mayor a 0:
--   - Nombre: CK_Medicamento_PrecioMayorCero
--   - Sintaxis utilizada: CONSTRAINT CK_Medicamento_PrecioMayorCero CHECK (precio > 0)
--   - Campo aplicado: precio (DECIMAL(10,2) NOT NULL)
--   - Justificación: El tipo de dato DECIMAL(10,2) permite valores numéricos con 2 decimales
--     (ej: 8500.00, 12000.50). La condición CHECK (precio > 0) asegura que:
--     * Qué se puedan ingresar valores como 0.01, 100.50, 5000.00, etc.
--     * Se rechacen inmediatamente valores como 0, -100, NULL (aunque NULL es manejado
--       por NOT NULL en la definición de la columna)
--     * Se evite el ingreso accidental de gastos promocionales gratuitos que no tengan un valor
--       comercial asociado.

-- Restricción de stock no negativo:
--   - Nombre: CK_Medicamento_StockNoNegativo
--   - Sintaxis utilizada: CONSTRAINT CK_Medicamento_StockNoNegativo CHECK (stock >= 0)
--   - Campo aplicado: stock (INT DEFAULT 0)
--   - Justificación: El tipo de dato INT permite números enteros. La condición CHECK (stock >= 0)
--     asegura que:
--     * Los valores iniciales por defecto sean 0 (medicamento nuevo, sin existencia)
--     * Los valores posteriores reflejen el stock real después de ventas o reposiciones
--     * Se rechacen actualizaciones que intenten dejar el stock en -1, -5, etc.
--     * Esto es crítico porque un stock negativo no tiene significado físico en un almacén
--     y indicaría un error del sistema o una venta sobre inventario no disponible.

-- Diferencias clave entre ambas restricciones:
--   - Precio: Es un valor monetario que debe ser siempre positivo para operación comercial.
--     El cero no está permitido (precio > 0 estricto), ya que un medicamento sin precio
--     no tiene razón de ser en el sistema de ventas.
--   - Stock: Es una cantidad física que puede ser cero (medicamento agotado).
--     El cero sí está permitido (stock >= 0), ya que un medicamento con stock 0 indica
--     que se agotó y necesita reposición, pero aún está en el sistema para control.

-- ======================================================================================
-- PREGUNTA 5
-- ¿Por qué la fecha de vencimiento debe ser posterior a la de fabricación? ¿Qué restricción
-- usaste y qué riesgo evita para la salud?
-- ======================================================================================

SELECT '---' AS Separador;
SELECT 'PREGUNTA 5: Restricción de fechas de fabricación y vencimiento' AS Pregunta;
SELECT '---' AS Separador;

-- Respuesta académica:
-- La restricción de que la fecha de vencimiento debe ser posterior a la fecha de fabricación
-- es una regla de negocio crítica para la seguridad del paciente y la integridad de los datos
-- en un sistema farmacéutico.

-- Motivo fundamental:
--   Los medicamentos tienen una vida útil limitada después de su fabricación. La fecha de
--   fabricación indica cuándo el producto fue creado, y la fecha de vencimiento indica el
--   último día en que el fabricante garantiza la totalidad y eficacia del producto, así como
--   su seguridad para el consumo humano.

-- Riesgos evitados por esta restricción:
-- 1. Prevención de dispensación de medicamentos vencidos:
--    - Si la fecha de vencimiento fuera anterior o igual a la fecha de fabricación,
--      el sistema permitiría o indicaría un medicamento con vida útil nula o negativa.
--    - Dispensar un medicamento vencido puede ser peligroso porque:
--      * Los componentes químicos pueden degradarse perdiendo eficacia
--      * Puede形成生成 sustancias tóxicas por degradación química
--      * El paciente no recibirá el tratamiento esperado, complicando su salud
-- 2. Evitación de errores de datos:
--    - Una fecha de vencimiento anterior a la fabricación es lógicamente imposible
--      en el proceso de producción y embalaje farmacéutico.
--    - La restricción CHECK evita manualmente o sistemáticamente este error de digitación.
-- 3. Cumplimiento normativo:
--    - Las autoridades sanitarias (ANVISA en Brasil, FDA en EE.UU., etc.) requieren
--      un control estricto de fechas de caducidad.
--    - El sistema debe garantizar que solo medicamentos en vigencia sean dispensados.
-- 4. Control de inventario:
--    - Permite identificar correctamente qué medicamentos deben retirarse del inventario
--      (lote vencido) y cuáles aún están disponibles para la venta.

-- Restricción implementada:
--   - Nombre: CK_Medicamento_FechaVencimientoMayor
--   - Sintaxis: CONSTRAINT CK_Medicamento_FechaVencimientoMayor 
--            CHECK (fecha_vencimiento > fecha_fabricacion)
--   - Campos: fecha_vencimiento DATE, fecha_fabricacion DATE
--   - Esta restricción se ejecuta automáticamente en INSERT y UPDATE, rechazando cualquier
--     intento de registrar un medicamento con fecha_vencimiento <= fecha_fabricacion.

-- Ejemplo de validación exitosa:
--   - Medicamento: Amoxicilina
--   - Fabricación: 2024-01-15
--   - Vencimiento: 2026-01-15 (2 años de vida útil - correcto)
--   - Resultado: La restricción CHECK permite el registro ✓

-- Ejemplo de validación fallida:
--   - Medicamento: Amoxicilina
--   - Fabricación: 2024-01-15
--   - Vencimiento: 2023-06-20 (antes de la fabricación - error)
--   - Resultado: La restricción CHECK rechaza el registro ✗
--   - Mensaje de error: "Check constraint 'CK_Medicamento_FechaVencimientoMayor' failed"

-- ======================================================================================
-- FIN DE LAS PREGUNTAS DE SUSTENTACIÓN
-- ======================================================================================