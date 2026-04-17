import { calculateCotizacionTotals, resolveItemPricing, sumPassengerGroups } from "@/modules/cotizacion/service/cotizacion.calculator";

describe("cotizacion calculator", () => {
  it("valida el total de pasajeros sumando los grupos etarios", () => {
    expect(
      sumPassengerGroups({
        adultos65: 1,
        adultos1964: 2,
        jovenes1218: 1,
        ninos311: 0,
        infantes02: 1
      })
    ).toBe(5);
  });

  it("calcula totales separando incluidos y opcionales", () => {
    const totals = calculateCotizacionTotals(
      [
        { esOpcional: false, precioSugerido: 100, precioVenta: 125 },
        { esOpcional: false, precioSugerido: 80, precioVenta: 110 },
        { esOpcional: true, precioSugerido: 40, precioVenta: 55 }
      ],
      2
    );

    expect(totals.totalCostoIncluidos).toBe(180);
    expect(totals.totalCostoOpcionales).toBe(40);
    expect(totals.totalVentaIncluidos).toBe(235);
    expect(totals.totalVentaOpcionales).toBe(55);
    expect(totals.totalVenta).toBe(235);
    expect(totals.totalPorPersona).toBe(117.5);
  });

  it("distingue precio sugerido y precio manual", () => {
    const pricing = resolveItemPricing(100, null, 145);

    expect(pricing.precioSugerido).toBe(100);
    expect(pricing.precioVenta).toBe(145);
    expect(pricing.precioEditadoManual).toBe(true);
  });
});
