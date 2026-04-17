export function toTarifaListItem(
  record: {
    idServicio: number;
    anio: number;
    mes: number;
    tipoHabitacion: string;
    precioUsd: { toString(): string } | null;
    monedaCodigo: string;
    activo: boolean;
    servicio: { nombreWtravel: string };
  }
) {
  return {
    idServicio: record.idServicio,
    servicio: record.servicio.nombreWtravel,
    anio: record.anio,
    mes: record.mes,
    tipoHabitacion: record.tipoHabitacion,
    precioUsd: record.precioUsd?.toString() ?? null,
    monedaCodigo: record.monedaCodigo,
    activo: record.activo
  };
}
