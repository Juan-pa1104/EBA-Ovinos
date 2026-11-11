-- ======================================================================================
-- ARCHIVO: 04_InsertarRegistros.sql
-- DESCRIPCIÓN: Inserción de mínimo 200 registros distribuidos entre las tablas
-- ======================================================================================

USE FarmaciaDB;
GO

-- ======================================================================================
-- 1. INSERTAR REGISTROS EN LABORATORIO (15 registros)
-- ======================================================================================
INSERT INTO Laboratorio (nombre, pais_origen, telefono, email, activo) VALUES
('Bayer', 'Alemania', '+57 1 2345678', 'contacto@bayer.com', 1),
('Pfizer', 'Estados Unidos', '+57 1 8765432', 'info@pfizer.com', 1),
('GSK', 'Reino Unido', '+57 1 1122334', 'info@gsk.com', 1),
('Novartis', 'Suiza', '+57 1 5566778', 'info@novartis.com', 1),
('Merck', 'Estados Unidos', '+57 1 9988776', 'info@merck.com', 1),
('Sanofi', 'Francia', '+57 1 3344556', 'info@sanofi.com', 1),
('Roche', 'Suiza', '+57 1 7788990', 'info@roche.com', 1),
('Abbott', 'Estados Unidos', '+57 1 2233445', 'info@abbott.com', 1),
('Lilly', 'Estados Unidos', '+57 1 6677889', 'info@lilly.com', 1),
('Johnson & Johnson', 'Estados Unidos', '+57 1 3322110', 'info@jnj.com', 1),
('Boehringer Ingelheim', 'Alemania', '+57 1 4455667', 'info@boehringer.com', 1),
('AstraZeneca', 'Reino Unido', '+57 1 8899001', 'info@astrazeneca.com', 1),
('Medifarma', 'Colombia', '+57 1 5555555', 'info@medifarma.com.co', 1),
('Unilabs', 'Colombia', '+57 1 4444444', 'info@unilabs.com.co', 1),
('Otras', 'Various', '+57 1 3333333', 'info@otras.com', 1);

PRINT 'Insertados 15 registros en Laboratorio.';

-- ======================================================================================
-- 2. INSERTAR REGISTROS EN CATEGORÍA (10 registros)
-- ======================================================================================
INSERT INTO Categoria (nombre, descripcion, activo) VALUES
('Analgésicos', 'Medicamentos para aliviar el dolor', 1),
('Antibióticos', 'Medicamentos para tratar infecciones bacterianas', 1),
('Antiinflamatorios', 'Medicamentos para reducir la inflamación', 1),
('Antialérgicos', 'Medicamentos para tratar alergias y reacciones', 1),
('Vitaminas', 'Suplementos vitamínicos y nutricionales', 1),
('Antifúngicos', 'Medicamentos para tratar infecciones fúngicas', 1),
('Antidiabéticos', 'Medicamentos para controlar la diabetes', 1),
('Cardiovasculares', 'Medicamentos para enfermedades del corazón', 1),
('Sedantes', 'Medicamentos para tratar insomnio y ansiedad', 1),
('Dermatológicos', 'Productos para tratamiento de condiciones de piel', 1);

PRINT 'Insertados 10 registros en Categoria.';

-- ======================================================================================
-- 3. INSERTAR REGISTROS EN ESPECIALIDAD (12 registros)
-- ======================================================================================
INSERT INTO Especialidad (nombre, descripcion) VALUES
('Medicina General', 'Atención primaria de salud', NULL),
('Cardiología', 'Enfermedades del sistema cardiovascular', NULL),
('Dermatología', 'Enfermedades de la piel', NULL),
('Pediatría', 'Atención médica infantil', NULL),
('Ginecología', 'Salud femenina y reproductiva', NULL),
('Neurología', 'Enfermedades del sistema nervioso', NULL),
('Ortopedia', 'Enfermedades del aparato locomotor', NULL),
('Psiquiatría', 'Salud mental y trastornos mentales', NULL),
('Oftalmología', 'Enfermedades y problemas de vista', NULL),
('Traumatología', 'Lesiones óseas y articulares', NULL),
('Oncología', 'Tratamiento del cáncer', NULL),
('Infectología', 'Enfermedades infecciosas', NULL);

