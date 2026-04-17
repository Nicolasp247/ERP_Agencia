import { calculateLiquidacionSnapshot } from "@/modules/liquidacion/service/liquidacion.calculator";
import { buildReservaItemSnapshot } from "@/modules/reserva/service/reserva.snapshot";

describe("full flow smoke", () => {
  it("mantiene snapshots y liquida el flujo cotizacion -> reserva -> liquidacion", () => {
    const reservaItem = buildReservaItemSnapshot({
      id: 77,
      idServicio: 9,
      fechaServicio: new Date("2026-05-10"),
      ordenDia: 1,
      esOpcional: false,
      tituloOverride: null,
      idiomaOverride: "Francés",
      claseOverride: null,
      notaLinea: "Asiento delante",
      precioSugerido: { toString: () => "300" },
      precioMonedaCodigo: "EUR",
      servicio: {
        nombreWtravel: "Tour panoramico",
        tour: { idioma: "Español" },
        boletoEntrada: null,
        tren: null,
        vuelo: null
      }
    });

    const liquidation = calculateLiquidacionSnapshot({
      totalVentaConfirmada: 500,
      totalPasajeros: 2,
      comisionPctSnapshot: 12,
      items: [
        {
          vendido: true,
          costoCotizado: Number(reservaItem.costoCotizado ?? 0),
          costoFinal: 320
        }
      ]
    });

    expect(reservaItem.idiomaSnapshot).toBe("Francés");
    expect(reservaItem.costoCotizado).toBe(300);
    expect(liquidation.utilidadBrutaTotal).toBe(180);
    expect(liquidation.valorAgencia).toBe(60);
  });
});
