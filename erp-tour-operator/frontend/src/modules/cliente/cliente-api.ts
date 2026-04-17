import { z } from "zod";

import { api } from "@/services/http";
import type { ApiResponse } from "@/types/api";

export const clienteFormSchema = z.object({
  idClienteAgente: z.coerce.number().optional().nullable(),
  nombreCompleto: z.string().min(1),
  telefono: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
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

export async function saveCliente(values: ClienteFormValues, id?: number) {
  const payload = {
    ...values,
    email: values.email || null
  };

  if (id) {
    const response = await api.put<ApiResponse<Record<string, unknown>>>(`/cliente/${id}`, payload);
    return response.data.data;
  }

  const response = await api.post<ApiResponse<Record<string, unknown>>>("/cliente", payload);
  return response.data.data;
}
