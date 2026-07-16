/* erp-tour-operator/backend/src/modules/expediente/confirmacion-builder/repository/confirmacion-builder.include.ts */

import { Prisma } from "@prisma/client";

export const includeConfirmacionBuilderDetail = {
  cotizacionOrigen: {
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
      }
    }
  },
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
  destinoPrincipal: true,
  columnasSeleccionadas: {
    orderBy: {
      orden: "asc" as const
    }
  },
  pasajeros: {
    orderBy: [
      {
        orden: "asc" as const
      },
      {
        id: "asc" as const
      }
    ]
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
      },
      
      cotizacionItemOrigen: {
        include: {
          alojamientoDetalle: true
        }
      },

      compraProveedorItem: {
        include: {
          compraProveedor: {
            include: {
              proveedor: {
                select: {
                  id: true,
                  codigo: true,
                  nombreComercial: true
                }
              },

              pagos: {
                orderBy: [
                  {
                    fechaPago: "asc"
                  },
                  {
                    id: "asc"
                  }
                ]
              }
            }
          }
        }
      },

      preciosSeleccionados: true,
      hotelesPrevistosSeleccionados: true

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
} satisfies Prisma.ReservaInclude;