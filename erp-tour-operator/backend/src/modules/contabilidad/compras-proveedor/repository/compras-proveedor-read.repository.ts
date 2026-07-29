// erp-tour-operator/backend/src/modules/contabilidad/compras-proveedor/dto/compras-proveedor.dto.ts

import { Prisma } from "@prisma/client";

import { prisma } from "@/core/db/prisma";

export const includeProveedorReservaDetail = {
  proveedor: {
    select: {
      id: true,
      codigo: true,
      nombreComercial: true
    }
  },

  reservaAnterior: {
    select: {
      id: true,
      codigoInterno: true,
      codigoProveedor: true,
      estadoOperativo: true
    }
  },

  reservaReemplazo: {
    select: {
      id: true,
      codigoInterno: true,
      codigoProveedor: true,
      estadoOperativo: true
    }
  },

  reserva: {
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

      cotizacionOrigen: {
        include: {
          expediente: {
            select: {
              id: true,
              codigo: true,
              nombreExpediente: true
            }
          }
        }
      }
    }
  },

  items: {
    include: {
      reservaColumnaSeleccionada: {
        select: {
          id: true,
          grupoSnapshot: true,
          nombreSnapshot: true,
          tipoSnapshot: true,
          unidadSnapshot: true,
          multiplicadorSnapshot: true,
          orden: true
        }
      },

      reservaItem: {
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

              alojamiento: true,

              tour: {
                include: {
                  tipoGuia: true,
                  idioma: true
                }
              },

              traslado: {
                include: {
                  origen: true,
                  destino: true
                }
              },

              tren: true,
              vuelo: true
            }
          }
        }
      }
    },

    orderBy: {
      id: "asc" as const
    }
  },

  pagos: {
    orderBy: [
      {
        fechaCargo: "asc" as const
      },
      {
        id: "asc" as const
      }
    ]
  },

  eventos: {
    orderBy: [
      {
        createdAt: "asc" as const
      },
      {
        id: "asc" as const
      }
    ]
  }
} satisfies Prisma.ProveedorReservaInclude;

export class ComprasProveedorReadRepository {
  findById(
    proveedorReservaId: number
  ) {
    return prisma.proveedorReserva.findUnique({
      where: {
        id: proveedorReservaId
      },

      include:
        includeProveedorReservaDetail
    });
  }

  findByItemId(
    itemId: number
  ) {
    return prisma.proveedorReserva.findMany({
      where: {
        items: {
          some: {
            idReservaItem: itemId
          }
        }
      },

      include:
        includeProveedorReservaDetail,

      orderBy: [
        {
          esVigente: "desc"
        },
        {
          createdAt: "desc"
        },
        {
          id: "desc"
        }
      ]
    });
  }
}

export const comprasProveedorReadRepository =
  new ComprasProveedorReadRepository();