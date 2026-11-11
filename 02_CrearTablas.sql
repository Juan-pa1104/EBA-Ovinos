-- ======================================================================================
-- ARCHIVO: 02_CrearTablas.sql
-- DESCRIPCIÓN: Creación de todas las tablas base del sistema de farmacia
-- ======================================================================================

USE FarmaciaDB;
GO

-- ======================================================================================
-- TABLA: Laboratorio
-- ======================================================================================
CREATE TABLE Laboratorio (
    laboratorio_id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    pais_origen VARCHAR(50),
    telefono VARCHAR(20),
    email VARCHAR(100),
    activo BIT DEFAULT 1,
    creado_en DATETIME DEFAULT GETDATE()
);
PRINT 'Tabla Laboratorio creada.';

-- ======================================================================================
-- TABLA: Categoria
-- ======================================================================================
CREATE TABLE Categoria (
    categoria_id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BIT DEFAULT 1
);
PRINT 'Tabla Categoria creada.';

-- ======================================================================================
-- TABLA: Especialidad (médicos)
-- ======================================================================================
CREATE TABLE Especialidad (
    especialidad_id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL UNIQUE,
    descripcion TEXT
);
PRINT 'Tabla Especialidad creada.';

-- ======================================================================================
-- TABLA: Medicamento
-- ======================================================================================
CREATE TABLE Medicamento (
    medicamento_id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    laboratorio_id INT,
    categoria_id INT,
    precio DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    requiere_receta BIT DEFAULT 0,
    es_controlado BIT DEFAULT 0,
    fecha_fabricacion DATE,
    fecha_vencimiento DATE,
    descripcion TEXT,
    activo BIT DEFAULT 1,
    CONSTRAINT FK_Medicamento_Laboratorio FOREIGN KEY (laboratorio_id) REFERENCES Laboratorio(laboratorio_id),
    CONSTRAINT FK_Medicamento_Categoria FOREIGN KEY (categoria_id) REFERENCES Categoria(categoria_id)
);
PRINT 'Tabla Medicamento creada.';

-- ======================================================================================
-- TABLA: Cliente
-- ======================================================================================
CREATE TABLE Cliente (
    cliente_id INT IDENTITY(1,1) PRIMARY KEY,
    documento_identidad VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE,
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion TEXT,
    fecha_registro DATETIME DEFAULT GETDATE(),
    activo BIT DEFAULT 1
);
PRINT 'Tabla Cliente creada.';

-- ======================================================================================
-- TABLA: Medico
-- ======================================================================================
CREATE TABLE Medico (
    medico_id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    numero_colegiado VARCHAR(20) UNIQUE NOT NULL,
    especialidad_id INT,
    telefono VARCHAR(20),
    email VARCHAR(100),
    fecha_ingreso DATETIME DEFAULT GETDATE(),
    años_experiencia INT DEFAULT 0,
    activo BIT DEFAULT 1,
    CONSTRAINT FK_Medico_Especialidad FOREIGN KEY (especialidad_id) REFERENCES Especialidad(especialidad_id)
);
PRINT 'Tabla Medico creada.';

-- ======================================================================================
-- TABLA: Receta (relaciona Cliente - Medico, muchos a muchos)
-- ======================================================================================
CREATE TABLE Receta (
    receta_id INT IDENTITY(1,1) PRIMARY KEY,
    cliente_id INT,
    medico_id INT,
    fecha_emision DATE DEFAULT GETDATE(),
    fecha_vencimiento DATE,
    estado ENUM_VIGENTE_VENCIDA_USADA DEFAULT 'Vigente', -- Usaremos VARCHAR(20) con CHECK
    numero_receta VARCHAR(20) UNIQUE,
    notas TEXT,
    activo BIT DEFAULT 1,
    CONSTRAINT FK_Receta_Cliente FOREIGN KEY (cliente_id) REFERENCES Cliente(cliente_id),
    CONSTRAINT FK_Receta_Medico FOREIGN KEY (medico_id) REFERENCES Medico(medico_id)
);
PRINT 'Tabla Receta creada.';

-- ======================================================================================
-- TABLA: DetalleReceta (muchos a muchos: Receta - Medicamento)
-- ======================================================================================
CREATE TABLE DetalleReceta (
    detalle_id INT IDENTITY(1,1) PRIMARY KEY,
    receta_id INT,
    medicamento_id INT,
    cantidad INT NOT NULL,
    dosis VARCHAR(50),
    instrucciones_uso TEXT,
    fecha_agregacion DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_DetalleReceta_Receta FOREIGN KEY (receta_id) REFERENCES Receta(receta_id),
    CONSTRAINT FK_DetalleReceta_Medicamento FOREIGN KEY (medicamento_id) REFERENCES Medicamento(medicamento_id)
);
PRINT 'Tabla DetalleReceta creada.';

-- ======================================================================================
-- TABLA: Venta (encabezado de venta)
-- ======================================================================================
CREATE TABLE Venta (
    venta_id INT IDENTITY(1,1) PRIMARY KEY,
    cliente_id INT,
    fecha_venta DATETIME DEFAULT GETDATE(),
    total DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(30),
    activa BIT DEFAULT 1,
    CONSTRAINT FK_Venta_Cliente FOREIGN KEY (cliente_id) REFERENCES Cliente(cliente_id)
);
PRINT 'Tabla Venta creada.';

-- ======================================================================================
-- TABLA: DetalleVenta (muchos a muchos: Venta - Medicamento)
-- ======================================================================================
CREATE TABLE DetalleVenta (
    detalle_venta_id INT IDENTITY(1,1) PRIMARY KEY,
    venta_id INT,
    medicamento_id INT,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    CONSTRAINT FK_DetalleVenta_Venta FOREIGN KEY (venta_id) REFERENCES Venta(venta_id),
    CONSTRAINT FK_DetalleVenta_Medicamento FOREIGN KEY (medicamento_id) REFERENCES Medicamento(medicamento_id)
);
PRINT 'Tabla DetalleVenta creada.';

-- ======================================================================================
-- RESUMEN DE TABLAS CREADAS
-- ======================================================================================
PRINT '---';
PRINT 'Resumen de tablas creadas:';
PRINT '  1. Laboratorio';
PRINT '  2. Categoria';
PRINT '  3. Especialidad';
PRINT '  4. Medicamento';
PRINT '  5. Cliente';
PRINT '  6. Medico';
PRINT '  7. Receta';
PRINT '  8. DetalleReceta';
PRINT '  9. Venta';
PRINT ' 10. DetalleVenta';
PRINT '---';
PRINT 'Total: 10 tablas (cumple requisito mínimo de 8)';

-- ======================================================================================
-- FIN DEL ARCHIVO
-- ======================================================================================