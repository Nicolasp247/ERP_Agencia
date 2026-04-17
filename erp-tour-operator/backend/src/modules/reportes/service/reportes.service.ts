import { CotizacionEstado } from "@prisma/client";

import { prisma } from "@/core/db/prisma";
import type { ReporteFilters } from "@/modules/reportes/dto/reportes.dto";

export class ReportesService {
  async overview() {
    const [cotizacionesActivas, cotizacionesDescartadas, reservas, liquidaciones] = await Promise.all([
      prisma.cotizacion.count({
        where: { estado: CotizacionEstado.ACTIVA }
      }),
      prisma.cotizacion.count({
        where: { estado: CotizacionEstado.DESCARTADA }
      }),
      prisma.reserva.count(),
      prisma.liquidacionReserva.count()
    ]);

    return {
      cotizacionesActivas,
      cotizacionesDescartadas,
      reservas,
      liquidaciones
    };
  }

  async utilidadPorReserva(filters: ReporteFilters) {
    const liquidaciones = await prisma.liquidacionReserva.findMany({
      where: {
        reserva: {
          idCliente: filters.idCliente,
          idClienteAgente: filters.idClienteAgente,
          fechaViajePrincipal: filters.year
            ? {
                gte: new Date(Date.UTC(filters.year, 0, 1)),
                lt: new Date(Date.UTC(filters.year + 1, 0, 1))
              }
            : undefined
        }
      },
      include: {
        reserva: {
          include: {
            cliente: {
              select: {
                nombreCompleto: true
              }
            },
            clienteAgente: {
              select: {
                razonSocial: true
              }
            }
          }
        }
      },
      orderBy: {
        fechaCalculo: "desc"
      }
    });

    return liquidaciones.map((item) => ({
      idReserva: item.idReserva,
      codigoReserva: item.reserva.codigoReserva,
      cliente: item.reserva.cliente.nombreCompleto,
      clienteAgente: item.reserva.clienteAgente?.razonSocial ?? null,
      fechaViajePrincipal: item.reserva.fechaViajePrincipal,
      totalVentaConfirmada: item.totalVentaConfirmada.toString(),
      totalCostoReal: item.totalCostoReal.toString(),
      utilidadBrutaTotal: item.utilidadBrutaTotal.toString(),
      utilidadPorPersona: item.utilidadPorPersona?.toString() ?? null,
      valorAgencia: item.valorAgencia?.toString() ?? null,
      estadoCierre: item.estadoCierre
    }));
  }
}

export const reportesService = new ReportesService();
