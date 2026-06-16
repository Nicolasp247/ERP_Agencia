/* erp-tour-operator/frontend/src/pages/expediente/confirmacion-builder/components/ConfirmacionBuilderTable.tsx */

type ConfirmacionColumn = {
  id: number;
  label?: string;
  grupo: string;
  nombre: string;
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
  tipoServicio?: string | null;
  tipoServicioCodigo?: string | null;
  ciudadNombre?: string | null;
  paisNombre?: string | null;
  precios: ConfirmacionRowPrice[];
};

type ConfirmacionBuilderTableProps = {
  columns: ConfirmacionColumn[];
  rows: ConfirmacionRow[];
  monedaCodigo: string;
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

function formatMoney(value: number | null | undefined, monedaCodigo: string) {
  if (value === null || value === undefined) {
    return "-";
  }

  return `$ ${Number(value).toFixed(2)} ${monedaCodigo}`;
}

function getPrice(row: ConfirmacionRow, columnId: number) {
  return row.precios.find((price) => price.columnId === columnId);
}

export function ConfirmacionBuilderTable({
  columns,
  rows,
  monedaCodigo
}: ConfirmacionBuilderTableProps) {
  return (
    <div className="builder-table-shell">
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
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => {
              const visualOrder = index + 1;
              const isAccommodation = isAccommodationRow(row);

              if (isAccommodation) {
                return (
                  <>
                    <tr className="builder-city-row builder-row-accommodation" key={`city-${row.id}`}>
                      <td className="builder-order-cell" rowSpan={2}>
                        <span className="builder-order-readonly">{visualOrder}</span>
                      </td>

                      <td className="builder-city-title-cell builder-itinerary-title-cell" colSpan={2}>
                        {getCityTitle(row)}
                      </td>

                      <td className="builder-operator-cell" rowSpan={2}>
                        {row.operador}
                      </td>

                      {columns.map((column) => {
                        const price = getPrice(row, column.id);

                        return (
                          <td key={column.id} rowSpan={2}>
                            <span className="builder-price-cell-readonly">
                              {formatMoney(price?.precioConfirmado ?? price?.precioCotizado, monedaCodigo)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>

                    <tr className="builder-service-row builder-row-accommodation" key={`row-${row.id}`}>
                      <td className="builder-date-cell">
                        {formatAccommodationDateRange(row.fecha, row.fechaFin)}
                      </td>

                      <td className="builder-service-name-cell builder-service-included-cell">
                        <span>{row.servicioIncluido}</span>
                      </td>
                    </tr>
                  </>
                );
              }

              return (
                <tr className="builder-service-row" key={row.id}>
                  <td className="builder-order-cell">
                    <span className="builder-order-readonly">{visualOrder}</span>
                  </td>

                  <td className="builder-date-cell">{formatLongDateEs(row.fecha)}</td>

                  <td className="builder-service-name-cell builder-service-included-cell">
                    <span>{row.servicioIncluido}</span>
                  </td>

                  <td className="builder-operator-cell">{row.operador}</td>

                  {columns.map((column) => {
                    const price = getPrice(row, column.id);

                    return (
                      <td key={column.id}>
                        <span className="builder-price-cell-readonly">
                          {formatMoney(price?.precioConfirmado ?? price?.precioCotizado, monedaCodigo)}
                        </span>
                      </td>
                    );
                  })}
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
    </div>
  );
}