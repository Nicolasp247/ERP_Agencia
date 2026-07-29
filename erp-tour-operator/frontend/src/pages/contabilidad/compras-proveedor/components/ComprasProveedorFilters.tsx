/* erp-tour-operator/frontend/src/pages/contabilidad/compras-proveedor/components/ComprasProveedorFilters.tsx */

import type {
  CompraProveedorListFilters
} from "@/modules/contabilidad/compras-proveedor/compras-proveedor-api";

type ComprasProveedorFiltersProps = {
  values: CompraProveedorListFilters;
  onChange: (
    values: CompraProveedorListFilters
  ) => void;
  onReset: () => void;
};

export function ComprasProveedorFilters({
  values,
  onChange,
  onReset
}: ComprasProveedorFiltersProps) {
  function update(
    patch: Partial<CompraProveedorListFilters>
  ) {
    onChange({
      ...values,
      ...patch,
      page: 1
    });
  }

  return (
    <section className="compras-proveedor-filters">
      <label className="compras-proveedor-search">
        <span>Buscar</span>

        <input
          onChange={(event) =>
            update({
              search:
                event.target.value
            })
          }
          placeholder="Código, proveedor, cliente o expediente"
          value={values.search ?? ""}
        />
      </label>

      <label>
        <span>Estado operativo</span>

        <select
          onChange={(event) =>
            update({
              estadoOperativo:
                event.target
                  .value as CompraProveedorListFilters["estadoOperativo"]
            })
          }
          value={
            values.estadoOperativo ?? ""
          }
        >
          <option value="">Todos</option>
          <option value="BORRADOR">Borrador</option>
          <option value="SOLICITADA">Solicitada</option>
          <option value="CONFIRMADA">Confirmada</option>
          <option value="REALIZADA">Realizada</option>
          <option value="CANCELADA">Cancelada</option>
          <option value="REEMPLAZADA">Reemplazada</option>
        </select>
      </label>

      <label>
        <span>Estado financiero</span>

        <select
          onChange={(event) =>
            update({
              estadoFinanciero:
                event.target
                  .value as CompraProveedorListFilters["estadoFinanciero"]
            })
          }
          value={
            values.estadoFinanciero ?? ""
          }
        >
          <option value="">Todos</option>
          <option value="SIN_PAGAR">Sin pagar</option>
          <option value="PAGO_PROGRAMADO">Pago programado</option>
          <option value="PAGO_PARCIAL">Pago parcial</option>
          <option value="PAGADO">Pagado</option>
          <option value="FALTA_COP">Falta COP</option>
          <option value="REEMBOLSADO">Reembolsado</option>
        </select>
      </label>

      <label>
        <span>Cobro desde</span>

        <input
          onChange={(event) =>
            update({
              fechaCobroDesde:
                event.target.value
            })
          }
          type="date"
          value={
            values.fechaCobroDesde ?? ""
          }
        />
      </label>

      <label>
        <span>Cobro hasta</span>

        <input
          onChange={(event) =>
            update({
              fechaCobroHasta:
                event.target.value
            })
          }
          type="date"
          value={
            values.fechaCobroHasta ?? ""
          }
        />
      </label>

      <label>
        <span>Servicio desde</span>

        <input
          onChange={(event) =>
            update({
              fechaServicioDesde:
                event.target.value
            })
          }
          type="date"
          value={
            values.fechaServicioDesde ?? ""
          }
        />
      </label>

      <label>
        <span>Servicio hasta</span>

        <input
          onChange={(event) =>
            update({
              fechaServicioHasta:
                event.target.value
            })
          }
          type="date"
          value={
            values.fechaServicioHasta ?? ""
          }
        />
      </label>

      <label className="compras-proveedor-check">
        <input
          checked={
            values.soloVigentes ?? true
          }
          onChange={(event) =>
            update({
              soloVigentes:
                event.target.checked
            })
          }
          type="checkbox"
        />

        <span>Solo vigentes</span>
      </label>

      <label className="compras-proveedor-check">
        <input
          checked={
            values.soloPendientes ?? false
          }
          onChange={(event) =>
            update({
              soloPendientes:
                event.target.checked
            })
          }
          type="checkbox"
        />

        <span>Solo pendientes de pago</span>
      </label>

      <button
        className="link-button"
        onClick={onReset}
        type="button"
      >
        Limpiar filtros
      </button>
    </section>
  );
}