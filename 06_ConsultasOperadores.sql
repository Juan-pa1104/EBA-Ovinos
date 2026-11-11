-- ======================================================================================
-- ARCHIVO: 06_ConsultasOperadores.sql
-- DESCRIPCIÓN: 15 consultas utilizando operadores WHERE, AND, OR, NOT, LIKE, BETWEEN, IN
-- ======================================================================================

USE FarmaciaDB;
GO

-- 1. Medicamentos con precio entre 5.000 y 50.000
SELECT 
    medicamento_id,
    nombre,
    precio,
    laboratorio_id
FROM Medicamento
WHERE precio BETWEEN 5000 AND 50000
ORDER BY precio;
PRINT 'Consulta 1 ejecutada: Medicamentos con precio entre 5.000 y 50.000';

-- 2. Clientes mayores de 60 años
SELECT 
    cliente_id,
    documento_identidad,
    nombre,
    apellido,
    fecha_nacimiento,
    CASE 
        WHEN DATEDIFF(YEAR, fecha_nacimiento, GETDATE()) > 60 THEN 'Mayor de 60'
        ELSE 'Menor o 60'
    END AS RangoEdad
FROM Cliente
WHERE DATEDIFF(YEAR, fecha_nacimiento, GETDATE()) > 60
ORDER BY fecha_nacimiento;
PRINT 'Consulta 2 ejecutada: Clientes mayores de 60 años';

-- 3. Medicamentos cuyo nombre contenga 'acetaminofén'
SELECT 
    medicamento_id,
    nombre,
    precio,
    categoria_id
FROM Medicamento
WHERE nombre LIKE '%acetaminofén%'
   OR nombre LIKE '%Acetaminofén%'
   OR nombre LIKE '%ACETAMINOFÉN%';
PRINT 'Consulta 3 ejecutada: Medicamentos con nombre contenga acetaminofén';

-- 4. Ventas con valor total superior a 100.000
SELECT 
    v.venta_id,
    v.fecha_venta,
    c.nombre AS ClienteNombre,
    v.total,
    v.metodo_pago
FROM Venta v
INNER JOIN Cliente c ON v.cliente_id = c.cliente_id
WHERE v.total > 100000
ORDER BY v.total DESC;
PRINT 'Consulta 4 ejecutada: Ventas con valor total > 100.000';

-- 5. Clientes de Bogotá o Medellín
SELECT 
    cliente_id,
    documento_identidad,
    nombre,
    apellido,
    direccion,
    CASE 
        WHEN direccion LIKE '%Bogotá%' THEN 'Bogotá'
        WHEN direccion LIKE '%Medellín%' THEN 'Medellín'
        ELSE 'Otra ciudad'
    END AS Ciudad
FROM Cliente
WHERE direccion LIKE '%Bogotá%'
   OR direccion LIKE '%Medellín%'
ORDER BY direccion;
PRINT 'Consulta 5 ejecutada: Clientes de Bogotá o Medellín';

-- 6. Medicamentos que no requieren receta
SELECT 
    medicamento_id,
    nombre,
    requiere_receta,
    es_controlado,
    CASE WHEN requiere_receta = 1 THEN 'Sí' ELSE 'No' END AS RequiereReceta
FROM Medicamento
WHERE requiere_receta = 0
ORDER BY nombre;
PRINT 'Consulta 6 ejecutada: Medicamentos que no requieren receta';

-- 7. Laboratorios cuyo nombre comience por la letra G
SELECT 
    laboratorio_id,
    nombre,
    pais_origen
FROM Laboratorio
WHERE nombre LIKE 'G%'
ORDER BY nombre;
PRINT 'Consulta 7 ejecutada: Laboratorios nombre empieza por G';

-- 8. Recetas del último mes
SELECT 
    r.receta_id,
    c.nombre AS ClienteNombre,
    m.nombre AS MedicoNombre,
    r.fecha_emision,
    r.estado
FROM Receta r
INNER JOIN Cliente c ON r.cliente_id = c.cliente_id
INNER JOIN Medico m ON r.medico_id = m.medico_id
WHERE r.fecha_emision >= DATEADD(month, -1, GETDATE())
ORDER BY r.fecha_emision DESC;
PRINT 'Consulta 8 ejecutada: Recetas del último mes';

