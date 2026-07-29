// erp-tour-operator/backend/src/modules/contabilidad/compras-proveedor/repository/compras-proveedor-cancel.repository.ts

import { Prisma } from "@prisma/client";

import { prisma } from "@/core/db/prisma";

import type { ComprasProveedorCancelInput } from "@/modules/contabilidad/compras-proveedor/dto/compras-proveedor.dto";

import {
  buildBookingSnapshot,
  toDateOnly,
  todayIsoDate
} from "@/modules/contabilidad/compras-proveedor/repository/compras-proveedor.helpers";

export class ComprasProveedorCancelRepository {
  async cancel(
    proveedorReservaId: number,
    data: ComprasProveedorCancelInput,
    userId?: number | null
  ) {
    return prisma.$transaction(
      async (tx) => {
        const current =
          await tx.proveedorReserva.findUnique({
            where: {
              id: proveedorReservaId
            }
          });

        if (!current) {
          return null;
        }

        if (!current.esVigente) {
          return "RESERVATION_NOT_ACTIVE" as const;
        }

        const before =
          buildBookingSnapshot(current);

        const updated =
          await tx.proveedorReserva.update({
            where: {
              id: proveedorReservaId
            },

            data: {
              estadoOperativo:
                "CANCELADA",

              esVigente: false,

              fechaCancelacion:
                toDateOnly(
                  data.fechaCancelacion ??
                    todayIsoDate()
                ),

              motivoCancelacion:
                data.motivoCancelacion,

              updatedBy:
                userId ?? null
            }
          });

        await tx.proveedorReservaEvento.create({
          data: {
            idProveedorReserva:
              proveedorReservaId,

            idUsuario:
              userId ?? null,

            tipo: "CANCELADA",

            descripcion:
              data.motivoCancelacion,

            datosAnteriores:
              before as Prisma.InputJsonValue,

            datosNuevos:
              buildBookingSnapshot(
                updated
              ) as Prisma.InputJsonValue
          }
        });

        return {
          id: updated.id
        };
      }
    );
  }
}

export const comprasProveedorCancelRepository =
  new ComprasProveedorCancelRepository();