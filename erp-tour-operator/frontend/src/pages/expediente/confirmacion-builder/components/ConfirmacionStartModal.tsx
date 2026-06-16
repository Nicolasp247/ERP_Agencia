/* erp-tour-operator/frontend/src/pages/expediente/confirmacion-builder/components/ConfirmacionStartModal.tsx */

import { useMemo, useState } from "react";

import type {
  ConfirmacionBuilderColumnOption,
  ConfirmacionBuilderOptions
} from "@/modules/expediente/confirmacion-builder/confirmacion-builder-api";

type ConfirmacionStartModalProps = {
  options: ConfirmacionBuilderOptions;
  isSaving?: boolean;
  onCancel: () => void;
  onConfirm: (selectedColumnIds: number[]) => void;
};

function getColumnTypeLabel(type: ConfirmacionBuilderColumnOption["tipo"]) {
  if (type === "TERRESTRE") return "Terrestre / alojamiento";
  if (type === "TRANSPORTE") return "Aéreo / transporte";
  if (type === "OPCIONALES") return "Opcionales";
  return "Otros";
}

export function ConfirmacionStartModal({
  options,
  isSaving = false,
  onCancel,
  onConfirm
}: ConfirmacionStartModalProps) {
  const [selectedColumnIds, setSelectedColumnIds] = useState<number[]>([]);

  const groupedColumns = useMemo(() => {
    return options.columns.reduce<Record<string, ConfirmacionBuilderColumnOption[]>>(
      (groups, column) => {
        const key = column.tipo;

        if (!groups[key]) {
          groups[key] = [];
        }

        groups[key].push(column);
        return groups;
      },
      {}
    );
  }, [options.columns]);

  function toggleColumn(columnId: number) {
    setSelectedColumnIds((current) => {
      if (current.includes(columnId)) {
        return current.filter((id) => id !== columnId);
      }

      return [...current, columnId];
    });
  }

  function submit() {
    if (!selectedColumnIds.length) {
      return;
    }

    onConfirm(selectedColumnIds);
  }

  return (
    <div className="builder-modal-backdrop">
      <div className="builder-modal confirmacion-start-modal">
        <section className="confirmacion-start-card">
          <div className="confirmacion-start-heading">
            <p className="eyebrow">Crear confirmación</p>
            <h2>Seleccionar categoría y acomodación</h2>
            <p>
              Elige las columnas que aplican para esta confirmación. La cotización original
              no se modifica; se creará una copia congelada solo con las opciones seleccionadas.
            </p>
          </div>

          <div className="confirmacion-start-summary">
            <strong>{options.version.nombreCotizacion}</strong>
            <span>
              Expediente {options.expediente.codigo} · Cliente{" "}
              {options.expediente.cliente?.nombreCompleto ?? "N/D"}
            </span>
          </div>

          <div className="confirmacion-column-groups">
            {Object.entries(groupedColumns).map(([type, columns]) => (
              <div className="confirmacion-column-group" key={type}>
                <h3>{getColumnTypeLabel(type as ConfirmacionBuilderColumnOption["tipo"])}</h3>

                <div className="confirmacion-column-list">
                  {columns.map((column) => {
                    const checked = selectedColumnIds.includes(column.id);

                    return (
                      <label
                        className={
                          checked
                            ? "confirmacion-column-option confirmacion-column-option-active"
                            : "confirmacion-column-option"
                        }
                        key={column.id}
                      >
                        <input
                          checked={checked}
                          disabled={isSaving}
                          onChange={() => toggleColumn(column.id)}
                          type="checkbox"
                        />

                        <span>
                          <strong>{column.label}</strong>
                          <small>
                            {column.unidad.replaceAll("_", " ").toLowerCase()} · multiplicador{" "}
                            {column.multiplicador}
                          </small>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="confirmacion-start-actions">
            <button
              className="link-button"
              disabled={isSaving}
              onClick={onCancel}
              type="button"
            >
              Cancelar
            </button>

            <button
              className="primary-button"
              disabled={isSaving || !selectedColumnIds.length}
              onClick={submit}
              type="button"
            >
              {isSaving ? "Creando confirmación..." : "Crear confirmación"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}