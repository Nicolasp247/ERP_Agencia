import { prisma } from "@/core/db/prisma";
import type { ProveedorFilters, ProveedorInput } from "@/modules/proveedor/dto/proveedor.dto";

export class ProveedorRepository {
  list(filters: ProveedorFilters) {
    return prisma.proveedor.findMany({
      where: {
        nombreComercial: filters.search
          ? {
              contains: filters.search
            }
          : undefined,
        idPais: filters.idPais,
        activo: filters.activo,
        servicios: filters.idTipoServicio
          ? {
              some: {
                idTipo: filters.idTipoServicio
              }
            }
          : undefined
      },
      include: {
        pais: true,
        ciudad: true,
        servicios: {
          include: {
            tipo: {
              select: {
                nombre: true
              }
            }
          }
        }
      },
      orderBy: {
        nombreComercial: "asc"
      }
    });
  }

  findById(id: number) {
    return prisma.proveedor.findUnique({
      where: { id },
      include: {
        pais: true,
        ciudad: true,
        contactos: {
          orderBy: [{ principal: "desc" }, { email: "asc" }]
        },
        servicios: {
          include: {
            tipo: {
              select: {
                nombre: true
              }
            }
          },
          orderBy: {
            nombreWtravel: "asc"
          }
        }
      }
    });
  }

  findByCodigo(codigo: string) {
    return prisma.proveedor.findFirst({
      where: { codigo }
    });
  }

  create(data: ProveedorInput & { createdBy?: number | null }) {
    return prisma.proveedor.create({
      data: {
        codigo: data.codigo,
        nombreComercial: data.nombreComercial,
        sitioWeb: data.sitioWeb,
        idPais: data.idPais,
        idCiudad: data.idCiudad,
        observaciones: data.observaciones,
        activo: data.activo ?? true,
        createdBy: data.createdBy ?? null,
        updatedBy: data.createdBy ?? null,
        contactos: {
          create: data.contactos
        }
      }
    });
  }

  update(id: number, data: ProveedorInput & { updatedBy?: number | null }) {
    return prisma.$transaction(async (tx) => {
      await tx.proveedorContacto.deleteMany({
        where: {
          idProveedor: id
        }
      });

      return tx.proveedor.update({
        where: { id },
        data: {
          codigo: data.codigo,
          nombreComercial: data.nombreComercial,
          sitioWeb: data.sitioWeb,
          idPais: data.idPais,
          idCiudad: data.idCiudad,
          observaciones: data.observaciones,
          activo: data.activo ?? true,
          updatedBy: data.updatedBy ?? null,
          contactos: {
            create: data.contactos
          }
        }
      });
    });
  }
}

export const proveedorRepository = new ProveedorRepository();
