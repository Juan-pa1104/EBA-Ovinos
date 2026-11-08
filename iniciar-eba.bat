@echo off
setlocal
title EBA - Iniciar sistema

echo ============================================
echo   EBA - Evaluacion de Bienestar Animal
echo ============================================
echo.

where npm >nul 2>&1
if errorlevel 1 (
  echo ERROR: npm no esta instalado o no esta en el PATH.
  echo Instale Node.js y vuelva a intentarlo.
  pause
  exit /b 1
)

rem 1) MariaDB
sc query MariaDB | find /I "RUNNING" >nul
if errorlevel 1 (
  echo [1/3] Iniciando MariaDB...
  net start MariaDB >nul 2>&1
  if errorlevel 1 (
    echo   AVISO: no se pudo iniciar MariaDB.
    echo   Cierre esta ventana, haga clic derecho sobre este archivo
    echo   y elija "Ejecutar como administrador".
  ) else (
    echo   MariaDB iniciado correctamente.
  )
) else (
  echo [1/3] MariaDB ya esta en ejecucion.
)

rem 2) Backend
echo [2/3] Abriendo backend en el puerto 4000...
start "EBA Backend" /D "%~dp0backend" cmd /k npm run dev

rem 3) Frontend
echo [3/3] Abriendo frontend en el puerto 5173...
start "EBA Frontend" /D "%~dp0frontend" cmd /k npm run dev

echo.
echo Esperando a que los servidores arranquen...
timeout /t 7 /nobreak >nul
start "" http://localhost:5173

echo.
echo Listo. Si el navegador muestra un error, espere unos segundos y recargue.
echo Para detener todo, ejecute detener-eba.bat
echo.
pause
