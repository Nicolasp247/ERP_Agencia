import { prisma } from "@/core/db/prisma";
import { AppError } from "@/core/errors/app-error";
import { auditoriaService } from "@/modules/auditoria/service/auditoria.service";
import type { TarifaFilters, TarifaInput } from "@/modules/tarifa/dto/tarifa.dto";
import { toTarifaListItem } from "@/modules/tarifa/mapper/tarifa.mapper";
import { tarifaRepository } from "@/modules/tarifa/repository/tarifa.repository";

export class TarifaService {
  async list(filters: TarifaFilters) {
    const records = await tarifaRepository.list(filters);
    return records.map(toTarifaListItem);
  }

  async upsert(input: TarifaInput, userId?: number) {
    const servicio = await prisma.servicio.findUnique({
      where: { id: input.idServicio }
    });

    if (!servicio) {
      throw new AppError(400, "SERVICIO_INVALIDO", "No se puede crear tarifa sin servicio");
    }

    const previous = await tarifaRepository.findByKey(input);
    const record = await tarifaRepository.upsert(input);

    await auditoriaService.record({
      entidad: "servicio_precio_mes",
      entidadId: record.idServicio,
      accion: previous ? "ACTUALIZADA" : "CREADA",
      valorAnterior: previous,
      valorNuevo: record,
      idUsuario: userId ?? null
    });

    return toTarifaListItem({
      ...record,
      servicio: {
        nombreWtravel: servicio.nombreWtravel
      }
    });
  }

  async findSuggestedPrice(idServicio: number, fecha: Date, tipoHabitacion = "DBL") {
    const anio = fecha.getUTCFullYear();
    const mes = fecha.getUTCMonth() + 1;

    const tarifa = await prisma.servicioPrecioMes.findUnique({
      where: {
        idServicio_anio_mes_tipoHabitacion: {
          idServicio,
          anio,
          mes,
          tipoHabitacion
        }
      }
    });

    return tarifa;
  }
}

export const tarifaService = new TarifaService();
