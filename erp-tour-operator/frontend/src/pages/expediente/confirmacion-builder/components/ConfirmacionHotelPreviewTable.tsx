// erp_agency/src/pages/expediente/confirmacion-builder/components/ConfirmacionHotelPreviewTable.tsx

import { useMemo, useState } from "react";

type ConfirmacionColumn = {
  id: number;
  label?: string;
  grupo: string;
  nombre: string;
  tipo: string;
};

type ConfirmacionHotel = {
  columnId: number;
  textoHotel: string;
};

type ConfirmacionRow = {
  id: number;
  fecha: string | null;
  fechaFin?: string | null;
  servicioIncluido: string;
  tipoServicio?: string | null;
  tipoServicioCodigo?: string | null;
  ciudadNombre?: string | null;
  hotelesPrevistos: ConfirmacionHotel[];
};

type ConfirmacionHotelPreviewTableProps = {
  columns: ConfirmacionColumn[];
  rows: ConfirmacionRow[];
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

function formatDateRange(startDate: string | null, endDate?: string | null) {
  if (!startDate) {
    return "N/D";
  }

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

function getColumnLabel(column: ConfirmacionColumn) {
  return (
    column.label ||
    `${column.grupo} ${column.nombre}`
      .replaceAll("*", " estrellas")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function isAccommodationRow(row: ConfirmacionRow) {
  const tipoNombre = row.tipoServicio?.trim().toLowerCase() ?? "";
  const tipoCodigo = row.tipoServicioCodigo?.trim().toLowerCase() ?? "";

  return tipoNombre === "alojamiento" || tipoCodigo === "alojamiento";
}

function getHotelValue(row: ConfirmacionRow, columnId: number) {
  const hotel = row.hotelesPrevistos.find((currentHotel) => currentHotel.columnId === columnId);
  return hotel?.textoHotel ?? "";
}

export function ConfirmacionHotelPreviewTable({
  columns,
  rows,
  onUpdateItemHotels
}: ConfirmacionHotelPreviewTableProps) {
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
    return (
      <div className="future-card">
        <strong>Sin alojamientos</strong>
        <p>Esta confirmación no tiene servicios de alojamiento para mostrar hoteles previstos.</p>
      </div>
    );
  }

  function getDraftKey(rowId: number, columnId: number) {
    return `${rowId}-${columnId}`;
  }

  function getInputValue(row: ConfirmacionRow, columnId: number) {
    const key = getDraftKey(row.id, columnId);
    return drafts[key] ?? getHotelValue(row, columnId);
  }

  function handleChange(row: ConfirmacionRow, columnId: number, value: string) {
    const key = getDraftKey(row.id, columnId);

    setDrafts((current) => ({
      ...current,
      [key]: value
    }));
  }

  function handleBlur(row: ConfirmacionRow) {
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
                      placeholder="Hotel confirmado o similar"
                      value={getInputValue(row, column.id)}
                      onChange={(event) => handleChange(row, column.id, event.target.value)}
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