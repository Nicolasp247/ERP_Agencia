/* erp-tour-operator/backend/src/modules/cotizacion-builder/mapper/cotizacion-builder.mapper.ts */

function formatDateOnly(value: Date | string | null | undefined) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
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
      fecha: formatDateOnly(item.fechaServicio),
      servicioIncluido: getServicioIncluido(item),
      operador: item.operadorMostrado || item.servicio?.proveedor?.nombreComercial || "N/D",
      notas: item.notaLinea ?? "",
      esOpcional: item.esOpcional,
      precios: (item.precios ?? []).map((precio: any) => ({
        columnId: precio.idCotizacionColumna,
        precioNeto: precio.precioNeto === null || precio.precioNeto === undefined
          ? null
          : Number(precio.precioNeto)
      }))
    }))
  };
}