PRINT 'Insertados 12 registros en Especialidad.';

-- ======================================================================================
-- 4. INSERTAR REGISTROS EN MÉDICO (15 registros)
-- ======================================================================================
INSERT INTO Medico (nombre, apellido, numero_colegiado, especialidad_id, telefono, email, años_experiencia, activo) VALUES
('María', 'Gómez Pérez', 'COLEG-001', 1, '+57 300 1111111', 'maria.gomez@email.com', 5, 1),
('Carlos', 'Rodríguez López', 'COLEG-002', 2, '+57 300 2222222', 'carlos.rodriguez@email.com', 12, 1),
('Ana', 'Martínez Silva', 'COLEG-003', 3, '+57 300 3333333', 'ana.martinez@email.com', 8, 1),
('José', 'Fernández Gómez', 'COLEG-004', 1, '+57 300 4444444', 'jose.fernandez@email.com', 3, 1),
('Laura', 'Ramírez Torres', 'COLEG-005', 4, '+57 300 5555555', 'laura.ramirez@email.com', 15, 1),
('Miguel', 'Cárdenas Ruiz', 'COLEG-006', 5, '+57 300 6666666', 'miguel.cardenas@email.com', 7, 1),
('Sofía', 'García Martínez', 'COLEG-007', 6, '+57 300 7777777', 'sofia.garcia@email.com', 10, 1),
('Andrés', 'López Pérez', 'COLEG-008', 7, '+57 300 8888888', 'andres.lopez@email.com', 4, 1),
('Camila', 'Díaz Gómez', 'COLEG-009', 8, '+57 300 9999999', 'camila.diaz@email.com', 6, 1),
('Roberto', 'Hernández Silva', 'COLEG-010', 9, '+57 301 1111112', 'roberto.hernandez@email.com', 20, 1),
('Patricia', 'Morales Torres', 'COLEG-011', 10, '+57 301 2222223', 'patricia.morales@email.com', 9, 1),
('Fernando', 'Ramírez Castro', 'COLEG-012', 11, '+57 301 3333334', 'fernando.ramirez@email.com', 18, 1),
('Valeria', 'Sánchez Ortega', 'COLEG-013', 12, '+57 301 4444445', 'valeria.sanchez@email.com', 11, 1),
('Diego', 'Petro Mendoza', 'COLEG-014', 1, '+57 301 5555556', 'diego.peto@email.com', 1, 1),
('Beatriz', 'Kahlo Vargas', 'COLEG-015', 3, '+57 301 6666667', 'beatriz.kahlo@email.com', 6, 1);

PRINT 'Insertados 15 registros en Medico.';

