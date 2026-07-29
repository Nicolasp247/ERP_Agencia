// erp-tour-operator/backend/src/modules/contabilidad/compras-proveedor/dto/compras-proveedor.dto.ts

import { buildServicioCotizacionTexto } from "@/modules/servicio/helpers/servicio-display.helper";

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

function numberOrNull(
  value: unknown
) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function getServiceText(
  item: any
) {
  if (
    item.tituloSnapshot?.trim()
  ) {
    return item.tituloSnapshot.trim();
  }

  return buildServicioCotizacionTexto(
    item.servicio
  );
}

export function toCompraProveedorDetail(
  record: any
) {
  const payments = (
    record.pagos ?? []
  ).map((payment: any) => ({
    id: payment.id,

    tipo: payment.tipo,
    estado: payment.estado,

    fechaCargo:
      formatDateOnly(
        payment.fechaCargo
      ),

    valorMonedaOriginal:
      numberOrNull(
        payment.valorMonedaOriginal
      ),

    monedaOriginal:
      payment.monedaOriginal,

    valorCop:
      numberOrNull(
        payment.valorCop
      ),

    tasaCambio:
      numberOrNull(
        payment.tasaCambio
      ),

    metodoPago:
      payment.metodoPago ?? null,

    referenciaPago:
      payment.referenciaPago ?? null,

    nota:
      payment.nota ?? null
  }));

  const totalPagado =
    payments.reduce(
      (
        total: number,
        payment: any
      ) => {
        if (
          payment.estado !==
            "REGISTRADO" ||
          payment.tipo !== "PAGO"
        ) {
          return total;
        }

        return (
          total +
          Number(
            payment
              .valorMonedaOriginal ?? 0
          )
        );
      },
      0
    );

  const totalReembolsado =
    payments.reduce(
      (
        total: number,
        payment: any
      ) => {
        if (
          payment.estado !==
            "REGISTRADO" ||
          payment.tipo !==
            "REEMBOLSO"
        ) {
          return total;
        }

        return (
          total +
          Number(
            payment
              .valorMonedaOriginal ?? 0
          )
        );
      },
      0
    );

  const valorContratado =
    numberOrNull(
      record.valorContratado
    );

  const saldoPendiente =
    valorContratado === null
      ? null
      : valorContratado -
        totalPagado +
        totalReembolsado;

  return {
    id: record.id,

    codigoInterno:
      record.codigoInterno,

    codigoProveedor:
      record.codigoProveedor ?? null,

    esVigente:
      record.esVigente,

    estadoOperativo:
      record.estadoOperativo,

    estadoFinanciero:
      record.estadoFinanciero,

    proveedor:
      record.proveedor
        ? {
            id:
              record.proveedor.id,

            codigo:
              record.proveedor
                .codigo ?? null,

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
          : null,

      clienteAgente:
        record.reserva
          .clienteAgente
          ? {
              id:
                record.reserva
                  .clienteAgente.id,

              codigo:
                record.reserva
                  .clienteAgente
                  .codigo ?? null,

              razonSocial:
                record.reserva
                  .clienteAgente
                  .razonSocial
            }
          : null
    },

    reservaAnterior:
      record.reservaAnterior ?? null,

    reservaReemplazo:
      record.reservaReemplazo ?? null,

    fechaReserva:
      formatDateOnly(
        record.fechaReserva
      ),

    fechaConfirmacion:
      formatDateOnly(
        record.fechaConfirmacion
      ),

    fechaPrevistaCobro:
      formatDateOnly(
        record.fechaPrevistaCobro
      ),

    fechaLimiteCancelacion:
      formatDateOnly(
        record.fechaLimiteCancelacion
      ),

    fechaCancelacion:
      formatDateOnly(
        record.fechaCancelacion
      ),

    fechaRealizacion:
      formatDateOnly(
        record.fechaRealizacion
      ),

    tipoCancelacion:
      record.tipoCancelacion ?? null,

    valorContratado,

    monedaCodigo:
      record.monedaCodigo,

    totalPagado,
    totalReembolsado,
    saldoPendiente,

    motivoCancelacion:
      record.motivoCancelacion ?? null,

    notaAdministrativa:
      record.notaAdministrativa ?? "",

    items: (
      record.items ?? []
    ).map((link: any) => {
      const item =
        link.reservaItem;

      const column =
        link
          .reservaColumnaSeleccionada;

      return {
        id:
          link.id,

        idReservaItem:
          item.id,

        fechaServicio:
          formatDateOnly(
            item.fechaServicio
          ),

        servicio:
          getServiceText(item),

        esOpcional:
          item.esOpcional,

        valorAsignado:
          numberOrNull(
            link.valorAsignado
          ),

        esPrincipal:
          link.esPrincipal,

        columna:
          column
            ? {
                id:
                  column.id,

                grupo:
                  column
                    .grupoSnapshot,

                nombre:
                  column
                    .nombreSnapshot,

                tipo:
                  column
                    .tipoSnapshot,

                unidad:
                  column
                    .unidadSnapshot,

                multiplicador:
                  Number(
                    column
                      .multiplicadorSnapshot
                  ),

                label:
                  `${column.grupoSnapshot} ${column.nombreSnapshot}`
                    .replaceAll(
                      "*",
                      " estrellas"
                    )
                    .replace(
                      /\s+/g,
                      " "
                    )
                    .trim()
              }
            : null
      };
    }),

    pagos:
      payments,

    eventos: (
      record.eventos ?? []
    ).map((event: any) => ({
      id:
        event.id,

      tipo:
        event.tipo,

      descripcion:
        event.descripcion ?? null,

      datosAnteriores:
        event.datosAnteriores ??
        null,

      datosNuevos:
        event.datosNuevos ??
        null,

      idUsuario:
        event.idUsuario ?? null,

      createdAt:
        event.createdAt
    })),

    createdAt:
      record.createdAt,

    updatedAt:
      record.updatedAt
  };
}

export function toCompraProveedorHistory(
  records: any[]
) {
  const reservations =
    records.map(
      toCompraProveedorDetail
    );

  return {
    vigente:
      reservations.find(
        (reservation) =>
          reservation.esVigente
      ) ?? null,

    total:
      reservations.length,

    historial:
      reservations
  };
}