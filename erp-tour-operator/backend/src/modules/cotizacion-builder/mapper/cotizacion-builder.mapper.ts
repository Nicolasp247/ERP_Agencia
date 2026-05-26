/* erp-tour-operator/backend/src/modules/cotizacion-builder/mapper/cotizacion-builder.mapper.ts */

function formatDateOnly(value: Date | string | null | undefined) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

function addDaysToDate(value: Date | string | null | undefined, days: number) {
  if (!value) return null;

  const date = value instanceof Date ? new Date(value) : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(0, 0, 0, 0);

  return formatDateOnly(date);
}

function getTipoServicioNombre(item: any) {
  return item.servicio?.tipo?.nombre ?? "";
}

function getTipoServicioCodigo(item: any) {
  return item.servicio?.tipo?.codigo ?? null;
}

function getFechaFinAlojamiento(item: any) {
  const noches = Number(item.servicio?.alojamiento?.noches ?? 0);

  if (!noches) {
    return formatDateOnly(item.fechaServicio);
  }

  return addDaysToDate(item.fechaServicio, noches);
}

function buildVersionLabel(versionCodigo?: string | null) {
  return `Cotización ${versionCodigo ?? "A"}`;
}

function getServicioIncluido(item: any) {
  return item.tituloOverride || item.servicio?.nombreWtravel || "Servicio sin nombre";
}

export function toCotizacionBuilderDetail(record: any) {
  return {
    version: {
      id: record.id,
      idExpediente: record.idExpediente,
      versionNumero: record.versionNumero,
      versionCodigo: record.versionCodigo,
      versionLabel: buildVersionLabel(record.versionCodigo),
      estadoVersion: record.estadoVersion,
      nombreCotizacion: record.nombreCotizacion,
      monedaCodigo: record.monedaCodigo
    },

    expediente: {
      id: record.expediente.id,
      codigo: record.expediente.codigo,
      nombreExpediente: record.expediente.nombreExpediente,
      estado: record.expediente.estado,
      fechaViajePrincipal: formatDateOnly(record.expediente.fechaViajePrincipal),
      totalPasajeros: record.expediente.totalPasajeros,
      monedaCodigo: record.expediente.monedaCodigo,
      cliente: record.expediente.cliente,
      clienteAgente: record.expediente.clienteAgente,
      destinoPrincipal: record.expediente.destinoPrincipal
    },

    columns: (record.columnas ?? [])
      .filter((column: any) => column.activo)
      .map((column: any) => ({
        id: column.id,
        grupo: column.grupo,
        nombre: column.nombre,
        tipo: column.tipo,
        unidad: column.unidad,
        multiplicador: column.multiplicador,
        orden: column.orden
      })),

    rows: (record.items ?? []).map((item: any) => ({
      id: item.id,
      idServicio: item.idServicio,
      fecha: formatDateOnly(item.fechaServicio),
      fechaFin: getFechaFinAlojamiento(item),
      ordenDia: item.ordenDia,
      servicioIncluido: getServicioIncluido(item),
      operador:
        item.servicio?.proveedor?.codigo ||
        item.operadorMostrado ||
        item.servicio?.proveedor?.nombreComercial ||
        "N/D",
      linkReserva: item.servicio?.linkReserva ?? null,
      notas: item.notaLinea ?? "",
      esOpcional: item.esOpcional,
      tipoServicio: getTipoServicioNombre(item),
      tipoServicioCodigo: getTipoServicioCodigo(item),
      ciudadNombre: item.servicio?.ciudad?.nombre ?? null,
      paisNombre: item.servicio?.ciudad?.pais?.nombre ?? null,
      precios: (item.precios ?? []).map((precio: any) => ({
        columnId: precio.idCotizacionColumna,
        precioNeto: precio.precioNeto === null || precio.precioNeto === undefined
          ? null
          : Number(precio.precioNeto)
      }))
    }))
  };
}