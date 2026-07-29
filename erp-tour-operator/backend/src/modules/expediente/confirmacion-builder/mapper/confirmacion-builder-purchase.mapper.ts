// erp-tour-operator/backend/src/modules/contabilidad/compras-proveedor/repository/compras-proveedor-create.repository.ts

import { formatDateOnly } from "@/modules/expediente/confirmacion-builder/mapper/confirmacion-builder-date.mapper";

function mapSelectedColumn(
  selectedColumn: any
) {
  if (!selectedColumn) {
    return null;
  }

  const multiplicador = Math.max(
    Number(
      selectedColumn
        .multiplicadorSnapshot ?? 1
    ),
    1
  );

  return {
    id:
      selectedColumn.id,

    grupo:
      selectedColumn.grupoSnapshot,

    nombre:
      selectedColumn.nombreSnapshot,

    tipo:
      selectedColumn.tipoSnapshot,

    unidad:
      selectedColumn.unidadSnapshot,

    multiplicador,

    orden:
      selectedColumn.orden,

    label:
      `${selectedColumn.grupoSnapshot} ${selectedColumn.nombreSnapshot}`
        .replaceAll("*", " estrellas")
        .replace(/\s+/g, " ")
        .trim()
  };
}

function getSelectedPrice(
  item: any,
  selectedColumn: any
) {
  if (!selectedColumn) {
    return null;
  }

  return (
    item.preciosSeleccionados?.find(
      (price: any) =>
        price.idReservaColumnaSeleccionada ===
        selectedColumn.id
    ) ?? null
  );
}

function getQuotedComparisonPrice(
  selectedPrice: any
) {
  if (
    selectedPrice?.precioConfirmado !== null &&
    selectedPrice?.precioConfirmado !==
      undefined
  ) {
    return Number(
      selectedPrice.precioConfirmado
    );
  }

  if (
    selectedPrice?.precioCotizado !== null &&
    selectedPrice?.precioCotizado !==
      undefined
  ) {
    return Number(
      selectedPrice.precioCotizado
    );
  }

  return null;
}

function comparePurchasePrice(
  unitValue: number | null,
  quotedValue: number | null
) {
  if (
    unitValue === null ||
    quotedValue === null
  ) {
    return null;
  }

  return unitValue <= quotedValue
    ? "MENOR_IGUAL" as const
    : "MAYOR" as const;
}

export function mapNuevaReservaProveedor(
  item: any
) {
  const links =
    item.reservasProveedorItems ?? [];

  const activeLink =
    links.find(
      (link: any) =>
        link.proveedorReserva?.esVigente
    ) ?? null;

  if (!activeLink?.proveedorReserva) {
    return null;
  }

  const booking =
    activeLink.proveedorReserva;

  const selectedColumn =
    activeLink
      .reservaColumnaSeleccionada ??
    null;

  const column =
    mapSelectedColumn(selectedColumn);

  const valorContratado =
    booking.valorContratado === null ||
    booking.valorContratado === undefined
      ? null
      : Number(
          booking.valorContratado
        );

  const valorContratadoUnidad =
    valorContratado === null
      ? null
      : valorContratado /
        Math.max(
          Number(
            column?.multiplicador ?? 1
          ),
          1
        );

  const selectedPrice =
    getSelectedPrice(
      item,
      selectedColumn
    );

  const precioCotizadoComparacion =
    getQuotedComparisonPrice(
      selectedPrice
    );

  const historial = links
    .map(
      (link: any) =>
        link.proveedorReserva
    )
    .filter(Boolean)
    .sort(
      (left: any, right: any) =>
        new Date(
          right.createdAt
        ).getTime() -
        new Date(
          left.createdAt
        ).getTime()
    );

  return {
    id:
      booking.id,

    codigoInterno:
      booking.codigoInterno,

    codigoProveedor:
      booking.codigoProveedor ?? null,

    proveedor:
      booking.proveedor
        ? {
            id:
              booking.proveedor.id,

            codigo:
              booking.proveedor.codigo ??
              null,

            nombreComercial:
              booking.proveedor
                .nombreComercial ?? null
          }
        : null,

    estadoOperativo:
      booking.estadoOperativo,

    estadoFinanciero:
      booking.estadoFinanciero,

    esVigente:
      Boolean(booking.esVigente),

    fechaReserva:
      formatDateOnly(
        booking.fechaReserva
      ),

    fechaConfirmacion:
      formatDateOnly(
        booking.fechaConfirmacion
      ),

    fechaPrevistaCobro:
      formatDateOnly(
        booking.fechaPrevistaCobro
      ),

    fechaLimiteCancelacion:
      formatDateOnly(
        booking.fechaLimiteCancelacion
      ),

    fechaCancelacion:
      formatDateOnly(
        booking.fechaCancelacion
      ),

    fechaRealizacion:
      formatDateOnly(
        booking.fechaRealizacion
      ),

    tipoCancelacion:
      booking.tipoCancelacion ?? null,

    columnaSeleccionada:
      column,

    valorContratado,

    valorContratadoUnidad,

    precioCotizadoComparacion,

    resultadoComparacion:
      comparePurchasePrice(
        valorContratadoUnidad,
        precioCotizadoComparacion
      ),

    monedaCodigo:
      booking.monedaCodigo,

    motivoCancelacion:
      booking.motivoCancelacion ?? null,

    notaAdministrativa:
      booking.notaAdministrativa ?? "",

    historialCantidad:
      historial.length,

    historial:
      historial.map(
        (historyItem: any) => ({
          id:
            historyItem.id,

          codigoInterno:
            historyItem.codigoInterno,

          codigoProveedor:
            historyItem.codigoProveedor ??
            null,

          estadoOperativo:
            historyItem.estadoOperativo,

          estadoFinanciero:
            historyItem.estadoFinanciero,

          esVigente:
            Boolean(
              historyItem.esVigente
            ),

          fechaReserva:
            formatDateOnly(
              historyItem.fechaReserva
            ),

          fechaCancelacion:
            formatDateOnly(
              historyItem.fechaCancelacion
            ),

          motivoCancelacion:
            historyItem
              .motivoCancelacion ?? null
        })
      )
  };
}

