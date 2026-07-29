// erp-tour-operator/backend/src/modules/contabilidad/compras-proveedor/mapper/compras-proveedor-list.mapper.ts

function formatDateOnly(
  value:
    | Date
    | string
    | null
    | undefined
) {
  if (!value) {
    return null;
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date
    .toISOString()
    .slice(0, 10);
}

function numberOrZero(
  value: unknown
) {
  const parsed =
    Number(value ?? 0);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function getServiceText(
  item: any
) {
  if (
    item?.tituloSnapshot?.trim()
  ) {
    return item.tituloSnapshot.trim();
  }

  const serviceType =
    item?.servicio?.tipo?.nombre ??
    "Servicio";

  const city =
    item?.servicio?.ciudad?.nombre;

  return city
    ? `${serviceType} en ${city}`
    : serviceType;
}

export function toCompraProveedorListItem(
  record: any
) {
  const totalPagado =
    (record.pagos ?? []).reduce(
      (
        total: number,
        payment: any
      ) =>
        payment.estado === "REGISTRADO" &&
        (
          payment.tipo === "PAGO" ||
          payment.tipo === "AJUSTE"
        )
          ? total +
            numberOrZero(
              payment.valorMonedaOriginal
            )
          : total,
      0
    );

  const totalReembolsado =
    (record.pagos ?? []).reduce(
      (
        total: number,
        payment: any
      ) =>
        payment.estado === "REGISTRADO" &&
        payment.tipo === "REEMBOLSO"
          ? total +
            numberOrZero(
              payment.valorMonedaOriginal
            )
          : total,
      0
    );

  const valorContratado =
    record.valorContratado === null
      ? null
      : numberOrZero(
          record.valorContratado
        );

  const saldoPendiente =
    valorContratado === null
      ? null
      : valorContratado -
        totalPagado +
        totalReembolsado;

  const principalLink =
    record.items?.find(
      (link: any) =>
        link.esPrincipal
    ) ??
    record.items?.[0] ??
    null;

  const serviceItem =
    principalLink?.reservaItem ??
    null;

  return {
    id:
      record.id,

    codigoInterno:
      record.codigoInterno,

    codigoProveedor:
      record.codigoProveedor ??
      null,

    estadoOperativo:
      record.estadoOperativo,

    estadoFinanciero:
      record.estadoFinanciero,

    esVigente:
      Boolean(record.esVigente),

    fechaReserva:
      formatDateOnly(
        record.fechaReserva
      ),

    fechaPrevistaCobro:
      formatDateOnly(
        record.fechaPrevistaCobro
      ),

    fechaLimiteCancelacion:
      formatDateOnly(
        record.fechaLimiteCancelacion
      ),

    fechaServicio:
      formatDateOnly(
        serviceItem?.fechaServicio
      ),

    proveedor:
      record.proveedor
        ? {
            id:
              record.proveedor.id,

            codigo:
              record.proveedor.codigo ??
              null,

            nombreComercial:
              record.proveedor
                .nombreComercial ??
              null
          }
        : null,

    expediente: {
      id:
        record.reserva
          .cotizacionOrigen
          .expediente.id,

      codigo:
        record.reserva
          .cotizacionOrigen
          .expediente.codigo,

      nombre:
        record.reserva
          .cotizacionOrigen
          .expediente
          .nombreExpediente
    },

    reserva: {
      id:
        record.reserva.id,

      codigoReserva:
        record.reserva
          .codigoReserva,

      cliente:
        record.reserva.cliente
          ? {
              id:
                record.reserva
                  .cliente.id,

              nombreCompleto:
                record.reserva
                  .cliente
                  .nombreCompleto
            }
          : null
    },

    servicio:
      getServiceText(
        serviceItem
      ),

    valorContratado,
    totalPagado,
    totalReembolsado,
    saldoPendiente,

    monedaCodigo:
      record.monedaCodigo
  };
}

export function toCompraProveedorList(
  records: any[],
  total: number,
  page: number,
  pageSize: number
) {
  return {
    items:
      records.map(
        toCompraProveedorListItem
      ),

    page,
    pageSize,
    total,

    totalPages:
      Math.ceil(
        total / pageSize
      )
  };
}