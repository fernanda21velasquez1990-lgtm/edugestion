# EduGestión V8.5 · Confirmación de notas y consultas por WhatsApp

- El portal consulta en vivo evaluaciones, calificaciones, recuperaciones y asistencia desde Google Sheets.
- Se añade actualización manual y actualización automática cada 60 segundos mientras el representante mantiene abierto el portal.
- Cada evaluación con nota muestra **Confirmo que vi la nota**.
- La confirmación se guarda en la nueva hoja `ConfirmacionNotasRepresentantes`.
- La confirmación significa únicamente que el representante visualizó la calificación; no implica conformidad con ella.
- Se añade **Tengo una duda con esta nota**.
- El representante describe el problema; la consulta queda registrada y se abre WhatsApp con alumno, materia, evaluación, nota y duda.
- El teléfono usado es el registrado en la cuenta del docente.
- Si no existe teléfono del docente, la consulta queda registrada y el mensaje queda preparado para copiar.
- Esta versión modifica `Code.gs`, `representantes.html`, `representantes.js` y `representantes.css`.

- La pestaña Asistencia ahora muestra además el detalle reciente con fecha, materia, docente y estado (Presente/Ausente/Tardanza/Justificada).
