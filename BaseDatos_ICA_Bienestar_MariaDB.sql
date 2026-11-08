-- =============================================================================
-- SISTEMA DE EVALUACIÓN DE BIENESTAR ANIMAL - ICA PORKCOLOMBIA V3.0
-- Base de Datos MariaDB
-- Basado en la Metodología para Evaluar el Bienestar Animal en Ovinos y Caprinos
-- Instituto Colombiano Agropecuario (ICA) - Versión 2.0, 2024
-- =============================================================================

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS ica_bienestar_animal
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE ica_bienestar_animal;

-- =============================================================================
-- MÓDULO 1: SEGURIDAD Y GESTIÓN DE USUARIOS
-- =============================================================================

-- Tabla: Roles de usuario
CREATE TABLE roles (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    nombre          VARCHAR(50) NOT NULL UNIQUE,
    descripcion     TEXT,
    activo          BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_rol_nombre CHECK (nombre IN ('admin', 'docente', 'estudiante_evaluador', 'consultor_externo'))
) ENGINE=InnoDB;

-- Tabla: Usuarios del sistema
CREATE TABLE usuarios (
    id                      INT PRIMARY KEY AUTO_INCREMENT,
    nombre                  VARCHAR(100) NOT NULL,
    email                   VARCHAR(150) NOT NULL UNIQUE,
    password_hash           VARCHAR(255) NOT NULL,
    rol_id                  INT NOT NULL,
    activo                  BOOLEAN DEFAULT TRUE,
    ultimo_acceso           TIMESTAMP NULL,
    token_recuperacion      VARCHAR(255) NULL,
    fecha_expiracion_token  TIMESTAMP NULL,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_usuario_rol FOREIGN KEY (rol_id) REFERENCES roles(id),
    CONSTRAINT chk_email_formato CHECK (email LIKE '%_@_%._%')
) ENGINE=InnoDB;

-- =============================================================================
-- MÓDULO 2: GESTIÓN DE FINCAS
-- =============================================================================

-- Tabla: Departamentos de Colombia
CREATE TABLE departamentos (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    nombre          VARCHAR(100) NOT NULL,
    codigo_dane     VARCHAR(5),
    activo          BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT uq_departamento_nombre UNIQUE (nombre)
) ENGINE=InnoDB;

-- Tabla: Municipios
CREATE TABLE municipios (
    id                  INT PRIMARY KEY AUTO_INCREMENT,
    departamento_id     INT NOT NULL,
    nombre              VARCHAR(100) NOT NULL,
    codigo_dane         VARCHAR(10),
    activo              BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT fk_municipio_departamento FOREIGN KEY (departamento_id) REFERENCES departamentos(id),
    CONSTRAINT uq_municipio_nombre_dpto UNIQUE (nombre, departamento_id)
) ENGINE=InnoDB;

-- Tabla: Sistemas productivos
CREATE TABLE sistemas_productivos (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    nombre          VARCHAR(100) NOT NULL UNIQUE,
    descripcion     TEXT,
    activo          BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT chk_sistema_productivo CHECK (nombre IN ('familiar', 'extensivo', 'semi_intensivo', 'intensivo'))
) ENGINE=InnoDB;

-- Tabla: Fincas registradas
CREATE TABLE fincas (
    id                      INT PRIMARY KEY AUTO_INCREMENT,
    nombre                  VARCHAR(200) NOT NULL,
    propietario             VARCHAR(200) NOT NULL,
    documento_propietario   VARCHAR(20),
    departamento_id         INT NOT NULL,
    municipio_id            INT NOT NULL,
    vereda                  VARCHAR(100),
    direccion               VARCHAR(255),
    latitud                 DECIMAL(10,8) NULL,
    longitud                DECIMAL(11,8) NULL,
    sistema_productivo_id   INT NOT NULL,
    usuario_id              INT NOT NULL,
    activo                  BOOLEAN DEFAULT TRUE,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_finca_departamento FOREIGN KEY (departamento_id) REFERENCES departamentos(id),
    CONSTRAINT fk_finca_municipio FOREIGN KEY (municipio_id) REFERENCES municipios(id),
    CONSTRAINT fk_finca_sistema FOREIGN KEY (sistema_productivo_id) REFERENCES sistemas_productivos(id),
    CONSTRAINT fk_finca_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT chk_latitud CHECK (latitud BETWEEN -90 AND 90),
    CONSTRAINT chk_longitud CHECK (longitud BETWEEN -180 AND 180)
) ENGINE=InnoDB;

