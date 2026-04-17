import { CotizacionEstado } from "@prisma/client";

import { prisma as prismaClient } from "@/core/db/prisma";
import type { CotizacionFilters, CotizacionInput } from "@/modules/cotizacion/dto/cotizacion.dto";

type PreparedItem = {
  idServicio: number;
  fechaServicio: Date;
  ordenDia: number;
  esOpcional: boolean;
  operadorMostrado?: string | null;
  linkOperador?: string | null;
  tituloOverride?: string | null;
  claseOverride?: string | null;
  idiomaOverride?: string | null;
  notaLinea?: string | null;
  precioSugerido?: number | null;
  precioVenta?: number | null;
  precioMonedaCodigo: string;
  precioEditadoManual: boolean;
};

export class CotizacionRepository {
  list(filters: CotizacionFilters) {
    return prismaClient.cotizacion.findMany({
      where: {
        estado: filters.estado as CotizacionEstado | undefined,
        idCliente: filters.idCliente,
        idClienteAgente: filters.idClienteAgente,
        idDestinoPrincipal: filters.idDestinoPrincipal,
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
        destinoPrincipal: true,
        items: {
          select: {
            esOpcional: true,
            precioSugerido: true,
            precioVenta: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  findById(id: number) {
    return prismaClient.cotizacion.findUnique({
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
        items: {
          include: {
            servicio: {
              include: {
                tipo: true,
                ciudad: true
              }
            }
          },
          orderBy: [{ fechaServicio: "asc" }, { ordenDia: "asc" }]
        }
      }
    });
  }

  create(data: CotizacionInput & { createdBy?: number | null }, items: PreparedItem[]) {
    return prismaClient.$transaction(async (tx) => {
      const quote = await tx.cotizacion.create({
        data: {
          idCliente: data.idCliente,
          idClienteAgente: data.idClienteAgente,
          nombreCotizacion: data.nombreCotizacion,
          fechaViajePrincipal: data.fechaViajePrincipal,
          idDestinoPrincipal: data.idDestinoPrincipal,
          categoriaViaje: data.categoriaViaje,
          monedaCodigo: data.monedaCodigo,
          presupuestoEstimado: data.presupuestoEstimado,
          presupuestoTipo: data.presupuestoTipo,
          comisionPctAplicada: data.comisionPctAplicada,
          margenAplicadoValor: data.margenAplicadoValor,
          adultos65: data.adultos65,
          adultos1964: data.adultos1964,
          jovenes1218: data.jovenes1218,
          ninos311: data.ninos311,
          infantes02: data.infantes02,
          totalPasajeros: data.totalPasajeros,
          nota: data.nota,
          createdBy: data.createdBy ?? null,
          updatedBy: data.createdBy ?? null
        }
      });

      await tx.cotizacionItem.createMany({
        data: items.map((item) => ({
          idCotizacion: quote.id,
          ...item
        }))
      });

      return quote;
    });
  }

  update(id: number, data: CotizacionInput & { updatedBy?: number | null }, items: PreparedItem[]) {
    return prismaClient.$transaction(async (tx) => {
      await tx.cotizacion.update({
        where: { id },
        data: {
          idCliente: data.idCliente,
          idClienteAgente: data.idClienteAgente,
          nombreCotizacion: data.nombreCotizacion,
          fechaViajePrincipal: data.fechaViajePrincipal,
          idDestinoPrincipal: data.idDestinoPrincipal,
          categoriaViaje: data.categoriaViaje,
          monedaCodigo: data.monedaCodigo,
          presupuestoEstimado: data.presupuestoEstimado,
          presupuestoTipo: data.presupuestoTipo,
          comisionPctAplicada: data.comisionPctAplicada,
          margenAplicadoValor: data.margenAplicadoValor,
          adultos65: data.adultos65,
          adultos1964: data.adultos1964,
          jovenes1218: data.jovenes1218,
          ninos311: data.ninos311,
          infantes02: data.infantes02,
          totalPasajeros: data.totalPasajeros,
          nota: data.nota,
          updatedBy: data.updatedBy ?? null
        }
      });

      await tx.cotizacionItem.deleteMany({
        where: { idCotizacion: id }
      });

      await tx.cotizacionItem.createMany({
        data: items.map((item) => ({
          idCotizacion: id,
          ...item
        }))
      });

      return tx.cotizacion.findUniqueOrThrow({
        where: { id }
      });
    });
  }

  markDiscarded(id: number, userId?: number | null) {
    return prismaClient.cotizacion.update({
      where: { id },
      data: {
        estado: CotizacionEstado.DESCARTADA,
        fechaDescartada: new Date(),
        updatedBy: userId ?? null
      }
    });
  }

  markConverted(id: number, userId?: number | null) {
    return prismaClient.cotizacion.update({
      where: { id },
      data: {
        estado: CotizacionEstado.CONVERTIDA_RESERVA,
        fechaConvertidaReserva: new Date(),
        updatedBy: userId ?? null
      }
    });
  }
}

export const cotizacionRepository = new CotizacionRepository();
