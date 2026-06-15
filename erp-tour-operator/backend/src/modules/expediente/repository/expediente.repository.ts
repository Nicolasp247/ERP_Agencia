/* erp-tour-operator/backend/src/modules/expediente/repository/cotizacion.repository.ts */

import { CotizacionVersionEstado, ExpedienteEstado } from "@prisma/client";

import { prisma as prismaClient } from "@/core/db/prisma";
import type { ExpedienteFilters, ExpedienteInput } from "@/modules/expediente/dto/expediente.dto";

function toDateOnly(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  return new Date(`${value}T00:00:00.000Z`);
}

function getYearMonthCode(value: Date | string) {
  const date = toDateOnly(value)!;
  const year = String(date.getUTCFullYear()).slice(-2);
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");

  return `${year}${month}`;
}

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function buildVersionCode(versionNumber: number) {
  let number = versionNumber;
  let code = "";

  while (number > 0) {
    number -= 1;
    code = String.fromCharCode(65 + (number % 26)) + code;
    number = Math.floor(number / 26);
  }

  return code;
}

function buildBaseExpedienteCode(params: {
  fechaViajePrincipal: Date | string;
  agenciaCodigo?: string | null;
  nombreBase: string;
}) {
  const yearMonth = getYearMonthCode(params.fechaViajePrincipal);
  const agencyCode = normalizeName(params.agenciaCodigo || "WT").toUpperCase();
  const nombreBase = normalizeName(params.nombreBase);

  return `${yearMonth} ${agencyCode} ${nombreBase}`;
}

async function buildUniqueExpedienteCode(
  tx: any,
  params: {
    fechaViajePrincipal: Date | string;
    agenciaCodigo?: string | null;
    nombreBase: string;
    excludeId?: number;
  }
) {
  const baseCode = buildBaseExpedienteCode(params);
  let candidate = baseCode;
  let counter = 2;

  while (true) {
    const existing = await tx.expediente.findFirst({
      where: {
        codigo: candidate,
        id: params.excludeId
          ? {
              not: params.excludeId
            }
          : undefined
      },
      select: {
        id: true
      }
    });

    if (!existing) {
      return candidate;
    }

    candidate = `${baseCode}-${counter}`;
    counter += 1;
  }
}

async function resolveAgenciaCodigo(tx: any, idClienteAgente?: number | null) {
  if (!idClienteAgente) {
    return "WT";
  }

  const agente = await tx.clienteAgente.findUnique({
    where: {
      id: idClienteAgente
    },
    select: {
      codigo: true
    }
  });

  return agente?.codigo || "WT";
}

