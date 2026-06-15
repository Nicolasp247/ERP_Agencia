/* erp-tour-operator/backend/src/modules/expediente/service/expediente.service.ts */

import { CotizacionVersionEstado, ExpedienteEstado } from "@prisma/client";

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

  async duplicateItineraryVersion(versionId: number, userId?: number) {
    const version = await prisma.cotizacion.findUnique({
      where: {
        id: versionId
      },
      include: {
        expediente: true
      }
    });

    if (!version) {
      throw new AppError(404, "COTIZACION_VERSION_NOT_FOUND", "Versión de cotización no encontrada");
    }

    if (version.expediente.estado !== ExpedienteEstado.COTIZACION) {
      throw new AppError(
        409,
        "EXPEDIENTE_NO_PERMITE_DUPLICAR",
        "Solo se pueden duplicar versiones de expedientes en cotización"
      );
    }

    const updated = await expedienteRepository.duplicateItineraryVersion(versionId, userId ?? null);

    if (!updated) {
      throw new AppError(404, "COTIZACION_VERSION_NOT_FOUND", "Versión de cotización no encontrada");
    }

    await auditoriaService.record({
      entidad: "expediente",
      entidadId: updated.id,
      accion: "ITINERARIO_DUPLICADO",
      valorAnterior: version,
      valorNuevo: updated,
      idUsuario: userId ?? null
    });

    return toExpedienteDetail(updated);
  }

  async deleteItineraryVersion(versionId: number, userId?: number) {
    const version = await prisma.cotizacion.findUnique({
      where: {
        id: versionId
      },
      include: {
        expediente: true,
        reserva: {
          select: {
            id: true
          }
        }
      }
    });

    if (!version) {
      throw new AppError(404, "COTIZACION_VERSION_NOT_FOUND", "Versión de cotización no encontrada");
    }

    if (version.expediente.estado !== ExpedienteEstado.COTIZACION) {
      throw new AppError(
        409,
        "EXPEDIENTE_NO_PERMITE_ELIMINAR_VERSIONES",
        "Solo se pueden eliminar versiones de expedientes en cotización"
      );
    }

    if (
      version.estadoVersion === CotizacionVersionEstado.ACEPTADA ||
      version.estadoVersion === CotizacionVersionEstado.CONVERTIDA_CONFIRMACION
    ) {
      throw new AppError(
        409,
        "COTIZACION_VERSION_NO_ELIMINABLE",
        "No se puede eliminar una versión aceptada o convertida en confirmación"
      );
    }

    if (version.reserva) {
      throw new AppError(
        409,
        "COTIZACION_VERSION_CON_RESERVA",
        "No se puede eliminar una versión que ya tiene reserva asociada"
      );
    }

    const totalVersions = await prisma.cotizacion.count({
      where: {
        idExpediente: version.idExpediente
      }
    });

    if (totalVersions <= 1) {
      throw new AppError(
        409,
        "EXPEDIENTE_DEBE_TENER_UNA_VERSION",
        "El expediente debe conservar al menos una versión de cotización"
      );
    }

    const updated = await expedienteRepository.deleteItineraryVersion(versionId);

    if (!updated) {
      throw new AppError(404, "COTIZACION_VERSION_NOT_FOUND", "Versión de cotización no encontrada");
    }

    await auditoriaService.record({
      entidad: "expediente",
      entidadId: updated.id,
      accion: "ITINERARIO_ELIMINADO",
      valorAnterior: version,
      valorNuevo: updated,
      idUsuario: userId ?? null
    });

    return toExpedienteDetail(updated);
  }

  async updateItineraryVersionStatus(versionId: number, estado: string, userId?: number) {
    const validStatuses = new Set<CotizacionVersionEstado>([
      CotizacionVersionEstado.BORRADOR,
      CotizacionVersionEstado.ENVIADA,
      CotizacionVersionEstado.ACEPTADA,
      CotizacionVersionEstado.DESCARTADA
    ]);

    if (!validStatuses.has(estado as CotizacionVersionEstado)) {
      throw new AppError(
        400,
        "ESTADO_VERSION_INVALIDO",
        "El estado de la versión no es válido"
      );
    }

    const version = await prisma.cotizacion.findUnique({
      where: {
        id: versionId
      },
      include: {
        expediente: true,
        reserva: {
          select: {
            id: true
          }
        }
      }
    });

    if (!version) {
      throw new AppError(404, "COTIZACION_VERSION_NOT_FOUND", "Versión de cotización no encontrada");
    }

    if (version.expediente.estado !== ExpedienteEstado.COTIZACION) {
      throw new AppError(
        409,
        "EXPEDIENTE_NO_PERMITE_CAMBIAR_ESTADO_VERSION",
        "Solo se puede cambiar el estado de versiones en expedientes en cotización"
      );
    }

    if (version.estadoVersion === CotizacionVersionEstado.CONVERTIDA_CONFIRMACION) {
      throw new AppError(
        409,
        "COTIZACION_VERSION_CONVERTIDA",
        "No se puede cambiar el estado de una versión convertida en confirmación"
      );
    }

    if (version.reserva) {
      throw new AppError(
        409,
        "COTIZACION_VERSION_CON_RESERVA",
        "No se puede cambiar el estado de una versión que ya tiene reserva asociada"
      );
    }

    const updated = await expedienteRepository.updateItineraryVersionStatus(
      versionId,
      estado as CotizacionVersionEstado,
      userId ?? null
    );

    if (!updated) {
      throw new AppError(404, "COTIZACION_VERSION_NOT_FOUND", "Versión de cotización no encontrada");
    }

    await auditoriaService.record({
      entidad: "expediente",
      entidadId: updated.id,
      accion: "ESTADO_VERSION_ACTUALIZADO",
      valorAnterior: version,
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