-- Tabla: Especies animales
CREATE TABLE especies (
    id                  INT PRIMARY KEY AUTO_INCREMENT,
    nombre              VARCHAR(100) NOT NULL UNIQUE,
    nombre_cientifico   VARCHAR(100),
    activo              BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_especie_activa CHECK (activo IN (TRUE, FALSE))
) ENGINE=InnoDB;

-- Tabla: Relación Finca-Especie (N:N)
CREATE TABLE finca_especie (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    finca_id        INT NOT NULL,
    especie_id      INT NOT NULL,
    activo          BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_finca_especie_finca FOREIGN KEY (finca_id) REFERENCES fincas(id) ON DELETE CASCADE,
    CONSTRAINT fk_finca_especie_especie FOREIGN KEY (especie_id) REFERENCES especies(id),
    CONSTRAINT uq_finca_especie UNIQUE (finca_id, especie_id)
) ENGINE=InnoDB;

-- Tabla: Inventario animal por finca
CREATE TABLE inventario_animal (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    finca_id        INT NOT NULL,
    especie_id      INT NOT NULL,
    grupo_etario    VARCHAR(50) NOT NULL,
    categoria       VARCHAR(50),
    cantidad        INT NOT NULL,
    fecha_registro  DATE NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_inventario_finca FOREIGN KEY (finca_id) REFERENCES fincas(id),
    CONSTRAINT fk_inventario_especie FOREIGN KEY (especie_id) REFERENCES especies(id),
    CONSTRAINT chk_grupo_etario CHECK (grupo_etario IN ('lactantes', 'jovenes', 'adultos')),
    CONSTRAINT chk_categoria CHECK (categoria IN ('machos', 'hembras', 'reproductores')),
    CONSTRAINT chk_cantidad_positiva CHECK (cantidad > 0)
) ENGINE=InnoDB;

-- =============================================================================
-- MÓDULO 3: PARAMETRIZACIÓN JERÁRQUICA
-- =============================================================================

-- Tabla: Versiones de parametrización por especie
CREATE TABLE versiones_parametrizacion (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    especie_id      INT NOT NULL,
    version         INT NOT NULL,
    activo          BOOLEAN DEFAULT TRUE,
    fecha_creacion  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por      INT NOT NULL,
    
    CONSTRAINT fk_version_especie FOREIGN KEY (especie_id) REFERENCES especies(id),
    CONSTRAINT fk_version_usuario FOREIGN KEY (creado_por) REFERENCES usuarios(id),
    CONSTRAINT uq_version_especie UNIQUE (especie_id, version)
) ENGINE=InnoDB;

-- Tabla: Dimensiones (Libertades del bienestar animal)
CREATE TABLE dimensiones (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    especie_id      INT NOT NULL,
    nombre          VARCHAR(200) NOT NULL,
    descripcion     TEXT,
    peso            DECIMAL(5,2) NOT NULL,
    orden           INT NOT NULL,
    activo          BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_dimension_especie FOREIGN KEY (especie_id) REFERENCES especies(id),
    CONSTRAINT chk_peso CHECK (peso >= 0 AND peso <= 100),
    CONSTRAINT uq_dimension_nombre_especie UNIQUE (nombre, especie_id)
) ENGINE=InnoDB;

