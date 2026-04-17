export function toReservaListItem(
  record: {
    id: number;
    codigoReserva: string;
    estado: string;
    fechaViajePrincipal: Date;
    createdAt: Date;
    cliente: { id: number; nombreCompleto: string };
    clienteAgente: { id: number; razonSocial: string } | null;
    confirmacionesComerciales: Array<{ totalVentaConfirmada: { toString(): string } }>;
    liquidacion: { totalCostoReal: { toString(): string } | null; utilidadBrutaTotal: { toString(): string } | null } | null;
  }
) {
  return {
    id: record.id,
    codigoReserva: record.codigoReserva,
    estado: record.estado,
    fechaViajePrincipal: record.fechaViajePrincipal,
    createdAt: record.createdAt,
    cliente: record.cliente,
    clienteAgente: record.clienteAgente,
    totalVentaConfirmada: record.confirmacionesComerciales[0]?.totalVentaConfirmada.toString() ?? null,
    totalCostoReal: record.liquidacion?.totalCostoReal?.toString() ?? null,
    utilidad: record.liquidacion?.utilidadBrutaTotal?.toString() ?? null
  };
}

export function toReservaDetail(
  record: {
    id: number;
    codigoReserva: string;
    estado: string;
    confirmacionComercialEstado: string;
    fechaViajePrincipal: Date;
    categoriaViaje: string | null;
    monedaCodigo: string;
    totalPasajeros: number;
    adultos65: number;
    adultos1964: number;
    jovenes1218: number;
    ninos311: number;
    infantes02: number;
    comisionPctSnapshot: { toString(): string } | null;
    nota: string | null;
    fechaConversion: Date;
    fechaCancelacion: Date | null;
    motivoCancelacion: string | null;
    cliente: { id: number; nombreCompleto: string };
    clienteAgente: { id: number; razonSocial: string } | null;
    destinoPrincipal: { id: number; nombre: string } | null;
    cotizacionOrigen: { id: number; nombreCotizacion: string };
    items: Array<{
      id: number;
      fechaServicio: Date;
      ordenDia: number;
      esOpcional: boolean;
      tituloSnapshot: string | null;
      idiomaSnapshot: string | null;
      claseSnapshot: string | null;
      notaLineaSnapshot: string | null;
      costoCotizado: { toString(): string } | null;
      costoFinal: { toString(): string } | null;
      monedaCodigo: string;
      numeroConfirmacion: string | null;
      fechaPrimerConfirmacion: Date | null;
      fechaUltimaConfirmacion: Date | null;
      estadoItem: string;
      servicio: {
        id: number;
        nombreWtravel: string;
        tipo: { nombre: string };
      };
    }>;
    confirmacionesComerciales: Array<{
      id: number;
      version: number;
      estado: string;
      totalVentaConfirmada: { toString(): string };
      monedaCodigo: string;
      fechaConfirmacion: Date;
      items: Array<{
        idReservaItem: number;
        precioVentaConfirmado: { toString(): string };
        esOpcionalVendido: boolean;
      }>;
    }>;
    liquidacion: {
      totalVentaConfirmada: { toString(): string };
      totalCostoReal: { toString(): string };
      utilidadBrutaTotal: { toString(): string };
      utilidadPorPersona: { toString(): string } | null;
      valorAgencia: { toString(): string } | null;
      diferenciaCotizadoVsReal: { toString(): string } | null;
      estadoCierre: string;
      fechaCalculo: Date;
      fechaCierre: Date | null;
    } | null;
  }
) {
  return {
    id: record.id,
    codigoReserva: record.codigoReserva,
    estado: record.estado,
    confirmacionComercialEstado: record.confirmacionComercialEstado,
    fechaViajePrincipal: record.fechaViajePrincipal,
    categoriaViaje: record.categoriaViaje,
    monedaCodigo: record.monedaCodigo,
    totalPasajeros: record.totalPasajeros,
    adultos65: record.adultos65,
    adultos1964: record.adultos1964,
    jovenes1218: record.jovenes1218,
    ninos311: record.ninos311,
    infantes02: record.infantes02,
    comisionPctSnapshot: record.comisionPctSnapshot?.toString() ?? null,
    nota: record.nota,
    fechaConversion: record.fechaConversion,
    fechaCancelacion: record.fechaCancelacion,
    motivoCancelacion: record.motivoCancelacion,
    cliente: record.cliente,
    clienteAgente: record.clienteAgente,
    destinoPrincipal: record.destinoPrincipal,
    cotizacionOrigen: record.cotizacionOrigen,
    items: record.items.map((item) => ({
      ...item,
      costoCotizado: item.costoCotizado?.toString() ?? null,
      costoFinal: item.costoFinal?.toString() ?? null
    })),
    confirmacionesComerciales: record.confirmacionesComerciales.map((confirmation) => ({
      ...confirmation,
      totalVentaConfirmada: confirmation.totalVentaConfirmada.toString(),
      items: confirmation.items.map((item) => ({
        ...item,
        precioVentaConfirmado: item.precioVentaConfirmado.toString()
      }))
    })),
    liquidacion: record.liquidacion
      ? {
          ...record.liquidacion,
          totalVentaConfirmada: record.liquidacion.totalVentaConfirmada.toString(),
          totalCostoReal: record.liquidacion.totalCostoReal.toString(),
          utilidadBrutaTotal: record.liquidacion.utilidadBrutaTotal.toString(),
          utilidadPorPersona: record.liquidacion.utilidadPorPersona?.toString() ?? null,
          valorAgencia: record.liquidacion.valorAgencia?.toString() ?? null,
          diferenciaCotizadoVsReal: record.liquidacion.diferenciaCotizadoVsReal?.toString() ?? null
        }
      : null
  };
}
