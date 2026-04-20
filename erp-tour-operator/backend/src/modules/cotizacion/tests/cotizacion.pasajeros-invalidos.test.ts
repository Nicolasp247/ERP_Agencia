import { describe, expect, it } from "vitest";

type PasajerosInput = {
  adultos65: number;
  adultos19a64: number;
  jovenes12a18: number;
  ninos3a11: number;
  infantes0a2: number;
  totalPasajeros: number;
};

/**
 * Esta función valida que el total de pasajeros
 * coincida exactamente con la suma de todos los grupos.
 */
function validarTotalPasajeros(input: PasajerosInput) {
  const suma =
    input.adultos65 +
    input.adultos19a64 +
    input.jovenes12a18 +
    input.ninos3a11 +
    input.infantes0a2;

  if (suma !== input.totalPasajeros) {
    throw new Error("El total de pasajeros no coincide con la suma de los grupos etarios");
  }

  return true;
}

describe("cotizacion pasajeros invalidos", () => {
  it("acepta una distribucion correcta de pasajeros", () => {
    expect(
      validarTotalPasajeros({
        adultos65: 1,
        adultos19a64: 2,
        jovenes12a18: 0,
        ninos3a11: 1,
        infantes0a2: 0,
        totalPasajeros: 4
      })
    ).toBe(true);
  });

  it("rechaza una distribucion incorrecta de pasajeros", () => {
    expect(() =>
      validarTotalPasajeros({
        adultos65: 1,
        adultos19a64: 2,
        jovenes12a18: 0,
        ninos3a11: 1,
        infantes0a2: 0,
        totalPasajeros: 5
      })
    ).toThrow("El total de pasajeros no coincide con la suma de los grupos etarios");
  });
});