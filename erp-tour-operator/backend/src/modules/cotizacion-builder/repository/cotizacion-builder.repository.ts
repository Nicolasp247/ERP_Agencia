/* erp-tour-operator/backend/src/modules/cotizacion-builder/repository/cotizacion-builder.repository.ts */

import {
  CotizacionColumnaTipo,
  CotizacionColumnaUnidad,
  Prisma
} from "@prisma/client";

import { prisma } from "@/core/db/prisma";
import type {
  CotizacionBuilderColumnInput,
  CotizacionBuilderItemInput,
  CotizacionBuilderPriceInput
} from "@/modules/cotizacion-builder/dto/cotizacion-builder.dto";

const DEFAULT_COLUMNS = [
  {
    grupo: "Turista (3*)",
    nombre: "Doble",
    tipo: CotizacionColumnaTipo.TERRESTRE,
    unidad: CotizacionColumnaUnidad.POR_PERSONA,
    multiplicador: 2,
    orden: 1
  },
  {
    grupo: "Lujo (5*)",
    nombre: "Doble",
    tipo: CotizacionColumnaTipo.TERRESTRE,
    unidad: CotizacionColumnaUnidad.POR_PERSONA,
    multiplicador: 2,
    orden: 2
  },
  {
    grupo: "Económica",
    nombre: "Adulto",
    tipo: CotizacionColumnaTipo.TRANSPORTE,
    unidad: CotizacionColumnaUnidad.POR_PERSONA,
    multiplicador: 1,
    orden: 3
  },
  {
    grupo: "General",
    nombre: "Adulto",
    tipo: CotizacionColumnaTipo.OPCIONALES,
    unidad: CotizacionColumnaUnidad.POR_PERSONA,
    multiplicador: 1,
    orden: 4
  }
];

function toMysqlDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export class CotizacionBuilderRepository {
  private includeBuilderDetail = {
    expediente: {
      include: {
        cliente: {
          select: {
            id: true,
            nombreCompleto: true
          }
        },
        clienteAgente: {
          select: {
            id: true,
            codigo: true,
            razonSocial: true
          }
        },
        destinoPrincipal: true
      }
    },
    columnas: {
      orderBy: {
        orden: "asc" as const
      }
    },
    items: {
      include: {
        servicio: {
          include: {
            proveedor: {
              select: {
                id: true,
                nombreComercial: true
              }
            },
            tipo: true
          }
        },
        precios: true
      },
      orderBy: [
        {
          fechaServicio: "asc" as const
        },
        {
          ordenDia: "asc" as const
        }
      ]
    }
  } satisfies Prisma.CotizacionInclude;

  findVersionById(versionId: number) {
    return prisma.cotizacion.findUnique({
      where: {
        id: versionId
      },
      include: this.includeBuilderDetail
    });
  }

  async ensureDefaultColumns(versionId: number) {
    const count = await prisma.cotizacionColumna.count({
      where: {
        idCotizacion: versionId
      }
    });

    if (count > 0) {
      return;
    }

    await prisma.cotizacionColumna.createMany({
      data: DEFAULT_COLUMNS.map((column) => ({
        idCotizacion: versionId,
        grupo: column.grupo,
        nombre: column.nombre,
        tipo: column.tipo,
        unidad: column.unidad,
        multiplicador: column.multiplicador,
        orden: column.orden,
        activo: true
      }))
    });

    await this.syncPriceMatrix(versionId);
  }

  async createColumn(versionId: number, data: CotizacionBuilderColumnInput) {
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

      const maxOrder = await tx.cotizacionColumna.aggregate({
        where: {
          idCotizacion: versionId,
          activo: true
        },
        _max: {
          orden: true
        }
      });

      await tx.cotizacionColumna.create({
        data: {
          idCotizacion: versionId,
          grupo: data.grupo,
          nombre: data.nombre,
          tipo: data.tipo,
          unidad: data.unidad,
          multiplicador: data.multiplicador,
          orden: data.orden ?? Number(maxOrder._max.orden ?? 0) + 1,
          activo: true
        }
      });

      await this.syncPriceMatrixWithClient(tx, versionId);

      return tx.cotizacion.findUnique({
        where: {
          id: versionId
        },
        include: this.includeBuilderDetail
      });
    });
  }

  async updateColumn(columnId: number, data: CotizacionBuilderColumnInput) {
    return prisma.$transaction(async (tx) => {
      const currentColumn = await tx.cotizacionColumna.findUnique({
        where: {
          id: columnId
        },
        select: {
          id: true,
          idCotizacion: true
        }
      });

      if (!currentColumn) {
        return null;
      }

      await tx.cotizacionColumna.update({
        where: {
          id: columnId
        },
        data: {
          grupo: data.grupo,
          nombre: data.nombre,
          tipo: data.tipo,
          unidad: data.unidad,
          multiplicador: data.multiplicador,
          orden: data.orden ?? undefined,
          activo: true
        }
      });

      await this.syncPriceMatrixWithClient(tx, currentColumn.idCotizacion);

      return tx.cotizacion.findUnique({
        where: {
          id: currentColumn.idCotizacion
        },
        include: this.includeBuilderDetail
      });
    });
  }

  async deleteColumn(columnId: number) {
    return prisma.$transaction(async (tx) => {
      const currentColumn = await tx.cotizacionColumna.findUnique({
        where: {
          id: columnId
        },
        select: {
          id: true,
          idCotizacion: true
        }
      });

      if (!currentColumn) {
        return null;
      }

      await tx.cotizacionColumna.update({
        where: {
          id: columnId
        },
        data: {
          activo: false
        }
      });

      await this.syncPriceMatrixWithClient(tx, currentColumn.idCotizacion);

      return tx.cotizacion.findUnique({
        where: {
          id: currentColumn.idCotizacion
        },
        include: this.includeBuilderDetail
      });
    });
  }

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
              nombreComercial: true
            }
          }
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

      await tx.cotizacionItem.create({
        data: {
          idCotizacion: versionId,
          idServicio: data.idServicio,
          fechaServicio: toMysqlDate(data.fechaServicio),
          ordenDia: data.ordenDia ?? Number(maxOrder._max.ordenDia ?? 0) + 1,
          esOpcional: data.esOpcional,
          operadorMostrado: servicio.proveedor?.nombreComercial ?? null,
          linkOperador: servicio.linkReserva ?? null,
          notaLinea: data.notaLinea?.trim() || null,
          precioMonedaCodigo: "USD"
        }
      });

      await this.syncPriceMatrixWithClient(tx, versionId);

      return tx.cotizacion.findUnique({
        where: {
          id: versionId
        },
        include: this.includeBuilderDetail
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
        include: this.includeBuilderDetail
      });
    });
  }

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
        include: this.includeBuilderDetail
      });
    });
  }

  async syncPriceMatrix(versionId: number) {
    await prisma.$transaction(async (tx) => {
      await this.syncPriceMatrixWithClient(tx, versionId);
    });
  }

  private async syncPriceMatrixWithClient(
    tx: Prisma.TransactionClient,
    versionId: number
  ) {
    const items = await tx.cotizacionItem.findMany({
      where: {
        idCotizacion: versionId
      },
      select: {
        id: true,
        idServicio: true,
        fechaServicio: true,
        esOpcional: true,
        servicio: {
          select: {
            tipo: {
              select: {
                nombre: true
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
        tipo: true
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
      const tipoServicio = item.servicio.tipo.nombre.trim().toLowerCase();
      const tarifa = tarifaByItemId.get(item.id) ?? null;

      const allowedColumns = columns.filter((column) => {
        if (item.esOpcional) {
          return column.tipo === CotizacionColumnaTipo.OPCIONALES;
        }

        if (tipoServicio === "vuelo" || tipoServicio === "tren") {
          return column.tipo === CotizacionColumnaTipo.TRANSPORTE;
        }

        if (tipoServicio === "otro") {
          return false;
        }

        return column.tipo === CotizacionColumnaTipo.TERRESTRE;
      });

      for (const column of allowedColumns) {
        const key = `${item.id}-${column.id}`;
        const existingPrice = existingPricesByKey.get(key);

        if (!existingPrice) {
          pricesToCreate.push({
            idCotizacionItem: item.id,
            idCotizacionColumna: column.id,
            precioNeto: tarifa?.precioNeto ?? null,
            monedaCodigo: tarifa?.monedaCodigo ?? "USD",
            precioEditadoManual: false
          });

          continue;
        }

        if (existingPrice) {
          continue;
        }
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

export const cotizacionBuilderRepository = new CotizacionBuilderRepository();