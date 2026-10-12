# V4.9 — Corrección de fechas del Plan de Evaluación

- Se corrigió el cálculo de `Fecha desde / hasta` para que una misma evaluación no tome las dos secciones en semanas distintas.
- El sistema ahora busca una **misma semana real de aplicación** en la que todas las secciones seleccionadas tengan clase.
- `Desde` corresponde a la primera sección que realiza la evaluación esa semana y `Hasta` a la última sección que la realiza.
- Solo se usan días que existan realmente en **Mi Horario** y dentro del lapso configurado.
- El cálculo respeta las secciones indicadas en el plan (por ejemplo A y B) y evita tomar secciones no incluidas.
- Las superclases conservan sus semanas de gimnasio y usan el día real de cada sección.
- El botón **Recalcular fechas según horario** aplica esta nueva lógica también a planes ya generados.