export function mapLegacyCompraProveedor(
  item: any
) {
  const compra =
    item.compraProveedorItem
      ?.compraProveedor;

  if (!compra) {
    return null;
  }

  const selectedColumn =
    compra.reservaColumnaSeleccionada ??
    null;

  const column =
    mapSelectedColumn(selectedColumn);

  const totalPagado =
    compra.totalPagado === null ||
    compra.totalPagado === undefined
      ? null
      : Number(compra.totalPagado);

  const valorPagadoUnidad =
    totalPagado === null
      ? null
      : totalPagado /
        Math.max(
          Number(
            column?.multiplicador ?? 1
          ),
          1
        );

  const selectedPrice =
    getSelectedPrice(
      item,
      selectedColumn
    );

  const precioCotizadoComparacion =
    getQuotedComparisonPrice(
      selectedPrice
    );

  return {
    id:
      compra.id,

    codigoInterno:
      compra.codigoInterno,

    proveedor:
      compra.proveedor
        ? {
            id:
              compra.proveedor.id,

            codigo:
              compra.proveedor.codigo ??
              null,

            nombreComercial:
              compra.proveedor
                .nombreComercial ?? null
          }
        : null,

    codigoConfirmacionProveedor:
      compra.codigoConfirmacionProveedor ??
      null,

    estado:
      compra.estado,

    fechaConfirmacion:
      formatDateOnly(
        compra.fechaConfirmacion
      ),

    tipoCancelacion:
      compra.tipoCancelacion ?? null,

    fechaLimiteCancelacion:
      formatDateOnly(
        compra.fechaLimiteCancelacion
      ),

    columnaSeleccionada:
      column,

    totalPagado,

    valorPagadoUnidad,

    precioCotizadoComparacion,

    resultadoComparacion:
      comparePurchasePrice(
        valorPagadoUnidad,
        precioCotizadoComparacion
      ),

    monedaCodigo:
      compra.monedaCodigo,

    notaAdministrativa:
      compra.notaAdministrativa ?? "",

    pagos:
      (compra.pagos ?? []).map(
        (pago: any) => ({
          id:
            pago.id,

          fechaPago:
            formatDateOnly(
              pago.fechaPago
            ),

          valorMonedaOriginal:
            pago.valorMonedaOriginal ===
              null ||
            pago.valorMonedaOriginal ===
              undefined
              ? null
              : Number(
                  pago.valorMonedaOriginal
                ),

          monedaOriginal:
            pago.monedaOriginal,

          valorCop:
            pago.valorCop === null ||
            pago.valorCop === undefined
              ? null
              : Number(
                  pago.valorCop
                ),

          tasaCambio:
            pago.tasaCambio === null ||
            pago.tasaCambio === undefined
              ? null
              : Number(
                  pago.tasaCambio
                ),

          metodoPago:
            pago.metodoPago ?? null,

          referenciaPago:
            pago.referenciaPago ?? null,

          nota:
            pago.nota ?? null,

          estado:
            pago.estado
        })
      )
  };
}