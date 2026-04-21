import { z } from "zod";

import { api } from "@/services/http";
import type { ApiResponse } from "@/types/api";

export const clienteFormSchema = z.object({
  idClienteAgente: z.coerce.number().optional().nullable(),
  nombreCompleto: z.string().min(1),
  telefono: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  idContinente: z.coerce.number().optional().nullable(),
  idPais: z.coerce.number().optional().nullable(),
  idCiudad: z.coerce.number().optional().nullable(),
  observaciones: z.string().optional().nullable(),
  activo: z.boolean().default(true)
});

export type ClienteFormValues = z.infer<typeof clienteFormSchema>;

export async function listClientes() {
  const response = await api.get<ApiResponse<Array<Record<string, unknown>>>>("/cliente");
  return response.data.data;
}

export async function getCliente(id: number) {
  const response = await api.get<ApiResponse<Record<string, unknown>>>(`/cliente/${id}`);
  return response.data.data;
}

/**
 * Convierte valores vacíos del formulario en null.
 * Esto evita que se mande "" o 0 por accidente cuando no se eligió nada.
 */
function normalizeNullableNumber(value: unknown) {
  if (value === "" || value === undefined || value === null) {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export async function saveCliente(values: ClienteFormValues, id?: number) {
  const payload = {
    ...values,
    email: values.email || null,
    idClienteAgente: normalizeNullableNumber(values.idClienteAgente),
    idPais: normalizeNullableNumber(values.idPais),
    idCiudad: normalizeNullableNumber(values.idCiudad)
  };

  if (id) {
    const response = await api.put<ApiResponse<Record<string, unknown>>>(`/cliente/${id}`, payload);
    return response.data.data;
  }

  const response = await api.post<ApiResponse<Record<string, unknown>>>("/cliente", payload);
  return response.data.data;
}