export class ExpedienteRepository {
  list(filters: ExpedienteFilters) {
    return prismaClient.expediente.findMany({
      where: {
        estado: filters.estado as ExpedienteEstado | undefined,
        idCliente: filters.idCliente,
        idClienteAgente: filters.idClienteAgente,
        idDestinoPrincipal: filters.idDestinoPrincipal,
        fechaViajePrincipal: filters.year
          ? {
              gte: new Date(Date.UTC(filters.year, 0, 1)),
              lt: new Date(Date.UTC(filters.year + 1, 0, 1))
            }
          : undefined
      },
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
            razonSocial: true
          }
        },
        destinoPrincipal: true,
        cotizaciones: {
          orderBy: {
            versionNumero: "desc"
          },
          take: 1
        }
      },
      orderBy: {
        codigo: "asc"
      }
    });
  }

  findById(id: number) {
    return prismaClient.expediente.findUnique({
      where: { id },
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
            razonSocial: true
          }
        },
        destinoPrincipal: true,
        cotizaciones: {
          orderBy: {
            versionNumero: "asc"
          }
        }
      }
    });
  }

  createExpedienteWithCotizacionA(data: ExpedienteInput & { createdBy?: number | null }) {
    return prismaClient.$transaction(async (tx) => {
      const nombreBase = normalizeName(data.nombreCotizacion);
      const agenciaCodigo = await resolveAgenciaCodigo(tx, data.idClienteAgente ?? null);

      const codigo = await buildUniqueExpedienteCode(tx, {
        fechaViajePrincipal: data.fechaViajePrincipal,
        agenciaCodigo,
        nombreBase
      });

      const expediente = await tx.expediente.create({
        data: {
          codigo,
          idCliente: data.idCliente,
          idClienteAgente: data.idClienteAgente ?? null,
          nombreExpediente: nombreBase,
          estado: ExpedienteEstado.COTIZACION,
          fechaViajePrincipal: toDateOnly(data.fechaViajePrincipal)!,
          idDestinoPrincipal: data.idDestinoPrincipal ?? null,
          monedaCodigo: data.monedaCodigo,
          adultos65: data.adultos65,
          adultos1964: data.adultos1964,
          jovenes1218: data.jovenes1218,
          ninos311: data.ninos311,
          infantes02: data.infantes02,
          totalPasajeros: data.totalPasajeros,
          observacionesCliente: data.nota ?? null,
          notasInternas: data.notasInternas ?? null,
          createdBy: data.createdBy ?? null,
          updatedBy: data.createdBy ?? null
        }
      });

      await tx.cotizacion.create({
        data: {
          idExpediente: expediente.id,
          versionNumero: 1,
          versionCodigo: "A",
          estadoVersion: "BORRADOR",

          idCliente: data.idCliente,
          idClienteAgente: data.idClienteAgente ?? null,
          nombreCotizacion: `${codigo} - Cotización A`,
          fechaViajePrincipal: toDateOnly(data.fechaViajePrincipal)!,
          idDestinoPrincipal: data.idDestinoPrincipal ?? null,
          categoriaViaje: data.categoriaViaje ?? null,
          monedaCodigo: data.monedaCodigo,
          presupuestoEstimado: data.presupuestoEstimado ?? null,
          presupuestoTipo: data.presupuestoTipo ?? null,
          comisionPctAplicada: data.comisionPctAplicada ?? null,
          margenAplicadoValor: data.margenAplicadoValor ?? null,
          adultos65: data.adultos65,
          adultos1964: data.adultos1964,
          jovenes1218: data.jovenes1218,
          ninos311: data.ninos311,
          infantes02: data.infantes02,
          totalPasajeros: data.totalPasajeros,
          nota: data.nota ?? null,
          createdBy: data.createdBy ?? null,
          updatedBy: data.createdBy ?? null
        }
      });

      return tx.expediente.findUniqueOrThrow({
        where: {
          id: expediente.id
        },
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
              razonSocial: true
            }
          },
          destinoPrincipal: true,
          cotizaciones: {
            orderBy: {
              versionNumero: "asc"
            }
          }
        }
      });
    });
  }

  createItineraryVersion(idExpediente: number, userId?: number | null) {
    return prismaClient.$transaction(async (tx) => {
      const expediente = await tx.expediente.findUnique({
        where: {
          id: idExpediente
        },
        include: {
          cotizaciones: {
            orderBy: {
              versionNumero: "desc"
            },
            take: 1
          }
        }
      });

      if (!expediente) {
        return null;
      }

      const ultimaCotizacion = expediente.cotizaciones[0] ?? null;
      const nextVersionNumber = (ultimaCotizacion?.versionNumero ?? 0) + 1;
      const nextVersionCode = buildVersionCode(nextVersionNumber);

      await tx.cotizacion.create({
        data: {
          idExpediente: expediente.id,
          versionNumero: nextVersionNumber,
          versionCodigo: nextVersionCode,
          estadoVersion: CotizacionVersionEstado.BORRADOR,

          idCliente: expediente.idCliente,
          idClienteAgente: expediente.idClienteAgente ?? null,
          nombreCotizacion: `${expediente.codigo} - Cotización ${nextVersionCode}`,

          fechaViajePrincipal: expediente.fechaViajePrincipal,
          idDestinoPrincipal: expediente.idDestinoPrincipal ?? null,

          categoriaViaje: ultimaCotizacion?.categoriaViaje ?? null,
          monedaCodigo: expediente.monedaCodigo,

          presupuestoEstimado: ultimaCotizacion?.presupuestoEstimado ?? null,
          presupuestoTipo: ultimaCotizacion?.presupuestoTipo ?? null,
          comisionPctAplicada: ultimaCotizacion?.comisionPctAplicada ?? null,
          margenAplicadoValor: ultimaCotizacion?.margenAplicadoValor ?? null,

          adultos65: expediente.adultos65,
          adultos1964: expediente.adultos1964,
          jovenes1218: expediente.jovenes1218,
          ninos311: expediente.ninos311,
          infantes02: expediente.infantes02,
          totalPasajeros: expediente.totalPasajeros,

          nota: expediente.observacionesCliente ?? null,
          createdBy: userId ?? null,
          updatedBy: userId ?? null
        }
      });

      return tx.expediente.findUniqueOrThrow({
        where: {
          id: expediente.id
        },
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
              razonSocial: true
            }
          },
          destinoPrincipal: true,
          cotizaciones: {
            orderBy: {
              versionNumero: "asc"
            }
          }
        }
      });
    });
  }


  duplicateItineraryVersion(versionId: number, userId?: number | null) {
    return prismaClient.$transaction(async (tx) => {
      const original = await tx.cotizacion.findUnique({
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
          comisiones: true,
          items: {
            include: {
              alojamientoDetalle: true,
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

      if (!original) {
        return null;
      }

      const latestVersion = await tx.cotizacion.aggregate({
        where: {
          idExpediente: original.idExpediente
        },
        _max: {
          versionNumero: true
        }
      });

      const nextVersionNumber = (latestVersion._max.versionNumero ?? 0) + 1;
      const nextVersionCode = buildVersionCode(nextVersionNumber);

      const newVersion = await tx.cotizacion.create({
        data: {
          idExpediente: original.idExpediente,
          versionNumero: nextVersionNumber,
          versionCodigo: nextVersionCode,
          estadoVersion: CotizacionVersionEstado.BORRADOR,
          origenCotizacionId: original.id,

          idCliente: original.idCliente,
          idClienteAgente: original.idClienteAgente,
          nombreCotizacion: `${original.expediente.codigo} - Cotización ${nextVersionCode}`,

          estado: original.estado,
          fechaViajePrincipal: original.fechaViajePrincipal,
          idDestinoPrincipal: original.idDestinoPrincipal,

          categoriaViaje: original.categoriaViaje,
          monedaCodigo: original.monedaCodigo,

          presupuestoEstimado: original.presupuestoEstimado,
          presupuestoTipo: original.presupuestoTipo,
          comisionPctAplicada: original.comisionPctAplicada,
          margenAplicadoValor: original.margenAplicadoValor,

          adultos65: original.adultos65,
          adultos1964: original.adultos1964,
          jovenes1218: original.jovenes1218,
          ninos311: original.ninos311,
          infantes02: original.infantes02,
          totalPasajeros: original.totalPasajeros,

          nota: original.nota,

          createdBy: userId ?? null,
          updatedBy: userId ?? null
        }
      });

      const columnIdMap = new Map<number, number>();
      const itemIdMap = new Map<number, number>();

      for (const column of original.columnas) {
        const newColumn = await tx.cotizacionColumna.create({
          data: {
            idCotizacion: newVersion.id,
            grupo: column.grupo,
            nombre: column.nombre,
            tipo: column.tipo,
            unidad: column.unidad,
            multiplicador: column.multiplicador,
            precioMostradoFormula: column.precioMostradoFormula,
            precioMostradoValor: column.precioMostradoValor,
            orden: column.orden,
            activo: column.activo
          }
        });

        columnIdMap.set(column.id, newColumn.id);
      }

      for (const commission of original.comisiones) {
        await tx.cotizacionComision.create({
          data: {
            idCotizacion: newVersion.id,
            tipoComision: commission.tipoComision,
            porcentajeAgente: commission.porcentajeAgente,
            porcentajeWtravel: commission.porcentajeWtravel,
            porcentajeBancario: commission.porcentajeBancario,
            porcentajeTotal: commission.porcentajeTotal,
            factorVenta: commission.factorVenta
          }
        });
      }

      for (const item of original.items) {
        const newItem = await tx.cotizacionItem.create({
          data: {
            idCotizacion: newVersion.id,
            idServicio: item.idServicio,
            fechaServicio: item.fechaServicio,
            ordenDia: item.ordenDia,
            esOpcional: item.esOpcional,

            operadorMostrado: item.operadorMostrado,
            linkOperador: item.linkOperador,
            tituloOverride: item.tituloOverride,
            claseOverride: item.claseOverride,
            idiomaOverride: item.idiomaOverride,
            notaLinea: item.notaLinea,

            precioSugerido: item.precioSugerido,
            precioVenta: item.precioVenta,
            precioMonedaCodigo: item.precioMonedaCodigo,
            precioEditadoManual: item.precioEditadoManual
          }
        });

        itemIdMap.set(item.id, newItem.id);

        if (item.alojamientoDetalle) {
          await tx.cotizacionItemAlojamiento.create({
            data: {
              idCotizacionItem: newItem.id,
              noches: item.alojamientoDetalle.noches,
              habitaciones: item.alojamientoDetalle.habitaciones,
              categoriaHab: item.alojamientoDetalle.categoriaHab,
              regimen: item.alojamientoDetalle.regimen
            }
          });
        }

        for (const price of item.precios) {
          const newColumnId = columnIdMap.get(price.idCotizacionColumna);

          if (!newColumnId) {
            continue;
          }

          await tx.cotizacionItemPrecio.create({
            data: {
              idCotizacionItem: newItem.id,
              idCotizacionColumna: newColumnId,
              precioNeto: price.precioNeto,
              monedaCodigo: price.monedaCodigo,
              precioEditadoManual: price.precioEditadoManual,
              observaciones: price.observaciones
            }
          });
        }

        for (const hotel of item.hotelesPrevistos) {
          const newColumnId = columnIdMap.get(hotel.idCotizacionColumna);

          if (!newColumnId) {
            continue;
          }

          await tx.cotizacionItemHotelPrevisto.create({
            data: {
              idCotizacionItem: newItem.id,
              idCotizacionColumna: newColumnId,
              textoHotel: hotel.textoHotel
            }
          });
        }
      }

      return tx.expediente.findUniqueOrThrow({
        where: {
          id: original.idExpediente
        },
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
              razonSocial: true
            }
          },
          destinoPrincipal: true,
          cotizaciones: {
            orderBy: {
              versionNumero: "asc"
            }
          }
        }
      });
    });
  }

  deleteItineraryVersion(versionId: number) {
    return prismaClient.$transaction(async (tx) => {
      const version = await tx.cotizacion.findUnique({
        where: {
          id: versionId
        },
        select: {
          id: true,
          idExpediente: true
        }
      });

      if (!version) {
        return null;
      }

      const items = await tx.cotizacionItem.findMany({
        where: {
          idCotizacion: versionId
        },
        select: {
          id: true
        }
      });

      const columns = await tx.cotizacionColumna.findMany({
        where: {
          idCotizacion: versionId
        },
        select: {
          id: true
        }
      });

      const itemIds = items.map((item) => item.id);
      const columnIds = columns.map((column) => column.id);

      const hotelWhere: Array<Record<string, unknown>> = [];
      const priceWhere: Array<Record<string, unknown>> = [];

      if (itemIds.length > 0) {
        hotelWhere.push({
          idCotizacionItem: {
            in: itemIds
          }
        });

        priceWhere.push({
          idCotizacionItem: {
            in: itemIds
          }
        });
      }

      if (columnIds.length > 0) {
        hotelWhere.push({
          idCotizacionColumna: {
            in: columnIds
          }
        });

        priceWhere.push({
          idCotizacionColumna: {
            in: columnIds
          }
        });
      }

      if (hotelWhere.length > 0) {
        await tx.cotizacionItemHotelPrevisto.deleteMany({
          where: {
            OR: hotelWhere
          }
        });
      }

      if (priceWhere.length > 0) {
        await tx.cotizacionItemPrecio.deleteMany({
          where: {
            OR: priceWhere
          }
        });
      }

      if (itemIds.length > 0) {
        await tx.cotizacionItemAlojamiento.deleteMany({
          where: {
            idCotizacionItem: {
              in: itemIds
            }
          }
        });
      }

      await tx.cotizacionComision.deleteMany({
        where: {
          idCotizacion: versionId
        }
      });

      await tx.cotizacionItem.deleteMany({
        where: {
          idCotizacion: versionId
        }
      });

      await tx.cotizacionColumna.deleteMany({
        where: {
          idCotizacion: versionId
        }
      });

      await tx.cotizacion.updateMany({
        where: {
          origenCotizacionId: versionId
        },
        data: {
          origenCotizacionId: null
        }
      });

      await tx.cotizacion.delete({
        where: {
          id: versionId
        }
      });

      return tx.expediente.findUniqueOrThrow({
        where: {
          id: version.idExpediente
        },
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
              razonSocial: true
            }
          },
          destinoPrincipal: true,
          cotizaciones: {
            orderBy: {
              versionNumero: "asc"
            }
          }
        }
      });
    });
  }

  updateItineraryVersionStatus(
    versionId: number,
    estado: CotizacionVersionEstado,
    userId?: number | null
  ) {
    return prismaClient.$transaction(async (tx) => {
      const version = await tx.cotizacion.findUnique({
        where: {
          id: versionId
        },
        select: {
          id: true,
          idExpediente: true,
          estadoVersion: true
        }
      });

      if (!version) {
        return null;
      }

      if (estado === CotizacionVersionEstado.ACEPTADA) {
        await tx.cotizacion.updateMany({
          where: {
            idExpediente: version.idExpediente,
            id: {
              not: versionId
            },
            estadoVersion: CotizacionVersionEstado.ACEPTADA
          },
          data: {
            estadoVersion: CotizacionVersionEstado.ENVIADA,
            updatedBy: userId ?? null
          }
        });
      }

      await tx.cotizacion.update({
        where: {
          id: versionId
        },
        data: {
          estadoVersion: estado,
          updatedBy: userId ?? null
        }
      });

      return tx.expediente.findUniqueOrThrow({
        where: {
          id: version.idExpediente
        },
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
              razonSocial: true
            }
          },
          destinoPrincipal: true,
          cotizaciones: {
            orderBy: {
              versionNumero: "asc"
            }
          }
        }
      });
    });
  }

  updateExpediente(id: number, data: ExpedienteInput & { updatedBy?: number | null }) {
    return prismaClient.$transaction(async (tx) => {
      const nombreBase = normalizeName(data.nombreCotizacion);
      const agenciaCodigo = await resolveAgenciaCodigo(tx, data.idClienteAgente ?? null);

      const codigo = await buildUniqueExpedienteCode(tx, {
        fechaViajePrincipal: data.fechaViajePrincipal,
        agenciaCodigo,
        nombreBase,
        excludeId: id
      });
      await tx.cotizacion.update({
        where: { id },
        data: {
          idCliente: data.idCliente,
          idClienteAgente: data.idClienteAgente ?? null,
          codigo,
          nombreExpediente: nombreBase,
          fechaViajePrincipal: toDateOnly(data.fechaViajePrincipal)!,
          idDestinoPrincipal: data.idDestinoPrincipal ?? null,
          monedaCodigo: data.monedaCodigo,
          adultos65: data.adultos65,
          adultos1964: data.adultos1964,
          jovenes1218: data.jovenes1218,
          ninos311: data.ninos311,
          infantes02: data.infantes02,
          totalPasajeros: data.totalPasajeros,
          observacionesCliente: data.nota ?? null,
          notasInternas: data.notasInternas ?? null,
          updatedBy: data.updatedBy ?? null
        }
      });

      await tx.cotizacion.updateMany({
        where: {
          idExpediente: id,
          versionNumero: 1
        },
        data: {
          idCliente: data.idCliente,
          idClienteAgente: data.idClienteAgente ?? null,
          nombreCotizacion: `${codigo} - Cotización A`,
          fechaViajePrincipal: toDateOnly(data.fechaViajePrincipal)!,
          idDestinoPrincipal: data.idDestinoPrincipal ?? null,
          categoriaViaje: data.categoriaViaje ?? null,
          monedaCodigo: data.monedaCodigo,
          presupuestoEstimado: data.presupuestoEstimado ?? null,
          presupuestoTipo: data.presupuestoTipo ?? null,
          comisionPctAplicada: data.comisionPctAplicada ?? null,
          margenAplicadoValor: data.margenAplicadoValor ?? null,
          adultos65: data.adultos65,
          adultos1964: data.adultos1964,
          jovenes1218: data.jovenes1218,
          ninos311: data.ninos311,
          infantes02: data.infantes02,
          totalPasajeros: data.totalPasajeros,
          nota: data.nota ?? null,
          updatedBy: data.updatedBy ?? null
        }
      });

      return tx.expediente.findUniqueOrThrow({
        where: { id },
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
              razonSocial: true
            }
          },
          destinoPrincipal: true,
          cotizaciones: {
            orderBy: {
              versionNumero: "asc"
            }
          }
        }
      });
    });
  }

  markDiscarded(id: number, userId?: number | null) {
    return prismaClient.expediente.update({
      where: { id },
      data: {
        estado: ExpedienteEstado.DESCARTADO,
        updatedBy: userId ?? null
      }
    });
  }
}

export const expedienteRepository = new ExpedienteRepository();