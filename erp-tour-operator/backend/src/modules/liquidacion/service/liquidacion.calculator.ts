import type { LiquidacionCalculation } from "@/modules/liquidacion/types/liquidacion.types";

export function calculateLiquidacionSnapshot(input: {
  totalVentaConfirmada: number;
  totalPasajeros: number;
  comisionPctSnapshot?: number | null;
  items: Array<{
    vendido: boolean;
    costoCotizado?: number | null;
    costoFinal?: number | null;
  }>;
}): LiquidacionCalculation {
  const soldItems = input.items.filter((item) => item.vendido);
  const totalCostoReal = soldItems.reduce((acc, item) => acc + (item.costoFinal ?? 0), 0);
  const diferenciaCotizadoVsReal = soldItems.reduce((acc, item) => {
    const cotizado = item.costoCotizado ?? 0;
    const real = item.costoFinal ?? cotizado;
    return acc + (real - cotizado);
  }, 0);
  const utilidadBrutaTotal = input.totalVentaConfirmada - totalCostoReal;

  return {
    totalVentaConfirmada: input.totalVentaConfirmada,
    totalCostoReal,
    utilidadBrutaTotal,
    utilidadPorPersona: input.totalPasajeros > 0 ? utilidadBrutaTotal / input.totalPasajeros : null,
    valorAgencia:
      input.comisionPctSnapshot !== undefined && input.comisionPctSnapshot !== null
        ? (input.totalVentaConfirmada * input.comisionPctSnapshot) / 100
        : null,
    diferenciaCotizadoVsReal
  };
}
