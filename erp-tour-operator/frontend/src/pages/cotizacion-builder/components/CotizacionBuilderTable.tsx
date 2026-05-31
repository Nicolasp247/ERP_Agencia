/* erp-tour-operator/frontend/src/pages/cotizacion-builder/components/CotizacionBuilderTable.tsx */

import { Fragment, useMemo, useState } from "react";
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

const SHORT_MONTHS_ES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic"
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
  const month = SHORT_MONTHS_ES[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  return `${weekday}, ${day}/${month}/${year}`;
}

function formatAccommodationDateRange(startValue: string, endValue: string | null) {
  const startDate = parseIsoDate(startValue);
  const endDate = parseIsoDate(endValue || startValue);

  if (!startDate || !endDate) {
    return startValue;
  }

  const startDay = twoDigits(startDate.getUTCDate());
  const endDay = twoDigits(endDate.getUTCDate());
  const startMonth = SHORT_MONTHS_ES[startDate.getUTCMonth()];
  const endMonth = SHORT_MONTHS_ES[endDate.getUTCMonth()];
  const startYear = startDate.getUTCFullYear();
  const endYear = endDate.getUTCFullYear();

  if (startYear === endYear && startDate.getUTCMonth() === endDate.getUTCMonth()) {
    return `${startDay} - ${endDay}/${startMonth}/${startYear}`;
  }

  if (startYear === endYear) {
    return `${startDay}/${startMonth} - ${endDay}/${endMonth}/${endYear}`;
  }

  return `${startDay}/${startMonth}/${startYear} - ${endDay}/${endMonth}/${endYear}`;
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

type FloatingPriceEditor = {
  row: BuilderRow;
  column: BuilderColumn;
  value: string;
};

function normalizeFormulaExpression(value: string) {
  return value
    .replace(",", ".")
    .replaceAll("USD", "")
    .replaceAll("usd", "")
    .replaceAll("$", "")
    .trim();
}

function evaluatePriceFormula(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (!trimmed.startsWith("=")) {
    const parsed = Number(normalizeFormulaExpression(trimmed));
    return Number.isFinite(parsed) ? parsed : null;
  }

  const expression = normalizeFormulaExpression(trimmed.slice(1));

  if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
    return null;
  }

  try {
    const result = Function(`"use strict"; return (${expression});`)();
    const parsed = Number(result);

    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function formatPriceValue(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "-";
  }

  return `$ ${value.toFixed(2)}`;
}

function getInitialPriceFormula(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "=";
  }

  return `=${value}`;
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
      tituloOverride?: string | null;
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
  const [visibleNotesRowId, setVisibleNotesRowId] = useState<number | null>(null);
  const [editingNotesRowId, setEditingNotesRowId] = useState<number | null>(null);
  const [draftNote, setDraftNote] = useState("");
  const [draftServiceTitle, setDraftServiceTitle] = useState("");
  const [floatingPriceEditor, setFloatingPriceEditor] =
    useState<FloatingPriceEditor | null>(null);

  function openRowNotes(row: BuilderRow) {
    setFloatingPriceEditor(null);
    setEditingNotesRowId(null);
    setDraftNote("");
    setDraftServiceTitle("");
    setVisibleNotesRowId(row.id);
  }

  function closeRowNotes() {
    setVisibleNotesRowId(null);
    setEditingNotesRowId(null);
    setDraftNote("");
    setDraftServiceTitle("");
  }

  function startEditingNotes(row: BuilderRow) {
    setFloatingPriceEditor(null);
    setVisibleNotesRowId(row.id);
    setEditingNotesRowId(row.id);
    setDraftNote(row.notas ?? "");
    setDraftServiceTitle(row.servicioIncluido ?? "");
  }

  function cancelEditingNotes() {
    setEditingNotesRowId(null);
    setDraftNote("");
    setDraftServiceTitle("");
  }

  function saveEditingNotes(row: BuilderRow) {
    const cleanNote = draftNote.trim();
    const cleanTitle = draftServiceTitle.trim();
    const originalTitle = row.servicioIncluido?.trim() ?? "";

    const titleChanged = cleanTitle !== originalTitle;

    onUpdateItemNotes(row.id, {
      notaLinea: cleanNote || null,
      tituloOverride: titleChanged ? cleanTitle || null : undefined
    });

    setEditingNotesRowId(null);
    setDraftNote("");
    setDraftServiceTitle("");
  }

  function openFloatingPriceEditor(row: BuilderRow, column: BuilderColumn) {
    const price = row.precios.find((item) => item.columnId === column.id);

    setVisibleNotesRowId(null);
    setEditingNotesRowId(null);
    setDraftNote("");

    setFloatingPriceEditor({
      row,
      column,
      value: getInitialPriceFormula(price?.precioNeto)
    });
  }

  function updateFloatingPriceValue(value: string) {
    setFloatingPriceEditor((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        value
      };
    });
  }

  function closeFloatingPriceEditor() {
    setFloatingPriceEditor(null);
  }

  function saveFloatingPriceEditor() {
    if (!floatingPriceEditor) {
      return;
    }

    const newValue = evaluatePriceFormula(floatingPriceEditor.value);

    const prices = floatingPriceEditor.row.precios.map((price) => {
      if (price.columnId !== floatingPriceEditor.column.id) {
        return {
          columnId: price.columnId,
          precioNeto: price.precioNeto
        };
      }

      return {
        columnId: price.columnId,
        precioNeto: newValue
      };
    });

    onUpdateItemPrices(floatingPriceEditor.row.id, {
      prices
    });

    setFloatingPriceEditor(null);
  }

  function renderPriceOrNotesCells(row: BuilderRow, rowSpan?: number) {
    if (visibleNotesRowId === row.id) {
      return (
        <td className="builder-notes-cell" colSpan={columns.length} rowSpan={rowSpan}>
          {editingNotesRowId === row.id ? (
            <label className="builder-note-field">
              Notas internas del servicio
              <textarea
                className="builder-note-textarea"
                onChange={(event) => setDraftNote(event.target.value)}
                placeholder="Escribe las notas de este servicio..."
                value={draftNote}
              />
            </label>
          ) : (
            <div className="builder-notes-view">
              <strong>Notas:</strong>
              <p>{row.notas || "Sin notas"}</p>
            </div>
          )}
        </td>
      );
    }

    return columns.map((column) => {
      const price = row.precios.find((item) => item.columnId === column.id);

      const isEditingThisPrice =
        floatingPriceEditor?.row.id === row.id &&
        floatingPriceEditor?.column.id === column.id;

      return (
        <td
          key={column.id}
          rowSpan={rowSpan}
          className={isEditingThisPrice ? "builder-price-cell-editing" : undefined}
        >
          <button
            className={
              isEditingThisPrice
                ? "builder-price-cell-button builder-price-cell-button-editing"
                : "builder-price-cell-button"
            }
            type="button"
            onClick={() => openFloatingPriceEditor(row, column)}
            title="Editar precio"
          >
            {formatPriceValue(price?.precioNeto)}
          </button>
        </td>
      );
    });
  }

  function renderServiceIncludedCell(row: BuilderRow) {
    if (editingNotesRowId === row.id) {
      return (
        <label className="builder-service-title-field">
          Servicio incluido personalizado
          <textarea
            className="builder-service-title-textarea builder-service-title-textarea-inline"
            onChange={(event) => setDraftServiceTitle(event.target.value)}
            placeholder="Ej: Visita panorámica por Madrid con guía privado en español"
            value={draftServiceTitle}
          />
        </label>
      );
    }

    return (
      <span>
        {row.esOpcional ? `Opcional: ${row.servicioIncluido}` : row.servicioIncluido}
      </span>
    );
  }

  function renderActions(row: BuilderRow) {
    return (
      <div className="builder-row-actions builder-row-actions-compact">
        {editingNotesRowId === row.id ? (
          <>
            <button
              className="icon-button icon-button-success"
              onClick={() => saveEditingNotes(row)}
              title="Guardar nota"
              type="button"
            >
              ✓
            </button>

            <button
              className="icon-button"
              onClick={cancelEditingNotes}
              title="Cancelar edición de nota"
              type="button"
            >
              ×
            </button>
          </>
        ) : visibleNotesRowId === row.id ? (
          <>
            <button
              className="icon-button"
              onClick={() => startEditingNotes(row)}
              title="Editar notas"
              type="button"
            >
              ✎
            </button>

            <button
              className="icon-button"
              onClick={closeRowNotes}
              title="Salir de notas"
              type="button"
            >
              ×
            </button>
          </>
        ) : (
          <>
            <button
              className="icon-button"
              onClick={() => openRowNotes(row)}
              title="Ver notas"
              type="button"
            >
              ☷
            </button>

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
          </>
        )}
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

  const floatingPreviewValue = useMemo(() => {
    if (!floatingPriceEditor) {
      return null;
    }

    return evaluatePriceFormula(floatingPriceEditor.value);
  }, [floatingPriceEditor]);

  return (
  <div className="builder-table-shell">
    {floatingPriceEditor ? (
      <div className="builder-price-formula-bar">
        <div className="builder-price-formula-meta">
          <span>Editor de precio</span>
          <strong>{floatingPriceEditor.column ? getColumnLabel(floatingPriceEditor.column) : ""}</strong>
          <small>{floatingPriceEditor.row.servicioIncluido}</small>
        </div>

        <label className="builder-price-formula-field">
          Fórmula / valor
          <input
            autoFocus
            value={floatingPriceEditor.value}
            onChange={(event) => updateFloatingPriceValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                saveFloatingPriceEditor();
              }

              if (event.key === "Escape") {
                closeFloatingPriceEditor();
              }
            }}
            placeholder="=150+20"
          />
        </label>

        <div className="builder-price-formula-result">
          <span>Resultado</span>
          <strong>
            {floatingPreviewValue === null ? "-" : formatPriceValue(floatingPreviewValue)}
          </strong>
        </div>

        <div className="builder-price-formula-actions">
          <button className="primary-button" type="button" onClick={saveFloatingPriceEditor}>
            Guardar
          </button>

          <button className="link-button" type="button" onClick={closeFloatingPriceEditor}>
            Cancelar
          </button>
        </div>
      </div>
    ) : null}

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

                    <td className="builder-city-title-cell builder-itinerary-title-cell" colSpan={2}>
                      {getCityTitle(row)}
                    </td>

                    <td className="builder-operator-cell" rowSpan={2}>
                      {renderOperator(row)}
                    </td>

                    {renderPriceOrNotesCells(row, 2)}

                    <td rowSpan={2}>{renderActions(row)}</td>
                  </tr>

                  <tr className={`builder-service-row ${rowTypeClass}`}>
                    <td className="builder-date-cell">
                      {formatAccommodationDateRange(row.fecha, row.fechaFin)}
                    </td>

                    <td className="builder-service-name-cell builder-service-included-cell">
                      {renderServiceIncludedCell(row)}
                    </td>
                  </tr>
                </Fragment>
              );
            }

            return (
              <tr className={`builder-service-row ${rowTypeClass}`} key={row.id}>
                <td className="builder-order-cell">
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

                <td className="builder-date-cell">{formatLongDateEs(row.fecha)}</td>

                <td className="builder-service-name-cell builder-service-included-cell">
                  {renderServiceIncludedCell(row)}
                </td>
                <td className="builder-operator-cell">{renderOperator(row)}</td>

                {renderPriceOrNotesCells(row)}

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
    </div>
  );
}