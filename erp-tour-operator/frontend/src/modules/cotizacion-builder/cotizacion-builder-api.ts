/* erp-tour-operator/frontend/src/modules/cotizacion-builder/cotizacion-builder-api.ts */

import { api } from "@/services/http";
import type { ApiResponse } from "@/types/api";
import type {
  BuilderColumn,
  BuilderColumnType,
  BuilderPriceUnit,
  BuilderRow
} from "@/pages/cotizacion-builder/types/cotizacion-builder.types";

export type CotizacionBuilderDetail = {
  version: {
    id: number;
    idExpediente: number;
    versionNumero: number;
    versionCodigo: string;
    versionLabel: string;
    estadoVersion: string;
    nombreCotizacion: string;
    monedaCodigo: string;
  };

  expediente: {
    id: number;
    codigo: string;
    nombreExpediente: string;
    estado: string;
    fechaViajePrincipal: string;
    totalPasajeros: number;
    monedaCodigo: string;
    cliente?: {
      id: number;
      nombreCompleto: string;
    } | null;
    clienteAgente?: {
      id: number;
      codigo?: string | null;
      razonSocial: string;
    } | null;
    destinoPrincipal?: {
      id: number;
      nombre: string;
    } | null;
  };

  columns: BuilderColumn[];
  rows: BuilderRow[];
};

export type BuilderColumnFormValues = {
  grupo: string;
  nombre: string;
  tipo: BuilderColumnType;
  unidad: BuilderPriceUnit;
  multiplicador: number;
  orden?: number;
};

export type BuilderItemFormValues = {
  idServicio: number;
  fechaServicio: string;
  ordenDia?: number;
  esOpcional: boolean;
  notaLinea?: string | null;
};

export type BuilderPriceFormValues = {
  prices: Array<{
    columnId: number;
    precioNeto: number | null;
  }>;
};

export async function getCotizacionBuilder(versionId: number) {
  const response = await api.get<ApiResponse<CotizacionBuilderDetail>>(
    `/cotizacion-builder/${versionId}`
  );

  return response.data.data;
}

export async function createCotizacionBuilderColumn(
  versionId: number,
  values: BuilderColumnFormValues
) {
  const response = await api.post<ApiResponse<CotizacionBuilderDetail>>(
    `/cotizacion-builder/${versionId}/columns`,
    values
  );

  return response.data.data;
}

export async function updateCotizacionBuilderColumn(
  columnId: number,
  values: BuilderColumnFormValues
) {
  const response = await api.put<ApiResponse<CotizacionBuilderDetail>>(
    `/cotizacion-builder/columns/${columnId}`,
    values
  );

  return response.data.data;
}

export async function deleteCotizacionBuilderColumn(columnId: number) {
  const response = await api.delete<ApiResponse<CotizacionBuilderDetail>>(
    `/cotizacion-builder/columns/${columnId}`
  );

  return response.data.data;
}

export async function createCotizacionBuilderItem(
  versionId: number,
  values: BuilderItemFormValues
) {
  const response = await api.post<ApiResponse<CotizacionBuilderDetail>>(
    `/cotizacion-builder/${versionId}/items`,
    values
  );

  return response.data.data;
}

export async function deleteCotizacionBuilderItem(itemId: number) {
  const response = await api.delete<ApiResponse<CotizacionBuilderDetail>>(
    `/cotizacion-builder/items/${itemId}`
  );

  return response.data.data;
}

export async function updateCotizacionBuilderItemPrices(
  itemId: number,
  values: BuilderPriceFormValues
) {
  const response = await api.put<ApiResponse<CotizacionBuilderDetail>>(
    `/cotizacion-builder/items/${itemId}/prices`,
    values
  );

  return response.data.data;
}