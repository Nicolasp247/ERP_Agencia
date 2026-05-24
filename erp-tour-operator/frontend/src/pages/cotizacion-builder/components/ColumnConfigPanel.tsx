/* erp-tour-operator/frontend/src/pages/cotizacion-builder/components/ColumnConfigPanel.tsx */

import { useState, type FormEvent } from "react";

import type {
  BuilderColumn,
  BuilderColumnType,
  BuilderPriceUnit
} from "../types/cotizacion-builder.types";
import { getColumnLabel } from "../helpers/builder-calculations";
import type { BuilderColumnFormValues } from "@/modules/cotizacion-builder/cotizacion-builder-api";

type SelectOption = {
  value: string;
  label: string;
  multiplicador?: number;
};

type PanelMode = "CREATE" | "DELETE" | null;

const SERVICE_TYPE_OPTIONS: Array<{ value: BuilderColumnType; label: string }> = [
  { value: "TERRESTRE", label: "Terrestre" },
  { value: "TRANSPORTE", label: "Transporte" },
  { value: "OPCIONALES", label: "Opcionales" },
  { value: "OTRO", label: "Otro" }
];

const TERRESTRE_CATEGORY_OPTIONS: SelectOption[] = [
  { value: "Turista (3*)", label: "Turista (3*)" },
  { value: "Turista Superior (3+*)", label: "Turista Superior (3+*)" },
  { value: "Primera (4*)", label: "Primera (4*)" },
  { value: "Primera Superior (4+*)", label: "Primera Superior (4+*)" },
  { value: "Lujo (5*)", label: "Lujo (5*)" },
  { value: "Lujo Superior (5+*)", label: "Lujo Superior (5+*)" },
  { value: "Super Lujo (6*)", label: "Super Lujo (6*)" },
  { value: "__OTRO__", label: "Otro" }
];

const TRANSPORTE_CATEGORY_OPTIONS: SelectOption[] = [
  { value: "Económica", label: "Económica" },
  { value: "Ejecutiva", label: "Ejecutiva" },
  { value: "__OTRO__", label: "Otro" }
];

const OPCIONALES_CATEGORY_OPTIONS: SelectOption[] = [
  { value: "General", label: "General" },
  { value: "__OTRO__", label: "Otro" }
];

const TERRESTRE_ACCOMMODATION_OPTIONS: SelectOption[] = [
  { value: "Doble", label: "Doble", multiplicador: 2 },
  { value: "Triple", label: "Triple", multiplicador: 3 },
  { value: "Cuádruple", label: "Cuádruple", multiplicador: 4 },
  { value: "Sencilla", label: "Sencilla", multiplicador: 1 },
  { value: "Villa 6 personas", label: "Villa 6 personas", multiplicador: 6 },
  { value: "Villa 8 personas", label: "Villa 8 personas", multiplicador: 8 },
  { value: "Villa 10 personas", label: "Villa 10 personas", multiplicador: 10 },
  { value: "Villa 12 personas", label: "Villa 12 personas", multiplicador: 12 },
  { value: "Villa 16 personas", label: "Villa 16 personas", multiplicador: 16 },
  { value: "Villa 20 personas", label: "Villa 20 personas", multiplicador: 20 },
  { value: "__OTRO__", label: "Otro" }
];

const TRANSPORTE_ACCOMMODATION_OPTIONS: SelectOption[] = [
  { value: "Adulto", label: "Adulto", multiplicador: 1 },
  { value: "Niño (menor 10 años)", label: "Niño (menor 10 años)", multiplicador: 1 },
  { value: "Grupo", label: "Grupo", multiplicador: 1 },
  { value: "__OTRO__", label: "Otro" }
];

const OPCIONALES_ACCOMMODATION_OPTIONS: SelectOption[] = [
  { value: "Adulto", label: "Adulto", multiplicador: 1 },
  { value: "Niño (menor 10 años)", label: "Niño (menor 10 años)", multiplicador: 1 },
  { value: "__OTRO__", label: "Otro" }
];

const UNIT_OPTIONS: Array<{ value: BuilderPriceUnit; label: string }> = [
  { value: "POR_PERSONA", label: "Por persona" },
  { value: "POR_NINO", label: "Por niño (menor 10 años)" },
  { value: "POR_HABITACION", label: "Por habitación" },
  { value: "POR_GRUPO", label: "Por grupo" }
];

type InternalColumnForm = {
  tipo: BuilderColumnType;
  grupo: string;
  nombre: string;
  unidad: BuilderPriceUnit;
  multiplicador: number;
  orden?: number;
  customGrupo: string;
  customNombre: string;
};

const defaultFormValues: InternalColumnForm = {
  tipo: "TERRESTRE",
  grupo: "Turista (3*)",
  nombre: "Doble",
  unidad: "POR_PERSONA",
  multiplicador: 2,
  orden: undefined,
  customGrupo: "",
  customNombre: ""
};

type ColumnConfigPanelProps = {
  columns: BuilderColumn[];
  isSaving?: boolean;
  onCreateColumn: (values: BuilderColumnFormValues) => void;
  onDeleteColumn: (columnId: number) => void;
};

function getCategoryOptions(tipo: BuilderColumnType) {
  if (tipo === "TRANSPORTE") return TRANSPORTE_CATEGORY_OPTIONS;
  if (tipo === "OPCIONALES") return OPCIONALES_CATEGORY_OPTIONS;
  if (tipo === "OTRO") return [{ value: "__OTRO__", label: "Otro" }];
  return TERRESTRE_CATEGORY_OPTIONS;
}

