import { api } from "@/services/http";
import type { ApiResponse } from "@/types/api";

export async function listReservas() {
  const response = await api.get<ApiResponse<Array<Record<string, unknown>>>>("/reserva");
  return response.data.data;
}

export async function getReserva(id: number) {
  const response = await api.get<ApiResponse<Record<string, unknown>>>(`/reserva/${id}`);
  return response.data.data;
}

export async function updateReservaOperational(id: number, payload: Record<string, unknown>) {
  const response = await api.put<ApiResponse<Record<string, unknown>>>(`/reserva/${id}`, payload);
  return response.data.data;
}

export async function registerReservaConfirmacion(
  id: number,
  itemId: number,
  payload: { numeroConfirmacion?: string | null; estadoItem?: string }
) {
  const response = await api.patch<ApiResponse<Record<string, unknown>>>(
    `/reserva/${id}/items/${itemId}/confirmacion`,
    payload
  );
  return response.data.data;
}

export async function cancelReserva(id: number, motivoCancelacion: string) {
  const response = await api.patch<ApiResponse<Record<string, unknown>>>(`/reserva/${id}/cancelar`, {
    motivoCancelacion
  });
  return response.data.data;
}
