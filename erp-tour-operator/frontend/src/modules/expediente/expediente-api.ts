/* erp-tour-operator/frontend/src/modules/expediente/expediente-api.ts */

import { z } from "zod";

import { api } from "@/services/http";
import type { ApiResponse } from "@/types/api";

export const expedienteFormSchema = z.object({
  idCliente: z.coerce.number().int().positive(),
  idClienteAgente: z.coerce.number().optional().nullable(),
  nombreExpediente: z.string().min(1),
  fechaViajePrincipal: z.string().min(1),
  idDestinoPrincipal: z.coerce.number().optional().nullable(),
  categoriaViaje: z.string().optional().nullable(),
  monedaCodigo: z.string().length(3).default("USD"),
  presupuestoEstimado: z.coerce.number().nonnegative().optional().nullable(),
  presupuestoTipo: z.enum(["POR_PERSONA", "TOTAL"]).optional().nullable(),
  comisionPctAplicada: z.coerce.number().min(0).max(100).optional().nullable(),
  margenAplicadoValor: z.coerce.number().nonnegative().optional().nullable(),
  adultos65: z.coerce.number().int().min(0).default(0),
  adultos1964: z.coerce.number().int().min(0).default(0),
  jovenes1218: z.coerce.number().int().min(0).default(0),
  ninos311: z.coerce.number().int().min(0).default(0),
  infantes02: z.coerce.number().int().min(0).default(0),
  totalPasajeros: z.coerce.number().int().min(0),
  nota: z.string().optional().nullable(),
  notasInternas: z.string().optional().nullable()
});

export type ExpedienteFormValues = z.infer<typeof expedienteFormSchema>;

export async function listExpedientes(params?: Record<string, unknown>) {
  const response = await api.get<ApiResponse<Array<Record<string, unknown>>>>("/expedientes", { params });
  return response.data.data;
}

export async function getExpedientes(id: number) {
  const response = await api.get<ApiResponse<Record<string, unknown>>>(`/expedientes/${id}`);
  return response.data.data;
}

export async function saveExpedientes(values: ExpedienteFormValues, id?: number) {
  const payload = {
    ...values,
    idClienteAgente: values.idClienteAgente || null,
    idDestinoPrincipal: values.idDestinoPrincipal || null,
    categoriaViaje: values.categoriaViaje?.trim() || null,
    presupuestoEstimado: values.presupuestoEstimado ?? null,
    presupuestoTipo: values.presupuestoTipo ?? null,
    comisionPctAplicada: values.comisionPctAplicada ?? null,
    margenAplicadoValor: values.margenAplicadoValor ?? null,
    nota: values.nota?.trim() || null,
    notasInternas: values.notasInternas?.trim() || null
  };

  if (id) {
    const response = await api.put<ApiResponse<Record<string, unknown>>>(`/expedientes/${id}`, payload);
    return response.data.data;
  }

  const response = await api.post<ApiResponse<Record<string, unknown>>>("/expedientes", payload);
  return response.data.data;
}

export async function discardExpedientes(id: number) {
  const response = await api.post<ApiResponse<Record<string, unknown>>>(`/expedientes/${id}/discard`);
  return response.data.data;
}

export async function convertExpedientes(id: number) {
  const response = await api.post<ApiResponse<Record<string, unknown>>>(`/expedientes/${id}/convert-to-reserva`);
  return response.data.data;
}

export async function createExpedienteItinerary(id: number) {
  const response = await api.post<ApiResponse<Record<string, unknown>>>(`/expedientes/${id}/itinerarios`);
  return response.data.data;
}

export async function duplicateExpedienteVersion(versionId: number) {
  const response = await api.post<ApiResponse<Record<string, unknown>>>(
    `/expedientes/versiones/${versionId}/duplicar`
  );

  return response.data.data;
}

export async function deleteExpedienteVersion(versionId: number) {
  const response = await api.delete<ApiResponse<Record<string, unknown>>>(
    `/expedientes/versiones/${versionId}`
  );

  return response.data.data;
}