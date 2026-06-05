/* erp-tour-operator/frontend/src/pages/cotizacion-builder/components/OptionalServicesTable.tsx */

import { useMemo } from "react";

import type {
  BuilderColumn,
  BuilderPriceUnit,
  BuilderRow
} from "@/pages/cotizacion-builder/types/cotizacion-builder.types";
import { getColumnLabel } from "@/pages/cotizacion-builder/helpers/builder-calculations";

type OptionalServicesTableProps = {
  columns: BuilderColumn[];
  rows: BuilderRow[];
  monedaCodigo: string;
};

function roundUpToNextFive(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.ceil(value / 5) * 5;
}

function formatMoney(value: number, monedaCodigo: string) {
  return `${roundUpToNextFive(value)} ${monedaCodigo}`;
}

function getOptionalPrice(row: BuilderRow, columnId: number) {
  const price = row.precios.find((currentPrice) => currentPrice.columnId === columnId);
  return price?.precioNeto ?? null;
}

function getServiceLabel(row: BuilderRow) {
  const ciudad = row.ciudadNombre?.trim() || "Sin ciudad";
  const servicio = row.servicioIncluido?.trim() || row.tipoServicio || "Servicio opcional";

  return `${ciudad}: ${servicio}`;
}

function getUnitTitle(unidad: BuilderPriceUnit) {
  if (unidad === "POR_PERSONA") return "Precio por persona";
  if (unidad === "POR_NINO") return "Precio por niño";
  if (unidad === "POR_HABITACION") return "Precio por habitación";
  if (unidad === "POR_GRUPO") return "Precio por grupo";

  return "Precio por unidad";
}

function getTableTitle(optionalColumns: BuilderColumn[]) {
  if (optionalColumns.length === 0) {
    return "Opcionales";
  }

  const uniqueUnits = Array.from(new Set(optionalColumns.map((column) => column.unidad)));

  if (uniqueUnits.length === 1) {
    return `Opcionales - ${getUnitTitle(uniqueUnits[0]).toLowerCase()}`;
  }

  return "Opcionales - Precios por unidad";
}

export function OptionalServicesTable({
  columns,
  rows,
  monedaCodigo
}: OptionalServicesTableProps) {
  const optionalColumns = useMemo(
    () => columns.filter((column) => column.tipo === "OPCIONALES"),
    [columns]
  );

  const optionalRows = useMemo(
    () => rows.filter((row) => row.esOpcional),
    [rows]
  );

  if (optionalRows.length === 0 || optionalColumns.length === 0) {
    return null;
  }

  return (
    <section className="builder-optionals-section">
      <div className="builder-optionals-heading">
        <h3>{getTableTitle(optionalColumns)}</h3>
        <p>Servicios opcionales no incluidos en el total principal de la cotización.</p>
      </div>

      <div className="builder-optionals-table-wrapper">
        <table className="builder-optionals-table">
          <thead>
            <tr>
              <th>Servicio opcional</th>

              {optionalColumns.map((column) => (
                <th key={column.id}>{getColumnLabel(column)}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {optionalRows.map((row) => (
              <tr key={row.id}>
                <td>{getServiceLabel(row)}</td>

                {optionalColumns.map((column) => {
                  const price = getOptionalPrice(row, column.id);

                  return (
                    <td key={column.id}>
                      {price === null ? (
                        <span className="builder-optional-empty">-</span>
                      ) : (
                        <strong>{formatMoney(price, monedaCodigo)}</strong>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}