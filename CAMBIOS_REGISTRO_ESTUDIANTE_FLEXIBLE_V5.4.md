# EduGestión V5.4 — Registro flexible de estudiantes

## Cambios
- El docente puede guardar una ficha aunque no tenga todos los datos del estudiante.
- Datos mínimos: nombre, año, sección y turno.
- Cédula, dirección, representante, teléfono, correo, deporte, hermanos, alergias, materia pendiente y observaciones quedan opcionales.
- Se agregó un selector de fichas existentes para volver a cargar un estudiante y completar su información más adelante.
- Se agregó el modo `Actualizar ficha` para guardar nuevos datos sobre el mismo estudiante sin crear un duplicado.
- La cédula solo se valida como única cuando realmente fue registrada.
- Los campos condicionales de deporte, hermanos y alergias ya no bloquean el guardado si aún no se conocen los detalles.
- La ficha continúa guardándose en Google Sheets mediante el backend de EduGestión.

## Backend
Se agregó la acción `actualizarAlumno` al `Code.gs`. Por eso esta versión requiere actualizar también la implementación de Google Apps Script antes de publicar el frontend en Vercel.
