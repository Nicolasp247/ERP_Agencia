/* erp-tour-operator/frontend/src/pages/expediente/confirmacion-builder/ConfirmacionBuilderPage.tsx */

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import { PageSection } from "@/components/PageSection";
import {
  createConfirmacionPassenger,
  deleteConfirmacionBuilderItem,
  deleteConfirmacionPassenger,
  getConfirmacionBuilder,
  moveConfirmacionBuilderItem,
  updateConfirmacionBuilderFreeNotes,
  updateConfirmacionBuilderItemHotels,
  updateConfirmacionBuilderItemNotes,
  updateConfirmacionBuilderItemPrices,
  updateConfirmacionPassenger,
  type ConfirmacionBuilderFreeNotesFormValues,
  type ConfirmacionBuilderHotelPreviewFormValues,
  type ConfirmacionBuilderMoveItemValues,
  type ConfirmacionBuilderNoteFormValues,
  type ConfirmacionBuilderPriceFormValues,
  type ConfirmacionPassenger,
  type ConfirmacionPassengerValues
} from "@/modules/expediente/confirmacion-builder/confirmacion-builder-api";import { ConfirmacionBuilderTable } from "@/pages/expediente/confirmacion-builder/components/ConfirmacionBuilderTable";
import { ConfirmacionOptionalServicesTable } from "@/pages/expediente/confirmacion-builder/components/ConfirmacionOptionalServicesTable";
import { ConfirmacionPassengerModal } from "@/pages/expediente/confirmacion-builder/components/ConfirmacionPassengerModal";
import { ConfirmacionPassengersTable } from "@/pages/expediente/confirmacion-builder/components/ConfirmacionPassengersTable";
import { ConfirmacionHotelPreviewTable } from "@/pages/expediente/confirmacion-builder/components/ConfirmacionHotelPreviewTable";
import { FreeNotesPanel } from "@/pages/expediente/cotizacion-builder/components/FreeNotesPanel";


