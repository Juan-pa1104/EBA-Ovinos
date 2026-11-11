-- ======================================================================================
-- ARCHIVO: 08_ProcedimientosAlmacenados.sql
-- DESCRIPCIÓN: 5 procedimientos almacenados requeridos para el proyecto
-- ======================================================================================

USE FarmaciaDB;
GO

-- ======================================================================================
-- 1. usp_ListarMedicamentosDisponibles
-- Mostrar medicamentos disponibles.
-- Mostrar nombre, precio, stock y laboratorio.
-- ======================================================================================
CREATE PROCEDURE usp_ListarMedicamentosDisponibles
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        m.medicamento_id,
        m.nombre AS NombreMedicamento,
        m.precio,
        m.stock,
        l.nombre AS NombreLaboratorio,
        c.nombre AS NombreCategoria
    FROM Medicamento m
    INNER JOIN Laboratorio l ON m.laboratorio_id = l.laboratorio_id
    INNER JOIN Categoria c ON m.categoria_id = c.categoria_id
    WHERE m.stock > 0
    ORDER BY m.nombre;
END;
PRINT 'Procedimiento usp_ListarMedicamentosDisponibles creado.';

-- Ejemplo de ejecución:
-- EXEC usp_ListarMedicamentosDisponibles;

-- ======================================================================================
-- 2. usp_BuscarMedicamentoPorNombre
-- Recibir el nombre del medicamento como parámetro.
-- Buscar coincidencias utilizando LIKE.
-- ======================================================================================
CREATE PROCEDURE usp_BuscarMedicamentoPorNombre
    @NombreParametro VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        m.medicamento_id,
        m.nombre AS NombreMedicamento,
        m.precio,
        m.stock,
        l.nombre AS NombreLaboratorio,
        c.nombre AS NombreCategoria
    FROM Medicamento m
    INNER JOIN Laboratorio l ON m.laboratorio_id = l.laboratorio_id
    INNER JOIN Categoria c ON m.categoria_id = c.categoria_id
    WHERE m.nombre LIKE '%' + @NombreParametro + '%'
    ORDER BY m.nombre;
END;
PRINT 'Procedimiento usp_BuscarMedicamentoPorNombre creado.';

-- Ejemplo de ejecución:
-- EXEC usp_BuscarMedicamentoPorNombre 'Ibuprofeno';
-- EXEC usp_BuscarMedicamentoPorNombre 'Antibiótico';

-- ======================================================================================
-- 3. usp_ContarRecetasMedico
-- Recibir el ID del médico.
-- Mostrar la cantidad de recetas registradas para ese médico.
-- ======================================================================================
CREATE PROCEDURE usp_ContarRecetasMedico
    @MedicoID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        m.medico_id,
        m.nombre + ' ' + m.apellido AS NombreMedico,
        COUNT(r.receta_id) AS TotalRecetas,
        CASE 
            WHEN COUNT(r.receta_id) > 0 THEN 'Activo'
            ELSE 'Sin recetas'
        END AS Estado
    FROM Medico m
    LEFT JOIN Receta r ON m.medico_id = r.medico_id
    WHERE m.medico_id = @MedicoID
    GROUP BY m.medico_id, m.nombre, m.apellido;
END;
PRINT 'Procedimiento usp_ContarRecetasMedico creado.';

-- Ejemplo de ejecución:
-- EXEC usp_ContarRecetasMedico 1;
-- EXEC usp_ContarRecetasMedico 5;

