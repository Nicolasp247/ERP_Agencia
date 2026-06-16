/* erp-tour-operator/frontend/src/modules/expediente/confirmacion-builder/confirmacion-builder-api.ts */

import { api } from "@/services/http";
import type { ApiResponse } from "@/types/api";

export type ConfirmacionBuilderColumnOption = {
  id: number;
  grupo: string;
  nombre: string;
  tipo: "TERRESTRE" | "TRANSPORTE" | "OPCIONALES" | "OTRO";
  unidad: "POR_PERSONA" | "POR_NINO" | "POR_HABITACION" | "POR_GRUPO";
  multiplicador: number;
  orden: number;
  label: string;
};

export type ConfirmacionBuilderOptions = {
  version: {
    id: number;
    idExpediente: number;
    versionNumero: number;
    versionCodigo: string;
    estadoVersion: string;
    nombreCotizacion: string;
    monedaCodigo: string;
  };
  expediente: {
    id: number;
    codigo: string;
    nombreExpediente: string;
    cliente?: {
      id: number;
      nombreCompleto: string;
    } | null;
    clienteAgente?: {
      id: number;
      codigo?: string;
      razonSocial: string;
    } | null;
    destinoPrincipal?: {
      id: number;
      nombre: string;
    } | null;
  };
  columns: ConfirmacionBuilderColumnOption[];
};

export type ConfirmacionBuilderCreateValues = {
  selectedColumnIds: number[];
};

export async function getConfirmacionBuilderOptions(versionId: number) {
  const response = await api.get<ApiResponse<ConfirmacionBuilderOptions>>(
    `/confirmacion-builder/versiones/${versionId}/opciones`
  );

  return response.data.data;
}

export async function createConfirmacionBuilder(
  versionId: number,
  values: ConfirmacionBuilderCreateValues
) {
  const response = await api.post<ApiResponse<Record<string, unknown>>>(
    `/confirmacion-builder/versiones/${versionId}`,
    values
  );

  return response.data.data;
}

export async function getConfirmacionBuilder(versionId: number) {
  const response = await api.get<ApiResponse<Record<string, unknown>>>(
    `/confirmacion-builder/versiones/${versionId}`
  );

  return response.data.data;
}