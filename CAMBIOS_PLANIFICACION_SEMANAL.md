# EduGestión — Planificación semanal inteligente

## Cambios incorporados

- Nueva pestaña **Plan semanal** en el menú docente.
- Campo editable para **inicio y fin del año escolar**.
- Generación automática del calendario por sección a partir de **Mi Horario**.
- Asignación de cada bloque semanal como **Aula** o **Cancha**.
- Conteo automático de:
  - clases efectivas;
  - clases en aula;
  - clases en cancha;
  - fechas con evaluación.
- Vista de **calendario mensual por sección**.
- Navegación de **planificación semanal**.
- Integración con el **Plan de Evaluación** existente: si una evaluación coincide con la fecha de clase se muestra y se envía como contexto a Gemini.
- Integración con el **Calendario Escolar** existente: las efemérides aparecen en la fecha correspondiente y los eventos marcados expresamente como "Asueto" se proponen como "Sin clase".
- Opción para cambiar manualmente cualquier fecha a **Clase efectiva** o **Sin clase / suspendida**.
- Formulario para agregar **clases manuales** (recuperaciones, cambios o clases extraordinarias).
- Campos pedagógicos por clase:
  - Tema
  - Objetivo / propósito
  - Estrategias metodológicas
  - Inicio
  - Desarrollo
  - Cierre
  - Evaluación / evidencias
- **Gemini automático por semana**: genera la planificación considerando año/sección, materia, fecha, hora, Aula/Cancha, calendario escolar y evaluaciones vinculadas.
- Interruptor para activar o desactivar la **IA automática**.
- El módulo existente "Generar planificación con Gemini" también incorpora ahora el campo **Estrategias metodológicas** y solicita Inicio, Desarrollo y Cierre.

## Uso sugerido

1. Inicia sesión como docente.
2. Verifica que el horario esté cargado en **Mi Horario**.
3. Abre **Plan semanal**.
4. Define la fecha de inicio y fin del año escolar.
5. Selecciona una sección.
6. Verifica los dos bloques semanales y asigna cuál corresponde a **Aula** y cuál a **Cancha**.
7. Consulta el calendario mensual y el conteo de clases.
8. Abre una semana. Si **IA automática** está activada, Gemini preparará la planificación de las clases que aún estén vacías.
9. Puedes editar cualquier texto generado manualmente.

## Persistencia de esta primera versión

El ZIP suministrado no contiene el código fuente del Google Apps Script que actualmente guarda horarios, evaluaciones y otros datos institucionales. Por esa razón, la nueva planificación semanal se guarda por docente en el almacenamiento local del navegador, mientras que **lee el horario y el plan de evaluación reales desde el servidor existente**.

Esto significa que la planificación semanal permanece en el mismo navegador/dispositivo. Para sincronizar estos nuevos campos entre diferentes computadoras o teléfonos será necesario añadir las nuevas acciones y tablas al Google Apps Script institucional.

La variable privada `GEMINI_API_KEY` no se incluye en este ZIP. En Vercel debe mantenerse configurada como variable de entorno, tal como en el despliegue actual.

## Corrección V1.1 — vínculo con Plan de Evaluación
- Se robusteció la coincidencia entre horario y evaluaciones para aceptar variantes equivalentes de año/grado (por ejemplo 1ro/1ero/1°), sección y formatos de fecha.
- Las evaluaciones programadas ahora se cuentan y se muestran en la clase correspondiente dentro de Plan semanal.

## Fase nueva V2 — Lapsos + secuencia pedagógica inteligente

Se incorporaron directamente sobre la versión V1.1 los siguientes cambios:

- **Configuración de 1er, 2do y 3er Lapso** con fecha de inicio y fecha de cierre editables.
- **Resumen automático por lapso** para la sección seleccionada:
  - clases efectivas;
  - clases en aula;
  - clases en cancha;
  - fechas con evaluación;
  - clases pedagógicas restantes (clases efectivas menos fechas evaluativas);
  - clases suspendidas / sin clase.
- Validación visual si dos lapsos se superponen, si el fin es anterior al inicio o si las fechas quedan fuera del año escolar.
- Cada clase muestra el **lapso al que pertenece** cuando las fechas del lapso están configuradas.
- La semana muestra un bloque de **contexto pedagógico** con el lapso actual, la base curricular vinculada y el estado de continuidad.
- Integración directa con el **Panel por lapso del Cuadernillo de Educación Física**: Gemini recibe los temas que el docente haya asignado al lapso correspondiente.
- **Continuidad entre semanas**: Gemini recibe como contexto las últimas clases anteriores guardadas y no debe reiniciar ni repetir el contenido sin justificación.
- **Visión hacia adelante**: Gemini recibe las próximas clases y próximas evaluaciones para preparar una progresión coherente.
- Gemini sigue diferenciando **Aula** y **Cancha**, ahora dentro de una secuencia continua del lapso.
- Si el docente ya escribió manualmente Tema, Objetivo, Estrategias, Inicio, Desarrollo, Cierre o Evaluación, la generación automática **respeta ese contenido y solo completa los campos vacíos**.
- Las evaluaciones del Plan de Evaluación continúan vinculándose por sección y fecha y ahora también forman parte del contexto de continuidad del lapso.

### Uso de la nueva fase

1. Abre **Plan semanal**.
2. Define el inicio y fin del año escolar.
3. En **Organización por lapsos**, coloca el inicio y fin reales de 1er, 2do y 3er Lapso.
4. Selecciona una sección y verifica la distribución Aula/Cancha obtenida desde Mi Horario.
5. EduGestión mostrará inmediatamente el número real de clases disponibles en cada lapso y cuántas quedan como clases pedagógicas después de descontar las fechas evaluativas.
6. Si ya distribuiste temas en **Panel por lapso**, Gemini los utilizará automáticamente como base curricular de la semana.
7. Al generar una semana, Gemini revisará lo trabajado anteriormente y lo que viene después para mantener una secuencia pedagógica continua.

### Compatibilidad

La V2 conserva los datos locales creados con V1/V1.1 porque mantiene la misma clave de almacenamiento de Planificación semanal y agrega los nuevos campos de lapsos de manera compatible.
