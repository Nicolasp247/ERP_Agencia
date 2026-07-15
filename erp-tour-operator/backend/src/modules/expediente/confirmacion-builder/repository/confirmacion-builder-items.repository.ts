// erp-tour-operator/backend/src/modules/expediente/confirmacion-builder/repository/confirmacion-builder-items.repository.ts

import { Prisma } from "@prisma/client";

import { prisma } from "@/core/db/prisma";
import type {
  ConfirmacionBuilderHotelPreviewInput,
  ConfirmacionBuilderItemInput,
  ConfirmacionBuilderMoveItemInput,
  ConfirmacionBuilderNoteInput,
  ConfirmacionBuilderPriceInput
} from "@/modules/expediente/confirmacion-builder/dto/confirmacion-builder.dto";
import { includeConfirmacionBuilderDetail } from "@/modules/expediente/confirmacion-builder/repository/confirmacion-builder.include";
import {
  addCalendarDays,
  buildConfirmacionItemSnapshot,
  isAlojamientoTipo,
  normalizeItemOrderByDate,
  toDateOnly
} from "@/modules/expediente/confirmacion-builder/repository/confirmacion-builder.helpers";

export class ConfirmacionBuilderItemsRepository {
  async createItem(
    reservaId: number,
    data: ConfirmacionBuilderItemInput,
    userId?: number | null
  ) {
    return prisma.$transaction(async (tx) => {
      const reserva = await tx.reserva.findUnique({
        where: {
          id: reservaId
        },
        include: {
          columnasSeleccionadas: {
            orderBy: {
              orden: "asc"
            }
          }
        }
      });

      if (!reserva) {
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

          tipo: true,

          alojamiento: true,

          tour: {
            include: {
              tipoGuia: true,
              idioma: true
            }
          },

          traslado: {
            include: {
              origen: true,
              destino: true
            }
          },

          tren: true,
          vuelo: true
        }
      });

      if (!servicio || !servicio.activo) {
        return "SERVICIO_NOT_FOUND" as const;
      }

      const maxOrder = await tx.reservaItem.aggregate({
        where: {
          idReserva: reservaId
        },
        _max: {
          ordenDia: true
        }
      });

      const fechaServicio = toDateOnly(data.fechaServicio);

      const snapshotItem = {
        tituloOverride: null,
        servicio,
        alojamientoDetalle: data.alojamiento
          ? {
              noches: data.alojamiento.noches,
              habitaciones: data.alojamiento.habitaciones,
              categoriaHab: data.alojamiento.categoriaHab,
              regimen: data.alojamiento.regimen
            }
          : null
      };

      const createdItem = await tx.reservaItem.create({
        data: {
          idReserva: reservaId,
          idCotizacionItemOrigen: null,
          idServicio: data.idServicio,
          fechaServicio,
          ordenDia:
            data.ordenDia ??
            Number(maxOrder._max.ordenDia ?? 0) + 1,
          esOpcional: data.esOpcional,

          tituloSnapshot: buildConfirmacionItemSnapshot(snapshotItem),

          notaLineaSnapshot: data.notaLinea?.trim() || null,
          costoCotizado: null,
          costoFinal: null,
          monedaCodigo: reserva.monedaCodigo,
          estadoItem: data.esOpcional ? "NO_APLICA" : "PENDIENTE",

          createdBy: userId ?? null,
          updatedBy: userId ?? null
        }
      });

      const tipoCodigo = String(servicio.tipo?.codigo ?? "")
        .trim()
        .toUpperCase();

      const columnasAplicables = reserva.columnasSeleccionadas.filter(
        (column) => {
          if (data.esOpcional) {
            return column.tipoSnapshot === "OPCIONALES";
          }

          if (tipoCodigo === "VUELO" || tipoCodigo === "TREN") {
            return column.tipoSnapshot === "TRANSPORTE";
          }

          if (tipoCodigo === "OTRO") {
            return data.idReservaColumnaManual
              ? column.id === data.idReservaColumnaManual
              : column.tipoSnapshot === "OTRO";
          }

          return column.tipoSnapshot === "TERRESTRE";
        }
      );

      for (const column of columnasAplicables) {
        await tx.reservaItemPrecioSeleccionado.create({
          data: {
            idReservaItem: createdItem.id,
            idReservaColumnaSeleccionada: column.id,
            precioCotizado: null,
            precioConfirmado: null,
            monedaCodigo: reserva.monedaCodigo
          }
        });
      }

      return tx.reserva.findUnique({
        where: {
          id: reservaId
        },
        include: includeConfirmacionBuilderDetail
      });
    });
  }
  
  async updateItemPrices(itemId: number, data: ConfirmacionBuilderPriceInput) {
    return prisma.$transaction(async (tx) => {
      const currentItem = await tx.reservaItem.findUnique({
        where: {
          id: itemId
        },
        select: {
          id: true,
          idReserva: true
        }
      });

      if (!currentItem) {
        return null;
      }

      const columnIds = data.prices.map((price) => price.columnId);

      const validColumns = await tx.reservaColumnaSeleccionada.findMany({
        where: {
          id: {
            in: columnIds
          },
          idReserva: currentItem.idReserva
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

        const precioConfirmado =
          price.precioConfirmado === null ? null : new Prisma.Decimal(price.precioConfirmado);

        await tx.reservaItemPrecioSeleccionado.upsert({
          where: {
            idReservaItem_idReservaColumnaSeleccionada: {
              idReservaItem: itemId,
              idReservaColumnaSeleccionada: price.columnId
            }
          },
          create: {
            idReservaItem: itemId,
            idReservaColumnaSeleccionada: price.columnId,
            precioCotizado: precioConfirmado,
            precioConfirmado,
            monedaCodigo: "USD"
          },
          update: {
            precioConfirmado,
            monedaCodigo: "USD"
          }
        });
      }

      const firstConfirmedPrice = data.prices.find(
        (price) => price.precioConfirmado !== null
      )?.precioConfirmado;

      await tx.reservaItem.update({
        where: {
          id: itemId
        },
        data: {
          costoFinal:
            firstConfirmedPrice === undefined || firstConfirmedPrice === null
              ? null
              : new Prisma.Decimal(firstConfirmedPrice)
        }
      });

      return tx.reserva.findUnique({
        where: {
          id: currentItem.idReserva
        },
        include: includeConfirmacionBuilderDetail
      });
    });
  }

  async updateItemNotes(itemId: number, data: ConfirmacionBuilderNoteInput) {
    return prisma.$transaction(async (tx) => {
      const currentItem = await tx.reservaItem.findUnique({
        where: {
          id: itemId
        },
        select: {
          id: true,
          idReserva: true
        }
      });

      if (!currentItem) {
        return null;
      }

      const updateData: {
        notaLineaSnapshot: string | null;
        tituloSnapshot?: string | null;
      } = {
        notaLineaSnapshot: data.notaLinea?.trim() || null
      };

      if ("tituloOverride" in data) {
        updateData.tituloSnapshot = data.tituloOverride?.trim() || null;
      }

      await tx.reservaItem.update({
        where: {
          id: itemId
        },
        data: updateData
      });

      return tx.reserva.findUnique({
        where: {
          id: currentItem.idReserva
        },
        include: includeConfirmacionBuilderDetail
      });
    });
  }

  async updateItemHotels(itemId: number, data: ConfirmacionBuilderHotelPreviewInput) {
    return prisma.$transaction(async (tx) => {
      const currentItem = await tx.reservaItem.findUnique({
        where: {
          id: itemId
        },
        select: {
          id: true,
          idReserva: true,
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

      const validColumns = await tx.reservaColumnaSeleccionada.findMany({
        where: {
          id: {
            in: columnIds
          },
          idReserva: currentItem.idReserva,
          tipoSnapshot: "TERRESTRE"
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
          await tx.reservaItemHotelPrevistoSeleccionado.deleteMany({
            where: {
              idReservaItem: itemId,
              idReservaColumnaSeleccionada: hotel.columnId
            }
          });

          continue;
        }

        await tx.reservaItemHotelPrevistoSeleccionado.upsert({
          where: {
            idReservaItem_idReservaColumnaSeleccionada: {
              idReservaItem: itemId,
              idReservaColumnaSeleccionada: hotel.columnId
            }
          },
          create: {
            idReservaItem: itemId,
            idReservaColumnaSeleccionada: hotel.columnId,
            textoHotel
          },
          update: {
            textoHotel
          }
        });
      }

      return tx.reserva.findUnique({
        where: {
          id: currentItem.idReserva
        },
        include: includeConfirmacionBuilderDetail
      });
    });
  }

  async moveItem(itemId: number, data: ConfirmacionBuilderMoveItemInput) {
    return prisma.$transaction(async (tx) => {
      const currentItem = await tx.reservaItem.findUnique({
        where: {
          id: itemId
        },
        select: {
          id: true,
          idReserva: true,
          fechaServicio: true,
          ordenDia: true
        }
      });

      if (!currentItem) {
        return null;
      }

      const itemsSameDate = await tx.reservaItem.findMany({
        where: {
          idReserva: currentItem.idReserva,
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
        const previousItemSameDate = itemsSameDate[currentIndex - 1];

        if (previousItemSameDate) {
          await tx.reservaItem.update({
            where: {
              id: currentItem.id
            },
            data: {
              ordenDia: previousItemSameDate.ordenDia
            }
          });

          await tx.reservaItem.update({
            where: {
              id: previousItemSameDate.id
            },
            data: {
              ordenDia: currentItem.ordenDia
            }
          });

          await normalizeItemOrderByDate(tx, currentItem.idReserva, currentItem.fechaServicio);
        } else {
          const previousDate = addCalendarDays(currentItem.fechaServicio, -1);

          const maxOrderInPreviousDate = await tx.reservaItem.aggregate({
            where: {
              idReserva: currentItem.idReserva,
              fechaServicio: previousDate
            },
            _max: {
              ordenDia: true
            }
          });

          await tx.reservaItem.update({
            where: {
              id: currentItem.id
            },
            data: {
              fechaServicio: previousDate,
              ordenDia: Number(maxOrderInPreviousDate._max.ordenDia ?? 0) + 1
            }
          });

          await normalizeItemOrderByDate(tx, currentItem.idReserva, currentItem.fechaServicio);
          await normalizeItemOrderByDate(tx, currentItem.idReserva, previousDate);
        }
      }

      if (data.direction === "DOWN") {
        const nextItemSameDate = itemsSameDate[currentIndex + 1];

        if (nextItemSameDate) {
          await tx.reservaItem.update({
            where: {
              id: currentItem.id
            },
            data: {
              ordenDia: nextItemSameDate.ordenDia
            }
          });

          await tx.reservaItem.update({
            where: {
              id: nextItemSameDate.id
            },
            data: {
              ordenDia: currentItem.ordenDia
            }
          });

          await normalizeItemOrderByDate(tx, currentItem.idReserva, currentItem.fechaServicio);
        } else {
          const nextDate = addCalendarDays(currentItem.fechaServicio, 1);

          const maxOrderInNextDate = await tx.reservaItem.aggregate({
            where: {
              idReserva: currentItem.idReserva,
              fechaServicio: nextDate
            },
            _max: {
              ordenDia: true
            }
          });

          await tx.reservaItem.update({
            where: {
              id: currentItem.id
            },
            data: {
              fechaServicio: nextDate,
              ordenDia: Number(maxOrderInNextDate._max.ordenDia ?? 0) + 1
            }
          });

          await normalizeItemOrderByDate(tx, currentItem.idReserva, currentItem.fechaServicio);
          await normalizeItemOrderByDate(tx, currentItem.idReserva, nextDate);
        }
      }

      return tx.reserva.findUnique({
        where: {
          id: currentItem.idReserva
        },
        include: includeConfirmacionBuilderDetail
      });
    });
  }

  async deleteItem(itemId: number) {
    return prisma.$transaction(async (tx) => {
      const currentItem = await tx.reservaItem.findUnique({
        where: {
          id: itemId
        },
        select: {
          id: true,
          idReserva: true
        }
      });

      if (!currentItem) {
        return null;
      }

      await tx.reservaItemHotelPrevistoSeleccionado.deleteMany({
        where: {
          idReservaItem: itemId
        }
      });

      await tx.reservaItemPrecioSeleccionado.deleteMany({
        where: {
          idReservaItem: itemId
        }
      });

      await tx.reservaItem.delete({
        where: {
          id: itemId
        }
      });

      return tx.reserva.findUnique({
        where: {
          id: currentItem.idReserva
        },
        include: includeConfirmacionBuilderDetail
      });
    });
  }
}

export const confirmacionBuilderItemsRepository =
  new ConfirmacionBuilderItemsRepository();