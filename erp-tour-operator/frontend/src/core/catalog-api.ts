import { api } from "@/services/http";
import type { ApiResponse } from "@/types/api";

export type CatalogItem = {
  id: number;
  nombre: string;
};

export async function fetchContinentes() {
  const response = await api.get<ApiResponse<CatalogItem[]>>("/catalogos/continentes");
  return response.data.data;
}

export async function fetchPaises() {
  const response = await api.get<ApiResponse<CatalogItem[]>>("/catalogos/paises");
  return response.data.data;
}

export async function fetchCiudades(idPais?: number) {
  const response = await api.get<ApiResponse<CatalogItem[]>>("/catalogos/ciudades", {
    params: idPais ? { idPais } : undefined
  });
  return response.data.data;
}
