/* erp-tour-operator/backend/src/modules/alojamiento-precio/repository/alojamiento-precio.repository.ts */

import { prisma } from "@/core/db/prisma";
import type {
  AlojamientoPrecioFilter,
  AlojamientoPrecioInput
} from "@/modules/alojamiento-precio/dto/alojamiento-precio.dto";

function toDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export class AlojamientoPrecioRepository {
  list(filters: AlojamientoPrecioFilter = {}) {
    return prisma.alojamientoPrecioMes.findMany({
      where: {
        idCiudad: filters.idCiudad,
        categoria: filters.categoria,
        categoriaHab: filters.categoriaHab,
        regimen: filters.regimen,
        tipoHabitacion: filters.tipoHabitacion,
        activo: filters.activo,

        fechaDesde: filters.fechaHasta
          ? {
              lte: toDateOnly(filters.fechaHasta)
            }
          : undefined,

        fechaHasta: filters.fechaDesde
          ? {
              gte: toDateOnly(filters.fechaDesde)
            }
          : undefined
      },
      include: {
        ciudad: {
          include: {
            pais: true
          }
        }
      },
      orderBy: [
        {
          fechaDesde: "desc"
        },
        {
          fechaHasta: "desc"
        },
        {
          ciudad: {
            nombre: "asc"
          }
        },
        {
          categoria: "asc"
        },
        {
          tipoHabitacion: "asc"
        }
      ]
    });
  }

  findById(id: number) {
    return prisma.alojamientoPrecioMes.findUnique({
      where: {
        id
      },
      include: {
        ciudad: {
          include: {
            pais: true
          }
        }
      }
    });
  }

  findDuplicate(data: AlojamientoPrecioInput, excludeId?: number) {
    return prisma.alojamientoPrecioMes.findFirst({
      where: {
        id: excludeId ? { not: excludeId } : undefined,
        idCiudad: data.idCiudad,
        categoria: data.categoria,
        categoriaHab: data.categoriaHab,
        regimen: data.regimen,
        fechaDesde: toDateOnly(data.fechaDesde),
        fechaHasta: toDateOnly(data.fechaHasta),
        tipoHabitacion: data.tipoHabitacion
      }
    });
  }

  async createOrUpdateByKey(data: AlojamientoPrecioInput) {
    const duplicate = await this.findDuplicate(data);

    if (duplicate) {
      return prisma.alojamientoPrecioMes.update({
        where: {
          id: duplicate.id
        },
        data: {
          precioUsd: data.precioUsd ?? null,
          monedaCodigo: data.monedaCodigo,
          activo: data.activo
        },
        include: {
          ciudad: {
            include: {
              pais: true
            }
          }
        }
      });
    }

    return prisma.alojamientoPrecioMes.create({
      data: {
        idCiudad: data.idCiudad,
        categoria: data.categoria,
        categoriaHab: data.categoriaHab,
        regimen: data.regimen,
        fechaDesde: toDateOnly(data.fechaDesde),
        fechaHasta: toDateOnly(data.fechaHasta),
        tipoHabitacion: data.tipoHabitacion,
        precioUsd: data.precioUsd ?? null,
        monedaCodigo: data.monedaCodigo,
        activo: data.activo
      },
      include: {
        ciudad: {
          include: {
            pais: true
          }
        }
      }
    });
  }

  update(id: number, data: AlojamientoPrecioInput) {
    return prisma.alojamientoPrecioMes.update({
      where: {
        id
      },
      data: {
        idCiudad: data.idCiudad,
        categoria: data.categoria,
        categoriaHab: data.categoriaHab,
        regimen: data.regimen,
        fechaDesde: toDateOnly(data.fechaDesde),
        fechaHasta: toDateOnly(data.fechaHasta),
        tipoHabitacion: data.tipoHabitacion,
        precioUsd: data.precioUsd ?? null,
        monedaCodigo: data.monedaCodigo,
        activo: data.activo
      },
      include: {
        ciudad: {
          include: {
            pais: true
          }
        }
      }
    });
  }

  delete(id: number) {
    return prisma.alojamientoPrecioMes.delete({
      where: {
        id
      }
    });
  }
}

export const alojamientoPrecioRepository = new AlojamientoPrecioRepository();