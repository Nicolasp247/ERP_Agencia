import { prisma } from "@/core/db/prisma";
import type { ClienteAgenteFilters, ClienteAgenteInput } from "@/modules/cliente-agente/dto/cliente-agente.dto";

export class ClienteAgenteRepository {
  list(filters: ClienteAgenteFilters) {
    return prisma.clienteAgente.findMany({
      where: {
        codigo: filters.codigo
          ? {
              contains: filters.codigo
            }
          : undefined,
        razonSocial: filters.search
          ? {
              contains: filters.search
            }
          : undefined,
        activo: filters.activo
      },
      include: {
        pais: true,
        ciudad: true,
        clientes: {
          select: {
            id: true
          }
        },
        cotizaciones: {
          select: {
            estado: true
          }
        },
        reservas: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        razonSocial: "asc"
      }
    });
  }

  findById(id: number) {
    return prisma.clienteAgente.findUnique({
      where: { id },
      include: {
        pais: true,
        ciudad: true,
        clientes: {
          select: {
            id: true,
            nombreCompleto: true,
            activo: true
          },
          orderBy: {
            nombreCompleto: "asc"
          }
        },
        cotizaciones: {
          select: {
            id: true,
            nombreCotizacion: true,
            estado: true,
            fechaViajePrincipal: true
          },
          orderBy: {
            fechaViajePrincipal: "desc"
          }
        },
        reservas: {
          select: {
            id: true,
            codigoReserva: true,
            estado: true,
            fechaViajePrincipal: true
          },
          orderBy: {
            fechaViajePrincipal: "desc"
          }
        }
      }
    });
  }

  findByCodigo(codigo: string) {
    return prisma.clienteAgente.findUnique({
      where: { codigo }
    });
  }

  create(data: ClienteAgenteInput & { createdBy?: number | null }) {
    return prisma.clienteAgente.create({
      data: {
        ...data,
        createdBy: data.createdBy ?? null,
        updatedBy: data.createdBy ?? null
      }
    });
  }

  update(id: number, data: ClienteAgenteInput & { updatedBy?: number | null }) {
    return prisma.clienteAgente.update({
      where: { id },
      data: {
        ...data,
        updatedBy: data.updatedBy ?? null
      }
    });
  }
}

export const clienteAgenteRepository = new ClienteAgenteRepository();