function formatDate(value: string | null | undefined) {
  if (!value) {
    return "N/D";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function formatMoney(value: number, monedaCodigo: string) {
  return `$ ${Number(value).toFixed(2)} ${monedaCodigo}`;
}

function getColumnPriceTotal(rows: any[], columnId: number) {
  return rows.reduce((total, row) => {
    const price = row.precios?.find((item: any) => item.columnId === columnId);
    const value = price?.precioConfirmado ?? price?.precioCotizado ?? 0;

    return total + Number(value);
  }, 0);
}

export function ConfirmacionBuilderPage() {
  const params = useParams();
  const expedienteId = Number(params.id);
  const versionId = Number(params.versionId);
  const queryClient = useQueryClient();
  const [passengerModalOpen, setPassengerModalOpen] = useState(false);
  const [editingPassenger, setEditingPassenger] = useState<ConfirmacionPassenger | null>(null);
  const queryKey = ["confirmacion-builder", versionId];

  const query = useQuery({
    queryKey,
    queryFn: () => getConfirmacionBuilder(versionId),
    enabled: Number.isFinite(versionId)
  });

  const savePassengerMutation = useMutation({
    mutationFn: (values: ConfirmacionPassengerValues) => {
      if (editingPassenger) {
        return updateConfirmacionPassenger(editingPassenger.id, values);
      }

      return createConfirmacionPassenger(Number(builder?.reserva?.id), values);
    },
    onSuccess: async () => {
      setPassengerModalOpen(false);
      setEditingPassenger(null);

      await queryClient.invalidateQueries({
        queryKey: ["confirmacion-builder", versionId]
      });
    }
  });

  const deletePassengerMutation = useMutation({
    mutationFn: (passengerId: number) => deleteConfirmacionPassenger(passengerId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["confirmacion-builder", versionId]
      });
    }
  });

  const updateItemPricesMutation = useMutation({
    mutationFn: ({
      itemId,
      values
    }: {
      itemId: number;
      values: ConfirmacionBuilderPriceFormValues;
    }) => updateConfirmacionBuilderItemPrices(itemId, values),
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
      values: ConfirmacionBuilderNoteFormValues;
    }) => updateConfirmacionBuilderItemNotes(itemId, values),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
    }
  });

  const updateItemHotelsMutation = useMutation({
    mutationFn: ({
      itemId,
      payload
    }: {
      itemId: number;
      payload: ConfirmacionBuilderHotelPreviewFormValues;
    }) => updateConfirmacionBuilderItemHotels(itemId, payload),
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
      values: ConfirmacionBuilderMoveItemValues;
    }) => moveConfirmacionBuilderItem(itemId, values),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: deleteConfirmacionBuilderItem,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
    }
  });

  const updateFreeNotesMutation = useMutation({
    mutationFn: ({
      versionId,
      values
    }: {
      versionId: number;
      values: ConfirmacionBuilderFreeNotesFormValues;
    }) => updateConfirmacionBuilderFreeNotes(versionId, values),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
    }
  });

  const builder = query.data as any;

  const totals = useMemo(() => {
    const columns = builder?.columns ?? [];
    const rows = builder?.rows ?? [];

    return columns.map((column: any) => ({
      column,
      total: getColumnPriceTotal(rows, column.id)
    }));
  }, [builder?.columns, builder?.rows]);

  if (query.isLoading) {
    return <PageSection title="Confirmación">Cargando confirmación...</PageSection>;
  }

  if (!builder) {
    return (
      <PageSection title="Confirmación">
        No se encontró la confirmación para esta cotización.
      </PageSection>
    );
  }

  const monedaCodigo = builder.reserva?.monedaCodigo ?? "USD";

  return (
    <div className="stack">
      <div className="builder-top-grid">
        <section className="builder-header-card">
          <h3>Construir confirmación</h3>

          <div className="builder-header-inner">
            <h2>{builder.expediente?.codigo}</h2>

            <p className="muted">
              {builder.version?.nombreCotizacion} · Cliente:{" "}
              {builder.expediente?.cliente?.nombreCompleto ?? "N/D"} · Agencia:{" "}
              {builder.expediente?.clienteAgente?.razonSocial ?? "WT / Directo"}
            </p>

            <div className="builder-header-meta">
              <span>{formatDate(builder.reserva?.fechaViajePrincipal)}</span>
              <span>{builder.reserva?.totalPasajeros ?? 0} pasajeros</span>
              <span>{monedaCodigo}</span>
              <span>{builder.reserva?.codigoReserva}</span>
            </div>

            <div className="builder-option-actions">
              <Link className="link-button" to={`/expedientes/${expedienteId}`}>
                Volver al expediente
              </Link>

              <Link
                className="link-button"
                to={`/expedientes/${expedienteId}/versiones/${versionId}/construir?modo=lectura`}
              >
                Ver cotización original
              </Link>
            </div>
          </div>
        </section>

        <section className="builder-options-card">
          <div className="builder-options-title">
            <h3>Opciones confirmadas</h3>
            <p>
              Estas son las categorías / acomodaciones seleccionadas para crear la confirmación.
            </p>
          </div>

          <div className="builder-commission-grid">
            {(builder.columns ?? []).map((column: any) => (
              <article className="builder-commission-card" key={column.id}>
                <div className="builder-commission-card-header">
                  <span>{column.grupo}</span>
                  <strong>{column.nombre}</strong>
                </div>

                <div className="builder-commission-factor">
                  <span>Unidad</span>
                  <strong>{String(column.unidad).replaceAll("_", " ").toLowerCase()}</strong>
                </div>

                <div className="builder-commission-factor">
                  <span>Multiplicador</span>
                  <strong>{column.multiplicador}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <PageSection title="Datos de pasajeros">
        <ConfirmacionPassengersTable
          passengers={builder.pasajeros ?? []}
          isDeleting={deletePassengerMutation.isPending}
          onAdd={() => {
            setEditingPassenger(null);
            setPassengerModalOpen(true);
          }}
          onEdit={(passenger) => {
            setEditingPassenger(passenger);
            setPassengerModalOpen(true);
          }}
          onDelete={(passenger) => {
            const confirmed = window.confirm(
              `¿Seguro que deseas eliminar a ${passenger.nombre} ${passenger.apellidos}?`
            );

            if (!confirmed) {
              return;
            }

            deletePassengerMutation.mutate(passenger.id);
          }}
        />
      </PageSection>

      <PageSection title="Servicios confirmados">
        <ConfirmacionBuilderTable
          columns={builder.columns ?? []}
          rows={builder.rows ?? []}
          monedaCodigo={monedaCodigo}
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
      </PageSection>

      <PageSection title="Hoteles previstos o similares">
        <ConfirmacionHotelPreviewTable
          columns={builder.columns ?? []}
          rows={builder.rows ?? []}
          onUpdateItemHotels={(itemId, payload) =>
            updateItemHotelsMutation.mutate({
              itemId,
              payload
            })
          }
        />
      </PageSection>

      <PageSection title="Totales de confirmación">
        <div className="builder-totals-table-wrapper">
          <table className="builder-totals-table">
            <thead>
              <tr>
                <th>Concepto</th>

                {totals.map((item: any) => (
                  <th key={item.column.id}>{item.column.label}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              <tr className="builder-totals-final-row">
                <td>Total servicios incluidos</td>

                {totals.map((item: any) => (
                  <td key={item.column.id}>
                    <span className="builder-total-final-value">
                      {formatMoney(item.total, monedaCodigo)}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </PageSection>

      <ConfirmacionOptionalServicesTable
        columns={builder.columns ?? []}
        rows={builder.optionalRows ?? []}
        monedaCodigo={monedaCodigo}
      />

      <PageSection title="Anotaciones">
        <FreeNotesPanel
          initialValue={builder.reserva?.nota ?? ""}
          isSaving={updateFreeNotesMutation.isPending}
          onSave={(value) =>
            updateFreeNotesMutation.mutate({
              versionId: builder.version.id,
              values: {
                nota: value
              }
            })
          }
        />
      </PageSection>
      {passengerModalOpen ? (
        <ConfirmacionPassengerModal
          passenger={editingPassenger}
          isSaving={savePassengerMutation.isPending}
          onCancel={() => {
            setPassengerModalOpen(false);
            setEditingPassenger(null);
          }}
          onSave={(values) => savePassengerMutation.mutate(values)}
        />
      ) : null}
    </div>
  );
}