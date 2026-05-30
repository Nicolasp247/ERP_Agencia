/* erp-tour-operator/backend/src/modules/tarifa/mapper/tarifa.mapper.ts */

function formatDateOnly(value: Date | string | null | undefined) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

export function toTarifaListItem(record: any) {
  return {
    id: record.id,
    idServicio: record.idServicio,

    servicio: record.servicio?.nombreWtravel ?? "N/D",
    tipoServicio: record.servicio?.tipo?.nombre ?? "N/D",
    tipoServicioCodigo: record.servicio?.tipo?.codigo ?? null,
    proveedor: record.servicio?.proveedor?.nombreComercial ?? "N/D",
    ciudad: record.servicio?.ciudad?.nombre ?? "N/D",

    fechaDesde: formatDateOnly(record.fechaDesde),
    fechaHasta: formatDateOnly(record.fechaHasta),

    tipoTarifa: record.tipoTarifa,
    unidadPrecio: record.unidadPrecio,

    precioNeto: record.precioNeto?.toString?.() ?? String(record.precioNeto ?? ""),
    monedaCodigo: record.monedaCodigo,

    activo: record.activo,
    observaciones: record.observaciones ?? null,
    fechaRevision: formatDateOnly(record.fechaRevision),

    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
}