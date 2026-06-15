/* erp-tour-operator/frontend/src/pages/expediente/cotizacion-builder/components/ColumnConfigPanel.tsx */

import { useState, type FormEvent } from "react";

import type {
  BuilderColumn,
  BuilderColumnType
} from "../types/cotizacion-builder.types";
import type { BuilderColumnFormValues } from "@/modules/expediente/cotizacion-builder/cotizacion-builder-api";
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
import type {
  BuilderCommission,
  BuilderCommissionType
} from "../types/cotizacion-builder.types";

import type { BuilderCommissionFormValues } from "@/modules/expediente/cotizacion-builder/cotizacion-builder-api";

type CommissionKey = "porcentajeAgente" | "porcentajeWtravel" | "porcentajeBancario";

type CommissionRule = {
  tipoComision: BuilderCommissionType;
  label: string;
  porcentajeAgente: number;
  porcentajeWtravel: number;
  porcentajeBancario: number;
  porcentajeTotal: number;
  factorVenta: number;
};

const DEFAULT_COMMISSIONS: CommissionRule[] = [
  {
    tipoComision: "TERRESTRE",
    label: "Terrestre",
    porcentajeAgente: 12,
    porcentajeWtravel: 13,
    porcentajeBancario: 5,
    porcentajeTotal: 30,
    factorVenta: 0.7
  },
  {
    tipoComision: "AEREA",
    label: "Aéreo / transporte",
    porcentajeAgente: 5,
    porcentajeWtravel: 5,
    porcentajeBancario: 5,
    porcentajeTotal: 15,
    factorVenta: 0.85
  }
];

function getCommissionLabel(tipoComision: BuilderCommissionType) {
  if (tipoComision === "AEREA") return "Aéreo / transporte";
  if (tipoComision === "TERRESTRE") return "Terrestre";
  if (tipoComision === "OPCIONALES") return "Opcionales";
  return "Otro";
}

function normalizeCommission(
  commission: BuilderCommission | undefined,
  fallback: CommissionRule
): CommissionRule {
  if (!commission) {
    return fallback;
  }

  return {
    tipoComision: commission.tipoComision,
    label: getCommissionLabel(commission.tipoComision),
    porcentajeAgente: commission.porcentajeAgente,
    porcentajeWtravel: commission.porcentajeWtravel,
    porcentajeBancario: commission.porcentajeBancario,
    porcentajeTotal: commission.porcentajeTotal,
    factorVenta: commission.factorVenta
  };
}

function getCommissionByType(
  comisiones: BuilderCommission[],
  tipoComision: BuilderCommissionType
) {
  const fallback =
    DEFAULT_COMMISSIONS.find((item) => item.tipoComision === tipoComision) ??
    DEFAULT_COMMISSIONS[0];

  return normalizeCommission(
    comisiones.find((item) => item.tipoComision === tipoComision),
    fallback
  );
}

function getCommissionTotal(rule: CommissionRule) {
  return rule.porcentajeAgente + rule.porcentajeWtravel + rule.porcentajeBancario;
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
  return (
    <article className="builder-commission-card">
      <div className="builder-commission-card-header">
        <span>{rule.label}</span>
        <strong>{rule.porcentajeTotal}%</strong>
      </div>

      <div className="builder-commission-breakdown">
        <div>
          <span>Agente</span>
          <EditablePercent
            value={rule.porcentajeAgente}
            onChange={(value) => onChange("porcentajeAgente", value)}
          />
        </div>

        <div>
          <span>WTravel</span>
          <EditablePercent
            value={rule.porcentajeWtravel}
            onChange={(value) => onChange("porcentajeWtravel", value)}
          />
        </div>

        <div>
          <span>Banco</span>
          <EditablePercent
            value={rule.porcentajeBancario}
            onChange={(value) => onChange("porcentajeBancario", value)}
          />
        </div>
      </div>

      <div className="builder-commission-factor">
        <span>Factor usado</span>
        <strong>{Number(rule.factorVenta).toFixed(2)}</strong>
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
  comisiones: BuilderCommission[];
  onUpdateCommission: (values: BuilderCommissionFormValues) => void;
};

export function ColumnConfigPanel({
  columns,
  isSaving = false,
  onCreateColumn,
  onDeleteColumn,
  comisiones,
  onUpdateCommission 
}: ColumnConfigPanelProps) {
  const [mode, setMode] = useState<PanelMode>(null);
  const [formValues, setFormValues] = useState<InternalColumnForm>(defaultFormValues);
  const terrestreCommission = getCommissionByType(comisiones, "TERRESTRE");
  const aereaCommission = getCommissionByType(comisiones, "AEREA");


  function resetForm() {
    setFormValues(defaultFormValues);
    setMode(null);
  }

  function updateCommissionRule(
    rule: CommissionRule,
    key: CommissionKey,
    value: number
  ) {
    const safeValue = Math.max(0, Math.min(99, value));

    onUpdateCommission({
      tipoComision: rule.tipoComision,
      porcentajeAgente:
        key === "porcentajeAgente" ? safeValue : rule.porcentajeAgente,
      porcentajeWtravel:
        key === "porcentajeWtravel" ? safeValue : rule.porcentajeWtravel,
      porcentajeBancario:
        key === "porcentajeBancario" ? safeValue : rule.porcentajeBancario
    });
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
            onChange={(key, value) => updateCommissionRule(terrestreCommission, key, value)}
          />

          <CommissionRuleCard
            rule={aereaCommission}
            onChange={(key, value) => updateCommissionRule(aereaCommission, key, value)}
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