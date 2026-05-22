/* erp-tour-operator/frontend/src/pages/CotizacionFormPage.tsx */

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { fetchContinentes } from "@/core/catalog-api";
import { PageSection } from "@/components/PageSection";
import { listAgentes } from "@/modules/cliente-agente/cliente-agente-api";
import { listClientes } from "@/modules/cliente/cliente-api";
import { cotizacionFormSchema, getCotizacion, saveCotizacion } from "@/modules/cotizacion/cotizacion-api";
import { listServicios } from "@/modules/servicio/servicio-api";

export function CotizacionFormPage() {
  const navigate = useNavigate();
  const params = useParams();
  const editingId = params.id ? Number(params.id) : undefined;
  const clientesQuery = useQuery({ queryKey: ["clientes"], queryFn: listClientes });
  const agentesQuery = useQuery({ queryKey: ["agentes"], queryFn: listAgentes });
  const serviciosQuery = useQuery({ queryKey: ["servicios"], queryFn: listServicios });
  const continentesQuery = useQuery({ queryKey: ["continentes"], queryFn: fetchContinentes });
  const cotizacionQuery = useQuery({
    queryKey: ["cotizacion", editingId],
    queryFn: () => getCotizacion(editingId!),
    enabled: Boolean(editingId)
  });

  const form = useForm<any>({
    resolver: zodResolver(cotizacionFormSchema),
    defaultValues: {
      monedaCodigo: "USD",
      presupuestoTipo: "TOTAL",
      adultos65: 0,
      adultos1964: 2,
      jovenes1218: 0,
      ninos311: 0,
      infantes02: 0,
      totalPasajeros: 2,
      items: [
        {
          idServicio: 0,
          fechaServicio: new Date().toISOString().slice(0, 10),
          ordenDia: 1,
          esOpcional: false,
          precioMonedaCodigo: "USD"
        }
      ]
    }
  });

  const itemArray = useFieldArray<any>({
    control: form.control,
    name: "items"
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
      const cotizacion = cotizacionQuery.data as any;
      form.reset({
        idCliente: cotizacion.cliente.id,
        idClienteAgente: cotizacion.clienteAgente?.id ?? null,
        nombreCotizacion: cotizacion.nombreCotizacion,
        fechaViajePrincipal: new Date(cotizacion.fechaViajePrincipal).toISOString().slice(0, 10),
        idDestinoPrincipal: cotizacion.destinoPrincipal?.id ?? null,
        categoriaViaje: cotizacion.categoriaViaje ?? "",
        monedaCodigo: cotizacion.monedaCodigo,
        presupuestoEstimado: cotizacion.presupuestoEstimado ? Number(cotizacion.presupuestoEstimado) : null,
        presupuestoTipo: cotizacion.presupuestoTipo ?? "TOTAL",
        comisionPctAplicada: cotizacion.comisionPctAplicada ? Number(cotizacion.comisionPctAplicada) : null,
        margenAplicadoValor: cotizacion.margenAplicadoValor ? Number(cotizacion.margenAplicadoValor) : null,
        adultos65: cotizacion.adultos65,
        adultos1964: cotizacion.adultos1964,
        jovenes1218: cotizacion.jovenes1218,
        ninos311: cotizacion.ninos311,
        infantes02: cotizacion.infantes02,
        totalPasajeros: cotizacion.totalPasajeros,
        nota: cotizacion.nota ?? "",
        items: cotizacion.items.map((item: any) => ({
          idServicio: item.servicio.id,
          fechaServicio: new Date(item.fechaServicio).toISOString().slice(0, 10),
          ordenDia: item.ordenDia,
          esOpcional: item.esOpcional,
          operadorMostrado: item.operadorMostrado ?? "",
          linkOperador: item.linkOperador ?? "",
          tituloOverride: item.tituloOverride ?? "",
          claseOverride: item.claseOverride ?? "",
          idiomaOverride: item.idiomaOverride ?? "",
          notaLinea: item.notaLinea ?? "",
          precioSugerido: item.precioSugerido ? Number(item.precioSugerido) : null,
          precioVenta: item.precioVenta ? Number(item.precioVenta) : null,
          precioMonedaCodigo: item.precioMonedaCodigo
        }))
      });
    }
  }, [cotizacionQuery.data, form]);

  const mutation = useMutation({
    mutationFn: (values: any) => saveCotizacion(values, editingId),
    onSuccess: (data: any) => navigate(`/cotizaciones/${data.id}`)
  });

  return (
    <PageSection
      action={
        <Link className="link-button" to="/cotizaciones">
          Volver
        </Link>
      }
      title={editingId ? "Editar cotización" : "Nueva cotización"}
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
            Nombre cotización
            <input {...form.register("nombreCotizacion")} />
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

        <PageSection
          action={
            <button
              className="link-button"
              onClick={() =>
                itemArray.append({
                  idServicio: 0,
                  fechaServicio: form.getValues("fechaViajePrincipal"),
                  ordenDia: itemArray.fields.length + 1,
                  esOpcional: false,
                  precioMonedaCodigo: form.getValues("monedaCodigo")
                })
              }
              type="button"
            >
              Añadir ítem
            </button>
          }
          title="Itinerario"
        >
          <div className="stack">
            {itemArray.fields.map((field, index) => (
              <div className="panel" key={field.id}>
                <div className="grid-3">
                  <label>
                    Servicio
                    <select {...form.register(`items.${index}.idServicio`)}>
                      <option value="">Selecciona</option>
                      {((serviciosQuery.data ?? []) as Array<any>).map((servicio) => (
                        <option key={servicio.id} value={servicio.id}>
                          {servicio.nombreWtravel}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Fecha servicio
                    <input {...form.register(`items.${index}.fechaServicio`)} type="date" />
                  </label>
                  <label>
                    Orden
                    <input {...form.register(`items.${index}.ordenDia`)} type="number" />
                  </label>
                  <label>
                    Precio sugerido
                    <input {...form.register(`items.${index}.precioSugerido`)} type="number" />
                  </label>
                  <label>
                    Precio venta
                    <input {...form.register(`items.${index}.precioVenta`)} type="number" />
                  </label>
                  <label>
                    Opcional
                    <input {...form.register(`items.${index}.esOpcional`)} type="checkbox" />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </PageSection>

        <button className="primary-button" type="submit">
          Guardar cotización
        </button>
      </form>
    </PageSection>
  );
}
