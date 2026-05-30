/* erp-tour-operator/frontend/src/pages/cotizacion-builder/components/TotalsPanel.tsx */

import { useMemo, useState } from "react";

import type { BuilderColumn, BuilderRow } from "../types/cotizacion-builder.types";
import { calculateColumnTotal, getColumnLabel } from "../helpers/builder-calculations";

type TotalsPanelProps = {
  columns: BuilderColumn[];
  rows: BuilderRow[];
  monedaCodigo: string;
  totalPasajeros: number;
};

type CommissionRule = {
  agente: number;
  empresa: number;
  bancario: number;
};

type SummaryColumn = {
  column: BuilderColumn;
  label: string;
  costo: number;
  precio: number;
  mostradoAutomatico: number;
  mostrado: number;
  totalGrupo: number;
  unidadLabel: string;
};

const TERRESTRE_COMMISSION: CommissionRule = {
  agente: 12,
  empresa: 13,
  bancario: 5
};

const AEREA_COMMISSION: CommissionRule = {
  agente: 5,
  empresa: 5,
  bancario: 5
};

function normalizeText(value: string | null | undefined) {
  return String(value ?? "")
    .trim()
    .toUpperCase();
}

function formatMoney(value: number, monedaCodigo: string) {
  return `${value.toFixed(2)} ${monedaCodigo}`;
}

function formatMoneyNoDecimals(value: number, monedaCodigo: string) {
  return `${Math.round(value)} ${monedaCodigo}`;
}

function getCommissionTotal(rule: CommissionRule) {
  return rule.agente + rule.empresa + rule.bancario;
}

function getCommissionFactor(rule: CommissionRule) {
  return (100 - getCommissionTotal(rule)) / 100;
}

function isAirColumn(column: BuilderColumn) {
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

function getCommissionRule(column: BuilderColumn) {
  return isAirColumn(column) ? AEREA_COMMISSION : TERRESTRE_COMMISSION;
}

function getUnitLabel(column: BuilderColumn) {
  const unidad = normalizeText(column.unidad);

  if (unidad === "POR_PERSONA") return "por persona";
  if (unidad === "POR_NINO") return "por niño";
  if (unidad === "POR_HABITACION") return "por habitación";
  if (unidad === "POR_SERVICIO") return "por servicio";
  if (unidad === "POR_VEHICULO") return "por vehículo";
  if (unidad === "POR_GRUPO") return "por grupo";

  return "por unidad";
}

function getTotalMultiplier(column: BuilderColumn, totalPasajeros: number) {
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

function roundUpToNextFive(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.ceil(value / 5) * 5;
}

function normalizeFormulaExpression(value: string) {
  return value
    .replace(",", ".")
    .replaceAll("USD", "")
    .replaceAll("usd", "")
    .trim();
}

function evaluateFormula(value: string, fallback: number) {
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

function buildSummaryColumn(
  column: BuilderColumn,
  rows: BuilderRow[],
  totalPasajeros: number,
  mostradoInputs: Record<number, string>
): SummaryColumn {
  const costo = calculateColumnTotal(rows, column.id);
  const rule = getCommissionRule(column);
  const factor = getCommissionFactor(rule);
  const precio = factor > 0 ? costo / factor : costo;
  const mostradoAutomatico = roundUpToNextFive(precio);
  const mostrado = evaluateFormula(
    mostradoInputs[column.id] ?? String(mostradoAutomatico),
    mostradoAutomatico
  );
  const totalGrupo = mostrado * getTotalMultiplier(column, totalPasajeros);

  return {
    column,
    label: getColumnLabel(column),
    costo,
    precio,
    mostradoAutomatico,
    mostrado,
    totalGrupo,
    unidadLabel: getUnitLabel(column)
  };
}

export function TotalsPanel({
  columns,
  rows,
  monedaCodigo,
  totalPasajeros
}: TotalsPanelProps) {
  const [mostradoInputs, setMostradoInputs] = useState<Record<number, string>>({});
  const [editingColumnId, setEditingColumnId] = useState<number | null>(null);

  const summaries = useMemo(() => {
    return columns.map((column) =>
      buildSummaryColumn(column, rows, totalPasajeros, mostradoInputs)
    );
  }, [columns, rows, totalPasajeros, mostradoInputs]);

  function getInputValue(item: SummaryColumn) {
    return mostradoInputs[item.column.id] ?? `=${item.mostradoAutomatico}`;
  }

  function updateMostrado(columnId: number, value: string) {
    setMostradoInputs((current) => ({
      ...current,
      [columnId]: value
    }));
  }

  return (
    <div className="builder-card">
      <div className="builder-totals-table-layout">
        <div className="builder-totals-table-block">
          <h4>Totales de cotización</h4>
          <div className="builder-totals-table-wrapper">
            <table className="builder-totals-table">
              <thead>
                <tr>
                  <th>Concepto</th>
                  {summaries.map((item) => (
                    <th key={item.column.id}>{item.label}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>Costo</td>
                  {summaries.map((item) => (
                    <td key={item.column.id}>
                      <span className="builder-total-money">
                        {formatMoney(item.costo, monedaCodigo)}
                      </span>
                      <span>{item.unidadLabel}</span>
                    </td>
                  ))}
                </tr>

                <tr className="builder-totals-price-row">
                  <td>Precio</td>
                  {summaries.map((item) => (
                    <td key={item.column.id}>
                      <span className="builder-total-price-value">
                        {formatMoney(item.precio, monedaCodigo)}
                      </span>
                      <span>{item.unidadLabel}</span>
                    </td>
                  ))}
                </tr>

                <tr className="builder-totals-highlight-row builder-totals-bold-row">
                  <td>Mostrado al pasajero</td>
                  {summaries.map((item) => {
                    const isEditing = editingColumnId === item.column.id;

                    return (
                      <td key={item.column.id}>
                        {isEditing ? (
                          <input
                            className="builder-total-edit-input"
                            value={getInputValue(item)}
                            autoFocus
                            onChange={(event) => updateMostrado(item.column.id, event.target.value)}
                            onBlur={() => setEditingColumnId(null)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.currentTarget.blur();
                              }

                              if (event.key === "Escape") {
                                setEditingColumnId(null);
                              }
                            }}
                            title="Puedes escribir una fórmula empezando con ="
                          />
                        ) : (
                          <button
                            className="builder-total-result-button"
                            type="button"
                            onClick={() => setEditingColumnId(item.column.id)}
                            title={`Fórmula: ${getInputValue(item)}`}
                          >
                            <strong>{formatMoneyNoDecimals(item.mostrado, monedaCodigo)}</strong>
                            <span>{item.unidadLabel}</span>
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>

                <tr className="builder-totals-final-row">
                  <td>Total precio para {totalPasajeros} pasajeros</td>
                  {summaries.map((item) => (
                    <td key={item.column.id}>
                      <span className="builder-total-final-value">
                        {formatMoneyNoDecimals(item.totalGrupo, monedaCodigo)}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <p className="builder-help-text">
            En “Mostrado al pasajero” se muestra el resultado. Haz clic sobre el valor para editar la fórmula.
          </p>
        </div>
      </div>
    </div>
  );
}