@echo off
setlocal
title EBA - Detener sistema

echo Cerrando backend y frontend...

for /f "tokens=5" %%p in ('netstat -ano ^| findstr /R /C:":4000 .*LISTENING" /C:":5173 .*LISTENING"') do (
  taskkill /PID %%p /T /F >nul 2>&1
)

echo.
echo Backend y frontend detenidos.
echo MariaDB sigue en ejecucion como servicio de Windows.
echo.
echo Si tambien desea detener MariaDB, abra PowerShell como administrador
echo y ejecute:  Stop-Service MariaDB
echo.
pause
