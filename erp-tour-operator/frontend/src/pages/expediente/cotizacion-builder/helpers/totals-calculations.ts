/* erp-tour-operator/frontend/src/pages/expediente/cotizacion-builder/helpers/totals-calculations.ts */

import type {
  BuilderColumn,
  BuilderCommission,
  BuilderCommissionType,
  BuilderRow
} from "../types/cotizacion-builder.types";
import { calculateColumnTotal, getColumnLabel } from "./builder-calculations";

export type CommissionRule = {
  tipoComision: BuilderCommissionType;
  factorVenta: number;
};

export type SummaryColumn = {
  column: BuilderColumn;
  label: string;
  costo: number;
  precio: number;
  mostradoAutomatico: number;
  mostradoFormula: string;
  mostrado: number;
  totalGrupo: number;
  unidadLabel: string;
  mostradoEsMenorAlPrecio: boolean;
};

export function normalizeText(value: string | null | undefined) {
  return String(value ?? "")
    .trim()
    .toUpperCase();
}

export function isAirColumn(column: BuilderColumn) {
  const tipo = normalizeText(column.tipo);
  const label = normalizeText(getColumnLabel(column));

  return (
    tipo === "TRANSPORTE" ||
    tipo === "AEREO" ||
    tipo === "AÉREO" ||
    label.includes("TRANSPORTE") ||
    label.includes("VUELO") ||
    label.includes("TREN")
  );
}

export function getDefaultCommission(tipoComision: BuilderCommissionType): CommissionRule {
  if (tipoComision === "AEREA") {
    return {
      tipoComision: "AEREA",
      factorVenta: 0.85
    };
  }

  return {
    tipoComision: "TERRESTRE",
    factorVenta: 0.7
  };
}

export function getCommissionRule(
  column: BuilderColumn,
  comisiones: BuilderCommission[]
): CommissionRule {
  const tipoComision: BuilderCommissionType = isAirColumn(column)
    ? "AEREA"
    : "TERRESTRE";

  const commission = comisiones.find(
    (item) => item.tipoComision === tipoComision
  );

  if (!commission) {
    return getDefaultCommission(tipoComision);
  }

  return {
    tipoComision,
    factorVenta: Number(commission.factorVenta || 1)
  };
}

export function getUnitLabel(column: BuilderColumn) {
  const unidad = normalizeText(column.unidad);

  if (unidad === "POR_PERSONA") return "por persona";
  if (unidad === "POR_NINO") return "por niño";
  if (unidad === "POR_HABITACION") return "por habitación";
  if (unidad === "POR_SERVICIO") return "por servicio";
  if (unidad === "POR_VEHICULO") return "por vehículo";
  if (unidad === "POR_GRUPO") return "por grupo";

  return "por unidad";
}

export function getTotalMultiplier(column: BuilderColumn, totalPasajeros: number) {
  const unidad = normalizeText(column.unidad);
  const pasajeros = Math.max(1, Number(totalPasajeros || 1));
  const multiplicador = Math.max(1, Number(column.multiplicador || 1));

  if (unidad === "POR_PERSONA" || unidad === "POR_NINO") {
    return pasajeros;
  }

  if (unidad === "POR_HABITACION") {
    return Math.ceil(pasajeros / multiplicador);
  }

  return 1;
}

export function roundUpToNextFive(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.ceil(value / 5) * 5;
}

export function getDefaultShownFormula(column: BuilderColumn, mostradoAutomatico: number) {
  const savedFormula = column.precioMostradoFormula?.trim();

  if (savedFormula) {
    return savedFormula.startsWith("=") ? savedFormula : `=${savedFormula}`;
  }

  return `=${mostradoAutomatico}`;
}

export function normalizeFormulaExpression(value: string) {
  return value
    .replace(",", ".")
    .replaceAll("USD", "")
    .replaceAll("usd", "")
    .trim();
}

export function evaluateFormula(value: string, fallback: number) {
  const trimmed = value.trim();

  if (!trimmed) {
    return fallback;
  }

  if (!trimmed.startsWith("=")) {
    const parsed = Number(normalizeFormulaExpression(trimmed));

    return Number.isFinite(parsed) ? parsed : fallback;
  }

  const expression = normalizeFormulaExpression(trimmed.slice(1));

  if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
    return fallback;
  }

  try {
    const result = Function(`"use strict"; return (${expression});`)();

    return Number.isFinite(Number(result)) ? Number(result) : fallback;
  } catch {
    return fallback;
  }
}

export function buildSummaryColumn(
  column: BuilderColumn,
  comisiones: BuilderCommission[],
  rows: BuilderRow[],
  totalPasajeros: number,
  mostradoInputs: Record<number, string>
): SummaryColumn {
  const costo = calculateColumnTotal(rows, column.id);
  const rule = getCommissionRule(column, comisiones);
  const factor = Number(rule.factorVenta || 1);
  const precio = factor > 0 ? costo / factor : costo;
  const mostradoAutomatico = roundUpToNextFive(precio);
  const mostradoFormula =
    mostradoInputs[column.id] ?? getDefaultShownFormula(column, mostradoAutomatico);
  const mostrado = evaluateFormula(mostradoFormula, mostradoAutomatico);
  const totalGrupo = mostrado * getTotalMultiplier(column, totalPasajeros);
  const mostradoEsMenorAlPrecio = mostrado + 0.01 < precio;

  return {
    column,
    label: getColumnLabel(column),
    costo,
    precio,
    mostradoAutomatico,
    mostradoFormula,
    mostrado,
    totalGrupo,
    unidadLabel: getUnitLabel(column),
    mostradoEsMenorAlPrecio
  };
}

export function buildSummaryColumns({
  columns,
  comisiones,
  rows,
  totalPasajeros,
  mostradoInputs
}: {
  columns: BuilderColumn[];
  comisiones: BuilderCommission[];
  rows: BuilderRow[];
  totalPasajeros: number;
  mostradoInputs: Record<number, string>;
}) {
  const totalColumns = columns.filter((column) => column.tipo !== "OPCIONALES");
  const totalRows = rows.filter((row) => !row.esOpcional);

  return totalColumns.map((column) =>
    buildSummaryColumn(column, comisiones, totalRows, totalPasajeros, mostradoInputs)
  );
}