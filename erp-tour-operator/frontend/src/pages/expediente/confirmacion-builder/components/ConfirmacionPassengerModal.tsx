/* erp-tour-operator/frontend/src/pages/expediente/confirmacion-builder/components/ConfirmacionPassengerModal.tsx */

import { FormEvent, useEffect, useState } from "react";

import type {
  ConfirmacionPassenger,
  ConfirmacionPassengerValues
} from "@/modules/expediente/confirmacion-builder/confirmacion-builder-api";

type ConfirmacionPassengerModalProps = {
  passenger?: ConfirmacionPassenger | null;
  isSaving?: boolean;
  onCancel: () => void;
  onSave: (values: ConfirmacionPassengerValues) => void;
};

const emptyForm: ConfirmacionPassengerValues = {
  nombre: "",
  apellidos: "",
  fechaNacimiento: "",
  numeroPasaporte: "",
  fechaExpedicionPasaporte: "",
  fechaVencimientoPasaporte: "",
  nacionalidad: ""
};

function isoToDisplayDate(value?: string | null) {
  if (!value) return "";

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

function displayDateToIso(value: string) {
  const [day, month, year] = value.split("/");

  if (!day || !month || !year) {
    return value;
  }

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function normalizeDateInput(value: string) {
  const onlyNumbers = value.replace(/\D/g, "").slice(0, 8);

  if (onlyNumbers.length <= 2) {
    return onlyNumbers;
  }

  if (onlyNumbers.length <= 4) {
    return `${onlyNumbers.slice(0, 2)}/${onlyNumbers.slice(2)}`;
  }

  return `${onlyNumbers.slice(0, 2)}/${onlyNumbers.slice(2, 4)}/${onlyNumbers.slice(4)}`;
}

export function ConfirmacionPassengerModal({
  passenger,
  isSaving = false,
  onCancel,
  onSave
}: ConfirmacionPassengerModalProps) {
  const [formValues, setFormValues] = useState<ConfirmacionPassengerValues>(emptyForm);

  useEffect(() => {
    if (!passenger) {
      setFormValues(emptyForm);
      return;
    }

    setFormValues({
      nombre: passenger.nombre ?? "",
      apellidos: passenger.apellidos ?? "",
      fechaNacimiento: isoToDisplayDate(passenger.fechaNacimiento),
      numeroPasaporte: passenger.numeroPasaporte ?? "",
      fechaExpedicionPasaporte: isoToDisplayDate(passenger.fechaExpedicionPasaporte),
      fechaVencimientoPasaporte: isoToDisplayDate(passenger.fechaVencimientoPasaporte),
      nacionalidad: passenger.nacionalidad ?? ""
    });
  }, [passenger]);

  function updateValue(key: keyof ConfirmacionPassengerValues, value: string) {
    setFormValues((current) => ({
      ...current,
      [key]: value
    }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSave({
      ...formValues,
      fechaNacimiento: displayDateToIso(formValues.fechaNacimiento),
      fechaExpedicionPasaporte: displayDateToIso(formValues.fechaExpedicionPasaporte),
      fechaVencimientoPasaporte: displayDateToIso(formValues.fechaVencimientoPasaporte)
    });
  }

  return (
    <div className="builder-modal-backdrop">
      <div className="builder-modal confirmacion-passenger-modal">
        <form className="confirmacion-passenger-card" onSubmit={submit}>
          <div className="confirmacion-start-heading">
            <p className="eyebrow">
              {passenger ? "Editar pasajero" : "Agregar pasajero"}
            </p>
            <h2>Datos exactos del pasajero</h2>
            <p>
              Esta información se usa para la operación de la confirmación y la futura carpeta de viaje.
            </p>
          </div>

          <div className="confirmacion-passenger-grid">
            <label>
              <span>Nombre</span>
              <input
                required
                value={formValues.nombre}
                onChange={(event) => updateValue("nombre", event.target.value)}
              />
            </label>

            <label>
              <span>Apellidos</span>
              <input
                required
                value={formValues.apellidos}
                onChange={(event) => updateValue("apellidos", event.target.value)}
              />
            </label>

            <label>
              <span>Fecha de nacimiento</span>
              <input
                required
                inputMode="numeric"
                placeholder="dd/mm/yyyy"
                pattern="\d{2}/\d{2}/\d{4}"
                value={formValues.fechaNacimiento}
                onChange={(event) =>
                  updateValue("fechaNacimiento", normalizeDateInput(event.target.value))
                }
              />
            </label>

            <label>
              <span>Nº Pasaporte</span>
              <input
                required
                value={formValues.numeroPasaporte}
                onChange={(event) => updateValue("numeroPasaporte", event.target.value)}
              />
            </label>

            <label>
              <span>Fecha de expedición</span>
              <input
                required
                inputMode="numeric"
                placeholder="dd/mm/yyyy"
                pattern="\d{2}/\d{2}/\d{4}"
                value={formValues.fechaExpedicionPasaporte}
                onChange={(event) =>
                  updateValue("fechaExpedicionPasaporte", normalizeDateInput(event.target.value))
                }
              />
            </label>

            <label>
              <span>Fecha de vencimiento</span>
              <input
                required
                inputMode="numeric"
                placeholder="dd/mm/yyyy"
                pattern="\d{2}/\d{2}/\d{4}"
                value={formValues.fechaVencimientoPasaporte}
                onChange={(event) =>
                  updateValue("fechaVencimientoPasaporte", normalizeDateInput(event.target.value))
                }
              />
            </label>

            <label>
              <span>Nacionalidad</span>
              <input
                required
                value={formValues.nacionalidad}
                onChange={(event) => updateValue("nacionalidad", event.target.value)}
              />
            </label>
          </div>

          <div className="confirmacion-start-actions">
            <button className="link-button" disabled={isSaving} onClick={onCancel} type="button">
              Cancelar
            </button>

            <button className="primary-button" disabled={isSaving} type="submit">
              {isSaving ? "Guardando..." : passenger ? "Guardar cambios" : "Agregar pasajero"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}