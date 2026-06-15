/* erp-tour-operator/backend/src/modules/expediente/cotizacion-builder/repository/cotizacion-builder-prices.repository.ts */

import { Prisma } from "@prisma/client";

import { prisma } from "@/core/db/prisma";
import type { CotizacionBuilderPriceInput } from "@/modules/expediente/cotizacion-builder/dto/cotizacion-builder.dto";
import { includeBuilderDetail } from "@/modules/expediente/cotizacion-builder/repository/cotizacion-builder.include";

export class CotizacionBuilderPricesRepository {
  async updateItemPrices(itemId: number, data: CotizacionBuilderPriceInput) {
    return prisma.$transaction(async (tx) => {
      const currentItem = await tx.cotizacionItem.findUnique({
        where: {
          id: itemId
        },
        select: {
          id: true,
          idCotizacion: true
        }
      });

      if (!currentItem) {
        return null;
      }

      const columnIds = data.prices.map((price) => price.columnId);

      const validColumns = await tx.cotizacionColumna.findMany({
        where: {
          id: {
            in: columnIds
          },
          idCotizacion: currentItem.idCotizacion,
          activo: true
        },
        select: {
          id: true
        }
      });

      const validColumnIds = new Set(validColumns.map((column) => column.id));

      for (const price of data.prices) {
        if (!validColumnIds.has(price.columnId)) {
          continue;
        }

        const existingPrice = await tx.cotizacionItemPrecio.findFirst({
          where: {
            idCotizacionItem: itemId,
            idCotizacionColumna: price.columnId
          },
          select: {
            id: true
          }
        });

        const precioNeto =
          price.precioNeto === null ? null : new Prisma.Decimal(price.precioNeto);

        if (existingPrice) {
          await tx.cotizacionItemPrecio.update({
            where: {
              id: existingPrice.id
            },
            data: {
              precioNeto,
              monedaCodigo: "USD",
              precioEditadoManual: true
            }
          });

          continue;
        }

        await tx.cotizacionItemPrecio.create({
          data: {
            idCotizacionItem: itemId,
            idCotizacionColumna: price.columnId,
            precioNeto,
            monedaCodigo: "USD",
            precioEditadoManual: true
          }
        });
      }

      await tx.cotizacionItem.update({
        where: {
          id: itemId
        },
        data: {
          precioEditadoManual: true
        }
      });

      return tx.cotizacion.findUnique({
        where: {
          id: currentItem.idCotizacion
        },
        include: includeBuilderDetail
      });
    });
  }
}

export const cotizacionBuilderPricesRepository = new CotizacionBuilderPricesRepository();