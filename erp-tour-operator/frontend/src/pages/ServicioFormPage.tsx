import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import { fetchCiudades, fetchContinentes, fetchPaises } from "@/core/catalog-api";
import { listProveedores } from "@/modules/proveedor/proveedor-api";
import {
  getServicio,
  listIdiomas,
  listPuntosTraslado,
  listTiposGuia,
  listTiposServicio,
  saveServicio,
  servicioFormSchema
} from "@/modules/servicio/servicio-api";
import { buildServicioCotizacionPreview } from "@/modules/servicio/servicio-preview";
import { ServicioFormView } from "@/pages/servicio/components/ServicioFormView";

function getServicioMutationErrorMessage(error: unknown, editingId?: number) {
  const apiError = error as any;

  const status = apiError?.response?.status;
  const code = apiError?.response?.data?.code;
  const backendMessage = apiError?.response?.data?.message;

  if (status === 409 || code === "SERVICIO_DUPLICATE") {
    return editingId
      ? "Ya existe otro servicio con ese nombre interno. Cambia el nombre o revisa el servicio existente."
      : "Ya existe un servicio con ese nombre interno. Revisa si ya está creado o cambia el nombre.";
  }

  if (backendMessage) {
    return backendMessage;
  }

  return "No se pudo guardar el servicio. Revisa los datos e inténtalo nuevamente.";
}

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

  const continentesQuery = useQuery({
    queryKey: ["continentes"],
    queryFn: fetchContinentes
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
      tiempoServicio: "",
      privado: false,
      activo: true,
      idContinente: null,
      idPais: null
    }
  });

  const tipoSeleccionado = Number(form.watch("idTipo") || 0);
  const tipoActual = (tiposQuery.data ?? []).find((item) => item.id === tipoSeleccionado);

  const idContinente = form.watch("idContinente");
  const idPais = form.watch("idPais");
  const idCiudad = form.watch("idCiudad");

  const nombreWtravel = form.watch("nombreWtravel");
  const tiempoServicio = form.watch("tiempoServicio");
  const privado = form.watch("privado");

  const tourIdTipoGuia = form.watch("tour.idTipoGuia");
  const tourIdIdioma = form.watch("tour.idIdioma");

  const trasladoIdOrigen = form.watch("traslado.idOrigen");
  const trasladoIdDestino = form.watch("traslado.idDestino");
  const trasladoNuevoOrigen = form.watch("traslado.nuevoOrigen");
  const trasladoNuevoDestino = form.watch("traslado.nuevoDestino");

  const paisesQuery = useQuery({
    queryKey: ["paises", idContinente],
    queryFn: () => fetchPaises(idContinente ? Number(idContinente) : undefined),
    enabled: Boolean(idContinente)
  });

  const ciudadesQuery = useQuery({
    queryKey: ["ciudades", idPais],
    queryFn: () => fetchCiudades(idPais ? Number(idPais) : undefined),
    enabled: Boolean(idPais)
  });

  const puntosTrasladoQuery = useQuery({
    queryKey: ["puntos-traslado", idCiudad],
    queryFn: () => listPuntosTraslado(Number(idCiudad)),
    enabled: Boolean(idCiudad) && tipoActual?.codigo === "TRASLADO"
  });

  const tipoGuiaSeleccionado = (tiposGuiaQuery.data ?? []).find(
    (item) => item.id === Number(tourIdTipoGuia)
  );

  const idiomaSeleccionado = (idiomasQuery.data ?? []).find(
    (item) => item.id === Number(tourIdIdioma)
  );

  const origenSeleccionado = (puntosTrasladoQuery.data ?? []).find(
    (item) => item.id === Number(trasladoIdOrigen)
  );

  const destinoSeleccionado = (puntosTrasladoQuery.data ?? []).find(
    (item) => item.id === Number(trasladoIdDestino)
  );

  useEffect(() => {
    if (servicioQuery.data) {
      const servicio = servicioQuery.data as any;
      const detalle = servicio.detalleTipo ?? {};

      form.reset({
        idTipo: servicio.tipo.id,
        idProveedor: servicio.proveedor.id,
        idContinente: servicio.ciudad?.pais?.continente?.id ?? null,
        idPais: servicio.ciudad?.pais?.id ?? null,
        idCiudad: servicio.ciudad.id,
        nombreWtravel: servicio.nombreWtravel,
        tiempoServicio: servicio.tiempoServicio ?? "",
        privado: servicio.privado,
        descripcion: servicio.descripcion ?? "",
        linkReserva: servicio.linkReserva ?? "",
        activo: servicio.activo,

        alojamiento: "noches" in detalle ? detalle : undefined,

        tour:
          "idTipoGuia" in detalle && "idIdioma" in detalle
            ? {
                idTipoGuia: detalle.idTipoGuia,
                idIdioma: detalle.idIdioma
              }
            : undefined,

        traslado:
          "idOrigen" in detalle && "idDestino" in detalle
            ? {
                idOrigen: detalle.idOrigen,
                idDestino: detalle.idDestino,
                nuevoOrigen: null,
                nuevoDestino: null,
                escalas: detalle.escalas ?? 0,
                vehiculo: detalle.vehiculo ?? ""
              }
            : undefined,

        tren: "sillasReservadas" in detalle ? detalle : undefined,

        vuelo: "equipaje" in detalle && !("sillasReservadas" in detalle) ? detalle : undefined
      });
    }
  }, [form, servicioQuery.data]);

  useEffect(() => {
    form.setValue("idPais", null);
    form.setValue("idCiudad", null);

    if (tipoActual?.codigo === "TRASLADO") {
      form.setValue("traslado.idOrigen", null);
      form.setValue("traslado.idDestino", null);
    }
  }, [idContinente, form, tipoActual?.codigo]);

  useEffect(() => {
    form.setValue("idCiudad", null);

    if (tipoActual?.codigo === "TRASLADO") {
      form.setValue("traslado.idOrigen", null);
      form.setValue("traslado.idDestino", null);
    }
  }, [idPais, form, tipoActual?.codigo]);

  useEffect(() => {
    if (tipoActual?.codigo === "TRASLADO") {
      form.setValue("traslado.idOrigen", null);
      form.setValue("traslado.idDestino", null);
    }
  }, [idCiudad, form, tipoActual?.codigo]);

  const mutation = useMutation({
    mutationFn: (values: any) => {
      const payload = { ...values };

      if (tipoActual?.codigo === "TRASLADO" || tipoActual?.codigo === "ENTRADA") {
        payload.tiempoServicio = null;
      }

      if (tipoActual?.codigo === "ENTRADA") {
        payload.privado = false;
        delete payload.boletoEntrada;
      }

      return saveServicio(payload, editingId);
    },
    onSuccess: (data: any) => navigate(`/servicios/${data.id}`)
  });

  const origenPreview = trasladoNuevoOrigen?.trim() || origenSeleccionado?.nombre || null;

  const destinoPreview = trasladoNuevoDestino?.trim() || destinoSeleccionado?.nombre || null;

  const preview = buildServicioCotizacionPreview({
    tipoCodigo: tipoActual?.codigo,
    nombreWtravel,
    tiempoServicio,
    privado,
    tipoGuiaNombre: tipoGuiaSeleccionado?.nombre,
    idiomaNombre: idiomaSeleccionado?.nombre,
    origenNombre: origenPreview,
    destinoNombre: destinoPreview
  });

  const errorMessage = mutation.isError
    ? getServicioMutationErrorMessage(mutation.error, editingId)
    : null;

  return (
    <ServicioFormView
      form={form}
      editingId={editingId}
      tiposQuery={tiposQuery}
      proveedoresQuery={proveedoresQuery}
      continentesQuery={continentesQuery}
      paisesQuery={paisesQuery}
      ciudadesQuery={ciudadesQuery}
      idiomasQuery={idiomasQuery}
      tiposGuiaQuery={tiposGuiaQuery}
      puntosTrasladoQuery={puntosTrasladoQuery}
      tipoActual={tipoActual}
      privado={privado}
      idContinente={idContinente}
      idPais={idPais}
      idCiudad={idCiudad}
      trasladoIdOrigen={trasladoIdOrigen}
      trasladoIdDestino={trasladoIdDestino}
      preview={preview}
      errorMessage={errorMessage}
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
    />
  );
}