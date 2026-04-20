import { describe, expect, it } from "vitest";

/**
 * Esta función representa una regla importante:
 * no se debe calcular la liquidación si la reserva
 * todavía no fue confirmada comercialmente.
 */
function canCalcularLiquidacion(confirmacionComercialEstado: "NO_CONFIRMADA" | "CONFIRMADA") {
  if (confirmacionComercialEstado !== "CONFIRMADA") {
    throw new Error("No se puede calcular la liquidación sin confirmación comercial");
  }

  return true;
}

describe("liquidacion regla confirmacion", () => {
  it("rechaza la liquidacion si la reserva no esta confirmada comercialmente", () => {
    expect(() => canCalcularLiquidacion("NO_CONFIRMADA")).toThrow(
      "No se puede calcular la liquidación sin confirmación comercial"
    );
  });

  it("permite la liquidacion si la reserva ya fue confirmada comercialmente", () => {
    expect(canCalcularLiquidacion("CONFIRMADA")).toBe(true);
  });
});