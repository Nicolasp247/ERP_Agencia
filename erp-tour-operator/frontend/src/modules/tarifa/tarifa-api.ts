import { z } from "zod";

import { api } from "@/services/http";
import type { ApiResponse } from "@/types/api";

export const tarifaFormSchema = z.object({
  idServicio: z.coerce.number().int().positive(),
  anio: z.coerce.number().int().min(2000).max(2100),
  mes: z.coerce.number().int().min(1).max(12),
  tipoHabitacion: z.string().min(1).max(3).default("DBL"),
  precioUsd: z.coerce.number().nonnegative(),
  monedaCodigo: z.string().length(3).default("USD"),
  activo: z.boolean().default(true)
});

export type TarifaFormValues = z.infer<typeof tarifaFormSchema>;

export async function listTarifas() {
  const response = await api.get<ApiResponse<Array<Record<string, unknown>>>>("/tarifa");
  return response.data.data;
}

export async function saveTarifa(values: TarifaFormValues) {
  const response = await api.post<ApiResponse<Record<string, unknown>>>("/tarifa", values);
  return response.data.data;
}