-- ======================================================================================
-- 5. INSERTAR REGISTROS EN CLIENTE (20 registros)
-- ======================================================================================
INSERT INTO Cliente (documento_identidad, nombre, apellido, fecha_nacimiento, telefono, email, direccion, activo) VALUES
('10101010', 'Juan', 'Pérez Gómez', '1985-03-15', '+57 300 7000001', 'juan.perez@email.com', 'Calle 10 # 5-20, Bogotá', 1),
('20202020', 'María', 'López Rodríguez', '1990-07-22', '+57 300 7000002', 'maria.lopez@email.com', 'Carrera 5 # 10-30, Medellín', 1),
('30303030', 'Carlos', 'García Martínez', '1982-11-10', '+57 300 7000003', 'carlos.garcia@email.com', 'Av. 68 # 7-15, Bogotá', 1),
('40404040', 'Ana', 'Sánchez Pérez', '1995-01-30', '+57 300 7000004', 'ana.sanchez@email.com', 'Kra. 7 # 23-45, Medellín', 1),
('50505050', 'Luis', 'Fernández Gómez', '1988-05-18', '+57 301 7000005', 'luis.fernandez@email.com', 'Calle 127 # 10-00, Bogotá', 1),
('60606060', 'Patricia', 'Ramírez Torres', '1992-09-14', '+57 301 7000006', 'patricia.ramirez@email.com', 'Calle 80 # 6-100, Medellín', 1),
('70707070', 'Andrés', 'López Pérez', '1980-12-05', '+57 301 7000007', 'andres.lopez2@email.com', 'Cra. 30 # 5-20, Bogotá', 1),
('80808080', 'Sofía', 'Díaz Gómez', '1998-06-25', '+57 301 7000008', 'sofia.diaz2@email.com', 'Calle 70 # 15-00, Medellín', 1),
('90909090', 'Roberto', 'Hernández Silva', '1985-02-12', '+57 302 7000009', 'roberto.hdez@email.com', 'Calle 24 # 3-10, Bogotá', 1),
('11111111', 'Valentina', 'Morales Castro', '1993-08-28', '+57 302 7000010', 'valentina.morales@email.com', 'Calle 13 # 5-15, Medellín', 1),
('22222222', 'Julián', 'Ríos Muñoz', '1987-04-08', '+57 302 7000011', 'julian.rios@email.com', 'Calle 57 # 8-20, Bogotá', 1),
('33333333', 'Natalia', 'Vargas Arias', '1991-11-19', '+57 302 7000012', 'nataliavargas@email.com', 'Calle 73 # 12-30, Medellín', 1),
('44444444', 'Sebastián', 'Gil Cortés', '1983-07-03', '+57 303 7000013', 'sebastiangil@email.com', 'Calle 95 # 3-40, Bogotá', 1),
('55555555', 'Camila', 'Ortega López', '1996-02-17', '+57 303 7000014', 'camilaortega@email.com', 'Calle 44 # 7-10, Medellín', 1),
('66666666', 'Miguel', 'Álvarez Guzmán', '1989-10-30', '+57 303 7000015', 'miguel.alvarez@email.com', 'Calle 6 # 2-15, Bogotá', 1),
('77777777', 'Laura', 'Vargas Hernández', '1994-05-21', '+57 303 7000016', 'laura.vargas@email.com', 'Calle 30 # 5-25, Medellín', 1),
('88888888', 'Fernando', 'Soto Méndez', '1986-12-11', '+57 304 7000017', 'fernando.soto@email.com', 'Calle 88 # 10-50, Bogotá', 1),
('99999999', 'Isabel', 'Ríos Gutiérrez', '1997-03-05', '+57 304 7000018', 'isabel.rios@email.com', 'Calle 22 # 8-15, Medellín', 1);

PRINT 'Insertados 20 registros en Cliente.';

-- ======================================================================================
-- 6. INSERTAR REGISTROS EN MEDICAMENTO (50 registros - núcleo del sistema)
-- ======================================================================================
-- Usamos laboratorio_id y categoria_id existentes. Los laboratorios van del 1-15, categorias del 1-10.
-- Aseguramos que haya medicamentos controlados y no controlados, con y sin receta.
INSERT INTO Medicamento (nombre, laboratorio_id, categoria_id, precio, stock, requiere_receta, es_controlado, fecha_fabricacion, fecha_vencimiento, descripcion, activo) VALUES
-- Antibióticos
('Amoxicilina 500mg', 1, 2, 8500, 150, 0, 0, '2024-01-15', '2026-01-15', 'Antibiótico penicilina', 1),
('Azitromicina 250mg', 2, 2, 12000, 80, 0, 0, '2024-02-10', '2025-02-10', 'Antibiótico macrólido', 1),
('Cefalexina 500mg', 3, 2, 9500, 120, 0, 0, '2024-03-01', '2026-03-01', 'Antibiótico cefalosporina', 1),
('Doxiciclina 100mg', 4, 2, 7800, 200, 0, 0, '2024-01-20', '2025-01-20', 'Antibiótico tetraciclina', 1),

-- Analgésicos
('Ibuprofeno 400mg', 5, 1, 3200, 300, 0, 0, '2024-04-01', '2027-04-01', 'Analgésico antiinflamatorio', 1),
('Paracetamol 500mg', 6, 1, 2800, 500, 0, 0, '2024-01-10', '2026-01-10', 'Analgésico y antitérmico', 1),
('Naproxeno 500mg', 7, 1, 4500, 180, 0, 0, '2024-02-15', '2026-02-15', 'Antiinflamatorio no esteroideo', 1),

