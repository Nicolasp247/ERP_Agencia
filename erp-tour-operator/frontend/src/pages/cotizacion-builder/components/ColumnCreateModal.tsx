/* erp-tour-operator/frontend/src/pages/cotizacion-builder/components/ColumnCreateModal.tsx */

import type { FormEvent } from "react";

import type {
  BuilderColumnType,
  BuilderPriceUnit
} from "../types/cotizacion-builder.types";
import {
  getAccommodationOptions,
  getCategoryOptions,
  isCustomValue,
  SERVICE_TYPE_OPTIONS,
  UNIT_OPTIONS,
  type InternalColumnForm
} from "../helpers/column-options";
import { OtherColumnHelp } from "./OtherColumnHelp";

type ColumnCreateModalProps = {
  formValues: InternalColumnForm;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onTipoChange: (tipo: BuilderColumnType) => void;
  onAccommodationChange: (nombre: string) => void;
  setFormValues: React.Dispatch<React.SetStateAction<InternalColumnForm>>;
};

export function ColumnCreateModal({
  formValues,
  isSaving,
  onCancel,
  onSubmit,
  onTipoChange,
  onAccommodationChange,
  setFormValues
}: ColumnCreateModalProps) {
  const isOtherColumn = formValues.tipo === "OTRO";
  const categoryOptions = getCategoryOptions(formValues.tipo);
  const accommodationOptions = getAccommodationOptions(formValues.tipo);

  return (
    <div className="builder-modal-backdrop">
      <form
        className="builder-modal builder-column-form builder-column-form-compact"
        onSubmit={onSubmit}
      >
        <div className="builder-add-service-header">
          <div className="builder-column-form-title">
            <p className="eyebrow">Nueva columna</p>
            <strong>Añadir opción de precio</strong>
          </div>

          <button className="link-button" onClick={onCancel} type="button">
            Cancelar
          </button>
        </div>

        {isOtherColumn ? (
          <>
            <div className="builder-column-form-grid builder-column-form-grid-other">
              <label>
                Tipo de servicio
                <select
                  value={formValues.tipo}
                  onChange={(event) => onTipoChange(event.target.value as BuilderColumnType)}
                >
                  {SERVICE_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Nombre principal
                <input
                  value={formValues.customGrupo}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      customGrupo: event.target.value
                    }))
                  }
                  placeholder="Ej: Fee Resort"
                  required
                />
              </label>

              <label>
                Detalle
                <input
                  value={formValues.customNombre}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      customNombre: event.target.value
                    }))
                  }
                  placeholder="Ej: Habitación"
                  required
                />
              </label>

              <label>
                Unidad
                <select
                  value={formValues.unidad}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      unidad: event.target.value as BuilderPriceUnit
                    }))
                  }
                >
                  {UNIT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Ubicación de columna
                <input
                  min={1}
                  type="number"
                  value={formValues.orden ?? ""}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      orden: event.target.value ? Number(event.target.value) : undefined
                    }))
                  }
                />
              </label>
            </div>

            <OtherColumnHelp />
          </>
        ) : (
          <div className="builder-column-form-grid">
            <label>
              Tipo de servicio
              <select
                value={formValues.tipo}
                onChange={(event) => onTipoChange(event.target.value as BuilderColumnType)}
              >
                {SERVICE_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Categoría
              <select
                value={formValues.grupo}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    grupo: event.target.value,
                    customGrupo: ""
                  }))
                }
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {isCustomValue(formValues.grupo) ? (
              <label>
                Categoría personalizada
                <input
                  value={formValues.customGrupo}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      customGrupo: event.target.value
                    }))
                  }
                  placeholder="Ej: Premium"
                  required
                />
              </label>
            ) : null}

            <label>
              Acomodación
              <select
                value={formValues.nombre}
                onChange={(event) => onAccommodationChange(event.target.value)}
              >
                {accommodationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {isCustomValue(formValues.nombre) ? (
              <label>
                Acomodación personalizada
                <input
                  value={formValues.customNombre}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      customNombre: event.target.value
                    }))
                  }
                  placeholder="Ej: Villa 14 personas"
                  required
                />
              </label>
            ) : null}

            <label>
              Unidad
              <select
                value={formValues.unidad}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    unidad: event.target.value as BuilderPriceUnit
                  }))
                }
              >
                {UNIT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Acomodación numérica
              <input
                min={1}
                type="number"
                value={formValues.multiplicador}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    multiplicador: Number(event.target.value || 1)
                  }))
                }
              />
            </label>

            <label>
              Ubicación de columna
              <input
                min={1}
                type="number"
                value={formValues.orden ?? ""}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    orden: event.target.value ? Number(event.target.value) : undefined
                  }))
                }
              />
            </label>
          </div>
        )}

        <div className="toolbar">
          <button className="primary-button" disabled={isSaving} type="submit">
            Crear columna
          </button>
        </div>
      </form>
    </div>
  );
}