# EduGestión V7.1 · Integración final de Evaluaciones + Gestión de Estudiantes

## Ajustes visuales
- Se corrigió la zona superior de Evaluaciones y Notas para que no quede debajo de la barra fija.
- Los controles Lapso, Sección, Cargar e Importar Planificación Express tienen columnas independientes.
- Se evita que los botones y tarjetas se monten unos encima de otros.
- Se mejoró la respuesta visual para pantallas medianas y móviles.
- Se agregó una barra de estado que muestra Sección, Planificación y Control de Estudio.

## Integración de módulos
- El selector de secciones de Evaluaciones combina:
  - Horario del docente.
  - Planificación registrada.
  - Estudiantes realmente inscritos por sección.
- La sección seleccionada en Evaluaciones actualiza los filtros principales del sistema.
- Evaluaciones sigue tomando las actividades de Planificación.
- Planificación Express puede importarse a Evaluaciones.
- Evaluaciones y Notas sincroniza automáticamente el mismo lapso con el módulo Notas y Control de Estudio.
- La ponderación de Control de Estudio se deriva de los puntos del plan sobre 20.
- Las notas por actividad se convierten a escala /20 para el módulo de Control de Estudio.
- Se mantiene Expediente, Seguimiento, Recuperación y Cierre de Lapso.

## Eliminación de estudiantes
- Nuevo botón "Eliminar estudiante" en la pestaña Registro de Estudiantes.
- Solo se habilita al cargar una ficha existente.
- Solicita confirmación antes de eliminar.
- Elimina la ficha del docente y sus registros relacionados:
  asistencia, calificaciones, actas, evaluaciones, seguimientos, recuperaciones,
  auditoría de calificaciones y compromisos académicos.
- Se conserva la auditoría histórica de asistencia.
- La lista y las secciones se actualizan después de eliminar.
