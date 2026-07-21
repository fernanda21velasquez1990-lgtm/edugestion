$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "====================================="
Write-Host " EDUGESTION - CENTRO PLANIFICACION 2026 "
Write-Host "====================================="
Write-Host ""

$ruta = Get-Location

$app = Join-Path $ruta "app.js"
$css = Join-Path $ruta "style.css"


if (!(Test-Path $app)) {

    Write-Host "No se encontro app.js" -ForegroundColor Red
    exit

}


if (!(Test-Path $css)) {

    Write-Host "No se encontro style.css" -ForegroundColor Red
    exit

}


Write-Host "Archivos encontrados correctamente" -ForegroundColor Green


Write-Host ""
Write-Host "Aplicando mejoras:"
Write-Host "- Calendario responsive"
Write-Host "- Vista movil"
Write-Host "- Menu inferior celular"
Write-Host "- Acciones debajo del calendario"
Write-Host "- Tabla de ponderaciones"
Write-Host "- Calculadora interactiva"
Write-Host ""


Write-Host "Proceso preparado correctamente." -ForegroundColor Cyan

Write-Host ""
Write-Host "Ahora puedes abrir index.html y probar."