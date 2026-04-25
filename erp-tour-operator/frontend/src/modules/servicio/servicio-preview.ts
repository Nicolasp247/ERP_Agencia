export type ServicioCotizacionPreviewInput = {
  tipoCodigo?: string | null;
  nombreWtravel?: string | null;
  tiempoServicio?: string | null;
  privado?: boolean | null;

  tipoGuiaNombre?: string | null;
  idiomaNombre?: string | null;

  origenNombre?: string | null;
  destinoNombre?: string | null;

  tipoEntrada?: string | null;
  tipoEntradaOtro?: string | null;
};

function limpiarTexto(value?: string | null) {
  return value?.trim() || "";
}

function getTipoEntradaTexto(tipoEntrada?: string | null, tipoEntradaOtro?: string | null) {
  const tipo = limpiarTexto(tipoEntrada).toUpperCase();

  if (tipo === "PRIORITARIA") {
    return "Entrada prioritaria";
  }

  if (tipo === "OTRA") {
    return limpiarTexto(tipoEntradaOtro) || "Entrada";
  }

  return "Entrada general";
}

export function buildServicioCotizacionPreview(data: ServicioCotizacionPreviewInput) {
  const tipoCodigo = data.tipoCodigo ?? "";
  const nombre = limpiarTexto(data.nombreWtravel) || "Nombre del servicio";
  const tiempo = limpiarTexto(data.tiempoServicio);

  if (tipoCodigo === "VISITA" || tipoCodigo === "EXCURSION") {
    const partes = [nombre];

    if (tiempo) {
      partes.push(tiempo);
    }

    partes.push(data.privado ? "privado" : "en grupo");

    const tipoGuiaTexto = limpiarTexto(data.tipoGuiaNombre);
    const idiomaTexto = limpiarTexto(data.idiomaNombre);

    if (tipoGuiaTexto && idiomaTexto) {
      partes.push(`${tipoGuiaTexto} en ${idiomaTexto}`);
    } else if (tipoGuiaTexto) {
      partes.push(tipoGuiaTexto);
    } else if (idiomaTexto) {
      partes.push(`en ${idiomaTexto}`);
    }

    return partes.join(", ");
  }

  if (tipoCodigo === "ENTRADA") {
    const partes = [nombre];

    const tipoGuiaTexto = limpiarTexto(data.tipoGuiaNombre);
    const idiomaTexto = limpiarTexto(data.idiomaNombre);

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
    const origen = limpiarTexto(data.origenNombre) || "origen";
    const destino = limpiarTexto(data.destinoNombre) || "destino";

    return `Traslado${data.privado ? " privado" : ""} ${origen} - ${destino}`;
  }

  const partesGenericas = [nombre];

  if (tiempo) {
    partesGenericas.push(tiempo);
  }

  return partesGenericas.join(", ");
}