/* erp-tour-operator/frontend/src/pages/expediente/confirmacion-builder/components/ConfirmacionBuilderTable.tsx */

import { Fragment, useMemo, useState } from "react";
import type {
  CompraProveedor,
  CompraProveedorCancelValues,
  CompraProveedorCreateValues,
  CompraProveedorReplaceValues,
  CompraProveedorUpdateValues
} from "@/modules/contabilidad/compras-proveedor/compras-proveedor-api";

import {
  ConfirmacionAdministrativePanel,
  type ConfirmacionAdministrativePurchase,
  type LegacyConfirmacionPurchase
} from "@/pages/expediente/confirmacion-builder/components/ConfirmacionAdministrativePanel";

type ConfirmacionColumn = {
  id: number;
  label?: string;
  grupo: string;
  nombre: string;
  multiplicador: number;
};

type ConfirmacionRowPrice = {
  columnId: number;
  precioCotizado: number | null;
  precioConfirmado: number | null;
};

type ConfirmacionRow = {
  id: number;
  fecha: string | null;
  fechaFin?: string | null;
  ordenDia: number;
  servicioIncluido: string;
  operador: string;
  compraProveedor?: ConfirmacionAdministrativePurchase | null;
  linkReserva?: string | null;
  notas?: string | null;
  tipoServicio?: string | null;
  tipoServicioCodigo?: string | null;
  ciudadNombre?: string | null;
  paisNombre?: string | null;
  precios: ConfirmacionRowPrice[];
};

type FloatingPriceEditor = {
  row: ConfirmacionRow;
  column: ConfirmacionColumn;
  value: string;
};

type ConfirmacionBuilderTableProps = {
  columns: ConfirmacionColumn[];
  rows: ConfirmacionRow[];
  monedaCodigo: string;
  isSavingPurchase?: boolean;

  onCreateItemPurchase: (
    itemId: number,
    values: CompraProveedorCreateValues
  ) => Promise<void>;

  onUpdateItemPurchase: (
    proveedorReservaId: number,
    values: CompraProveedorUpdateValues
  ) => Promise<void>;

  onCancelItemPurchase: (
    proveedorReservaId: number,
    values: CompraProveedorCancelValues
  ) => Promise<void>;

  onReplaceItemPurchase: (
    proveedorReservaId: number,
    values: CompraProveedorReplaceValues
  ) => Promise<void>;
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
        precioConfirmado: number | null;
      }>;
    }
  ) => void;
};

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

