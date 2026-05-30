/* erp-tour-operator/backend/src/modules/tarifa/types/tarifa.types.ts */

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
