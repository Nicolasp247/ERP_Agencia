import { Prisma, ReservaItemEstado, ReservaEstado } from "@prisma/client";

import { prisma } from "@/core/db/prisma";
import { AppError } from "@/core/errors/app-error";
import { auditoriaService } from "@/modules/auditoria/service/auditoria.service";
import { cotizacionRepository } from "@/modules/cotizacion/repository/cotizacion.repository";
import { cotizacionRepository as quoteRepository } from "@/modules/cotizacion/repository/cotizacion.repository";
import { toReservaDetail, toReservaListItem } from "@/modules/reserva/mapper/reserva.mapper";
import { reservaRepository } from "@/modules/reserva/repository/reserva.repository";
import { buildReservaItemSnapshot } from "@/modules/reserva/service/reserva.snapshot";
import { buildReservaCode, calculateReservaEstado } from "@/modules/reserva/service/reserva-state";
import type {
  ReservaCancelInput,
  ReservaConfirmacionItemInput,
  ReservaFilters,
  ReservaUpdateInput
} from "@/modules/reserva/dto/reserva.dto";

export class ReservaService {
  async list(filters: ReservaFilters) {
    const records = await reservaRepository.list(filters);
    return records.map(toReservaListItem);
  }

  async getById(id: number) {
    const record = await reservaRepository.findById(id);

    if (!record) {
      throw new AppError(404, "RESERVA_NOT_FOUND", "Reserva no encontrada");
    }

    return toReservaDetail(record);
  }

