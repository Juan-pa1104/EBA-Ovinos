-- ======================================================================================
-- ARCHIVO: 09_EjecucionProcedimientos.sql
-- DESCRIPCIÓN: Ejemplos de ejecución de los procedimientos almacenados
-- ======================================================================================

USE FarmaciaDB;
GO

-- ======================================================================================
-- EJECUCIÓN DE PROCEDIMIENTOS ALMACENADOS
-- ======================================================================================

-- 1. Ejecutar: usp_ListarMedicamentosDisponibles
PRINT '---';
PRINT 'Ejecutando: usp_ListarMedicamentosDisponibles';
PRINT '---';
EXEC usp_ListarMedicamentosDisponibles;

-- 2. Ejecutar: usp_BuscarMedicamentoPorNombre
PRINT '---';
PRINT 'Ejecutando: usp_BuscarMedicamentoPorNombre - "Ibuprofeno"';
PRINT '---';
EXEC usp_BuscarMedicamentoPorNombre 'Ibuprofeno';

PRINT '---';
PRINT 'Ejecutando: usp_BuscarMedicamentoPorNombre - "Amoxicilina"';
PRINT '---';
EXEC usp_BuscarMedicamentoPorNombre 'Amoxicilina';

-- 3. Ejecutar: usp_ContarRecetasMedico
PRINT '---';
PRINT 'Ejecutando: usp_ContarRecetasMedico - Médico ID 1 (María Gómez)';
PRINT '---';
EXEC usp_ContarRecetasMedico 1;

PRINT '---';
PRINT 'Ejecutando: usp_ContarRecetasMedico - Médico ID 2 (Carlos Rodríguez)';
PRINT '---';
EXEC usp_ContarRecetasMedico 2;

-- 4. Ejecutar: usp_RegistrarVenta (con transacción)
-- NOTA: Este procedimiento realiza operaciones sobre los datos, 
-- por lo que ejecutarlo modificará el stock y crearán ventas.
-- Ejemplo con cliente ID 1 (Juan Pérez) y 3 medicamentos
PRINT '---';
PRINT 'Ejecutando: usp_RegistrarVenta - Cliente 1, 3 medicamentos';
PRINT '---';
-- Usaremos medicamentos que tengan suficiente stock: 
-- El ibuprofeno (ID 18) tiene stock 180, paracetamol (ID 19) tiene stock 500
EXEC usp_RegistrarVenta 1, '18,19', '2,1', 'Tarjeta';

-- 5. Ejecutar: usp_ActualizarStockMedicamento
PRINT '---';
PRINT 'Ejecutando: usp_ActualizarStockMedicamento - Restar 10 al stock del medicamento ID 1';
PRINT '---';
EXEC usp_ActualizarStockMedicamento 1, -10;

PRINT '---';
PRINT 'Ejecutando: usp_ActualizarStockMedicamento - Sumar 50 al stock del medicamento ID 1';
PRINT '---';
EXEC usp_ActualizarStockMedicamento 1, 50;

-- Probar restricción: intentar dejar stock negativo
PRINT '---';
PRINT 'Ejecutando: usp_ActualizarStockMedicamento - Intentar restar stock suficiente para dejar negativo';
PRINT '---';
EXEC usp_ActualizarStockMedicamento 1, -200;

-- ======================================================================================
-- FIN DE EJECUCIÓN DE PROCEDIMIENTOS
-- ======================================================================================