import { AppError } from "@/core/errors/app-error";
import type { TarifaInput } from "@/modules/tarifa/dto/tarifa.dto";
import { toTarifaListItem } from "@/modules/tarifa/mapper/tarifa.mapper";
import { tarifaRepository } from "@/modules/tarifa/repository/tarifa.repository";

const TIPOS_SIN_TARIFA_BASE = ["VUELO", "TREN", "OTRO"];

export class TarifaService {
  async list() {
    const records = await tarifaRepository.list();
    return records.map(toTarifaListItem);
  }

  private async validateServicioTarifable(idServicio: number) {
    const servicio = await tarifaRepository.findServicioById(idServicio);

    if (!servicio) {
      throw new AppError(400, "SERVICIO_INVALIDO", "El servicio seleccionado no existe");
    }

    if (!servicio.activo) {
      throw new AppError(400, "SERVICIO_INACTIVO", "No se pueden crear tarifas para un servicio inactivo");
    }

    const tipoCodigo = servicio.tipo?.codigo;

    if (tipoCodigo && TIPOS_SIN_TARIFA_BASE.includes(tipoCodigo)) {
      throw new AppError(
        400,
        "SERVICIO_NO_TARIFABLE",
        "Este tipo de servicio no usa tarifa base. El precio se define manualmente en la cotización."
      );
    }

    return servicio;
  }

  async create(input: TarifaInput, userId?: number) {
    await this.validateServicioTarifable(input.idServicio);

    const record = await tarifaRepository.create({
      ...input,
      createdBy: userId ?? null
    });

    return toTarifaListItem(record);
  }

  async update(id: number, input: TarifaInput, userId?: number) {
    const current = await tarifaRepository.findById(id);

    if (!current) {
      throw new AppError(404, "TARIFA_NOT_FOUND", "Tarifa no encontrada");
    }

    await this.validateServicioTarifable(input.idServicio);

    const record = await tarifaRepository.update(id, {
      ...input,
      updatedBy: userId ?? null
    });

    return toTarifaListItem(record);
  }

  async delete(id: number) {
    const current = await tarifaRepository.findById(id);

    if (!current) {
      throw new AppError(404, "TARIFA_NOT_FOUND", "Tarifa no encontrada");
    }

    await tarifaRepository.delete(id);

    return {
      id
    };
  }
}

export const tarifaService = new TarifaService();