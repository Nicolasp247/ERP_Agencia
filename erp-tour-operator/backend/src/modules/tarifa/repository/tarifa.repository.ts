import { prisma } from "@/core/db/prisma";
import type { TarifaFilters, TarifaInput } from "@/modules/tarifa/dto/tarifa.dto";

export class TarifaRepository {
  list(filters: TarifaFilters) {
    return prisma.servicioPrecioMes.findMany({
      where: {
        idServicio: filters.idServicio,
        anio: filters.anio,
        mes: filters.mes
      },
      include: {
        servicio: {
          select: {
            nombreWtravel: true
          }
        }
      },
      orderBy: [{ anio: "desc" }, { mes: "desc" }, { idServicio: "asc" }]
    });
  }

  findByKey(input: TarifaInput) {
    return prisma.servicioPrecioMes.findUnique({
      where: {
        idServicio_anio_mes_tipoHabitacion: {
          idServicio: input.idServicio,
          anio: input.anio,
          mes: input.mes,
          tipoHabitacion: input.tipoHabitacion
        }
      }
    });
  }

  upsert(input: TarifaInput) {
    return prisma.servicioPrecioMes.upsert({
      where: {
        idServicio_anio_mes_tipoHabitacion: {
          idServicio: input.idServicio,
          anio: input.anio,
          mes: input.mes,
          tipoHabitacion: input.tipoHabitacion
        }
      },
      update: {
        precioUsd: input.precioUsd,
        monedaCodigo: input.monedaCodigo,
        activo: input.activo
      },
      create: input
    });
  }
}

export const tarifaRepository = new TarifaRepository();