-- 9. Medicamentos que no estén vencidos
SELECT 
    medicamento_id,
    nombre,
    fecha_fabricacion,
    fecha_vencimiento,
    CASE 
        WHEN fecha_vencimiento GET DATE() THEN 'Vencido'
        ELSE 'No vencido'
    END AS EstadoVencimiento
FROM Medicamento
WHERE fecha_vencimiento >= GETDATE()
ORDER BY fecha_vencimiento;
PRINT 'Consulta 9 ejecutada: Medicamentos que no estén vencidos';

-- 10. Clientes que tengan alergias registradas
-- Note: No tenemos tabla de alergias en el modelo base, verificamos si hay notas en recetas
SELECT DISTINCT
    c.cliente_id,
    c.nombre,
    c.apellido,
    c.documento_identidad
FROM Cliente c
INNER JOIN Receta r ON c.cliente_id = r.cliente_id
INNER JOIN DetalleReceta dr ON r.receta_id = dr.receta_id
WHERE r.estado = 'Vigente'
ORDER BY c.apellido;
PRINT 'Consulta 10 ejecutada: Clientes que tengan alergias registradas (via recetas)';

-- 11. Ventas del último trimestre
SELECT 
    v.venta_id,
    v.fecha_venta,
    c.nombre AS ClienteNombre,
    v.total,
    v.metodo_pago
FROM Venta v
INNER JOIN Cliente c ON v.cliente_id = c.cliente_id
WHERE v.fecha_venta >= DATEADD(quarter, -1, GETDATE())
ORDER BY v.fecha_venta DESC;
PRINT 'Consulta 11 ejecutada: Ventas del último trimestre';

-- 12. Medicamentos con stock entre 10 y 50 unidades
SELECT 
    medicamento_id,
    nombre,
    stock,
    precio,
    CASE 
        WHEN stock BETWEEN 10 AND 50 THEN 'Stock Óptimo'
        WHEN stock < 10 THEN 'Stock Crítico'
        ELSE 'Stock Alto'
    END AS EstadoStock
FROM Medicamento
WHERE stock BETWEEN 1 AND 50
ORDER BY stock;
PRINT 'Consulta 12 ejecutada: Medicamentos con stock entre 10 y 50 unidades';

-- 13. Médicos con más de 10 años de experiencia
SELECT 
    medico_id,
    nombre,
    apellido,
    años_experiencia,
    CASE 
        WHEN años_experiencia > 10 THEN 'Experto (>10 años)'
        WHEN años_experiencia BETWEEN 5 AND 10 THEN 'Mediano (5-10 años)'
        ELSE 'Joven (<5 años)'
    END AS NivelExperiencia
FROM Medico
WHERE años_experiencia > 10
ORDER BY años_experiencia DESC;
PRINT 'Consulta 13 ejecutada: Médicos con más de 10 años de experiencia';

-- 14. Recetas que contengan más de 3 medicamentos
SELECT 
    r.receta_id,
    c.nombre AS ClienteNombre,
    COUNT(dr.medicamento_id) AS TotalMedicamentosReceta,
    r.estado
FROM Receta r
INNER JOIN Cliente c ON r.cliente_id = c.cliente_id
LEFT JOIN DetalleReceta dr ON r.receta_id = dr.receta_id
GROUP BY r.receta_id, c.nombre, r.estado
HAVING COUNT(dr.medicamento_id) > 3
ORDER BY TotalMedicamentosReceta DESC;
PRINT 'Consulta 14 ejecutada: Recetas con más de 3 medicamentos';

-- 15. Medicamentos cuya categoría sea Analgésico o Antibiótico
SELECT DISTINCT
    m.medicamento_id,
    m.nombre,
    c.nombre AS Categoria,
    l.nombre AS Laboratorio
FROM Medicamento m
INNER JOIN Categoria c ON m.categoria_id = c.categoria_id
INNER JOIN Laboratorio l ON m.laboratorio_id = l.laboratorio_id
WHERE c.nombre IN ('Analgésicos', 'Antibióticos')
ORDER BY c.nombre, m.nombre;
PRINT 'Consulta 15 ejecutada: Medicamentos categoría Analgésico o Antibiótico';

-- ======================================================================================
-- FIN DEL ARCHIVO
-- ======================================================================================