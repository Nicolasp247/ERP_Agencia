/* erp-tour-operator/frontend/src/modules/cotizacion-builder/cotizacion-builder-api.ts */

import { api } from "@/services/http";
import type { ApiResponse } from "@/types/api";
import type { BuilderColumn, BuilderRow } from "@/pages/cotizacion-builder/types/cotizacion-builder.types";

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

export async function getCotizacionBuilder(versionId: number) {
  const response = await api.get<ApiResponse<CotizacionBuilderDetail>>(
    `/cotizacion-builder/${versionId}`
  );

  return response.data.data;
}