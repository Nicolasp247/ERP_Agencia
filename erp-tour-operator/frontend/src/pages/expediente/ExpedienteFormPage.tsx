/* erp-tour-operator/frontend/src/pages/expediente/ExpedienteFormPage.tsx */

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";

import { PageSection } from "@/components/PageSection";
import { fetchContinentes } from "@/core/catalog-api";
import { listAgentes } from "@/modules/cliente-agente/cliente-agente-api";
import { listClientes } from "@/modules/cliente/cliente-api";
import { cotizacionFormSchema, getCotizacion, saveCotizacion } from "@/modules/cotizacion/cotizacion-api";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function ExpedienteFormPage() {
  const navigate = useNavigate();
  const params = useParams();
  const editingId = params.id ? Number(params.id) : undefined;

  const clientesQuery = useQuery({ queryKey: ["clientes"], queryFn: listClientes });
  const agentesQuery = useQuery({ queryKey: ["agentes"], queryFn: listAgentes });
  const continentesQuery = useQuery({ queryKey: ["continentes"], queryFn: fetchContinentes });

  const cotizacionQuery = useQuery({
    queryKey: ["cotizacion", editingId],
    queryFn: () => getCotizacion(editingId!),
    enabled: Boolean(editingId)
  });

  const form = useForm<any>({
    resolver: zodResolver(cotizacionFormSchema),
    defaultValues: {
      nombreCotizacion: "",
      fechaViajePrincipal: today(),
      monedaCodigo: "USD",
      presupuestoTipo: "TOTAL",
      adultos65: 0,
      adultos1964: 2,
      jovenes1218: 0,
      ninos311: 0,
      infantes02: 0,
      totalPasajeros: 2,
      nota: "",
      notasInternas: ""
    }
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      const total =
        Number(values.adultos65 ?? 0) +
        Number(values.adultos1964 ?? 0) +
        Number(values.jovenes1218 ?? 0) +
        Number(values.ninos311 ?? 0) +
        Number(values.infantes02 ?? 0);

      form.setValue("totalPasajeros", total, { shouldValidate: false });
    });

    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    if (cotizacionQuery.data) {
      const expediente = cotizacionQuery.data as any;

      form.reset({
        idCliente: expediente.cliente.id,
        idClienteAgente: expediente.clienteAgente?.id ?? null,
        nombreCotizacion: expediente.nombreExpediente,
        fechaViajePrincipal: expediente.fechaViajePrincipal,
        idDestinoPrincipal: expediente.destinoPrincipal?.id ?? null,
        categoriaViaje: "",
        monedaCodigo: expediente.monedaCodigo,
        presupuestoEstimado: null,
        presupuestoTipo: "TOTAL",
        comisionPctAplicada: null,
        margenAplicadoValor: null,
        adultos65: expediente.adultos65,
        adultos1964: expediente.adultos1964,
        jovenes1218: expediente.jovenes1218,
        ninos311: expediente.ninos311,
        infantes02: expediente.infantes02,
        totalPasajeros: expediente.totalPasajeros,
        nota: expediente.observacionesCliente ?? "",
        notasInternas: expediente.notasInternas ?? ""
      });
    }
  }, [cotizacionQuery.data, form]);

  const mutation = useMutation({
    mutationFn: (values: any) => saveCotizacion(values, editingId),
    onSuccess: (data: any) => navigate(`/expedientes/${data.id}`)
  });

  return (
    <PageSection
      action={
        <Link className="link-button" to="/expedientes">
          Volver
        </Link>
      }
      title={editingId ? "Editar expediente" : "Nuevo expediente"}
    >
      <form className="stack" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <div className="grid-3">
          <label>
            Cliente
            <select {...form.register("idCliente")}>
              <option value="">Selecciona</option>
              {((clientesQuery.data ?? []) as Array<any>).map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombreCompleto}
                </option>
              ))}
            </select>
          </label>

          <label>
            Agencia
            <select {...form.register("idClienteAgente")}>
              <option value="">Sin agencia</option>
              {((agentesQuery.data ?? []) as Array<any>).map((agente) => (
                <option key={agente.id} value={agente.id}>
                  {agente.razonSocial}
                </option>
              ))}
            </select>
          </label>

          <label>
            Destino y nombre pasajero
            <input
              {...form.register("nombreCotizacion")}
              placeholder="Ej: EUR Pedro Perez"
            />
          </label>

          <label>
            Fecha principal
            <input {...form.register("fechaViajePrincipal")} type="date" />
          </label>

          <label>
            Destino principal
            <select {...form.register("idDestinoPrincipal")}>
              <option value="">Sin destino</option>
              {(continentesQuery.data ?? []).map((continente) => (
                <option key={continente.id} value={continente.id}>
                  {continente.nombre}
                </option>
              ))}
            </select>
          </label>

          <label>
            Moneda
            <input {...form.register("monedaCodigo")} />
          </label>
        </div>

        <div className="grid-3">
          <label>
            Adultos 65+
            <input {...form.register("adultos65")} type="number" />
          </label>

          <label>
            Adultos 19-64
            <input {...form.register("adultos1964")} type="number" />
          </label>

          <label>
            Jóvenes 12-18
            <input {...form.register("jovenes1218")} type="number" />
          </label>

          <label>
            Niños 3-11
            <input {...form.register("ninos311")} type="number" />
          </label>

          <label>
            Infantes 0-2
            <input {...form.register("infantes02")} type="number" />
          </label>

          <label>
            Total pasajeros
            <input {...form.register("totalPasajeros")} readOnly type="number" />
          </label>
        </div>

        <div className="grid-2">
          <label>
            Observaciones del pasajero
            <textarea
              {...form.register("nota")}
              placeholder="Ej: quiere viaje económico, prefiere hoteles céntricos, evitar caminatas largas..."
            />
          </label>

          <label>
            Notas internas
            <textarea
              {...form.register("notasInternas")}
              placeholder="Notas internas del equipo comercial. No se muestran al pasajero."
            />
          </label>
        </div>

        <button className="primary-button" disabled={mutation.isPending} type="submit">
          {mutation.isPending ? "Guardando..." : "Guardar y abrir expediente"}
        </button>
      </form>
    </PageSection>
  );
}