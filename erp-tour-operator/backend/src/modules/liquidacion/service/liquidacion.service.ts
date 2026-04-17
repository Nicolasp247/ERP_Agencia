import { LiquidacionEstadoCierre, Prisma } from "@prisma/client";

import { prisma } from "@/core/db/prisma";
import { AppError } from "@/core/errors/app-error";
import { auditoriaService } from "@/modules/auditoria/service/auditoria.service";
import type { ConfirmacionComercialInput } from "@/modules/liquidacion/dto/liquidacion.dto";
import { toLiquidacionResponse } from "@/modules/liquidacion/mapper/liquidacion.mapper";
import { liquidacionRepository } from "@/modules/liquidacion/repository/liquidacion.repository";
import { calculateLiquidacionSnapshot } from "@/modules/liquidacion/service/liquidacion.calculator";
import { reservaRepository } from "@/modules/reserva/repository/reserva.repository";

type ReservaForLiquidacion = NonNullable<
  Awaited<ReturnType<typeof liquidacionRepository.findReservaForLiquidacion>>
>;

export class LiquidacionService {
  async registerConfirmacionComercial(idReserva: number, input: ConfirmacionComercialInput, userId?: number) {
    const reserva = await liquidacionRepository.findReservaForLiquidacion(idReserva);

    if (!reserva) {
      throw new AppError(404, "RESERVA_NOT_FOUND", "Reserva no encontrada");
    }

    if (reserva.estado === "CANCELADA") {
      throw new AppError(409, "RESERVA_CANCELADA", "No se puede confirmar comercialmente una reserva cancelada");
    }

    if (input.items.length !== reserva.items.length) {
      throw new AppError(
        400,
        "CONFIRMACION_INCOMPLETA",
        "La confirmación comercial debe incluir todos los ítems de la reserva"
      );
    }

    const itemsMap = new Map(reserva.items.map((item) => [item.id, item]));
    const totalVentaConfirmada = input.items.reduce((acc, item) => {
      const reservaItem = itemsMap.get(item.idReservaItem);
      if (!reservaItem) {
        throw new AppError(400, "RESERVA_ITEM_INVALIDO", "Ítem de reserva inválido en confirmación comercial");
      }

      if (reservaItem.esOpcional && !item.esOpcionalVendido) {
        return acc;
      }

      return acc + item.precioVentaConfirmado;
    }, 0);

    const version = (reserva.confirmacionesComerciales[0]?.version ?? 0) + 1;

    const confirmacion = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.reservaConfirmacionComercial.updateMany({
        where: {
          idReserva,
          estado: "ACTIVA"
        },
        data: {
          estado: "REEMPLAZADA"
        }
      });

      const created = await tx.reservaConfirmacionComercial.create({
        data: {
          idReserva,
          version,
          estado: "ACTIVA",
          totalVentaConfirmada,
          monedaCodigo: reserva.monedaCodigo,
          observacion: input.observacion,
          fechaConfirmacion: new Date(),
          confirmedBy: userId ?? null,
          items: {
            create: input.items
          }
        }
      });

      await tx.reserva.update({
        where: { id: idReserva },
        data: {
          confirmacionComercialEstado: "CONFIRMADA",
          updatedBy: userId ?? null
        }
      });

      return created;
    });

    await auditoriaService.record({
      entidad: "reserva",
      entidadId: idReserva,
      accion: "CONFIRMACION_COMERCIAL",
      valorNuevo: {
        confirmacionId: confirmacion.id,
        version,
        totalVentaConfirmada
      },
      idUsuario: userId ?? null
    });

    return this.getLiquidacionOrReservaContext(idReserva);
  }

  private calculateFromReserva(
    reserva: ReservaForLiquidacion
  ) {
    const confirmacionActiva = reserva.confirmacionesComerciales[0];

    if (!confirmacionActiva) {
      throw new AppError(409, "SIN_CONFIRMACION_COMERCIAL", "La reserva no tiene confirmación comercial activa");
    }

    const confirmItemsMap = new Map(confirmacionActiva.items.map((item) => [item.idReservaItem, item] as const));
    const soldItems = reserva.items.filter((item) => {
      const confirmationItem = confirmItemsMap.get(item.id);
      if (!confirmationItem) {
        return false;
      }

      if (item.esOpcional) {
        return confirmationItem.esOpcionalVendido;
      }

      return true;
    });

    return calculateLiquidacionSnapshot({
      totalVentaConfirmada: Number(confirmacionActiva.totalVentaConfirmada.toString()),
      totalPasajeros: reserva.totalPasajeros,
      comisionPctSnapshot: reserva.comisionPctSnapshot ? Number(reserva.comisionPctSnapshot.toString()) : null,
      items: soldItems.map((item) => ({
        vendido: true,
        costoCotizado: Number(item.costoCotizado?.toString() ?? 0),
        costoFinal: Number(item.costoFinal?.toString() ?? 0)
      }))
    });
  }

  async recalculate(idReserva: number, userId?: number) {
    const reserva = await liquidacionRepository.findReservaForLiquidacion(idReserva);

    if (!reserva) {
      throw new AppError(404, "RESERVA_NOT_FOUND", "Reserva no encontrada");
    }

    const calculation = this.calculateFromReserva(reserva);

    const record = await prisma.liquidacionReserva.upsert({
      where: {
        idReserva
      },
      update: {
        ...calculation,
        monedaCodigo: reserva.monedaCodigo,
        fechaCalculo: new Date()
      },
      create: {
        idReserva,
        ...calculation,
        monedaCodigo: reserva.monedaCodigo,
        fechaCalculo: new Date(),
        estadoCierre: LiquidacionEstadoCierre.ABIERTA
      }
    });

    await auditoriaService.record({
      entidad: "liquidacion_reserva",
      entidadId: record.id,
      accion: "RECALCULADA",
      valorNuevo: calculation,
      idUsuario: userId ?? null
    });

    return toLiquidacionResponse(record);
  }

  async close(idReserva: number, userId?: number) {
    const reserva = await liquidacionRepository.findReservaForLiquidacion(idReserva);

    if (!reserva) {
      throw new AppError(404, "RESERVA_NOT_FOUND", "Reserva no encontrada");
    }

    const confirmacionActiva = reserva.confirmacionesComerciales[0];

    if (!confirmacionActiva) {
      throw new AppError(409, "SIN_CONFIRMACION_COMERCIAL", "La reserva no tiene confirmación comercial activa");
    }

    const confirmationItems = new Map(confirmacionActiva.items.map((item) => [item.idReservaItem, item]));
    const missingCosts = reserva.items.some((item) => {
      const confirmation = confirmationItems.get(item.id);

      if (!confirmation) {
        return false;
      }

      if (item.esOpcional && !confirmation.esOpcionalVendido) {
        return false;
      }

      return item.costoFinal === null;
    });

    if (missingCosts) {
      throw new AppError(409, "COSTOS_FINALES_INCOMPLETOS", "No se puede cerrar la liquidación sin costos finales");
    }

    const recalculated = await this.recalculate(idReserva, userId);

    const record = await prisma.liquidacionReserva.update({
      where: { idReserva },
      data: {
        estadoCierre: LiquidacionEstadoCierre.CERRADA,
        fechaCierre: new Date()
      }
    });

    await auditoriaService.record({
      entidad: "liquidacion_reserva",
      entidadId: record.id,
      accion: "CERRADA",
      valorNuevo: recalculated,
      idUsuario: userId ?? null
    });

    return toLiquidacionResponse(record);
  }

  async getLiquidacionOrReservaContext(idReserva: number) {
    const reserva = await reservaRepository.findById(idReserva);

    if (!reserva) {
      throw new AppError(404, "RESERVA_NOT_FOUND", "Reserva no encontrada");
    }

    return {
      confirmacionComercialEstado: reserva.confirmacionComercialEstado,
      confirmacionesComerciales: reserva.confirmacionesComerciales.map((item: ReservaForLiquidacion["confirmacionesComerciales"][number]) => ({
        id: item.id,
        version: item.version,
        estado: item.estado,
        totalVentaConfirmada: item.totalVentaConfirmada.toString(),
        fechaConfirmacion: item.fechaConfirmacion
      })),
      liquidacion: reserva.liquidacion ? toLiquidacionResponse(reserva.liquidacion) : null
    };
  }
}

export const liquidacionService = new LiquidacionService();
