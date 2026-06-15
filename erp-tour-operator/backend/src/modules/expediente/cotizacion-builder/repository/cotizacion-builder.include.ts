/* erp-tour-operator/backend/src/modules/expediente/cotizacion-builder/repository/cotizacion-builder.include.ts */

import { Prisma } from "@prisma/client";

export const includeBuilderDetail = {
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
  comisiones: {
    orderBy: {
      tipoComision: "asc" as const
    }
  },
  items: {
    include: {
      servicio: {
        include: {
          proveedor: {
            select: {
              id: true,
              codigo: true,
              nombreComercial: true
            }
          },
          tipo: true,
          ciudad: {
            include: {
              pais: true
            }
          },
          alojamiento: true
        }
      },
      precios: true,
      alojamientoDetalle: true,
      hotelesPrevistos: true
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