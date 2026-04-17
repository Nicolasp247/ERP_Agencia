import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";

import { PageSection } from "@/components/PageSection";
import { cerrarLiquidacion, confirmarComercialmenteReserva, recalcularLiquidacion } from "@/modules/liquidacion/liquidacion-api";
import {
  cancelReserva,
  getReserva,
  registerReservaConfirmacion,
  updateReservaOperational
} from "@/modules/reserva/reserva-api";
import { openPdf } from "@/utils/pdf";

type ReservaOperationalForm = {
  nota?: string | null;
  items: Array<{
    id: number;
    costoFinal?: number | null;
    estadoItem?: string;
    numeroConfirmacion?: string | null;
  }>;
};

type ReservaComercialForm = {
  observacion?: string | null;
  items: Array<{
    idReservaItem: number;
    precioVentaConfirmado: number;
    esOpcionalVendido: boolean;
  }>;
};

export function ReservaDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const query = useQuery({
    queryKey: ["reserva", id],
    queryFn: () => getReserva(id)
  });

  const operationalForm = useForm<ReservaOperationalForm>({
    defaultValues: {
      items: []
    }
  });

  const comercialForm = useForm<ReservaComercialForm>({
    defaultValues: {
      items: []
    }
  });

  const operationalArray = useFieldArray({
    control: operationalForm.control,
    name: "items"
  });

  const comercialArray = useFieldArray({
    control: comercialForm.control,
    name: "items"
  });

  useEffect(() => {
    if (query.data) {
      const reserva = query.data as any;
      operationalForm.reset({
        nota: reserva.nota ?? "",
        items: reserva.items.map((item: any) => ({
          id: item.id,
          costoFinal: item.costoFinal ? Number(item.costoFinal) : null,
          estadoItem: item.estadoItem,
          numeroConfirmacion: item.numeroConfirmacion ?? ""
        }))
      });

      const activeConfirmation = reserva.confirmacionesComerciales.find((item: any) => item.estado === "ACTIVA");
      const confirmationMap = new Map<number, any>(
        (activeConfirmation?.items ?? []).map((item: any) => [item.idReservaItem, item] as const)
      );

      comercialForm.reset({
        observacion: "",
        items: reserva.items.map((item: any) => ({
          idReservaItem: item.id,
          precioVentaConfirmado: Number(confirmationMap.get(item.id)?.precioVentaConfirmado ?? 0),
          esOpcionalVendido: Boolean(confirmationMap.get(item.id)?.esOpcionalVendido)
        }))
      });
    }
  }, [comercialForm, operationalForm, query.data]);

  const operationalMutation = useMutation({
    mutationFn: async (values: ReservaOperationalForm) => {
      await updateReservaOperational(id, {
        nota: values.nota,
        items: values.items.map((item) => ({
          id: item.id,
          costoFinal: item.costoFinal,
          estadoItem: item.estadoItem
        }))
      });

      for (const item of values.items) {
        if (item.numeroConfirmacion !== undefined) {
          await registerReservaConfirmacion(id, item.id, {
            numeroConfirmacion: item.numeroConfirmacion || null,
            estadoItem: item.estadoItem
          });
        }
      }
    },
    onSuccess: () => void query.refetch()
  });

  const commercialMutation = useMutation({
    mutationFn: (values: ReservaComercialForm) => confirmarComercialmenteReserva(id, values),
    onSuccess: () => void query.refetch()
  });

  const recalcMutation = useMutation({
    mutationFn: () => recalcularLiquidacion(id),
    onSuccess: () => void query.refetch()
  });

  const closeMutation = useMutation({
    mutationFn: () => cerrarLiquidacion(id),
    onSuccess: () => void query.refetch()
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelReserva(id, "Cancelación manual desde frontend"),
    onSuccess: () => void query.refetch()
  });

  const reserva = query.data as any;

  if (!reserva) {
    return <PageSection title="Reserva">Cargando...</PageSection>;
  }

  return (
    <div className="stack">
      <PageSection
        action={
          <div className="toolbar">
            <button className="link-button" onClick={() => void openPdf(`/documento/reserva/${id}/pdf`)} type="button">
              PDF reserva
            </button>
            <button
              className="link-button"
              onClick={() => void openPdf(`/documento/reserva/${id}/confirmacion/pdf`)}
              type="button"
            >
              PDF confirmación
            </button>
            <button className="link-button" onClick={() => cancelMutation.mutate()} type="button">
              Cancelar
            </button>
            <Link className="link-button" to="/reservas">
              Volver
            </Link>
          </div>
        }
        title={reserva.codigoReserva}
      >
        <div className="grid-3">
          <div>
            <strong>Cliente</strong>
            <p>{reserva.cliente.nombreCompleto}</p>
          </div>
          <div>
            <strong>Agencia</strong>
            <p>{reserva.clienteAgente?.razonSocial ?? "Directo"}</p>
          </div>
          <div>
            <strong>Estado</strong>
            <p>{reserva.estado}</p>
          </div>
        </div>
      </PageSection>

      <PageSection title="Operación de reserva">
        <form className="stack" onSubmit={operationalForm.handleSubmit((values) => operationalMutation.mutate(values))}>
          <label>
            Nota interna
            <textarea {...operationalForm.register("nota")} rows={3} />
          </label>

          {operationalArray.fields.map((field, index) => (
            <div className="panel" key={field.id}>
              <div className="grid-3">
                <div>
                  <strong>{reserva.items[index]?.tituloSnapshot ?? reserva.items[index]?.servicio.nombreWtravel}</strong>
                  <p className="muted">{new Date(reserva.items[index]?.fechaServicio).toISOString().slice(0, 10)}</p>
                </div>
                <label>
                  Costo final
                  <input {...operationalForm.register(`items.${index}.costoFinal`, { valueAsNumber: true })} type="number" />
                </label>
                <label>
                  Número confirmación
                  <input {...operationalForm.register(`items.${index}.numeroConfirmacion`)} />
                </label>
              </div>
            </div>
          ))}

          <button className="primary-button" type="submit">
            Guardar cambios operativos
          </button>
        </form>
      </PageSection>

      <PageSection title="Confirmación comercial">
        <form className="stack" onSubmit={comercialForm.handleSubmit((values) => commercialMutation.mutate(values))}>
          {comercialArray.fields.map((field, index) => (
            <div className="grid-3" key={field.id}>
              <div>
                <strong>{reserva.items[index]?.tituloSnapshot ?? reserva.items[index]?.servicio.nombreWtravel}</strong>
              </div>
              <label>
                Venta confirmada
                <input {...comercialForm.register(`items.${index}.precioVentaConfirmado`, { valueAsNumber: true })} type="number" />
              </label>
              <label>
                Opcional vendido
                <input {...comercialForm.register(`items.${index}.esOpcionalVendido`)} type="checkbox" />
              </label>
            </div>
          ))}
          <button className="primary-button" type="submit">
            Congelar confirmación comercial
          </button>
        </form>
      </PageSection>

      <PageSection title="Liquidación">
        <div className="toolbar">
          <button className="link-button" onClick={() => recalcMutation.mutate()} type="button">
            Recalcular
          </button>
          <button className="primary-button" onClick={() => closeMutation.mutate()} type="button">
            Cerrar
          </button>
        </div>
        {reserva.liquidacion ? (
          <div className="grid-3">
            <div>
              <strong>Venta confirmada</strong>
              <p>{reserva.liquidacion.totalVentaConfirmada}</p>
            </div>
            <div>
              <strong>Costo real</strong>
              <p>{reserva.liquidacion.totalCostoReal}</p>
            </div>
            <div>
              <strong>Utilidad</strong>
              <p>{reserva.liquidacion.utilidadBrutaTotal}</p>
            </div>
          </div>
        ) : (
          <p className="muted">Todavía no hay liquidación calculada.</p>
        )}
      </PageSection>
    </div>
  );
}
