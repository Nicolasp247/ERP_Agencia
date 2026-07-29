// erp-tour-operator/frontend/src/modules/contabilidad/compras-proveedor/compras-proveedor-api.ts

import { api } from "@/services/http";
import type { ApiResponse } from "@/types/api";

export type CompraProveedorEstadoOperativo =
  | "BORRADOR"
  | "SOLICITADA"
  | "CONFIRMADA"
  | "CANCELADA"
  | "REEMPLAZADA"
  | "REALIZADA";

export type CompraProveedorEstadoEditable =
  | "BORRADOR"
  | "SOLICITADA"
  | "CONFIRMADA"
  | "REALIZADA";

export type CompraProveedorEstadoFinanciero =
  | "SIN_PAGAR"
  | "PAGO_PROGRAMADO"
  | "PAGO_PARCIAL"
  | "PAGADO"
  | "FALTA_COP"
  | "REEMBOLSADO";


export type CompraProveedorPagoTipo =
  | "PAGO"
  | "REEMBOLSO"
  | "AJUSTE";

export type CompraProveedorPagoEstado =
  | "REGISTRADO"
  | "ANULADO";

export type CompraProveedorPago = {
  id: number;
  tipo: CompraProveedorPagoTipo;
  estado: CompraProveedorPagoEstado;
  fechaCargo: string | null;
  valorMonedaOriginal: number | null;
  monedaOriginal: string;
  valorCop: number | null;
  tasaCambio: number | null;
  metodoPago: string | null;
  referenciaPago: string | null;
  nota: string | null;
};

export type CompraProveedorPagoCreateValues = {
  tipo?: CompraProveedorPagoTipo;
  fechaCargo?: string;
  valorMonedaOriginal: number;
  monedaOriginal: string;
  valorCop?: number | null;
  tasaCambio?: number | null;
  metodoPago?: string | null;
  referenciaPago?: string | null;
  nota?: string | null;
};

export type CompraProveedorReembolsoCreateValues =
  Omit<
    CompraProveedorPagoCreateValues,
    "tipo"
  >;

export type CompraProveedorPagoUpdateValues =
  Partial<CompraProveedorPagoCreateValues>;

export type CompraProveedorPagoVoidValues = {
  motivo: string;
};

export type CompraProveedorCancelacionTipo =
  | "GRATUITA_HASTA"
  | "NO_REEMBOLSABLE"
  | "CONDICIONES_ESPECIALES";

export type CompraProveedorColumn = {
  id: number;
  grupo: string;
  nombre: string;
  tipo:
    | "TERRESTRE"
    | "TRANSPORTE"
    | "OPCIONALES"
    | "OTRO";
  unidad:
    | "POR_PERSONA"
    | "POR_NINO"
    | "POR_HABITACION"
    | "POR_GRUPO";
  multiplicador: number;
  orden: number;
  label: string;
};

export type CompraProveedorHistoryItem = {
  id: number;
  codigoInterno: string;
  codigoProveedor: string | null;
  estadoOperativo: CompraProveedorEstadoOperativo;
  estadoFinanciero: CompraProveedorEstadoFinanciero;
  esVigente: boolean;
  fechaReserva: string | null;
  fechaCancelacion: string | null;
  motivoCancelacion: string | null;
};

export type CompraProveedor = {
  id: number;
  codigoInterno: string;
  codigoProveedor: string | null;

  proveedor: {
    id: number;
    codigo: string | null;
    nombreComercial: string | null;
  } | null;

  estadoOperativo: CompraProveedorEstadoOperativo;
  estadoFinanciero: CompraProveedorEstadoFinanciero;
  esVigente: boolean;

  fechaReserva: string | null;
  fechaConfirmacion: string | null;
  fechaPrevistaCobro: string | null;
  fechaLimiteCancelacion: string | null;
  fechaCancelacion: string | null;
  fechaRealizacion: string | null;

  tipoCancelacion:
    | CompraProveedorCancelacionTipo
    | null;

  columnaSeleccionada:
    | CompraProveedorColumn
    | null;

  valorContratado: number | null;
  valorContratadoUnidad: number | null;
  precioCotizadoComparacion: number | null;

  resultadoComparacion:
    | "MENOR_IGUAL"
    | "MAYOR"
    | null;

  monedaCodigo: string;
  motivoCancelacion: string | null;
  notaAdministrativa: string;

  totalPagado?: number;
  totalReembolsado?: number;
  saldoPendiente?: number | null;
  pagos?: CompraProveedorPago[];

  historialCantidad: number;
  historial: CompraProveedorHistoryItem[];
};

