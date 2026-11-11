param([switch]$Forzado)
$ErrorActionPreference = 'Stop'
cd 'C:\Users\janno\OneDrive\Documentos\Proyecto predeterminado\backend'
if ($Forzado) { Remove-Item -Force -Path *.js -Recurse } # No hacer esto en producción!
Write-Host "Iniciando backend EBA..."
Write-Host "Puerto: 4000"
Write-Host "URL: http://localhost:4000"
Write-Host "Presiona Ctrl+C para detener"
npm run dev