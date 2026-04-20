import { describe, expect, it } from "vitest";

type ReservaItemConfirmacion = {
  numeroConfirmacion: string | null;
  fechaPrimerConfirmacion: Date | null;
  fechaUltimaConfirmacion: Date | null;
};

/**
 * Esta función representa la regla del negocio:
 * la primera fecha de confirmación se guarda una sola vez
 * y no debe cambiar aunque el número se edite después.
 */
function updateConfirmacion(
  item: ReservaItemConfirmacion,
  nuevoNumero: string,
  ahora: Date
): ReservaItemConfirmacion {
  return {
    numeroConfirmacion: nuevoNumero,
    fechaPrimerConfirmacion: item.fechaPrimerConfirmacion ?? ahora,
    fechaUltimaConfirmacion: ahora
  };
}

describe("reserva confirmacion fecha", () => {
  it("mantiene intacta la primera fecha de confirmacion al editar el numero", () => {
    const primeraFecha = new Date("2026-04-17T08:00:00Z");
    const nuevaFecha = new Date("2026-04-18T10:30:00Z");

    const original: ReservaItemConfirmacion = {
      numeroConfirmacion: "ABC123",
      fechaPrimerConfirmacion: primeraFecha,
      fechaUltimaConfirmacion: primeraFecha
    };

    const actualizado = updateConfirmacion(original, "XYZ999", nuevaFecha);

    expect(actualizado.numeroConfirmacion).toBe("XYZ999");
    expect(actualizado.fechaPrimerConfirmacion).toEqual(primeraFecha);
    expect(actualizado.fechaUltimaConfirmacion).toEqual(nuevaFecha);
  });

  it("guarda la primera fecha si antes no existia", () => {
    const ahora = new Date("2026-04-17T08:00:00Z");

    const original: ReservaItemConfirmacion = {
      numeroConfirmacion: null,
      fechaPrimerConfirmacion: null,
      fechaUltimaConfirmacion: null
    };

    const actualizado = updateConfirmacion(original, "ABC123", ahora);

    expect(actualizado.fechaPrimerConfirmacion).toEqual(ahora);
    expect(actualizado.fechaUltimaConfirmacion).toEqual(ahora);
  });
});