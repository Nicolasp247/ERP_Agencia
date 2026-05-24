/* erp-tour-operator/frontend/src/pages/cotizacion-builder/components/CotizacionBuilderTable.tsx */

import type { BuilderColumn, BuilderRow } from "../types/cotizacion-builder.types";
import { getColumnLabel } from "../helpers/builder-calculations";
import { formatDateShortEs } from "@/utils/date-format";

type CotizacionBuilderTableProps = {
  columns: BuilderColumn[];
  rows: BuilderRow[];
};

export function CotizacionBuilderTable({ columns, rows }: CotizacionBuilderTableProps) {
  return (
    <div className="builder-table-wrapper">
      <table className="builder-table">
        <thead>
          <tr>
            <th>Acciones</th>
            <th>Fecha</th>
            <th>Servicio incluido</th>
            <th>Operador</th>

            {columns.map((column) => (
              <th key={column.id}>{getColumnLabel(column)}</th>
            ))}

            <th>Notas</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr className={row.esOpcional ? "builder-row-optional" : ""} key={row.id}>
              <td>
                <div className="builder-row-actions">
                  <button className="link-button" type="button">
                    Editar
                  </button>
                  <button className="danger-button" type="button">
                    Eliminar
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

                return (
                  <td key={column.id}>
                    {price?.precioNeto !== null && price?.precioNeto !== undefined
                      ? `${price.precioNeto.toFixed(2)}`
                      : "-"}
                  </td>
                );
              })}

              <td>{row.notas || "Sin notas"}</td>
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