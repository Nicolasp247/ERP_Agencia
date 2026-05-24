/* erp-tour-operator/frontend/src/pages/cotizacion-builder/components/TotalsPanel.tsx */

import type { BuilderColumn, BuilderRow } from "../types/cotizacion-builder.types";
import { calculateColumnTotal, getColumnLabel } from "../helpers/builder-calculations";

type TotalsPanelProps = {
  columns: BuilderColumn[];
  rows: BuilderRow[];
  monedaCodigo: string;
};

export function TotalsPanel({ columns, rows, monedaCodigo }: TotalsPanelProps) {
  return (
    <div className="builder-card">
      <div>
        <p className="eyebrow">Totales netos</p>
        <h3>Resumen por columna</h3>
      </div>

      <div className="builder-totals-grid">
        {columns.map((column) => (
          <div className="metric-card" key={column.id}>
            <span>{getColumnLabel(column)}</span>
            <strong>
              {calculateColumnTotal(rows, column.id).toFixed(2)} {monedaCodigo}
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}