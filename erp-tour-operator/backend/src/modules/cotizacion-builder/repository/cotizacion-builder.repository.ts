/* erp-tour-operator/backend/src/modules/cotizacion-builder/repository/cotizacion-builder.repository.ts */

import {
  CotizacionColumnaTipo,
  CotizacionColumnaUnidad,
  Prisma
} from "@prisma/client";

import { prisma } from "@/core/db/prisma";
import type { CotizacionBuilderColumnInput } from "@/modules/cotizacion-builder/dto/cotizacion-builder.dto";

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
        id: true
      }
    });

    const columns = await tx.cotizacionColumna.findMany({
      where: {
        idCotizacion: versionId,
        activo: true
      },
      select: {
        id: true
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
        idCotizacionItem: true,
        idCotizacionColumna: true
      }
    });

    const existingKeys = new Set(
      existingPrices.map(
        (price) => `${price.idCotizacionItem}-${price.idCotizacionColumna}`
      )
    );

    const missingPrices = items.flatMap((item) =>
      columns
        .filter((column) => !existingKeys.has(`${item.id}-${column.id}`))
        .map((column) => ({
          idCotizacionItem: item.id,
          idCotizacionColumna: column.id,
          precioNeto: null,
          monedaCodigo: "USD",
          precioEditadoManual: false
        }))
    );

    if (!missingPrices.length) {
      return;
    }

    await tx.cotizacionItemPrecio.createMany({
      data: missingPrices,
      skipDuplicates: true
    });
  }
}

export const cotizacionBuilderRepository = new CotizacionBuilderRepository();