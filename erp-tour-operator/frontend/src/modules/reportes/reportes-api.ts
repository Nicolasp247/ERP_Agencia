import { api } from "@/services/http";
import type { ApiResponse } from "@/types/api";

export async function fetchOverview() {
  const response = await api.get<ApiResponse<Record<string, number>>>("/reportes/overview");
  return response.data.data;
}

export async function fetchUtilidadPorReserva() {
  const response = await api.get<ApiResponse<Array<Record<string, unknown>>>>("/reportes/utilidad-reserva");
  return response.data.data;
}
