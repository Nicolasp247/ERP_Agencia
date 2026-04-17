import { prisma } from "@/core/db/prisma";
import { AppError } from "@/core/errors/app-error";
import { auditoriaService } from "@/modules/auditoria/service/auditoria.service";
import type { ProveedorFilters, ProveedorInput } from "@/modules/proveedor/dto/proveedor.dto";
import { toProveedorDetail, toProveedorListItem } from "@/modules/proveedor/mapper/proveedor.mapper";
import { proveedorRepository } from "@/modules/proveedor/repository/proveedor.repository";

export class ProveedorService {
  async list(filters: ProveedorFilters) {
    const records = await proveedorRepository.list(filters);
    return records.map(toProveedorListItem);
  }

  async getById(id: number) {
    const record = await proveedorRepository.findById(id);

    if (!record) {
      throw new AppError(404, "PROVEEDOR_NOT_FOUND", "Proveedor no encontrado");
    }

    return toProveedorDetail(record);
  }

  private async resolveLocation(input: ProveedorInput) {
    if (!input.idCiudad) {
      return {
        idCiudad: input.idCiudad ?? null,
        idPais: input.idPais ?? null
      };
    }

    const ciudad = await prisma.ciudad.findUnique({
      where: { id: input.idCiudad }
    });

    if (!ciudad) {
      throw new AppError(400, "CIUDAD_INVALIDA", "La ciudad indicada no existe");
    }

    if (input.idPais && ciudad.idPais !== input.idPais) {
      throw new AppError(400, "UBICACION_INVALIDA", "La combinación país/ciudad no es válida");
    }

    return {
      idCiudad: ciudad.id,
      idPais: ciudad.idPais ?? input.idPais ?? null
    };
  }

  async create(input: ProveedorInput, userId?: number) {
    if (input.codigo) {
      const existing = await proveedorRepository.findByCodigo(input.codigo);

      if (existing) {
        throw new AppError(409, "PROVEEDOR_DUPLICATE", "El código del proveedor ya existe");
      }
    }

    const location = await this.resolveLocation(input);

    const record = await proveedorRepository.create({
      ...input,
      ...location,
      createdBy: userId ?? null
    });

    await auditoriaService.record({
      entidad: "proveedor",
      entidadId: record.id,
      accion: "CREADO",
      valorNuevo: record,
      idUsuario: userId ?? null
    });

    return this.getById(record.id);
  }

  async update(id: number, input: ProveedorInput, userId?: number) {
    const current = await proveedorRepository.findById(id);

    if (!current) {
      throw new AppError(404, "PROVEEDOR_NOT_FOUND", "Proveedor no encontrado");
    }

    if (input.codigo) {
      const duplicate = await proveedorRepository.findByCodigo(input.codigo);

      if (duplicate && duplicate.id !== id) {
        throw new AppError(409, "PROVEEDOR_DUPLICATE", "El código del proveedor ya existe");
      }
    }

    const location = await this.resolveLocation(input);

    const updated = await proveedorRepository.update(id, {
      ...input,
      ...location,
      updatedBy: userId ?? null
    });

    await auditoriaService.record({
      entidad: "proveedor",
      entidadId: updated.id,
      accion: current.activo && !updated.activo ? "DESACTIVADO" : "ACTUALIZADO",
      valorAnterior: current,
      valorNuevo: updated,
      idUsuario: userId ?? null
    });

    return this.getById(updated.id);
  }
}

export const proveedorService = new ProveedorService();
