/* erp-tour-operator/frontend/src/modules/alojamiento-precio/alojamiento-precio-api.ts */

import { z } from "zod";

import { api } from "@/services/http";
import type { ApiResponse } from "@/types/api";

export const CATEGORIAS_HOTEL = [
  { value: "H3_ECONOMICO", label: "Turista (3*)" },
  { value: "H3_SUPERIOR", label: "Turista Superior (3+*)" },
  { value: "H4_ECONOMICO", label: "Primera (4*)" },
  { value: "H4_SUPERIOR", label: "Primera Superior (4+*)" },
  { value: "H5_ECONOMICO", label: "Lujo (5*)" },
  { value: "H5_SUPERIOR", label: "Lujo Superior (5+*)" },
  { value: "LUJO_ECONOMICO", label: "Super Lujo" },
  { value: "LUJO_SUPERIOR", label: "Super Lujo Superior" },
  { value: "OTRO", label: "Otro" }
];

export const CATEGORIAS_HABITACION = [
  { value: "ESTANDAR", label: "Estándar" },
  { value: "SUPERIOR", label: "Superior" },
  { value: "SUITE", label: "Suite" },
  { value: "OTRO", label: "Otro" }
];

export const REGIMENES_ALOJAMIENTO = [
  { value: "SOLO_ALOJAMIENTO", label: "Solo alojamiento" },
  { value: "ALOJAMIENTO_DESAYUNO", label: "Alojamiento y desayuno" },
  { value: "TODO_INCLUIDO", label: "Todo incluido" },
  { value: "OTRO", label: "Otro" }
];

export const TIPOS_HABITACION = [
  { value: "SGL", label: "Sencilla" },
  { value: "DBL", label: "Doble" },
  { value: "TPL", label: "Triple" },
  { value: "CPL", label: "Cuádruple" }
];

export type AlojamientoPrecio = {
  id: number;
  idCiudad: number;
  ciudad: string;
  pais: string | null;
  categoria: string;
  categoriaLabel: string;
  categoriaHab: string;
  categoriaHabLabel: string;
  regimen: string;
  regimenLabel: string;
  fechaDesde: string;
  fechaHasta: string;
  tipoHabitacion: string;
  tipoHabitacionLabel: string;
  precioUsd: number | null;
  monedaCodigo: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AlojamientoPrecioFilters = {
  idCiudad?: number;
  categoria?: string;
  categoriaHab?: string;
  regimen?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  tipoHabitacion?: string;
  activo?: boolean;
};

export const alojamientoPrecioFormSchema = z
  .object({
    idCiudad: z.coerce.number().int().positive("Selecciona una ciudad"),
    categoria: z.string().min(1, "Selecciona una categoría hotelera"),
    categoriaHab: z.string().min(1, "Selecciona una categoría de habitación"),
    regimen: z.string().min(1, "Selecciona un régimen"),
    fechaDesde: z.string().min(1, "La fecha desde es obligatoria"),
    fechaHasta: z.string().min(1, "La fecha hasta es obligatoria"),
    tipoHabitacion: z.string().min(1, "Selecciona un tipo de habitación"),
    precioUsd: z.coerce.number().nonnegative("El precio no puede ser negativo"),
    monedaCodigo: z.string().trim().length(3).default("USD"),
    activo: z.coerce.boolean().default(true)
  })
  .refine((data) => new Date(data.fechaDesde) <= new Date(data.fechaHasta), {
    message: "La fecha desde no puede ser mayor que la fecha hasta",
    path: ["fechaHasta"]
  });

export type AlojamientoPrecioFormValues = z.infer<typeof alojamientoPrecioFormSchema>;

export async function listAlojamientoPrecios(filters: AlojamientoPrecioFilters = {}) {
  const response = await api.get<ApiResponse<AlojamientoPrecio[]>>("/alojamiento-precio", {
    params: filters
  });

  return response.data.data;
}

export async function saveAlojamientoPrecio(values: AlojamientoPrecioFormValues) {
  const response = await api.post<ApiResponse<AlojamientoPrecio>>(
    "/alojamiento-precio",
    values
  );

  return response.data.data;
}

export async function updateAlojamientoPrecio(
  id: number,
  values: AlojamientoPrecioFormValues
) {
  const response = await api.put<ApiResponse<AlojamientoPrecio>>(
    `/alojamiento-precio/${id}`,
    values
  );

  return response.data.data;
}

export async function deleteAlojamientoPrecio(id: number) {
  const response = await api.delete<ApiResponse<{ id: number }>>(
    `/alojamiento-precio/${id}`
  );

  return response.data.data;
}