  async convertFromCotizacion(cotizacionId: number, userId?: number) {
    const cotizacion = await prisma.cotizacion.findUnique({
      where: { id: cotizacionId },
      include: {
        items: {
          include: {
            servicio: {
              include: {
                tour: true,
                boletoEntrada: true,
                tren: true,
                vuelo: true
              }
            }
          },
          orderBy: [{ fechaServicio: "asc" }, { ordenDia: "asc" }]
        }
      }
    });

    if (!cotizacion) {
      throw new AppError(404, "COTIZACION_NOT_FOUND", "Cotización no encontrada");
    }

    if (cotizacion.estado !== "ACTIVA") {
      throw new AppError(409, "COTIZACION_NO_CONVERTIBLE", "La cotización no puede convertirse a reserva");
    }

    const existing = await reservaRepository.findByCotizacionOrigen(cotizacionId);

    if (existing) {
      throw new AppError(409, "RESERVA_DUPLICATE", "La cotización ya fue convertida a reserva");
    }

    const reserva = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const created = await tx.reserva.create({
        data: {
          idCotizacionOrigen: cotizacion.id,
          idCliente: cotizacion.idCliente,
          idClienteAgente: cotizacion.idClienteAgente,
          codigoReserva: buildReservaCode(cotizacion.id),
          estado: ReservaEstado.PENDIENTE,
          confirmacionComercialEstado: "NO_CONFIRMADA",
          fechaViajePrincipal: cotizacion.fechaViajePrincipal,
          idDestinoPrincipal: cotizacion.idDestinoPrincipal,
          categoriaViaje: cotizacion.categoriaViaje,
          monedaCodigo: cotizacion.monedaCodigo,
          totalPasajeros: cotizacion.totalPasajeros,
          adultos65: cotizacion.adultos65,
          adultos1964: cotizacion.adultos1964,
          jovenes1218: cotizacion.jovenes1218,
          ninos311: cotizacion.ninos311,
          infantes02: cotizacion.infantes02,
          comisionPctSnapshot: cotizacion.comisionPctAplicada,
          nota: cotizacion.nota,
          fechaConversion: new Date(),
          createdBy: userId ?? null,
          updatedBy: userId ?? null
        }
      });

      await tx.reservaItem.createMany({
        data: cotizacion.items.map((item) => ({
          idReserva: created.id,
          ...buildReservaItemSnapshot(item)
        }))
      });

      await tx.cotizacion.update({
        where: { id: cotizacion.id },
        data: {
          estado: "CONVERTIDA_RESERVA",
          fechaConvertidaReserva: new Date(),
          updatedBy: userId ?? null
        }
      });

      return created;
    });

    await auditoriaService.record({
      entidad: "cotizacion",
      entidadId: cotizacion.id,
      accion: "CONVERTIDA_RESERVA",
      valorAnterior: { estado: cotizacion.estado },
      valorNuevo: { reservaId: reserva.id },
      idUsuario: userId ?? null
    });

    await auditoriaService.record({
      entidad: "reserva",
      entidadId: reserva.id,
      accion: "CREADA_DESDE_COTIZACION",
      valorNuevo: { cotizacionId: cotizacion.id },
      idUsuario: userId ?? null
    });

    return this.getById(reserva.id);
  }

  async updateOperational(id: number, input: ReservaUpdateInput, userId?: number) {
    const current = await reservaRepository.findById(id);

    if (!current) {
      throw new AppError(404, "RESERVA_NOT_FOUND", "Reserva no encontrada");
    }

    const itemMap = new Map(current.items.map((item) => [item.id, item]));

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.reserva.update({
        where: { id },
        data: {
          nota: input.nota ?? current.nota,
          updatedBy: userId ?? null
        }
      });

      for (const itemInput of input.items) {
        const previous = itemMap.get(itemInput.id);

        if (!previous) {
          throw new AppError(400, "RESERVA_ITEM_INVALIDO", "Ítem de reserva inválido");
        }

        await tx.reservaItem.update({
          where: { id: itemInput.id },
          data: {
            costoFinal: itemInput.costoFinal ?? previous.costoFinal,
            estadoItem: itemInput.estadoItem ?? previous.estadoItem
          }
        });

        if (itemInput.costoFinal !== undefined && itemInput.costoFinal !== null) {
          await auditoriaService.record({
            entidad: "reserva_item",
            entidadId: itemInput.id,
            accion: "CAMBIO_COSTO_FINAL",
            valorAnterior: { costoFinal: previous.costoFinal?.toString() ?? null },
            valorNuevo: { costoFinal: itemInput.costoFinal },
            idUsuario: userId ?? null
          });
        }
      }

      const updatedItems = await tx.reservaItem.findMany({
        where: { idReserva: id }
      });

      await tx.reserva.update({
        where: { id },
        data: {
          estado: calculateReservaEstado(updatedItems, false)
        }
      });
    });

    return this.getById(id);
  }

  async registerItemConfirmation(
    reservaId: number,
    itemId: number,
    input: ReservaConfirmacionItemInput,
    userId?: number
  ) {
    const reserva = await reservaRepository.findById(reservaId);

    if (!reserva) {
      throw new AppError(404, "RESERVA_NOT_FOUND", "Reserva no encontrada");
    }

    const item = reserva.items.find((entry) => entry.id === itemId);

    if (!item) {
      throw new AppError(404, "RESERVA_ITEM_NOT_FOUND", "Ítem de reserva no encontrado");
    }

    const now = new Date();

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.reservaItem.update({
        where: { id: itemId },
        data: {
          numeroConfirmacion: input.numeroConfirmacion ?? null,
          fechaPrimerConfirmacion:
            input.numeroConfirmacion && !item.fechaPrimerConfirmacion ? now : item.fechaPrimerConfirmacion,
          fechaUltimaConfirmacion: input.numeroConfirmacion ? now : item.fechaUltimaConfirmacion,
          estadoItem: input.numeroConfirmacion
            ? ReservaItemEstado.CONFIRMADO
            : input.estadoItem ?? ReservaItemEstado.PENDIENTE
        }
      });

      const updatedItems = await tx.reservaItem.findMany({
        where: { idReserva: reservaId }
      });

      await tx.reserva.update({
        where: { id: reservaId },
        data: {
          estado: calculateReservaEstado(updatedItems, false)
        }
      });
    });

    await auditoriaService.record({
      entidad: "reserva_item",
      entidadId: itemId,
      accion: item.numeroConfirmacion ? "CAMBIO_NUMERO_CONFIRMACION" : "ALTA_NUMERO_CONFIRMACION",
      valorAnterior: { numeroConfirmacion: item.numeroConfirmacion },
      valorNuevo: { numeroConfirmacion: input.numeroConfirmacion ?? null },
      idUsuario: userId ?? null
    });

    return this.getById(reservaId);
  }

  async cancel(id: number, input: ReservaCancelInput, userId?: number) {
    const current = await reservaRepository.findById(id);

    if (!current) {
      throw new AppError(404, "RESERVA_NOT_FOUND", "Reserva no encontrada");
    }

    await prisma.reserva.update({
      where: { id },
      data: {
        estado: ReservaEstado.CANCELADA,
        fechaCancelacion: new Date(),
        motivoCancelacion: input.motivoCancelacion,
        updatedBy: userId ?? null
      }
    });

    await auditoriaService.record({
      entidad: "reserva",
      entidadId: id,
      accion: "CANCELADA",
      valorAnterior: { estado: current.estado },
      valorNuevo: { estado: "CANCELADA", motivoCancelacion: input.motivoCancelacion },
      idUsuario: userId ?? null
    });

    return this.getById(id);
  }
}

export const reservaService = new ReservaService();
