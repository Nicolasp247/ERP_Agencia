/* erp-tour-operator/frontend/src/pages/expediente/confirmacion-builder/components/ConfirmacionPassengersTable.tsx */

import type { ConfirmacionPassenger } from "@/modules/expediente/confirmacion-builder/confirmacion-builder-api";

type ConfirmacionPassengersTableProps = {
  passengers: ConfirmacionPassenger[];
  onAdd: () => void;
  onEdit: (passenger: ConfirmacionPassenger) => void;
  onDelete: (passenger: ConfirmacionPassenger) => void;
  isDeleting?: boolean;
};

const MONTHS_ES_SHORT = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic"
];

function formatDate(value?: string | null) {
  if (!value) {
    return "N/D";
  }

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return value;
  }

  const monthNumber = Number(month);
  const monthLabel = MONTHS_ES_SHORT[monthNumber - 1] ?? month;

  return `${day} de ${monthLabel}(${month}) de ${year}`;
}

export function ConfirmacionPassengersTable({
  passengers,
  onAdd,
  onEdit,
  onDelete,
  isDeleting = false
}: ConfirmacionPassengersTableProps) {
  return (
    <div className="confirmacion-passengers-section">
      <div className="confirmacion-passengers-heading">
        <div>
          <h3>Datos de pasajeros</h3>
          <p>
            Registra la información exacta de cada pasajero. La edad se calcula con la fecha inicial y final del viaje.
          </p>
        </div>

        <button className="primary-button" onClick={onAdd} type="button">
          Agregar datos pasajero
        </button>
      </div>

      <div className="confirmacion-passengers-table-wrapper">
        <table className="confirmacion-passengers-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellidos</th>
              <th>Fecha de nacimiento</th>
              <th>Edad en el viaje</th>
              <th>Nº Pasaporte</th>
              <th>Fecha de expedición</th>
              <th>Fecha de vencimiento</th>
              <th>Nacionalidad</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {passengers.map((passenger) => (
              <tr key={passenger.id}>
                <td>{passenger.nombre}</td>
                <td>{passenger.apellidos}</td>
                <td>{formatDate(passenger.fechaNacimiento)}</td>
                <td>
                  <strong>{passenger.edadEnViaje}</strong>
                </td>
                <td>{passenger.numeroPasaporte}</td>
                <td>{formatDate(passenger.fechaExpedicionPasaporte)}</td>
                <td>{formatDate(passenger.fechaVencimientoPasaporte)}</td>
                <td>{passenger.nacionalidad}</td>
                <td>
                  <div className="version-actions">
                    <button
                      className="version-action-button version-action-button--duplicate"
                      onClick={() => onEdit(passenger)}
                      type="button"
                    >
                      Editar
                    </button>

                    <button
                      className="version-action-button version-action-button--danger"
                      disabled={isDeleting}
                      onClick={() => onDelete(passenger)}
                      type="button"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!passengers.length ? (
          <div className="services-empty-state">
            Todavía no hay pasajeros registrados para esta confirmación.
          </div>
        ) : null}
      </div>
    </div>
  );
}