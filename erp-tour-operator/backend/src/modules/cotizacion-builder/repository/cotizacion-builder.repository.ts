/* erp-tour-operator/backend/src/modules/cotizacion-builder/repository/cotizacion-builder.repository.ts */

import {
  CotizacionColumnaTipo,
  CotizacionColumnaUnidad,
  Prisma
} from "@prisma/client";

import { prisma } from "@/core/db/prisma";

const DEFAULT_COLUMNS = [
  {
    grupo: "Primera",
    nombre: "Doble",
    tipo: CotizacionColumnaTipo.HOTEL,
    unidad: CotizacionColumnaUnidad.POR_PERSONA,
    orden: 1
  },
  {
    grupo: "Lujo",
    nombre: "Doble",
    tipo: CotizacionColumnaTipo.HOTEL,
    unidad: CotizacionColumnaUnidad.POR_PERSONA,
    orden: 2
  },
  {
    grupo: "Transporte",
    nombre: "Adulto",
    tipo: CotizacionColumnaTipo.TRANSPORTE,
    unidad: CotizacionColumnaUnidad.POR_PERSONA,
    orden: 3
  },
  {
    grupo: "Opcionales",
    nombre: "Adulto",
    tipo: CotizacionColumnaTipo.OPCIONAL,
    unidad: CotizacionColumnaUnidad.POR_PERSONA,
    orden: 4
  }
];

export class CotizacionBuilderRepository {
  private includeBuilderDetail = {
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
        orden: "asc" as const
      }
    },
    items: {
      include: {
        servicio: {
          include: {
            proveedor: {
              select: {
                id: true,
                nombreComercial: true
              }
            },
            tipo: true
          }
        },
        precios: true
      },
      orderBy: [
        {
          fechaServicio: "asc" as const
        },
        {
          ordenDia: "asc" as const
        }
      ]
    }
  } satisfies Prisma.CotizacionInclude;

  findVersionById(versionId: number) {
    return prisma.cotizacion.findUnique({
      where: {
        id: versionId
      },
      include: this.includeBuilderDetail
    });
  }

  async ensureDefaultColumns(versionId: number) {
    const count = await prisma.cotizacionColumna.count({
      where: {
        idCotizacion: versionId
      }
    });

    if (count > 0) {
      return;
    }

    await prisma.cotizacionColumna.createMany({
      data: DEFAULT_COLUMNS.map((column) => ({
        idCotizacion: versionId,
        grupo: column.grupo,
        nombre: column.nombre,
        tipo: column.tipo,
        unidad: column.unidad,
        orden: column.orden,
        activo: true
      }))
    });
  }
}

export const cotizacionBuilderRepository = new CotizacionBuilderRepository();