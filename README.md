# EBA - Evaluación de Bienestar Animal

Sistema para registrar predios, evaluar indicadores de bienestar animal en ovinos y caprinos, calcular la clasificación final, generar recomendaciones y descargar reportes en PDF.

## Tecnologías

- **Backend:** Node.js, Express, MariaDB/MySQL (`mysql2`), JWT, PDFKit.
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router, Recharts.
- **Base de datos:** MariaDB / MySQL.

## Estructura del proyecto

```text
.
├── backend/
│   ├── src/
│   │   ├── config/          # Conexión a MariaDB
│   │   ├── controllers/     # Lógica de la API
│   │   ├── data/            # Datos iniciales y seed
│   │   ├── middleware/      # Autenticación y roles
│   │   ├── routes/          # Rutas Express
│   │   └── utils/           # IA simulada, PDF, helpers
│   ├── schema.sql           # Creación de tablas
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   ├── .env.example
│   └── package.json
├── iniciar-eba.bat          # Arranque rápido en Windows
├── detener-eba.bat          # Detiene backend y frontend
└── README.md
```

## Requisitos

- Node.js 18 o superior (probado con Node 24).
- npm.
- MariaDB 10.6+ o MySQL 8+.

## 1. Preparar la base de datos

Crea la base y el usuario (ajusta la contraseña):

```sql
CREATE DATABASE eba_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'eba_user'@'localhost' IDENTIFIED BY 'eba_password';
GRANT ALL PRIVILEGES ON eba_db.* TO 'eba_user'@'localhost';
FLUSH PRIVILEGES;
```

Luego ejecuta el esquema:

```powershell
cd backend
Get-Content schema.sql -Raw | & "C:\Program Files\MariaDB 13.0\bin\mysql.exe" -u eba_user -p --port=3307 eba_db
```

> Ajusta la ruta de `mysql.exe` y el puerto según tu instalación. En este proyecto se usa el puerto **3307**.

## Base de datos incluida

El repositorio incluye un respaldo completo en `database/eba_db_dump.sql` con la estructura y los datos de demostración (5 libertades, 3 usuarios, 4 predios, 39 indicadores y una evaluación cerrada).

Para restaurarlo desde cero, abre PowerShell en la raíz del proyecto y ejecuta:

```powershell
cmd /c ""C:\Program Files\MariaDB 13.0\bin\mysql.exe" -u root -p --port=3307 < database\eba_db_dump.sql"
```

Si ya creaste la base y el usuario `eba_user`, puedes importarlo con ese usuario:

```powershell
cmd /c ""C:\Program Files\MariaDB 13.0\bin\mysql.exe" -u eba_user -p --port=3307 < database\eba_db_dump.sql"
```

> El respaldo contiene las contraseñas de demostración en texto plano. Cámbialas antes de usar el sistema en producción. No contiene usuarios ni privilegios de MariaDB, solo las tablas de la base `eba_db`.

## 2. Configurar y arrancar el backend

```powershell
cd backend
npm install
Copy-Item .env.example .env
# Edita .env con tus datos reales de conexión
npm run dev
```

El backend queda en `http://localhost:4000`. Verifica con:

```text
http://localhost:4000/api/health
```

### Poblar datos iniciales (opcional)

```powershell
node --input-type=module -e "import('./src/data/seedDb.js').then(async (m) => { await m.ejecutarSeed(); const { pool } = await import('./src/config/db.js'); await pool.end(); })"
```

El seed crea las 5 libertades, 3 usuarios de demostración, 4 predios y 39 indicadores. **Borra las evaluaciones existentes.**

## 3. Configurar y arrancar el frontend

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Abre `http://localhost:5173`.

## Inicio rápido en Windows

Con la base de datos ya creada y los `.env` configurados:

1. Doble clic en `iniciar-eba.bat`.
2. Se abren el backend, el frontend y el navegador.

Para detener todo: `detener-eba.bat` o `Ctrl + C` en cada ventana.

## Usuarios de demostración

| Correo | Contraseña | Rol |
|---|---|---|
| `admin@ica.gov.co` | `admin123` | ADMIN |
| `evaluador@ica.gov.co` | `eval123` | EVALUADOR |
| `responsable@ica.gov.co` | `resp123` | RESPONSABLE |

> Cambia estas credenciales antes de usar el sistema en producción.

## Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Inicio de sesión |
| GET | `/api/auth/me` | Usuario autenticado |
| GET | `/api/predios` | Lista de predios |
| POST | `/api/predios` | Crear predio |
| PUT | `/api/predios/:id` | Actualizar predio |
| DELETE | `/api/predios/:id` | Eliminar predio |
| GET | `/api/predios/:id/historial` | Historial del predio |
| GET | `/api/indicadores` | Catálogo de indicadores |
| PUT | `/api/indicadores/:id` | Editar indicador |
| GET | `/api/libertades` | Las 5 libertades |
| GET | `/api/evaluaciones` | Lista de evaluaciones |
| POST | `/api/evaluaciones` | Crear evaluación |
| GET | `/api/evaluaciones/:id` | Detalle de evaluación |
| PATCH | `/api/evaluaciones/:id/indicadores/:indicadorId` | Calificar indicador |
| POST | `/api/evaluaciones/:id/cerrar` | Cerrar evaluación |
| GET | `/api/evaluaciones/:id/recomendaciones-ia` | Recomendación IA |
| POST | `/api/evaluaciones/:id/recomendaciones-ia` | Regenerar recomendación |
| GET | `/api/evaluaciones/:id/reporte.pdf` | Reporte PDF |
| GET | `/api/evaluaciones/historial-global` | Historial global |
| GET | `/api/usuarios` | Lista de usuarios |
| POST | `/api/usuarios` | Crear usuario |
| PUT | `/api/usuarios/:id` | Actualizar usuario |
| PATCH | `/api/usuarios/:id/estado` | Activar/desactivar usuario |
| PATCH | `/api/usuarios/:id/predios` | Asignar predios |
| GET | `/api/usuarios/responsables` | Responsables disponibles |
| GET | `/api/dashboard` | Métricas del panel |

## EBA Assistant (chat flotante)

Arquitectura: React `AsistenteChat.tsx` (burbuja flotante abajo-derecha, historial, Markdown con `react-markdown`/`remark-gfm`, sin HTML ejecutable) → `POST /api/asistente/conversaciones/:id/chat` (JWT) → `asistenteController` (rate-limit 20/min, lock por conversación) → `asistenteGemini.js` (SDK `@google/genai`, `gemini-3.5-flash-lite`, `store:false`, timeout 25s) → `asistenteTools.js` (6 tools de solo lectura) → MariaDB (`eba_db`). El cálculo oficial sigue en `construirDetalle()`; la IA solo interpreta.

### Integración Gemini
* SDK oficial `@google/genai`, API `generateContent` + Function Calling.
* Modelo por `GEMINI_MODEL` (recomendado `gemini-3.5-flash-lite`, alternativas gratuitas `gemini-3.8-flash`, `gemini-3.1-flash-lite`). `gemini-2.5-flash` ya no está disponible para usuarios nuevos.
* System prompt EBA (ponderaciones L1 20/L2 20/L3 35/L4 10/L5 15, calificaciones 0/20/55/100, 39 indicadores, no inventar, no modificar/cerrar evaluaciones).
* `ASSISTANT_MAX_TOKENS=800`, `TIMEOUT 25s`, `MAX_TOOL_CALLS 5`.

### Herramientas disponibles (solo lectura)
1. `consultarPrediosAutorizados`
2. `consultarEvaluacionesAutorizadas`
3. `consultarResultadosOficiales` (vía `construirDetalle()`)
4. `consultarIndicadores`
5. `consultarLibertades`
6. `analizarOportunidadesMejora`

Nunca SQL libre, nunca escritura (crear/cerrar/borrar).

### Endpoints del asistente
| Método | Ruta | Uso |
|---|---|---|
| POST | `/api/asistente/conversaciones` | Crear (título opcional) |
| GET | `/api/asistente/conversaciones` | Lista propia |
| GET | `/api/asistente/conversaciones/:id` | Detalle + mensajes |
| GET | `/api/asistente/conversaciones/:id/mensajes` | Mensajes cronológicos |
| DELETE | `/api/asistente/conversaciones/:id` | Borra en cascada sus mensajes |
| POST | `/api/asistente/conversaciones/:id/chat` | Envía `mensaje` y recibe `texto/llamadas/modelo` |
| GET | `/api/asistente/tools/predios` | Solo las 6 tools de prueba (F2) |

### Permisos por rol (solo para el asistente)

| Rol | Predios | Evaluaciones | Conversaciones |
|---|---|---|---|
| **ADMIN** | Todos | Todas | Solo propias (`usuario_id = JWT.id`) |
| **EVALUADOR** | Creados por él, responsables o con evaluación asignada | Donde es `evaluador_id`, creó el predio o es responsable | Solo propias |
| **RESPONSABLE** | Solo `responsable_id = id` | Solo evaluaciones de sus predios (JOIN) | Solo propias |

