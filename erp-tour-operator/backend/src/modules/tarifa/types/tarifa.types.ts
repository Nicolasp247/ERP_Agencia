export type TarifaListItem = {
  idServicio: number;
  servicio: string;
  anio: number;
  mes: number;
  tipoHabitacion: string;
  precioUsd: string | null;
  monedaCodigo: string;
  activo: boolean;
};
