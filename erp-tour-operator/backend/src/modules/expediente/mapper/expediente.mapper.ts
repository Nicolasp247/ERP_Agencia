/* erp-tour-operator/backend/src/modules/expediente/mapper/expediente.mapper.ts */

function formatDateOnly(value: Date | string | null | undefined) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

export function buildExpedienteCode(id: number) {
  return `EXP-${String(id).padStart(5, "0")}`;
}

export function buildVersionLabel(versionCodigo?: string | null) {
  return `Cotización ${versionCodigo ?? "A"}`;
}

function toExpedienteVersionItem(record: any) {
  return {
    id: record.id,
    idExpediente: record.idExpediente,
    versionNumero: record.versionNumero,
    versionCodigo: record.versionCodigo,
    versionLabel: buildVersionLabel(record.versionCodigo),
    estadoVersion: record.estadoVersion,
    estado: record.estado,
    nombreCotizacion: record.nombreCotizacion,
    fechaViajePrincipal: formatDateOnly(record.fechaViajePrincipal),
    totalPasajeros: record.totalPasajeros,
    createdAt: record.createdAt
  };
}

function toExpedienteConfirmacionItem(cotizacion: any) {
  if (!cotizacion.reserva) {
    return null;
  }

  return {
    id: cotizacion.reserva.id,
    codigoReserva: cotizacion.reserva.codigoReserva,
    estado: cotizacion.reserva.estado,
    confirmacionComercialEstado: cotizacion.reserva.confirmacionComercialEstado,
    fechaViajePrincipal: formatDateOnly(cotizacion.reserva.fechaViajePrincipal),
    fechaConversion: cotizacion.reserva.fechaConversion,
    monedaCodigo: cotizacion.reserva.monedaCodigo,
    totalPasajeros: cotizacion.reserva.totalPasajeros,
    idCotizacionOrigen: cotizacion.id,
    versionNumero: cotizacion.versionNumero,
    versionCodigo: cotizacion.versionCodigo,
    versionLabel: buildVersionLabel(cotizacion.versionCodigo),
    nombreCotizacion: cotizacion.nombreCotizacion,
    createdAt: cotizacion.reserva.createdAt,
    updatedAt: cotizacion.reserva.updatedAt
  };
}

export function toExpedienteListItem(record: any) {
  const versionPrincipal = record.cotizaciones?.[0] ?? null;

  return {
    id: record.id,
    codigo: record.codigo,
    nombreExpediente: record.nombreExpediente,
    estado: record.estado,
    fechaViajePrincipal: formatDateOnly(record.fechaViajePrincipal),
    monedaCodigo: record.monedaCodigo,
    totalPasajeros: record.totalPasajeros,
    cliente: record.cliente,
    clienteAgente: record.clienteAgente,
    destinoPrincipal: record.destinoPrincipal,
    versionPrincipal: versionPrincipal ? toExpedienteVersionItem(versionPrincipal) : null,
    createdAt: record.createdAt
  };
}

export function toExpedienteDetail(record: any) {
  const confirmaciones = (record.cotizaciones ?? [])
    .map(toExpedienteConfirmacionItem)
    .filter(Boolean);
  
  return {
    id: record.id,
    codigo: record.codigo,
    nombreExpediente: record.nombreExpediente,
    estado: record.estado,
    fechaViajePrincipal: formatDateOnly(record.fechaViajePrincipal),
    idDestinoPrincipal: record.idDestinoPrincipal,
    monedaCodigo: record.monedaCodigo,
    adultos65: record.adultos65,
    adultos1964: record.adultos1964,
    jovenes1218: record.jovenes1218,
    ninos311: record.ninos311,
    infantes02: record.infantes02,
    totalPasajeros: record.totalPasajeros,
    observacionesCliente: record.observacionesCliente,
    notasInternas: record.notasInternas,
    cliente: record.cliente,
    clienteAgente: record.clienteAgente,
    destinoPrincipal: record.destinoPrincipal,
    cotizaciones: (record.cotizaciones ?? []).map(toExpedienteVersionItem),
    confirmaciones,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
}