function getAccommodationOptions(tipo: BuilderColumnType) {
  if (tipo === "TRANSPORTE") return TRANSPORTE_ACCOMMODATION_OPTIONS;
  if (tipo === "OPCIONALES") return OPCIONALES_ACCOMMODATION_OPTIONS;
  if (tipo === "OTRO") return [{ value: "__OTRO__", label: "Otro" }];
  return TERRESTRE_ACCOMMODATION_OPTIONS;
}

function getFirstOptionValue(options: SelectOption[]) {
  return options[0]?.value ?? "__OTRO__";
}

function getMultiplierFromAccommodation(tipo: BuilderColumnType, nombre: string) {
  const option = getAccommodationOptions(tipo).find((item) => item.value === nombre);
  return option?.multiplicador ?? 1;
}

function isCustomValue(value: string) {
  return value === "__OTRO__";
}

export function ColumnConfigPanel({
  columns,
  isSaving = false,
  onCreateColumn,
  onDeleteColumn
}: ColumnConfigPanelProps) {
  const [mode, setMode] = useState<PanelMode>(null);
  const [commission, setCommission] = useState("0.7");
  const [formValues, setFormValues] = useState<InternalColumnForm>(defaultFormValues);

  const categoryOptions = getCategoryOptions(formValues.tipo);
  const accommodationOptions = getAccommodationOptions(formValues.tipo);

  function resetForm() {
    setFormValues(defaultFormValues);
    setMode(null);
  }

  function openCreate() {
    setFormValues({
      ...defaultFormValues,
      orden: columns.length + 1
    });
    setMode("CREATE");
  }

  function openDelete() {
    setMode((current) => (current === "DELETE" ? null : "DELETE"));
  }

  function handleTipoChange(tipo: BuilderColumnType) {
    const nextCategoryOptions = getCategoryOptions(tipo);
    const nextAccommodationOptions = getAccommodationOptions(tipo);
    const nextNombre = getFirstOptionValue(nextAccommodationOptions);

    setFormValues((current) => ({
      ...current,
      tipo,
      grupo: getFirstOptionValue(nextCategoryOptions),
      nombre: nextNombre,
      unidad: tipo === "TRANSPORTE" || tipo === "OPCIONALES" ? "POR_PERSONA" : current.unidad,
      multiplicador: getMultiplierFromAccommodation(tipo, nextNombre),
      customGrupo: "",
      customNombre: ""
    }));
  }

  function handleAccommodationChange(nombre: string) {
    setFormValues((current) => ({
      ...current,
      nombre,
      multiplicador: getMultiplierFromAccommodation(current.tipo, nombre),
      customNombre: ""
    }));
  }

  function buildPayload(): BuilderColumnFormValues {
    const grupo = isCustomValue(formValues.grupo)
      ? formValues.customGrupo.trim()
      : formValues.grupo;

    const nombre = isCustomValue(formValues.nombre)
      ? formValues.customNombre.trim()
      : formValues.nombre;

    return {
      tipo: formValues.tipo,
      grupo,
      nombre,
      unidad: formValues.unidad,
      multiplicador: formValues.multiplicador,
      orden: formValues.orden ? Number(formValues.orden) : undefined
    };
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = buildPayload();

    if (!payload.grupo || !payload.nombre) {
      return;
    }

    onCreateColumn(payload);
    resetForm();
  }

  return (
    <div className="builder-options-card">
      <h3>Opciones generales:</h3>

      <div className="builder-option-row">
        <label className="builder-commission-field">
          <strong>Comisión:</strong>
          <input
            value={commission}
            onChange={(event) => setCommission(event.target.value)}
            inputMode="decimal"
          />
        </label>
      </div>

      <div className="builder-option-row">
        <strong>Tabla:</strong>

        <div className="builder-option-actions">
          <button className="link-button" onClick={openCreate} type="button">
            Agregar
          </button>

          <button className="link-button" onClick={openDelete} type="button">
            Eliminar
          </button>
        </div>
      </div>

      {mode === "CREATE" ? (
        <form className="builder-column-form builder-column-form-compact" onSubmit={submitForm}>
          <div className="builder-column-form-title">
            <p className="eyebrow">Nueva columna</p>
            <strong>Añadir opción de precio</strong>
          </div>

          <div className="builder-column-form-grid">
            <label>
              Tipo de servicio
              <select
                value={formValues.tipo}
                onChange={(event) => handleTipoChange(event.target.value as BuilderColumnType)}
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
                onChange={(event) => handleAccommodationChange(event.target.value)}
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

          <div className="toolbar">
            <button className="primary-button" disabled={isSaving} type="submit">
              Crear columna
            </button>

            <button className="link-button" onClick={resetForm} type="button">
              Cancelar
            </button>
          </div>
        </form>
      ) : null}

      {mode === "DELETE" ? (
        <div className="builder-delete-column-panel">
          <p className="eyebrow">Eliminar columna</p>

          <div className="builder-delete-column-list">
            {columns.map((column) => (
              <button
                className="danger-button"
                disabled={isSaving}
                key={column.id}
                onClick={() => onDeleteColumn(column.id)}
                type="button"
              >
                {getColumnLabel(column)}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}