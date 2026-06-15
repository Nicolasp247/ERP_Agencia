/* erp-tour-operator/backend/src/modules/expediente/cotizacion-builder/repository/cotizacion-builder-hotels.repository.ts */

import { CotizacionColumnaTipo } from "@prisma/client";

import { prisma } from "@/core/db/prisma";
import type { CotizacionBuilderHotelPreviewInput } from "@/modules/expediente/cotizacion-builder/dto/cotizacion-builder.dto";
import { isAlojamientoTipo } from "@/modules/expediente/cotizacion-builder/repository/cotizacion-builder.helpers";
import { includeBuilderDetail } from "@/modules/expediente/cotizacion-builder/repository/cotizacion-builder.include";

export class CotizacionBuilderHotelsRepository {
  async updateItemHotels(itemId: number, data: CotizacionBuilderHotelPreviewInput) {
    return prisma.$transaction(async (tx) => {
      const currentItem = await tx.cotizacionItem.findUnique({
        where: {
          id: itemId
        },
        select: {
          id: true,
          idCotizacion: true,
          servicio: {
            select: {
              tipo: {
                select: {
                  nombre: true,
                  codigo: true
                }
              }
            }
          }
        }
      });

      if (!currentItem) {
        return null;
      }

      if (!isAlojamientoTipo(currentItem.servicio.tipo)) {
        return "ITEM_NOT_ACCOMMODATION" as const;
      }

      const columnIds = Array.from(new Set(data.hotels.map((hotel) => hotel.columnId)));

      const validColumns = await tx.cotizacionColumna.findMany({
        where: {
          id: {
            in: columnIds
          },
          idCotizacion: currentItem.idCotizacion,
          tipo: CotizacionColumnaTipo.TERRESTRE,
          activo: true
        },
        select: {
          id: true
        }
      });

      const validColumnIds = new Set(validColumns.map((column) => column.id));

      for (const hotel of data.hotels) {
        if (!validColumnIds.has(hotel.columnId)) {
          continue;
        }

        const textoHotel = hotel.textoHotel?.trim() ?? "";

        if (!textoHotel) {
          await tx.cotizacionItemHotelPrevisto.deleteMany({
            where: {
              idCotizacionItem: itemId,
              idCotizacionColumna: hotel.columnId
            }
          });

          continue;
        }

        await tx.cotizacionItemHotelPrevisto.upsert({
          where: {
            idCotizacionItem_idCotizacionColumna: {
              idCotizacionItem: itemId,
              idCotizacionColumna: hotel.columnId
            }
          },
          create: {
            idCotizacionItem: itemId,
            idCotizacionColumna: hotel.columnId,
            textoHotel
          },
          update: {
            textoHotel
          }
        });
      }

      return tx.cotizacion.findUnique({
        where: {
          id: currentItem.idCotizacion
        },
        include: includeBuilderDetail
      });
    });
  }
}

export const cotizacionBuilderHotelsRepository = new CotizacionBuilderHotelsRepository();