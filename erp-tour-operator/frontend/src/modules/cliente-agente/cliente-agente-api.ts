import { z } from "zod";

import { api } from "@/services/http";
import type { ApiResponse } from "@/types/api";

export const agenteFormSchema = z.object({
  codigo: z.string().min(1),
  razonSocial: z.string().min(1),
  nombreContacto: z.string().optional().nullable(),
  telefono: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  direccion: z.string().optional().nullable(),
  nit: z.string().optional().nullable(),
  idContinente: z.coerce.number().optional().nullable(),
  idPais: z.coerce.number().optional().nullable(),
  idCiudad: z.coerce.number().optional().nullable(),
  comisionBasePct: z.coerce.number().min(0).max(100).optional().nullable(),
  activo: z.boolean().default(true)
});

export type AgenteFormValues = z.infer<typeof agenteFormSchema>;

export async function listAgentes() {
  const response = await api.get<ApiResponse<Array<Record<string, unknown>>>>("/cliente-agente");
  return response.data.data;
}

export async function getAgente(id: number) {
  const response = await api.get<ApiResponse<Record<string, unknown>>>(`/cliente-agente/${id}`);
  return response.data.data;
}

function normalizeNullableNumber(value: unknown) {
  if (value === "" || value === undefined || value === null) {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export async function saveAgente(values: AgenteFormValues, id?: number) {
  const payload = {
    ...values,
    email: values.email || null,
    idPais: normalizeNullableNumber(values.idPais),
    idCiudad: normalizeNullableNumber(values.idCiudad)
  };

  if (id) {
    const response = await api.put<ApiResponse<Record<string, unknown>>>(`/cliente-agente/${id}`, payload);
    return response.data.data;
  }

  const response = await api.post<ApiResponse<Record<string, unknown>>>("/cliente-agente", payload);
  return response.data.data;
}