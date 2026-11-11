-- ======================================================================================
-- ARCHIVO: 01_CrearBaseDatos.sql
-- DESCRIPCIÓN: Creación de la base de datos y selección para su uso
-- ======================================================================================

-- Crear la base de datos si no existe
CREATE DATABASE FarmaciaDB;
GO

-- Usar la base de datos creada
USE FarmaciaDB;
GO

-- Mostrar confirmación
PRINT 'Base de datos FarmaciaDB creada y seleccionada correctamente.';
PRINT '---';
SELECT DB_NAME() AS BaseDeDatosActual;

-- ======================================================================================
-- FIN DEL ARCHIVO
-- ======================================================================================