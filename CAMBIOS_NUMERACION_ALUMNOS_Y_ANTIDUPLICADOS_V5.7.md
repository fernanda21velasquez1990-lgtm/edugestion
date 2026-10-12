# EduGestión V5.7 — Numeración de alumnos y registro antiduplicados

- Cada lista de sección muestra un **N° de lista** calculado alfabéticamente.
- El número aparece en Control de asistencia y en el selector de fichas.
- Telegram conserva la lista numerada y puede usarse con formatos como `A: 2,5; T: 3; J: 4`.
- El backend ahora evita crear una segunda ficha si el docente vuelve a guardar el mismo alumno porque todavía no lo veía cargado.
- La comprobación se realiza en el servidor por nombre + año + sección + turno cuando no hay cédula, y por cédula + identidad cuando sí existe.
- Después de guardar, la web vuelve a consultar la lista y confirma visualmente el número asignado.
- Se mantiene la eliminación segura de duplicados existentes incorporada en V5.6.
