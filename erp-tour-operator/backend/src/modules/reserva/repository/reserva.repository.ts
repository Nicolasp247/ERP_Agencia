import { prisma } from "@/core/db/prisma";
import type { ReservaFilters } from "@/modules/reserva/dto/reserva.dto";

export class ReservaRepository {
  list(filters: ReservaFilters) {
    return prisma.reserva.findMany({
      where: {
        idCliente: filters.idCliente,
        idClienteAgente: filters.idClienteAgente,
        estado: filters.estado,
        fechaViajePrincipal: filters.year
          ? {
              gte: new Date(Date.UTC(filters.year, 0, 1)),
              lt: new Date(Date.UTC(filters.year + 1, 0, 1))
            }
          : undefined
      },
      include: {
        cliente: {
          select: {
            id: true,
            nombreCompleto: true
          }
        },
        clienteAgente: {
          select: {
            id: true,
            razonSocial: true
          }
        },
        confirmacionesComerciales: {
          where: {
            estado: "ACTIVA"
          },
          select: {
            totalVentaConfirmada: true
          },
          take: 1
        },
        liquidacion: {
          select: {
            totalCostoReal: true,
            utilidadBrutaTotal: true
          }
        }
      },
      orderBy: {
        fechaViajePrincipal: "desc"
      }
    });
  }

  findById(id: number) {
    return prisma.reserva.findUnique({
      where: { id },
      include: {
        cliente: {
          select: {
            id: true,
            nombreCompleto: true
          }
        },
        clienteAgente: {
          select: {
            id: true,
            razonSocial: true
          }
        },
        destinoPrincipal: true,
        cotizacionOrigen: {
          select: {
            id: true,
            nombreCotizacion: true
          }
        },
        items: {
          include: {
            servicio: {
              include: {
                tipo: true
              }
            }
          },
          orderBy: [{ fechaServicio: "asc" }, { ordenDia: "asc" }]
        },
        confirmacionesComerciales: {
          include: {
            items: true
          },
          orderBy: {
            version: "desc"
          }
        },
        liquidacion: true
      }
    });
  }

  findByCotizacionOrigen(idCotizacionOrigen: number) {
    return prisma.reserva.findUnique({
      where: { idCotizacionOrigen }
    });
  }
}

export const reservaRepository = new ReservaRepository();
