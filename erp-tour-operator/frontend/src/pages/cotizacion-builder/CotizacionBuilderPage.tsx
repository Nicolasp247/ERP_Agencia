/* erp-tour-operator/frontend/src/pages/cotizacion-builder/CotizacionBuilderPage.tsx */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { PageSection } from "@/components/PageSection";
import {
  createCotizacionBuilderColumn,
  createCotizacionBuilderItem,
  deleteCotizacionBuilderColumn,
  deleteCotizacionBuilderItem,
  getCotizacionBuilder,
  updateCotizacionBuilderItemPrices,
  moveCotizacionBuilderItem,
  updateCotizacionBuilderItemNotes,
  type BuilderNoteFormValues,
  type BuilderMoveItemValues,
  type BuilderColumnFormValues,
  type BuilderItemFormValues,
  type BuilderPriceFormValues
} from "@/modules/cotizacion-builder/cotizacion-builder-api";
import { AddServicePanel } from "./components/AddServicePanel";
import { BuilderHeader } from "./components/BuilderHeader";
import { ColumnConfigPanel } from "./components/ColumnConfigPanel";
import { CotizacionBuilderTable } from "./components/CotizacionBuilderTable";
import { TotalsPanel } from "./components/TotalsPanel";

export function CotizacionBuilderPage() {
  const params = useParams();
  const versionId = Number(params.versionId);
  const queryClient = useQueryClient();
  const [showAddService, setShowAddService] = useState(false);

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

  const createItemMutation = useMutation({
    mutationFn: (values: BuilderItemFormValues) =>
      createCotizacionBuilderItem(versionId, values),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
      setShowAddService(false);
    }
  });

  const updateItemPricesMutation = useMutation({
    mutationFn: ({
      itemId,
      values
    }: {
      itemId: number;
      values: BuilderPriceFormValues;
    }) => updateCotizacionBuilderItemPrices(itemId, values),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
    }
  });

  const updateItemNotesMutation = useMutation({
    mutationFn: ({
      itemId,
      values
    }: {
      itemId: number;
      values: BuilderNoteFormValues;
    }) => updateCotizacionBuilderItemNotes(itemId, values),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: deleteCotizacionBuilderItem,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
    }
  });

  const moveItemMutation = useMutation({
    mutationFn: ({
      itemId,
      values
    }: {
      itemId: number;
      values: BuilderMoveItemValues;
    }) => moveCotizacionBuilderItem(itemId, values),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
    }
  });

  const builder = query.data;

  const nextOrder = useMemo(() => {
    const rows = builder?.rows ?? [];
    const maxOrder = rows.reduce((max, row) => Math.max(max, row.ordenDia ?? 0), 0);
    return maxOrder + 1;
  }, [builder?.rows]);

  const isSavingColumn = createColumnMutation.isPending || deleteColumnMutation.isPending;
  const isSavingItem = createItemMutation.isPending;

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
          <button
            className="primary-button"
            onClick={() => setShowAddService(true)}
            type="button"
          >
            Añadir servicio
          </button>
        }
        title="Servicios de la cotización"
      >
        <CotizacionBuilderTable
          columns={builder.columns}
          rows={builder.rows}
          onDeleteItem={(itemId) => deleteItemMutation.mutate(itemId)}
          onMoveItem={(itemId, direction) =>
            moveItemMutation.mutate({
              itemId,
              values: {
                direction
              }
            })
          }
          onUpdateItemNotes={(itemId, values) =>
            updateItemNotesMutation.mutate({
              itemId,
              values
            })
          }
          onUpdateItemPrices={(itemId, values) =>
            updateItemPricesMutation.mutate({
              itemId,
              values
            })
          }
        />

        {showAddService ? (
          <div className="builder-modal-backdrop">
            <div className="builder-modal">
              <AddServicePanel
                columns={builder.columns}
                defaultDate={builder.expediente.fechaViajePrincipal}
                isSaving={isSavingItem}
                nextOrder={nextOrder}
                onCancel={() => setShowAddService(false)}
                onCreateItem={(values) => createItemMutation.mutate(values)}
              />
            </div>
          </div>
        ) : null}
      </PageSection>

      <TotalsPanel
        columns={builder.columns}
        rows={builder.rows}
        monedaCodigo={builder.expediente.monedaCodigo ?? "USD"}
        totalPasajeros={builder.expediente.totalPasajeros ?? 1}
      />
    </div>
  );
}