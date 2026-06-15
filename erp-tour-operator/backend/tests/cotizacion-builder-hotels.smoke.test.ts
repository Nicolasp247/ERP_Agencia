/* erp-tour-operator/backend/tests/cotizacion-builder-hotels.smoke.test.ts */

import { prisma } from "@/core/db/prisma";
import { cotizacionBuilderRepository } from "@/modules/expediente/cotizacion-builder/repository/cotizacion-builder.repository";

const VERSION_ID = 8;
const ALOJAMIENTO_ITEM_ID = 26;
const EXCURSION_ITEM_ID = 12;

const COLUMN_TURISTA_ID = 14;
const COLUMN_LUJO_ID = 15;

const COLUMN_IDS = [COLUMN_TURISTA_ID, COLUMN_LUJO_ID];

describe("cotizacion builder hotels smoke", () => {
  let previousHotels: Array<{
    idCotizacionItem: number;
    idCotizacionColumna: number;
    textoHotel: string;
  }> = [];

  beforeAll(async () => {
    previousHotels = await prisma.cotizacionItemHotelPrevisto.findMany({
      where: {
        idCotizacionItem: ALOJAMIENTO_ITEM_ID,
        idCotizacionColumna: {
          in: COLUMN_IDS
        }
      },
      select: {
        idCotizacionItem: true,
        idCotizacionColumna: true,
        textoHotel: true
      }
    });
  });

  afterAll(async () => {
    await prisma.cotizacionItemHotelPrevisto.deleteMany({
      where: {
        idCotizacionItem: ALOJAMIENTO_ITEM_ID,
        idCotizacionColumna: {
          in: COLUMN_IDS
        }
      }
    });

    if (previousHotels.length > 0) {
      await prisma.cotizacionItemHotelPrevisto.createMany({
        data: previousHotels
      });
    }

    await prisma.$disconnect();
  });

  it("guarda y recupera hoteles previstos para un item de alojamiento", async () => {
    const result = await cotizacionBuilderRepository.updateItemHotels(
      ALOJAMIENTO_ITEM_ID,
      {
        hotels: [
          {
            columnId: COLUMN_TURISTA_ID,
            textoHotel: "Hotel Smoke Test Turista"
          },
          {
            columnId: COLUMN_LUJO_ID,
            textoHotel: "Hotel Smoke Test Lujo"
          }
        ]
      }
    );

    expect(result).not.toBeNull();
    expect(result).not.toBe("ITEM_NOT_ACCOMMODATION");

    const persistedHotels = await prisma.cotizacionItemHotelPrevisto.findMany({
      where: {
        idCotizacionItem: ALOJAMIENTO_ITEM_ID,
        idCotizacionColumna: {
          in: COLUMN_IDS
        }
      },
      orderBy: {
        idCotizacionColumna: "asc"
      }
    });

    expect(persistedHotels).toHaveLength(2);

    expect(persistedHotels[0].idCotizacionColumna).toBe(COLUMN_TURISTA_ID);
    expect(persistedHotels[0].textoHotel).toBe("Hotel Smoke Test Turista");

    expect(persistedHotels[1].idCotizacionColumna).toBe(COLUMN_LUJO_ID);
    expect(persistedHotels[1].textoHotel).toBe("Hotel Smoke Test Lujo");

    const reloadedBuilder = await cotizacionBuilderRepository.findVersionById(VERSION_ID);
    const alojamientoRow = reloadedBuilder?.items.find(
      (item) => item.id === ALOJAMIENTO_ITEM_ID
    );

    expect(alojamientoRow).toBeDefined();
    expect(alojamientoRow?.hotelesPrevistos).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          idCotizacionColumna: COLUMN_TURISTA_ID,
          textoHotel: "Hotel Smoke Test Turista"
        }),
        expect.objectContaining({
          idCotizacionColumna: COLUMN_LUJO_ID,
          textoHotel: "Hotel Smoke Test Lujo"
        })
      ])
    );
  });

  it("rechaza hoteles previstos en un item que no es alojamiento", async () => {
    const result = await cotizacionBuilderRepository.updateItemHotels(
      EXCURSION_ITEM_ID,
      {
        hotels: [
          {
            columnId: COLUMN_TURISTA_ID,
            textoHotel: "Este hotel no debe guardarse"
          }
        ]
      }
    );

    expect(result).toBe("ITEM_NOT_ACCOMMODATION");
  });

  it("borra el hotel previsto cuando el texto viene vacio", async () => {
    await cotizacionBuilderRepository.updateItemHotels(ALOJAMIENTO_ITEM_ID, {
      hotels: [
        {
          columnId: COLUMN_TURISTA_ID,
          textoHotel: "Hotel temporal para borrar"
        }
      ]
    });

    await cotizacionBuilderRepository.updateItemHotels(ALOJAMIENTO_ITEM_ID, {
      hotels: [
        {
          columnId: COLUMN_TURISTA_ID,
          textoHotel: ""
        }
      ]
    });

    const deletedHotel = await prisma.cotizacionItemHotelPrevisto.findFirst({
      where: {
        idCotizacionItem: ALOJAMIENTO_ITEM_ID,
        idCotizacionColumna: COLUMN_TURISTA_ID
      }
    });

    expect(deletedHotel).toBeNull();
  });
});