/* erp-tour-operator/backend/src/modules/expediente/confirmacion-builder/repository/confirmacion-builder.repository.ts */

import {
  ConfirmacionComercialEstado,
  CotizacionVersionEstado,
  ExpedienteEstado,
  ReservaEstado
} from "@prisma/client";

import { prisma } from "@/core/db/prisma";
import type {
  ConfirmacionBuilderCreateInput,
  ConfirmacionPassengerInput
} from "@/modules/expediente/confirmacion-builder/dto/confirmacion-builder.dto";
import { includeConfirmacionBuilderDetail } from "@/modules/expediente/confirmacion-builder/repository/confirmacion-builder.include";

function buildReservaCode(cotizacionId: number) {
  return `RES-${String(cotizacionId).padStart(6, "0")}`;
}

function toDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export class ConfirmacionBuilderRepository {
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

  async createFromAcceptedCotizacion(
    versionId: number,
    data: ConfirmacionBuilderCreateInput,
    userId?: number | null
  ) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.reserva.findUnique({
        where: {
          idCotizacionOrigen: versionId
        },
        include: includeConfirmacionBuilderDetail
      });

      if (existing) {
        return existing;
      }

      const cotizacion = await tx.cotizacion.findUnique({
        where: {
          id: versionId
        },
        include: {
          expediente: true,
          columnas: {
            orderBy: {
              orden: "asc"
            }
          },
          items: {
            include: {
              servicio: true,
              precios: true,
              hotelesPrevistos: true
            },
            orderBy: [
              {
                fechaServicio: "asc"
              },
              {
                ordenDia: "asc"
              }
            ]
          }
        }
      });

      if (!cotizacion) {
        return null;
      }

      if (cotizacion.estadoVersion !== CotizacionVersionEstado.ACEPTADA) {
        return "COTIZACION_NOT_ACCEPTED" as const;
      }

      const selectedColumns = cotizacion.columnas.filter(
        (column) => column.activo && data.selectedColumnIds.includes(column.id)
      );

      if (selectedColumns.length !== data.selectedColumnIds.length) {
        return "INVALID_COLUMNS" as const;
      }

      const reserva = await tx.reserva.create({
        data: {
          idCotizacionOrigen: cotizacion.id,
          idCliente: cotizacion.idCliente,
          idClienteAgente: cotizacion.idClienteAgente,
          codigoReserva: buildReservaCode(cotizacion.id),
          estado: ReservaEstado.PENDIENTE,
          confirmacionComercialEstado: ConfirmacionComercialEstado.NO_CONFIRMADA,
          fechaViajePrincipal: cotizacion.fechaViajePrincipal,
          idDestinoPrincipal: cotizacion.idDestinoPrincipal,
          categoriaViaje: cotizacion.categoriaViaje,
          monedaCodigo: cotizacion.monedaCodigo,
          totalPasajeros: cotizacion.totalPasajeros,
          adultos65: cotizacion.adultos65,
          adultos1964: cotizacion.adultos1964,
          jovenes1218: cotizacion.jovenes1218,
          ninos311: cotizacion.ninos311,
          infantes02: cotizacion.infantes02,
          comisionPctSnapshot: cotizacion.comisionPctAplicada,
          nota: cotizacion.nota,
          fechaConversion: new Date(),
          createdBy: userId ?? null,
          updatedBy: userId ?? null
        }
      });

      const selectedColumnIdMap = new Map<number, number>();

      for (const column of selectedColumns) {
        const selectedColumn = await tx.reservaColumnaSeleccionada.create({
          data: {
            idReserva: reserva.id,
            idCotizacionColumnaOrigen: column.id,
            grupoSnapshot: column.grupo,
            nombreSnapshot: column.nombre,
            tipoSnapshot: column.tipo,
            unidadSnapshot: column.unidad,
            multiplicadorSnapshot: column.multiplicador,
            precioMostradoFormulaSnapshot: column.precioMostradoFormula,
            precioMostradoValorSnapshot: column.precioMostradoValor,
            orden: column.orden
          }
        });

        selectedColumnIdMap.set(column.id, selectedColumn.id);
      }

      for (const item of cotizacion.items) {
        const firstSelectedPrice = item.precios.find((price) =>
          data.selectedColumnIds.includes(price.idCotizacionColumna)
        );

        const reservaItem = await tx.reservaItem.create({
          data: {
            idReserva: reserva.id,
            idCotizacionItemOrigen: item.id,
            idServicio: item.idServicio,
            fechaServicio: item.fechaServicio,
            ordenDia: item.ordenDia,
            esOpcional: item.esOpcional,
            tituloSnapshot: item.tituloOverride,
            idiomaSnapshot: item.idiomaOverride,
            claseSnapshot: item.claseOverride,
            notaLineaSnapshot: item.notaLinea,
            costoCotizado: firstSelectedPrice?.precioNeto ?? null,
            costoFinal: firstSelectedPrice?.precioNeto ?? null,
            monedaCodigo: item.precioMonedaCodigo,
            estadoItem: item.esOpcional ? "NO_APLICA" : "PENDIENTE"
          }
        });

        for (const column of selectedColumns) {
          const selectedColumnId = selectedColumnIdMap.get(column.id);

          if (!selectedColumnId) {
            continue;
          }

          const price = item.precios.find(
            (currentPrice) => currentPrice.idCotizacionColumna === column.id
          );

          await tx.reservaItemPrecioSeleccionado.create({
            data: {
              idReservaItem: reservaItem.id,
              idReservaColumnaSeleccionada: selectedColumnId,
              precioCotizado: price?.precioNeto ?? null,
              precioConfirmado: price?.precioNeto ?? null,
              monedaCodigo: price?.monedaCodigo ?? cotizacion.monedaCodigo
            }
          });

          const hotel = item.hotelesPrevistos.find(
            (currentHotel) => currentHotel.idCotizacionColumna === column.id
          );

          if (hotel?.textoHotel) {
            await tx.reservaItemHotelPrevistoSeleccionado.create({
              data: {
                idReservaItem: reservaItem.id,
                idReservaColumnaSeleccionada: selectedColumnId,
                textoHotel: hotel.textoHotel
              }
            });
          }
        }
      }

      await tx.expediente.update({
        where: {
          id: cotizacion.idExpediente
        },
        data: {
          estado: ExpedienteEstado.CONFIRMACION,
          updatedBy: userId ?? null
        }
      });

      await tx.cotizacion.update({
        where: {
          id: cotizacion.id
        },
        data: {
          fechaConvertidaReserva: new Date(),
          updatedBy: userId ?? null
        }
      });

      return tx.reserva.findUniqueOrThrow({
        where: {
          id: reserva.id
        },
        include: includeConfirmacionBuilderDetail
      });
    });
  }

  async createPassenger(reservaId: number, data: ConfirmacionPassengerInput, userId?: number | null) {
    const reserva = await prisma.reserva.findUnique({
      where: {
        id: reservaId
      },
      select: {
        id: true
      }
    });

    if (!reserva) {
      return null;
    }

    const latestPassenger = await prisma.reservaPasajero.findFirst({
      where: {
        idReserva: reservaId
      },
      orderBy: {
        orden: "desc"
      },
      select: {
        orden: true
      }
    });

    return prisma.reservaPasajero.create({
      data: {
        idReserva: reservaId,
        orden: (latestPassenger?.orden ?? 0) + 1,
        nombre: data.nombre,
        apellidos: data.apellidos,
        fechaNacimiento: toDateOnly(data.fechaNacimiento),
        numeroPasaporte: data.numeroPasaporte,
        fechaExpedicionPasaporte: toDateOnly(data.fechaExpedicionPasaporte),
        fechaVencimientoPasaporte: toDateOnly(data.fechaVencimientoPasaporte),
        nacionalidad: data.nacionalidad,
        createdBy: userId ?? null,
        updatedBy: userId ?? null
      }
    });
  }

  async updatePassenger(passengerId: number, data: ConfirmacionPassengerInput, userId?: number | null) {
    const passenger = await prisma.reservaPasajero.findUnique({
      where: {
        id: passengerId
      },
      select: {
        id: true
      }
    });

    if (!passenger) {
      return null;
    }

    return prisma.reservaPasajero.update({
      where: {
        id: passengerId
      },
      data: {
        nombre: data.nombre,
        apellidos: data.apellidos,
        fechaNacimiento: toDateOnly(data.fechaNacimiento),
        numeroPasaporte: data.numeroPasaporte,
        fechaExpedicionPasaporte: toDateOnly(data.fechaExpedicionPasaporte),
        fechaVencimientoPasaporte: toDateOnly(data.fechaVencimientoPasaporte),
        nacionalidad: data.nacionalidad,
        updatedBy: userId ?? null
      }
    });
  }

  async deletePassenger(passengerId: number) {
    const passenger = await prisma.reservaPasajero.findUnique({
      where: {
        id: passengerId
      },
      select: {
        id: true
      }
    });

    if (!passenger) {
      return null;
    }

    await prisma.reservaPasajero.delete({
      where: {
        id: passengerId
      }
    });

    return {
      id: passengerId
    };
  }

  deleteByVersionId(versionId: number, userId?: number | null) {
    return prisma.$transaction(async (tx) => {
      const reserva = await tx.reserva.findUnique({
        where: {
          idCotizacionOrigen: versionId
        },
        include: {
          cotizacionOrigen: {
            select: {
              id: true,
              idExpediente: true
            }
          },
          items: {
            select: {
              id: true
            }
          }
        }
      });

      if (!reserva) {
        return null;
      }

      const reservaItemIds = reserva.items.map((item) => item.id);

      if (reservaItemIds.length > 0) {
        await tx.reservaItemHotelPrevistoSeleccionado.deleteMany({
          where: {
            idReservaItem: {
              in: reservaItemIds
            }
          }
        });

        await tx.reservaItemPrecioSeleccionado.deleteMany({
          where: {
            idReservaItem: {
              in: reservaItemIds
            }
          }
        });

        await tx.reservaItem.deleteMany({
          where: {
            idReserva: reserva.id
          }
        });
      }

      await tx.reservaPasajero.deleteMany({
        where: {
          idReserva: reserva.id
        }
      });
      
      await tx.reservaColumnaSeleccionada.deleteMany({
        where: {
          idReserva: reserva.id
        }
      });

      await tx.reserva.delete({
        where: {
          id: reserva.id
        }
      });

      await tx.cotizacion.update({
        where: {
          id: versionId
        },
        data: {
          fechaConvertidaReserva: null,
          updatedBy: userId ?? null
        }
      });

      const remainingReservas = await tx.reserva.count({
        where: {
          cotizacionOrigen: {
            idExpediente: reserva.cotizacionOrigen.idExpediente
          }
        }
      });

      if (remainingReservas === 0) {
        await tx.expediente.update({
          where: {
            id: reserva.cotizacionOrigen.idExpediente
          },
          data: {
            estado: "COTIZACION",
            updatedBy: userId ?? null
          }
        });
      }

      return {
        id: reserva.id,
        idExpediente: reserva.cotizacionOrigen.idExpediente,
        idCotizacionOrigen: versionId
      };
    });
  }

}

export const confirmacionBuilderRepository = new ConfirmacionBuilderRepository();