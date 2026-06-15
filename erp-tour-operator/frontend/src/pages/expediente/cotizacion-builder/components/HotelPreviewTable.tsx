/* erp-tour-operator/frontend/src/pages/expediente/cotizacion-builder/components/HotelPreviewTable.tsx */

import { useMemo, useState } from "react";

import type {
  BuilderColumn,
  BuilderRow
} from "@/pages/expediente/cotizacion-builder/types/cotizacion-builder.types";

type HotelPreviewTableProps = {
  columns: BuilderColumn[];
  rows: BuilderRow[];
  readOnly?: boolean;
  onUpdateItemHotels: (
    itemId: number,
    payload: {
      hotels: Array<{
        columnId: number;
        textoHotel: string;
      }>;
    }
  ) => void;
};

function formatDateRange(startDate: string, endDate?: string | null) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = endDate ? new Date(`${endDate}T00:00:00`) : null;

  const formatter = new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  const formattedStart = formatter.format(start);

  if (!end || startDate === endDate) {
    return formattedStart;
  }

  return `Del ${formattedStart}\n al ${formatter.format(end)}`;
}

function getColumnLabel(column: BuilderColumn) {
  return `${column.grupo} ${column.nombre}`
    .replaceAll("*", " estrellas")
    .replace(/\s+/g, " ")
    .trim();
}

function getHotelValue(row: BuilderRow, columnId: number) {
  const hotel = row.hotelesPrevistos.find((currentHotel) => currentHotel.columnId === columnId);
  return hotel?.textoHotel ?? "";
}

function isAccommodationRow(row: BuilderRow) {
  return row.tipoServicioCodigo === "ALOJAMIENTO" || row.tipoServicio?.toUpperCase() === "ALOJAMIENTO";
}

export function HotelPreviewTable({ columns, rows, readOnly = false, onUpdateItemHotels }: HotelPreviewTableProps) {
  const terrestrialColumns = useMemo(
    () => columns.filter((column) => column.tipo === "TERRESTRE"),
    [columns]
  );

  const accommodationRows = useMemo(
    () => rows.filter((row) => isAccommodationRow(row)),
    [rows]
  );

  const [drafts, setDrafts] = useState<Record<string, string>>({});

  if (accommodationRows.length === 0 || terrestrialColumns.length === 0) {
    return null;
  }

  function getDraftKey(rowId: number, columnId: number) {
    return `${rowId}-${columnId}`;
  }

  function getInputValue(row: BuilderRow, columnId: number) {
    const key = getDraftKey(row.id, columnId);
    return drafts[key] ?? getHotelValue(row, columnId);
  }

  function handleChange(row: BuilderRow, columnId: number, value: string) {
    const key = getDraftKey(row.id, columnId);

    setDrafts((current) => ({
      ...current,
      [key]: value
    }));
  }

  function handleBlur(row: BuilderRow) {
    if (readOnly) return;

    const hotels = terrestrialColumns.map((column) => ({
      columnId: column.id,
      textoHotel: getInputValue(row, column.id)
    }));

    onUpdateItemHotels(row.id, {
      hotels
    });
  }

  return (
    <section className="builder-hotels-section">
      <div className="builder-hotels-table-wrapper">
        <table className="builder-hotels-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Ciudad / servicio</th>
              {terrestrialColumns.map((column) => (
                <th key={column.id}>{getColumnLabel(column)}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {accommodationRows.map((row) => (
              <tr key={row.id}>
                <td>{formatDateRange(row.fecha, row.fechaFin)}</td>
                <td>
                  <strong>{row.ciudadNombre ?? "Sin ciudad"}</strong>
                  <span>{row.servicioIncluido}</span>
                </td>

                {terrestrialColumns.map((column) => (
                  <td key={column.id}>
                    <input
                      className="builder-hotel-input"
                      placeholder="Hotel previsto o similar"
                      value={getInputValue(row, column.id)}
                      readOnly={readOnly}
                      onChange={(event) => {
                        if (readOnly) return;
                        handleChange(row, column.id, event.target.value);
                      }}
                      onBlur={() => handleBlur(row)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}