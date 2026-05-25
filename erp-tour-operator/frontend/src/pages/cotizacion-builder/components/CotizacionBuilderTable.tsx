/* erp-tour-operator/frontend/src/pages/cotizacion-builder/components/CotizacionBuilderTable.tsx */

import { useState } from "react";
import type { BuilderColumn, BuilderRow } from "../types/cotizacion-builder.types";
import { getColumnLabel } from "../helpers/builder-calculations";
import { formatDateShortEs } from "@/utils/date-format";

type CotizacionBuilderTableProps = {
  columns: BuilderColumn[];
  rows: BuilderRow[];
  onDeleteItem: (itemId: number) => void;
  onUpdateItemPrices: (
    itemId: number,
    values: {
      prices: Array<{
        columnId: number;
        precioNeto: number | null;
      }>;
    }
  ) => void;
};

export function CotizacionBuilderTable({
  columns,
  rows,
  onDeleteItem,
  onUpdateItemPrices
}: CotizacionBuilderTableProps) {
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [draftPrices, setDraftPrices] = useState<Record<number, string>>({});

  function startEditingPrices(row: BuilderRow) {
    const initialPrices: Record<number, string> = {};

    row.precios.forEach((price) => {
      initialPrices[price.columnId] =
        price.precioNeto === null || price.precioNeto === undefined
          ? ""
          : String(price.precioNeto);
    });

    setEditingRowId(row.id);
    setDraftPrices(initialPrices);
  }

  function cancelEditingPrices() {
    setEditingRowId(null);
    setDraftPrices({});
  }

  function saveEditingPrices(row: BuilderRow) {
    const prices = row.precios.map((price) => {
      const rawValue = draftPrices[price.columnId]?.trim() ?? "";

      return {
        columnId: price.columnId,
        precioNeto: rawValue === "" ? null : Number(rawValue)
      };
    });

    onUpdateItemPrices(row.id, {
      prices
    });

    setEditingRowId(null);
    setDraftPrices({});
  }
  return (
    <div className="builder-table-wrapper">
      <table className="builder-table">
        <thead>
        <tr>
          <th>Orden</th>
          <th>Fecha</th>
          <th>Servicio incluido</th>
          <th>Operador</th>

          {columns.map((column) => (
            <th key={column.id}>
              <span className="builder-column-label">
                {getColumnLabel(column)
                  .split(" ")
                  .map((part) => (
                    <span key={part}>{part}</span>
                  ))}
              </span>
            </th>
          ))}

          <th>Notas</th>
          <th>Acciones</th>
        </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr className={row.esOpcional ? "builder-row-optional" : ""} key={row.id}>
              <td>
                <div className="builder-row-actions builder-row-actions-compact">
                  <button className="icon-button" title="Subir servicio" type="button">
                    ↑
                  </button>
                  <button className="icon-button" title="Bajar servicio" type="button">
                    ↓
                  </button>
                </div>
              </td>

              <td>{formatDateShortEs(row.fecha)}</td>

              <td>
                <strong>{row.esOpcional ? `Opcional: ${row.servicioIncluido}` : row.servicioIncluido}</strong>
              </td>

              <td>{row.operador}</td>

              {columns.map((column) => {
                const price = row.precios.find((item) => item.columnId === column.id);
                const isEditingPrices = editingRowId === row.id;

                if (isEditingPrices && price) {
                  return (
                    <td key={column.id}>
                      <input
                        className="builder-price-input"
                        min="0"
                        onChange={(event) =>
                          setDraftPrices((current) => ({
                            ...current,
                            [column.id]: event.target.value
                          }))
                        }
                        step="0.01"
                        type="number"
                        value={draftPrices[column.id] ?? ""}
                      />
                    </td>
                  );
                }

                return (
                  <td key={column.id}>
                    {price?.precioNeto !== null && price?.precioNeto !== undefined
                      ? `$ ${price.precioNeto.toFixed(2)}`
                      : "-"}
                  </td>
                );
              })}

              <td>{row.notas || "Sin notas"}</td>

              <td>
                <div className="builder-row-actions builder-row-actions-compact">
                  {editingRowId === row.id ? (
                    <>
                      <button
                        className="icon-button icon-button-success"
                        onClick={() => saveEditingPrices(row)}
                        title="Guardar precios"
                        type="button"
                      >
                        ✓
                      </button>
                      <button
                        className="icon-button"
                        onClick={cancelEditingPrices}
                        title="Cancelar edición"
                        type="button"
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <button
                      className="icon-button"
                      onClick={() => startEditingPrices(row)}
                      title="Editar precios"
                      type="button"
                    >
                      ✎
                    </button>
                  )}
                  <button
                    className="icon-button icon-button-danger"
                    onClick={() => {
                      const confirmed = window.confirm("¿Eliminar este servicio de la cotización?");

                      if (confirmed) {
                        onDeleteItem(row.id);
                      }
                    }}
                    title="Eliminar servicio"
                    type="button"
                  >
                    ×
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!rows.length ? (
        <div className="services-empty-state">
          Todavía no hay servicios en esta versión de cotización.
        </div>
      ) : null}
    </div>
  );
}