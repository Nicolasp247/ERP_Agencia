/* erp-tour-operator/frontend/src/pages/expediente/cotizacion-builder/components/ColumnDeleteModal.tsx */

import type { BuilderColumn } from "../types/cotizacion-builder.types";
import { getColumnLabel } from "../helpers/builder-calculations";

type ColumnDeleteModalProps = {
  columns: BuilderColumn[];
  isSaving: boolean;
  onCancel: () => void;
  onDeleteColumn: (columnId: number) => void;
};

export function ColumnDeleteModal({
  columns,
  isSaving,
  onCancel,
  onDeleteColumn
}: ColumnDeleteModalProps) {
  return (
    <div className="builder-modal-backdrop">
      <div className="builder-modal builder-delete-column-panel">
        <div className="builder-add-service-header">
          <div>
            <p className="eyebrow">Eliminar columna</p>
            <strong>Selecciona la columna que quieres eliminar</strong>
          </div>

          <button className="link-button" onClick={onCancel} type="button">
            Cancelar
          </button>
        </div>

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
    </div>
  );
}