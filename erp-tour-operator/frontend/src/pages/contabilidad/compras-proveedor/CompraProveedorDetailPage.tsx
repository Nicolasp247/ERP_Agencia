/* erp-tour-operator/frontend/src/pages/contabilidad/compras-proveedor/CompraProveedorDetailPage.tsx */

import {
  useQuery
} from "@tanstack/react-query";

import {
  Link,
  useParams
} from "react-router-dom";

import { PageSection } from "@/components/PageSection";

import {
  getCompraProveedorById
} from "@/modules/contabilidad/compras-proveedor/compras-proveedor-api";

import "@/styles/compras-proveedor.css";

export function CompraProveedorDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const query = useQuery({
    queryKey: [
      "compra-proveedor",
      id
    ],

    queryFn: () =>
      getCompraProveedorById(id),

    enabled:
      Number.isFinite(id) &&
      id > 0
  });

  const compra = query.data;

  return (
    <div className="stack">
      <div className="compras-proveedor-detail-back">
        <Link
          className="link-button"
          to="/contabilidad/compras-proveedor"
        >
          Volver a compras
        </Link>
      </div>

      <PageSection title="Detalle de compra">
        {query.isLoading ? (
          <div className="services-empty-state">
            Cargando detalle...
          </div>
        ) : !compra ? (
          <div className="services-empty-state">
            No se encontró la reserva del proveedor.
          </div>
        ) : (
          <div className="compras-proveedor-detail-grid">
            <article>
              <span>Código interno</span>
              <strong>{compra.codigoInterno}</strong>
            </article>

            <article>
              <span>Código proveedor</span>
              <strong>
                {compra.codigoProveedor || "Sin código"}
              </strong>
            </article>

            <article>
              <span>Estado operativo</span>
              <strong>{compra.estadoOperativo}</strong>
            </article>

            <article>
              <span>Estado financiero</span>
              <strong>{compra.estadoFinanciero}</strong>
            </article>

            <article>
              <span>Valor contratado</span>
              <strong>
                {compra.valorContratado ?? "-"}{" "}
                {compra.monedaCodigo}
              </strong>
            </article>

            <article>
              <span>Total pagado</span>
              <strong>
                {compra.totalPagado ?? 0}{" "}
                {compra.monedaCodigo}
              </strong>
            </article>

            <article>
              <span>Saldo pendiente</span>
              <strong>
                {compra.saldoPendiente ?? "-"}{" "}
                {compra.monedaCodigo}
              </strong>
            </article>

            <article>
              <span>Proveedor</span>
              <strong>
                {compra.proveedor?.codigo ||
                  compra.proveedor?.nombreComercial ||
                  "N/D"}
              </strong>
            </article>
          </div>
        )}
      </PageSection>
    </div>
  );
}