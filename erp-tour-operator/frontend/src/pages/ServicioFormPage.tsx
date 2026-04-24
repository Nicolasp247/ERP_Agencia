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
import { ServicioFormView } from "@/pages/servicio/components/ServicioFormView";
import { NUEVO_PUNTO_OPTION } from "@/modules/servicio/servicio-api";

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
        boletoEntrada: "boletoEntrada" in detalle ? detalle : undefined,
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
  }, [idContinente]);

  useEffect(() => {
    form.setValue("idCiudad", null);

    if (tipoActual?.codigo === "TRASLADO") {
      form.setValue("traslado.idOrigen", null);
      form.setValue("traslado.idDestino", null);
    }
  }, [idPais]);

  useEffect(() => {
    if (tipoActual?.codigo === "TRASLADO") {
      form.setValue("traslado.idOrigen", null);
      form.setValue("traslado.idDestino", null);
    }
  }, [idCiudad]);

  const mutation = useMutation({
    mutationFn: (values: any) => {
      const payload = { ...values };

      if (tipoActual?.codigo === "TRASLADO") {
        payload.tiempoServicio = null;
      }

      return saveServicio(payload, editingId);
    },
    onSuccess: (data: any) => navigate(`/servicios/${data.id}`)
  });

  function formatTipoGuiaNombre(nombre?: string | null) {
    return nombre || "";
  }

  function formatIdiomaNombre(nombre?: string | null) {
    return nombre ? nombre.toLowerCase() : "";
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

    if (tipoCodigo === "TRASLADO") {
      const origen =
        trasladoNuevoOrigen?.trim() ||
        origenSeleccionado?.nombre ||
        "origen";

      const destino =
        trasladoNuevoDestino?.trim() ||
        destinoSeleccionado?.nombre ||
        "destino";

      return `Traslado${privado ? " privado" : ""} ${origen} - ${destino}`;
    }

    const partesGenericas = [nombre];

    if (tiempo) {
      partesGenericas.push(tiempo);
    }

    return partesGenericas.join(", ");
  }

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
      preview={buildServicioPreview()}
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
    />
  );
}