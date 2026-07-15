/* erp-tour-operator/backend/src/modules/servicio/helpers/servicio-display.helper.ts */

type ServicioDisplayInput = {
  nombreWtravel?: string | null;
  tiempoServicio?: string | null;
  privado?: boolean | null;

  tipo?: {
    codigo?: string | null;
    nombre?: string | null;
  } | null;

  tour?: {
    tipoGuia?: {
      nombre?: string | null;
    } | null;
    idioma?: {
      nombre?: string | null;
    } | null;
  } | null;

  traslado?: {
    origen?: {
      nombre?: string | null;
    } | null;
    destino?: {
      nombre?: string | null;
    } | null;
    escalas?: number | null;
    vehiculo?: string | null;
  } | null;

  tren?: {
    origen?: string | null;
    destino?: string | null;
    escalas?: number | null;
    clase?: string | null;
    sillasReservadas?: boolean | null;
    equipaje?: string | null;
  } | null;

  vuelo?: {
    origen?: string | null;
    destino?: string | null;
    escalas?: number | null;
    clase?: string | null;
    equipaje?: string | null;
  } | null;
};

function cleanText(value: unknown) {
  const text = String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");

  return text || null;
}

function cleanTrasladoPointName(value: unknown) {
  const text = cleanText(value);

  if (!text) {
    return null;
  }

  return text
    .replace(/\s*[-–—]\s*\d{1,2}\/\d{1,2}\/\d{4}\s*$/u, "")
    .trim();
}

function joinParts(parts: Array<string | null | undefined>) {
  return parts
    .map(cleanText)
    .filter((part): part is string => Boolean(part))
    .join(", ");
}

function getTipoCodigo(servicio: ServicioDisplayInput) {
  return String(servicio.tipo?.codigo ?? "")
    .trim()
    .toUpperCase();
}

function formatEscalasVuelo(value?: number | null) {
  const escalas = Number(value ?? 0);

  if (escalas <= 0) {
    return "directo";
  }

  if (escalas === 1) {
    return "1 escala";
  }

  return `${escalas} escalas`;
}

function formatConexionesTren(value?: number | null) {
  const conexiones = Number(value ?? 0);

  if (conexiones <= 0) {
    return "directo";
  }

  if (conexiones === 1) {
    return "1 conexión";
  }

  return `${conexiones} conexiones`;
}

function buildTourDisplay(servicio: ServicioDisplayInput) {
  const tipoCodigo = getTipoCodigo(servicio);
  const nombre = cleanText(servicio.nombreWtravel) ?? "Servicio sin nombre";
  const duracion = cleanText(servicio.tiempoServicio);

  const modalidad =
    tipoCodigo === "ENTRADA"
      ? null
      : servicio.privado
        ? "privado"
        : "en grupo";

  const tipoGuia = cleanText(servicio.tour?.tipoGuia?.nombre);
  const idioma = cleanText(servicio.tour?.idioma?.nombre);

  const guiaIdioma =
    tipoGuia && idioma
      ? `${tipoGuia} en ${idioma}`
      : tipoGuia || idioma;

  return joinParts([
    nombre,
    modalidad,
    duracion,
    guiaIdioma
  ]);
}

function buildTrasladoDisplay(servicio: ServicioDisplayInput) {
  const nombre = cleanText(servicio.nombreWtravel);
  const origen = cleanTrasladoPointName(servicio.traslado?.origen?.nombre);
  const destino = cleanTrasladoPointName(servicio.traslado?.destino?.nombre);

  const trayecto =
    origen && destino
      ? `Trasporte ${servicio.privado ? "individual" : "compartido"} de ${origen} a ${destino}`
      : nombre ?? "Traslado";

  return joinParts([
    trayecto
    ]);
}

function buildTrenDisplay(servicio: ServicioDisplayInput) {
  const tren = servicio.tren;
  const origen = cleanText(tren?.origen);
  const destino = cleanText(tren?.destino);

  const trayecto =
    origen && destino
      ? `Tren ${origen} a ${destino}`
      : cleanText(servicio.nombreWtravel) ?? "Tren";

  return joinParts([
    trayecto,
    formatConexionesTren(tren?.escalas),
    cleanText(tren?.clase),
    tren?.sillasReservadas ? "sillas reservadas" : "sin sillas reservadas",
    cleanText(tren?.equipaje)
  ]);
}

function buildVueloDisplay(servicio: ServicioDisplayInput) {
  const vuelo = servicio.vuelo;
  const origen = cleanText(vuelo?.origen);
  const destino = cleanText(vuelo?.destino);

  const trayecto =
    origen && destino
      ? `Vuelo ${origen} a ${destino}`
      : cleanText(servicio.nombreWtravel) ?? "Vuelo";

  return joinParts([
    trayecto,
    formatEscalasVuelo(vuelo?.escalas),
    cleanText(vuelo?.clase),
    cleanText(vuelo?.equipaje)
  ]);
}

/**
 * Construye el texto comercial que se muestra en cotizaciones y confirmaciones.
 *
 * Alojamiento se construye aparte porque depende de datos propios del item:
 * noches, habitaciones, categoría y régimen seleccionados en la cotización.
 */
export function buildServicioCotizacionTexto(
  servicio: ServicioDisplayInput | null | undefined
) {
  if (!servicio) {
    return "Servicio sin nombre";
  }

  const tipoCodigo = getTipoCodigo(servicio);

  switch (tipoCodigo) {
    case "VISITA":
    case "EXCURSION":
    case "ENTRADA":
      return buildTourDisplay(servicio);

    case "TRASLADO":
      return buildTrasladoDisplay(servicio);

    case "TREN":
      return buildTrenDisplay(servicio);

    case "VUELO":
      return buildVueloDisplay(servicio);

    case "ALOJAMIENTO":
    case "OTRO":
    default:
      return cleanText(servicio.nombreWtravel) ?? "Servicio sin nombre";
  }
}