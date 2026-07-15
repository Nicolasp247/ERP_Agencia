/* erp-tour-operator/backend/src/modules/expediente/confirmacion-builder/repository/confirmacion-builder.helpers.ts */

import type { Prisma } from "@prisma/client";

import { buildServicioCotizacionTexto } from "@/modules/servicio/helpers/servicio-display.helper";

export function buildReservaCode(cotizacionId: number) {
  return `RES-${String(cotizacionId).padStart(6, "0")}`;
}

export function toDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export function addCalendarDays(value: Date, days: number) {
  const next = new Date(value);

  next.setUTCDate(next.getUTCDate() + days);
  next.setUTCHours(0, 0, 0, 0);

  return next;
}

export function isAlojamientoTipo(
  tipo:
    | {
        nombre?: string | null;
        codigo?: string | null;
      }
    | null
    | undefined
) {
  const nombre = String(tipo?.nombre ?? "")
    .trim()
    .toLowerCase();

  const codigo = String(tipo?.codigo ?? "")
    .trim()
    .toLowerCase();

  return nombre === "alojamiento" || codigo === "alojamiento";
}

function labelCategoriaHabitacion(alojamiento: any) {
  if (!alojamiento) {
    return "habitación estándar";
  }

  if (alojamiento.categoriaHab === "OTRO") {
    return "habitación";
  }

  const labels: Record<string, string> = {
    ESTANDAR: "habitación estándar",
    SUPERIOR: "habitación superior",
    SUITE: "suite"
  };

  return labels[alojamiento.categoriaHab] ?? "habitación estándar";
}

function labelRegimen(alojamiento: any) {
  if (!alojamiento) {
    return "desayuno diario";
  }

  const labels: Record<string, string> = {
    SOLO_ALOJAMIENTO: "solo alojamiento",
    ALOJAMIENTO_DESAYUNO: "desayuno diario",
    TODO_INCLUIDO: "todo incluido",
    OTRO: "régimen especial"
  };

  return labels[alojamiento.regimen] ?? "desayuno diario";
}

function buildAlojamientoSnapshot(item: any) {
  const detalle = item.alojamientoDetalle;

  const noches = Number(detalle?.noches ?? 1);
  const habitaciones = Number(detalle?.habitaciones ?? 1);

  const nochesText = noches === 1 ? "1 noche" : `${noches} noches`;
  const categoriaText = labelCategoriaHabitacion(detalle);

  const habitacionesText =
    habitaciones > 1
      ? `${habitaciones} ${categoriaText.replace(
          "habitación",
          "habitaciones"
        )}`
      : categoriaText;

  return [
    `Alojamiento ${nochesText}`,
    habitacionesText,
    labelRegimen(detalle)
  ].join(", ");
}

export function buildConfirmacionItemSnapshot(item: any) {
  if (item.tituloOverride?.trim()) {
    return item.tituloOverride.trim();
  }

  if (isAlojamientoTipo(item.servicio?.tipo)) {
    return buildAlojamientoSnapshot(item);
  }

  return buildServicioCotizacionTexto(item.servicio);
}

export async function normalizeItemOrderByDate(
  tx: Prisma.TransactionClient,
  reservaId: number,
  fechaServicio: Date
) {
  const items = await tx.reservaItem.findMany({
    where: {
      idReserva: reservaId,
      fechaServicio
    },
    orderBy: [
      {
        ordenDia: "asc"
      },
      {
        id: "asc"
      }
    ],
    select: {
      id: true
    }
  });

  await Promise.all(
    items.map((item, index) =>
      tx.reservaItem.update({
        where: {
          id: item.id
        },
        data: {
          ordenDia: index + 1
        }
      })
    )
  );
}