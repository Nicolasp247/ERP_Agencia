import { prisma } from "@/core/db/prisma";
import { AppError } from "@/core/errors/app-error";
import { auditoriaService } from "@/modules/auditoria/service/auditoria.service";
import type { ServicioFilters, ServicioInput, TipoServicioInput } from "@/modules/servicio/dto/servicio.dto";
import { toServicioDetail, toServicioListItem, toTipoServicioListItem } from "@/modules/servicio/mapper/servicio.mapper";
import { servicioRepository } from "@/modules/servicio/repository/servicio.repository";
import type { ServicioTipoCodigo } from "@/modules/servicio/types/servicio.types";

export class ServicioService {
  async listTipos() {
    const records = await servicioRepository.listTipos();
    return records.map(toTipoServicioListItem);
  }

  async createTipo(input: TipoServicioInput) {
    const record = await servicioRepository.createTipo(input);
    return toTipoServicioListItem(record);
  }

  async updateTipo(id: number, input: TipoServicioInput) {
    const record = await servicioRepository.updateTipo(id, input);
    return toTipoServicioListItem(record);
  }

  async list(filters: ServicioFilters) {
    const records = await servicioRepository.list(filters);
    return records.map(toServicioListItem);
  }

  async getById(id: number) {
    const record = await servicioRepository.findById(id);

    if (!record) {
      throw new AppError(404, "SERVICIO_NOT_FOUND", "Servicio no encontrado");
    }

    return toServicioDetail(record);
  }

    async listIdiomas() {
    return servicioRepository.listIdiomas();
  }

  async listTiposGuia() {
    return servicioRepository.listTiposGuia();
  }

  private async validateMasterData(input: ServicioInput) {
    const [tipo, proveedor, ciudad] = await Promise.all([
      servicioRepository.findTipoById(input.idTipo),
      prisma.proveedor.findUnique({ where: { id: input.idProveedor } }),
      prisma.ciudad.findUnique({ where: { id: input.idCiudad } })
    ]);

    if (!tipo || !tipo.activo) {
      throw new AppError(400, "TIPO_INVALIDO", "No se puede crear el servicio sin tipo válido");
    }

    if (!proveedor || !proveedor.activo) {
      throw new AppError(400, "PROVEEDOR_INVALIDO", "No se puede crear el servicio sin proveedor válido");
    }

    if (!ciudad) {
      throw new AppError(400, "CIUDAD_INVALIDA", "No se puede crear el servicio sin ubicación válida");
    }

    return tipo.codigo as ServicioTipoCodigo;
  }

  private validateDetail(tipoCodigo: ServicioTipoCodigo, input: ServicioInput) {
    if (tipoCodigo === "OTRO") {
      return;
    }

    const detailMap: Record<Exclude<ServicioTipoCodigo, "OTRO">, unknown> = {
      ALOJAMIENTO: input.alojamiento,
      VISITA: input.tour,
      EXCURSION: input.tour,
      TRASLADO: input.traslado,
      ENTRADA: input.tour,
      TREN: input.tren,
      VUELO: input.vuelo
    };

    if (!detailMap[tipoCodigo as Exclude<ServicioTipoCodigo, "OTRO">]) {
      throw new AppError(
        400,
        "DETALLE_TIPO_REQUERIDO",
        `Faltan campos obligatorios del bloque específico para ${tipoCodigo}`
      );
    }

    if (tipoCodigo === "TRASLADO" && input.traslado) {
      const origenTexto = input.traslado.nuevoOrigen?.trim().toLowerCase() ?? "";
      const destinoTexto = input.traslado.nuevoDestino?.trim().toLowerCase() ?? "";

      if (
        (input.traslado.idOrigen &&
          input.traslado.idDestino &&
          input.traslado.idOrigen === input.traslado.idDestino) ||
        (origenTexto && destinoTexto && origenTexto === destinoTexto)
      ) {
        throw new AppError(
          400,
          "TRASLADO_ORIGEN_DESTINO_IGUALES",
          "El origen y el destino no pueden ser iguales"
        );
      }
    }
  }

  async create(input: ServicioInput, userId?: number) {
    const duplicate = await servicioRepository.findByNombre(input.nombreWtravel);

    if (duplicate) {
      throw new AppError(409, "SERVICIO_DUPLICATE", "El nombre interno del servicio ya existe");
    }

    const tipoCodigo = await this.validateMasterData(input);
    this.validateDetail(tipoCodigo, input);

    const record = await servicioRepository.create(
      {
        ...input,
        createdBy: userId ?? null
      },
      tipoCodigo
    );

    await auditoriaService.record({
      entidad: "servicio",
      entidadId: record.id,
      accion: "CREADO",
      valorNuevo: record,
      idUsuario: userId ?? null
    });

    return this.getById(record.id);
  }

  async listPuntosTraslado(idCiudad: number) {
    return servicioRepository.listPuntosTraslado(idCiudad);
  }

  async update(id: number, input: ServicioInput, userId?: number) {
    const current = await servicioRepository.findById(id);

    if (!current) {
      throw new AppError(404, "SERVICIO_NOT_FOUND", "Servicio no encontrado");
    }

    const duplicate = await servicioRepository.findByNombre(input.nombreWtravel);

    if (duplicate && duplicate.id !== id) {
      throw new AppError(409, "SERVICIO_DUPLICATE", "El nombre interno del servicio ya existe");
    }

    const tipoCodigo = await this.validateMasterData(input);
    this.validateDetail(tipoCodigo, input);

    const updated = await servicioRepository.update(
      id,
      {
        ...input,
        updatedBy: userId ?? null
      },
      tipoCodigo
    );

    await auditoriaService.record({
      entidad: "servicio",
      entidadId: updated.id,
      accion: current.activo && !updated.activo ? "DESACTIVADO" : "ACTUALIZADO",
      valorAnterior: current,
      valorNuevo: updated,
      idUsuario: userId ?? null
    });

    return this.getById(updated.id);
  }

  async updateEstado(id: number, activo: boolean, userId?: number) {
    const current = await servicioRepository.findById(id);

    if (!current) {
      throw new AppError(404, "SERVICIO_NOT_FOUND", "Servicio no encontrado");
    }

    const updated = await servicioRepository.updateEstado(id, activo, userId ?? null);

    await auditoriaService.record({
      entidad: "servicio",
      entidadId: updated.id,
      accion: activo ? "ACTIVADO" : "DESACTIVADO",
      valorAnterior: current,
      valorNuevo: updated,
      idUsuario: userId ?? null
    });

    return this.getById(updated.id);
  }
}

export const servicioService = new ServicioService();
