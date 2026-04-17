# Architecture

## Scope

Este MVP sigue D1-D5 y se limita a terceros, catálogo, tarifas base, cotización, reserva, confirmación comercial, liquidación básica, documentos PDF básicos, reportes básicos, autenticación JWT y auditoría mínima.

## Technical Decisions

- Se usa un monorepo con `backend/` y `frontend/` sobre npm workspaces para mantener despliegue y desarrollo simples.
- El backend usa Express + TypeScript + Prisma + MySQL 8 con reglas críticas implementadas en servicios, validadores y restricciones de base de datos.
- El frontend usa React + Vite + React Query + React Hook Form + Zod. Zustand se usa para el token JWT y estado de sesión.
- Adaptación técnica documentada: para el MVP se usan claves `Int` autoincrementales en Prisma en lugar de `bigint unsigned` para simplificar relaciones, serialización JSON y compatibilidad de frontend. La semántica funcional y las FKs exigidas se conservan.
- Los históricos no se recalculan desde maestros mutables. La reserva persiste snapshots propios; la confirmación comercial congela precios de venta; la liquidación guarda su fotografía de cálculo.
- No se usan borrados físicos sobre entidades operativas. El historial se conserva con estados, marcas `activo` o cancelación.
- Se exponen endpoints simples de catálogo (`continente`, `pais`, `ciudad`) para consumo del frontend. Son de apoyo UI y no introducen lógica de negocio nueva.

## Backend Structure

- `modules/*`: controladores delgados, validadores Zod, servicios con lógica de negocio, repositorios Prisma y DTOs/mappers por módulo.
- `core/`: configuración, utilidades, errores tipados, middleware, cliente Prisma y helpers de respuesta.
- `routes/`: composición central de routers.

## Frontend Structure

- `modules/*`: API clients, schemas, hooks y componentes por dominio.
- `pages/`: pantallas conectadas al router.
- `services/`: cliente HTTP compartido.
- `core/`: providers, layout y bootstrap.

## Transaction Boundaries

- Crear cotización con ítems.
- Convertir cotización a reserva.
- Registrar confirmación comercial.
- Recalcular liquidación.

## Snapshot Strategy

- `cotizacion_item` persiste precio sugerido y precio de venta usado.
- `reserva` y `reserva_item` copian cabecera y detalle de la cotización de origen.
- `reserva_confirmacion_comercial` y sus ítems congelan venta confirmada.
- `liquidacion_reserva` guarda resultado financiero calculado.

## Liquidation Notes

- La liquidación recalculada usa la venta confirmada activa y los costos finales actualmente cargados.
- El cierre exige que todos los ítems efectivamente vendidos tengan `costo_final`.
