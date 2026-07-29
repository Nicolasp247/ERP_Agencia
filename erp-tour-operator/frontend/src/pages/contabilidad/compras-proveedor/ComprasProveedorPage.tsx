/* erp-tour-operator/frontend/src/pages/contabilidad/compras-proveedor/ComprasProveedorPage.tsx */

import {
  useMemo,
  useState
} from "react";

import {
  useQuery
} from "@tanstack/react-query";

import { PageSection } from "@/components/PageSection";

import {
  getComprasProveedorList,
  type CompraProveedorListFilters
} from "@/modules/contabilidad/compras-proveedor/compras-proveedor-api";

import { ComprasProveedorFilters } from "@/pages/contabilidad/compras-proveedor/components/ComprasProveedorFilters";
import { ComprasProveedorTable } from "@/pages/contabilidad/compras-proveedor/components/ComprasProveedorTable";

import "@/styles/compras-proveedor.css";

const DEFAULT_FILTERS:
  CompraProveedorListFilters = {
    search: "",
    estadoOperativo: "",
    estadoFinanciero: "",
    soloVigentes: true,
    soloPendientes: false,
    fechaCobroDesde: "",
    fechaCobroHasta: "",
    fechaServicioDesde: "",
    fechaServicioHasta: "",
    page: 1,
    pageSize: 25
  };

export function ComprasProveedorPage() {
  const [filters, setFilters] =
    useState<CompraProveedorListFilters>(
      DEFAULT_FILTERS
    );

  const queryKey = useMemo(
    () => [
      "compras-proveedor",
      filters
    ],
    [filters]
  );

  const query = useQuery({
    queryKey,
    queryFn: () =>
      getComprasProveedorList(
        filters
      )
  });

  const result = query.data;

  return (
    <div className="stack">
      <section className="compras-proveedor-header">
        <div>
          <p className="eyebrow">
            Contabilidad
          </p>

          <h1>Compras a proveedores</h1>

          <p>
            Consulta todas las reservas de proveedores,
            sus vencimientos, pagos y saldos desde una sola
            mesa de control.
          </p>
        </div>

        <div className="compras-proveedor-header-metric">
          <span>Resultados</span>

          <strong>
            {result?.total ?? 0}
          </strong>
        </div>
      </section>

      <PageSection title="Filtros">
        <ComprasProveedorFilters
          values={filters}
          onChange={setFilters}
          onReset={() =>
            setFilters(
              DEFAULT_FILTERS
            )
          }
        />
      </PageSection>

      <PageSection title="Reservas de proveedores">
        {query.isLoading ? (
          <div className="services-empty-state">
            Cargando reservas...
          </div>
        ) : query.isError ? (
          <div className="services-empty-state">
            No fue posible cargar las reservas.
          </div>
        ) : (
          <>
            <ComprasProveedorTable
              items={
                result?.items ?? []
              }
            />

            <div className="compras-proveedor-pagination">
              <button
                className="link-button"
                disabled={
                  !result ||
                  result.page <= 1
                }
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    page:
                      Math.max(
                        1,
                        Number(current.page ?? 1) - 1
                      )
                  }))
                }
                type="button"
              >
                Anterior
              </button>

              <span>
                Página {result?.page ?? 1} de{" "}
                {Math.max(
                  result?.totalPages ?? 1,
                  1
                )}
              </span>

              <button
                className="link-button"
                disabled={
                  !result ||
                  result.page >=
                    result.totalPages
                }
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    page:
                      Number(
                        current.page ?? 1
                      ) + 1
                  }))
                }
                type="button"
              >
                Siguiente
              </button>
            </div>
          </>
        )}
      </PageSection>
    </div>
  );
}