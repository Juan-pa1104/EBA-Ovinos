-- ============================================
-- Base de datos EBA (Evaluación de Bienestar Animal)
-- MariaDB / MySQL
-- ============================================

USE eba_db;

-- Tabla de las 5 libertades del bienestar animal
CREATE TABLE IF NOT EXISTS libertades (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  peso DECIMAL(4,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de usuarios del sistema
CREATE TABLE IF NOT EXISTS usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  rol ENUM('ADMIN', 'EVALUADOR', 'RESPONSABLE') NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de predios (fincas)
CREATE TABLE IF NOT EXISTS predios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  municipio VARCHAR(100) NOT NULL,
  direccion TEXT,
  especie ENUM('OVINO', 'CAPRINO') NOT NULL,
  sistema_productivo ENUM('EXTENSIVO', 'SEMI_INTENSIVO', 'INTENSIVO', 'FAMILIAR') NOT NULL,
  es_ovino_de_lana BOOLEAN DEFAULT FALSE,
  numero_animales INT DEFAULT 0,
  responsable_id INT NULL,
  creado_por INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (responsable_id) REFERENCES usuarios(id),
  FOREIGN KEY (creado_por) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de indicadores del catálogo ICA
CREATE TABLE IF NOT EXISTS indicadores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  numero INT NOT NULL,
  libertad_id INT NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  metodo_evaluacion ENUM('DOCUMENTAL', 'VISUAL', 'VISUAL_MUESTREO') NOT NULL,
  aplica_extensivo BOOLEAN DEFAULT FALSE,
  aplica_semi_intensivo BOOLEAN DEFAULT FALSE,
  aplica_intensivo BOOLEAN DEFAULT FALSE,
  aplica_familiar BOOLEAN DEFAULT FALSE,
  solo_especie ENUM('OVINO', 'CAPRINO') NULL,
  solo_ovino_lana BOOLEAN DEFAULT FALSE,
  criterio_100 TEXT,
  criterio_55 TEXT,
  criterio_20 TEXT,
  criterio_0 TEXT,
  libertad_nombre VARCHAR(100),
  libertad_peso DECIMAL(4,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (libertad_id) REFERENCES libertades(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de evaluaciones (borradores y cerradas)
CREATE TABLE IF NOT EXISTS evaluaciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  predio_id INT NOT NULL,
  evaluador_id INT NOT NULL,
  fecha DATE NOT NULL,
  estado ENUM('BORRADOR', 'CERRADA') DEFAULT 'BORRADOR',
  puntaje_total DECIMAL(5,2) NULL,
  clasificacion ENUM('EXCELENTE BIENESTAR', 'ALTO', 'MEDIO', 'BAJO') NULL,
  observaciones TEXT NULL,
  cerrada_en TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (predio_id) REFERENCES predios(id),
  FOREIGN KEY (evaluador_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de ítems de evaluación (calificación de cada indicador)
CREATE TABLE IF NOT EXISTS item_evaluacion (
  id INT PRIMARY KEY AUTO_INCREMENT,
  evaluacion_id INT NOT NULL,
  indicador_id INT NOT NULL,
  numero INT NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  metodo_evaluacion ENUM('DOCUMENTAL', 'VISUAL', 'VISUAL_MUESTREO') NOT NULL,
  libertad_id INT NOT NULL,
  libertad_nombre VARCHAR(100),
  libertad_peso DECIMAL(4,2),
  seccion VARCHAR(100),
  criterio_100 TEXT,
  criterio_55 TEXT,
  criterio_20 TEXT,
  criterio_0 TEXT,
  puntaje ENUM('0', '20', '55', '100') NULL,
  observacion TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (evaluacion_id) REFERENCES evaluaciones(id) ON DELETE CASCADE,
  FOREIGN KEY (indicador_id) REFERENCES indicadores(id),
  FOREIGN KEY (libertad_id) REFERENCES libertades(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de recomendaciones generadas con IA
CREATE TABLE IF NOT EXISTS recomendaciones_ia (
  id INT PRIMARY KEY AUTO_INCREMENT,
  evaluacion_id INT NOT NULL UNIQUE,
  contenido TEXT NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (evaluacion_id) REFERENCES evaluaciones(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
