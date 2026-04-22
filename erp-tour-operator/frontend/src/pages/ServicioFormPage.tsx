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
  listIdiomas,
  listTiposGuia,
  listTiposServicio,
  saveServicio,
  servicioFormSchema
} from "@/modules/servicio/servicio-api";

export function ServicioFormPage() {
  const navigate = useNavigate();
  const params = useParams();
  const editingId = params.id ? Number(params.id) : undefined;

  const tiposQuery = useQuery({
    queryKey: ["tipos-servicio"],
    queryFn: listTiposServicio
  });

  const proveedoresQuery = useQuery({
    queryKey: ["proveedores"],
    queryFn: listProveedores
  });

  const ciudadesQuery = useQuery({
    queryKey: ["ciudades"],
    queryFn: () => fetchCiudades()
  });

  const idiomasQuery = useQuery({
    queryKey: ["idiomas-servicio"],
    queryFn: listIdiomas
  });

  const tiposGuiaQuery = useQuery({
    queryKey: ["tipos-guia-servicio"],
    queryFn: listTiposGuia
  });

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

  const nombreWtravel = form.watch("nombreWtravel");
  const tiempoServicio = form.watch("tiempoServicio");
  const privado = form.watch("privado");
  const tourIdTipoGuia = form.watch("tour.idTipoGuia");
  const tourIdIdioma = form.watch("tour.idIdioma");

  const tipoGuiaSeleccionado = (tiposGuiaQuery.data ?? []).find(
    (item) => item.id === Number(tourIdTipoGuia)
  );

  const idiomaSeleccionado = (idiomasQuery.data ?? []).find(
    (item) => item.id === Number(tourIdIdioma)
  );

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
        tour:
          "idTipoGuia" in detalle && "idIdioma" in detalle
            ? {
                idTipoGuia: detalle.idTipoGuia,
                idIdioma: detalle.idIdioma
              }
            : undefined,
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

  function formatTipoGuiaNombre(nombre?: string | null) {
    if (!nombre) {
      return "";
    }

    if (nombre === "GUIA") {
      return "Guía";
    }

    if (nombre === "AUDIOGUIA") {
      return "Audioguía";
    }

    return nombre;
  }

  function formatIdiomaNombre(nombre?: string | null) {
    if (!nombre) {
      return "";
    }

    const normalizado = nombre.toLowerCase();

    if (normalizado === "espanol" || normalizado === "español") {
      return "español";
    }

    return normalizado;
  }

  function buildServicioPreview() {
    const nombre = nombreWtravel?.trim() || "Nombre del servicio";
    const tiempo = tiempoServicio?.trim();
    const tipoCodigo = tipoActual?.codigo;

    if (tipoCodigo === "VISITA" || tipoCodigo === "EXCURSION") {
      const partes = [nombre];

      if (tiempo) {
        partes.push(tiempo);
      }

      partes.push(privado ? "privado" : "en grupo");

      const tipoGuiaTexto = formatTipoGuiaNombre(tipoGuiaSeleccionado?.nombre).toLowerCase();
      const idiomaTexto = formatIdiomaNombre(idiomaSeleccionado?.nombre);

      if (tipoGuiaTexto && idiomaTexto) {
        partes.push(`${tipoGuiaTexto} en ${idiomaTexto}`);
      } else if (tipoGuiaTexto) {
        partes.push(tipoGuiaTexto);
      } else if (idiomaTexto) {
        partes.push(`en ${idiomaTexto}`);
      }

      return partes.join(", ");
    }

    const partesGenericas = [nombre];

    if (tiempo) {
      partesGenericas.push(tiempo);
    }

    return partesGenericas.join(", ");
  }

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

        {(tipoActual?.codigo === "VISITA" || tipoActual?.codigo === "EXCURSION") ? (
          <>
            <div className="grid-2">
              <label>
                Tipo guía
                <select {...form.register("tour.idTipoGuia")}>
                  <option value="">Selecciona</option>
                  {(tiposGuiaQuery.data ?? []).map((item) => (
                    <option key={item.id} value={item.id}>
                      {formatTipoGuiaNombre(item.nombre)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Idioma
                <select {...form.register("tour.idIdioma")}>
                  <option value="">Selecciona</option>
                  {(idiomasQuery.data ?? []).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div
              style={{
                marginTop: "0.35rem",
                marginBottom: "0.8rem",
                border: "1px solid #d8d2c2",
                borderRadius: "12px",
                padding: "0.9rem 1rem",
                background: "#f8f6ef"
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  alignItems: "center",
                  gap: "1rem"
                }}
              >
                <div>
                  <strong>Servicio privado</strong>
                  <p style={{ margin: "0.25rem 0 0", fontSize: "0.92rem", opacity: 0.8 }}>
                    Márcalo si esta visita o excursión se cotiza de forma exclusiva. Si no está
                    marcado, se mostrará como servicio en grupo.
                  </p>
                </div>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.65rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap"
                  }}
                >
                  <input
                    type="checkbox"
                    {...form.register("privado")}
                    style={{
                      width: "18px",
                      height: "18px",
                      cursor: "pointer"
                    }}
                  />
                  <span>{privado ? "Privado" : "En grupo"}</span>
                </label>
              </div>
            </div>
          </>
        ) : null}

        <label>
          Descripción
          <textarea {...form.register("descripcion")} rows={3} />
        </label>

        <div style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>
          <strong>Así se verá en cotizaciones:</strong>
          <p style={{ marginTop: "0.35rem", fontWeight: 700 }}>{buildServicioPreview()}</p>
        </div>

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