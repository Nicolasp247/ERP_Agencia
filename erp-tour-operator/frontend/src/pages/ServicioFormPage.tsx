import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";

import { fetchCiudades } from "@/core/catalog-api";
import { PageSection } from "@/components/PageSection";
import { listProveedores } from "@/modules/proveedor/proveedor-api";
import {
  getServicio,
  listTiposServicio,
  saveServicio,
  servicioFormSchema
} from "@/modules/servicio/servicio-api";

export function ServicioFormPage() {
  const navigate = useNavigate();
  const params = useParams();
  const editingId = params.id ? Number(params.id) : undefined;
  const tiposQuery = useQuery({ queryKey: ["tipos-servicio"], queryFn: listTiposServicio });
  const proveedoresQuery = useQuery({ queryKey: ["proveedores"], queryFn: listProveedores });
  const ciudadesQuery = useQuery({ queryKey: ["ciudades"], queryFn: () => fetchCiudades() });
  const servicioQuery = useQuery({
    queryKey: ["servicio", editingId],
    queryFn: () => getServicio(editingId!),
    enabled: Boolean(editingId)
  });

  const form = useForm<any>({
    resolver: zodResolver(servicioFormSchema),
    defaultValues: {
      nombreWtravel: "",
      privado: false,
      activo: true
    }
  });

  const tipoSeleccionado = Number(form.watch("idTipo") || 0);
  const tipoActual = (tiposQuery.data ?? []).find((item) => item.id === tipoSeleccionado);

  useEffect(() => {
    if (servicioQuery.data) {
      const servicio = servicioQuery.data as any;
      const detalle = servicio.detalleTipo ?? {};
      form.reset({
        idTipo: servicio.tipo.id,
        idProveedor: servicio.proveedor.id,
        idCiudad: servicio.ciudad.id,
        nombreWtravel: servicio.nombreWtravel,
        tiempoServicio: servicio.tiempoServicio ?? "",
        privado: servicio.privado,
        descripcion: servicio.descripcion ?? "",
        linkReserva: servicio.linkReserva ?? "",
        activo: servicio.activo,
        alojamiento: "noches" in detalle ? detalle : undefined,
        boletoEntrada: "boletoEntrada" in detalle ? detalle : undefined,
        tour: "tipoGuia" in detalle && "idioma" in detalle ? detalle : undefined,
        traslado: "vehiculo" in detalle ? detalle : undefined,
        tren: "sillasReservadas" in detalle ? detalle : undefined,
        vuelo: "equipaje" in detalle && !("sillasReservadas" in detalle) ? detalle : undefined
      });
    }
  }, [form, servicioQuery.data]);

  const mutation = useMutation({
    mutationFn: (values: any) => saveServicio(values, editingId),
    onSuccess: (data: any) => navigate(`/servicios/${data.id}`)
  });

  return (
    <PageSection
      action={
        <Link className="link-button" to="/servicios">
          Volver
        </Link>
      }
      title={editingId ? "Editar servicio" : "Nuevo servicio"}
    >
      <form className="stack" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <div className="grid-2">
          <label>
            Tipo
            <select {...form.register("idTipo")}>
              <option value="">Selecciona</option>
              {(tiposQuery.data ?? []).map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
          </label>
          <label>
            Proveedor
            <select {...form.register("idProveedor")}>
              <option value="">Selecciona</option>
              {((proveedoresQuery.data ?? []) as Array<any>).map((proveedor) => (
                <option key={proveedor.id} value={proveedor.id}>
                  {proveedor.nombreComercial}
                </option>
              ))}
            </select>
          </label>
          <label>
            Ciudad
            <select {...form.register("idCiudad")}>
              <option value="">Selecciona</option>
              {(ciudadesQuery.data ?? []).map((ciudad) => (
                <option key={ciudad.id} value={ciudad.id}>
                  {ciudad.nombre}
                </option>
              ))}
            </select>
          </label>
          <label>
            Nombre interno
            <input {...form.register("nombreWtravel")} />
          </label>
          <label>
            Tiempo de servicio
            <input {...form.register("tiempoServicio")} />
          </label>
          <label>
            Link de reserva
            <input {...form.register("linkReserva")} />
          </label>
        </div>

        <label>
          Descripción
          <textarea {...form.register("descripcion")} rows={3} />
        </label>

        {tipoActual?.codigo === "ALOJAMIENTO" ? (
          <div className="grid-2">
            <label>
              Noches
              <input {...form.register("alojamiento.noches")} type="number" />
            </label>
            <label>
              Habitaciones
              <input {...form.register("alojamiento.habitaciones")} type="number" />
            </label>
          </div>
        ) : null}

        {tipoActual?.codigo === "VISITA" || tipoActual?.codigo === "EXCURSION" ? (
          <div className="grid-2">
            <label>
              Tipo guía
              <select {...form.register("tour.tipoGuia")}>
                <option value="GUIA">Guía</option>
                <option value="AUDIOGUIA">Audioguía</option>
              </select>
            </label>
            <label>
              Idioma
              <input {...form.register("tour.idioma")} />
            </label>
          </div>
        ) : null}

        {tipoActual?.codigo === "TRASLADO" ? (
          <div className="grid-2">
            <label>
              Origen
              <input {...form.register("traslado.origen")} />
            </label>
            <label>
              Destino
              <input {...form.register("traslado.destino")} />
            </label>
          </div>
        ) : null}

        <button className="primary-button" type="submit">
          Guardar
        </button>
      </form>
    </PageSection>
  );
}
