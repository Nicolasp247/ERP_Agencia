import { z } from "zod";

import { api } from "@/services/http";
import type { ApiResponse } from "@/types/api";

const contactoSchema = z.object({
  nombreContacto: z.string().optional().nullable(),
  email: z.string().email(),
  telefono: z.string().optional().nullable(),
  cargo: z.string().optional().nullable(),
  principal: z.boolean().default(false),
  activo: z.boolean().default(true)
});

export const proveedorFormSchema = z.object({
  codigo: z.string().optional().nullable(),
  nombreComercial: z.string().min(1),
  sitioWeb: z.string().url().optional().nullable().or(z.literal("")),
  idPais: z.coerce.number().optional().nullable(),
  idCiudad: z.coerce.number().optional().nullable(),
  observaciones: z.string().optional().nullable(),
  activo: z.boolean().default(true),
  contactos: z.array(contactoSchema).default([])
});

export type ProveedorFormValues = z.infer<typeof proveedorFormSchema>;

export async function listProveedores() {
  const response = await api.get<ApiResponse<Array<Record<string, unknown>>>>("/proveedor");
  return response.data.data;
}

export async function getProveedor(id: number) {
  const response = await api.get<ApiResponse<Record<string, unknown>>>(`/proveedor/${id}`);
  return response.data.data;
}

export async function saveProveedor(values: ProveedorFormValues, id?: number) {
  const payload = {
    ...values,
    sitioWeb: values.sitioWeb || null
  };

  if (id) {
    const response = await api.put<ApiResponse<Record<string, unknown>>>(`/proveedor/${id}`, payload);
    return response.data.data;
  }

  const response = await api.post<ApiResponse<Record<string, unknown>>>("/proveedor", payload);
  return response.data.data;
}
