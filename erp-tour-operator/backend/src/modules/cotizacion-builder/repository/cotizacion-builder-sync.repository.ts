/* erp-tour-operator/backend/src/modules/cotizacion-builder/repository/cotizacion-builder-sync.repository.ts */

import { CotizacionColumnaTipo, Prisma } from "@prisma/client";

import {
  calculateAccommodationPrice,
  getAccommodationRegimen,
  getAccommodationRoomCategory,
  isAlojamientoTipo,
  isOtroTipo,
  isTransportTipo,
  mapHotelCategoryFromColumn,
  mapRoomTypeFromColumn
} from "@/modules/cotizacion-builder/repository/cotizacion-builder.helpers";

export class CotizacionBuilderSyncRepository {
  async syncPriceMatrixWithClient(tx: Prisma.TransactionClient, versionId: number) {
    const items = await tx.cotizacionItem.findMany({
      where: {
        idCotizacion: versionId
      },
      select: {
        id: true,
        idServicio: true,
        fechaServicio: true,
        esOpcional: true,
        alojamientoDetalle: true,
        servicio: {
          select: {
            idCiudad: true,
            alojamiento: true,
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

    const columns = await tx.cotizacionColumna.findMany({
      where: {
        idCotizacion: versionId,
        activo: true
      },
      select: {
        id: true,
        tipo: true,
        grupo: true,
        nombre: true,
        unidad: true,
        multiplicador: true
      }
    });

    if (!items.length || !columns.length) {
      return;
    }

    const existingPrices = await tx.cotizacionItemPrecio.findMany({
      where: {
        idCotizacionItem: {
          in: items.map((item) => item.id)
        },
        idCotizacionColumna: {
          in: columns.map((column) => column.id)
        }
      },
      select: {
        id: true,
        idCotizacionItem: true,
        idCotizacionColumna: true,
        precioNeto: true,
        precioEditadoManual: true
      }
    });

    const existingPricesByKey = new Map(
      existingPrices.map((price) => [
        `${price.idCotizacionItem}-${price.idCotizacionColumna}`,
        price
      ])
    );

    const tarifaByItemId = new Map<
      number,
      {
        precioNeto: Prisma.Decimal;
        monedaCodigo: string;
      } | null
    >();

    for (const item of items) {
      if (isAlojamientoTipo(item.servicio.tipo)) {
        tarifaByItemId.set(item.id, null);
        continue;
      }

      const tarifa = await tx.servicioTarifa.findFirst({
        where: {
          idServicio: item.idServicio,
          activo: true,
          fechaDesde: {
            lte: item.fechaServicio
          },
          fechaHasta: {
            gte: item.fechaServicio
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

      tarifaByItemId.set(item.id, tarifa);
    }

    const pricesToCreate: Array<{
      idCotizacionItem: number;
      idCotizacionColumna: number;
      precioNeto: Prisma.Decimal | null;
      monedaCodigo: string;
      precioEditadoManual: boolean;
    }> = [];

    for (const item of items) {
      const isAlojamiento = isAlojamientoTipo(item.servicio.tipo);
      const tarifa = tarifaByItemId.get(item.id) ?? null;

      const allowedColumns = columns.filter((column) => {
        if (item.esOpcional) {
          return column.tipo === CotizacionColumnaTipo.OPCIONALES;
        }

        if (isTransportTipo(item.servicio.tipo)) {
          return column.tipo === CotizacionColumnaTipo.TRANSPORTE;
        }

        if (isOtroTipo(item.servicio.tipo)) {
          return false;
        }

        return column.tipo === CotizacionColumnaTipo.TERRESTRE;
      });

      for (const column of allowedColumns) {
        const key = `${item.id}-${column.id}`;
        const existingPrice = existingPricesByKey.get(key);

        if (existingPrice) {
          continue;
        }

        if (isAlojamiento && !item.esOpcional) {
          const categoria = mapHotelCategoryFromColumn(column.grupo);
          const tipoHabitacion = mapRoomTypeFromColumn(column.nombre);

          if (!categoria || !tipoHabitacion) {
            pricesToCreate.push({
              idCotizacionItem: item.id,
              idCotizacionColumna: column.id,
              precioNeto: null,
              monedaCodigo: "USD",
              precioEditadoManual: false
            });

            continue;
          }

          const categoriaHab =
            item.alojamientoDetalle?.categoriaHab ??
            getAccommodationRoomCategory(item.servicio.alojamiento);

          const regimen =
            item.alojamientoDetalle?.regimen ??
            getAccommodationRegimen(item.servicio.alojamiento);

          const alojamientoPrecio = await tx.alojamientoPrecioMes.findFirst({
            where: {
              idCiudad: item.servicio.idCiudad,
              categoria,
              categoriaHab,
              regimen,
              tipoHabitacion,
              activo: true,
              fechaDesde: {
                lte: item.fechaServicio
              },
              fechaHasta: {
                gte: item.fechaServicio
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
              precioUsd: true,
              monedaCodigo: true
            }
          });

          pricesToCreate.push({
            idCotizacionItem: item.id,
            idCotizacionColumna: column.id,
            precioNeto: alojamientoPrecio?.precioUsd
              ? calculateAccommodationPrice({
                  precioUsd: alojamientoPrecio.precioUsd,
                  noches: item.alojamientoDetalle?.noches ?? 1,
                  habitaciones: item.alojamientoDetalle?.habitaciones ?? 1,
                  unidad: column.unidad,
                  multiplicador: column.multiplicador
                })
              : null,
            monedaCodigo: alojamientoPrecio?.monedaCodigo ?? "USD",
            precioEditadoManual: false
          });

          continue;
        }

        pricesToCreate.push({
          idCotizacionItem: item.id,
          idCotizacionColumna: column.id,
          precioNeto: tarifa?.precioNeto ?? null,
          monedaCodigo: tarifa?.monedaCodigo ?? "USD",
          precioEditadoManual: false
        });
      }
    }

    if (pricesToCreate.length) {
      await tx.cotizacionItemPrecio.createMany({
        data: pricesToCreate,
        skipDuplicates: true
      });
    }
  }
}

export const cotizacionBuilderSyncRepository = new CotizacionBuilderSyncRepository();