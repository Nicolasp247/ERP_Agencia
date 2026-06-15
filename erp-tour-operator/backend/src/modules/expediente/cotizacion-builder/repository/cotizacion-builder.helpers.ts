/* erp-tour-operator/backend/src/modules/expediente/cotizacion-builder/repository/cotizacion-builder.helpers.ts */

import { CotizacionColumnaUnidad, Prisma } from "@prisma/client";

export function calculateCommissionTotal(
  porcentajeAgente: Prisma.Decimal,
  porcentajeWtravel: Prisma.Decimal,
  porcentajeBancario: Prisma.Decimal
) {
  return porcentajeAgente.plus(porcentajeWtravel).plus(porcentajeBancario);
}

export function calculateCommissionFactor(total: Prisma.Decimal) {
  return new Prisma.Decimal(100).minus(total).div(100);
}

export function toMysqlDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export function normalizeText(value: string | null | undefined) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function isAlojamientoTipo(tipo: { nombre?: string | null; codigo?: string | null }) {
  const nombre = normalizeText(tipo.nombre);
  const codigo = normalizeText(tipo.codigo);

  return nombre === "alojamiento" || codigo === "alojamiento";
}

export function isTransportTipo(tipo: { nombre?: string | null; codigo?: string | null }) {
  const nombre = normalizeText(tipo.nombre);
  const codigo = normalizeText(tipo.codigo);

  return nombre === "vuelo" || nombre === "tren" || codigo === "vuelo" || codigo === "tren";
}

export function isOtroTipo(tipo: { nombre?: string | null; codigo?: string | null }) {
  const nombre = normalizeText(tipo.nombre);
  const codigo = normalizeText(tipo.codigo);

  return nombre === "otro" || codigo === "otro";
}

export function mapHotelCategoryFromColumn(grupo: string) {
  const value = normalizeText(grupo);

  if (value.includes("turista superior") || value.includes("3+")) return "H3_SUPERIOR";
  if (value.includes("turista") || value.includes("3*")) return "H3_ECONOMICO";

  if (value.includes("primera superior") || value.includes("4+")) return "H4_SUPERIOR";
  if (value.includes("primera") || value.includes("4*")) return "H4_ECONOMICO";

  if (value.includes("lujo superior") || value.includes("5+")) return "H5_SUPERIOR";
  if (value.includes("lujo") || value.includes("5*")) return "H5_ECONOMICO";

  if (value.includes("super lujo") || value.includes("6*")) return "LUJO_SUPERIOR";

  return null;
}

export function mapRoomTypeFromColumn(nombre: string) {
  const value = normalizeText(nombre);

  if (value.includes("sencilla") || value.includes("single")) return "SGL";
  if (value.includes("doble")) return "DBL";
  if (value.includes("triple")) return "TPL";
  if (value.includes("cuadruple") || value.includes("cuádruple")) return "CPL";

  return null;
}

export function getAccommodationRoomCategory(alojamiento: any) {
  if (!alojamiento?.categoriaHab || alojamiento.categoriaHab === "OTRO") {
    return "ESTANDAR";
  }

  return alojamiento.categoriaHab;
}

export function getAccommodationRegimen(alojamiento: any) {
  if (alojamiento?.regimen && alojamiento.regimen !== "OTRO") {
    return alojamiento.regimen;
  }

  if (alojamiento?.desayuno) {
    return "ALOJAMIENTO_DESAYUNO";
  }

  return "SOLO_ALOJAMIENTO";
}

export function calculateAccommodationPrice({
  precioUsd,
  noches,
  habitaciones,
  unidad,
  multiplicador
}: {
  precioUsd: Prisma.Decimal;
  noches: number;
  habitaciones: number;
  unidad: CotizacionColumnaUnidad;
  multiplicador: number;
}) {
  const base = Number(precioUsd);
  const safeNoches = Math.max(1, noches);
  const safeHabitaciones = Math.max(1, habitaciones);
  const safeMultiplicador = Math.max(1, multiplicador);

  if (unidad === CotizacionColumnaUnidad.POR_PERSONA || unidad === CotizacionColumnaUnidad.POR_NINO) {
    const totalPersonas = safeMultiplicador * safeHabitaciones;
    return new Prisma.Decimal((base * safeNoches * safeHabitaciones) / totalPersonas);
  }

  if (unidad === CotizacionColumnaUnidad.POR_HABITACION) {
    return new Prisma.Decimal(base * safeNoches);
  }

  return new Prisma.Decimal(base * safeNoches * safeHabitaciones);
}

export function addCalendarDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  nextDate.setUTCHours(0, 0, 0, 0);

  return nextDate;
}