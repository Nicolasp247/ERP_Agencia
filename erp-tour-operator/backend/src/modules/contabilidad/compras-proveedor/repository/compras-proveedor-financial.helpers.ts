// erp-tour-operator/backend/src/modules/contabilidad/compras-proveedor/repository/compras-proveedor-financial.helpers.ts

import {
  Prisma,
  type ProveedorReservaEstadoFinanciero
} from "@prisma/client";

import {
  toDateOnly,
  todayIsoDate
} from "@/modules/contabilidad/compras-proveedor/repository/compras-proveedor.helpers";

type RegisteredPayment = {
  tipo: "PAGO" | "REEMBOLSO" | "AJUSTE";
  estado: "REGISTRADO" | "ANULADO";
  valorMonedaOriginal: Prisma.Decimal;
  valorCop: Prisma.Decimal | null;
};

export function decimalOrUndefined(
  value:
    | number
    | null
    | undefined
) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  return new Prisma.Decimal(value);
}

export function resolvePaymentDate(
  value?: string
) {
  return toDateOnly(
    value ?? todayIsoDate()
  );
}

export function buildPaymentSnapshot(
  payment: {
    id: number;
    idProveedorReserva: number;
    tipo: string;
    estado: string;
    fechaCargo: Date;
    valorMonedaOriginal: Prisma.Decimal;
    monedaOriginal: string;
    valorCop: Prisma.Decimal | null;
    tasaCambio: Prisma.Decimal | null;
    metodoPago: string | null;
    referenciaPago: string | null;
    nota: string | null;
  }
) {
  return {
    id: payment.id,
    idProveedorReserva:
      payment.idProveedorReserva,
    tipo: payment.tipo,
    estado: payment.estado,
    fechaCargo:
      payment.fechaCargo
        .toISOString()
        .slice(0, 10),
    valorMonedaOriginal:
      Number(
        payment.valorMonedaOriginal
      ),
    monedaOriginal:
      payment.monedaOriginal,
    valorCop:
      payment.valorCop === null
        ? null
        : Number(payment.valorCop),
    tasaCambio:
      payment.tasaCambio === null
        ? null
        : Number(payment.tasaCambio),
    metodoPago:
      payment.metodoPago,
    referenciaPago:
      payment.referenciaPago,
    nota:
      payment.nota
  };
}

export function calculateFinancialState(
  reservation: {
    valorContratado: Prisma.Decimal | null;
    fechaPrevistaCobro: Date | null;
  },
  payments: RegisteredPayment[]
): ProveedorReservaEstadoFinanciero {
  const registered =
    payments.filter(
      (payment) =>
        payment.estado === "REGISTRADO"
    );

  if (!registered.length) {
    return reservation.fechaPrevistaCobro
      ? "PAGO_PROGRAMADO"
      : "SIN_PAGAR";
  }

  const totalPaid =
    registered.reduce(
      (total, payment) => {
        const amount = Number(
          payment.valorMonedaOriginal
        );

        if (payment.tipo === "PAGO") {
          return total + amount;
        }

        if (payment.tipo === "AJUSTE") {
          return total + amount;
        }

        return total;
      },
      0
    );

  const totalRefunded =
    registered.reduce(
      (total, payment) =>
        payment.tipo === "REEMBOLSO"
          ? total +
            Number(
              payment.valorMonedaOriginal
            )
          : total,
      0
    );

  const netPaid =
    totalPaid - totalRefunded;

  if (
    totalRefunded > 0 &&
    netPaid <= 0
  ) {
    return "REEMBOLSADO";
  }

  const missingCop =
    registered.some(
      (payment) =>
        payment.valorCop === null
    );

  if (missingCop) {
    return "FALTA_COP";
  }

  const contracted =
    reservation.valorContratado === null
      ? null
      : Number(
          reservation.valorContratado
        );

  if (
    contracted !== null &&
    netPaid >= contracted
  ) {
    return "PAGADO";
  }

  if (netPaid > 0) {
    return "PAGO_PARCIAL";
  }

  return reservation.fechaPrevistaCobro
    ? "PAGO_PROGRAMADO"
    : "SIN_PAGAR";
}

export async function refreshFinancialState(
  tx: Prisma.TransactionClient,
  proveedorReservaId: number,
  userId?: number | null
) {
  const reservation =
    await tx.proveedorReserva.findUnique({
      where: {
        id: proveedorReservaId
      },

      select: {
        id: true,
        valorContratado: true,
        fechaPrevistaCobro: true,

        pagos: {
          select: {
            tipo: true,
            estado: true,
            valorMonedaOriginal: true,
            valorCop: true
          }
        }
      }
    });

  if (!reservation) {
    return null;
  }

  const estadoFinanciero =
    calculateFinancialState(
      reservation,
      reservation.pagos
    );

  await tx.proveedorReserva.update({
    where: {
      id: proveedorReservaId
    },

    data: {
      estadoFinanciero,
      updatedBy:
        userId ?? null
    }
  });

  return estadoFinanciero;
}