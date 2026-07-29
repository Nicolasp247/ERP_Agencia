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

      reservasProveedorItems: {
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

          proveedorReserva: {
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
                    fechaCargo: "asc"
                  },
                  {
                    id: "asc"
                  }
                ]
              },

              eventos: {
                orderBy: [
                  {
                    createdAt: "asc"
                  },
                  {
                    id: "asc"
                  }
                ]
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
              }
            }
          }
        },

        orderBy: {
          id: "desc" as const
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