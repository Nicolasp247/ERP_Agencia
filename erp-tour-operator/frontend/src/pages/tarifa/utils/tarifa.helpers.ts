/* erp-tour-operator/frontend/src/pages/tarifa/utils/tarifa.helpers.ts */

import type { AlojamientoPrecioFormValues } from "@/modules/alojamiento-precio/alojamiento-precio-api";

export function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function getEndOfYearDate() {
  const year = new Date().getFullYear();

  return `${year}-12-31`;
}

export function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

export function formatMoney(value: number | null, currency = "USD") {
  if (value === null || value === undefined) {
    return "-";
  }

  return `${value} ${currency}`;
}

export function getTipoCodigo(servicio: any) {
  return String(servicio?.tipoCodigo ?? servicio?.codigoTipo ?? servicio?.tipo?.codigo ?? "").toUpperCase();
}

export function isAlojamientoServicio(servicio: any) {
  const codigo = getTipoCodigo(servicio);
  const tipo = String(servicio?.tipo ?? servicio?.tipoNombre ?? servicio?.tipoServicio ?? "").toUpperCase();

  return codigo === "ALOJAMIENTO" || tipo === "ALOJAMIENTO";
}

export function getDefaultTarifaValues(idServicio?: number) {
  return {
    idServicio,
    fechaDesde: getTodayDate(),
    fechaHasta: getEndOfYearDate(),
    tipoTarifa: "GENERAL",
    unidadPrecio: "POR_PERSONA",
    precioNeto: "",
    monedaCodigo: "USD",
    activo: true,
    observaciones: "",
    fechaRevision: getTodayDate()
  };
}

export function getDefaultAlojamientoValues(idCiudad?: number): AlojamientoPrecioFormValues {
  return {
    idCiudad: idCiudad ?? 0,
    categoria: "H3_ECONOMICO",
    categoriaHab: "ESTANDAR",
    regimen: "ALOJAMIENTO_DESAYUNO",
    fechaDesde: getTodayDate(),
    fechaHasta: getEndOfYearDate(),
    tipoHabitacion: "DBL",
    precioUsd: 0,
    monedaCodigo: "USD",
    activo: true
  };
}