-- ======================================================================================
-- 4. usp_RegistrarVenta
-- Recibir el cliente y los medicamentos vendidos.
-- Registrar la venta y sus detalles.
-- Actualizar el stock de los medicamentos.
-- Validar que exista suficiente inventario.
-- Utilizar transacciones BEGIN TRANSACTION, COMMIT y ROLLBACK.
-- Evitar ventas incompletas.
-- ======================================================================================
CREATE PROCEDURE usp_RegistrarVenta
    @ClienteID INT,
    @MedicamentoIDs VARCHAR(MAX),   -- Lista separada por comas de IDs de medicamentos
    @CantidadIDs VARCHAR(MAX),      -- Lista separada por comas de cantidades
    @MetodoPago VARCHAR(30)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Total DECIMAL(10,2) = 0;
    DECLARE @VentaID INT;
    DECLARE @Contador INT = 1;
    DECLARE @TotalMedicamentos INT;
    DECLARE @MedID INT;
    @Cantidad INT;
    DECLARE @PrecioUnitario DECIMAL(10,2);

    -- Iniciar transacción
    BEGIN TRANSACTION;

    -- Validar que el cliente existe
    IF NOT EXISTS (SELECT 1 FROM Cliente WHERE cliente_id = @ClienteID)
    BEGIN
        ROLLBACK;
        PRINT 'ERROR: El cliente especificado no existe.';
        RETURN;
    END;

    -- Insertar la venta principal
    INSERT INTO Venta (cliente_id, fecha_venta, total, metodo_pago, activa)
    VALUES (@ClienteID, GETDATE(), 0, @MetodoPago, 1);

    SET @VentaID = SCOPE_IDENTITY();

    -- Parsear los medicamentos y cantidades (formato CSV)
    -- Dividir las cadenas por coma
    CREATE TABLE #TempVentaDetalle (
        fila INT IDENTITY(1,1),
        medicamento_id INT,
        cantidad INT
    );

    -- Insertar en tabla temporal usando STRING_SPLIT (SQL Server 2016+)
    INSERT INTO #TempVentaDetalle (medicamento_id, cantidad)
    SELECT 
        CAST(value AS INT) AS medicamento_id,
        -- Obtener la cantidad correspondiente (asumimos mismo orden)
        (SELECT CAST(value AS INT) FROM (SELECT value, ROW_NUMBER() OVER (ORDER BY (SELECT NULL))) AS split2 WHERE ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) = split1.rowNum) AS cantidad
    FROM (SELECT value, ROW_NUMBER() OVER (ORDER BY (SELECT NULL))) AS split1
    FROM STRING_SPLIT(@MedicamentoIDs, ',');

    -- Obtener el total de registros insertados
    SELECT @TotalMedicamentos = COUNT(*) FROM #TempVentaDetalle;

    -- Validar que tengamos medicamentos y cantidades
    IF @TotalMedicamentos = 0 OR @TotalMedicamentos IS NULL
    BEGIN
        ROLLBACK;
        PRINT 'ERROR: No se proporcionaron medicamentos válidos para la venta.';
        DROP TABLE #TempVentaDetalle;
        RETURN;
    END;

    -- Procesar cada medicamento de la venta
    WHILE @Contador <= @TotalMedicamentos
    BEGIN
        SELECT @MedID = medicamento_id, @Cantidad = cantidad FROM #TempVentaDetalle WHERE fila = @Contador;

        -- Validar que el medicamento existe y tiene suficiente stock
        IF NOT EXISTS (SELECT 1 FROM Medicamento WHERE medicamento_id = @MedID AND stock >= @Cantidad)
        BEGIN
            ROLLBACK;
            PRINT 'ERROR: Stock insuficiente para el medicamento ID ' + CAST(@MedID AS VARCHAR) + 
                  '. Solicitado: ' + CAST(@Cantidad AS VARCHAR) + ', Disponible: Stock actual.';
            DROP TABLE #TempVentaDetalle;
            RETURN;
        END;

        -- Obtener precio unitario del medicamento
        SELECT @PrecioUnitario = precio FROM Medicamento WHERE medicamento_id = @MedID;

        -- Insertar detalle de venta
        INSERT INTO DetalleVenta (venta_id, medicamento_id, cantidad, precio_unitario, subtotal)
        VALUES (@VentaID, @MedID, @Cantidad, @PrecioUnitario, @PrecioUnitario * @Cantidad);

        -- Actualizar el stock del medicamento (restar la cantidad vendida)
        UPDATE Medicamento
        SET stock = stock - @Cantidad
        WHERE medicamento_id = @MedID;

        -- Acumular el total de la venta
        SET @Total = @Total + (@PrecioUnitario * @Cantidad);

        SET @Contador = @Contador + 1;
    END;

    -- Actualizar el total de la venta en la tabla Venta
    UPDATE Venta
    SET total = @Total
    WHERE venta_id = @VentaID;

    -- Confirmar transacción
    COMMIT TRANSACTION;

    PRINT 'Venta registrada exitosamente. Venta ID: ' + CAST(@VentaID AS VARCHAR) + 
          '. Total: $' + CAST(@Total AS VARCHAR);

    -- Limpiar tabla temporal
    DROP TABLE #TempVentaDetalle;
END;
PRINT 'Procedimiento usp_RegistrarVenta creado.';

-- Ejemplo de ejecución:
-- EXEC usp_RegistrarVenta 1, '1,5,9', '2,3,1', 'Tarjeta';
-- Esto vendería: medicamento 1 (cant 2), medicamento 5 (cant 3), medicamento 9 (cant 1)

-- ======================================================================================
-- 5. usp_ActualizarStockMedicamento
-- Recibir el ID del medicamento y la cantidad que se desea modificar.
-- Actualizar el inventario.
-- Impedir que el stock quede negativo.
-- ======================================================================================
CREATE PROCEDURE usp_ActualizarStockMedicamento
    @MedicamentoID INT,
    @CantidadModificar INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Verificar que el medicamento existe
    IF NOT EXISTS (SELECT 1 FROM Medicamento WHERE medicamento_id = @MedicamentoID)
    BEGIN
        PRINT 'ERROR: El medicamento ID ' + CAST(@MedicamentoID AS VARCHAR) + ' no existe.';
        RETURN;
    END;

    -- Verificar que el stock actual no quedará negativo después de la modificación
    IF (SELECT stock FROM Medicamento WHERE medicamento_id = @MedicamentoID) + @CantidadModificar < 0
    BEGIN
        PRINT 'ERROR: No se puede reducir el stock. El resultado sería negativo.' +
              CHAR(13) + 'Stock actual: ' + CAST((SELECT stock FROM Medicamento WHERE medicamento_id = @MedicamentoID) AS VARCHAR) +
              CHAR(13) + 'Modificación solicitada: ' + CAST(@CantidadModificar AS VARCHAR);
        RETURN;
    END;

    -- Si la cantidad es positiva, es una reposición; si es negativa, es una venta/uso
    UPDATE Medicamento
    SET stock = stock + @CantidadModificar
    WHERE medicamento_id = @MedicamentoID;

    PRINT 'Stock actualizado correctamente.' +
          CHAR(13) + 'Medicamento ID: ' + CAST(@MedicamentoID AS VARCHAR) +
          CHAR(13) + 'Cantidad modificada: ' + CAST(@CantidadModificar AS VARCHAR) +
          CHAR(13) + 'Nuevo stock: ' + CAST((SELECT stock FROM Medicamento WHERE medicamento_id = @MedicamentoID) AS VARCHAR);
END;
PRINT 'Procedimiento usp_ActualizarStockMedicamento creado.';

-- Ejemplo de ejecución:
-- EXEC usp_ActualizarStockMedicamento 1, -5;  -- Restar 5 del stock
-- EXEC usp_ActualizarStockMedicamento 1, 10; -- Sumar 10 al stock

-- ======================================================================================
-- FIN DEL ARCHIVO
-- ======================================================================================