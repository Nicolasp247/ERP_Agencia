/* erp-tour-operator/frontend/src/pages/cotizacion-builder/components/CotizacionBuilderTable.tsx */

import { Fragment, useState } from "react";
import type { BuilderColumn, BuilderRow } from "../types/cotizacion-builder.types";
import { getColumnLabel } from "../helpers/builder-calculations";

const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre"
];

const WEEKDAYS_ES = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado"
];

function parseIsoDate(value: string | null | undefined) {
  if (!value) return null;

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function twoDigits(value: number) {
  return String(value).padStart(2, "0");
}

function formatLongDateEs(value: string | null | undefined) {
  const date = parseIsoDate(value);

  if (!date) {
    return "";
  }

  const weekday = WEEKDAYS_ES[date.getUTCDay()];
  const day = twoDigits(date.getUTCDate());
  const month = MONTHS_ES[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  return `${weekday}, ${day} de ${month} de ${year}`;
}

function formatAccommodationDateRange(startValue: string, endValue: string | null) {
  const startDate = parseIsoDate(startValue);
  const endDate = parseIsoDate(endValue || startValue);

  if (!startDate || !endDate) {
    return startValue;
  }

  const startDay = twoDigits(startDate.getUTCDate());
  const endDay = twoDigits(endDate.getUTCDate());
  const startMonth = MONTHS_ES[startDate.getUTCMonth()];
  const endMonth = MONTHS_ES[endDate.getUTCMonth()];
  const startYear = startDate.getUTCFullYear();
  const endYear = endDate.getUTCFullYear();

  if (startYear === endYear && startDate.getUTCMonth() === endDate.getUTCMonth()) {
    return `${startDay} - ${endDay} de ${startMonth} de ${startYear}`;
  }

  if (startYear === endYear) {
    return `${startDay} de ${startMonth} a ${endDay} de ${endMonth} de ${endYear}`;
  }

  return `${startDay} de ${startMonth} de ${startYear} a ${endDay} de ${endMonth} de ${endYear}`;
}

function isAlojamientoRow(row: BuilderRow) {
  const tipoNombre = row.tipoServicio.trim().toLowerCase();
  const tipoCodigo = row.tipoServicioCodigo?.trim().toLowerCase() ?? "";

  return tipoNombre === "alojamiento" || tipoCodigo === "alojamiento";
}

function getRowTypeClass(row: BuilderRow) {
  if (row.esOpcional) {
    return "builder-row-optional";
  }

  const tipoNombre = row.tipoServicio.trim().toLowerCase();
  const tipoCodigo = row.tipoServicioCodigo?.trim().toLowerCase() ?? "";

  if (tipoNombre === "alojamiento" || tipoCodigo === "alojamiento") {
    return "builder-row-accommodation";
  }

  if (
    tipoNombre === "vuelo" ||
    tipoNombre === "tren" ||
    tipoCodigo === "vuelo" ||
    tipoCodigo === "tren"
  ) {
    return "builder-row-transport";
  }

  if (tipoNombre === "otro" || tipoCodigo === "otro") {
    return "builder-row-other-service";
  }

  return "builder-row-land-service";
}

function getCityTitle(row: BuilderRow) {
  const city = row.ciudadNombre?.trim();
  const country = row.paisNombre?.trim();

  if (city && country) {
    return `${city.toUpperCase()} (${country.toUpperCase()})`;
  }

  if (city) {
    return city.toUpperCase();
  }

  return "ALOJAMIENTO";
}

type CotizacionBuilderTableProps = {
  columns: BuilderColumn[];
  rows: BuilderRow[];
  onDeleteItem: (itemId: number) => void;
  onMoveItem: (itemId: number, direction: "UP" | "DOWN") => void;
  onUpdateItemNotes: (
    itemId: number,
    values: {
      notaLinea: string | null;
    }
  ) => void;
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
  onMoveItem,
  onUpdateItemNotes,
  onUpdateItemPrices
}: CotizacionBuilderTableProps) {
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [visibleNotesRowId, setVisibleNotesRowId] = useState<number | null>(null);
  const [editingNotesRowId, setEditingNotesRowId] = useState<number | null>(null);
  const [draftPrices, setDraftPrices] = useState<Record<number, string>>({});
  const [draftNote, setDraftNote] = useState("");

  function startEditingPrices(row: BuilderRow) {
    const initialPrices: Record<number, string> = {};

    row.precios.forEach((price) => {
      initialPrices[price.columnId] =
        price.precioNeto === null || price.precioNeto === undefined
          ? ""
          : String(price.precioNeto);
    });

    setVisibleNotesRowId(null);
    setEditingNotesRowId(null);
    setDraftNote("");
    setEditingRowId(row.id);
    setDraftPrices(initialPrices);
  }

  function cancelEditingPrices() {
    setEditingRowId(null);
    setDraftPrices({});
  }

  function openRowNotes(row: BuilderRow) {
    setEditingRowId(null);
    setDraftPrices({});
    setEditingNotesRowId(null);
    setDraftNote("");
    setVisibleNotesRowId(row.id);
  }

  function closeRowNotes() {
    setVisibleNotesRowId(null);
    setEditingNotesRowId(null);
    setDraftNote("");
  }

  function startEditingNotes(row: BuilderRow) {
    setEditingRowId(null);
    setDraftPrices({});
    setVisibleNotesRowId(row.id);
    setEditingNotesRowId(row.id);
    setDraftNote(row.notas ?? "");
  }

  function cancelEditingNotes() {
    setEditingNotesRowId(null);
    setDraftNote("");
  }

  function saveEditingNotes(row: BuilderRow) {
    const cleanNote = draftNote.trim();

    onUpdateItemNotes(row.id, {
      notaLinea: cleanNote || null
    });

    setEditingNotesRowId(null);
    setDraftNote("");
  }

  function renderPriceCells(row: BuilderRow) {
    return columns.map((column) => {
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
    });
  }

  function renderActions(row: BuilderRow) {
    return (
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
    );
  }

  function renderOperator(row: BuilderRow) {
    if (!row.linkReserva) {
      return row.operador;
    }

    return (
      <a
        className="builder-operator-link"
        href={row.linkReserva}
        rel="noreferrer"
        target="_blank"
        title="Abrir link de reserva"
      >
        {row.operador}
      </a>
    );
  }

  function toggleRowNotes(rowId: number) {
    setEditingRowId(null);
    setDraftPrices({});
    setVisibleNotesRowId((currentRowId) => (currentRowId === rowId ? null : rowId));
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

          <th>Acciones</th>

        </tr>
        </thead>

        <tbody>
          {rows.map((row) => {
            const rowTypeClass = getRowTypeClass(row);
            const isAlojamiento = isAlojamientoRow(row);

            if (isAlojamiento) {
              return (
                <Fragment key={row.id}>
                  <tr className={`builder-city-row ${rowTypeClass}`}>
                    <td className="builder-order-cell" rowSpan={2}>
                      <div className="builder-row-actions builder-row-actions-compact">
                        <button
                          className="icon-button"
                          onClick={() => onMoveItem(row.id, "UP")}
                          title="Subir servicio"
                          type="button"
                        >
                          ↑
                        </button>
                        <button
                          className="icon-button"
                          onClick={() => onMoveItem(row.id, "DOWN")}
                          title="Bajar servicio"
                          type="button"
                        >
                          ↓
                        </button>
                      </div>
                    </td>

                    <td className="builder-city-title-cell" colSpan={columns.length + 5}>
                      {getCityTitle(row)}
                    </td>
                  </tr>

                  <tr className={`builder-service-row ${rowTypeClass}`}>
                    <td>{formatAccommodationDateRange(row.fecha, row.fechaFin)}</td>

                    <td>
                      <span>{row.servicioIncluido}</span>
                    </td>

                    <td>{renderOperator(row)}</td>

                    {renderPriceCells(row)}

                    <td>{row.notas || "Sin notas"}</td>

                    <td>{renderActions(row)}</td>
                  </tr>
                </Fragment>
              );
            }

            return (
              <tr className={`builder-service-row ${rowTypeClass}`} key={row.id}>
                <td>
                  <div className="builder-row-actions builder-row-actions-compact">
                    <button
                      className="icon-button"
                      onClick={() => onMoveItem(row.id, "UP")}
                      title="Subir servicio"
                      type="button"
                    >
                      ↑
                    </button>
                    <button
                      className="icon-button"
                      onClick={() => onMoveItem(row.id, "DOWN")}
                      title="Bajar servicio"
                      type="button"
                    >
                      ↓
                    </button>
                  </div>
                </td>

                <td>{formatLongDateEs(row.fecha)}</td>

                <td>
                  <span>{row.esOpcional ? `Opcional: ${row.servicioIncluido}` : row.servicioIncluido}</span>
                </td>

                <td>{renderOperator(row)}</td>

                {renderPriceCells(row)}

                <td>{row.notas || "Sin notas"}</td>

                <td>{renderActions(row)}</td>
              </tr>
            );
          })}
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