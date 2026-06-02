/* erp-tour-operator/frontend/src/pages/cotizacion-builder/types/cotizacion-builder.types.ts */

export type BuilderColumnType = "TERRESTRE" | "TRANSPORTE" | "OPCIONALES" | "OTRO";

export type BuilderCommissionType = "TERRESTRE" | "AEREA" | "OPCIONALES" | "OTRO";

export type BuilderCommission = {
  id: number;
  tipoComision: BuilderCommissionType;
  porcentajeAgente: number;
  porcentajeWtravel: number;
  porcentajeBancario: number;
  porcentajeTotal: number;
  factorVenta: number;
};

export type BuilderPriceUnit =
  | "POR_PERSONA"
  | "POR_NINO"
  | "POR_HABITACION"
  | "POR_GRUPO";

export type BuilderColumn = {
  id: number;
  grupo: string;
  nombre: string;
  tipo: BuilderColumnType;
  unidad: BuilderPriceUnit;
  multiplicador: number;
  precioMostradoFormula?: string | null;
  precioMostradoValor?: number | null;
  orden: number;
};

export type BuilderRowPrice = {
  columnId: number;
  precioNeto: number | null;
};

export type BuilderHotelPreview = {
  columnId: number;
  textoHotel: string;
};

export type BuilderRow = {
  id: number;
  idServicio: number;
  fecha: string;
  fechaFin: string | null;
  ordenDia: number;
  servicioIncluido: string;
  operador: string;
  linkReserva: string | null;
  notas: string;
  esOpcional: boolean;
  tipoServicio: string;
  tipoServicioCodigo: string | null;
  ciudadNombre: string | null;
  paisNombre: string | null;
  precios: BuilderRowPrice[];
  hotelesPrevistos: BuilderHotelPreview[];
};