export type CompraProveedorCreateValues = {
  codigoProveedor?: string | null;
  estadoOperativo: CompraProveedorEstadoEditable;
  fechaReserva?: string;
  fechaConfirmacion?: string | null;
  fechaPrevistaCobro?: string | null;
  tipoCancelacion?: CompraProveedorCancelacionTipo | null;
  fechaLimiteCancelacion?: string | null;
  valorContratado?: number | null;
  monedaCodigo: string;
  notaAdministrativa?: string | null;
};

export type CompraProveedorUpdateValues =
  Partial<CompraProveedorCreateValues> & {
    fechaRealizacion?: string | null;
  };

export type CompraProveedorCancelValues = {
  fechaCancelacion?: string;
  motivoCancelacion: string;
};

export type CompraProveedorReplaceValues = {
  codigoProveedor: string;
  motivoReemplazo: string;
  estadoOperativo: "SOLICITADA" | "CONFIRMADA";
  fechaReserva?: string;
  fechaConfirmacion?: string | null;
  fechaPrevistaCobro?: string | null;
  tipoCancelacion?: CompraProveedorCancelacionTipo | null;
  fechaLimiteCancelacion?: string | null;
  valorContratado?: number | null;
  monedaCodigo?: string;
  notaAdministrativa?: string | null;
};

export type CompraProveedorHistory = {
  vigente: CompraProveedor | null;
  total: number;
  historial: CompraProveedor[];
};

export type CompraProveedorMutationResult = {
  id: number;
};

export async function getCompraProveedorHistoryByItem(
  itemId: number
) {
  const response = await api.get<
    ApiResponse<CompraProveedorHistory>
  >(
    `/contabilidad/compras-proveedor/items/${itemId}`
  );

  return response.data.data;
}

export async function createCompraProveedorForItem(
  itemId: number,
  values: CompraProveedorCreateValues
) {
  const response = await api.post<
    ApiResponse<CompraProveedorMutationResult>
  >(
    `/contabilidad/compras-proveedor/items/${itemId}`,
    values
  );

  return response.data.data;
}

export async function updateCompraProveedor(
  proveedorReservaId: number,
  values: CompraProveedorUpdateValues
) {
  const response = await api.put<
    ApiResponse<CompraProveedorMutationResult>
  >(
    `/contabilidad/compras-proveedor/reservas/${proveedorReservaId}`,
    values
  );

  return response.data.data;
}

export async function cancelCompraProveedor(
  proveedorReservaId: number,
  values: CompraProveedorCancelValues
) {
  const response = await api.post<
    ApiResponse<CompraProveedorMutationResult>
  >(
    `/contabilidad/compras-proveedor/reservas/${proveedorReservaId}/cancelar`,
    values
  );

  return response.data.data;
}

export async function replaceCompraProveedor(
  proveedorReservaId: number,
  values: CompraProveedorReplaceValues
) {
  const response = await api.post<
    ApiResponse<CompraProveedorMutationResult>
  >(
    `/contabilidad/compras-proveedor/reservas/${proveedorReservaId}/reemplazar`,
    values
  );

  return response.data.data;
}

export async function createCompraProveedorPago(
  proveedorReservaId: number,
  values: CompraProveedorPagoCreateValues
) {
  const response = await api.post<
    ApiResponse<CompraProveedor>
  >(
    `/contabilidad/compras-proveedor/reservas/${proveedorReservaId}/pagos`,
    values
  );

  return response.data.data;
}

export async function createCompraProveedorReembolso(
  proveedorReservaId: number,
  values: CompraProveedorReembolsoCreateValues
) {
  const response = await api.post<
    ApiResponse<CompraProveedor>
  >(
    `/contabilidad/compras-proveedor/reservas/${proveedorReservaId}/reembolsos`,
    values
  );

  return response.data.data;
}

export async function updateCompraProveedorPago(
  pagoId: number,
  values: CompraProveedorPagoUpdateValues
) {
  const response = await api.put<
    ApiResponse<CompraProveedor>
  >(
    `/contabilidad/compras-proveedor/pagos/${pagoId}`,
    values
  );

  return response.data.data;
}

export async function voidCompraProveedorPago(
  pagoId: number,
  values: CompraProveedorPagoVoidValues
) {
  const response = await api.post<
    ApiResponse<CompraProveedor>
  >(
    `/contabilidad/compras-proveedor/pagos/${pagoId}/anular`,
    values
  );

  return response.data.data;
}