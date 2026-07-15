/* erp-tour-operator/backend/src/modules/expediente/confirmacion-builder/repository/confirmacion-builder-passengers.repository.ts */

import { prisma } from "@/core/db/prisma";
import type { ConfirmacionPassengerInput } from "@/modules/expediente/confirmacion-builder/dto/confirmacion-builder.dto";
import { toDateOnly } from "@/modules/expediente/confirmacion-builder/repository/confirmacion-builder.helpers";

export class ConfirmacionBuilderPassengersRepository {
  async createPassenger(
    reservaId: number,
    data: ConfirmacionPassengerInput,
    userId?: number | null
  ) {
    const reserva = await prisma.reserva.findUnique({
      where: {
        id: reservaId
      },
      select: {
        id: true
      }
    });

    if (!reserva) {
      return null;
    }

    const latestPassenger = await prisma.reservaPasajero.findFirst({
      where: {
        idReserva: reservaId
      },
      orderBy: {
        orden: "desc"
      },
      select: {
        orden: true
      }
    });

    return prisma.reservaPasajero.create({
      data: {
        idReserva: reservaId,
        orden: (latestPassenger?.orden ?? 0) + 1,
        nombre: data.nombre,
        apellidos: data.apellidos,
        fechaNacimiento: toDateOnly(data.fechaNacimiento),
        numeroPasaporte: data.numeroPasaporte,
        fechaExpedicionPasaporte: toDateOnly(
          data.fechaExpedicionPasaporte
        ),
        fechaVencimientoPasaporte: toDateOnly(
          data.fechaVencimientoPasaporte
        ),
        nacionalidad: data.nacionalidad,
        createdBy: userId ?? null,
        updatedBy: userId ?? null
      }
    });
  }

  async updatePassenger(
    passengerId: number,
    data: ConfirmacionPassengerInput,
    userId?: number | null
  ) {
    const passenger = await prisma.reservaPasajero.findUnique({
      where: {
        id: passengerId
      },
      select: {
        id: true
      }
    });

    if (!passenger) {
      return null;
    }

    return prisma.reservaPasajero.update({
      where: {
        id: passengerId
      },
      data: {
        nombre: data.nombre,
        apellidos: data.apellidos,
        fechaNacimiento: toDateOnly(data.fechaNacimiento),
        numeroPasaporte: data.numeroPasaporte,
        fechaExpedicionPasaporte: toDateOnly(
          data.fechaExpedicionPasaporte
        ),
        fechaVencimientoPasaporte: toDateOnly(
          data.fechaVencimientoPasaporte
        ),
        nacionalidad: data.nacionalidad,
        updatedBy: userId ?? null
      }
    });
  }

  async deletePassenger(passengerId: number) {
    const passenger = await prisma.reservaPasajero.findUnique({
      where: {
        id: passengerId
      },
      select: {
        id: true
      }
    });

    if (!passenger) {
      return null;
    }

    await prisma.reservaPasajero.delete({
      where: {
        id: passengerId
      }
    });

    return {
      id: passengerId
    };
  }
}

export const confirmacionBuilderPassengersRepository =
  new ConfirmacionBuilderPassengersRepository();