import { describe, expect, it } from "vitest";

/**
 * Esta función simula la regla del negocio:
 * si una cotización ya fue convertida en reserva,
 * no debe poder convertirse otra vez.
 */
function canConvertCotizacionToReserva(estado: "ACTIVA" | "DESCARTADA" | "CONVERTIDA_RESERVA") {
  if (estado === "CONVERTIDA_RESERVA") {
    throw new Error("La cotización ya fue convertida en reserva");
  }

  return true;
}

describe("reserva double conversion", () => {
  it("impide convertir dos veces la misma cotizacion", () => {
    expect(() => canConvertCotizacionToReserva("CONVERTIDA_RESERVA")).toThrow(
      "La cotización ya fue convertida en reserva"
    );
  });

  it("permite convertir una cotizacion activa", () => {
    expect(canConvertCotizacionToReserva("ACTIVA")).toBe(true);
  });
});