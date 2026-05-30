/* erp-tour-operator/frontend/src/pages/tarifa/components/TarifasRegistradasTable.tsx */

import { formatDateRangeShortEs, formatDateShortEs } from "@/utils/date-format";
import { formatLabel } from "@/pages/tarifa/utils/tarifa.helpers";

type TarifasRegistradasTableProps = {
  tarifas: Array<any>;
};

export function TarifasRegistradasTable({ tarifas }: TarifasRegistradasTableProps) {
  if (!tarifas.length) {
    return <p>No hay tarifas registradas para este servicio.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Servicio</th>
          <th>Vigencia</th>
          <th>Tipo</th>
          <th>Unidad</th>
          <th>Precio neto</th>
          <th>Revisión</th>
          <th>Estado</th>
        </tr>
      </thead>

      <tbody>
        {tarifas.map((tarifa) => (
          <tr key={tarifa.id}>
            <td>
              <strong>{tarifa.servicio}</strong>
              <p className="table-subtext">
                {tarifa.tipoServicio} · {tarifa.proveedor} · {tarifa.ciudad}
              </p>
            </td>

            <td>{formatDateRangeShortEs(tarifa.fechaDesde, tarifa.fechaHasta)}</td>
            <td>{formatLabel(tarifa.tipoTarifa)}</td>
            <td>{formatLabel(tarifa.unidadPrecio)}</td>
            <td>
              {tarifa.precioNeto} {tarifa.monedaCodigo}
            </td>
            <td>{formatDateShortEs(tarifa.fechaRevision)}</td>
            <td>
              <span
                className={
                  tarifa.activo
                    ? "status-chip status-chip-active"
                    : "status-chip status-chip-inactive"
                }
              >
                {tarifa.activo ? "Activa" : "Inactiva"}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}