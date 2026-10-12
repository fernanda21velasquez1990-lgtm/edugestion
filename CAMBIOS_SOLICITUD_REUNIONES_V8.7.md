# EduGestión V8.7 · Solicitud y confirmación de reuniones

## Portal de representantes
- Nueva pestaña **Solicitar reunión**.
- El representante selecciona profesor, día, hora propuesta y motivo.
- Al enviar recibe el mensaje **Cita por confirmar**.
- Puede consultar el estado de sus solicitudes.
- Cuando el docente confirma, el portal muestra **Cita confirmada**, fecha, hora y mensaje del docente.
- Las solicitudes se actualizan con la actualización automática del portal.

## Panel del docente
- Nueva alerta visible cuando existen solicitudes pendientes.
- Las solicitudes aparecen filtradas por la sección activa.
- El docente ve alumno, representante, motivo, fecha y hora propuestas.
- Puede confirmar la misma fecha/hora o modificar ambas antes de confirmar.
- Puede dejar un mensaje opcional para el representante.

## Backend
- Nueva hoja automática: `SolicitudesReunionRepresentantes`.
- Acceso público protegido por cédula + código del representante.
- Cada docente solo puede consultar y confirmar solicitudes dirigidas a su propio `idProfesor`.
