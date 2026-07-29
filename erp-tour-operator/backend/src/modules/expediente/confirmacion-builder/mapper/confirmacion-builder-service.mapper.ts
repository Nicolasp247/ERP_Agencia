// erp-tour-operator/backend/src/modules/contabilidad/compras-proveedor/repository/compras-proveedor-create.repository.ts

import { buildServicioCotizacionTexto } from "@/modules/servicio/helpers/servicio-display.helper";

import { addDaysToDate } from "@/modules/expediente/confirmacion-builder/mapper/confirmacion-builder-date.mapper";

export function getTipoServicioNombre(
  item: any
) {
  return (
    item.servicio?.tipo?.nombre ??
    ""
  );
}

export function getTipoServicioCodigo(
  item: any
) {
  return (
    item.servicio?.tipo?.codigo ??
    null
  );
}

export function isAlojamientoItem(
  item: any
) {
  const tipoNombre = String(
    getTipoServicioNombre(item)
  )
    .trim()
    .toLowerCase();

  const tipoCodigo = String(
    getTipoServicioCodigo(item) ?? ""
  )
    .trim()
    .toLowerCase();

  return (
    tipoNombre === "alojamiento" ||
    tipoCodigo === "alojamiento"
  );
}

export function getFechaFinAlojamiento(
  item: any
) {
  const noches = Number(
    item.cotizacionItemOrigen
      ?.alojamientoDetalle
      ?.noches ?? 1
  );

  return addDaysToDate(
    item.fechaServicio,
    noches
  );
}

export function getServicioIncluido(
  item: any
) {
  if (item.tituloSnapshot?.trim()) {
    return item.tituloSnapshot.trim();
  }

  return buildServicioCotizacionTexto(
    item.servicio
  );
}