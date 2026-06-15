/* erp-tour-operator/backend/src/modules/expediente/cotizacion-builder/repository/cotizacion-builder-items.repository.ts */

import { CotizacionColumnaTipo, Prisma } from "@prisma/client";

import { prisma } from "@/core/db/prisma";
import type {
  CotizacionBuilderItemInput,
  CotizacionBuilderMoveItemInput,
  CotizacionBuilderNoteInput
} from "@/modules/expediente/cotizacion-builder/dto/cotizacion-builder.dto";
import {
  addCalendarDays,
  isAlojamientoTipo,
  toMysqlDate
} from "@/modules/expediente/cotizacion-builder/repository/cotizacion-builder.helpers";
import { includeBuilderDetail } from "@/modules/expediente/cotizacion-builder/repository/cotizacion-builder.include";
import { cotizacionBuilderSyncRepository } from "@/modules/expediente/cotizacion-builder/repository/cotizacion-builder-sync.repository";

export class CotizacionBuilderItemsRepository {
  async createItem(versionId: number, data: CotizacionBuilderItemInput) {
    return prisma.$transaction(async (tx) => {
      const version = await tx.cotizacion.findUnique({
        where: {
          id: versionId
        },
        select: {
          id: true
        }
      });

      if (!version) {
        return null;
      }

      const servicio = await tx.servicio.findUnique({
        where: {
          id: data.idServicio
        },
        include: {
          proveedor: {
            select: {
              codigo: true,
              nombreComercial: true
            }
          },
          tipo: {
            select: {
              nombre: true,
              codigo: true
            }
          },
          alojamiento: true
        }
      });

      if (!servicio || !servicio.activo) {
        return "SERVICIO_NOT_FOUND" as const;
      }

      const maxOrder = await tx.cotizacionItem.aggregate({
        where: {
          idCotizacion: versionId
        },
        _max: {
          ordenDia: true
        }
      });

      const createdItem = await tx.cotizacionItem.create({
        data: {
          idCotizacion: versionId,
          idServicio: data.idServicio,
          fechaServicio: toMysqlDate(data.fechaServicio),
          ordenDia: data.ordenDia ?? Number(maxOrder._max.ordenDia ?? 0) + 1,
          esOpcional: data.esOpcional,
          operadorMostrado:
            servicio.proveedor?.codigo ??
            servicio.proveedor?.nombreComercial ??
            null,
          linkOperador: servicio.linkReserva ?? null,
          notaLinea: data.notaLinea?.trim() || null,
          precioMonedaCodigo: "USD"
        }
      });

      if (isAlojamientoTipo(servicio.tipo)) {
        await tx.cotizacionItemAlojamiento.create({
          data: {
            idCotizacionItem: createdItem.id,
            noches: data.alojamiento?.noches ?? 1,
            habitaciones: data.alojamiento?.habitaciones ?? 1,
            categoriaHab: data.alojamiento?.categoriaHab ?? "ESTANDAR",
            regimen: data.alojamiento?.regimen ?? "ALOJAMIENTO_DESAYUNO"
          }
        });
      }

      await cotizacionBuilderSyncRepository.syncPriceMatrixWithClient(tx, versionId);

      if (data.idCotizacionColumnaManual && !data.esOpcional) {
        const manualColumn = await tx.cotizacionColumna.findFirst({
          where: {
            id: data.idCotizacionColumnaManual,
            idCotizacion: versionId,
            tipo: CotizacionColumnaTipo.OTRO,
            activo: true
          },
          select: {
            id: true
          }
        });

        if (manualColumn) {
          const tarifa = await tx.servicioTarifa.findFirst({
            where: {
              idServicio: data.idServicio,
              activo: true,
              fechaDesde: {
                lte: createdItem.fechaServicio
              },
              fechaHasta: {
                gte: createdItem.fechaServicio
              }
            },
            orderBy: [
              {
                fechaDesde: "desc"
              },
              {
                id: "desc"
              }
            ],
            select: {
              precioNeto: true,
              monedaCodigo: true
            }
          });

          await tx.cotizacionItemPrecio.create({
            data: {
              idCotizacionItem: createdItem.id,
              idCotizacionColumna: manualColumn.id,
              precioNeto: tarifa?.precioNeto ?? null,
              monedaCodigo: tarifa?.monedaCodigo ?? "USD",
              precioEditadoManual: false
            }
          });
        }
      }

      return tx.cotizacion.findUnique({
        where: {
          id: versionId
        },
        include: includeBuilderDetail
      });
    });
  }