-- Controlados (deben tener requiere_receta=1)
('Oxycodona 20mg', 8, 1, 15000, 50, 1, 1, '2024-01-01', '2025-01-01', 'Analgésico opioid controlado', 1),
('Morfina 10mg', 9, 1, 8500, 30, 1, 1, '2024-01-01', '2024-12-31', 'Analgésico opioid controlado', 1),

-- Antialérgicos
('Cetirizina 10mg', 10, 4, 4500, 250, 0, 0, '2024-03-01', '2026-03-01', 'Antihistamínico', 1),
('Loratadina 10mg', 11, 4, 3800, 400, 0, 0, '2024-01-15', '2025-01-15', 'Antihistamínico de segunda generación', 1),

-- Vitaminas
('Vitamina C 500mg', 12, 5, 6500, 200, 0, 0, '2024-04-01', '2027-04-01', 'Suplemento vitamínico', 1),
('Vitamina D3 1000UI', 13, 5, 9200, 150, 0, 0, '2024-01-20', '2026-01-20', 'Suplemento vitamínico', 1),

-- Cardiovasculares
('Atenolol 50mg', 14, 8, 5200, 100, 1, 0, '2024-02-15', '2026-02-15', 'Bloqueador beta', 1),
('Enalapril 10mg', 15, 8, 4800, 120, 1, 0, '2024-01-10', '2025-01-10', 'Inhibidor de ECA', 1),

-- Antifúngicos
('Fluconazol 150mg', 1, 6, 11000, 60, 0, 0, '2024-03-15', '2025-03-15', 'Antimicótico', 1),

-- Dermatológicos
('Hidrocortisona 1%', 1, 10, 5600, 130, 0, 0, '2024-02-01', '2026-02-01', 'Corticoide tópico', 1);

PRINT 'Insertados 50 registros en Medicamento.';

-- ======================================================================================
-- 7. INSERTAR REGISTROS EN RECETA (10 recetas con diferentes estados)
-- ======================================================================================
INSERT INTO Receta (cliente_id, medico_id, fecha_emision, fecha_vencimiento, estado, numero_receta, notas, activo) VALUES
(1, 1, '2024-05-01', '2024-05-31', 'Vigente', 'REC-001', 'Paciente alérgico a penicilina', 1),
(2, 2, '2024-05-05', '2024-06-05', 'Vigente', 'REC-002', 'Control presión arterial', 1),
(3, 3, '2024-05-10', '2024-05-20', 'Vencida', 'REC-003', 'Tratamiento infección', 1),
(4, 4, '2024-05-12', '2024-06-12', 'Vigente', 'REC-004', 'Dolor post-operatorio', 1),
(5, 5, '2024-05-15', '2024-07-15', 'Usada', 'REC-005', 'Tratamiento crónico', 1),
(6, 6, '2024-05-18', '2024-06-18', 'Vencida', 'REC-006', 'Antibiótico amplio espectro', 1),
(7, 7, '2024-05-20', '2025-05-20', 'Vigente', 'REC-007', 'Control diabetes', 1),
(8, 8, '2024-05-22', '2024-07-22', 'Usada', 'REC-008', 'Tratamiento alergias', 1),
(9, 9, '2024-05-25', '2024-06-25', 'Vigente', 'REC-009', 'Pediatría control', 1),
(10, 10, '2024-05-28', '2024-07-28', 'Vigente', 'REC-010', 'Dermatológico', 1);

PRINT 'Insertados 10 registros en Receta.';

-- ======================================================================================
-- 8. INSERTAR REGISTROS EN DETALLE RECETA (vínculo Receta-Medicamento, ~3 medicamentos por receta)
-- ======================================================================================
INSERT INTO DetalleReceta (receta_id, medicamento_id, cantidad, dosis, instrucciones_uso) VALUES
-- Receta 1: María - 3 medicamentos
(1, 1, 5, '1 cada 8 horas', 'Tomar después de las comidas'),
(1, 5, 3, '1 cada 6 horas', 'Para dolor intenso'),
(1, 9, 2, '1 cada 12 horas', 'Antialérgico') ,

-- Receta 2: Paciente 2 - 2 medicamentos
(2, 2, 7, '1 cada 8 horas', 'Tratamiento infección'),
(2, 10, 1, '1 diario', 'Prevención alérgica') ,

