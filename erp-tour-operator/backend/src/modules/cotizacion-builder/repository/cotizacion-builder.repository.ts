/* erp-tour-operator/backend/src/modules/cotizacion-builder/repository/cotizacion-builder.repository.ts */

import {
  CotizacionColumnaTipo,
  CotizacionColumnaUnidad,
  Prisma
} from "@prisma/client";

import { prisma } from "@/core/db/prisma";
import type {
  CotizacionBuilderColumnInput,
  CotizacionBuilderItemInput,
  CotizacionBuilderMoveItemInput,
  CotizacionBuilderNoteInput,
  CotizacionBuilderPriceInput
} from "@/modules/cotizacion-builder/dto/cotizacion-builder.dto";

const DEFAULT_COLUMNS = [
  {
    grupo: "Turista (3*)",
    nombre: "Doble",
    tipo: CotizacionColumnaTipo.TERRESTRE,
    unidad: CotizacionColumnaUnidad.POR_PERSONA,
    multiplicador: 2,
    orden: 1
  },
  {
    grupo: "Lujo (5*)",
    nombre: "Doble",
    tipo: CotizacionColumnaTipo.TERRESTRE,
    unidad: CotizacionColumnaUnidad.POR_PERSONA,
    multiplicador: 2,
    orden: 2
  },
  {
    grupo: "Económica",
    nombre: "Adulto",
    tipo: CotizacionColumnaTipo.TRANSPORTE,
    unidad: CotizacionColumnaUnidad.POR_PERSONA,
    multiplicador: 1,
    orden: 3
  },
  {
    grupo: "General",
    nombre: "Adulto",
    tipo: CotizacionColumnaTipo.OPCIONALES,
    unidad: CotizacionColumnaUnidad.POR_PERSONA,
    multiplicador: 1,
    orden: 4
  }
];

function toMysqlDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function normalizeText(value: string | null | undefined) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isAlojamientoTipo(tipo: { nombre?: string | null; codigo?: string | null }) {
  const nombre = normalizeText(tipo.nombre);
  const codigo = normalizeText(tipo.codigo);

  return nombre === "alojamiento" || codigo === "alojamiento";
}

function mapHotelCategoryFromColumn(grupo: string) {
  const value = normalizeText(grupo);

  if (value.includes("turista superior") || value.includes("3+")) return "H3_SUPERIOR";
  if (value.includes("turista") || value.includes("3*")) return "H3_ECONOMICO";

  if (value.includes("primera superior") || value.includes("4+")) return "H4_SUPERIOR";
  if (value.includes("primera") || value.includes("4*")) return "H4_ECONOMICO";

  if (value.includes("lujo superior") || value.includes("5+")) return "H5_SUPERIOR";
  if (value.includes("lujo") || value.includes("5*")) return "H5_ECONOMICO";

  if (value.includes("super lujo") || value.includes("6*")) return "LUJO_SUPERIOR";

  return null;
}

function mapRoomTypeFromColumn(nombre: string) {
  const value = normalizeText(nombre);

  if (value.includes("sencilla") || value.includes("single")) return "SGL";
  if (value.includes("doble")) return "DBL";
  if (value.includes("triple")) return "TPL";
  if (value.includes("cuadruple") || value.includes("cuadruple")) return "CPL";

  return null;
}

function getAccommodationRoomCategory(alojamiento: any) {
  if (!alojamiento?.categoriaHab || alojamiento.categoriaHab === "OTRO") {
    return "ESTANDAR";
  }

  return alojamiento.categoriaHab;
}

function getAccommodationRegimen(alojamiento: any) {
  if (alojamiento?.regimen && alojamiento.regimen !== "OTRO") {
    return alojamiento.regimen;
  }

  if (alojamiento?.regimen === "OTRO" && alojamiento.regimenOtro) {
    return alojamiento.regimenOtro;
  }

  if (alojamiento?.desayuno) {
    return "ALOJAMIENTO_DESAYUNO";
  }

  return "SOLO_ALOJAMIENTO";
}

