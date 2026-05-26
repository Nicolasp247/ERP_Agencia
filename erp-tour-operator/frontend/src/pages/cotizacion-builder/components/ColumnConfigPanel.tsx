/* erp-tour-operator/frontend/src/pages/cotizacion-builder/components/ColumnConfigPanel.tsx */

import { useState, type FormEvent } from "react";

import type {
  BuilderColumn,
  BuilderColumnType
} from "../types/cotizacion-builder.types";
import type { BuilderColumnFormValues } from "@/modules/cotizacion-builder/cotizacion-builder-api";
import {
  defaultFormValues,
  getAccommodationOptions,
  getCategoryOptions,
  getFirstOptionValue,
  getMultiplierFromAccommodation,
  isCustomValue,
  type InternalColumnForm
} from "../helpers/column-options";
import { ColumnCreateModal } from "./ColumnCreateModal";
import { ColumnDeleteModal } from "./ColumnDeleteModal";

type PanelMode = "CREATE" | "DELETE" | null;

type ColumnConfigPanelProps = {
  columns: BuilderColumn[];
  isSaving?: boolean;
  onCreateColumn: (values: BuilderColumnFormValues) => void;
  onDeleteColumn: (columnId: number) => void;
};

export function ColumnConfigPanel({
  columns,
  isSaving = false,
  onCreateColumn,
  onDeleteColumn
}: ColumnConfigPanelProps) {
  const [mode, setMode] = useState<PanelMode>(null);
  const [commission, setCommission] = useState("0.7");
  const [formValues, setFormValues] = useState<InternalColumnForm>(defaultFormValues);

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
    setMode("DELETE");
  }

  function handleTipoChange(tipo: BuilderColumnType) {
    if (tipo === "OTRO") {
      setFormValues((current) => ({
        ...current,
        tipo,
        grupo: "__OTRO__",
        nombre: "__OTRO__",
        unidad: "POR_GRUPO",
        multiplicador: 1,
        customGrupo: "",
        customNombre: ""
      }));

      return;
    }

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
    if (formValues.tipo === "OTRO") {
      return {
        tipo: formValues.tipo,
        grupo: formValues.customGrupo.trim(),
        nombre: formValues.customNombre.trim(),
        unidad: formValues.unidad,
        multiplicador: 1,
        orden: formValues.orden ? Number(formValues.orden) : undefined
      };
    }

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

  function deleteColumn(columnId: number) {
    onDeleteColumn(columnId);
    setMode(null);
  }

  return (
    <>
      <div className="builder-options-card">
        <h3>Opciones generales:</h3>

        <div className="builder-option-row">
          <label className="builder-commission-field">
            <strong>Comisión:</strong>
            <input
              inputMode="decimal"
              onChange={(event) => setCommission(event.target.value)}
              value={commission}
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
      </div>

      {mode === "CREATE" ? (
        <ColumnCreateModal
          formValues={formValues}
          isSaving={isSaving}
          onAccommodationChange={handleAccommodationChange}
          onCancel={resetForm}
          onSubmit={submitForm}
          onTipoChange={handleTipoChange}
          setFormValues={setFormValues}
        />
      ) : null}

      {mode === "DELETE" ? (
        <ColumnDeleteModal
          columns={columns}
          isSaving={isSaving}
          onCancel={resetForm}
          onDeleteColumn={deleteColumn}
        />
      ) : null}
    </>
  );
}