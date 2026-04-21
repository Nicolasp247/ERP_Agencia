import { prisma } from "@/core/db/prisma";
import type { ClienteFilters, ClienteInput } from "@/modules/cliente/dto/cliente.dto";

export class ClienteRepository {
  list(filters: ClienteFilters) {
    return prisma.cliente.findMany({
      where: {
        nombreCompleto: filters.search
          ? {
              contains: filters.search
            }
          : undefined,
        idClienteAgente: filters.idClienteAgente,
        activo: filters.activo
      },
      include: {
        clienteAgente: {
          select: {
            id: true,
            razonSocial: true
          }
        },
        pais: true,
        ciudad: true,
        cotizaciones: {
          select: {
            fechaViajePrincipal: true
          },
          orderBy: {
            fechaViajePrincipal: "asc"
          },
          take: 1
        }
      },
      orderBy: {
        nombreCompleto: "asc"
      }
    });
  }

  findById(id: number) {
    return prisma.cliente.findUnique({
      where: { id },
      include: {
        clienteAgente: {
          select: {
            id: true,
            razonSocial: true
          }
        },
        pais: {
          include: {
            continente: true
          }
        },
        ciudad: true,
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

  create(data: ClienteInput & { createdBy?: number | null }) {
    const { idContinente, ...safeData } = data as ClienteInput & {
      idContinente?: number | null;
      createdBy?: number | null;
    };

    return prisma.cliente.create({
      data: {
        ...safeData,
        createdBy: data.createdBy ?? null,
        updatedBy: data.createdBy ?? null
      }
    });
  }

  update(id: number, data: ClienteInput & { updatedBy?: number | null }) {
    const { idContinente, ...safeData } = data as ClienteInput & {
      idContinente?: number | null;
      updatedBy?: number | null;
    };

    return prisma.cliente.update({
      where: { id },
      data: {
        ...safeData,
        updatedBy: data.updatedBy ?? null
      }
    });
  }
}

export const clienteRepository = new ClienteRepository();
