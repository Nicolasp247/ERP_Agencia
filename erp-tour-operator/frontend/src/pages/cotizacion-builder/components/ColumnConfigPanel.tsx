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

type CommissionKey = "agente" | "wtravel" | "banco";

type CommissionRule = {
  label: string;
  agente: number;
  wtravel: number;
  banco: number;
};

const TERRESTRE_COMMISSION: CommissionRule = {
  label: "Terrestre",
  agente: 12,
  wtravel: 13,
  banco: 5
};

const AEREA_COMMISSION: CommissionRule = {
  label: "Aéreo / transporte",
  agente: 5,
  wtravel: 5,
  banco: 5
};

function getCommissionTotal(rule: CommissionRule) {
  return rule.agente + rule.wtravel + rule.banco;
}

function getCommissionFactor(rule: CommissionRule) {
  return (100 - getCommissionTotal(rule)) / 100;
}

function EditablePercent({
  value,
  onChange
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(String(value));

  function save() {
    const parsed = Number(String(draftValue).replace(",", "."));
    onChange(Number.isFinite(parsed) ? parsed : value);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <input
        className="builder-commission-percent-input"
        autoFocus
        value={draftValue}
        onChange={(event) => setDraftValue(event.target.value)}
        onBlur={save}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            save();
          }

          if (event.key === "Escape") {
            event.preventDefault();
            setDraftValue(String(value));
            setIsEditing(false);
          }
        }}
      />
    );
  }

  return (
    <button
      className="builder-commission-percent-button"
      type="button"
      onClick={() => {
        setDraftValue(String(value));
        setIsEditing(true);
      }}
      title="Editar porcentaje"
    >
      {value}%
    </button>
  );
}

function CommissionRuleCard({
  rule,
  onChange
}: {
  rule: CommissionRule;
  onChange: (key: CommissionKey, value: number) => void;
}) {
  const total = getCommissionTotal(rule);
  const factor = getCommissionFactor(rule);

  return (
    <article className="builder-commission-card">
      <div className="builder-commission-card-header">
        <span>{rule.label}</span>
        <strong>{total}%</strong>
      </div>

      <div className="builder-commission-breakdown">
        <div>
          <span>Agente</span>
          <EditablePercent
            value={rule.agente}
            onChange={(value) => onChange("agente", value)}
          />
        </div>

        <div>
          <span>WTravel</span>
          <EditablePercent
            value={rule.wtravel}
            onChange={(value) => onChange("wtravel", value)}
          />
        </div>

        <div>
          <span>Banco</span>
          <EditablePercent
            value={rule.banco}
            onChange={(value) => onChange("banco", value)}
          />
        </div>
      </div>

      <div className="builder-commission-factor">
        <span>Factor usado</span>
        <strong>{factor.toFixed(2)}</strong>
      </div>
    </article>
  );
}

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
  const [formValues, setFormValues] = useState<InternalColumnForm>(defaultFormValues);
  const [terrestreCommission, setTerrestreCommission] = useState<CommissionRule>(TERRESTRE_COMMISSION);
  const [aereaCommission, setAereaCommission] = useState<CommissionRule>(AEREA_COMMISSION);

  function resetForm() {
    setFormValues(defaultFormValues);
    setMode(null);
  }

  function updateCommissionRule(
    type: "TERRESTRE" | "AEREA",
    key: CommissionKey,
    value: number
  ) {
    const safeValue = Math.max(0, Math.min(99, value));

    if (type === "TERRESTRE") {
      setTerrestreCommission((current) => ({
        ...current,
        [key]: safeValue
      }));

      return;
    }

    setAereaCommission((current) => ({
      ...current,
      [key]: safeValue
    }));
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
        <div className="builder-options-title">
          <h3>Opciones generales</h3>
        </div>

        <div className="builder-commission-grid">
          <CommissionRuleCard
            rule={terrestreCommission}
            onChange={(key, value) => updateCommissionRule("TERRESTRE", key, value)}
          />

          <CommissionRuleCard
            rule={aereaCommission}
            onChange={(key, value) => updateCommissionRule("AEREA", key, value)}
          />
        </div>

        <div className="builder-option-row builder-option-row-table">
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