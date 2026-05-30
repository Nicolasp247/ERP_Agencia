/* erp-tour-operator/backend/src/modules/servicio/repository/servicio.repository.ts */

import { Prisma } from "@prisma/client";
import { prisma } from "@/core/db/prisma";
import type { ServicioFilters, ServicioInput, TipoServicioInput } from "@/modules/servicio/dto/servicio.dto";
import type { ServicioTipoCodigo } from "@/modules/servicio/types/servicio.types";

export class ServicioRepository {
  private normalizarNombrePuntoTraslado(nombre: string) {
    return nombre.trim().replace(/\s+/g, " ").toLowerCase();
  }

  private normalizarTextoBase(value: string | null | undefined) {
    return String(value ?? "")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  private isTipoAlojamiento(tipoCodigo: ServicioTipoCodigo) {
    return tipoCodigo === "ALOJAMIENTO";
  }

  private async findAlojamientoBaseExistente(
    tx: Prisma.TransactionClient,
    data: ServicioInput
  ) {
    const serviciosCiudad = await tx.servicio.findMany({
      where: {
        idTipo: data.idTipo,
        idProveedor: data.idProveedor,
        idCiudad: data.idCiudad,
        activo: true
      },
      select: {
        id: true,
        nombreWtravel: true
      }
    });

    const nombreNuevo = this.normalizarTextoBase(data.nombreWtravel);

    return serviciosCiudad.find((servicio) => {
      return this.normalizarTextoBase(servicio.nombreWtravel) === nombreNuevo;
    });
  }

  private throwServicioDuplicate(message: string) {
    const error = new Error(message) as Error & {
      statusCode?: number;
      code?: string;
    };

    error.statusCode = 409;
    error.code = "SERVICIO_DUPLICATE";

    throw error;
  }
  
  listTipos() {
    return prisma.tipoServicio.findMany({
      orderBy: {
        nombre: "asc"
      }
    });
  }

  findTipoById(id: number) {
    return prisma.tipoServicio.findUnique({
      where: { id }
    });
  }

  createTipo(data: TipoServicioInput) {
    return prisma.tipoServicio.create({
      data: {
        nombre: data.nombre,
        codigo: data.codigo,
        activo: data.activo ?? true
      }
    });
  }

  updateTipo(id: number, data: TipoServicioInput) {
    return prisma.tipoServicio.update({
      where: { id },
      data: {
        nombre: data.nombre,
        codigo: data.codigo,
        activo: data.activo ?? true
      }
    });
  }

  listPuntosTraslado(idCiudad: number) {
    return prisma.puntoTraslado.findMany({
      where: {
        idCiudad,
        activo: true
      },
      orderBy: {
        nombre: "asc"
      }
    });
  }

  list(filters: ServicioFilters) {
    return prisma.servicio.findMany({
      where: {
        nombreWtravel: filters.search
          ? {
              contains: filters.search
            }
          : undefined,
        idTipo: filters.idTipo,
        idProveedor: filters.idProveedor,
        idCiudad: filters.idCiudad,
        activo: filters.activo,
        ciudad:
          filters.idPais || filters.idContinente
            ? {
                idPais: filters.idPais,
                pais: filters.idContinente
                  ? {
                      idContinente: filters.idContinente
                    }
                  : undefined
              }
            : undefined
      },
      include: {
        tipo: true,
        proveedor: true,
        ciudad: {
          include: {
            pais: {
              include: {
                continente: true
              }
            }
          }
        },
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
        vuelo: true,
        tarifasRango: {
          where: {
            activo: true
          },
          take: 1,
          orderBy: [
            { precioNeto: "asc" },
            { fechaDesde: "asc" }
          ]
        }
      },
      orderBy: {
        nombreWtravel: "asc"
      }
    });
  }
  
  listIdiomas() {
    return prisma.idioma.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" }
    });
  }

  listTiposGuia() {
    return prisma.tipoGuia.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" }
    });
  }

  findById(id: number) {
    return prisma.servicio.findUnique({
      where: { id },
      include: {
        tipo: true,
        proveedor: {
          select: {
            id: true,
            nombreComercial: true
          }
        },
        ciudad: {
          include: {
            pais: {
              include: {
                continente: true
              }
            }
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
        vuelo: true,
        tarifasRango: {
          orderBy: [
            { fechaDesde: "asc" },
            { fechaHasta: "asc" },
            { tipoTarifa: "asc" }
          ]
        }
      }
    });
  }
  
  findByNombre(nombreWtravel: string) {
    return prisma.servicio.findUnique({
      where: { nombreWtravel }
    });
  }

  async create(data: ServicioInput & { createdBy?: number | null }, tipoCodigo: ServicioTipoCodigo) {
    return prisma.$transaction(async (tx) => {
      if (this.isTipoAlojamiento(tipoCodigo)) {
        const alojamientoExistente = await this.findAlojamientoBaseExistente(tx, data);

        if (alojamientoExistente) {
          this.throwServicioDuplicate(
            "Ya existe un servicio base de alojamiento para esa ciudad, proveedor y nombre interno. Para agregar categorías o precios, usa la matriz de precios de alojamiento."
          );
        }
      }

      const service = await tx.servicio.create({
        data: {
          idTipo: data.idTipo,
          idProveedor: data.idProveedor,
          idCiudad: data.idCiudad,
          nombreWtravel: data.nombreWtravel,
          tiempoServicio: data.tiempoServicio,
          privado: data.privado,
          descripcion: data.descripcion,
          linkReserva: data.linkReserva,
          activo: data.activo ?? true,
          createdBy: data.createdBy ?? null,
          updatedBy: data.createdBy ?? null
        }
      });

      await this.replaceDetail(tx, service.id, tipoCodigo, data);
      return service;
    });
  }

  async update(id: number, data: ServicioInput & { updatedBy?: number | null }, tipoCodigo: ServicioTipoCodigo) {
    return prisma.$transaction(async (tx) => {
      await tx.servicio.update({
        where: { id },
        data: {
          idTipo: data.idTipo,
          idProveedor: data.idProveedor,
          idCiudad: data.idCiudad,
          nombreWtravel: data.nombreWtravel,
          tiempoServicio: data.tiempoServicio,
          privado: data.privado,
          descripcion: data.descripcion,
          linkReserva: data.linkReserva,
          activo: data.activo ?? true,
          updatedBy: data.updatedBy ?? null
        }
      });

      await this.clearDetails(tx, id);
      await this.replaceDetail(tx, id, tipoCodigo, data);

      return tx.servicio.findUniqueOrThrow({
        where: { id }
      });
    });
  }

  async updateEstado(id: number, activo: boolean, updatedBy?: number | null) {
    return prisma.servicio.update({
      where: { id },
      data: {
        activo,
        updatedBy: updatedBy ?? null
      }
    });
  }

  async findOrCreatePuntoTraslado(
    tx: Prisma.TransactionClient,
    idCiudad: number,
    nombre: string
  ) {
    const limpio = nombre.trim();
    const nombreNormalizado = this.normalizarNombrePuntoTraslado(limpio);

    const puntosCiudad = await tx.puntoTraslado.findMany({
      where: {
        idCiudad
      }
    });

    const existente = puntosCiudad.find((punto) => {
      return this.normalizarNombrePuntoTraslado(punto.nombre) === nombreNormalizado;
    });

    if (existente) {
      if (!existente.activo) {
        return tx.puntoTraslado.update({
          where: {
            id: existente.id
          },
          data: {
            activo: true
          }
        });
      }

      return existente;
    }

    return tx.puntoTraslado.create({
      data: {
        idCiudad,
        nombre: limpio,
        activo: true
      }
    });
  }

  private clearDetails(tx: Prisma.TransactionClient, idServicio: number) {
    return Promise.all([
      tx.alojamiento.deleteMany({ where: { idServicio } }),
      tx.tour.deleteMany({ where: { idServicio } }),
      tx.traslado.deleteMany({ where: { idServicio } }),
      tx.tren.deleteMany({ where: { idServicio } }),
      tx.vuelo.deleteMany({ where: { idServicio } })
    ]);
  }

  private async replaceDetail(
    tx: Prisma.TransactionClient,
    idServicio: number,
    tipoCodigo: ServicioTipoCodigo,
    data: ServicioInput
  ) {
    switch (tipoCodigo) {
      case "ALOJAMIENTO":
        await tx.alojamiento.create({
          data: {
            idServicio,
            ...data.alojamiento!
          }
        });
        break;
      case "VISITA":
      case "EXCURSION":
      case "ENTRADA":
        await tx.tour.create({
            data: {
            idServicio,
            ...data.tour!
          }
        });
        break;
      case "TRASLADO": {
        const traslado = data.traslado!;
        let idOrigen = traslado.idOrigen ?? null;
        let idDestino = traslado.idDestino ?? null;

        if (!idOrigen && traslado.nuevoOrigen?.trim()) {
          const puntoOrigen = await this.findOrCreatePuntoTraslado(tx, data.idCiudad, traslado.nuevoOrigen);
          idOrigen = puntoOrigen.id;
        }

        if (!idDestino && traslado.nuevoDestino?.trim()) {
          const puntoDestino = await this.findOrCreatePuntoTraslado(tx, data.idCiudad, traslado.nuevoDestino);
          idDestino = puntoDestino.id;
        }

        if (!idOrigen || !idDestino) {
          throw new Error("No fue posible resolver origen y destino del traslado");
        }

        await tx.traslado.create({
          data: {
            idServicio,
            idOrigen,
            idDestino,
            escalas: traslado.escalas ?? 0,
            vehiculo: traslado.vehiculo ?? null
          }
        });
        break;
      }

      case "TREN":
        await tx.tren.create({
          data: {
            idServicio,
            ...data.tren!
          }
        });
        break;
      case "VUELO":
        await tx.vuelo.create({
          data: {
            idServicio,
            ...data.vuelo!
          }
        });
        break;
      
      case "OTRO":
        break;
    }
  }
}

export const servicioRepository = new ServicioRepository();
