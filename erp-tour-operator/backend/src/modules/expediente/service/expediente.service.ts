/* erp-tour-operator/backend/src/modules/expediente/service/expediente.service.ts */

import { ExpedienteEstado } from "@prisma/client";

import { prisma } from "@/core/db/prisma";
import { AppError } from "@/core/errors/app-error";
import { auditoriaService } from "@/modules/auditoria/service/auditoria.service";
import type { ExpedienteFilters, ExpedienteInput } from "@/modules/expediente/dto/expediente.dto";
import { toExpedienteDetail, toExpedienteListItem } from "@/modules/expediente/mapper/expediente.mapper";
import { expedienteRepository } from "@/modules/expediente/repository/expediente.repository";
import { sumPassengerGroups } from "@/modules/expediente/service/expediente.calculator";

export class ExpedienteService {
  async list(filters: ExpedienteFilters) {
    const records = await expedienteRepository.list({
      estado: filters.estado ?? "COTIZACION",
      ...filters
    });

    return records.map(toExpedienteListItem);
  }

  async getById(id: number) {
    const record = await expedienteRepository.findById(id);

    if (!record) {
      throw new AppError(404, "EXPEDIENTE_NOT_FOUND", "Expediente no encontrado");
    }

    return toExpedienteDetail(record);
  }

  private async validateHeader(input: ExpedienteInput) {
    const totalCalculado = sumPassengerGroups(input);

    if (totalCalculado !== input.totalPasajeros) {
      throw new AppError(
        400,
        "TOTAL_PASAJEROS_INVALIDO",
        "El total de pasajeros debe coincidir con la suma de los grupos etarios"
      );
    }

    if (totalCalculado <= 0) {
      throw new AppError(400, "TOTAL_PASAJEROS_CERO", "La cotización debe tener al menos un pasajero");
    }

    const cliente = await prisma.cliente.findUnique({
      where: { id: input.idCliente }
    });

    if (!cliente || !cliente.activo) {
      throw new AppError(400, "CLIENTE_INVALIDO", "Debe existir un cliente activo");
    }

    if (input.idClienteAgente) {
      const agente = await prisma.clienteAgente.findUnique({
        where: { id: input.idClienteAgente }
      });

      if (!agente || !agente.activo) {
        throw new AppError(400, "CLIENTE_AGENTE_INVALIDO", "El cliente agente no existe o está inactivo");
      }
    }
  }

  async create(input: ExpedienteInput, userId?: number) {
    await this.validateHeader(input);

    const record = await expedienteRepository.createExpedienteWithCotizacionA({
      ...input,
      createdBy: userId ?? null
    });

    await auditoriaService.record({
      entidad: "expediente",
      entidadId: record.id,
      accion: "CREADO",
      valorNuevo: record,
      idUsuario: userId ?? null
    });

    return toExpedienteDetail(record);
  }

  async createItineraryVersion(id: number, userId?: number) {
    const current = await expedienteRepository.findById(id);

    if (!current) {
      throw new AppError(404, "EXPEDIENTE_NOT_FOUND", "Expediente no encontrado");
    }

    if (current.estado !== ExpedienteEstado.COTIZACION) {
      throw new AppError(
        409,
        "EXPEDIENTE_NO_PERMITE_ITINERARIOS",
        "Solo se pueden crear nuevos itinerarios en expedientes en cotización"
      );
    }

    const updated = await expedienteRepository.createItineraryVersion(id, userId ?? null);

    if (!updated) {
      throw new AppError(404, "EXPEDIENTE_NOT_FOUND", "Expediente no encontrado");
    }

    await auditoriaService.record({
      entidad: "expediente",
      entidadId: updated.id,
      accion: "ITINERARIO_CREADO",
      valorAnterior: current,
      valorNuevo: updated,
      idUsuario: userId ?? null
    });

    return toExpedienteDetail(updated);
  }

  async update(id: number, input: ExpedienteInput, userId?: number) {
    const current = await expedienteRepository.findById(id);

    if (!current) {
      throw new AppError(404, "EXPEDIENTE_NOT_FOUND", "Expediente no encontrado");
    }

    if (current.estado !== ExpedienteEstado.COTIZACION) {
      throw new AppError(409, "EXPEDIENTE_NO_EDITABLE", "El expediente no puede editarse en su estado actual");
    }

    await this.validateHeader(input);

    const updated = await expedienteRepository.updateExpediente(id, {
      ...input,
      updatedBy: userId ?? null
    });

    await auditoriaService.record({
      entidad: "expediente",
      entidadId: updated.id,
      accion: "ACTUALIZADO",
      valorAnterior: current,
      valorNuevo: updated,
      idUsuario: userId ?? null
    });

    return toExpedienteDetail(updated);
  }

  async discard(id: number, userId?: number) {
    const current = await expedienteRepository.findById(id);

    if (!current) {
      throw new AppError(404, "EXPEDIENTE_NOT_FOUND", "Expediente no encontrado");
    }

    if (current.estado !== ExpedienteEstado.COTIZACION && current.estado !== ExpedienteEstado.CONFIRMACION) {
      throw new AppError(409, "EXPEDIENTE_NO_DESCARTABLE", "Solo se pueden descartar expedientes activos");
    }

    const updated = await expedienteRepository.markDiscarded(id, userId ?? null);

    await auditoriaService.record({
      entidad: "expediente",
      entidadId: updated.id,
      accion: "DESCARTADO",
      valorAnterior: current,
      valorNuevo: updated,
      idUsuario: userId ?? null
    });

    return this.getById(updated.id);
  }
}

export const expedienteService = new ExpedienteService();