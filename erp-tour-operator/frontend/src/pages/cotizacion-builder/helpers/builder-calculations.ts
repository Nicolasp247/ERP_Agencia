/* erp-tour-operator/frontend/src/pages/cotizacion-builder/helpers/builder-calculations.ts */

import type { BuilderColumn, BuilderRow } from "../types/cotizacion-builder.types";

export function getColumnLabel(column: BuilderColumn) {
  return `${column.grupo} ${column.nombre}`.trim();
}

export function calculateColumnTotal(rows: BuilderRow[], columnId: string) {
  return rows.reduce((total, row) => {
    const price = row.precios.find((item) => item.columnId === columnId);
    return total + Number(price?.precioNeto ?? 0);
  }, 0);
}