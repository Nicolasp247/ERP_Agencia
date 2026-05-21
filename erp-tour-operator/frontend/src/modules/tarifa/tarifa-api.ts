/* erp-tour-operator/frontend/src/modules/tarifa/tarifa-api.ts */

import { z } from "zod";

import { api } from "@/services/http";
import type { ApiResponse } from "@/types/api";

export const tarifaFormSchema = z
  .object({
    idServicio: z.coerce.number().int().positive(),

    fechaDesde: z.string().min(1, "La fecha desde es obligatoria"),
    fechaHasta: z.string().min(1, "La fecha hasta es obligatoria"),

    tipoTarifa: z.string().min(1).max(50),
    unidadPrecio: z.string().min(1).max(50),

    precioNeto: z.coerce.number().nonnegative(),

    monedaCodigo: z.string().length(3).default("USD"),
    activo: z.boolean().default(true),

    observaciones: z.string().optional().nullable(),
    fechaRevision: z.string().optional().nullable()
  })
  .refine((data) => new Date(data.fechaDesde) <= new Date(data.fechaHasta), {
    message: "La fecha desde no puede ser mayor que la fecha hasta",
    path: ["fechaHasta"]
  });

export type TarifaFormValues = z.infer<typeof tarifaFormSchema>;

export async function listTarifas() {
  const response = await api.get<ApiResponse<Array<Record<string, unknown>>>>("/tarifa");
  return response.data.data;
}

export async function saveTarifa(values: TarifaFormValues, id?: number) {
  const rawValues = values as any;

  const payload = {
    ...values,
    activo: rawValues.activo === "false" ? false : Boolean(rawValues.activo),
    observaciones: values.observaciones?.trim() || null,
    fechaRevision: values.fechaRevision || null
  };

  if (id) {
    const response = await api.put<ApiResponse<Record<string, unknown>>>(`/tarifa/${id}`, payload);
    return response.data.data;
  }

  const response = await api.post<ApiResponse<Record<string, unknown>>>("/tarifa", payload);
  return response.data.data;
}

export async function deleteTarifa(id: number) {
  const response = await api.delete<ApiResponse<Record<string, unknown>>>(`/tarifa/${id}`);
  return response.data.data;
}