export function toClienteListItem(
  record: {
    id: number;
    nombreCompleto: string;
    telefono: string | null;
    email: string | null;
    activo: boolean;
    clienteAgente: { id: number; razonSocial: string } | null;
    pais: { nombre: string } | null;
    ciudad: { nombre: string } | null;
    cotizaciones: Array<{ fechaViajePrincipal: Date }>;
  }
) {
  return {
    id: record.id,
    nombreCompleto: record.nombreCompleto,
    telefono: record.telefono,
    email: record.email,
    activo: record.activo,
    clienteAgente: record.clienteAgente,
    pais: record.pais?.nombre ?? null,
    ciudad: record.ciudad?.nombre ?? null,
    proximaFechaViaje: record.cotizaciones[0]?.fechaViajePrincipal ?? null
  };
}

export function toClienteDetail(
  record: {
    id: number;
    nombreCompleto: string;
    telefono: string | null;
    email: string | null;
    activo: boolean;
    observaciones: string | null;
    clienteAgente: { id: number; razonSocial: string } | null;
    pais:
      | {
          id: number;
          nombre: string;
          continente?: {
            id: number;
            nombre: string;
          } | null;
        }
      | null;
    ciudad: { id: number; nombre: string } | null;
    cotizaciones: Array<{
      id: number;
      nombreCotizacion: string;
      estado: string;
      fechaViajePrincipal: Date;
    }>;
    reservas: Array<{
      id: number;
      codigoReserva: string;
      estado: string;
      fechaViajePrincipal: Date;
    }>;
  }
) {
  const historial = [
    ...record.cotizaciones.map((item) => ({
      id: item.id,
      tipo: "COTIZACION" as const,
      referencia: item.nombreCotizacion,
      estado: item.estado,
      fechaViajePrincipal: item.fechaViajePrincipal
    })),
    ...record.reservas.map((item) => ({
      id: item.id,
      tipo: "RESERVA" as const,
      referencia: item.codigoReserva,
      estado: item.estado,
      fechaViajePrincipal: item.fechaViajePrincipal
    }))
  ].sort((a, b) => b.fechaViajePrincipal.getTime() - a.fechaViajePrincipal.getTime());

  return {
    id: record.id,
    nombreCompleto: record.nombreCompleto,
    telefono: record.telefono,
    email: record.email,
    activo: record.activo,
    observaciones: record.observaciones,
    clienteAgente: record.clienteAgente,
    continente: record.pais?.continente ?? null,
    pais: record.pais
      ? {
          id: record.pais.id,
          nombre: record.pais.nombre
        }
      : null,
    ciudad: record.ciudad,
    cotizaciones: record.cotizaciones,
    reservas: record.reservas,
    historial
  };
}
