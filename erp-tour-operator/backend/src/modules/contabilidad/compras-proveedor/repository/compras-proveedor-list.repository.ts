// erp-tour-operator/backend/src/modules/contabilidad/compras-proveedor/repository/compras-proveedor-list.repository.ts

import {
  Prisma
} from "@prisma/client";

import { prisma } from "@/core/db/prisma";

import type {
  ComprasProveedorListQuery
} from "@/modules/contabilidad/compras-proveedor/dto/compras-proveedor.dto";

function toDateOnly(
  value: string
) {
  return new Date(
    `${value}T00:00:00.000Z`
  );
}

function buildSearchWhere(
  search: string
): Prisma.ProveedorReservaWhereInput {
  return {
    OR: [
      {
        codigoInterno: {
          contains: search
        }
      },
      {
        codigoProveedor: {
          contains: search
        }
      },
      {
        proveedor: {
          is: {
            OR: [
              {
                codigo: {
                  contains: search
                }
              },
              {
                nombreComercial: {
                  contains: search
                }
              }
            ]
          }
        }
      },
      {
        reserva: {
          is: {
            codigoReserva: {
              contains: search
            }
          }
        }
      },
      {
        reserva: {
          is: {
            cliente: {
              is: {
                nombreCompleto: {
                  contains: search
                }
              }
            }
          }
        }
      },
      {
        reserva: {
          is: {
            cotizacionOrigen: {
              is: {
                expediente: {
                  is: {
                    OR: [
                      {
                        codigo: {
                          contains: search
                        }
                      },
                      {
                        nombreExpediente: {
                          contains: search
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    ]
  };
}

function buildWhere(
  filters: ComprasProveedorListQuery
): Prisma.ProveedorReservaWhereInput {
  const conditions:
    Prisma.ProveedorReservaWhereInput[] = [];

  if (filters.search) {
    conditions.push(
      buildSearchWhere(
        filters.search
      )
    );
  }

  if (filters.estadoOperativo) {
    conditions.push({
      estadoOperativo:
        filters.estadoOperativo
    });
  }

  if (filters.estadoFinanciero) {
    conditions.push({
      estadoFinanciero:
        filters.estadoFinanciero
    });
  }

  if (filters.soloVigentes) {
    conditions.push({
      esVigente: true
    });
  }

  if (filters.soloPendientes) {
    conditions.push({
      estadoFinanciero: {
        in: [
          "SIN_PAGAR",
          "PAGO_PROGRAMADO",
          "PAGO_PARCIAL",
          "FALTA_COP"
        ]
      }
    });
  }

  if (
    filters.fechaCobroDesde ||
    filters.fechaCobroHasta
  ) {
    conditions.push({
      fechaPrevistaCobro: {
        gte:
          filters.fechaCobroDesde
            ? toDateOnly(
                filters.fechaCobroDesde
              )
            : undefined,

        lte:
          filters.fechaCobroHasta
            ? toDateOnly(
                filters.fechaCobroHasta
              )
            : undefined
      }
    });
  }

  if (
    filters.fechaServicioDesde ||
    filters.fechaServicioHasta
  ) {
    conditions.push({
      items: {
        some: {
          reservaItem: {
            is: {
              fechaServicio: {
                gte:
                  filters.fechaServicioDesde
                    ? toDateOnly(
                        filters.fechaServicioDesde
                      )
                    : undefined,

                lte:
                  filters.fechaServicioHasta
                    ? toDateOnly(
                        filters.fechaServicioHasta
                      )
                    : undefined
              }
            }
          }
        }
      }
    });
  }

  return conditions.length
    ? {
        AND: conditions
      }
    : {};
}

const selectProveedorReservaListItem = {
  id: true,
  codigoInterno: true,
  codigoProveedor: true,
  estadoOperativo: true,
  estadoFinanciero: true,
  esVigente: true,

  fechaReserva: true,
  fechaPrevistaCobro: true,
  fechaLimiteCancelacion: true,

  valorContratado: true,
  monedaCodigo: true,

  proveedor: {
    select: {
      id: true,
      codigo: true,
      nombreComercial: true
    }
  },

  reserva: {
    select: {
      id: true,
      codigoReserva: true,

      cliente: {
        select: {
          id: true,
          nombreCompleto: true
        }
      },

      cotizacionOrigen: {
        select: {
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
    select: {
      esPrincipal: true,

      reservaItem: {
        select: {
          id: true,
          fechaServicio: true,
          tituloSnapshot: true,
          esOpcional: true,

          servicio: {
            select: {
              tipo: {
                select: {
                  nombre: true
                }
              },

              ciudad: {
                select: {
                  nombre: true
                }
              }
            }
          }
        }
      }
    },

    orderBy: [
      {
        esPrincipal: "desc" as const
      },
      {
        id: "asc" as const
      }
    ]
  },

  pagos: {
    select: {
      tipo: true,
      estado: true,
      valorMonedaOriginal: true
    }
  }
} satisfies Prisma.ProveedorReservaSelect;

export class ComprasProveedorListRepository {
  async findPage(
    filters: ComprasProveedorListQuery
  ) {
    const where =
      buildWhere(filters);

    const skip =
      (filters.page - 1) *
      filters.pageSize;

    const [items, total] =
      await prisma.$transaction([
        prisma.proveedorReserva.findMany({
          where,

          select:
            selectProveedorReservaListItem,

          orderBy: [
            {
              fechaPrevistaCobro: {
                sort: "asc",
                nulls: "last"
              }
            },
            {
              fechaReserva: "desc"
            },
            {
              id: "desc"
            }
          ],

          skip,
          take:
            filters.pageSize
        }),

        prisma.proveedorReserva.count({
          where
        })
      ]);

    return {
      items,
      total
    };
  }
}

export const comprasProveedorListRepository =
  new ComprasProveedorListRepository();
