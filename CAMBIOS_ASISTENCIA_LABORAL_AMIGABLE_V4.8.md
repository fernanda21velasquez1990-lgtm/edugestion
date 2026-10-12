# EduGestión V4.8 · Asistencia laboral amigable

## Cambios
- Se conserva el registro automático de llegada y salida con la hora actual.
- Se agrega **Registro manual** para indicar fecha, hora de llegada y hora de salida cuando el docente olvidó marcar en el momento.
- Se agrega vista previa de horas trabajadas antes de guardar un registro manual.
- Se puede editar cualquier jornada desde el historial.
- Se puede borrar cualquier jornada desde el historial.
- Se agrega un acceso rápido para borrar el registro del día desde la tarjeta de estado.
- El reloj y las horas visibles se muestran en formato de 12 horas (a. m. / p. m.) para una lectura más amigable.
- Los resúmenes de hoy, semana y mes se recalculan tomando en cuenta correcciones manuales.
- El historial identifica visualmente los registros manuales.
- La interfaz aplica para ambos docentes.

## Compatibilidad del servidor
La interfaz intenta usar las acciones de servidor:
- `guardarAsistenciaDocenteManual`
- `eliminarAsistenciaDocente`

Si el Google Apps Script actual aún no contiene esas acciones, EduGestión usa un respaldo local por docente en el navegador para no impedir la corrección manual ni la limpieza visual del registro.
