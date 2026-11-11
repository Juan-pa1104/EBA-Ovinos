-- Migración EBA Assistant (F1-A)
-- Tablas de historial de conversaciones por usuario (privado, sin acceso cruzado incluso para ADMIN)
-- Ejecutar manualmente: mysql -u eba_user -p eba_db < asistente_migration.sql
-- NO se ejecuta automáticamente en el arranque.

CREATE TABLE IF NOT EXISTS asistente_conversaciones (
  id INT NOT NULL AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  titulo VARCHAR(255) NOT NULL DEFAULT 'Nueva conversación',
  creado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_conv_usuario_actualizado (usuario_id, actualizado_en),
  CONSTRAINT fk_asist_conv_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS asistente_mensajes (
  id BIGINT NOT NULL AUTO_INCREMENT,
  conversacion_id INT NOT NULL,
  rol ENUM('user','assistant','system') NOT NULL,
  contenido TEXT NOT NULL,
  creado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_msg_conv_creado (conversacion_id, creado_en),
  CONSTRAINT fk_asist_msg_conv FOREIGN KEY (conversacion_id) REFERENCES asistente_conversaciones (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
