/* erp-tour-operator/frontend/src/pages/expediente/confirmacion-builder/components/ConfirmacionOptionalServicesTable.tsx */

type ConfirmacionColumn = {
  id: number;
  label?: string;
  grupo: string;
  nombre: string;
};

type ConfirmacionOptionalPrice = {
  columnId: number;
  precioCotizado: number | null;
  precioConfirmado: number | null;
};

type ConfirmacionOptionalRow = {
  id: number;
  servicioIncluido: string;
  operador: string;
  precios: ConfirmacionOptionalPrice[];
};

type ConfirmacionOptionalServicesTableProps = {
  columns: ConfirmacionColumn[];
  rows: ConfirmacionOptionalRow[];
  monedaCodigo: string;
};

function getColumnLabel(column: ConfirmacionColumn) {
  return (
    column.label ||
    `${column.grupo} ${column.nombre}`
      .replaceAll("*", " estrellas")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function formatMoney(value: number | null | undefined, monedaCodigo: string) {
  if (value === null || value === undefined) {
    return "-";
  }

  return `$ ${Number(value).toFixed(2)} ${monedaCodigo}`;
}

function getPrice(row: ConfirmacionOptionalRow, columnId: number) {
  return row.precios.find((price) => price.columnId === columnId);
}

export function ConfirmacionOptionalServicesTable({
  columns,
  rows,
  monedaCodigo
}: ConfirmacionOptionalServicesTableProps) {
  if (!rows.length) {
    return (
      <section className="builder-optionals-section">
        <div className="builder-optionals-heading">
          <h3>Opcionales disponibles</h3>
          <p>Esta confirmación no tiene opcionales disponibles por ahora.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="builder-optionals-section">
      <div className="builder-optionals-heading">
        <h3>Opcionales disponibles</h3>
        <p>
          Estos servicios no entran automáticamente en la tabla principal. Más adelante se podrán agregar a la confirmación.
        </p>
      </div>

      <div className="builder-optionals-table-wrapper">
        <table className="builder-optionals-table">
          <thead>
            <tr>
              <th>Servicio opcional</th>
              <th>Operador</th>

              {columns.map((column) => (
                <th key={column.id}>{getColumnLabel(column)}</th>
              ))}

              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.servicioIncluido}</td>
                <td>{row.operador}</td>

                {columns.map((column) => {
                  const price = getPrice(row, column.id);

                  return (
                    <td key={column.id}>
                      <strong>
                        {formatMoney(price?.precioConfirmado ?? price?.precioCotizado, monedaCodigo)}
                      </strong>
                    </td>
                  );
                })}

                <td>
                  <button className="link-button" disabled type="button">
                    Agregar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}