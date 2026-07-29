/* erp-tour-operator/frontend/src/pages/contabilidad/compras-proveedor/components/ComprasProveedorTable.tsx */

import { Link } from "react-router-dom";

import type {
  CompraProveedorListItem
} from "@/modules/contabilidad/compras-proveedor/compras-proveedor-api";

type ComprasProveedorTableProps = {
  items: CompraProveedorListItem[];
};

function formatDate(
  value: string | null
) {
  if (!value) {
    return "-";
  }

  const date = new Date(
    `${value}T00:00:00.000Z`
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "es-CO",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC"
    }
  ).format(date);
}

function formatMoney(
  value: number | null,
  currency: string
) {
  if (value === null) {
    return "-";
  }

  return `${Number(value).toFixed(2)} ${currency}`;
}

function statusClass(
  value: string
) {
  return `compras-status compras-status-${value
    .toLowerCase()
    .replaceAll("_", "-")}`;
}

export function ComprasProveedorTable({
  items
}: ComprasProveedorTableProps) {
  if (!items.length) {
    return (
      <div className="services-empty-state">
        No hay reservas que coincidan con los filtros.
      </div>
    );
  }

  return (
    <div className="compras-proveedor-table-wrapper">
      <table className="compras-proveedor-table">
        <thead>
          <tr>
            <th>Estado</th>
            <th>Cobro previsto</th>
            <th>Servicio</th>
            <th>Proveedor</th>
            <th>Código proveedor</th>
            <th>Expediente</th>
            <th>Cliente</th>
            <th>Valor contratado</th>
            <th>Pagado</th>
            <th>Saldo</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <div className="compras-status-stack">
                  <span className={statusClass(item.estadoOperativo)}>
                    {item.estadoOperativo.replaceAll("_", " ")}
                  </span>

                  <span className={statusClass(item.estadoFinanciero)}>
                    {item.estadoFinanciero.replaceAll("_", " ")}
                  </span>
                </div>
              </td>

              <td>
                <strong>
                  {formatDate(item.fechaPrevistaCobro)}
                </strong>

                <small>
                  Reserva: {formatDate(item.fechaReserva)}
                </small>
              </td>

              <td>
                <strong>{item.servicio}</strong>

                <small>
                  {formatDate(item.fechaServicio)}
                </small>
              </td>

              <td>
                <strong>
                  {item.proveedor?.codigo ||
                    item.proveedor?.nombreComercial ||
                    "N/D"}
                </strong>
              </td>

              <td>
                {item.codigoProveedor || "Sin código"}
              </td>

              <td>
                <Link
                  to={`/expedientes/${item.expediente.id}`}
                >
                  {item.expediente.codigo}
                </Link>

                <small>
                  {item.reserva.codigoReserva}
                </small>
              </td>

              <td>
                {item.reserva.cliente?.nombreCompleto ||
                  "N/D"}
              </td>

              <td>
                {formatMoney(
                  item.valorContratado,
                  item.monedaCodigo
                )}
              </td>

              <td>
                {formatMoney(
                  item.totalPagado,
                  item.monedaCodigo
                )}
              </td>

              <td>
                <strong>
                  {formatMoney(
                    item.saldoPendiente,
                    item.monedaCodigo
                  )}
                </strong>
              </td>

              <td>
                <Link
                  className="link-button"
                  to={`/contabilidad/compras-proveedor/${item.id}`}
                >
                  Ver detalle
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}