import { calculateLiquidacionSnapshot } from "@/modules/liquidacion/service/liquidacion.calculator";

describe("liquidacion calculator", () => {
  it("calcula liquidacion usando venta confirmada y costo real", () => {
    const snapshot = calculateLiquidacionSnapshot({
      totalVentaConfirmada: 1000,
      totalPasajeros: 4,
      comisionPctSnapshot: 10,
      items: [
        { vendido: true, costoCotizado: 200, costoFinal: 220 },
        { vendido: true, costoCotizado: 150, costoFinal: 160 },
        { vendido: false, costoCotizado: 50, costoFinal: 0 }
      ]
    });

    expect(snapshot.totalCostoReal).toBe(380);
    expect(snapshot.utilidadBrutaTotal).toBe(620);
    expect(snapshot.utilidadPorPersona).toBe(155);
    expect(snapshot.valorAgencia).toBe(100);
    expect(snapshot.diferenciaCotizadoVsReal).toBe(30);
  });
});
