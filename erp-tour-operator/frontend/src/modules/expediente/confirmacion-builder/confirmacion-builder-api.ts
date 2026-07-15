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

export type ConfirmacionPassengerValues = {
  nombre: string;
  apellidos: string;
  fechaNacimiento: string;
  numeroPasaporte: string;
  fechaExpedicionPasaporte: string;
  fechaVencimientoPasaporte: string;
  nacionalidad: string;
};

export type ConfirmacionPassenger = ConfirmacionPassengerValues & {
  id: number;
  idReserva: number;
  orden: number;
  edadEnViaje: string;
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

export async function deleteConfirmacionBuilder(versionId: number) {
  const response = await api.delete<ApiResponse<Record<string, unknown>>>(
    `/confirmacion-builder/versiones/${versionId}`
  );

  return response.data.data;
}

export async function createConfirmacionPassenger(
  reservaId: number,
  values: ConfirmacionPassengerValues
) {
  const response = await api.post<ApiResponse<ConfirmacionPassenger>>(
    `/confirmacion-builder/reservas/${reservaId}/pasajeros`,
    values
  );

  return response.data.data;
}

export async function updateConfirmacionPassenger(
  passengerId: number,
  values: ConfirmacionPassengerValues
) {
  const response = await api.put<ApiResponse<ConfirmacionPassenger>>(
    `/confirmacion-builder/pasajeros/${passengerId}`,
    values
  );

  return response.data.data;
}

export async function deleteConfirmacionPassenger(passengerId: number) {
  const response = await api.delete<ApiResponse<{ id: number }>>(
    `/confirmacion-builder/pasajeros/${passengerId}`
  );

  return response.data.data;
}

export type ConfirmacionBuilderPriceFormValues = {
  prices: Array<{
    columnId: number;
    precioConfirmado: number | null;
  }>;
};

export type ConfirmacionBuilderNoteFormValues = {
  notaLinea: string | null;
  tituloOverride?: string | null;
};

export type ConfirmacionBuilderMoveItemValues = {
  direction: "UP" | "DOWN";
};

export type ConfirmacionBuilderHotelPreviewFormValues = {
  hotels: Array<{
    columnId: number;
    textoHotel: string;
  }>;
};

export type ConfirmacionBuilderFreeNotesFormValues = {
  nota: string | null;
};

export async function updateConfirmacionBuilderItemPrices(
  itemId: number,
  values: ConfirmacionBuilderPriceFormValues
) {
  const response = await api.put<ApiResponse<Record<string, unknown>>>(
    `/confirmacion-builder/items/${itemId}/prices`,
    values
  );

  return response.data.data;
}

export async function updateConfirmacionBuilderItemNotes(
  itemId: number,
  values: ConfirmacionBuilderNoteFormValues
) {
  const response = await api.put<ApiResponse<Record<string, unknown>>>(
    `/confirmacion-builder/items/${itemId}/notes`,
    values
  );

  return response.data.data;
}

export async function updateConfirmacionBuilderItemHotels(
  itemId: number,
  values: ConfirmacionBuilderHotelPreviewFormValues
) {
  const response = await api.put<ApiResponse<Record<string, unknown>>>(
    `/confirmacion-builder/items/${itemId}/hotels`,
    values
  );

  return response.data.data;
}

export async function moveConfirmacionBuilderItem(
  itemId: number,
  values: ConfirmacionBuilderMoveItemValues
) {
  const response = await api.put<ApiResponse<Record<string, unknown>>>(
    `/confirmacion-builder/items/${itemId}/move`,
    values
  );

  return response.data.data;
}

export async function deleteConfirmacionBuilderItem(itemId: number) {
  const response = await api.delete<ApiResponse<Record<string, unknown>>>(
    `/confirmacion-builder/items/${itemId}`
  );

  return response.data.data;
}

export async function updateConfirmacionBuilderFreeNotes(
  versionId: number,
  values: ConfirmacionBuilderFreeNotesFormValues
) {
  const response = await api.put<ApiResponse<Record<string, unknown>>>(
    `/confirmacion-builder/versiones/${versionId}/free-notes`,
    values
  );

  return response.data.data;
}

export type ConfirmacionBuilderItemFormValues = {
  idServicio: number;
  fechaServicio: string;
  ordenDia?: number;
  esOpcional: boolean;
  notaLinea?: string | null;

  idReservaColumnaManual?: number;

  alojamiento?: {
    noches: number;
    habitaciones: number;
    categoriaHab?: string;
    regimen?: string;
  };
};

export async function createConfirmacionBuilderItem(
  reservaId: number,
  values: ConfirmacionBuilderItemFormValues
) {
  const response = await api.post<ApiResponse<Record<string, unknown>>>(
    `/confirmacion-builder/reservas/${reservaId}/items`,
    values
  );

  return response.data.data;
}