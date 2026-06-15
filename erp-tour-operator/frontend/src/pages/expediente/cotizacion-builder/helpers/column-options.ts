/* erp-tour-operator/frontend/src/pages/expediente/cotizacion-builder/helpers/column-options.ts */

import type {
  BuilderColumnType,
  BuilderPriceUnit
} from "../types/cotizacion-builder.types";

export type SelectOption = {
  value: string;
  label: string;
  multiplicador?: number;
};

export type InternalColumnForm = {
  tipo: BuilderColumnType;
  grupo: string;
  nombre: string;
  unidad: BuilderPriceUnit;
  multiplicador: number;
  orden?: number;
  customGrupo: string;
  customNombre: string;
};

export const SERVICE_TYPE_OPTIONS: Array<{ value: BuilderColumnType; label: string }> = [
  { value: "TERRESTRE", label: "Terrestre" },
  { value: "TRANSPORTE", label: "Transporte" },
  { value: "OPCIONALES", label: "Opcionales" },
  { value: "OTRO", label: "Otro" }
];

export const UNIT_OPTIONS: Array<{ value: BuilderPriceUnit; label: string }> = [
  { value: "POR_PERSONA", label: "Por persona" },
  { value: "POR_NINO", label: "Por niño (menor 10 años)" },
  { value: "POR_HABITACION", label: "Por habitación" },
  { value: "POR_GRUPO", label: "Por grupo" }
];

export const defaultFormValues: InternalColumnForm = {
  tipo: "TERRESTRE",
  grupo: "Turista (3*)",
  nombre: "Doble",
  unidad: "POR_PERSONA",
  multiplicador: 2,
  orden: undefined,
  customGrupo: "",
  customNombre: ""
};

const TERRESTRE_CATEGORY_OPTIONS: SelectOption[] = [
  { value: "Turista (3*)", label: "Turista (3*)" },
  { value: "Turista Superior (3+*)", label: "Turista Superior (3+*)" },
  { value: "Primera (4*)", label: "Primera (4*)" },
  { value: "Primera Superior (4+*)", label: "Primera Superior (4+*)" },
  { value: "Lujo (5*)", label: "Lujo (5*)" },
  { value: "Lujo Superior (5+*)", label: "Lujo Superior (5+*)" },
  { value: "Super Lujo (6*)", label: "Super Lujo (6*)" },
  { value: "__OTRO__", label: "Otro" }
];

const TRANSPORTE_CATEGORY_OPTIONS: SelectOption[] = [
  { value: "Económica", label: "Económica" },
  { value: "Ejecutiva", label: "Ejecutiva" },
  { value: "__OTRO__", label: "Otro" }
];

const OPCIONALES_CATEGORY_OPTIONS: SelectOption[] = [
  { value: "General", label: "General" },
  { value: "__OTRO__", label: "Otro" }
];

const TERRESTRE_ACCOMMODATION_OPTIONS: SelectOption[] = [
  { value: "Doble", label: "Doble", multiplicador: 2 },
  { value: "Triple", label: "Triple", multiplicador: 3 },
  { value: "Cuádruple", label: "Cuádruple", multiplicador: 4 },
  { value: "Sencilla", label: "Sencilla", multiplicador: 1 },
  { value: "Villa 6 personas", label: "Villa 6 personas", multiplicador: 6 },
  { value: "Villa 8 personas", label: "Villa 8 personas", multiplicador: 8 },
  { value: "Villa 10 personas", label: "Villa 10 personas", multiplicador: 10 },
  { value: "Villa 12 personas", label: "Villa 12 personas", multiplicador: 12 },
  { value: "Villa 16 personas", label: "Villa 16 personas", multiplicador: 16 },
  { value: "Villa 20 personas", label: "Villa 20 personas", multiplicador: 20 },
  { value: "__OTRO__", label: "Otro" }
];

const TRANSPORTE_ACCOMMODATION_OPTIONS: SelectOption[] = [
  { value: "Adulto", label: "Adulto", multiplicador: 1 },
  { value: "Niño (menor 10 años)", label: "Niño (menor 10 años)", multiplicador: 1 },
  { value: "Grupo", label: "Grupo", multiplicador: 1 },
  { value: "__OTRO__", label: "Otro" }
];

const OPCIONALES_ACCOMMODATION_OPTIONS: SelectOption[] = [
  { value: "Adulto", label: "Adulto", multiplicador: 1 },
  { value: "Niño (menor 10 años)", label: "Niño (menor 10 años)", multiplicador: 1 },
  { value: "__OTRO__", label: "Otro" }
];

export function getCategoryOptions(tipo: BuilderColumnType) {
  if (tipo === "TRANSPORTE") return TRANSPORTE_CATEGORY_OPTIONS;
  if (tipo === "OPCIONALES") return OPCIONALES_CATEGORY_OPTIONS;
  if (tipo === "OTRO") return [{ value: "__OTRO__", label: "Otro" }];

  return TERRESTRE_CATEGORY_OPTIONS;
}

export function getAccommodationOptions(tipo: BuilderColumnType) {
  if (tipo === "TRANSPORTE") return TRANSPORTE_ACCOMMODATION_OPTIONS;
  if (tipo === "OPCIONALES") return OPCIONALES_ACCOMMODATION_OPTIONS;
  if (tipo === "OTRO") return [{ value: "__OTRO__", label: "Otro" }];

  return TERRESTRE_ACCOMMODATION_OPTIONS;
}

export function getFirstOptionValue(options: SelectOption[]) {
  return options[0]?.value ?? "__OTRO__";
}

export function getMultiplierFromAccommodation(tipo: BuilderColumnType, nombre: string) {
  const option = getAccommodationOptions(tipo).find((item) => item.value === nombre);
  return option?.multiplicador ?? 1;
}

export function isCustomValue(value: string) {
  return value === "__OTRO__";
}