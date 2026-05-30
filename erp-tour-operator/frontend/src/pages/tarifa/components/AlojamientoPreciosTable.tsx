/* erp-tour-operator/frontend/src/pages/tarifa/components/AlojamientoPreciosTable.tsx */

import type { AlojamientoPrecio } from "@/modules/alojamiento-precio/alojamiento-precio-api";
import { formatMoney } from "@/pages/tarifa/utils/tarifa.helpers";
import { formatDateRangeShortEs } from "@/utils/date-format";

type AlojamientoPreciosTableProps = {
  precios: AlojamientoPrecio[];
  isDeleting: boolean;
  onEdit: (precio: AlojamientoPrecio) => void;
  onDelete: (precio: AlojamientoPrecio) => void;
};

export function AlojamientoPreciosTable({
  precios,
  isDeleting,
  onEdit,
  onDelete
}: AlojamientoPreciosTableProps) {
  if (!precios.length) {
    return <p>No hay precios de alojamiento registrados para este servicio.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Vigencia</th>
          <th>Categoría hotelera</th>
          <th>Habitación</th>
          <th>Régimen</th>
          <th>Tipo habitación</th>
          <th>Precio</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        {precios.map((precio) => (
          <tr key={precio.id}>
            <td>{formatDateRangeShortEs(precio.fechaDesde, precio.fechaHasta)}</td>
            <td>{precio.categoriaLabel}</td>
            <td>{precio.categoriaHabLabel}</td>
            <td>{precio.regimenLabel}</td>
            <td>{precio.tipoHabitacionLabel}</td>
            <td>{formatMoney(precio.precioUsd, precio.monedaCodigo)}</td>
            <td>
              <span
                className={
                  precio.activo
                    ? "status-chip status-chip-active"
                    : "status-chip status-chip-inactive"
                }
              >
                {precio.activo ? "Activa" : "Inactiva"}
              </span>
            </td>
            <td>
              <div className="toolbar">
                <button className="link-button" type="button" onClick={() => onEdit(precio)}>
                  Editar
                </button>

                <button
                  className="danger-button"
                  type="button"
                  disabled={isDeleting}
                  onClick={() => onDelete(precio)}
                >
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}