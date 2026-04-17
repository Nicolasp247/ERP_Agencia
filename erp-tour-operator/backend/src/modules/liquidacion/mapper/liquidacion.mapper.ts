export function toLiquidacionResponse(record: {
  id: number;
  idReserva: number;
  totalVentaConfirmada: { toString(): string };
  totalCostoReal: { toString(): string };
  utilidadBrutaTotal: { toString(): string };
  utilidadPorPersona: { toString(): string } | null;
  valorAgencia: { toString(): string } | null;
  diferenciaCotizadoVsReal: { toString(): string } | null;
  monedaCodigo: string;
  estadoCierre: string;
  fechaCalculo: Date;
  fechaCierre: Date | null;
}) {
  return {
    id: record.id,
    idReserva: record.idReserva,
    totalVentaConfirmada: record.totalVentaConfirmada.toString(),
    totalCostoReal: record.totalCostoReal.toString(),
    utilidadBrutaTotal: record.utilidadBrutaTotal.toString(),
    utilidadPorPersona: record.utilidadPorPersona?.toString() ?? null,
    valorAgencia: record.valorAgencia?.toString() ?? null,
    diferenciaCotizadoVsReal: record.diferenciaCotizadoVsReal?.toString() ?? null,
    monedaCodigo: record.monedaCodigo,
    estadoCierre: record.estadoCierre,
    fechaCalculo: record.fechaCalculo,
    fechaCierre: record.fechaCierre
  };
}
