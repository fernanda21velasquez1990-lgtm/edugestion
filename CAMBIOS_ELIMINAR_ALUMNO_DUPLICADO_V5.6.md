# EduGestión V5.6 — Eliminar alumno duplicado

- Detecta estudiantes repetidos por nombre + año + sección + turno.
- En Control de asistencia marca únicamente la segunda copia y siguientes con la etiqueta **Duplicado**.
- Agrega el botón rojo **Eliminar duplicado** solo a esas copias para evitar borrar por accidente una ficha única.
- Antes de eliminar solicita confirmación al docente.
- La eliminación se valida nuevamente en Google Apps Script: si no existe otra ficha idéntica, el servidor bloquea la acción.
- Al eliminar una copia se limpian también los registros vinculados a ese ID en Asistencia, Calificaciones y Actas; la otra ficha se conserva.
- La Auditoría de asistencia no se borra para mantener trazabilidad institucional.
