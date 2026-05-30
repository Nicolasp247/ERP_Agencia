/* erp-tour-operator/backend/src/modules/alojamiento-precio/mapper/alojamiento-precio.mapper.ts */

const CATEGORIA_LABELS: Record<string, string> = {
  H3_ECONOMICO: "Turista (3*)",
  H3_SUPERIOR: "Turista Superior (3+*)",
  H4_ECONOMICO: "Primera (4*)",
  H4_SUPERIOR: "Primera Superior (4+*)",
  H5_ECONOMICO: "Lujo (5*)",
  H5_SUPERIOR: "Lujo Superior (5+*)",
  LUJO_ECONOMICO: "Super Lujo",
  LUJO_SUPERIOR: "Super Lujo Superior",
  OTRO: "Otro"
};

const CATEGORIA_HAB_LABELS: Record<string, string> = {
  ESTANDAR: "Estándar",
  SUPERIOR: "Superior",
  SUITE: "Suite",
  OTRO: "Otro"
};

const REGIMEN_LABELS: Record<string, string> = {
  SOLO_ALOJAMIENTO: "Solo alojamiento",
  ALOJAMIENTO_DESAYUNO: "Alojamiento y desayuno",
  TODO_INCLUIDO: "Todo incluido",
  OTRO: "Otro"
};

const TIPO_HABITACION_LABELS: Record<string, string> = {
  SGL: "Sencilla",
  DBL: "Doble",
  TPL: "Triple",
  CPL: "Cuádruple"
};

function formatDateOnly(value: Date | string | null | undefined) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

export function toAlojamientoPrecioListItem(record: any) {
  return {
    id: record.id,

    idCiudad: record.idCiudad,
    ciudad: record.ciudad?.nombre ?? "N/D",
    pais: record.ciudad?.pais?.nombre ?? null,

    categoria: record.categoria,
    categoriaLabel: CATEGORIA_LABELS[record.categoria] ?? record.categoria,

    categoriaHab: record.categoriaHab,
    categoriaHabLabel: CATEGORIA_HAB_LABELS[record.categoriaHab] ?? record.categoriaHab,

    regimen: record.regimen,
    regimenLabel: REGIMEN_LABELS[record.regimen] ?? record.regimen,

    fechaDesde: formatDateOnly(record.fechaDesde),
    fechaHasta: formatDateOnly(record.fechaHasta),

    tipoHabitacion: record.tipoHabitacion,
    tipoHabitacionLabel:
      TIPO_HABITACION_LABELS[record.tipoHabitacion] ?? record.tipoHabitacion,

    precioUsd:
      record.precioUsd === null || record.precioUsd === undefined
        ? null
        : Number(record.precioUsd),

    monedaCodigo: record.monedaCodigo,
    activo: record.activo,

    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
}