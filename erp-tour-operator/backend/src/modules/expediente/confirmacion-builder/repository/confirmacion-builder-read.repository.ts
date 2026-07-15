/* erp-tour-operator/backend/src/modules/expediente/confirmacion-builder/repository/confirmacion-builder-read.repository.ts */

import { prisma } from "@/core/db/prisma";
import { includeConfirmacionBuilderDetail } from "@/modules/expediente/confirmacion-builder/repository/confirmacion-builder.include";

export class ConfirmacionBuilderReadRepository {
  findOptionsByVersionId(versionId: number) {
    return prisma.cotizacion.findUnique({
      where: {
        id: versionId
      },
      include: {
        expediente: {
          include: {
            cliente: {
              select: {
                id: true,
                nombreCompleto: true
              }
            },
            clienteAgente: {
              select: {
                id: true,
                codigo: true,
                razonSocial: true
              }
            },
            destinoPrincipal: true
          }
        },
        columnas: {
          orderBy: {
            orden: "asc"
          }
        }
      }
    });
  }

  findByVersionId(versionId: number) {
    return prisma.reserva.findUnique({
      where: {
        idCotizacionOrigen: versionId
      },
      include: includeConfirmacionBuilderDetail
    });
  }
}

export const confirmacionBuilderReadRepository =
  new ConfirmacionBuilderReadRepository();