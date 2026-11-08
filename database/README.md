# Base de datos EBA

Esta carpeta contiene el respaldo de MariaDB del proyecto:

- `eba_db_dump.sql`: estructura completa de `eba_db` y datos de demostración.

## Contenido del respaldo

- 5 libertades.
- 3 usuarios de demostración (`ADMIN`, `EVALUADOR`, `RESPONSABLE`).
- 4 predios.
- 39 indicadores.
- 1 evaluación cerrada de demostración.

## Restaurar el respaldo

Desde la raíz del proyecto, en PowerShell:

```powershell
cmd /c ""C:\Program Files\MariaDB 13.0\bin\mysql.exe" -u root -p --port=3307 < database\eba_db_dump.sql"
```

El respaldo incluye `CREATE DATABASE IF NOT EXISTS eba_db` y `USE eba_db`, por lo que crea la base si no existe.

Si prefieres usar el usuario de la aplicación:

```powershell
cmd /c ""C:\Program Files\MariaDB 13.0\bin\mysql.exe" -u eba_user -p --port=3307 < database\eba_db_dump.sql"
```

> Ajusta la ruta de `mysql.exe` y el puerto (`3307` en este proyecto) según tu instalación.

## Seguridad

El respaldo contiene las contraseñas de demostración en texto plano porque el sistema de ejemplo las usa así. **No lo uses en producción sin cambiar las credenciales** y considera almacenar los respaldos reales fuera del repositorio.
