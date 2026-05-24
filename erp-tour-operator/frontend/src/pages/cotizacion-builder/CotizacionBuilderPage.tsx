/* erp-tour-operator/frontend/src/pages/cotizacion-builder/CotizacionBuilderPage.tsx */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { PageSection } from "@/components/PageSection";
import {
  createCotizacionBuilderColumn,
  deleteCotizacionBuilderColumn,
  getCotizacionBuilder,
  type BuilderColumnFormValues
} from "@/modules/cotizacion-builder/cotizacion-builder-api";
import { BuilderHeader } from "./components/BuilderHeader";
import { ColumnConfigPanel } from "./components/ColumnConfigPanel";
import { CotizacionBuilderTable } from "./components/CotizacionBuilderTable";
import { TotalsPanel } from "./components/TotalsPanel";

export function CotizacionBuilderPage() {
  const params = useParams();
  const versionId = Number(params.versionId);
  const queryClient = useQueryClient();

  const queryKey = ["cotizacion-builder", versionId];

  const query = useQuery({
    queryKey,
    queryFn: () => getCotizacionBuilder(versionId),
    enabled: Number.isFinite(versionId)
  });

  const createColumnMutation = useMutation({
    mutationFn: (values: BuilderColumnFormValues) =>
      createCotizacionBuilderColumn(versionId, values),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
    }
  });

  const deleteColumnMutation = useMutation({
    mutationFn: deleteCotizacionBuilderColumn,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
    }
  });

  const builder = query.data;

  const isSavingColumn = createColumnMutation.isPending || deleteColumnMutation.isPending;

  if (query.isLoading) {
    return <PageSection title="Constructor de cotización">Cargando...</PageSection>;
  }

  if (!builder) {
    return (
      <PageSection title="Constructor de cotización">
        No se encontró la versión de cotización.
      </PageSection>
    );
  }

  return (
    <div className="stack">
      <div className="builder-top-grid">
        <BuilderHeader expediente={builder.expediente} version={builder.version} />

        <ColumnConfigPanel
          columns={builder.columns}
          isSaving={isSavingColumn}
          onCreateColumn={(values) => createColumnMutation.mutate(values)}
          onDeleteColumn={(columnId) => deleteColumnMutation.mutate(columnId)}
        />
      </div>

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