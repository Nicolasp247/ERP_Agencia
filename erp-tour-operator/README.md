# ERP Tour Operator

MVP web para una mayorista de turismo construido sobre D1-D5 con Node.js, TypeScript, Express, Prisma, MySQL 8, React, Vite, React Query, React Hook Form y Zod.

## Qué incluye

- Auth JWT básica.
- Gestión de clientes agente.
- Gestión de clientes finales.
- Gestión de proveedores y contactos.
- Gestión de tipos de servicio, servicios y tablas hijas.
- Tarifas base mensuales.
- Cotizaciones con ítems, precios sugeridos y precio de venta editable.
- Conversión transaccional cotización -> reserva.
- Confirmaciones por ítem.
- Confirmación comercial versionada.
- Liquidación básica.
- Auditoría mínima.
- Reportes básicos.
- PDF básico de cotización, reserva y confirmación.

## Estructura

```text
erp-tour-operator/
  backend/
  frontend/
  docs/
```

## Requisitos

- Node.js 22+
- npm 10+
- MySQL 8

## Variables de entorno

Backend: copia `backend/.env.example` a `backend/.env`

Frontend: copia `frontend/.env.example` a `frontend/.env`

## Arranque

1. Crear la base de datos MySQL:

```sql
CREATE DATABASE erp_tour_operator CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Instalar dependencias:

```bash
npm install
```

3. Ejecutar migraciones:

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

4. Cargar datos base y usuario inicial:

```bash
npm run prisma:seed
```

Usuario inicial:

- email: `admin@erp.local`
- password: `admin123`

5. Levantar backend + frontend:

```bash
cd ..
npm run dev
```

Backend: `http://localhost:4000`

Frontend: `http://localhost:5173`

## Scripts útiles

Raíz:

```bash
npm run dev
npm run build
npm test
```

Backend:

```bash
npm run dev --workspace backend
npm run build --workspace backend
npm run prisma:generate --workspace backend
npm run prisma:seed --workspace backend
```

Frontend:

```bash
npm run dev --workspace frontend
npm run build --workspace frontend
```

## Estado del modelo

- El esquema Prisma final está en [backend/prisma/schema.prisma](./backend/prisma/schema.prisma).
- La migración inicial está en [backend/prisma/migrations/202604170001_init/migration.sql](./backend/prisma/migrations/202604170001_init/migration.sql).
- Las decisiones y dudas abiertas están en [docs/architecture.md](./docs/architecture.md), [docs/decisions.md](./docs/decisions.md) y [docs/open-questions.md](./docs/open-questions.md).

## Verificación ejecutada

- `npm run build`
- `npm test`
