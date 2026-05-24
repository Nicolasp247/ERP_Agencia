/* erp-tour-operator/frontend/src/pages/cotizacion-builder/CotizacionBuilderPage.tsx */

import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { PageSection } from "@/components/PageSection";
import { getCotizacionBuilder } from "@/modules/cotizacion-builder/cotizacion-builder-api";
import { BuilderHeader } from "./components/BuilderHeader";
import { ColumnConfigPanel } from "./components/ColumnConfigPanel";
import { CotizacionBuilderTable } from "./components/CotizacionBuilderTable";
import { TotalsPanel } from "./components/TotalsPanel";

export function CotizacionBuilderPage() {
  const params = useParams();
  const versionId = Number(params.versionId);

  const query = useQuery({
    queryKey: ["cotizacion-builder", versionId],
    queryFn: () => getCotizacionBuilder(versionId),
    enabled: Number.isFinite(versionId)
  });

  const builder = query.data;

  if (query.isLoading) {
    return <PageSection title="Constructor de cotización">Cargando...</PageSection>;
  }

  if (!builder) {
    return <PageSection title="Constructor de cotización">No se encontró la versión de cotización.</PageSection>;
  }

  return (
    <div className="stack">
      <PageSection title="Construir cotización">
        <BuilderHeader expediente={builder.expediente} version={builder.version} />
      </PageSection>

      <ColumnConfigPanel columns={builder.columns} />

      <PageSection
        action={
          <button className="primary-button" type="button">
            Añadir servicio
          </button>
        }
        title="Servicios de la cotización"
      >
        <CotizacionBuilderTable columns={builder.columns} rows={builder.rows} />
      </PageSection>

      <TotalsPanel
        columns={builder.columns}
        rows={builder.rows}
        monedaCodigo={builder.expediente.monedaCodigo ?? "USD"}
      />
    </div>
  );
}