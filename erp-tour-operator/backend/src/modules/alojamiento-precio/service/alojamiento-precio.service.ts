/* erp-tour-operator/backend/src/modules/alojamiento-precio/service/alojamiento-precio.service.ts */

import { AppError } from "@/core/errors/app-error";
import type {
  AlojamientoPrecioFilter,
  AlojamientoPrecioInput
} from "@/modules/alojamiento-precio/dto/alojamiento-precio.dto";
import { toAlojamientoPrecioListItem } from "@/modules/alojamiento-precio/mapper/alojamiento-precio.mapper";
import { alojamientoPrecioRepository } from "@/modules/alojamiento-precio/repository/alojamiento-precio.repository";

export class AlojamientoPrecioService {
  async list(filters: AlojamientoPrecioFilter) {
    const records = await alojamientoPrecioRepository.list(filters);

    return records.map(toAlojamientoPrecioListItem);
  }

  async create(input: AlojamientoPrecioInput) {
    const record = await alojamientoPrecioRepository.createOrUpdateByKey(input);

    return toAlojamientoPrecioListItem(record);
  }

  async update(id: number, input: AlojamientoPrecioInput) {
    const current = await alojamientoPrecioRepository.findById(id);

    if (!current) {
      throw new AppError(
        404,
        "ALOJAMIENTO_PRECIO_NOT_FOUND",
        "Precio de alojamiento no encontrado"
      );
    }

    const duplicate = await alojamientoPrecioRepository.findDuplicate(input, id);

    if (duplicate) {
      throw new AppError(
        409,
        "ALOJAMIENTO_PRECIO_DUPLICATE",
        "Ya existe un precio de alojamiento con esa ciudad, categoría, régimen, año, mes y tipo de habitación"
      );
    }

    const record = await alojamientoPrecioRepository.update(id, input);

    return toAlojamientoPrecioListItem(record);
  }

  async delete(id: number) {
    const current = await alojamientoPrecioRepository.findById(id);

    if (!current) {
      throw new AppError(
        404,
        "ALOJAMIENTO_PRECIO_NOT_FOUND",
        "Precio de alojamiento no encontrado"
      );
    }

    await alojamientoPrecioRepository.delete(id);

    return {
      id
    };
  }
}

export const alojamientoPrecioService = new AlojamientoPrecioService();