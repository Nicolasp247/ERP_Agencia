/* erp-tour-operator/backend/src/modules/expediente/confirmacion-builder/service/confirmacion-builder.service.ts */

import { AppError } from "@/core/errors/app-error";
import type { ConfirmacionBuilderCreateInput } from "@/modules/expediente/confirmacion-builder/dto/confirmacion-builder.dto";
import {
  toConfirmacionBuilderDetail,
  toConfirmacionBuilderOptions
} from "@/modules/expediente/confirmacion-builder/mapper/confirmacion-builder.mapper";
import { confirmacionBuilderRepository } from "@/modules/expediente/confirmacion-builder/repository/confirmacion-builder.repository";

export class ConfirmacionBuilderService {
  async getOptionsByVersionId(versionId: number) {
    const record = await confirmacionBuilderRepository.findOptionsByVersionId(versionId);

    if (!record) {
      throw new AppError(404, "COTIZACION_VERSION_NOT_FOUND", "Versión de cotización no encontrada");
    }

    if (record.estadoVersion !== "ACEPTADA") {
      throw new AppError(
        409,
        "COTIZACION_NOT_ACCEPTED",
        "Solo se puede crear confirmación desde una cotización aceptada"
      );
    }

    return toConfirmacionBuilderOptions(record);
  }

  async getByVersionId(versionId: number) {
    const record = await confirmacionBuilderRepository.findByVersionId(versionId);

    if (!record) {
      throw new AppError(
        404,
        "CONFIRMACION_NOT_FOUND",
        "No existe confirmación creada para esta cotización"
      );
    }

    return toConfirmacionBuilderDetail(record);
  }

  async createFromAcceptedCotizacion(
    versionId: number,
    data: ConfirmacionBuilderCreateInput,
    userId?: number
  ) {
    const record = await confirmacionBuilderRepository.createFromAcceptedCotizacion(
      versionId,
      data,
      userId ?? null
    );

    if (!record) {
      throw new AppError(404, "COTIZACION_VERSION_NOT_FOUND", "Versión de cotización no encontrada");
    }

    if (record === "COTIZACION_NOT_ACCEPTED") {
      throw new AppError(
        409,
        "COTIZACION_NOT_ACCEPTED",
        "Solo se puede crear confirmación desde una cotización aceptada"
      );
    }

    if (record === "INVALID_COLUMNS") {
      throw new AppError(
        400,
        "CONFIRMACION_INVALID_COLUMNS",
        "Las columnas seleccionadas no pertenecen a la cotización"
      );
    }

    return toConfirmacionBuilderDetail(record);
  }

  async deleteByVersionId(versionId: number, userId?: number) {
    const deleted = await confirmacionBuilderRepository.deleteByVersionId(
      versionId,
      userId ?? null
    );

    if (!deleted) {
      throw new AppError(
        404,
        "CONFIRMACION_NOT_FOUND",
        "No existe confirmación creada para esta cotización"
      );
    }

    return deleted;
  }
}

export const confirmacionBuilderService = new ConfirmacionBuilderService();