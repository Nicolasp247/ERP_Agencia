// erp-tour-operator/backend/src/modules/contabilidad/compras-proveedor/repository/compras-proveedor-update.repository.ts

import { Prisma } from "@prisma/client";

import { prisma } from "@/core/db/prisma";

import type { ComprasProveedorUpdateInput } from "@/modules/contabilidad/compras-proveedor/dto/compras-proveedor.dto";

import {
  buildBookingSnapshot,
  toDateOnly,
  todayIsoDate
} from "@/modules/contabilidad/compras-proveedor/repository/compras-proveedor.helpers";

import {
  decimalOrNull,
  getInitialFinancialState
} from "@/modules/contabilidad/compras-proveedor/repository/compras-proveedor-context.repository";

export class ComprasProveedorUpdateRepository {
  async update(
    proveedorReservaId: number,
    data: ComprasProveedorUpdateInput,
    userId?: number | null
  ) {
    return prisma.$transaction(
      async (tx) => {
        const current =
          await tx.proveedorReserva.findUnique({
            where: {
              id: proveedorReservaId
            }
          });

        if (!current) {
          return null;
        }

        if (!current.esVigente) {
          return "RESERVATION_NOT_ACTIVE" as const;
        }

        const before =
          buildBookingSnapshot(current);

        const updateData:
          Prisma.ProveedorReservaUncheckedUpdateInput =
          {
            updatedBy:
              userId ?? null
          };

        if (
          data.codigoProveedor !==
          undefined
        ) {
          updateData.codigoProveedor =
            data.codigoProveedor
              ?.trim() || null;
        }

        if (
          data.estadoOperativo !==
          undefined
        ) {
          updateData.estadoOperativo =
            data.estadoOperativo;

          if (
            data.estadoOperativo ===
              "CONFIRMADA" &&
            !current.fechaConfirmacion &&
            data.fechaConfirmacion ===
              undefined
          ) {
            updateData.fechaConfirmacion =
              toDateOnly(
                todayIsoDate()
              );
          }

          if (
            data.estadoOperativo ===
              "REALIZADA" &&
            !current.fechaRealizacion &&
            data.fechaRealizacion ===
              undefined
          ) {
            updateData.fechaRealizacion =
              toDateOnly(
                todayIsoDate()
              );
          }
        }

        if (
          data.fechaReserva !==
          undefined
        ) {
          updateData.fechaReserva =
            toDateOnly(
              data.fechaReserva
            );
        }

        if (
          data.fechaConfirmacion !==
          undefined
        ) {
          updateData.fechaConfirmacion =
            data.fechaConfirmacion
              ? toDateOnly(
                  data.fechaConfirmacion
                )
              : null;
        }

        if (
          data.fechaPrevistaCobro !==
          undefined
        ) {
          updateData.fechaPrevistaCobro =
            data.fechaPrevistaCobro
              ? toDateOnly(
                  data.fechaPrevistaCobro
                )
              : null;

          if (
            current.estadoFinanciero ===
              "SIN_PAGAR" ||
            current.estadoFinanciero ===
              "PAGO_PROGRAMADO"
          ) {
            updateData.estadoFinanciero =
              getInitialFinancialState(
                data.fechaPrevistaCobro
              );
          }
        }

        if (
          data.tipoCancelacion !==
          undefined
        ) {
          updateData.tipoCancelacion =
            data.tipoCancelacion;
        }

        if (
          data.fechaLimiteCancelacion !==
          undefined
        ) {
          updateData.fechaLimiteCancelacion =
            data.fechaLimiteCancelacion
              ? toDateOnly(
                  data.fechaLimiteCancelacion
                )
              : null;
        }

        if (
          data.fechaRealizacion !==
          undefined
        ) {
          updateData.fechaRealizacion =
            data.fechaRealizacion
              ? toDateOnly(
                  data.fechaRealizacion
                )
              : null;
        }

        if (
          data.valorContratado !==
          undefined
        ) {
          updateData.valorContratado =
            decimalOrNull(
              data.valorContratado
            );
        }

        if (
          data.monedaCodigo !==
          undefined
        ) {
          updateData.monedaCodigo =
            data.monedaCodigo;
        }

        if (
          data.notaAdministrativa !==
          undefined
        ) {
          updateData.notaAdministrativa =
            data.notaAdministrativa
              ?.trim() || null;
        }

        const updated =
          await tx.proveedorReserva.update({
            where: {
              id: proveedorReservaId
            },

            data: updateData
          });

        if (
          data.valorContratado !==
          undefined
        ) {
          await tx.proveedorReservaItem.updateMany({
            where: {
              idProveedorReserva:
                proveedorReservaId,

              esPrincipal: true
            },

            data: {
              valorAsignado:
                decimalOrNull(
                  data.valorContratado
                )
            }
          });
        }

        await tx.proveedorReservaEvento.create({
          data: {
            idProveedorReserva:
              proveedorReservaId,

            idUsuario:
              userId ?? null,

            tipo: "ACTUALIZADA",

            descripcion:
              "Información de la reserva corregida o actualizada",

            datosAnteriores:
              before as Prisma.InputJsonValue,

            datosNuevos:
              buildBookingSnapshot(
                updated
              ) as Prisma.InputJsonValue
          }
        });

        return {
          id: updated.id
        };
      }
    );
  }
}

export const comprasProveedorUpdateRepository =
  new ComprasProveedorUpdateRepository();