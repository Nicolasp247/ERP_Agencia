// erp-tour-operator/backend/src/modules/contabilidad/compras-proveedor/repository/compras-proveedor-payments.repository.ts

import { Prisma } from "@prisma/client";

import { prisma } from "@/core/db/prisma";

import type {
  ComprasProveedorPaymentCreateInput,
  ComprasProveedorPaymentUpdateInput,
  ComprasProveedorPaymentVoidInput
} from "@/modules/contabilidad/compras-proveedor/dto/compras-proveedor.dto";

import {
  buildPaymentSnapshot,
  decimalOrUndefined,
  refreshFinancialState,
  resolvePaymentDate
} from "@/modules/contabilidad/compras-proveedor/repository/compras-proveedor-financial.helpers";

function cleanText(
  value:
    | string
    | null
    | undefined
) {
  if (value === undefined) {
    return undefined;
  }

  return value?.trim() || null;
}

function getEventType(
  paymentType:
    | "PAGO"
    | "REEMBOLSO"
    | "AJUSTE"
) {
  return paymentType === "REEMBOLSO"
    ? "REEMBOLSO_REGISTRADO" as const
    : "PAGO_REGISTRADO" as const;
}

export class ComprasProveedorPaymentsRepository {
  async create(
    proveedorReservaId: number,
    data: ComprasProveedorPaymentCreateInput,
    userId?: number | null
  ) {
    return prisma.$transaction(
      async (tx) => {
        const reservation =
          await tx.proveedorReserva.findUnique({
            where: {
              id: proveedorReservaId
            },

            select: {
              id: true
            }
          });

        if (!reservation) {
          return null;
        }

        const created =
          await tx.proveedorReservaPago.create({
            data: {
              idProveedorReserva:
                proveedorReservaId,

              tipo:
                data.tipo,

              estado:
                "REGISTRADO",

              fechaCargo:
                resolvePaymentDate(
                  data.fechaCargo
                ),

              valorMonedaOriginal:
                new Prisma.Decimal(
                  data.valorMonedaOriginal
                ),

              monedaOriginal:
                data.monedaOriginal,

              valorCop:
                decimalOrUndefined(
                  data.valorCop
                ) ?? null,

              tasaCambio:
                decimalOrUndefined(
                  data.tasaCambio
                ) ?? null,

              metodoPago:
                cleanText(
                  data.metodoPago
                ) ?? null,

              referenciaPago:
                cleanText(
                  data.referenciaPago
                ) ?? null,

              nota:
                cleanText(
                  data.nota
                ) ?? null,

              createdBy:
                userId ?? null,

              updatedBy:
                userId ?? null
            }
          });

        await refreshFinancialState(
          tx,
          proveedorReservaId,
          userId
        );

        await tx.proveedorReservaEvento.create({
          data: {
            idProveedorReserva:
              proveedorReservaId,

            idUsuario:
              userId ?? null,

            tipo:
              getEventType(
                created.tipo
              ),

            descripcion:
              created.tipo === "REEMBOLSO"
                ? "Reembolso registrado"
                : created.tipo === "AJUSTE"
                  ? "Ajuste financiero registrado"
                  : "Pago registrado",

            datosNuevos:
              buildPaymentSnapshot(
                created
              ) as Prisma.InputJsonValue
          }
        });

        return {
          id:
            created.id,
          idProveedorReserva:
            proveedorReservaId
        };
      }
    );
  }