Implementación centralizada en `backend/src/utils/permisos.js` (`esAdmin/esEvaluador/esResponsable`, `puedeConsultarPredio/Evaluacion`, `condicion*Autorizado` parametrizado). Conversaciones: incluso ADMIN no accede a ajenas.

### Persistencia del historial
* `asistente_conversaciones (id, usuario_id, titulo, creado_en, actualizado_en)` + `asistente_mensajes (id, conversacion_id, rol, contenido, creado_en)` en MariaDB.
* Recupera últimas 20 del hilo para el contexto; Markdown se guarda tal cual y se renderiza con `ReactMarkdown` en el frontend.
* Concurrencia: serialización por conversación en memoria (`conBloqueoConversacion` Map) — protege una sola instancia, no multi-instancia.

### Variables de entorno (backend `.env`, nunca `VITE_`)
```ini
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-3.5-flash-lite
ASSISTANT_MAX_TOKENS=800
ASSISTANT_TIMEOUT_MS=25000
ASSISTANT_MAX_TOOL_CALLS=5
```
Más `PORT, JWT_SECRET, JWT_EXPIRES_IN, DB_HOST, DB_PORT=3307, DB_USER, DB_PASSWORD, DB_NAME=eba_db` y `frontend/.env` solo `VITE_API_URL`.

### Inicio y detención
```powershell
iniciar-eba.bat   # MariaDB + backend (:4000) + frontend (:5173) + abre navegador
detener-eba.bat   # mata 4000/5173 (MariaDB queda como servicio)
```

### Errores y límites
* Rate-limit en memoria **20 req/min** por usuario → `429`.
* Timeout Gemini 25s → `502`; cuota/429 de Google → `429`; clave/modelo inválido → `502` sin exponer detalles; respuesta vacía → `502`.
* `POST /chat`: `400` mensaje vacío/largo o ID inválido, `404` conversación ajena/inexistente, `401` sin JWT, `403` rol no permitido en tools.

### Privacidad
* No se envían contraseñas, tokens, correos ni claves a Gemini (solo IDs, nombre/municipio/especie/sistema y resultados oficiales).
* Nivel gratuito AI Studio: Google **puede usar los datos para mejorar sus productos**; no envíes PII/confidencial.
* Historial permanente en MariaDB por usuario; ADMIN no ve conversaciones ajenas.

## Respaldo y restauración (MariaDB)

### Generar copia actualizada (solo con autorización)
```powershell
cmd /c ""C:\Program Files\MariaDB 13.0\bin\mysqldump.exe" -u eba_user -p --port=3307 --single-transaction --routines --triggers eba_db > database\eba_db_dump.sql"
# Verifica el tamaño > 42 KB (dump original)
```
*No he generado ni sobrescrito respaldos en F6-A.*

### Restaurar
```powershell
cmd /c ""C:\Program Files\MariaDB 13.0\bin\mysql.exe" -u root -p --port=3307 < database\eba_db_dump.sql"
# o con eba_user:
cmd /c ""C:\Program Files\MariaDB 13.0\bin\mysql.exe" -u eba_user -p --port=3307 < database\eba_db_dump.sql"
```

### Aplicar migración del asistente (solo cuando corresponda)
```powershell
cmd /c ""C:\Program Files\MariaDB 13.0\bin\mysql.exe" -u eba_user -p --port=3307 eba_db < database\asistente_migration.sql"
& "C:\Program Files\MariaDB 13.0\bin\mysql.exe" -u eba_user -peba_password --port=3307 eba_db -e "SHOW TABLES LIKE 'asistente_%';"
```
La migración solo crea `asistente_conversaciones` y `asistente_mensajes` con FKs en cascada; no altera tablas existentes.

## Seguridad

- **No subir** el archivo `.env`: contiene credenciales y el secreto JWT. Usa `.env.example` como plantilla.
- Cambia `JWT_SECRET` y las contraseñas de demostración en producción.
- El seed incluye contraseñas de prueba solo para desarrollo.

## Notas

- El puerto de MariaDB usado en desarrollo es **3307**; se configura en `backend/.env`.
- La carpeta `backend/uploads/` se conserva vacía y su contenido generado se ignora en Git.
- `frontend/frontend/` corresponde a una copia duplicada del ZIP original y está excluida del repositorio.
