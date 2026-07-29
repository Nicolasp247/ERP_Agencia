// erp-tour-operator/backend/src/modules/contabilidad/compras-proveedor/repository/compras-proveedor-create.repository.ts

import { Prisma } from "@prisma/client";

import { prisma } from "@/core/db/prisma";

import type { ComprasProveedorReplaceInput } from "@/modules/contabilidad/compras-proveedor/dto/compras-proveedor.dto";

import {
  buildBookingSnapshot,
  buildProviderBookingCode,
  toDateOnly,
  todayIsoDate
} from "@/modules/contabilidad/compras-proveedor/repository/compras-proveedor.helpers";

import {
  decimalOrNull,
  getInitialFinancialState
} from "@/modules/contabilidad/compras-proveedor/repository/compras-proveedor-context.repository";

export class ComprasProveedorReplaceRepository {
  async replace(
    proveedorReservaId: number,
    data: ComprasProveedorReplaceInput,
    userId?: number | null
  ) {
    return prisma.$transaction(
      async (tx) => {
        const current =
          await tx.proveedorReserva.findUnique({
            where: {
              id: proveedorReservaId
            },

            include: {
              items: true
            }
          });

        if (!current) {
          return null;
        }

        if (!current.esVigente) {
          return "RESERVATION_NOT_ACTIVE" as const;
        }

        const replacementDate =
          data.fechaReserva ??
          todayIsoDate();

        const before =
          buildBookingSnapshot(current);

        const oldUpdated =
          await tx.proveedorReserva.update({
            where: {
              id: current.id
            },

            data: {
              estadoOperativo:
                "REEMPLAZADA",

              esVigente: false,

              fechaCancelacion:
                toDateOnly(
                  replacementDate
                ),

              motivoCancelacion:
                data.motivoReemplazo,

              updatedBy:
                userId ?? null
            }
          });

        await tx.proveedorReservaEvento.create({
          data: {
            idProveedorReserva:
              current.id,

            idUsuario:
              userId ?? null,

            tipo: "REEMPLAZADA",

            descripcion:
              data.motivoReemplazo,

            datosAnteriores:
              before as Prisma.InputJsonValue,

            datosNuevos:
              buildBookingSnapshot(
                oldUpdated
              ) as Prisma.InputJsonValue
          }
        });

        const finalPlannedCharge =
          data.fechaPrevistaCobro ===
          undefined
            ? current.fechaPrevistaCobro
            : data.fechaPrevistaCobro
              ? toDateOnly(
                  data.fechaPrevistaCobro
                )
              : null;

        const finalValue =
          data.valorContratado ===
          undefined
            ? current.valorContratado
            : decimalOrNull(
                data.valorContratado
              );

        const newReservation =
          await tx.proveedorReserva.create({
            data: {
              idReserva:
                current.idReserva,

              idProveedor:
                current.idProveedor,

              idProveedorReservaAnterior:
                current.id,

              codigoInterno:
                buildProviderBookingCode(
                  current.idReserva,
                  current.items[0]
                    ?.idReservaItem ??
                    current.id
                ),

              codigoProveedor:
                data.codigoProveedor,

              estadoOperativo:
                data.estadoOperativo,

              estadoFinanciero:
                getInitialFinancialState(
                  finalPlannedCharge
                ),

              esVigente: true,

              fechaReserva:
                toDateOnly(
                  replacementDate
                ),

              fechaConfirmacion:
                data.fechaConfirmacion ===
                null
                  ? null
                  : data.fechaConfirmacion
                    ? toDateOnly(
                        data.fechaConfirmacion
                      )
                    : data.estadoOperativo ===
                        "CONFIRMADA"
                      ? toDateOnly(
                          replacementDate
                        )
                      : null,

              fechaPrevistaCobro:
                finalPlannedCharge,

              tipoCancelacion:
                data.tipoCancelacion ===
                undefined
                  ? current.tipoCancelacion
                  : data.tipoCancelacion,

              fechaLimiteCancelacion:
                data.fechaLimiteCancelacion ===
                undefined
                  ? current.fechaLimiteCancelacion
                  : data.fechaLimiteCancelacion
                    ? toDateOnly(
                        data.fechaLimiteCancelacion
                      )
                    : null,

              valorContratado:
                finalValue,

              monedaCodigo:
                data.monedaCodigo ??
                current.monedaCodigo,

              notaAdministrativa:
                data.notaAdministrativa ===
                undefined
                  ? current.notaAdministrativa
                  : data.notaAdministrativa
                      ?.trim() || null,

              createdBy:
                userId ?? null,

              updatedBy:
                userId ?? null,

              items: {
                create:
                  current.items.map(
                    (item) => ({
                      idReservaItem:
                        item.idReservaItem,

                      idReservaColumnaSeleccionada:
                        item.idReservaColumnaSeleccionada,

                      valorAsignado:
                        item.esPrincipal &&
                        current.items.length === 1
                          ? finalValue
                          : item.valorAsignado,

                      esPrincipal:
                        item.esPrincipal
                    })
                  )
              }
            }
          });

        await tx.proveedorReservaEvento.create({
          data: {
            idProveedorReserva:
              newReservation.id,

            idUsuario:
              userId ?? null,

            tipo: "CREADA",

            descripcion:
              `Creada como reemplazo de ${current.codigoInterno}`,

            datosNuevos:
              buildBookingSnapshot(
                newReservation
              ) as Prisma.InputJsonValue
          }
        });

        return {
          id: newReservation.id
        };
      }
    );
  }
}

export const comprasProveedorReplaceRepository =
  new ComprasProveedorReplaceRepository();