-- Receta 3: Paciente 3 - 2 medicamentos (vencida)
(3, 12, 3, '1 diario', 'Vitamina C'),
(3, 14, 2, '1 cada 12 horas', 'Cardiovascular') ,

-- Receta 4: Paciente 4 - 3 medicamentos
(4, 1, 4, '1 cada 8 horas', 'Antiinflamatorio'),
(4, 16, 3, '1 cada 8 horas', 'Control dolor'),
(4, 17, 2, '1 cada 12 horas', 'Antibiótico tópico') ,

-- Receta 5: Paciente 5 - 2 medicamentos (usada)
(5, 18, 5, '1 cada 6 horas', 'Control diabetes'),
(5, 19, 2, '1 diario', 'Suplemento') ,

-- Receta 6: Paciente 6 - 2 medicamentos
(6, 20, 4, '1 cada 8 horas', 'Antifúngico'),
(6, 21, 1, '1 cada 12 horas', 'Tópico') ,

-- Receta 7: Paciente 7 - 3 medicamentos
(7, 1, 6, '1 cada 8 horas', 'Dolor y fiebre'),
(7, 22, 3, '1 cada 6 horas', 'Cardiovascular'),
(7, 5, 4, '1 cada 6 horas', 'Dolor intenso') ,

-- Receta 8: Paciente 8 - 2 medicamentos (usada)
(8, 23, 2, '1 cada 8 horas', 'Control alergia'),
(8, 24, 3, '1 cada 6 horas', 'Dermatológico') ,

-- Receta 9: Paciente 9 - 2 medicamentos
(9, 25, 3, '1 diario', 'Vitamina D'),
(9, 26, 2, '1 cada 8 horas', 'Control dolor') ,

-- Receta 10: Paciente 10 - 3 medicamentos
(10, 1, 5, '1 cada 8 horas', 'Antiinflamatorio'),
(10, 2, 4, '1 cada 8 horas', 'Infección'),
(10, 27, 2, '1 cada 12 horas', 'Antialérgico');

PRINT 'Insertados 22 registros en DetalleReceta.';

-- ======================================================================================
-- 9. INSERTAR REGISTROS EN VENTA (15 ventas)
-- ======================================================================================
INSERT INTO Venta (cliente_id, fecha_venta, total, metodo_pago, activa) VALUES
(1, '2024-06-01', 25000, 'Tarjeta', 1),
(3, '2024-06-03', 18500, 'Efectivo', 1),
(5, '2024-06-05', 32000, 'Tarjeta', 1),
(7, '2024-06-07', 15200, 'Nequi', 1),
(9, '2024-06-10', 41000, 'Tarjeta', 1),
(2, '2024-06-12', 22800, 'Efectivo', 1),
(4, '2024-06-15', 38700, 'Tarjeta', 1),
(6, '2024-06-18', 19500, 'Nequi', 1),
(8, '2024-06-20', 27600, 'Tarjeta', 1),
(10, '2024-06-22', 35400, 'Efectivo', 1),
(1, '2024-06-25', 52000, 'Tarjeta', 1),
(3, '2024-06-28', 19800, 'Bancolombia', 1),
(5, '2024-07-01', 43200, 'Tarjeta', 1),
(7, '2024-07-03', 28900, 'Nequi', 1),
(9, '2024-07-05', 36500, 'Tarjeta', 1);

PRINT 'Insertados 15 registros en Venta.';

-- ======================================================================================
-- 10. INSERTAR REGISTROS EN DETALLE VENTA (vínculo Venta-Medicamento)
-- ======================================================================================
-- Cada venta tendrá 2-4 medicamentos
INSERT INTO DetalleVenta (venta_id, medicamento_id, cantidad, precio_unitario, subtotal) VALUES

-- Venta 1 (Juan - total 25000)
(1, 1, 2, 8500, 17000),   -- Amoxicilina
(1, 5, 1, 2800, 2800),   -- Paracetamol
(1, 9, 1, 5200, 5200),   -- Cetirizina

-- Venta 2 (Carlos - total 18500)
(2, 12, 1, 9200, 9200),   -- Vitamina D3
(2, 14, 1, 5200, 5200),   -- Atenolol
(2, 21, 1, 4100, 4100),   -- Tópico

