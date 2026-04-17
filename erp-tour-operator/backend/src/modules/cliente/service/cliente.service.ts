import { prisma } from "@/core/db/prisma";
import { AppError } from "@/core/errors/app-error";
import { auditoriaService } from "@/modules/auditoria/service/auditoria.service";
import type { ClienteFilters, ClienteInput } from "@/modules/cliente/dto/cliente.dto";
import { toClienteDetail, toClienteListItem } from "@/modules/cliente/mapper/cliente.mapper";
import { clienteRepository } from "@/modules/cliente/repository/cliente.repository";

export class ClienteService {
  async list(filters: ClienteFilters) {
    const records = await clienteRepository.list(filters);
    return records.map(toClienteListItem);
  }

  async getById(id: number) {
    const record = await clienteRepository.findById(id);

    if (!record) {
      throw new AppError(404, "CLIENTE_NOT_FOUND", "Cliente no encontrado");
    }

    return toClienteDetail(record);
  }

  private async assertClienteAgenteValido(idClienteAgente?: number | null) {
    if (!idClienteAgente) {
      return;
    }

    const agente = await prisma.clienteAgente.findUnique({
      where: { id: idClienteAgente }
    });

    if (!agente || !agente.activo) {
      throw new AppError(400, "CLIENTE_AGENTE_INVALIDO", "El cliente agente no existe o está inactivo");
    }
  }

  async create(input: ClienteInput, userId?: number) {
    await this.assertClienteAgenteValido(input.idClienteAgente);

    const record = await clienteRepository.create({
      ...input,
      createdBy: userId ?? null
    });

    await auditoriaService.record({
      entidad: "cliente",
      entidadId: record.id,
      accion: "CREADO",
      valorNuevo: record,
      idUsuario: userId ?? null
    });

    return this.getById(record.id);
  }

  async update(id: number, input: ClienteInput, userId?: number) {
    await this.assertClienteAgenteValido(input.idClienteAgente);

    const current = await clienteRepository.findById(id);

    if (!current) {
      throw new AppError(404, "CLIENTE_NOT_FOUND", "Cliente no encontrado");
    }

    const updated = await clienteRepository.update(id, {
      ...input,
      updatedBy: userId ?? null
    });

    await auditoriaService.record({
      entidad: "cliente",
      entidadId: updated.id,
      accion: current.activo && !updated.activo ? "ARCHIVADO" : "ACTUALIZADO",
      valorAnterior: current,
      valorNuevo: updated,
      idUsuario: userId ?? null
    });

    return this.getById(updated.id);
  }
}

export const clienteService = new ClienteService();
