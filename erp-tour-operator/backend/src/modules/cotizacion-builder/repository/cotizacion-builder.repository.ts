/* erp-tour-operator/backend/src/modules/cotizacion-builder/repository/cotizacion-builder.repository.ts */

import { prisma } from "@/core/db/prisma";
import type {
  CotizacionBuilderColumnInput,
  CotizacionBuilderColumnShownPriceInput,
  CotizacionBuilderHotelPreviewInput,
  CotizacionBuilderItemInput,
  CotizacionBuilderMoveItemInput,
  CotizacionBuilderNoteInput,
  CotizacionBuilderCommissionInput,
  CotizacionBuilderFreeNotesInput,
  CotizacionBuilderPriceInput
} from "@/modules/cotizacion-builder/dto/cotizacion-builder.dto";
import { cotizacionBuilderColumnsRepository } from "@/modules/cotizacion-builder/repository/cotizacion-builder-columns.repository";
import { cotizacionBuilderCommissionsRepository } from "@/modules/cotizacion-builder/repository/cotizacion-builder-commissions.repository";
import { cotizacionBuilderHotelsRepository } from "@/modules/cotizacion-builder/repository/cotizacion-builder-hotels.repository";
import { includeBuilderDetail } from "@/modules/cotizacion-builder/repository/cotizacion-builder.include";
import { cotizacionBuilderItemsRepository } from "@/modules/cotizacion-builder/repository/cotizacion-builder-items.repository";
import { cotizacionBuilderPricesRepository } from "@/modules/cotizacion-builder/repository/cotizacion-builder-prices.repository";
import { cotizacionBuilderSyncRepository } from "@/modules/cotizacion-builder/repository/cotizacion-builder-sync.repository";

export class CotizacionBuilderRepository {
  findVersionById(versionId: number) {
    return prisma.cotizacion.findUnique({
      where: {
        id: versionId
      },
      include: includeBuilderDetail
    });
  }

  async updateFreeNotes(versionId: number, data: CotizacionBuilderFreeNotesInput) {
    const currentVersion = await prisma.cotizacion.findUnique({
      where: {
        id: versionId
      },
      select: {
        id: true
      }
    });

    if (!currentVersion) {
      return null;
    }

    await prisma.cotizacion.update({
      where: {
        id: versionId
      },
      data: {
        nota: data.notasLibres?.trim() || null
      }
    });

    return prisma.cotizacion.findUnique({
      where: {
        id: versionId
      },
      include: includeBuilderDetail
    });
  }

  ensureDefaultColumns(versionId: number) {
    return cotizacionBuilderColumnsRepository.ensureDefaultColumns(versionId);
  }

  ensureCommissionSnapshot(versionId: number) {
    return cotizacionBuilderCommissionsRepository.ensureCommissionSnapshot(versionId);
  }

  createColumn(versionId: number, data: CotizacionBuilderColumnInput) {
    return cotizacionBuilderColumnsRepository.createColumn(versionId, data);
  }

  updateColumn(columnId: number, data: CotizacionBuilderColumnInput) {
    return cotizacionBuilderColumnsRepository.updateColumn(columnId, data);
  }

  updateColumnShownPrice(
    columnId: number,
    data: CotizacionBuilderColumnShownPriceInput
  ) {
    return cotizacionBuilderColumnsRepository.updateColumnShownPrice(columnId, data);
  }

  deleteColumn(columnId: number) {
    return cotizacionBuilderColumnsRepository.deleteColumn(columnId);
  }

  updateCommission(versionId: number, data: CotizacionBuilderCommissionInput) {
    return cotizacionBuilderCommissionsRepository.updateCommission(versionId, data);
  }

  createItem(versionId: number, data: CotizacionBuilderItemInput) {
    return cotizacionBuilderItemsRepository.createItem(versionId, data);
  }

  deleteItem(itemId: number) {
    return cotizacionBuilderItemsRepository.deleteItem(itemId);
  }

  moveItem(itemId: number, data: CotizacionBuilderMoveItemInput) {
    return cotizacionBuilderItemsRepository.moveItem(itemId, data);
  }

  updateItemPrices(itemId: number, data: CotizacionBuilderPriceInput) {
    return cotizacionBuilderPricesRepository.updateItemPrices(itemId, data);
  }

  updateItemNotes(itemId: number, data: CotizacionBuilderNoteInput) {
    return cotizacionBuilderItemsRepository.updateItemNotes(itemId, data);
  }

  updateItemHotels(itemId: number, data: CotizacionBuilderHotelPreviewInput) {
    return cotizacionBuilderHotelsRepository.updateItemHotels(itemId, data);
  }

  async syncPriceMatrix(versionId: number) {
    await prisma.$transaction(async (tx) => {
      await cotizacionBuilderSyncRepository.syncPriceMatrixWithClient(tx, versionId);
    });
  }
}

export const cotizacionBuilderRepository = new CotizacionBuilderRepository();