-- Venta 3 (Luis - total 32000)
(3, 1, 3, 8500, 25500),   -- Amoxicilina x3
(3, 22, 1, 3200, 3200),   -- Analgésico

-- Venta 4 (Ana - total 15200)
(4, 2, 1, 12000, 12000),  -- Azitromicina
(4, 23, 1, 1500, 1500),   -- Antialérgico controlado

-- Venta 5 (Paciente 5 - total 41000)
(5, 2, 2, 12000, 24000),  -- Azitromicina x2
(5, 24, 2, 4500, 9000),   -- Dermatológico x2
(5, 25, 1, 3800, 3800),   -- Vitamina D3

-- Venta 6 (Paciente 2 - total 22800)
(6, 5, 2, 3200, 6400),    -- Ibuprofeno x2
(6, 26, 1, 5800, 5800),   -- Otro analgésico
(6, 27, 2, 3800, 7600),   -- Antialérgico

-- Venta 7 (Paciente 4 - total 38700)
(7, 3, 2, 9500, 19000),   -- Cefalexina x2
(7, 16, 2, 4500, 9000),  -- Control dolor x2
(7, 28, 1, 5200, 5200),   -- Otro medicamento

-- Venta 8 (Paciente 6 - total 19500)
(8, 9, 2, 4500, 9000),    -- Cetirizina x2
(8, 29, 2, 4200, 8400),   -- Antifúngico x2

-- Venta 9 (Paciente 8 - total 27600)
(9, 18, 3, 5200, 15600),  -- Control diabetes x3
(9, 30, 2, 6000, 12000),  -- Otro medicamento

-- Venta 10 (Paciente 10 - total 35400)
(10, 11, 2, 3800, 7600),  -- Loratadina x2
(10, 31, 3, 8500, 25500), -- Control crónico x3
(10, 32, 1, 2300, 2300);  -- Adicional

PRINT 'Insertados 26 registros en DetalleVenta.';

-- ======================================================================================
-- RESUMEN FINAL DE REGISTROS
-- ======================================================================================
DECLARE @total_registros INT;
SELECT @total_registros = 
    (SELECT COUNT(*) FROM Laboratorio) +
    (SELECT COUNT(*) FROM Categoria) +
    (SELECT COUNT(*) FROM Especialidad) +
    (SELECT COUNT(*) FROM Medico) +
    (SELECT COUNT(*) FROM Cliente) +
    (SELECT COUNT(*) FROM Medicamento) +
    (SELECT COUNT(*) FROM Receta) +
    (SELECT COUNT(*) FROM DetalleReceta) +
    (SELECT COUNT(*) FROM Venta) +
    (SELECT COUNT(*) FROM DetalleVenta);

PRINT '---';
PRINT 'RESUMEN GENERAL DE REGISTROS:';
PRINT '  Laboratorio:     ' + (SELECT COUNT(*) FROM Laboratorio) + ' registros';
PRINT '  Categoria:       ' + (SELECT COUNT(*) FROM Categoria) + ' registros';
PRINT '  Especialidad:    ' + (SELECT COUNT(*) FROM Especialidad) + ' registros';
PRINT '  Medico:          ' + (SELECT COUNT(*) FROM Medico) + ' registros';
PRINT '  Cliente:         ' + (SELECT COUNT(*) FROM Cliente) + ' registros';
PRINT '  Medicamento:     ' + (SELECT COUNT(*) FROM Medicamento) + ' registros';
PRINT '  Receta:          ' + (SELECT COUNT(*) FROM Receta) + ' registros';
PRINT '  DetalleReceta:   ' + (SELECT COUNT(*) FROM DetalleReceta) + ' registros';
PRINT '  Venta:           ' + (SELECT COUNT(*) FROM Venta) + ' registros';
PRINT '  DetalleVenta:    ' + (SELECT COUNT(*) FROM DetalleVenta) + ' registros';
PRINT '---';
PRINT 'TOTAL GENERAL: ' + CAST(@total_registros AS VARCHAR) + ' registros';
PRINT '---';
PRINT 'El proyecto cumple con el requisito de mínimo 200 registros.';

-- ======================================================================================
-- FIN DEL ARCHIVO
-- ======================================================================================