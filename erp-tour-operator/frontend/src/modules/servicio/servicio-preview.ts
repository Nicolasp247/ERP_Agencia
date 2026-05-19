export type ServicioCotizacionPreviewInput = {
  tipoCodigo?: string | null;
  nombreWtravel?: string | null;
  tiempoServicio?: string | null;
  privado?: boolean | null;

  tipoGuiaNombre?: string | null;
  idiomaNombre?: string | null;

  origenNombre?: string | null;
  destinoNombre?: string | null;

  vueloOrigen?: string | null;
  vueloDestino?: string | null;
  vueloEscalas?: number | string | null;
  vueloClase?: string | null;
  vueloEquipaje?: string | null;

  trenOrigen?: string | null;
  trenDestino?: string | null;
  trenEscalas?: number | string | null;
  trenClase?: string | null;
  trenSillasReservadas?: boolean | null;
};

function limpiarTexto(value?: string | null) {
  return value?.trim() || "";
}

function getTextoEscalas(value?: number | string | null) {
  const escalas = Number(value ?? 0);

  if (!Number.isFinite(escalas) || escalas <= 0) {
    return "directo";
  }

  if (escalas === 1) {
    return "con 1 escala";
  }

  return `con ${escalas} escalas`;
}

function getTextoConexionesTren(value?: number | string | null) {
  const conexiones = Number(value ?? 0);

  if (!Number.isFinite(conexiones) || conexiones <= 0) {
    return "directo";
  }

  if (conexiones === 1) {
    return "con 1 conexión";
  }

  return `con ${conexiones} conexiones`;
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
    const tipoTransporte = data.privado ? "individual" : "compartido";

    return `Transporte ${tipoTransporte} ${origen} a ${destino}`;
  }

  if (tipoCodigo === "VUELO") {
    const origen = limpiarTexto(data.vueloOrigen) || "origen";
    const destino = limpiarTexto(data.vueloDestino) || "destino";
    const textoEscalas = getTextoEscalas(data.vueloEscalas);
    const clase = limpiarTexto(data.vueloClase);
    const equipaje = limpiarTexto(data.vueloEquipaje);

    const partes = [`Vuelo ${textoEscalas} ${origen} - ${destino}`];

    if (clase) {
      partes.push(clase);
    }

    if (equipaje) {
      partes.push(equipaje);
    }

    return partes.join(", ");
  }

  if (tipoCodigo === "TREN") {
    const origen = limpiarTexto(data.trenOrigen) || "origen";
    const destino = limpiarTexto(data.trenDestino) || "destino";
    const textoConexiones = getTextoConexionesTren(data.trenEscalas);
    const clase = limpiarTexto(data.trenClase);

    const partes = [`Tren ${textoConexiones} ${origen} - ${destino}`];

    if (clase) {
      partes.push(clase);
    }

    if (data.trenSillasReservadas) {
      partes.push("sillas reservadas");
    }

    return partes.join(", ");
  }

  if (tipoCodigo === "OTRO") {
    return nombre;
  }

  const partesGenericas = [nombre];

  if (tiempo) {
    partesGenericas.push(tiempo);
  }

  return partesGenericas.join(", ");
}