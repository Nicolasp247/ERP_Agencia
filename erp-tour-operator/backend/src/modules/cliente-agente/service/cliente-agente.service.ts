import { AppError } from "@/core/errors/app-error";
import { toClienteAgenteDetail, toClienteAgenteListItem } from "@/modules/cliente-agente/mapper/cliente-agente.mapper";
import { clienteAgenteRepository } from "@/modules/cliente-agente/repository/cliente-agente.repository";
import type { ClienteAgenteFilters, ClienteAgenteInput } from "@/modules/cliente-agente/dto/cliente-agente.dto";
import { auditoriaService } from "@/modules/auditoria/service/auditoria.service";

export class ClienteAgenteService {
  async list(filters: ClienteAgenteFilters) {
    const records = await clienteAgenteRepository.list(filters);
    return records.map(toClienteAgenteListItem);
  }

  async getById(id: number) {
    const record = await clienteAgenteRepository.findById(id);

    if (!record) {
      throw new AppError(404, "CLIENTE_AGENTE_NOT_FOUND", "Cliente agente no encontrado");
    }

    return toClienteAgenteDetail(record);
  }

  async create(input: ClienteAgenteInput, userId?: number) {
    const existing = await clienteAgenteRepository.findByCodigo(input.codigo);

    if (existing) {
      throw new AppError(409, "CLIENTE_AGENTE_DUPLICATE", "El código del cliente agente ya existe");
    }

    const record = await clienteAgenteRepository.create({
      ...input,
      createdBy: userId ?? null
    });

    await auditoriaService.record({
      entidad: "cliente_agente",
      entidadId: record.id,
      accion: "CREADO",
      valorNuevo: record,
      idUsuario: userId ?? null
    });

    return this.getById(record.id);
  }

  async update(id: number, input: ClienteAgenteInput, userId?: number) {
    const current = await clienteAgenteRepository.findById(id);

    if (!current) {
      throw new AppError(404, "CLIENTE_AGENTE_NOT_FOUND", "Cliente agente no encontrado");
    }

    const duplicate = await clienteAgenteRepository.findByCodigo(input.codigo);

    if (duplicate && duplicate.id !== id) {
      throw new AppError(409, "CLIENTE_AGENTE_DUPLICATE", "El código del cliente agente ya existe");
    }

    const updated = await clienteAgenteRepository.update(id, {
      ...input,
      updatedBy: userId ?? null
    });

    await auditoriaService.record({
      entidad: "cliente_agente",
      entidadId: updated.id,
      accion: current.activo && !updated.activo ? "DESACTIVADO" : "ACTUALIZADO",
      valorAnterior: current,
      valorNuevo: updated,
      idUsuario: userId ?? null
    });

    return this.getById(updated.id);
  }

  deactivate(id: number, userId?: number) {
    return this.update(
      id,
      {
        codigo: "",
        razonSocial: "",
        activo: false
      } as ClienteAgenteInput,
      userId
    );
  }
}

export const clienteAgenteService = new ClienteAgenteService();
