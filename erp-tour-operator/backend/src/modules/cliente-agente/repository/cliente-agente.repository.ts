/* erp-tour-operator/backend/src/modules/cliente-agente/repository/cliente-agente.repository.ts */

import { prisma } from "@/core/db/prisma";
import type { ClienteAgenteFilters, ClienteAgenteInput } from "@/modules/cliente-agente/dto/cliente-agente.dto";
import { Prisma, TipoComisionCotizacion } from "@prisma/client";

function toDecimal(value: number | string | null | undefined, fallback: number) {
  const parsed = Number(value);

  return new Prisma.Decimal(Number.isFinite(parsed) ? parsed : fallback);
}

function getDefaultAgentCommissions(data: ClienteAgenteInput) {
  return [
    {
      tipoComision: TipoComisionCotizacion.TERRESTRE,
      porcentajeAgente: toDecimal(
        data.comisiones?.terrestre?.porcentajeAgente ?? data.comisionBasePct,
        12
      ),
      porcentajeWtravel: toDecimal(data.comisiones?.terrestre?.porcentajeWtravel, 13),
      porcentajeBancario: toDecimal(data.comisiones?.terrestre?.porcentajeBancario, 5)
    },
    {
      tipoComision: TipoComisionCotizacion.AEREA,
      porcentajeAgente: toDecimal(data.comisiones?.aerea?.porcentajeAgente, 5),
      porcentajeWtravel: toDecimal(data.comisiones?.aerea?.porcentajeWtravel, 5),
      porcentajeBancario: toDecimal(data.comisiones?.aerea?.porcentajeBancario, 5)
    }
  ];
}

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
        comisiones: true,
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
        pais: {
          include: {
            continente: true
          }
        },
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
    const { idContinente, comisiones, ...safeData } = data as ClienteAgenteInput & {
      idContinente?: number | null;
      createdBy?: number | null;
    };

    return prisma.$transaction(async (tx) => {
      const created = await tx.clienteAgente.create({
        data: {
          ...safeData,
          createdBy: data.createdBy ?? null,
          updatedBy: data.createdBy ?? null
        }
      });

      await tx.clienteAgenteComision.createMany({
        data: getDefaultAgentCommissions(data).map((commission) => ({
          idClienteAgente: created.id,
          tipoComision: commission.tipoComision,
          porcentajeAgente: commission.porcentajeAgente,
          porcentajeWtravel: commission.porcentajeWtravel,
          porcentajeBancario: commission.porcentajeBancario,
          activo: true
        }))
      });

      return created;
    });
  }

  update(id: number, data: ClienteAgenteInput & { updatedBy?: number | null }) {
    const { idContinente, comisiones, ...safeData } = data as ClienteAgenteInput & {
      idContinente?: number | null;
      updatedBy?: number | null;
    };

    return prisma.$transaction(async (tx) => {
      const updated = await tx.clienteAgente.update({
        where: { id },
        data: {
          ...safeData,
          updatedBy: data.updatedBy ?? null
        }
      });

      for (const commission of getDefaultAgentCommissions(data)) {
        await tx.clienteAgenteComision.upsert({
          where: {
            idClienteAgente_tipoComision: {
              idClienteAgente: id,
              tipoComision: commission.tipoComision
            }
          },
          create: {
            idClienteAgente: id,
            tipoComision: commission.tipoComision,
            porcentajeAgente: commission.porcentajeAgente,
            porcentajeWtravel: commission.porcentajeWtravel,
            porcentajeBancario: commission.porcentajeBancario,
            activo: true
          },
          update: {
            porcentajeAgente: commission.porcentajeAgente,
            porcentajeWtravel: commission.porcentajeWtravel,
            porcentajeBancario: commission.porcentajeBancario,
            activo: true
          }
        });
      }

      return updated;
    });
  }
}

export const clienteAgenteRepository = new ClienteAgenteRepository();
