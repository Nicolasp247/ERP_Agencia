/* erp-tour-operator/frontend/src/pages/cotizacion-builder/helpers/builder-calculations.ts */

import type { BuilderColumn, BuilderRow } from "../types/cotizacion-builder.types";

function cleanCategoryName(value: string) {
  return value.replace(/\s*\([^)]*\)/g, "").trim();
}

export function getColumnLabel(column: BuilderColumn) {
  const category = cleanCategoryName(column.grupo);
  const accommodation = column.nombre;

  if (column.tipo === "TRANSPORTE") {
    return `Transporte ${accommodation}`.trim();
  }

  if (column.tipo === "OPCIONALES") {
    return `Opcionales ${accommodation}`.trim();
  }

  if (column.unidad === "POR_NINO") {
    return `${category} ${accommodation} Niño (menor 10 años)`.trim();
  }

  return `${category} ${accommodation}`.trim();
}

export function calculateColumnTotal(rows: BuilderRow[], columnId: number) {
  return rows.reduce((total, row) => {
    const price = row.precios.find((item) => item.columnId === columnId);
    return total + Number(price?.precioNeto ?? 0);
  }, 0);
}