function calculateAccommodationPrice({
  precioUsd,
  noches,
  habitaciones,
  unidad,
  multiplicador
}: {
  precioUsd: Prisma.Decimal;
  noches: number;
  habitaciones: number;
  unidad: CotizacionColumnaUnidad;
  multiplicador: number;
}) {
  const base = Number(precioUsd);
  const safeNoches = Math.max(1, noches);
  const safeHabitaciones = Math.max(1, habitaciones);
  const safeMultiplicador = Math.max(1, multiplicador);

  if (unidad === CotizacionColumnaUnidad.POR_PERSONA || unidad === CotizacionColumnaUnidad.POR_NINO) {
    const totalPersonas = safeMultiplicador * safeHabitaciones;
    return new Prisma.Decimal((base * safeNoches * safeHabitaciones) / totalPersonas);
  }

  if (unidad === CotizacionColumnaUnidad.POR_HABITACION) {
    return new Prisma.Decimal(base * safeNoches);
  }

  return new Prisma.Decimal(base * safeNoches * safeHabitaciones);
}

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
        alojamientoDetalle: true
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
        multiplicador: column.multiplicador,
        orden: column.orden,
        activo: true
      }))
    });

    await this.syncPriceMatrix(versionId);
  }

  async createColumn(versionId: number, data: CotizacionBuilderColumnInput) {
    return prisma.$transaction(async (tx) => {
      const version = await tx.cotizacion.findUnique({
        where: {
          id: versionId
        },
        select: {
          id: true
        }
      });

      if (!version) {
        return null;
      }

      const maxOrder = await tx.cotizacionColumna.aggregate({
        where: {
          idCotizacion: versionId,
          activo: true
        },
        _max: {
          orden: true
        }
      });

      await tx.cotizacionColumna.create({
        data: {
          idCotizacion: versionId,
          grupo: data.grupo,
          nombre: data.nombre,
          tipo: data.tipo,
          unidad: data.unidad,
          multiplicador: data.multiplicador,
          orden: data.orden ?? Number(maxOrder._max.orden ?? 0) + 1,
          activo: true
        }
      });

      await this.syncPriceMatrixWithClient(tx, versionId);

      return tx.cotizacion.findUnique({
        where: {
          id: versionId
        },
        include: this.includeBuilderDetail
      });
    });
  }

  async updateColumn(columnId: number, data: CotizacionBuilderColumnInput) {
    return prisma.$transaction(async (tx) => {
      const currentColumn = await tx.cotizacionColumna.findUnique({
        where: {
          id: columnId
        },
        select: {
          id: true,
          idCotizacion: true
        }
      });

      if (!currentColumn) {
        return null;
      }

      await tx.cotizacionColumna.update({
        where: {
          id: columnId
        },
        data: {
          grupo: data.grupo,
          nombre: data.nombre,
          tipo: data.tipo,
          unidad: data.unidad,
          multiplicador: data.multiplicador,
          orden: data.orden ?? undefined,
          activo: true
        }
      });

      await this.syncPriceMatrixWithClient(tx, currentColumn.idCotizacion);

      return tx.cotizacion.findUnique({
        where: {
          id: currentColumn.idCotizacion
        },
        include: this.includeBuilderDetail
      });
    });
  }

  async deleteColumn(columnId: number) {
    return prisma.$transaction(async (tx) => {
      const currentColumn = await tx.cotizacionColumna.findUnique({
        where: {
          id: columnId
        },
        select: {
          id: true,
          idCotizacion: true
        }
      });

      if (!currentColumn) {
        return null;
      }

      await tx.cotizacionColumna.update({
        where: {
          id: columnId
        },
        data: {
          activo: false
        }
      });

      await this.syncPriceMatrixWithClient(tx, currentColumn.idCotizacion);

      return tx.cotizacion.findUnique({
        where: {
          id: currentColumn.idCotizacion
        },
        include: this.includeBuilderDetail
      });
    });
  }

  async createItem(versionId: number, data: CotizacionBuilderItemInput) {
    return prisma.$transaction(async (tx) => {
      const version = await tx.cotizacion.findUnique({
        where: {
          id: versionId
        },
        select: {
          id: true
        }
      });

      if (!version) {
        return null;
      }

      const servicio = await tx.servicio.findUnique({
        where: {
          id: data.idServicio
        },
        include: {
          proveedor: {
            select: {
              codigo: true,
              nombreComercial: true
            }
          },
          tipo: {
            select: {
              nombre: true,
              codigo: true
            }
          },
          alojamiento: true
        }
      });

      if (!servicio || !servicio.activo) {
        return "SERVICIO_NOT_FOUND" as const;
      }

      const maxOrder = await tx.cotizacionItem.aggregate({
        where: {
          idCotizacion: versionId
        },
        _max: {
          ordenDia: true
        }
      });

      const createdItem = await tx.cotizacionItem.create({
        data: {
          idCotizacion: versionId,
          idServicio: data.idServicio,
          fechaServicio: toMysqlDate(data.fechaServicio),
          ordenDia: data.ordenDia ?? Number(maxOrder._max.ordenDia ?? 0) + 1,
          esOpcional: data.esOpcional,
          operadorMostrado: servicio.proveedor?.codigo ?? servicio.proveedor?.nombreComercial ?? null,
          linkOperador: servicio.linkReserva ?? null,
          notaLinea: data.notaLinea?.trim() || null,
          precioMonedaCodigo: "USD"
        }
      });

      if (isAlojamientoTipo(servicio.tipo)) {
        await tx.cotizacionItemAlojamiento.create({
          data: {
            idCotizacionItem: createdItem.id,
            noches: data.alojamiento?.noches ?? 1,
            habitaciones: data.alojamiento?.habitaciones ?? 1,
            categoriaHab: data.alojamiento?.categoriaHab ?? "ESTANDAR",
            regimen: data.alojamiento?.regimen ?? "ALOJAMIENTO_DESAYUNO"
          }
        });
      }
      
      const tipoServicio = servicio.tipo.nombre.trim().toLowerCase();
      const tipoServicioCodigo = servicio.tipo.codigo?.trim().toLowerCase() ?? "";

      const isAlojamiento =
        tipoServicio === "alojamiento" || tipoServicioCodigo === "alojamiento";

      if (isAlojamiento) {
        await tx.cotizacionItemAlojamiento.upsert({
          where: {
            idCotizacionItem: createdItem.id
          },
          create: {
            idCotizacionItem: createdItem.id,
            noches: data.alojamiento?.noches ?? 1,
            habitaciones: data.alojamiento?.habitaciones ?? 1,
            categoriaHab: data.alojamiento?.categoriaHab ?? "ESTANDAR",
            regimen: data.alojamiento?.regimen ?? "ALOJAMIENTO_DESAYUNO"
          },
          update: {
            noches: data.alojamiento?.noches ?? 1,
            habitaciones: data.alojamiento?.habitaciones ?? 1,
            categoriaHab: data.alojamiento?.categoriaHab ?? "ESTANDAR",
            regimen: data.alojamiento?.regimen ?? "ALOJAMIENTO_DESAYUNO"
          }
        });
      }

      await this.syncPriceMatrixWithClient(tx, versionId);

      if (data.idCotizacionColumnaManual && !data.esOpcional) {
        const manualColumn = await tx.cotizacionColumna.findFirst({
          where: {
            id: data.idCotizacionColumnaManual,
            idCotizacion: versionId,
            tipo: CotizacionColumnaTipo.OTRO,
            activo: true
          },
          select: {
            id: true
          }
        });

        if (manualColumn) {
          const tarifa = await tx.servicioTarifa.findFirst({
            where: {
              idServicio: data.idServicio,
              activo: true,
              fechaDesde: {
                lte: createdItem.fechaServicio
              },
              fechaHasta: {
                gte: createdItem.fechaServicio
              }
            },
            orderBy: [
              {
                fechaDesde: "desc"
              },
              {
                id: "desc"
              }
            ],
            select: {
              precioNeto: true,
              monedaCodigo: true
            }
          });

          await tx.cotizacionItemPrecio.create({
            data: {
              idCotizacionItem: createdItem.id,
              idCotizacionColumna: manualColumn.id,
              precioNeto: tarifa?.precioNeto ?? null,
              monedaCodigo: tarifa?.monedaCodigo ?? "USD",
              precioEditadoManual: false
            }
          });
        }
      }

      return tx.cotizacion.findUnique({
        where: {
          id: versionId
        },
        include: this.includeBuilderDetail
      });
    });
  }

  async deleteItem(itemId: number) {
    return prisma.$transaction(async (tx) => {
      const currentItem = await tx.cotizacionItem.findUnique({
        where: {
          id: itemId
        },
        select: {
          id: true,
          idCotizacion: true
        }
      });

      if (!currentItem) {
        return null;
      }

      await tx.cotizacionItemPrecio.deleteMany({
        where: {
          idCotizacionItem: itemId
        }
      });

      await tx.cotizacionItem.delete({
        where: {
          id: itemId
        }
      });

      return tx.cotizacion.findUnique({
        where: {
          id: currentItem.idCotizacion
        },
        include: this.includeBuilderDetail
      });
    });
  }

  async updateItemPrices(itemId: number, data: CotizacionBuilderPriceInput) {
    return prisma.$transaction(async (tx) => {
      const currentItem = await tx.cotizacionItem.findUnique({
        where: {
          id: itemId
        },
        select: {
          id: true,
          idCotizacion: true
        }
      });

      if (!currentItem) {
        return null;
      }

      const columnIds = data.prices.map((price) => price.columnId);

      const validColumns = await tx.cotizacionColumna.findMany({
        where: {
          id: {
            in: columnIds
          },
          idCotizacion: currentItem.idCotizacion,
          activo: true
        },
        select: {
          id: true
        }
      });

      const validColumnIds = new Set(validColumns.map((column) => column.id));

      for (const price of data.prices) {
        if (!validColumnIds.has(price.columnId)) {
          continue;
        }

        const existingPrice = await tx.cotizacionItemPrecio.findFirst({
          where: {
            idCotizacionItem: itemId,
            idCotizacionColumna: price.columnId
          },
          select: {
            id: true
          }
        });

        const precioNeto =
          price.precioNeto === null ? null : new Prisma.Decimal(price.precioNeto);

        if (existingPrice) {
          await tx.cotizacionItemPrecio.update({
            where: {
              id: existingPrice.id
            },
            data: {
              precioNeto,
              monedaCodigo: "USD",
              precioEditadoManual: true
            }
          });

          continue;
        }

        await tx.cotizacionItemPrecio.create({
          data: {
            idCotizacionItem: itemId,
            idCotizacionColumna: price.columnId,
            precioNeto,
            monedaCodigo: "USD",
            precioEditadoManual: true
          }
        });
      }

      await tx.cotizacionItem.update({
        where: {
          id: itemId
        },
        data: {
          precioEditadoManual: true
        }
      });

      return tx.cotizacion.findUnique({
        where: {
          id: currentItem.idCotizacion
        },
        include: this.includeBuilderDetail
      });
    });
  }

  async updateItemNotes(itemId: number, data: CotizacionBuilderNoteInput) {
    return prisma.$transaction(async (tx) => {
      const currentItem = await tx.cotizacionItem.findUnique({
        where: {
          id: itemId
        },
        select: {
          id: true,
          idCotizacion: true
        }
      });

      if (!currentItem) {
        return null;
      }

      await tx.cotizacionItem.update({
        where: {
          id: itemId
        },
        data: {
          notaLinea: data.notaLinea?.trim() || null
        }
      });

      return tx.cotizacion.findUnique({
        where: {
          id: currentItem.idCotizacion
        },
        include: this.includeBuilderDetail
      });
    });
  }

  async moveItem(itemId: number, data: CotizacionBuilderMoveItemInput) {
    return prisma.$transaction(async (tx) => {
      const currentItem = await tx.cotizacionItem.findUnique({
        where: {
          id: itemId
        },
        select: {
          id: true,
          idCotizacion: true,
          fechaServicio: true,
          ordenDia: true
        }
      });

      if (!currentItem) {
        return null;
      }

      const itemsSameDate = await tx.cotizacionItem.findMany({
        where: {
          idCotizacion: currentItem.idCotizacion,
          fechaServicio: currentItem.fechaServicio
        },
        orderBy: [
          {
            ordenDia: "asc"
          },
          {
            id: "asc"
          }
        ],
        select: {
          id: true,
          ordenDia: true
        }
      });

      const currentIndex = itemsSameDate.findIndex((item) => item.id === itemId);

      if (currentIndex === -1) {
        return null;
      }

      if (data.direction === "UP") {
        const previousItemSameDate = itemsSameDate[currentIndex - 1];

        if (previousItemSameDate) {
          await tx.cotizacionItem.update({
            where: {
              id: currentItem.id
            },
            data: {
              ordenDia: previousItemSameDate.ordenDia
            }
          });

          await tx.cotizacionItem.update({
            where: {
              id: previousItemSameDate.id
            },
            data: {
              ordenDia: currentItem.ordenDia
            }
          });

          await this.normalizeItemOrderByDate(tx, currentItem.idCotizacion, currentItem.fechaServicio);
        } else {
          const previousDate = this.addCalendarDays(currentItem.fechaServicio, -1);

          const maxOrderInPreviousDate = await tx.cotizacionItem.aggregate({
            where: {
              idCotizacion: currentItem.idCotizacion,
              fechaServicio: previousDate
            },
            _max: {
              ordenDia: true
            }
          });

          await tx.cotizacionItem.update({
            where: {
              id: currentItem.id
            },
            data: {
              fechaServicio: previousDate,
              ordenDia: Number(maxOrderInPreviousDate._max.ordenDia ?? 0) + 1
            }
          });

          await this.normalizeItemOrderByDate(tx, currentItem.idCotizacion, currentItem.fechaServicio);
          await this.normalizeItemOrderByDate(tx, currentItem.idCotizacion, previousDate);
        }
      }

      if (data.direction === "DOWN") {
        const nextItemSameDate = itemsSameDate[currentIndex + 1];

        if (nextItemSameDate) {
          await tx.cotizacionItem.update({
            where: {
              id: currentItem.id
            },
            data: {
              ordenDia: nextItemSameDate.ordenDia
            }
          });

          await tx.cotizacionItem.update({
            where: {
              id: nextItemSameDate.id
            },
            data: {
              ordenDia: currentItem.ordenDia
            }
          });

          await this.normalizeItemOrderByDate(tx, currentItem.idCotizacion, currentItem.fechaServicio);
        } else {
          const nextDate = this.addCalendarDays(currentItem.fechaServicio, 1);

          const maxOrderInNextDate = await tx.cotizacionItem.aggregate({
            where: {
              idCotizacion: currentItem.idCotizacion,
              fechaServicio: nextDate
            },
            _max: {
              ordenDia: true
            }
          });

          await tx.cotizacionItem.update({
            where: {
              id: currentItem.id
            },
            data: {
              fechaServicio: nextDate,
              ordenDia: Number(maxOrderInNextDate._max.ordenDia ?? 0) + 1
            }
          });

          await this.normalizeItemOrderByDate(tx, currentItem.idCotizacion, currentItem.fechaServicio);
          await this.normalizeItemOrderByDate(tx, currentItem.idCotizacion, nextDate);
        }
      }

      return tx.cotizacion.findUnique({
        where: {
          id: currentItem.idCotizacion
        },
        include: this.includeBuilderDetail
      });
    });
  }

  async syncPriceMatrix(versionId: number) {
    await prisma.$transaction(async (tx) => {
      await this.syncPriceMatrixWithClient(tx, versionId);
    });
  }

  private addCalendarDays(date: Date, days: number) {
    const nextDate = new Date(date);
    nextDate.setUTCDate(nextDate.getUTCDate() + days);
    nextDate.setUTCHours(0, 0, 0, 0);

    return nextDate;
  }

  private async normalizeItemOrderByDate(
    tx: Prisma.TransactionClient,
    versionId: number,
    fechaServicio: Date
  ) {
    const items = await tx.cotizacionItem.findMany({
      where: {
        idCotizacion: versionId,
        fechaServicio
      },
      orderBy: [
        {
          ordenDia: "asc"
        },
        {
          id: "asc"
        }
      ],
      select: {
        id: true
      }
    });

    await Promise.all(
      items.map((item, index) =>
        tx.cotizacionItem.update({
          where: {
            id: item.id
          },
          data: {
            ordenDia: index + 1
          }
        })
      )
    );
  }

  private async syncPriceMatrixWithClient(
    tx: Prisma.TransactionClient,
    versionId: number
  ) {
    const items = await tx.cotizacionItem.findMany({
      where: {
        idCotizacion: versionId
      },
      select: {
        id: true,
        idServicio: true,
        fechaServicio: true,
        esOpcional: true,
        alojamientoDetalle: true,
        servicio: {
          select: {
            idCiudad: true,
            alojamiento: true,
            tipo: {
              select: {
                nombre: true,
                codigo: true
              }
            }
          }
        }
      }
    });

    const columns = await tx.cotizacionColumna.findMany({
      where: {
        idCotizacion: versionId,
        activo: true
      },
      select: {
        id: true,
        tipo: true,
        grupo: true,
        nombre: true,
        unidad: true,
        multiplicador: true
      }
    });

    if (!items.length || !columns.length) {
      return;
    }

    const existingPrices = await tx.cotizacionItemPrecio.findMany({
      where: {
        idCotizacionItem: {
          in: items.map((item) => item.id)
        },
        idCotizacionColumna: {
          in: columns.map((column) => column.id)
        }
      },
      select: {
        id: true,
        idCotizacionItem: true,
        idCotizacionColumna: true,
        precioNeto: true,
        precioEditadoManual: true
      }
    });

    const existingPricesByKey = new Map(
      existingPrices.map((price) => [
        `${price.idCotizacionItem}-${price.idCotizacionColumna}`,
        price
      ])
    );

    const tarifaByItemId = new Map<
      number,
      {
        precioNeto: Prisma.Decimal;
        monedaCodigo: string;
      } | null
    >();

    for (const item of items) {
      if (isAlojamientoTipo(item.servicio.tipo)) {
        tarifaByItemId.set(item.id, null);
        continue;
      }

      const tarifa = await tx.servicioTarifa.findFirst({
        where: {
          idServicio: item.idServicio,
          activo: true,
          fechaDesde: {
            lte: item.fechaServicio
          },
          fechaHasta: {
            gte: item.fechaServicio
          }
        },
        orderBy: [
          {
            fechaDesde: "desc"
          },
          {
            id: "desc"
          }
        ],
        select: {
          precioNeto: true,
          monedaCodigo: true
        }
      });

      tarifaByItemId.set(item.id, tarifa);
    }

    const pricesToCreate: Array<{
      idCotizacionItem: number;
      idCotizacionColumna: number;
      precioNeto: Prisma.Decimal | null;
      monedaCodigo: string;
      precioEditadoManual: boolean;
    }> = [];

    for (const item of items) {
      const tipoServicio = normalizeText(item.servicio.tipo.nombre);
      const tipoServicioCodigo = normalizeText(item.servicio.tipo.codigo);
      const isAlojamiento = isAlojamientoTipo(item.servicio.tipo);
      const tarifa = tarifaByItemId.get(item.id) ?? null;

      const allowedColumns = columns.filter((column) => {
        if (item.esOpcional) {
          return column.tipo === CotizacionColumnaTipo.OPCIONALES;
        }

        if (tipoServicio === "vuelo" || tipoServicio === "tren" || tipoServicioCodigo === "vuelo" || tipoServicioCodigo === "tren") {
          return column.tipo === CotizacionColumnaTipo.TRANSPORTE;
        }

        if (tipoServicio === "otro" || tipoServicioCodigo === "otro") {
          return false;
        }

        return column.tipo === CotizacionColumnaTipo.TERRESTRE;
      });

      for (const column of allowedColumns) {
        const key = `${item.id}-${column.id}`;
        const existingPrice = existingPricesByKey.get(key);

        if (existingPrice) {
          continue;
        }

        if (isAlojamiento && !item.esOpcional) {
          const categoria = mapHotelCategoryFromColumn(column.grupo);
          const tipoHabitacion = mapRoomTypeFromColumn(column.nombre);

          if (!categoria || !tipoHabitacion) {
            pricesToCreate.push({
              idCotizacionItem: item.id,
              idCotizacionColumna: column.id,
              precioNeto: null,
              monedaCodigo: "USD",
              precioEditadoManual: false
            });

            continue;
          }

          const categoriaHab = item.alojamientoDetalle?.categoriaHab ?? "ESTANDAR";
          const regimen = item.alojamientoDetalle?.regimen ?? "ALOJAMIENTO_DESAYUNO";

          const alojamientoPrecio = await tx.alojamientoPrecioMes.findFirst({
            where: {
              idCiudad: item.servicio.idCiudad,
              categoria,
              categoriaHab,
              regimen,
              tipoHabitacion,
              activo: true,
              fechaDesde: {
                lte: item.fechaServicio
              },
              fechaHasta: {
                gte: item.fechaServicio
              }
            },
            orderBy: [
              {
                fechaDesde: "desc"
              },
              {
                id: "desc"
              }
            ],
            select: {
              precioUsd: true,
              monedaCodigo: true
            }
          });

          pricesToCreate.push({
            idCotizacionItem: item.id,
            idCotizacionColumna: column.id,
            precioNeto: alojamientoPrecio?.precioUsd
              ? calculateAccommodationPrice({
                  precioUsd: alojamientoPrecio.precioUsd,
                  noches: item.alojamientoDetalle?.noches ?? 1,
                  habitaciones: item.alojamientoDetalle?.habitaciones ?? 1,
                  unidad: column.unidad,
                  multiplicador: column.multiplicador
                })
              : null,
            monedaCodigo: alojamientoPrecio?.monedaCodigo ?? "USD",
            precioEditadoManual: false
          });

          continue;
        }

        pricesToCreate.push({
          idCotizacionItem: item.id,
          idCotizacionColumna: column.id,
          precioNeto: tarifa?.precioNeto ?? null,
          monedaCodigo: tarifa?.monedaCodigo ?? "USD",
          precioEditadoManual: false
        });
      }
    }

    if (pricesToCreate.length) {
      await tx.cotizacionItemPrecio.createMany({
        data: pricesToCreate,
        skipDuplicates: true
      });
    }
  }
}

export const cotizacionBuilderRepository = new CotizacionBuilderRepository();