  async update(
    paymentId: number,
    data: ComprasProveedorPaymentUpdateInput,
    userId?: number | null
  ) {
    return prisma.$transaction(
      async (tx) => {
        const current =
          await tx.proveedorReservaPago.findUnique({
            where: {
              id: paymentId
            }
          });

        if (!current) {
          return null;
        }

        if (
          current.estado === "ANULADO"
        ) {
          return "PAYMENT_VOIDED" as const;
        }

        const before =
          buildPaymentSnapshot(current);

        const updateData:
          Prisma.ProveedorReservaPagoUncheckedUpdateInput =
          {
            updatedBy:
              userId ?? null
          };

        if (data.tipo !== undefined) {
          updateData.tipo =
            data.tipo;
        }

        if (
          data.fechaCargo !== undefined
        ) {
          updateData.fechaCargo =
            resolvePaymentDate(
              data.fechaCargo
            );
        }

        if (
          data.valorMonedaOriginal !==
          undefined
        ) {
          updateData.valorMonedaOriginal =
            new Prisma.Decimal(
              data.valorMonedaOriginal
            );
        }

        if (
          data.monedaOriginal !==
          undefined
        ) {
          updateData.monedaOriginal =
            data.monedaOriginal;
        }

        if (
          data.valorCop !== undefined
        ) {
          updateData.valorCop =
            decimalOrUndefined(
              data.valorCop
            );
        }

        if (
          data.tasaCambio !== undefined
        ) {
          updateData.tasaCambio =
            decimalOrUndefined(
              data.tasaCambio
            );
        }

        if (
          data.metodoPago !== undefined
        ) {
          updateData.metodoPago =
            cleanText(
              data.metodoPago
            );
        }

        if (
          data.referenciaPago !== undefined
        ) {
          updateData.referenciaPago =
            cleanText(
              data.referenciaPago
            );
        }

        if (data.nota !== undefined) {
          updateData.nota =
            cleanText(
              data.nota
            );
        }

        const updated =
          await tx.proveedorReservaPago.update({
            where: {
              id: paymentId
            },

            data:
              updateData
          });

        await refreshFinancialState(
          tx,
          current.idProveedorReserva,
          userId
        );

        await tx.proveedorReservaEvento.create({
          data: {
            idProveedorReserva:
              current.idProveedorReserva,

            idUsuario:
              userId ?? null,

            tipo:
              getEventType(
                updated.tipo
              ),

            descripcion:
              "Movimiento financiero actualizado",

            datosAnteriores:
              before as Prisma.InputJsonValue,

            datosNuevos:
              buildPaymentSnapshot(
                updated
              ) as Prisma.InputJsonValue
          }
        });

        return {
          id:
            updated.id,
          idProveedorReserva:
            current.idProveedorReserva
        };
      }
    );
  }

  async void(
    paymentId: number,
    data: ComprasProveedorPaymentVoidInput,
    userId?: number | null
  ) {
    return prisma.$transaction(
      async (tx) => {
        const current =
          await tx.proveedorReservaPago.findUnique({
            where: {
              id: paymentId
            }
          });

        if (!current) {
          return null;
        }

        if (
          current.estado === "ANULADO"
        ) {
          return "PAYMENT_ALREADY_VOIDED" as const;
        }

        const before =
          buildPaymentSnapshot(current);

        const updated =
          await tx.proveedorReservaPago.update({
            where: {
              id: paymentId
            },

            data: {
              estado:
                "ANULADO",

              nota:
                [
                  current.nota,
                  `ANULADO: ${data.motivo}`
                ]
                  .filter(Boolean)
                  .join("\n"),

              updatedBy:
                userId ?? null
            }
          });

        await refreshFinancialState(
          tx,
          current.idProveedorReserva,
          userId
        );

        await tx.proveedorReservaEvento.create({
          data: {
            idProveedorReserva:
              current.idProveedorReserva,

            idUsuario:
              userId ?? null,

            tipo:
              "PAGO_ANULADO",

            descripcion:
              data.motivo,

            datosAnteriores:
              before as Prisma.InputJsonValue,

            datosNuevos:
              buildPaymentSnapshot(
                updated
              ) as Prisma.InputJsonValue
          }
        });

        return {
          id:
            updated.id,
          idProveedorReserva:
            current.idProveedorReserva
        };
      }
    );
  }
}

export const comprasProveedorPaymentsRepository =
  new ComprasProveedorPaymentsRepository();