/* erp-tour-operator/backend/src/modules/reserva/tests/reserva.snapshot.test.ts */

import { buildReservaItemSnapshot } from "@/modules/reserva/service/reserva.snapshot";
import { buildReservaCode, calculateReservaEstado } from "@/modules/reserva/service/reserva-state";

describe("reserva snapshot", () => {
  it("convierte una cotizacion en snapshot de reserva preservando overrides", () => {
    const snapshot = buildReservaItemSnapshot({
      id: 10,
      idServicio: 9,
      fechaServicio: new Date("2026-05-10"),
      ordenDia: 2,
      esOpcional: false,
      tituloOverride: "Excursion premium a Toledo",
      idiomaOverride: null,
      claseOverride: "VIP",
      notaLinea: "Sin gluten",
      precioSugerido: { toString: () => "120.50" },
      precioMonedaCodigo: "EUR",
      servicio: {
        nombreWtravel: "Excursión a Toledo",
        tour: { idioma: { nombre: "Español" } },
        boletoEntrada: null,
        tren: null,
        vuelo: null
      }
    });

    expect(buildReservaCode(15, new Date("2026-04-17"))).toBe("RES-2026-15");
    expect(snapshot.idCotizacionItemOrigen).toBe(10);
    expect(snapshot.tituloSnapshot).toBe("Excursion premium a Toledo");
    expect(snapshot.idiomaSnapshot).toBe("Español");
    expect(snapshot.claseSnapshot).toBe("VIP");
    expect(snapshot.costoCotizado).toBe(120.5);
    expect(snapshot.costoFinal).toBeNull();
  });

  it("confirma la reserva si todos los obligatorios tienen confirmacion", () => {
    const estado = calculateReservaEstado(
      [
        { esOpcional: false, estadoItem: "CONFIRMADO" as never, numeroConfirmacion: "ABC" },
        { esOpcional: false, estadoItem: "CONFIRMADO" as never, numeroConfirmacion: "DEF" },
        { esOpcional: true, estadoItem: "PENDIENTE" as never, numeroConfirmacion: null }
      ],
      false
    );

    expect(estado).toBe("CONFIRMADA");
  });
});
