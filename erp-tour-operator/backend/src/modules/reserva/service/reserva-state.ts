import { ReservaItemEstado } from "@prisma/client";

import type { ReservaEstadoCalculado } from "@/modules/reserva/types/reserva.types";

export function buildReservaCode(cotizacionId: number, date = new Date()) {
  return `RES-${date.getUTCFullYear()}-${cotizacionId}`;
}

export function calculateReservaEstado(
  items: Array<{ esOpcional: boolean; estadoItem: ReservaItemEstado; numeroConfirmacion: string | null }>,
  isCanceled: boolean
): ReservaEstadoCalculado {
  if (isCanceled) {
    return "CANCELADA";
  }

  const obligatorios = items.filter((item) => !item.esOpcional);

  if (obligatorios.length === 0) {
    return "PENDIENTE";
  }

  const confirmados = obligatorios.filter(
    (item) => item.estadoItem === ReservaItemEstado.CONFIRMADO || Boolean(item.numeroConfirmacion)
  );

  if (confirmados.length === 0) {
    return "PENDIENTE";
  }

  if (confirmados.length < obligatorios.length) {
    return "PARCIALMENTE_CONFIRMADA";
  }

  return "CONFIRMADA";
}

export function resolveSnapshotTitle(
  item: {
    tituloOverride: string | null;
    servicio: {
      nombreWtravel: string;
    };
  }
) {
  return item.tituloOverride ?? item.servicio.nombreWtravel;
}

export function resolveSnapshotIdioma(
  item: {
    idiomaOverride: string | null;
    servicio: {
      tour: { idioma: string } | null;
      boletoEntrada: { idioma: string | null } | null;
    };
  }
) {
  return item.idiomaOverride ?? item.servicio.tour?.idioma ?? item.servicio.boletoEntrada?.idioma ?? null;
}

export function resolveSnapshotClase(
  item: {
    claseOverride: string | null;
    servicio: {
      tren: { clase: string } | null;
      vuelo: { clase: string } | null;
    };
  }
) {
  return item.claseOverride ?? item.servicio.tren?.clase ?? item.servicio.vuelo?.clase ?? null;
}
