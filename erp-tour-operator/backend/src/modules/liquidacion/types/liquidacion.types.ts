export type LiquidacionCalculation = {
  totalVentaConfirmada: number;
  totalCostoReal: number;
  utilidadBrutaTotal: number;
  utilidadPorPersona: number | null;
  valorAgencia: number | null;
  diferenciaCotizadoVsReal: number;
};
