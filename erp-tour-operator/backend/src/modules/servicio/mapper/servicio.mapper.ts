export function toTipoServicioListItem(record: {
  id: number;
  nombre: string;
  codigo: string | null;
  activo: boolean;
}) {
  return record;
}

export function toServicioListItem(
  record: {
    id: number;
    nombreWtravel: string;
    activo: boolean;
    tipo: { nombre: string };
    proveedor: { nombreComercial: string };
    ciudad: { nombre: string; pais: { nombre: string } | null };
    tarifas: Array<{ precioUsd: { toString(): string } | null; monedaCodigo: string }>;
  }
) {
  const tarifa = record.tarifas[0];

  return {
    id: record.id,
    nombreWtravel: record.nombreWtravel,
    tipo: record.tipo.nombre,
    proveedor: record.proveedor.nombreComercial,
    ciudad: record.ciudad.nombre,
    pais: record.ciudad.pais?.nombre ?? null,
    precioBase: tarifa?.precioUsd?.toString() ?? null,
    monedaCodigo: tarifa?.monedaCodigo ?? null,
    activo: record.activo
  };
}

export function toServicioDetail(
  record: {
    id: number;
    nombreWtravel: string;
    tiempoServicio: string | null;
    privado: boolean;
    descripcion: string | null;
    linkReserva: string | null;
    activo: boolean;
    tipo: { id: number; nombre: string; codigo: string | null };
    proveedor: { id: number; nombreComercial: string };
    ciudad: {
      id: number;
      nombre: string;
      pais: {
        id: number;
        nombre: string;
        continente?: {
          id: number;
          nombre: string;
        } | null;
      } | null;
    };
    alojamiento: unknown;
    tour: unknown;
    traslado: unknown;
    tren: unknown;
    vuelo: unknown;
    tarifas?: Array<{
      anio: number;
      mes: number;
      tipoHabitacion: string;
      precioUsd: { toString(): string } | null;
      monedaCodigo: string;
      activo: boolean;
    }>;
  }
) {
  return {
    id: record.id,
    nombreWtravel: record.nombreWtravel,
    tiempoServicio: record.tiempoServicio,
    privado: record.privado,
    descripcion: record.descripcion,
    linkReserva: record.linkReserva,
    activo: record.activo,
    tipo: record.tipo,
    proveedor: record.proveedor,
    ciudad: record.ciudad,
    pais: record.ciudad.pais,
    detalleTipo: record.alojamiento
      ? record.alojamiento
      : record.tour
      ? {
          id: (record.tour as any).id,
          idServicio: (record.tour as any).idServicio,
          idTipoGuia: (record.tour as any).idTipoGuia,
          idIdioma: (record.tour as any).idIdioma,
          tipoGuiaNombre: (record.tour as any).tipoGuia?.nombre ?? null,
          idiomaNombre: (record.tour as any).idioma?.nombre ?? null
        }
      : record.traslado
      ? {
          id: (record.traslado as any).id,
          idServicio: (record.traslado as any).idServicio,
          idOrigen: (record.traslado as any).idOrigen ?? null,
          idDestino: (record.traslado as any).idDestino ?? null,
          origen: (record.traslado as any).origen ?? null,
          destino: (record.traslado as any).destino ?? null,
          origenNombre: (record.traslado as any).origen?.nombre ?? null,
          destinoNombre: (record.traslado as any).destino?.nombre ?? null,
          escalas: (record.traslado as any).escalas ?? 0,
          vehiculo: (record.traslado as any).vehiculo ?? null
        }
      : record.tren
      ? record.tren
      : record.vuelo,
    tarifas: (record.tarifas ?? []).map((item) => ({
      ...item,
      precioUsd: item.precioUsd?.toString() ?? null
    }))
  };
}