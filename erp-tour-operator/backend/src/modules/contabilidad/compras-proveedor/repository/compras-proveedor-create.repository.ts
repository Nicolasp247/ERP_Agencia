// erp-tour-operator/backend/src/modules/contabilidad/compras-proveedor/repository/compras-proveedor-create.repository.ts

import { Prisma } from "@prisma/client";

import { prisma } from "@/core/db/prisma";

import type { ComprasProveedorCreateInput } from "@/modules/contabilidad/compras-proveedor/dto/compras-proveedor.dto";

import {
  buildBookingSnapshot,
  buildProviderBookingCode,
  toDateOnly,
  todayIsoDate
} from "@/modules/contabilidad/compras-proveedor/repository/compras-proveedor.helpers";

import {
  decimalOrNull,
  findApplicableColumn,
  findItemContext,
  getInitialFinancialState
} from "@/modules/contabilidad/compras-proveedor/repository/compras-proveedor-context.repository";

export class ComprasProveedorCreateRepository {
  async createForItem(
    itemId: number,
    data: ComprasProveedorCreateInput,
    userId?: number | null
  ) {
    return prisma.$transaction(
      async (tx) => {
        const item =
          await findItemContext(
            tx,
            itemId
          );

        if (!item) {
          return null;
        }

        if (!item.servicio.idProveedor) {
          return "PROVIDER_NOT_FOUND" as const;
        }

        const existingActive =
          await tx.proveedorReservaItem.findFirst({
            where: {
              idReservaItem: itemId,

              proveedorReserva: {
                is: {
                  esVigente: true
                }
              }
            },

            select: {
              idProveedorReserva: true
            }
          });

        if (existingActive) {
          return "ACTIVE_RESERVATION_EXISTS" as const;
        }

        const selectedColumn =
          await findApplicableColumn(
            tx,
            item
          );

        if (!selectedColumn) {
          return "PRICE_COLUMN_NOT_FOUND" as const;
        }

        const fechaReserva =
          data.fechaReserva ??
          todayIsoDate();

        const fechaConfirmacion =
          data.fechaConfirmacion === null
            ? null
            : data.fechaConfirmacion
              ? toDateOnly(
                  data.fechaConfirmacion
                )
              : data.estadoOperativo ===
                    "CONFIRMADA"
                ? toDateOnly(fechaReserva)
                : null;

        const created =
          await tx.proveedorReserva.create({
            data: {
              idReserva:
                item.idReserva,

              idProveedor:
                item.servicio.idProveedor,

              codigoInterno:
                buildProviderBookingCode(
                  item.idReserva,
                  item.id
                ),

              codigoProveedor:
                data.codigoProveedor
                  ?.trim() || null,

              estadoOperativo:
                data.estadoOperativo,

              estadoFinanciero:
                getInitialFinancialState(
                  data.fechaPrevistaCobro
                ),

              esVigente: true,

              fechaReserva:
                toDateOnly(fechaReserva),

              fechaConfirmacion,

              fechaPrevistaCobro:
                data.fechaPrevistaCobro
                  ? toDateOnly(
                      data.fechaPrevistaCobro
                    )
                  : null,

              tipoCancelacion:
                data.tipoCancelacion ??
                null,

              fechaLimiteCancelacion:
                data.fechaLimiteCancelacion
                  ? toDateOnly(
                      data.fechaLimiteCancelacion
                    )
                  : null,

              valorContratado:
                decimalOrNull(
                  data.valorContratado
                ),

              monedaCodigo:
                data.monedaCodigo,

              notaAdministrativa:
                data.notaAdministrativa
                  ?.trim() || null,

              createdBy:
                userId ?? null,

              updatedBy:
                userId ?? null,

              items: {
                create: {
                  idReservaItem:
                    item.id,

                  idReservaColumnaSeleccionada:
                    selectedColumn.id,

                  valorAsignado:
                    decimalOrNull(
                      data.valorContratado
                    ),

                  esPrincipal: true
                }
              }
            }
          });

        await tx.proveedorReservaEvento.create({
          data: {
            idProveedorReserva:
              created.id,

            idUsuario:
              userId ?? null,

            tipo: "CREADA",

            descripcion:
              "Reserva de proveedor creada desde Confirmación Builder",

            datosNuevos:
              buildBookingSnapshot(
                created
              ) as Prisma.InputJsonValue
          }
        });

        return {
          id: created.id
        };
      }
    );
  }
}

export const comprasProveedorCreateRepository =
  new ComprasProveedorCreateRepository();