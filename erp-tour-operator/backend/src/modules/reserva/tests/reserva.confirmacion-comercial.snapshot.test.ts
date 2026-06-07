/* erp-tour-operator/backend/src/modules/reserva/tests/reserva.confirmacion-comercial.snapshot.test.ts */

import { describe, expect, it } from "vitest";

type ReservaItemVenta = {
  id: number;
  precioVenta: number;
  esOpcionalVendido: boolean;
};

type ConfirmacionComercialItem = {
  idReservaItem: number;
  precioVentaConfirmado: number;
  esOpcionalVendido: boolean;
};

/**
 * Esta función crea la "foto congelada" de la confirmación comercial.
 * Lo que quede aquí guardado debe mantenerse aunque el dato original cambie después.
 */
function buildConfirmacionComercialSnapshot(
  items: ReservaItemVenta[]
): ConfirmacionComercialItem[] {
  return items.map((item) => ({
    idReservaItem: item.id,
    precioVentaConfirmado: item.precioVenta,
    esOpcionalVendido: item.esOpcionalVendido
  }));
}

describe("reserva confirmacion comercial snapshot", () => {
  it("congela los valores de venta al momento de confirmar", () => {
    const itemsOriginales: ReservaItemVenta[] = [
      { id: 1, precioVenta: 120, esOpcionalVendido: false },
      { id: 2, precioVenta: 80, esOpcionalVendido: true }
    ];

    const snapshot = buildConfirmacionComercialSnapshot(itemsOriginales);

    // Después de guardar la foto, el dato original cambia.
    itemsOriginales[0].precioVenta = 999;

    expect(snapshot[0].idReservaItem).toBe(1);
    expect(snapshot[0].precioVentaConfirmado).toBe(120);
    expect(snapshot[1].precioVentaConfirmado).toBe(80);
    expect(snapshot[1].esOpcionalVendido).toBe(true);
  });
});