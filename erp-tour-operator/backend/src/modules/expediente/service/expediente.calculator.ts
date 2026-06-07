/* erp-tour-operator/backend/src/modules/expediente/service/expediente.calculator.ts */

import type { ExpedienteTotales } from "@/modules/expediente/types/expediente.types";

export function sumPassengerGroups(input: {
  adultos65: number;
  adultos1964: number;
  jovenes1218: number;
  ninos311: number;
  infantes02: number;
}) {
  return input.adultos65 + input.adultos1964 + input.jovenes1218 + input.ninos311 + input.infantes02;
}

export function calculateExpedienteTotals(
  items: Array<{
    esOpcional: boolean;
    precioSugerido: number | null | undefined;
    precioVenta: number | null | undefined;
  }>,
  totalPasajeros: number
): ExpedienteTotales {
  const totals = items.reduce(
    (acc, item) => {
      const costo = item.precioSugerido ?? 0;
      const venta = item.precioVenta ?? 0;

      if (item.esOpcional) {
        acc.totalCostoOpcionales += costo;
        acc.totalVentaOpcionales += venta;
      } else {
        acc.totalCostoIncluidos += costo;
        acc.totalVentaIncluidos += venta;
      }

      return acc;
    },
    {
      totalCostoIncluidos: 0,
      totalCostoOpcionales: 0,
      totalVentaIncluidos: 0,
      totalVentaOpcionales: 0
    }
  );

  return {
    ...totals,
    totalVenta: totals.totalVentaIncluidos,
    totalPorPersona: totalPasajeros > 0 ? totals.totalVentaIncluidos / totalPasajeros : 0
  };
}

export function buildExpedienteCode(id: number) {
  return `COT-${id}`;
}

export function resolveItemPricing(
  precioCatalogo: number | null,
  precioSugeridoManual?: number | null,
  precioVentaManual?: number | null
) {
  const precioSugerido = precioSugeridoManual ?? precioCatalogo;
  const precioVenta = precioVentaManual ?? precioSugerido;

  return {
    precioSugerido,
    precioVenta,
    precioEditadoManual:
      precioVentaManual !== undefined &&
      precioVentaManual !== null &&
      precioVentaManual !== (precioSugerido ?? null)
  };
}
