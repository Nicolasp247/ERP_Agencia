import { prisma } from "@/core/db/prisma";

export class LiquidacionRepository {
  findReservaForLiquidacion(id: number) {
    return prisma.reserva.findUnique({
      where: { id },
      include: {
        items: true,
        confirmacionesComerciales: {
          where: {
            estado: "ACTIVA"
          },
          include: {
            items: true
          },
          orderBy: {
            version: "desc"
          },
          take: 1
        },
        liquidacion: true
      }
    });
  }
}

export const liquidacionRepository = new LiquidacionRepository();
