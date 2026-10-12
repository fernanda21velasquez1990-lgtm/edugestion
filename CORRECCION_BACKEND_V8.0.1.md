# EduGestión V8.0.1 · Corrección del backend completo

Se detectó que el ZIP V8.0 anterior había sido construido sobre una copia anterior de Code.gs.

Esta corrección:
- Usa como base el último Code.gs suministrado por la usuaria.
- Conserva todo el backend existente.
- Mantiene el Portal de Representantes y las mejoras V8.0.
- Actualiza obtenerAccesosRepresentantes_ con:
  - riesgo familiar,
  - actividades no entregadas y pendientes,
  - último contacto,
  - compromiso próximo,
  - compromiso vencido,
  - familias por atender,
  - representantes que aún no ingresan.
- No elimina módulos previos del sistema.
