// erp-tour-operator/backend/src/modules/contabilidad/compras-proveedor/repository/compras-proveedor-create.repository.ts

import {
  formatDateOnly,
  formatPassengerTravelAge,
  parseDateOnly
} from "@/modules/expediente/confirmacion-builder/mapper/confirmacion-builder-date.mapper";

import {
  getFechaFinAlojamiento,
  isAlojamientoItem
} from "@/modules/expediente/confirmacion-builder/mapper/confirmacion-builder-service.mapper";

export function getReservaFechaFinViaje(
  record: any
) {
  const start =
    formatDateOnly(
      record.fechaViajePrincipal
    );

  let latest =
    parseDateOnly(start);

  for (
    const item of record.items ?? []
  ) {
    const itemEnd =
      isAlojamientoItem(item)
        ? parseDateOnly(
            getFechaFinAlojamiento(item)
          )
        : parseDateOnly(
            item.fechaServicio
          );

    if (!itemEnd) {
      continue;
    }

    if (
      !latest ||
      itemEnd.getTime() >
        latest.getTime()
    ) {
      latest = itemEnd;
    }
  }

  return latest
    ? formatDateOnly(latest)
    : start;
}

export function mapConfirmacionPassengers(
  record: any,
  fechaInicioViaje: string | null,
  fechaFinViaje: string | null
) {
  return (
    record.pasajeros ?? []
  ).map((passenger: any) => ({
    id:
      passenger.id,

    idReserva:
      passenger.idReserva,

    orden:
      passenger.orden,

    nombre:
      passenger.nombre,

    apellidos:
      passenger.apellidos,

    fechaNacimiento:
      formatDateOnly(
        passenger.fechaNacimiento
      ),

    edadEnViaje:
      formatPassengerTravelAge(
        passenger,
        fechaInicioViaje,
        fechaFinViaje
      ),

    numeroPasaporte:
      passenger.numeroPasaporte,

    fechaExpedicionPasaporte:
      formatDateOnly(
        passenger
          .fechaExpedicionPasaporte
      ),

    fechaVencimientoPasaporte:
      formatDateOnly(
        passenger
          .fechaVencimientoPasaporte
      ),

    nacionalidad:
      passenger.nacionalidad,

    createdAt:
      passenger.createdAt,

    updatedAt:
      passenger.updatedAt
  }));
}