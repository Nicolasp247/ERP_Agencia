# Decisions

## 2026-04-17

- Se crea el proyecto como monorepo `backend` + `frontend`.
- Se toma `Data_Export_BD.sql` como base heredada y se modela en Prisma la versión objetivo del MVP, conservando nombres de tablas críticas del catálogo y ampliando terceros, reserva, confirmación comercial, liquidación, seguridad y auditoría.
- Se documentan ambigüedades detectadas en `docs/open-questions.md` y se sigue adelante con decisiones conservadoras compatibles con D1-D5.
- La vista `v_alojamiento_precio_mes` se conserva en la migración SQL aunque no se use todavía como fuente primaria del MVP.
- Los PDFs básicos se generan desde backend con `pdfkit` y consumen datos estructurados de cotización/reserva, no plantillas manuales.
