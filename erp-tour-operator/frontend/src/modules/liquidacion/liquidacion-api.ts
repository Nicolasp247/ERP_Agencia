import { api } from "@/services/http";
import type { ApiResponse } from "@/types/api";

export async function confirmarComercialmenteReserva(id: number, payload: Record<string, unknown>) {
  const response = await api.post<ApiResponse<Record<string, unknown>>>(
    `/liquidacion/reserva/${id}/confirmacion-comercial`,
    payload
  );
  return response.data.data;
}

export async function recalcularLiquidacion(id: number) {
  const response = await api.post<ApiResponse<Record<string, unknown>>>(`/liquidacion/reserva/${id}/recalcular`);
  return response.data.data;
}

export async function cerrarLiquidacion(id: number) {
  const response = await api.post<ApiResponse<Record<string, unknown>>>(`/liquidacion/reserva/${id}/cerrar`);
  return response.data.data;
}
