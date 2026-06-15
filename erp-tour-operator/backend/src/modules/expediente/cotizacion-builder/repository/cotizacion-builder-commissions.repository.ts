/* erp-tour-operator/backend/src/modules/expediente/cotizacion-builder/repository/cotizacion-builder-commissions.repository.ts */

import { Prisma } from "@prisma/client";

import { prisma } from "@/core/db/prisma";
import type { CotizacionBuilderCommissionInput } from "@/modules/expediente/cotizacion-builder/dto/cotizacion-builder.dto";
import { DEFAULT_COMMISSION_RULES } from "@/modules/expediente/cotizacion-builder/repository/cotizacion-builder.constants";
import {
  calculateCommissionFactor,
  calculateCommissionTotal
} from "@/modules/expediente/cotizacion-builder/repository/cotizacion-builder.helpers";
import { includeBuilderDetail } from "@/modules/expediente/cotizacion-builder/repository/cotizacion-builder.include";

export class CotizacionBuilderCommissionsRepository {
  async ensureCommissionSnapshot(versionId: number) {
    return prisma.$transaction(async (tx) => {
      const cotizacion = await tx.cotizacion.findUnique({
        where: {
          id: versionId
        },
        select: {
          id: true,
          idClienteAgente: true
        }
      });

      if (!cotizacion) {
        return null;
      }

      const existingCount = await tx.cotizacionComision.count({
        where: {
          idCotizacion: versionId
        }
      });

      if (existingCount > 0) {
        return cotizacion;
      }

      const agentRules = cotizacion.idClienteAgente
        ? await tx.clienteAgenteComision.findMany({
            where: {
              idClienteAgente: cotizacion.idClienteAgente,
              activo: true
            }
          })
        : [];

      const rulesToUse = agentRules.length > 0 ? agentRules : DEFAULT_COMMISSION_RULES;

      await tx.cotizacionComision.createMany({
        data: rulesToUse.map((rule) => {
          const porcentajeAgente = new Prisma.Decimal(rule.porcentajeAgente);
          const porcentajeWtravel = new Prisma.Decimal(rule.porcentajeWtravel);
          const porcentajeBancario = new Prisma.Decimal(rule.porcentajeBancario);
          const porcentajeTotal = calculateCommissionTotal(
            porcentajeAgente,
            porcentajeWtravel,
            porcentajeBancario
          );
          const factorVenta = calculateCommissionFactor(porcentajeTotal);

          return {
            idCotizacion: versionId,
            tipoComision: rule.tipoComision,
            porcentajeAgente,
            porcentajeWtravel,
            porcentajeBancario,
            porcentajeTotal,
            factorVenta
          };
        })
      });

      return cotizacion;
    });
  }

  async updateCommission(versionId: number, data: CotizacionBuilderCommissionInput) {
    return prisma.$transaction(async (tx) => {
      const cotizacion = await tx.cotizacion.findUnique({
        where: {
          id: versionId
        },
        select: {
          id: true
        }
      });

      if (!cotizacion) {
        return null;
      }

      const porcentajeAgente = new Prisma.Decimal(data.porcentajeAgente);
      const porcentajeWtravel = new Prisma.Decimal(data.porcentajeWtravel);
      const porcentajeBancario = new Prisma.Decimal(data.porcentajeBancario);
      const porcentajeTotal = calculateCommissionTotal(
        porcentajeAgente,
        porcentajeWtravel,
        porcentajeBancario
      );
      const factorVenta = calculateCommissionFactor(porcentajeTotal);

      await tx.cotizacionComision.upsert({
        where: {
          idCotizacion_tipoComision: {
            idCotizacion: versionId,
            tipoComision: data.tipoComision
          }
        },
        create: {
          idCotizacion: versionId,
          tipoComision: data.tipoComision,
          porcentajeAgente,
          porcentajeWtravel,
          porcentajeBancario,
          porcentajeTotal,
          factorVenta
        },
        update: {
          porcentajeAgente,
          porcentajeWtravel,
          porcentajeBancario,
          porcentajeTotal,
          factorVenta
        }
      });

      return tx.cotizacion.findUnique({
        where: {
          id: versionId
        },
        include: includeBuilderDetail
      });
    });
  }
}

export const cotizacionBuilderCommissionsRepository = new CotizacionBuilderCommissionsRepository();