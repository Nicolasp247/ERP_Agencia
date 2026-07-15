// erp-tour-operator/backend/src/modules/expediente/confirmacion-builder/repository/confirmacion-builder-lifecycle.repository.ts

import { prisma } from "@/core/db/prisma";
import type { ConfirmacionBuilderFreeNotesInput } from "@/modules/expediente/confirmacion-builder/dto/confirmacion-builder.dto";
import { includeConfirmacionBuilderDetail } from "@/modules/expediente/confirmacion-builder/repository/confirmacion-builder.include";

export class ConfirmacionBuilderLifecycleRepository {
  async updateFreeNotes(
    versionId: number,
    data: ConfirmacionBuilderFreeNotesInput
  ) {
    return prisma.$transaction(async (tx) => {
      const reserva = await tx.reserva.findUnique({
        where: {
          idCotizacionOrigen: versionId
        },
        select: {
          id: true
        }
      });

      if (!reserva) {
        return null;
      }

      await tx.reserva.update({
        where: {
          id: reserva.id
        },
        data: {
          nota: data.nota?.trim() || null
        }
      });

      return tx.reserva.findUnique({
        where: {
          id: reserva.id
        },
        include: includeConfirmacionBuilderDetail
      });
    });
  }

  deleteByVersionId(
    versionId: number,
    userId?: number | null
  ) {
    return prisma.$transaction(async (tx) => {
      const reserva = await tx.reserva.findUnique({
        where: {
          idCotizacionOrigen: versionId
        },
        include: {
          cotizacionOrigen: {
            select: {
              id: true,
              idExpediente: true
            }
          },
          items: {
            select: {
              id: true
            }
          }
        }
      });

      if (!reserva) {
        return null;
      }

      const reservaItemIds = reserva.items.map((item) => item.id);

      if (reservaItemIds.length > 0) {
        await tx.reservaItemHotelPrevistoSeleccionado.deleteMany({
          where: {
            idReservaItem: {
              in: reservaItemIds
            }
          }
        });

        await tx.reservaItemPrecioSeleccionado.deleteMany({
          where: {
            idReservaItem: {
              in: reservaItemIds
            }
          }
        });

        await tx.reservaItem.deleteMany({
          where: {
            idReserva: reserva.id
          }
        });
      }

      await tx.reservaPasajero.deleteMany({
        where: {
          idReserva: reserva.id
        }
      });
      
      await tx.reservaColumnaSeleccionada.deleteMany({
        where: {
          idReserva: reserva.id
        }
      });

      await tx.reserva.delete({
        where: {
          id: reserva.id
        }
      });

      await tx.cotizacion.update({
        where: {
          id: versionId
        },
        data: {
          fechaConvertidaReserva: null,
          updatedBy: userId ?? null
        }
      });

      const remainingReservas = await tx.reserva.count({
        where: {
          cotizacionOrigen: {
            idExpediente: reserva.cotizacionOrigen.idExpediente
          }
        }
      });

      if (remainingReservas === 0) {
        await tx.expediente.update({
          where: {
            id: reserva.cotizacionOrigen.idExpediente
          },
          data: {
            estado: "COTIZACION",
            updatedBy: userId ?? null
          }
        });
      }

      return {
        id: reserva.id,
        idExpediente: reserva.cotizacionOrigen.idExpediente,
        idCotizacionOrigen: versionId
      };
    });
  }
}

export const confirmacionBuilderLifecycleRepository =
  new ConfirmacionBuilderLifecycleRepository();