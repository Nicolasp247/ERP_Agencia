// erp-tour-operator/backend/src/modules/contabilidad/compras-proveedor/repository/compras-proveedor-create.repository.ts

export function getColumnLabel(
  column: any
) {
  return `${column.grupoSnapshot} ${column.nombreSnapshot}`
    .replaceAll("*", " estrellas")
    .replace(/\s+/g, " ")
    .trim();
}

export function mapConfirmacionColumns(
  record: any
) {
  return (
    record.columnasSeleccionadas ?? []
  ).map((column: any) => ({
    id: column.id,

    idCotizacionColumnaOrigen:
      column.idCotizacionColumnaOrigen,

    grupo:
      column.grupoSnapshot,

    nombre:
      column.nombreSnapshot,

    tipo:
      column.tipoSnapshot,

    unidad:
      column.unidadSnapshot,

    multiplicador:
      column.multiplicadorSnapshot,

    precioMostradoFormula:
      column
        .precioMostradoFormulaSnapshot ??
      null,

    precioMostradoValor:
      column
        .precioMostradoValorSnapshot ===
        null ||
      column
        .precioMostradoValorSnapshot ===
        undefined
        ? null
        : Number(
            column
              .precioMostradoValorSnapshot
          ),

    orden:
      column.orden,

    label:
      getColumnLabel(column)
  }));
}

export function mapConfirmacionOptionColumns(
  record: any
) {
  return (
    record.columnas ?? []
  )
    .filter(
      (column: any) =>
        column.activo
    )
    .map((column: any) => ({
      id: column.id,
      grupo: column.grupo,
      nombre: column.nombre,
      tipo: column.tipo,
      unidad: column.unidad,

      multiplicador:
        column.multiplicador,

      orden:
        column.orden,

      label:
        `${column.grupo} ${column.nombre}`
          .replace(/\s+/g, " ")
          .trim()
    }));
}