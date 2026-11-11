-- ======================================================================================
-- ARCHIVO: 07_ConsultasJOIN.sql
-- DESCRIPCIÓN: 10 consultas utilizando INNER JOIN, LEFT JOIN y otras uniones
-- ======================================================================================

USE FarmaciaDB;
GO

-- 1. Medicamentos con su laboratorio
SELECT 
    m.medicamento_id,
    m.nombre AS NombreMedicamento,
    m.precio,
    l.nombre AS NombreLaboratorio,
    l.pais_origen
FROM Medicamento m
INNER JOIN Laboratorio l ON m.laboratorio_id = l.laboratorio_id
ORDER BY l.nombre, m.nombre;
PRINT 'Consulta 1 ejecutada: Medicamentos con su laboratorio';

-- 2. Ventas con información del cliente
SELECT 
    v.venta_id,
    v.fecha_venta,
    v.total,
    v.metodo_pago,
    c.documento_identidad,
    c.nombre AS NombreCliente,
    c.apellido
FROM Venta v
INNER JOIN Cliente c ON v.cliente_id = c.cliente_id
ORDER BY v.fecha_venta DESC;
PRINT 'Consulta 2 ejecutada: Ventas con información del cliente';

-- 3. Recetas con información del médico
SELECT 
    r.receta_id,
    r.fecha_emision,
    r.estado,
    m.nombre AS NombreMedico,
    m.apellido AS ApellidoMedico,
    m.numero_colegiado
FROM Receta r
INNER JOIN Medico m ON r.medico_id = m.medico_id
WHERE r.estado = 'Vigente'
ORDER BY r.fecha_emision DESC;
PRINT 'Consulta 3 ejecutada: Recetas con información del médico';

-- 4. Recetas con sus medicamentos
SELECT 
    r.receta_id,
    c.nombre AS NombreCliente,
    m.nombre AS NombreMedico,
    d.nombre AS NombreMedicamento,
    dr.cantidad,
    dr.dosis
FROM Receta r
INNER JOIN Cliente c ON r.cliente_id = c.cliente_id
INNER JOIN Medico m ON r.medico_id = m.medico_id
INNER JOIN DetalleReceta dr ON r.receta_id = dr.receta_id
INNER JOIN Medicamento d ON dr.medicamento_id = d.medicamento_id
ORDER BY r.receta_id, d.nombre;
PRINT 'Consulta 4 ejecutada: Recetas con sus medicamentos';

-- 5. Ventas con sus medicamentos
SELECT 
    v.venta_id,
    v.fecha_venta,
    d.nombre AS NombreMedicamento,
    dv.cantidad,
    dv.precio_unitario,
    dv.subtotal
FROM Venta v
INNER JOIN DetalleVenta dv ON v.venta_id = dv.venta_id
INNER JOIN Medicamento d ON dv.medicamento_id = d.medicamento_id
ORDER BY v.venta_id, d.nombre;
PRINT 'Consulta 5 ejecutada: Ventas con sus medicamentos';

-- 6. Clientes con número de compras
SELECT 
    c.cliente_id,
    c.nombre,
    c.apellido,
    c.documento_identidad,
    COUNT(v.venta_id) AS TotalCompras,
    SUM(v.total) AS TotalGastado
FROM Cliente c
LEFT JOIN Venta v ON c.cliente_id = v.cliente_id
GROUP BY c.cliente_id, c.nombre, c.apellido, c.documento_identidad
ORDER BY TotalCompras DESC;
PRINT 'Consulta 6 ejecutada: Clientes con número de compras';

-- 7. Medicamentos con su categoría
SELECT 
    m.medicamento_id,
    m.nombre AS NombreMedicamento,
    c.nombre AS NombreCategoria,
    c.descripcion AS DescripcionCategoria
FROM Medicamento m
INNER JOIN Categoria c ON m.categoria_id = c.categoria_id
ORDER BY c.nombre, m.nombre;
PRINT 'Consulta 7 ejecutada: Medicamentos con su categoría';

-- 8. Médicos con número de recetas
SELECT 
    m.medico_id,
    m.nombre,
    m.apellido,
    m.numero_colegiado,
    e.nombre AS Especialidad,
    COUNT(r.receta_id) AS TotalRecetas
FROM Medico m
INNER JOIN Especialidad e ON m.especialidad_id = e.especialidad_id
LEFT JOIN Receta r ON m.medico_id = r.medico_id
GROUP BY m.medico_id, m.nombre, m.apellido, m.numero_colegiado, e.nombre
ORDER BY TotalRecetas DESC;
PRINT 'Consulta 8 ejecutada: Médicos con número de recetas';

-- 9. Medicamentos con información de su stock y laboratorio
SELECT 
    m.medicamento_id,
    m.nombre AS NombreMedicamento,
    m.stock,
    m.precio,
    l.nombre AS NombreLaboratorio,
    l.pais_origen,
    c.nombre AS Categoria
FROM Medicamento m
INNER JOIN Laboratorio l ON m.laboratorio_id = l.laboratorio_id
INNER JOIN Categoria c ON m.categoria_id = c.categoria_id
WHERE m.stock < 30
ORDER BY m.stock ASC;
PRINT 'Consulta 9 ejecutada: Medicamentos con información de su stock y laboratorio';

-- 10. Clientes con el total de dinero gastado
SELECT 
    c.cliente_id,
    c.nombre,
    c.apellido,
    c.documento_identidad,
    COUNT(v.venta_id) AS TotalVentas,
    ISNULL(SUM(v.total), 0) AS TotalGastado,
    MAX(v.fecha_venta) AS UltimaCompra
FROM Cliente c
LEFT JOIN Venta v ON c.cliente_id = v.cliente_id
GROUP BY c.cliente_id, c.nombre, c.apellido, c.documento_identidad
ORDER BY TotalGastado DESC;
PRINT 'Consulta 10 ejecutada: Clientes con el total de dinero gastado';

-- ======================================================================================
-- FIN DEL ARCHIVO
-- ======================================================================================