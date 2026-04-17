import { ReservaItemEstado } from "@prisma/client";

import {
  resolveSnapshotClase,
  resolveSnapshotIdioma,
  resolveSnapshotTitle
} from "@/modules/reserva/service/reserva-state";

type CotizacionItemForSnapshot = {
  id: number;
  idServicio: number;
  fechaServicio: Date;
  ordenDia: number;
  esOpcional: boolean;
  tituloOverride: string | null;
  idiomaOverride: string | null;
  claseOverride: string | null;
  notaLinea: string | null;
  precioSugerido: { toString(): string } | null;
  precioMonedaCodigo: string;
  servicio: {
    nombreWtravel: string;
    tour: { idioma: string } | null;
    boletoEntrada: { idioma: string | null } | null;
    tren: { clase: string } | null;
    vuelo: { clase: string } | null;
  };
};

export function buildReservaItemSnapshot(item: CotizacionItemForSnapshot) {
  return {
    idCotizacionItemOrigen: item.id,
    idServicio: item.idServicio,
    fechaServicio: item.fechaServicio,
    ordenDia: item.ordenDia,
    esOpcional: item.esOpcional,
    tituloSnapshot: resolveSnapshotTitle(item),
    idiomaSnapshot: resolveSnapshotIdioma(item),
    claseSnapshot: resolveSnapshotClase(item),
    notaLineaSnapshot: item.notaLinea,
    costoCotizado: item.precioSugerido ? Number(item.precioSugerido.toString()) : null,
    costoFinal: null,
    monedaCodigo: item.precioMonedaCodigo,
    estadoItem: ReservaItemEstado.PENDIENTE
  };
}
