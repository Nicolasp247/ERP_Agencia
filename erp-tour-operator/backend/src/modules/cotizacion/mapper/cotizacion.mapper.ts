/* erp-tour-operator/backend/src/modules/cotizacion/mapper/cotizacion.mapper.ts */

import { buildCotizacionCode, calculateCotizacionTotals } from "@/modules/cotizacion/service/cotizacion.calculator";

export function toCotizacionListItem(
  record: {
    id: number;
    nombreCotizacion: string;
    estado: string;
    fechaViajePrincipal: Date;
    totalPasajeros: number;
    createdAt: Date;
    cliente: { id: number; nombreCompleto: string };
    clienteAgente: { id: number; razonSocial: string } | null;
    destinoPrincipal: { id: number; nombre: string } | null;
    items: Array<{
      esOpcional: boolean;
      precioSugerido: { toString(): string } | null;
      precioVenta: { toString(): string } | null;
    }>;
  }
) {
  const totals = calculateCotizacionTotals(
    record.items.map((item) => ({
      esOpcional: item.esOpcional,
      precioSugerido: item.precioSugerido ? Number(item.precioSugerido.toString()) : 0,
      precioVenta: item.precioVenta ? Number(item.precioVenta.toString()) : 0
    })),
    record.totalPasajeros
  );

  return {
    id: record.id,
    codigo: buildCotizacionCode(record.id),
    nombreCotizacion: record.nombreCotizacion,
    estado: record.estado,
    fechaViajePrincipal: record.fechaViajePrincipal,
    totalPasajeros: record.totalPasajeros,
    createdAt: record.createdAt,
    cliente: record.cliente,
    clienteAgente: record.clienteAgente,
    destinoPrincipal: record.destinoPrincipal,
    totalVenta: totals.totalVenta
  };
}

export function toCotizacionDetail(
  record: {
    id: number;
    nombreCotizacion: string;
    estado: string;
    fechaViajePrincipal: Date;
    categoriaViaje: string | null;
    monedaCodigo: string;
    presupuestoEstimado: { toString(): string } | null;
    presupuestoTipo: string | null;
    comisionPctAplicada: { toString(): string } | null;
    margenAplicadoValor: { toString(): string } | null;
    adultos65: number;
    adultos1964: number;
    jovenes1218: number;
    ninos311: number;
    infantes02: number;
    totalPasajeros: number;
    nota: string | null;
    fechaDescartada: Date | null;
    fechaConvertidaReserva: Date | null;
    cliente: { id: number; nombreCompleto: string };
    clienteAgente: { id: number; razonSocial: string } | null;
    destinoPrincipal: { id: number; nombre: string } | null;
    items: Array<{
      id: number;
      fechaServicio: Date;
      ordenDia: number;
      esOpcional: boolean;
      operadorMostrado: string | null;
      linkOperador: string | null;
      tituloOverride: string | null;
      claseOverride: string | null;
      idiomaOverride: string | null;
      notaLinea: string | null;
      precioSugerido: { toString(): string } | null;
      precioVenta: { toString(): string } | null;
      precioMonedaCodigo: string;
      precioEditadoManual: boolean;
      servicio: {
        id: number;
        nombreWtravel: string;
        tipo: { nombre: string };
        ciudad: { nombre: string };
      };
    }>;
  }
) {
  const totals = calculateCotizacionTotals(
    record.items.map((item) => ({
      esOpcional: item.esOpcional,
      precioSugerido: item.precioSugerido ? Number(item.precioSugerido.toString()) : 0,
      precioVenta: item.precioVenta ? Number(item.precioVenta.toString()) : 0
    })),
    record.totalPasajeros
  );

  return {
    id: record.id,
    codigo: buildCotizacionCode(record.id),
    nombreCotizacion: record.nombreCotizacion,
    estado: record.estado,
    fechaViajePrincipal: record.fechaViajePrincipal,
    categoriaViaje: record.categoriaViaje,
    monedaCodigo: record.monedaCodigo,
    presupuestoEstimado: record.presupuestoEstimado?.toString() ?? null,
    presupuestoTipo: record.presupuestoTipo,
    comisionPctAplicada: record.comisionPctAplicada?.toString() ?? null,
    margenAplicadoValor: record.margenAplicadoValor?.toString() ?? null,
    adultos65: record.adultos65,
    adultos1964: record.adultos1964,
    jovenes1218: record.jovenes1218,
    ninos311: record.ninos311,
    infantes02: record.infantes02,
    totalPasajeros: record.totalPasajeros,
    nota: record.nota,
    fechaDescartada: record.fechaDescartada,
    fechaConvertidaReserva: record.fechaConvertidaReserva,
    cliente: record.cliente,
    clienteAgente: record.clienteAgente,
    destinoPrincipal: record.destinoPrincipal,
    items: record.items.map((item) => ({
      ...item,
      precioSugerido: item.precioSugerido?.toString() ?? null,
      precioVenta: item.precioVenta?.toString() ?? null
    })),
    totales: totals
  };
}