  async deleteItem(itemId: number) {
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

      await tx.cotizacionItemPrecio.deleteMany({
        where: {
          idCotizacionItem: itemId
        }
      });

      await tx.cotizacionItem.delete({
        where: {
          id: itemId
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

  updateItemNotes(itemId: number, data: CotizacionBuilderNoteInput) {
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

      const updateData: {
        notaLinea: string | null;
        tituloOverride?: string | null;
      } = {
        notaLinea: data.notaLinea?.trim() || null
      };

      if ("tituloOverride" in data) {
        updateData.tituloOverride = data.tituloOverride?.trim() || null;
      }

      await tx.cotizacionItem.update({
        where: {
          id: itemId
        },
        data: updateData
      });

      return tx.cotizacion.findUnique({
        where: {
          id: currentItem.idCotizacion
        },
        include: includeBuilderDetail
      });
    });
  }

  async moveItem(itemId: number, data: CotizacionBuilderMoveItemInput) {
    return prisma.$transaction(async (tx) => {
      const currentItem = await tx.cotizacionItem.findUnique({
        where: {
          id: itemId
        },
        select: {
          id: true,
          idCotizacion: true,
          fechaServicio: true,
          ordenDia: true
        }
      });

      if (!currentItem) {
        return null;
      }

      const itemsSameDate = await tx.cotizacionItem.findMany({
        where: {
          idCotizacion: currentItem.idCotizacion,
          fechaServicio: currentItem.fechaServicio
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
          id: true,
          ordenDia: true
        }
      });

      const currentIndex = itemsSameDate.findIndex((item) => item.id === itemId);

      if (currentIndex === -1) {
        return null;
      }

      if (data.direction === "UP") {
        await this.moveItemUp(tx, currentItem, itemsSameDate, currentIndex);
      }

      if (data.direction === "DOWN") {
        await this.moveItemDown(tx, currentItem, itemsSameDate, currentIndex);
      }

      return tx.cotizacion.findUnique({
        where: {
          id: currentItem.idCotizacion
        },
        include: includeBuilderDetail
      });
    });
  }

  private async moveItemUp(
    tx: Prisma.TransactionClient,
    currentItem: {
      id: number;
      idCotizacion: number;
      fechaServicio: Date;
      ordenDia: number;
    },
    itemsSameDate: Array<{
      id: number;
      ordenDia: number;
    }>,
    currentIndex: number
  ) {
    const previousItemSameDate = itemsSameDate[currentIndex - 1];

    if (previousItemSameDate) {
      await tx.cotizacionItem.update({
        where: {
          id: currentItem.id
        },
        data: {
          ordenDia: previousItemSameDate.ordenDia
        }
      });

      await tx.cotizacionItem.update({
        where: {
          id: previousItemSameDate.id
        },
        data: {
          ordenDia: currentItem.ordenDia
        }
      });

      await this.normalizeItemOrderByDate(tx, currentItem.idCotizacion, currentItem.fechaServicio);
      return;
    }

    const previousDate = addCalendarDays(currentItem.fechaServicio, -1);

    const maxOrderInPreviousDate = await tx.cotizacionItem.aggregate({
      where: {
        idCotizacion: currentItem.idCotizacion,
        fechaServicio: previousDate
      },
      _max: {
        ordenDia: true
      }
    });

    await tx.cotizacionItem.update({
      where: {
        id: currentItem.id
      },
      data: {
        fechaServicio: previousDate,
        ordenDia: Number(maxOrderInPreviousDate._max.ordenDia ?? 0) + 1
      }
    });

    await this.normalizeItemOrderByDate(tx, currentItem.idCotizacion, currentItem.fechaServicio);
    await this.normalizeItemOrderByDate(tx, currentItem.idCotizacion, previousDate);
  }

  private async moveItemDown(
    tx: Prisma.TransactionClient,
    currentItem: {
      id: number;
      idCotizacion: number;
      fechaServicio: Date;
      ordenDia: number;
    },
    itemsSameDate: Array<{
      id: number;
      ordenDia: number;
    }>,
    currentIndex: number
  ) {
    const nextItemSameDate = itemsSameDate[currentIndex + 1];

    if (nextItemSameDate) {
      await tx.cotizacionItem.update({
        where: {
          id: currentItem.id
        },
        data: {
          ordenDia: nextItemSameDate.ordenDia
        }
      });

      await tx.cotizacionItem.update({
        where: {
          id: nextItemSameDate.id
        },
        data: {
          ordenDia: currentItem.ordenDia
        }
      });

      await this.normalizeItemOrderByDate(tx, currentItem.idCotizacion, currentItem.fechaServicio);
      return;
    }

    const nextDate = addCalendarDays(currentItem.fechaServicio, 1);

    const maxOrderInNextDate = await tx.cotizacionItem.aggregate({
      where: {
        idCotizacion: currentItem.idCotizacion,
        fechaServicio: nextDate
      },
      _max: {
        ordenDia: true
      }
    });

    await tx.cotizacionItem.update({
      where: {
        id: currentItem.id
      },
      data: {
        fechaServicio: nextDate,
        ordenDia: Number(maxOrderInNextDate._max.ordenDia ?? 0) + 1
      }
    });

    await this.normalizeItemOrderByDate(tx, currentItem.idCotizacion, currentItem.fechaServicio);
    await this.normalizeItemOrderByDate(tx, currentItem.idCotizacion, nextDate);
  }

  private async normalizeItemOrderByDate(
    tx: Prisma.TransactionClient,
    versionId: number,
    fechaServicio: Date
  ) {
    const items = await tx.cotizacionItem.findMany({
      where: {
        idCotizacion: versionId,
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
        tx.cotizacionItem.update({
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
}

export const cotizacionBuilderItemsRepository = new CotizacionBuilderItemsRepository();