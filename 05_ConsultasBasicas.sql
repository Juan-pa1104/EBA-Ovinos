-- ======================================================================================
-- ARCHIVO: 05_ConsultasBasicas.sql
-- DESCRIPCIÓN: 10 consultas básicas sobre la base de datos de farmacia
-- ======================================================================================

USE FarmaciaDB;
GO

-- 1. Medicamentos disponibles ( aquellos con stock > 0 )
SELECT 
    m.medicamento_id,
    m.nombre AS NombreMedicamento,
    m.precio,
    m.stock,
    l.nombre AS Laboratorio,
    c.nombre AS Categoria
FROM Medicamento m
INNER JOIN Laboratorio l ON m.laboratorio_id = l.laboratorio_id
INNER JOIN Categoria c ON m.categoria_id = c.categoria_id
WHERE m.stock > 0
ORDER BY m.nombre;
PRINT 'Consulta 1 ejecutada: Medicamentos disponibles con stock > 0';

-- 2. Laboratorios
SELECT 
    laboratorio_id,
    nombre,
    pais_origen,
    activo
FROM Laboratorio
ORDER BY nombre;
PRINT 'Consulta 2 ejecutada: Lista de laboratorios';

-- 3. Clientes activos
SELECT 
    cliente_id,
    documento_identidad,
    nombre,
    apellido,
    email,
    fecha_registro
FROM Cliente
WHERE activo = 1
ORDER apellido;
PRINT 'Consulta 3 ejecutada: Clientes activos';

-- 4. Ventas del día (hoy - usaremos fecha actual)
SELECT 
    v.venta_id,
    v.fecha_venta,
    c.nombre AS ClienteNombre,
    c.apellido,
    v.total,
    v.metodo_pago
FROM Venta v
INNER JOIN Cliente c ON v.cliente_id = c.cliente_id
WHERE v.fecha_venta = CAST(GETDATE() AS DATE)
ORDER BY v.fecha_venta DESC;
PRINT 'Consulta 4 ejecutada: Ventas del día';

-- 5. Médicos por especialidad
SELECT 
    e.nombre AS Especialidad,
    m.nombre AS NombreMedico,
    m.apellido,
    m.años_experiencia
FROM Medico m
INNER JOIN Especialidad e ON m.especialidad_id = e.especialidad_id
ORDER BY e.nombre, m.apellido;
PRINT 'Consulta 5 ejecutada: Médicos por especialidad';

-- 6. Recetas vigentes
SELECT 
    r.receta_id,
    c.nombre AS ClienteNombre,
    c.apellido,
    m.nombre AS MedicoNombre,
    m.apellido AS MedicoApellido,
    r.fecha_emision,
    r.estado
FROM Receta r
INNER JOIN Cliente c ON r.cliente_id = c.cliente_id
INNER JOIN Medico m ON r.medico_id = m.medico_id
WHERE r.estado = 'Vigente'
ORDER BY r.fecha_emision DESC;
PRINT 'Consulta 6 ejecutada: Recetas vigentes';

-- 7. Medicamentos por categoría
SELECT 
    c.nombre AS Categoria,
    COUNT(m.medicamento_id) AS TotalMedicamentos,
    SUM(m.stock) AS StockTotal,
    AVG(m.precio) AS PrecioPromedio
FROM Medicamento m
INNER JOIN Categoria c ON m.categoria_id = c.categoria_id
GROUP BY c.nombre
ORDER BY c.nombre;
PRINT 'Consulta 7 ejecutada: Medicamentos por categoría';

-- 8. Medicamentos con stock bajo (stock <= 20)
SELECT 
    m.medicamento_id,
    m.nombre AS NombreMedicamento,
    m.stock,
    c.nombre AS Categoria,
    l.nombre AS Laboratorio
FROM Medicamento m
INNER JOIN Categoria c ON m.categoria_id = c.categoria_id
INNER JOIN Laboratorio l ON m.laboratorio_id = l.laboratorio_id
WHERE m.stock <= 20
ORDER BY m.stock ASC;
PRINT 'Consulta 8 ejecutada: Medicamentos con stock bajo';

-- 9. Clientes con recetas
SELECT DISTINCT
    c.cliente_id,
    c.nombre,
    c.apellido,
    c.documento_identidad,
    COUNT(r.receta_id) AS TotalRecetas
FROM Cliente c
LEFT JOIN Receta r ON c.cliente_id = r.cliente_id
GROUP BY c.cliente_id, c.nombre, c.apellido, c.documento_identidad
HAVING COUNT(r.receta_id) > 0
ORDER BY TotalRecetas DESC;
PRINT 'Consulta 9 ejecutada: Clientes con recetas';

-- 10. Medicamentos que requieren receta
SELECT DISTINCT
    m.medicamento_id,
    m.nombre AS NombreMedicamento,
    m.requiere_receta,
    m.es_controlado,
    CASE WHEN m.requiere_receta = 1 THEN 'SI' ELSE 'NO' END AS RequiereRecetaTexto
FROM Medicamento m
WHERE m.requiere_receta = 1
ORDER BY m.nombre;
PRINT 'Consulta 10 ejecutada: Medicamentos que requieren receta';

-- ======================================================================================
-- FIN DEL ARCHIVO
-- ======================================================================================