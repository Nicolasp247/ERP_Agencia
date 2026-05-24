/* erp-tour-operator/frontend/src/pages/cotizacion-builder/types/cotizacion-builder.types.ts */

export type BuilderColumnType = "HOTEL" | "TRANSPORTE" | "OPCIONAL" | "PERSONALIZADA";

export type BuilderPriceUnit =
  | "POR_PERSONA"
  | "POR_HABITACION"
  | "POR_SERVICIO"
  | "POR_VEHICULO"
  | "POR_GRUPO"
  | "POR_NOCHE"
  | "POR_VILLA";

export type BuilderColumn = {
  id: number;
  grupo: string;
  nombre: string;
  tipo: BuilderColumnType;
  unidad: BuilderPriceUnit;
  orden: number;
};

export type BuilderRowPrice = {
  columnId: number;
  precioNeto: number | null;
};

export type BuilderRow = {
  id: number;
  fecha: string;
  servicioIncluido: string;
  operador: string;
  notas: string;
  esOpcional: boolean;
  precios: BuilderRowPrice[];
};