-- Tabla: Criterios de evaluación
CREATE TABLE criterios (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    dimension_id    INT NOT NULL,
    nombre          VARCHAR(200) NOT NULL,
    descripcion     TEXT,
    peso            DECIMAL(5,2) NOT NULL,
    orden           INT NOT NULL,
    activo          BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_criterio_dimension FOREIGN KEY (dimension_id) REFERENCES dimensiones(id),
    CONSTRAINT chk_peso_criterio CHECK (peso >= 0 AND peso <= 100)
) ENGINE=InnoDB;

-- Tabla: Indicadores de evaluación
CREATE TABLE indicadores (
    id                  INT PRIMARY KEY AUTO_INCREMENT,
    criterio_id         INT NOT NULL,
    nombre              VARCHAR(255) NOT NULL,
    descripcion         TEXT,
    metodo_evaluacion   ENUM('documental', 'visual', 'muestreo') NOT NULL,
    tipo_respuesta      ENUM('si_no', 'seleccion_unica', 'seleccion_multiple', 'escala', 'numerica', 'textual', 'evidencia') NOT NULL,
    umbral_aprobacion   DECIMAL(10,2) NULL,
    peso                DECIMAL(5,2) NOT NULL,
    orden               INT NOT NULL,
    activo              BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_indicador_criterio FOREIGN KEY (criterio_id) REFERENCES criterios(id),
    CONSTRAINT chk_peso_indicador CHECK (peso >= 0 AND peso <= 100),
    CONSTRAINT chk_umbral CHECK (umbral_aprobacion IS NULL OR umbral_aprobacion >= 0)
) ENGINE=InnoDB;

