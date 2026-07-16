/* erp-tour-operator/backend/src/modules/expediente/confirmacion-builder/dto/confirmacion-builder.dto.ts */

import { Prisma } from "@prisma/client";

import { prisma } from "@/core/db/prisma";
import type { ConfirmacionBuilderPurchaseInput } from "@/modules/expediente/confirmacion-builder/dto/confirmacion-builder.dto";
import { includeConfirmacionBuilderDetail } from "@/modules/expediente/confirmacion-builder/repository/confirmacion-builder.include";
import { toDateOnly } from "@/modules/expediente/confirmacion-builder/repository/confirmacion-builder.helpers";

function buildCompraProveedorCode(
  reservaId: number,
  itemId: number
) {
  const year = new Date().getUTCFullYear();

  return [
    "CP",
    year,
    String(reservaId).padStart(6, "0"),
    String(itemId).padStart(6, "0")
  ].join("-");
}

function toNullableDateTime(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export class ConfirmacionBuilderPurchasesRepository {
  async upsertItemPurchase(
    itemId: number,
    data: ConfirmacionBuilderPurchaseInput,
    userId?: number | null
  ) {
    return prisma.$transaction(async (tx) => {
      const item = await tx.reservaItem.findUnique({
        where: {
          id: itemId
        },
        select: {
          id: true,
          idReserva: true,

          servicio: {
            select: {
              idProveedor: true
            }
          },

          compraProveedorItem: {
            select: {
              idCompraProveedor: true
            }
          }
        }
      });

      if (!item) {
        return null;
      }

      if (!item.servicio.idProveedor) {
        return "PROVEEDOR_NOT_FOUND" as const;
      }

      const purchaseData = {
        idProveedor: item.servicio.idProveedor,

        codigoConfirmacionProveedor:
          data.codigoConfirmacionProveedor?.trim() || null,

        estado: data.estado,

        fechaConfirmacion: data.fechaConfirmacion
          ? toDateOnly(data.fechaConfirmacion)
          : null,

        tipoCancelacion: data.tipoCancelacion,

        fechaLimiteCancelacion: toNullableDateTime(
          data.fechaLimiteCancelacion
        ),

        zonaHorariaCancelacion:
          data.zonaHorariaCancelacion?.trim() || null,

        totalConfirmado:
          data.totalConfirmado === null
            ? null
            : new Prisma.Decimal(data.totalConfirmado),

        monedaCodigo: data.monedaCodigo.toUpperCase(),

        notaAdministrativa:
          data.notaAdministrativa?.trim() || null,

        updatedBy: userId ?? null
      };

      if (item.compraProveedorItem) {
        await tx.compraProveedor.update({
          where: {
            id: item.compraProveedorItem.idCompraProveedor
          },
          data: purchaseData
        });
      } else {
        const compra = await tx.compraProveedor.create({
          data: {
            idReserva: item.idReserva,
            codigoInterno: buildCompraProveedorCode(
              item.idReserva,
              item.id
            ),

            ...purchaseData,

            createdBy: userId ?? null
          }
        });

        await tx.compraProveedorItem.create({
          data: {
            idCompraProveedor: compra.id,
            idReservaItem: item.id
          }
        });
      }

      return tx.reserva.findUnique({
        where: {
          id: item.idReserva
        },
        include: includeConfirmacionBuilderDetail
      });
    });
  }
}

export const confirmacionBuilderPurchasesRepository =
  new ConfirmacionBuilderPurchasesRepository();