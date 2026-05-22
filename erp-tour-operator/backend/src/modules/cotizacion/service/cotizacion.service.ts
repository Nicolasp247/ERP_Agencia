/* erp-tour-operator/backend/src/modules/cotizacion/service/cotizacion.service.ts */

import { CotizacionEstado } from "@prisma/client";

import { prisma } from "@/core/db/prisma";
import { AppError } from "@/core/errors/app-error";
import { auditoriaService } from "@/modules/auditoria/service/auditoria.service";
import type { CotizacionFilters, CotizacionInput, CotizacionItemInput } from "@/modules/cotizacion/dto/cotizacion.dto";
import { toCotizacionDetail, toCotizacionListItem } from "@/modules/cotizacion/mapper/cotizacion.mapper";
import { cotizacionRepository } from "@/modules/cotizacion/repository/cotizacion.repository";
import { resolveItemPricing, sumPassengerGroups } from "@/modules/cotizacion/service/cotizacion.calculator";
import { tarifaService } from "@/modules/tarifa/service/tarifa.service";

export class CotizacionService {
  async list(filters: CotizacionFilters) {
    const records = await cotizacionRepository.list({
      estado: filters.estado ?? "ACTIVA",
      ...filters
    });
    return records.map(toCotizacionListItem);
  }

  async getById(id: number) {
    const record = await cotizacionRepository.findById(id);

    if (!record) {
      throw new AppError(404, "COTIZACION_NOT_FOUND", "Cotización no encontrada");
    }

    return toCotizacionDetail(record);
  }

  private async validateHeader(input: CotizacionInput) {
    const totalCalculado = sumPassengerGroups(input);

    if (totalCalculado !== input.totalPasajeros) {
      throw new AppError(
        400,
        "TOTAL_PASAJEROS_INVALIDO",
        "El total de pasajeros debe coincidir con la suma de los grupos etarios"
      );
    }

    const cliente = await prisma.cliente.findUnique({
      where: { id: input.idCliente }
    });

    if (!cliente) {
      throw new AppError(400, "CLIENTE_INVALIDO", "Debe existir el cliente");
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

  private async prepareItems(items: CotizacionItemInput[], monedaCodigo: string) {
    const services = await prisma.servicio.findMany({
      where: {
        id: {
          in: items.map((item) => item.idServicio)
        }
      }
    });

    if (services.length !== items.length) {
      throw new AppError(400, "SERVICIO_INVALIDO", "Cada ítem debe tener un servicio válido");
    }

    return Promise.all(
      items.map(async (item) => {
        const suggestedTariff = await tarifaService.findSuggestedPrice(item.idServicio, item.fechaServicio);
        const pricing = resolveItemPricing(
          suggestedTariff?.precioUsd ? Number(suggestedTariff.precioUsd.toString()) : null,
          item.precioSugerido,
          item.precioVenta
        );

        return {
          idServicio: item.idServicio,
          fechaServicio: item.fechaServicio,
          ordenDia: item.ordenDia,
          esOpcional: item.esOpcional,
          operadorMostrado: item.operadorMostrado ?? null,
          linkOperador: item.linkOperador ?? null,
          tituloOverride: item.tituloOverride ?? null,
          claseOverride: item.claseOverride ?? null,
          idiomaOverride: item.idiomaOverride ?? null,
          notaLinea: item.notaLinea ?? null,
          precioSugerido: pricing.precioSugerido,
          precioVenta: pricing.precioVenta,
          precioMonedaCodigo: item.precioMonedaCodigo ?? monedaCodigo,
          precioEditadoManual: pricing.precioEditadoManual
        };
      })
    );
  }

  async create(input: CotizacionInput, userId?: number) {
    await this.validateHeader(input);
    const items = await this.prepareItems(input.items, input.monedaCodigo);

    const record = await cotizacionRepository.create(
      {
        ...input,
        createdBy: userId ?? null
      },
      items
    );

    await auditoriaService.record({
      entidad: "cotizacion",
      entidadId: record.id,
      accion: "CREADA",
      valorNuevo: record,
      idUsuario: userId ?? null
    });

    return this.getById(record.id);
  }

  async update(id: number, input: CotizacionInput, userId?: number) {
    const current = await cotizacionRepository.findById(id);

    if (!current) {
      throw new AppError(404, "COTIZACION_NOT_FOUND", "Cotización no encontrada");
    }

    if (current.estado !== CotizacionEstado.ACTIVA) {
      throw new AppError(409, "COTIZACION_NO_EDITABLE", "La cotización no puede editarse en su estado actual");
    }

    await this.validateHeader(input);
    const items = await this.prepareItems(input.items, input.monedaCodigo);

    const updated = await cotizacionRepository.update(
      id,
      {
        ...input,
        updatedBy: userId ?? null
      },
      items
    );

    await auditoriaService.record({
      entidad: "cotizacion",
      entidadId: updated.id,
      accion: "ACTUALIZADA",
      valorAnterior: current,
      valorNuevo: updated,
      idUsuario: userId ?? null
    });

    return this.getById(updated.id);
  }

  async discard(id: number, userId?: number) {
    const current = await cotizacionRepository.findById(id);

    if (!current) {
      throw new AppError(404, "COTIZACION_NOT_FOUND", "Cotización no encontrada");
    }

    if (current.estado !== CotizacionEstado.ACTIVA) {
      throw new AppError(409, "COTIZACION_NO_DESCARTABLE", "Solo se pueden descartar cotizaciones activas");
    }

    const updated = await cotizacionRepository.markDiscarded(id, userId ?? null);

    await auditoriaService.record({
      entidad: "cotizacion",
      entidadId: updated.id,
      accion: "DESCARTADA",
      valorAnterior: current,
      valorNuevo: updated,
      idUsuario: userId ?? null
    });

    return this.getById(updated.id);
  }
}

export const cotizacionService = new CotizacionService();
