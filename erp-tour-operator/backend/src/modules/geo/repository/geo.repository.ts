import { prisma } from "@/core/db/prisma";

export const geoRepository = {
  async findContinentes() {
    return prisma.continente.findMany({
      orderBy: { nombre: "asc" }
    });
  },

  async findPaises(idContinente?: number) {
    return prisma.pais.findMany({
      where: idContinente !== undefined ? { idContinente } : {},
      orderBy: { nombre: "asc" }
    });
  },

  async findCiudades(idPais?: number) {
    return prisma.ciudad.findMany({
      where: idPais !== undefined ? { idPais } : {},
      orderBy: { nombre: "asc" }
    });
  }
};