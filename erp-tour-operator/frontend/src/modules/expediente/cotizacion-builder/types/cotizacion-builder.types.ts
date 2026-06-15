/* erp-tour-operator/frontend/src/pages/expediente/cotizacion-builder/types/cotizacion-builder.types.ts */

export type BuilderColumnType = "TERRESTRE" | "TRANSPORTE" | "OPCIONALES" | "OTRO";

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
  orden: number;
};

export type BuilderRowPrice = {
  columnId: number;
  precioNeto: number | null;
};

export type BuilderRow = {
  id: number;
  idServicio: number;
  fecha: string;
  ordenDia: number;
  servicioIncluido: string;
  operador: string;
  notas: string;
  esOpcional: boolean;
  precios: BuilderRowPrice[];
};