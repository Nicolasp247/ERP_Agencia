/* erp-tour-operator/backend/src/modules/cotizacion-builder/service/cotizacion-builder.service.ts */

import { AppError } from "@/core/errors/app-error";
import type {
  CotizacionBuilderColumnInput,
  CotizacionBuilderItemInput,
  CotizacionBuilderMoveItemInput,
  CotizacionBuilderNoteInput,
  CotizacionBuilderPriceInput
} from "@/modules/cotizacion-builder/dto/cotizacion-builder.dto";
import { toCotizacionBuilderDetail } from "@/modules/cotizacion-builder/mapper/cotizacion-builder.mapper";
import { cotizacionBuilderRepository } from "@/modules/cotizacion-builder/repository/cotizacion-builder.repository";

export class CotizacionBuilderService {
  async getByVersionId(versionId: number) {
    const current = await cotizacionBuilderRepository.findVersionById(versionId);

    if (!current) {
      throw new AppError(404, "COTIZACION_VERSION_NOT_FOUND", "Versión de cotización no encontrada");
    }

    await cotizacionBuilderRepository.ensureDefaultColumns(versionId);

    const record = await cotizacionBuilderRepository.findVersionById(versionId);

    if (!record) {
      throw new AppError(404, "COTIZACION_VERSION_NOT_FOUND", "Versión de cotización no encontrada");
    }

    return toCotizacionBuilderDetail(record);
  }

  async createColumn(versionId: number, data: CotizacionBuilderColumnInput) {
    const record = await cotizacionBuilderRepository.createColumn(versionId, data);

    if (!record) {
      throw new AppError(404, "COTIZACION_VERSION_NOT_FOUND", "Versión de cotización no encontrada");
    }

    return toCotizacionBuilderDetail(record);
  }

  async updateColumn(columnId: number, data: CotizacionBuilderColumnInput) {
    const record = await cotizacionBuilderRepository.updateColumn(columnId, data);

    if (!record) {
      throw new AppError(404, "COTIZACION_COLUMN_NOT_FOUND", "Columna de cotización no encontrada");
    }

    return toCotizacionBuilderDetail(record);
  }

  async deleteColumn(columnId: number) {
    const record = await cotizacionBuilderRepository.deleteColumn(columnId);

    if (!record) {
      throw new AppError(404, "COTIZACION_COLUMN_NOT_FOUND", "Columna de cotización no encontrada");
    }

    return toCotizacionBuilderDetail(record);
  }

  async createItem(versionId: number, data: CotizacionBuilderItemInput) {
    const record = await cotizacionBuilderRepository.createItem(versionId, data);

    if (!record) {
      throw new AppError(404, "COTIZACION_VERSION_NOT_FOUND", "Versión de cotización no encontrada");
    }

    if (record === "SERVICIO_NOT_FOUND") {
      throw new AppError(404, "SERVICIO_NOT_FOUND", "Servicio no encontrado o inactivo");
    }

    return toCotizacionBuilderDetail(record);
  }

  async deleteItem(itemId: number) {
    const record = await cotizacionBuilderRepository.deleteItem(itemId);

    if (!record) {
      throw new AppError(404, "COTIZACION_ITEM_NOT_FOUND", "Servicio de cotización no encontrado");
    }

    return toCotizacionBuilderDetail(record);
  }

  async moveItem(itemId: number, data: CotizacionBuilderMoveItemInput) {
    const record = await cotizacionBuilderRepository.moveItem(itemId, data);

    if (!record) {
      throw new AppError(404, "COTIZACION_ITEM_NOT_FOUND", "Servicio de cotización no encontrado");
    }

    return toCotizacionBuilderDetail(record);
  }
  
  async updateItemPrices(itemId: number, data: CotizacionBuilderPriceInput) {
    const record = await cotizacionBuilderRepository.updateItemPrices(itemId, data);

    if (!record) {
      throw new AppError(404, "COTIZACION_ITEM_NOT_FOUND", "Servicio de cotización no encontrado");
    }

    return toCotizacionBuilderDetail(record);
  }

  async updateItemNotes(itemId: number, data: CotizacionBuilderNoteInput) {
    const record = await cotizacionBuilderRepository.updateItemNotes(itemId, data);

    if (!record) {
      throw new AppError(404, "COTIZACION_ITEM_NOT_FOUND", "Servicio de cotización no encontrado");
    }

    return toCotizacionBuilderDetail(record);
  }

}

export const cotizacionBuilderService = new CotizacionBuilderService();