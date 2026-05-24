/* erp-tour-operator/frontend/src/pages/cotizacion-builder/components/ColumnConfigPanel.tsx */

import type { BuilderColumn } from "../types/cotizacion-builder.types";
import { getColumnLabel } from "../helpers/builder-calculations";

type ColumnConfigPanelProps = {
  columns: BuilderColumn[];
};

export function ColumnConfigPanel({ columns }: ColumnConfigPanelProps) {
  return (
    <div className="builder-card">
      <div className="builder-card-header">
        <div>
          <p className="eyebrow">Columnas de precio</p>
          <h3>Configuración de la cotización</h3>
          <p className="muted">
            Estas columnas representan las opciones que se van a cotizar, como hotel doble,
            hotel triple, transporte u opcionales.
          </p>
        </div>

        <button className="link-button" type="button">
          Añadir columna
        </button>
      </div>

      <div className="builder-column-chip-list">
        {columns.map((column) => (
          <span className="builder-column-chip" key={column.id}>
            {getColumnLabel(column)}
          </span>
        ))}
      </div>
    </div>
  );
}