-- Tabla: Opciones de respuesta para indicadores
CREATE TABLE opciones_respuesta (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    indicador_id    INT NOT NULL,
    opcion          VARCHAR(255) NOT NULL,
    valor           DECIMAL(10,2) NOT NULL,
    orden           INT NOT NULL,
    
    CONSTRAINT fk_opcion_indicador FOREIGN KEY (indicador_id) REFERENCES indicadores(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================================
-- MÓDULO 4: EVALUACIONES
-- =============================================================================

-- Tabla: Estados de evaluación
CREATE TABLE estados_evaluacion (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    nombre          VARCHAR(50) NOT NULL UNIQUE,
    descripcion     TEXT,
    
    CONSTRAINT chk_estado_evaluacion CHECK (nombre IN ('borrador', 'en_proceso', 'finalizada', 'validada', 'cerrada'))
) ENGINE=InnoDB;

-- Tabla: Evaluaciones realizadas
CREATE TABLE evaluaciones (
    id                      INT PRIMARY KEY AUTO_INCREMENT,
    finca_id                INT NOT NULL,
    especie_id              INT NOT NULL,
    evaluador_id            INT NOT NULL,
    estado_id               INT NOT NULL DEFAULT 1,
    puntaje_total           DECIMAL(5,2) NULL,
    clasificacion           VARCHAR(50) NULL,
    observaciones_generales TEXT NULL,
    fecha_inicio            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_finalizacion      TIMESTAMP NULL,
    fecha_guardado_parcial  TIMESTAMP NULL,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_evaluacion_finca FOREIGN KEY (finca_id) REFERENCES fincas(id),
    CONSTRAINT fk_evaluacion_especie FOREIGN KEY (especie_id) REFERENCES especies(id),
    CONSTRAINT fk_evaluacion_evaluador FOREIGN KEY (evaluador_id) REFERENCES usuarios(id),
    CONSTRAINT fk_evaluacion_estado FOREIGN KEY (estado_id) REFERENCES estados_evaluacion(id),
    CONSTRAINT chk_puntaje_total CHECK (puntaje_total IS NULL OR (puntaje_total >= 0 AND puntaje_total <= 100)),
    CONSTRAINT chk_clasificacion CHECK (clasificacion IS NULL OR clasificacion IN ('excelente', 'alto', 'medio', 'bajo'))
) ENGINE=InnoDB;

-- Tabla: Detalle de evaluación (respuestas por indicador)
CREATE TABLE detalle_evaluacion (
    id                      INT PRIMARY KEY AUTO_INCREMENT,
    evaluacion_id           INT NOT NULL,
    indicador_id            INT NOT NULL,
    respuesta               TEXT NULL,
    puntaje_obtenido        DECIMAL(5,2) NULL,
    porcentaje_cumplimiento DECIMAL(5,2) NULL,
    observaciones           TEXT NULL,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_detalle_evaluacion FOREIGN KEY (evaluacion_id) REFERENCES evaluaciones(id) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_indicador FOREIGN KEY (indicador_id) REFERENCES indicadores(id),
    CONSTRAINT uq_detalle_evaluacion_indicador UNIQUE (evaluacion_id, indicador_id),
    CONSTRAINT chk_puntaje_detalle CHECK (puntaje_obtenido IS NULL OR (puntaje_obtenido >= 0 AND puntaje_obtenido <= 100)),
    CONSTRAINT chk_porcentaje CHECK (porcentaje_cumplimiento IS NULL OR (porcentaje_cumplimiento >= 0 AND porcentaje_cumplimiento <= 100))
) ENGINE=InnoDB;

-- Tabla: Evidencias adjuntas
CREATE TABLE evidencias (
    id                      INT PRIMARY KEY AUTO_INCREMENT,
    detalle_evaluacion_id   INT NOT NULL,
    tipo                    ENUM('imagen', 'documento', 'video') NOT NULL,
    nombre_archivo          VARCHAR(255) NOT NULL,
    ruta_cloud              VARCHAR(500) NOT NULL,
    tamano_bytes            INT NOT NULL,
    tipo_mime               VARCHAR(100) NOT NULL,
    fecha_subida            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_evidencia_detalle FOREIGN KEY (detalle_evaluacion_id) REFERENCES detalle_evaluacion(id) ON DELETE CASCADE,
    CONSTRAINT chk_tamano_positivo CHECK (tamano_bytes > 0)
) ENGINE=InnoDB;

-- =============================================================================
-- MÓDULO 5: DIAGNÓSTICO Y RECOMENDACIONES
-- =============================================================================

-- Tabla: Diagnósticos automáticos
CREATE TABLE diagnosticos (
    id                  INT PRIMARY KEY AUTO_INCREMENT,
    evaluacion_id       INT NOT NULL UNIQUE,
    fortalezas          TEXT NULL,
    incumplimientos     TEXT NULL,
    alertas_criticas    TEXT NULL,
    oportunidades_mejora TEXT NULL,
    fecha_generacion    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_diagnostico_evaluacion FOREIGN KEY (evaluacion_id) REFERENCES evaluaciones(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla: Recomendaciones (IA o manuales)
CREATE TABLE recomendaciones (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    evaluacion_id   INT NOT NULL,
    indicador_id    INT NULL,
    tipo            ENUM('ia', 'manual') NOT NULL,
    descripcion     TEXT NOT NULL,
    prioridad       ENUM('alta', 'media', 'baja') NOT NULL,
    estado          ENUM('pendiente', 'en_proceso', 'completada') DEFAULT 'pendiente',
    responsable     VARCHAR(200) NULL,
    plazo           DATE NULL,
    editada_por     INT NULL,
    fecha_edicion   TIMESTAMP NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_recomendacion_evaluacion FOREIGN KEY (evaluacion_id) REFERENCES evaluaciones(id) ON DELETE CASCADE,
    CONSTRAINT fk_recomendacion_indicador FOREIGN KEY (indicador_id) REFERENCES indicadores(id),
    CONSTRAINT fk_recomendacion_editor FOREIGN KEY (editada_por) REFERENCES usuarios(id)
) ENGINE=InnoDB;

-- =============================================================================
-- MÓDULO 6: CERTIFICACIÓN
-- =============================================================================

-- Tabla: Certificaciones generadas
CREATE TABLE certificaciones (
    id                  INT PRIMARY KEY AUTO_INCREMENT,
    evaluacion_id       INT NOT NULL UNIQUE,
    numero_certificado   VARCHAR(100) NOT NULL UNIQUE,
    fecha_emision       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_vencimiento   TIMESTAMP NOT NULL,
    estado              ENUM('vigente', 'vencido', 'revocado') DEFAULT 'vigente',
    ruta_pdf            VARCHAR(500) NULL,
    enviado_por_correo  BOOLEAN DEFAULT FALSE,
    fecha_envio         TIMESTAMP NULL,
    
    CONSTRAINT fk_certificacion_evaluacion FOREIGN KEY (evaluacion_id) REFERENCES evaluaciones(id),
    CONSTRAINT chk_vencimiento_posterior CHECK (fecha_vencimiento > fecha_emision)
) ENGINE=InnoDB;

-- =============================================================================
-- MÓDULO 7: AUDITORÍA
-- =============================================================================

-- Tabla: Auditoría de acciones
CREATE TABLE auditoria (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    tabla           VARCHAR(50) NOT NULL,
    registro_id     INT NOT NULL,
    accion          ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    usuario_id      INT NOT NULL,
    datos_anteriores JSON NULL,
    datos_nuevos    JSON NULL,
    ip_address      VARCHAR(45) NULL,
    user_agent      VARCHAR(500) NULL,
    fecha           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_auditoria_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT chk_accion_valida CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE'))
) ENGINE=InnoDB;

-- =============================================================================
-- MÓDULO 8: NOTIFICACIONES
-- =============================================================================

-- Tabla: Notificaciones del sistema
CREATE TABLE notificaciones (
    id                  INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id          INT NOT NULL,
    tipo                ENUM('evaluacion_pendiente', 'aprobacion', 'observacion', 'certificacion') NOT NULL,
    titulo              VARCHAR(200) NOT NULL,
    mensaje             TEXT NOT NULL,
    leida               BOOLEAN DEFAULT FALSE,
    ruta_relacionada    VARCHAR(255) NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_notificacion_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================================
-- VISTAS ÚTILES
-- =============================================================================

-- Vista: Resumen de evaluaciones por finca
CREATE VIEW vw_resumen_evaluaciones AS
SELECT 
    f.id AS finca_id,
    f.nombre AS finca_nombre,
    e.id AS especie_id,
    e.nombre AS especie_nombre,
    ev.id AS evaluacion_id,
    ev.puntaje_total,
    ev.clasificacion,
    ev.fecha_inicio,
    ev.fecha_finalizacion,
    ee.nombre AS estado,
    u.nombre AS evaluador
FROM evaluaciones ev
JOIN fincas f ON ev.finca_id = f.id
JOIN especies e ON ev.especie_id = e.id
JOIN estados_evaluacion ee ON ev.estado_id = ee.id
JOIN usuarios u ON ev.evaluador_id = u.id;

-- Vista: Indicadores con su jerarquía completa
CREATE VIEW vw_indicadores_completo AS
SELECT 
    d.id AS dimension_id,
    d.nombre AS dimension_nombre,
    d.peso AS dimension_peso,
    c.id AS criterio_id,
    c.nombre AS criterio_nombre,
    c.peso AS criterio_peso,
    i.id AS indicador_id,
    i.nombre AS indicador_nombre,
    i.metodo_evaluacion,
    i.tipo_respuesta,
    i.umbral_aprobacion,
    i.peso AS indicador_peso
FROM dimensiones d
JOIN criterios c ON d.id = c.dimension_id
JOIN indicadores i ON c.id = i.criterio_id
WHERE d.activo = TRUE AND c.activo = TRUE AND i.activo = TRUE;

-- =============================================================================
-- PROCEDIMIENTOS ALMACENADOS (MÉTODOS)
-- =============================================================================

DELIMITER //

-- Procedimiento: Calcular puntaje de evaluación
-- Calcula una MEDIA PONDERADA NORMALIZADA:
--   score = SUM(puntaje * peso_dim * peso_crit * peso_ind) / SUM(peso_dim * peso_crit * peso_ind)
-- La normalización garantiza un resultado entre 0 y 100 sin importar la escala de los pesos
-- ni cuántos indicadores tenga cada criterio. Solo se consideran los indicadores respondidos.
DROP PROCEDURE IF EXISTS sp_calcular_puntaje_evaluacion //
CREATE PROCEDURE sp_calcular_puntaje_evaluacion(
    IN p_evaluacion_id INT
)
BEGIN
    DECLARE v_puntaje_total DECIMAL(5,2);
    
    SELECT COALESCE(
             SUM(de.puntaje_obtenido * d.peso * c.peso * i.peso)
             / NULLIF(SUM(d.peso * c.peso * i.peso), 0)
           , 0)
    INTO v_puntaje_total
    FROM detalle_evaluacion de
    JOIN indicadores i ON de.indicador_id = i.id
    JOIN criterios c ON i.criterio_id = c.id
    JOIN dimensiones d ON c.dimension_id = d.id
    WHERE de.evaluacion_id = p_evaluacion_id
      AND de.puntaje_obtenido IS NOT NULL;
    
    -- Actualizar la evaluación
    UPDATE evaluaciones
    SET 
        puntaje_total = v_puntaje_total,
        clasificacion = CASE
            WHEN v_puntaje_total >= 90 THEN 'excelente'
            WHEN v_puntaje_total >= 75 THEN 'alto'
            WHEN v_puntaje_total >= 50 THEN 'medio'
            ELSE 'bajo'
        END
    WHERE id = p_evaluacion_id;
END //

-- Procedimiento: Finalizar evaluación (cambia estado y calcula puntaje)
CREATE PROCEDURE sp_finalizar_evaluacion(
    IN p_evaluacion_id INT
)
BEGIN
    -- Calcular puntaje primero
    CALL sp_calcular_puntaje_evaluacion(p_evaluacion_id);
    
    -- Cambiar estado a finalizada
    UPDATE evaluaciones
    SET 
        estado_id = 3,  -- finalizada
        fecha_finalizacion = CURRENT_TIMESTAMP
    WHERE id = p_evaluacion_id;
END //

-- Procedimiento: Generar certificación
CREATE PROCEDURE sp_generar_certificacion(
    IN p_evaluacion_id INT
)
BEGIN
    DECLARE v_numero_certificado VARCHAR(100);
    DECLARE v_fecha_vencimiento TIMESTAMP;
    
    -- Generar número de certificado
    SET v_numero_certificado = CONCAT('ICA-', YEAR(CURDATE()), '-', LPAD(p_evaluacion_id, 6, '0'));
    SET v_fecha_vencimiento = DATE_ADD(CURDATE(), INTERVAL 1 YEAR);
    
    -- Insertar certificación
    INSERT INTO certificaciones (evaluacion_id, numero_certificado, fecha_vencimiento)
    VALUES (p_evaluacion_id, v_numero_certificado, v_fecha_vencimiento);
END //

-- Procedimiento: Registrar auditoría manualmente
CREATE PROCEDURE sp_registrar_auditoria(
    IN p_tabla VARCHAR(50),
    IN p_registro_id INT,
    IN p_accion VARCHAR(10),
    IN p_usuario_id INT,
    IN p_datos_anteriores JSON,
    IN p_datos_nuevos JSON
)
BEGIN
    INSERT INTO auditoria (tabla, registro_id, accion, usuario_id, datos_anteriores, datos_nuevos)
    VALUES (p_tabla, p_registro_id, p_accion, p_usuario_id, p_datos_anteriores, p_datos_nuevos);
END //

-- Procedimiento: Obtener estadísticas por finca
CREATE PROCEDURE sp_estadisticas_finca(
    IN p_finca_id INT
)
BEGIN
    SELECT 
        e.nombre AS especie,
        COUNT(ev.id) AS total_evaluaciones,
        AVG(ev.puntaje_total) AS puntaje_promedio,
        MAX(ev.puntaje_total) AS mejor_puntaje,
        MIN(ev.puntaje_total) AS peor_puntaje
    FROM evaluaciones ev
    JOIN especies e ON ev.especie_id = e.id
    WHERE ev.finca_id = p_finca_id
    GROUP BY e.nombre;
END //

DELIMITER ;

-- =============================================================================
-- TRIGGERS PARA AUDITORÍA AUTOMÁTICA
-- =============================================================================

DELIMITER //

-- Trigger: Auditoría de inserción en evaluaciones
CREATE TRIGGER trg_evaluaciones_insert
AFTER INSERT ON evaluaciones
FOR EACH ROW
BEGIN
    INSERT INTO auditoria (tabla, registro_id, accion, usuario_id, datos_nuevos)
    VALUES ('evaluaciones', NEW.id, 'INSERT', NEW.evaluador_id, 
            JSON_OBJECT('finca_id', NEW.finca_id, 'especie_id', NEW.especie_id));
END //

-- Trigger: Auditoría de actualización en evaluaciones
CREATE TRIGGER trg_evaluaciones_update
AFTER UPDATE ON evaluaciones
FOR EACH ROW
BEGIN
    INSERT INTO auditoria (tabla, registro_id, accion, usuario_id, datos_anteriores, datos_nuevos)
    VALUES ('evaluaciones', NEW.id, 'UPDATE', NEW.evaluador_id,
            JSON_OBJECT('puntaje_total', OLD.puntaje_total, 'clasificacion', OLD.clasificacion),
            JSON_OBJECT('puntaje_total', NEW.puntaje_total, 'clasificacion', NEW.clasificacion));
END //

DELIMITER ;

-- =============================================================================
-- DATOS SEMILLA (SEED DATA)
-- =============================================================================

-- Roles
INSERT INTO roles (nombre, descripcion) VALUES
('admin', 'Administrador del sistema con acceso total'),
('docente', 'Docente que supervisa evaluaciones'),
('estudiante_evaluador', 'Estudiante que realiza evaluaciones'),
('consultor_externo', 'Consultor externo con acceso limitado');

-- Especies (proyecto enfocado únicamente en OVINO)
INSERT INTO especies (nombre, nombre_cientifico) VALUES
('Ovino', 'Ovis aries');

-- Sistemas productivos
INSERT INTO sistemas_productivos (nombre, descripcion) VALUES
('familiar', 'Rebaños pequeños de máximo 30 animales, pastoreo con estaca'),
('extensivo', 'Hasta 300 animales, pastoreo en potreros delimitados'),
('semi_intensivo', 'Mezcla de pastoreo y estabulación nocturna'),
('intensivo', 'Estabulación total, alto rendimiento');

-- Estados de evaluación
INSERT INTO estados_evaluacion (nombre, descripcion) VALUES
('borrador', 'Evaluación en creación'),
('en_proceso', 'Evaluación siendo diligenciada'),
('finalizada', 'Evaluación completada y calculada'),
('validada', 'Evaluación revisada y validada'),
('cerrada', 'Evaluación cerrada y archivada');

-- Dimensiones (5 Libertades del bienestar animal - OVINO)
INSERT INTO dimensiones (especie_id, nombre, descripcion, peso, orden) VALUES
(1, 'Libre de Hambre, Sed y Desnutrición', 'Acceso a agua y alimento adecuados', 20.00, 1),
(1, 'Libre de Molestias Físicas y Térmicas', 'Condiciones ambientales y de alojamiento adecuadas', 20.00, 2),
(1, 'Libre de Dolor, de Lesión y de Enfermedad', 'Sanidad animal y prácticas de manejo', 25.00, 3),
(1, 'Libre de Temor y Angustia', 'Relación humano-animal', 17.50, 4),
(1, 'Libre de Impedimentos de Manifestar Comportamiento Natural', 'Expresión del comportamiento natural', 17.50, 5);

-- Criterios para la primera dimensión
INSERT INTO criterios (dimension_id, nombre, descripcion, peso, orden) VALUES
(1, 'Acceso a agua', 'Disponibilidad y calidad del agua', 40.00, 1),
(1, 'Acceso a alimento', 'Disponibilidad y calidad del alimento', 40.00, 2),
(1, 'Condición corporal', 'Estado nutricional de los animales', 20.00, 3);

-- Indicadores de ejemplo
INSERT INTO indicadores (criterio_id, nombre, descripcion, metodo_evaluacion, tipo_respuesta, umbral_aprobacion, peso, orden) VALUES
(1, 'Acceso a agua limpia', 'Los animales tienen acceso a agua limpia y fresca', 'visual', 'si_no', NULL, 50.00, 1),
(1, 'Cantidad de bebederos', 'Número adecuado de bebederos', 'visual', 'numerica', 10.00, 30.00, 2),
(1, 'Calidad del agua', 'El agua cumple con estándares de calidad', 'documental', 'si_no', NULL, 20.00, 3);

-- Departamentos principales
INSERT INTO departamentos (nombre, codigo_dane) VALUES
('La Guajira', '44'),
('Cesar', '20'),
('Magdalena', '47'),
('Boyacá', '15'),
('Córdoba', '23'),
('Santander', '68'),
('Antioquia', '05'),
('Cundinamarca', '25');

-- Municipios por departamento (necesarios para registrar fincas)
INSERT INTO municipios (departamento_id, nombre, codigo_dane) VALUES
(1, 'Riohacha', '44001'), (1, 'Maicao', '44430'), (1, 'Uribia', '44847'),
(2, 'Valledupar', '20001'), (2, 'Aguachica', '20011'), (2, 'Agustín Codazzi', '20013'),
(3, 'Santa Marta', '47001'), (3, 'Ciénaga', '47189'), (3, 'Fundación', '47288'),
(4, 'Tunja', '15001'), (4, 'Sogamoso', '15759'), (4, 'Duitama', '15238'),
(5, 'Montería', '23001'), (5, 'Cereté', '23162'), (5, 'Sahagún', '23660'),
(6, 'Bucaramanga', '68001'), (6, 'Floridablanca', '68276'), (6, 'Barrancabermeja', '68081'),
(7, 'Medellín', '05001'), (7, 'Rionegro', '05615'), (7, 'Apartadó', '05045'),
(8, 'Bogotá D.C.', '11001'), (8, 'Soacha', '25754'), (8, 'Zipaquirá', '25899');

-- Usuario administrador por defecto (password: admin123 - debe cambiarse)
INSERT INTO usuarios (nombre, email, password_hash, rol_id) VALUES
('Administrador ICA', 'admin@ica.gov.co', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1);

-- =============================================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =============================================================================

CREATE INDEX idx_finca_municipio ON fincas(municipio_id);
CREATE INDEX idx_evaluacion_finca ON evaluaciones(finca_id);
CREATE INDEX idx_evaluacion_estado ON evaluaciones(estado_id);
CREATE INDEX idx_detalle_evaluacion ON detalle_evaluacion(evaluacion_id);
CREATE INDEX idx_auditoria_fecha ON auditoria(fecha);
CREATE INDEX idx_notificacion_usuario ON notificaciones(usuario_id, leida);

-- =============================================================================
-- FIN DEL SCRIPT
-- =============================================================================
