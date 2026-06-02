/* erp-tour-operator/backend/src/modules/cotizacion-builder/repository/cotizacion-builder-columns.repository.ts */

import { Prisma } from "@prisma/client";

import { prisma } from "@/core/db/prisma";
import type {
  CotizacionBuilderColumnInput,
  CotizacionBuilderColumnShownPriceInput
} from "@/modules/cotizacion-builder/dto/cotizacion-builder.dto";
import { DEFAULT_COLUMNS } from "@/modules/cotizacion-builder/repository/cotizacion-builder.constants";
import { includeBuilderDetail } from "@/modules/cotizacion-builder/repository/cotizacion-builder.include";
import { cotizacionBuilderSyncRepository } from "@/modules/cotizacion-builder/repository/cotizacion-builder-sync.repository";

export class CotizacionBuilderColumnsRepository {
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

      await cotizacionBuilderSyncRepository.syncPriceMatrixWithClient(tx, versionId);

      return tx.cotizacion.findUnique({
        where: {
          id: versionId
        },
        include: includeBuilderDetail
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

      await cotizacionBuilderSyncRepository.syncPriceMatrixWithClient(tx, currentColumn.idCotizacion);

      return tx.cotizacion.findUnique({
        where: {
          id: currentColumn.idCotizacion
        },
        include: includeBuilderDetail
      });
    });
  }

  async updateColumnShownPrice(
    columnId: number,
    data: CotizacionBuilderColumnShownPriceInput
  ) {
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
          precioMostradoFormula: data.precioMostradoFormula?.trim() || null,
          precioMostradoValor:
            data.precioMostradoValor === null
              ? null
              : new Prisma.Decimal(data.precioMostradoValor)
        }
      });

      return tx.cotizacion.findUnique({
        where: {
          id: currentColumn.idCotizacion
        },
        include: includeBuilderDetail
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

      await cotizacionBuilderSyncRepository.syncPriceMatrixWithClient(tx, currentColumn.idCotizacion);

      return tx.cotizacion.findUnique({
        where: {
          id: currentColumn.idCotizacion
        },
        include: includeBuilderDetail
      });
    });
  }

  async syncPriceMatrix(versionId: number) {
    await prisma.$transaction(async (tx) => {
      await cotizacionBuilderSyncRepository.syncPriceMatrixWithClient(tx, versionId);
    });
  }
}

export const cotizacionBuilderColumnsRepository = new CotizacionBuilderColumnsRepository();