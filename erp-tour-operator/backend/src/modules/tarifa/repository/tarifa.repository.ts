import { prisma } from "@/core/db/prisma";
import type { TarifaInput } from "@/modules/tarifa/dto/tarifa.dto";

function toDateOnly(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  return new Date(`${value}T00:00:00.000Z`);
}

export class TarifaRepository {
  list() {
    return prisma.servicioTarifa.findMany({
      include: {
        servicio: {
          include: {
            tipo: true,
            proveedor: {
              select: {
                id: true,
                nombreComercial: true
              }
            },
            ciudad: true
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
          id: "desc"
        }
      ]
    });
  }

  findById(id: number) {
    return prisma.servicioTarifa.findUnique({
      where: {
        id
      },
      include: {
        servicio: {
          include: {
            tipo: true,
            proveedor: {
              select: {
                id: true,
                nombreComercial: true
              }
            },
            ciudad: true
          }
        }
      }
    });
  }

  findServicioById(idServicio: number) {
    return prisma.servicio.findUnique({
      where: {
        id: idServicio
      },
      include: {
        tipo: true
      }
    });
  }

  create(data: TarifaInput & { createdBy?: number | null }) {
    return prisma.servicioTarifa.create({
      data: {
        idServicio: data.idServicio,

        fechaDesde: toDateOnly(data.fechaDesde)!,
        fechaHasta: toDateOnly(data.fechaHasta)!,

        tipoTarifa: data.tipoTarifa,
        unidadPrecio: data.unidadPrecio,

        precioNeto: data.precioNeto,
        monedaCodigo: data.monedaCodigo,

        activo: data.activo ?? true,
        observaciones: data.observaciones ?? null,
        fechaRevision: toDateOnly(data.fechaRevision),

        createdBy: data.createdBy ?? null,
        updatedBy: data.createdBy ?? null
      },
      include: {
        servicio: {
          include: {
            tipo: true,
            proveedor: {
              select: {
                id: true,
                nombreComercial: true
              }
            },
            ciudad: true
          }
        }
      }
    });
  }

  update(id: number, data: TarifaInput & { updatedBy?: number | null }) {
    return prisma.servicioTarifa.update({
      where: {
        id
      },
      data: {
        idServicio: data.idServicio,

        fechaDesde: toDateOnly(data.fechaDesde)!,
        fechaHasta: toDateOnly(data.fechaHasta)!,

        tipoTarifa: data.tipoTarifa,
        unidadPrecio: data.unidadPrecio,

        precioNeto: data.precioNeto,
        monedaCodigo: data.monedaCodigo,

        activo: data.activo ?? true,
        observaciones: data.observaciones ?? null,
        fechaRevision: toDateOnly(data.fechaRevision),

        updatedBy: data.updatedBy ?? null
      },
      include: {
        servicio: {
          include: {
            tipo: true,
            proveedor: {
              select: {
                id: true,
                nombreComercial: true
              }
            },
            ciudad: true
          }
        }
      }
    });
  }
}

export const tarifaRepository = new TarifaRepository();