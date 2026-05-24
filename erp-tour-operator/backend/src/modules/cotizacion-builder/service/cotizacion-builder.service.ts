/* erp-tour-operator/backend/src/modules/cotizacion-builder/service/cotizacion-builder.service.ts */

import { AppError } from "@/core/errors/app-error";
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
}

export const cotizacionBuilderService = new CotizacionBuilderService();