function formatAccommodationDateRange(startValue: string | null, endValue?: string | null) {
  if (!startValue) {
    return "";
  }

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

function isAccommodationRow(row: ConfirmacionRow) {
  const tipoNombre = row.tipoServicio?.trim().toLowerCase() ?? "";
  const tipoCodigo = row.tipoServicioCodigo?.trim().toLowerCase() ?? "";

  return tipoNombre === "alojamiento" || tipoCodigo === "alojamiento";
}

function getRowTypeClass(row: ConfirmacionRow) {
  const tipoNombre = row.tipoServicio?.trim().toLowerCase() ?? "";
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

function getCityTitle(row: ConfirmacionRow) {
  const city = row.ciudadNombre ?? "Ciudad por definir";
  const country = row.paisNombre ? ` (${row.paisNombre})` : "";

  return `${city}${country}`.toUpperCase();
}

function getColumnLabel(column: ConfirmacionColumn) {
  return (
    column.label ||
    `${column.grupo} ${column.nombre}`
      .replaceAll("*", " estrellas")
      .replace(/\s+/g, " ")
      .trim()
  );
}

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

function formatPriceValue(value: number | null | undefined, monedaCodigo: string) {
  if (value === null || value === undefined) {
    return "-";
  }

  return `${value.toFixed(2)} ${monedaCodigo}`;
}

function getInitialPriceFormula(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "=";
  }

  return `=${value}`;
}

function getPrice(row: ConfirmacionRow, columnId: number) {
  return row.precios.find((price) => price.columnId === columnId);
}

function isNewPurchase(
  purchase:
    | ConfirmacionAdministrativePurchase
    | null
    | undefined
): purchase is CompraProveedor {
  return Boolean(
    purchase &&
      "estadoOperativo" in purchase &&
      "codigoProveedor" in purchase
  );
}

function isLegacyPurchase(
  purchase:
    | ConfirmacionAdministrativePurchase
    | null
    | undefined
): purchase is LegacyConfirmacionPurchase {
  return Boolean(
    purchase &&
      "codigoConfirmacionProveedor" in purchase
  );
}

function getPurchaseUnitValue(
  purchase:
    | ConfirmacionAdministrativePurchase
    | null
    | undefined
) {
  if (isNewPurchase(purchase)) {
    return purchase.valorContratadoUnidad;
  }

  if (isLegacyPurchase(purchase)) {
    return purchase.valorPagadoUnidad;
  }

  return null;
}

function getPurchaseCode(
  purchase:
    | ConfirmacionAdministrativePurchase
    | null
    | undefined
) {
  if (isNewPurchase(purchase)) {
    return purchase.codigoProveedor;
  }

  if (isLegacyPurchase(purchase)) {
    return purchase.codigoConfirmacionProveedor;
  }

  return null;
}

function purchaseAppliesToColumn(
  row: ConfirmacionRow,
  columnId: number
) {
  return (
    row.compraProveedor
      ?.columnaSeleccionada?.id ===
    columnId
  );
}

export function ConfirmacionBuilderTable({
  columns,
  rows,
  monedaCodigo,
  isSavingPurchase = false,
  onDeleteItem,
  onMoveItem,
  onCreateItemPurchase,
  onUpdateItemPurchase,
  onCancelItemPurchase,
  onReplaceItemPurchase,
  onUpdateItemNotes,
  onUpdateItemPrices
}: ConfirmacionBuilderTableProps) {
  const [visibleNotesRowId, setVisibleNotesRowId] = useState<number | null>(null);
  const [administrativeRow, setAdministrativeRow] = useState<ConfirmacionRow | null>(null);
  const [editingNotesRowId, setEditingNotesRowId] = useState<number | null>(null);
  const [draftNote, setDraftNote] = useState("");
  const [draftServiceTitle, setDraftServiceTitle] = useState("");
  const [floatingPriceEditor, setFloatingPriceEditor] =
    useState<FloatingPriceEditor | null>(null);

  function openAdministrativePanel(row: ConfirmacionRow) {
    setFloatingPriceEditor(null);
    setVisibleNotesRowId(null);
    setEditingNotesRowId(null);
    setDraftNote("");
    setDraftServiceTitle("");
    setAdministrativeRow(row);
  }

  function closeAdministrativePanel() {
    if (isSavingPurchase) {
      return;
    }

    setAdministrativeRow(null);
  }

  async function createAdministrativePurchase(
    row: ConfirmacionRow,
    values: CompraProveedorCreateValues
  ) {
    await onCreateItemPurchase(
      row.id,
      values
    );

    setAdministrativeRow(null);
  }

  async function updateAdministrativePurchase(
    proveedorReservaId: number,
    values: CompraProveedorUpdateValues
  ) {
    await onUpdateItemPurchase(
      proveedorReservaId,
      values
    );

    setAdministrativeRow(null);
  }

  async function cancelAdministrativePurchase(
    proveedorReservaId: number,
    values: CompraProveedorCancelValues
  ) {
    await onCancelItemPurchase(
      proveedorReservaId,
      values
    );

    setAdministrativeRow(null);
  }

  async function replaceAdministrativePurchase(
    proveedorReservaId: number,
    values: CompraProveedorReplaceValues
  ) {
    await onReplaceItemPurchase(
      proveedorReservaId,
      values
    );

    setAdministrativeRow(null);
  }

  function openRowNotes(row: ConfirmacionRow) {
    setAdministrativeRow(null);
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

  function startEditingNotes(row: ConfirmacionRow) {
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

  function saveEditingNotes(row: ConfirmacionRow) {
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

  function openFloatingPriceEditor(row: ConfirmacionRow, column: ConfirmacionColumn) {
    const price = getPrice(row, column.id);

    setVisibleNotesRowId(null);
    setEditingNotesRowId(null);
    setAdministrativeRow(null);
    setDraftNote("");

    setFloatingPriceEditor({
      row,
      column,
      value: getInitialPriceFormula(price?.precioConfirmado ?? price?.precioCotizado)
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
          precioConfirmado: price.precioConfirmado ?? price.precioCotizado
        };
      }

      return {
        columnId: price.columnId,
        precioConfirmado: newValue
      };
    });

    onUpdateItemPrices(floatingPriceEditor.row.id, {
      prices
    });

    setFloatingPriceEditor(null);
  }

  function renderPriceOrNotesCells(row: ConfirmacionRow, rowSpan?: number) {
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
      const price = getPrice(row, column.id);

      const quotedValue =
        price?.precioConfirmado ??
        price?.precioCotizado;

      const purchaseApplies =
        purchaseAppliesToColumn(
          row,
          column.id
        );

      const paidValue = purchaseApplies
        ? getPurchaseUnitValue(
            row.compraProveedor
          )
        : null;

      const paidCurrency =
        row.compraProveedor?.monedaCodigo ??
        monedaCodigo;

      const comparisonResult =
        row.compraProveedor
          ?.resultadoComparacion ?? null;

      const isEditingThisPrice =
        floatingPriceEditor?.row.id === row.id &&
        floatingPriceEditor?.column.id ===
          column.id;

      return (
        <td
          key={column.id}
          rowSpan={rowSpan}
          className={
            isEditingThisPrice
              ? "builder-price-cell-editing"
              : undefined
          }
        >
          <button
            className={
              isEditingThisPrice
                ? "builder-price-cell-button builder-price-cell-button-editing"
                : "builder-price-cell-button"
            }
            type="button"
            onClick={() =>
              openFloatingPriceEditor(
                row,
                column
              )
            }
            title="Editar precio confirmado"
          >
            {paidValue !== null ? (
              <span className="confirmacion-paid-price">
                <strong
                  className={
                    comparisonResult === "MAYOR"
                      ? "confirmacion-paid-price-value confirmacion-paid-price-over"
                      : "confirmacion-paid-price-value confirmacion-paid-price-ok"
                  }
                >
                  {formatPriceValue(
                    paidValue,
                    paidCurrency
                  )}
                </strong>

                <small className="confirmacion-quoted-price">
                  Cotizado:{" "}
                  {formatPriceValue(
                    quotedValue,
                    monedaCodigo
                  )}
                </small>
              </span>
            ) : (
              formatPriceValue(
                quotedValue,
                monedaCodigo
              )
            )}
          </button>
        </td>
      );
    });
  }

  function renderServiceIncludedCell(row: ConfirmacionRow) {
    if (editingNotesRowId === row.id) {
      return (
        <label className="builder-service-title-field">
          Servicio confirmado personalizado
          <textarea
            className="builder-service-title-textarea builder-service-title-textarea-inline"
            onChange={(event) => setDraftServiceTitle(event.target.value)}
            placeholder="Ej: Visita panorámica por Madrid con guía privado en español"
            value={draftServiceTitle}
          />
        </label>
      );
    }

    return <span>{row.servicioIncluido}</span>;
  }

  function renderActions(row: ConfirmacionRow) {
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
              className={
                administrativeRow?.id === row.id
                  ? "icon-button icon-button-active"
                  : "icon-button"
              }
              onClick={() => openAdministrativePanel(row)}
              title={
                row.compraProveedor
                  ? "Editar confirmación del operador"
                  : "Registrar confirmación del operador"
              }
              type="button"
            >
              ▣
            </button>

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
                const confirmed = window.confirm(
                  "¿Eliminar este servicio de la confirmación? No se eliminará de la cotización original."
                );

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

  function renderOperator(
    row: ConfirmacionRow
  ) {
    const operatorContent = (
      <span className="confirmacion-operator-content">
        <strong>{row.operador}</strong>

        {getPurchaseCode(
          row.compraProveedor
        ) ? (
          <span className="confirmacion-operator-code">
            {getPurchaseCode(
              row.compraProveedor
            )}
          </span>
        ) : (
          <span className="confirmacion-operator-pending">
            Sin confirmar
          </span>
        )}
      </span>
    );

    if (!row.linkReserva) {
      return operatorContent;
    }

    return (
      <a
        className="builder-operator-link"
        href={row.linkReserva}
        rel="noreferrer"
        target="_blank"
        title="Abrir link de reserva"
      >
        {operatorContent}
      </a>
    );
  }

  function renderOrderControls(row: ConfirmacionRow, visualOrder: number) {
    return (
      <div className="builder-order-controls">
        <span className="builder-order-readonly">{visualOrder}</span>

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
      </div>
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
            <span>Editor de precio confirmado</span>
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
              {floatingPreviewValue === null
                ? "-"
                : formatPriceValue(floatingPreviewValue, monedaCodigo)}
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
              <th>Servicio confirmado</th>
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
            {rows.map((row, index) => {
              const visualOrder = index + 1;
              const rowTypeClass = getRowTypeClass(row);
              const isAccommodation = isAccommodationRow(row);

              if (isAccommodation) {
                return (
                  <Fragment key={row.id}>
                    <tr className={`builder-city-row ${rowTypeClass}`}>
                      <td className="builder-order-cell" rowSpan={2}>
                        {renderOrderControls(row, visualOrder)}
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
                <tr
                  className={`builder-service-row ${rowTypeClass}`}
                  key={row.id}
                >
                  <td className="builder-order-cell">
                    {renderOrderControls(row, visualOrder)}
                  </td>

                  <td className="builder-date-cell">
                    {formatLongDateEs(row.fecha)}
                  </td>

                  <td className="builder-service-name-cell builder-service-included-cell">
                    {renderServiceIncludedCell(row)}
                  </td>

                  <td className="builder-operator-cell">
                    {renderOperator(row)}
                  </td>

                  {renderPriceOrNotesCells(row)}

                  <td>{renderActions(row)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!rows.length ? (
          <div className="services-empty-state">
            Todavía no hay servicios confirmados en esta versión.
          </div>
        ) : null}
      </div>
      
      {administrativeRow ? (
        <div
          className="builder-modal-backdrop confirmacion-admin-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAdministrativePanel();
            }
          }}
        >
          <div
            aria-modal="true"
            className="builder-modal confirmacion-admin-modal"
            role="dialog"
          >
            <ConfirmacionAdministrativePanel
              columns={columns}
              row={{
                fecha: administrativeRow.fecha,
                fechaFin: administrativeRow.fechaFin,
                servicioIncluido:
                  administrativeRow.servicioIncluido,
                precios: administrativeRow.precios
              }}
              operador={administrativeRow.operador}
              compraProveedor={
                administrativeRow.compraProveedor ?? null
              }
              monedaCodigo={monedaCodigo}
              isSaving={isSavingPurchase}
              onClose={closeAdministrativePanel}
              onCreate={(values) =>
                createAdministrativePurchase(
                  administrativeRow,
                  values
                )
              }
              onUpdate={
                updateAdministrativePurchase
              }
              onCancelReservation={
                cancelAdministrativePurchase
              }
              onReplace={
                replaceAdministrativePurchase
              }
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}