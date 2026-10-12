# EduGestión V5.3 — Persistencia real en la nube

## Qué corrige
- El registro manual de asistencia laboral ahora se guarda en Google Sheets, no solo en el navegador.
- Editar y borrar jornadas laborales también se guarda en el servidor.
- Se agrega la columna `observacion` a `AsistenciaDocentes`.
- Los registros hechos desde Telegram y desde la web siguen compartiendo la misma hoja `AsistenciaDocentes`.
- Se agrega la hoja `EstadoDocente` para conservar configuraciones y avances que antes dependían de `localStorage`.
- Los datos de `EstadoDocente` se separan por `idProfesor`.
- Si un estado es grande, se divide automáticamente en varias filas para evitar el límite de caracteres por celda de Google Sheets.
- Al iniciar sesión, EduGestión descarga el estado del docente antes de refrescar los módulos.
- Los datos locales existentes del docente se migran a la nube cuando todavía no existen allí.
- Si falla Internet, los cambios locales quedan pendientes y se reintentan.
- La asistencia manual local pendiente se intenta migrar a `AsistenciaDocentes` al volver a cargar el módulo.

## Archivos principales modificados
- `app.js`
- `index.html`
- `Code.gs` (Google Apps Script)

## Paso obligatorio en Google Apps Script
1. Abrir el proyecto de Apps Script de EduGestión.
2. Reemplazar el contenido del `Code.gs` por el `Code.gs` de esta versión.
3. Guardar.
4. Implementar / Administrar implementaciones.
5. Editar la implementación Web App existente y publicar una nueva versión.
6. Conservar la misma URL `/exec` si se actualiza la implementación existente.

No es necesario ejecutar una migración manual de hojas: cuando la plataforma use los nuevos endpoints, `AsistenciaDocentes` y `EstadoDocente` se reparan/crean automáticamente. También puedes ejecutar `EduGestión → 1. Instalar o reparar estructura` desde la hoja para preparar todo de una vez.

## Publicación Vercel / GitHub
Reemplazar los archivos del ZIP dentro de `edugestion-git` y ejecutar:

```powershell
git status
git add app.js index.html style.css
git commit -m "Agregar persistencia real en nube y asistencia laboral permanente"
git push origin main
```

`style.css` no contiene cambios funcionales de V5.3, pero puede incluirse sin problema al reemplazar la carpeta completa.
