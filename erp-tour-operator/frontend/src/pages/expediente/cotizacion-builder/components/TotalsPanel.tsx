/* erp-tour-operator/frontend/src/pages/expediente/cotizacion-builder/components/TotalsPanel.tsx */

import { useMemo, useState } from "react";

import type {
  BuilderColumn,
  BuilderCommission,
  BuilderRow
} from "../types/cotizacion-builder.types";
import {
  buildSummaryColumns,
  evaluateFormula,
  roundUpToNextFive,
  type SummaryColumn
} from "../helpers/totals-calculations";

type TotalsPanelProps = {
  columns: BuilderColumn[];
  comisiones: BuilderCommission[];
  rows: BuilderRow[];
  monedaCodigo: string;
  totalPasajeros: number;
  readOnly?: boolean;
  onUpdateColumnShownPrice: (
    columnId: number,
    values: {
      precioMostradoFormula: string | null;
      precioMostradoValor: number | null;
    }
  ) => void;
};

function formatMoney(value: number, monedaCodigo: string) {
  return `${value.toFixed(2)} ${monedaCodigo}`;
}

function formatMoneyNoDecimals(value: number, monedaCodigo: string) {
  return `${Math.round(value)} ${monedaCodigo}`;
}

export function TotalsPanel({
  columns,
  comisiones,
  rows,
  monedaCodigo,
  totalPasajeros,
  readOnly = false,
  onUpdateColumnShownPrice
}: TotalsPanelProps) {
  const [mostradoInputs, setMostradoInputs] = useState<Record<number, string>>({});
  const [editingColumnId, setEditingColumnId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const summaries = useMemo(() => {
    return buildSummaryColumns({
      columns,
      comisiones,
      rows,
      totalPasajeros,
      mostradoInputs
    });
  }, [columns, comisiones, rows, totalPasajeros, mostradoInputs]);

  const outdatedSummaries = summaries.filter((item) => item.mostradoEsMenorAlPrecio);
  const hasOutdatedShownPrices = outdatedSummaries.length > 0;

  function getInputValue(item: SummaryColumn) {
    return mostradoInputs[item.column.id] ?? item.mostradoFormula;
  }

  function updateMostrado(columnId: number, value: string) {
    setMostradoInputs((current) => ({
      ...current,
      [columnId]: value
    }));
  }

  function cancelEditingMostrado(item: SummaryColumn) {
    setMostradoInputs((current) => {
      const next = { ...current };
      delete next[item.column.id];
      return next;
    });

    setEditingColumnId(null);
  }

  function saveEditingMostrado(item: SummaryColumn) {
    if (readOnly) return;
    const formula = getInputValue(item).trim() || `=${item.mostradoAutomatico}`;
    const normalizedFormula = formula.startsWith("=") ? formula : `=${formula}`;
    const value = evaluateFormula(normalizedFormula, item.mostradoAutomatico);

    setMostradoInputs((current) => ({
      ...current,
      [item.column.id]: normalizedFormula
    }));

    onUpdateColumnShownPrice(item.column.id, {
      precioMostradoFormula: normalizedFormula,
      precioMostradoValor: value
    });

    setEditingColumnId(null);
  }

  function updateOutdatedShownPrices() {
    if (readOnly || !hasOutdatedShownPrices) {
      return;
    }

    const nextInputs: Record<number, string> = {};

    outdatedSummaries.forEach((item) => {
      const newShownValue = roundUpToNextFive(item.precio);
      const newFormula = `=${newShownValue}`;

      nextInputs[item.column.id] = newFormula;

      onUpdateColumnShownPrice(item.column.id, {
        precioMostradoFormula: newFormula,
        precioMostradoValor: newShownValue
      });
    });

    setMostradoInputs((current) => ({
      ...current,
      ...nextInputs
    }));

    setStatusMessage("Precios mostrados actualizados. Favor revisar.");
    window.setTimeout(() => {
      setStatusMessage(null);
    }, 3500);
  }

  return (
    <div className="builder-card">
      <div className="builder-totals-table-layout">
        <div className="builder-totals-table-block">
          <div className="builder-totals-heading-row">
            <h4>Totales de cotización</h4>

            {hasOutdatedShownPrices && !readOnly ? (
              <button
                className="builder-totals-warning-action"
                type="button"
                onClick={updateOutdatedShownPrices}
              >
                Actualizar mostrados
              </button>
            ) : null}
          </div>

          {hasOutdatedShownPrices && !readOnly ? (
            <div className="builder-totals-warning">
              Hay valores de “Mostrado al pasajero” por debajo del precio calculado.
            </div>
          ) : null}

          {statusMessage ? (
            <div className="builder-totals-status">
              {statusMessage}
            </div>
          ) : null}

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
                      <td
                        key={item.column.id}
                        className={
                          item.mostradoEsMenorAlPrecio
                            ? "builder-total-shown-warning-cell"
                            : undefined
                        }
                      >
                        {isEditing ? (
                          <input
                            className="builder-total-edit-input"
                            value={getInputValue(item)}
                            autoFocus
                            onChange={(event) => updateMostrado(item.column.id, event.target.value)}
                            onBlur={() => saveEditingMostrado(item)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                saveEditingMostrado(item);
                              }

                              if (event.key === "Escape") {
                                event.preventDefault();
                                cancelEditingMostrado(item);
                              }
                            }}
                            title="Puedes escribir una fórmula empezando con ="
                          />
                        ) : (
                          <button
                            className={
                              item.mostradoEsMenorAlPrecio
                                ? "builder-total-result-button builder-total-result-button-warning"
                                : "builder-total-result-button"
                            }
                            type="button"
                            disabled={readOnly}
                            onClick={() => {
                              if (readOnly) return;
                              setEditingColumnId(item.column.id);
                            }}
                            title={`Fórmula: ${getInputValue(item)}`}
                          >
                            <strong>{formatMoneyNoDecimals(item.mostrado, monedaCodigo)}</strong>
                            <span>{item.unidadLabel}</span>
                            {item.mostradoEsMenorAlPrecio ? (
                              <em>Menor al precio</em>
                            ) : null}
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
            {readOnly
              ? "Modo lectura: los valores mostrados al pasajero no se pueden editar."
              : "En “Mostrado al pasajero” se muestra el resultado. Haz clic sobre el valor para editar la fórmula."}
          </p>
        </div>
      </div>
    </div>
  );
}