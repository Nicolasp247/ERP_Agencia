/* erp-tour-operator/backend/src/modules/expediente/confirmacion-builder/repository/confirmacion-builder-purchases.repository.ts */

import { Prisma } from "@prisma/client";

import { prisma } from "@/core/db/prisma";
import type { ConfirmacionBuilderPurchaseInput } from "@/modules/expediente/confirmacion-builder/dto/confirmacion-builder.dto";
import { includeConfirmacionBuilderDetail } from "@/modules/expediente/confirmacion-builder/repository/confirmacion-builder.include";
import { toDateOnly } from "@/modules/expediente/confirmacion-builder/repository/confirmacion-builder.helpers";

type ColumnType =
  | "TERRESTRE"
  | "TRANSPORTE"
  | "OPCIONALES"
  | "OTRO";

type PriceCandidate = {
  columnId: number;
  tipo: ColumnType;
  orden: number;
};

function buildCompraProveedorCode(
  reservaId: number,
  itemId: number
) {
  const year = new Date().getUTCFullYear();

  return [
    "CP",
    year,
    String(reservaId).padStart(6, "0"),
    String(itemId).padStart(6, "0")
  ].join("-");
}

function normalizeText(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function getPreferredColumnType(
  serviceTypeName: string | null,
  serviceTypeCode: string | null,
  esOpcional: boolean
): ColumnType {
  if (esOpcional) {
    return "OPCIONALES";
  }

  const normalizedType = [
    normalizeText(serviceTypeName),
    normalizeText(serviceTypeCode)
  ].join(" ");

  if (
    normalizedType.includes("vuelo") ||
    normalizedType.includes("tren") ||
    normalizedType.includes("barco") ||
    normalizedType.includes("ferry") ||
    normalizedType.includes("crucero")
  ) {
    return "TRANSPORTE";
  }

  if (normalizedType.includes("otro")) {
    return "OTRO";
  }

  return "TERRESTRE";
}

function selectApplicableColumn(
  candidates: PriceCandidate[],
  preferredType: ColumnType
) {
  if (!candidates.length) {
    return null;
  }

  if (candidates.length === 1) {
    return candidates[0];
  }

  const preferredCandidates = candidates
    .filter(
      (candidate) =>
        candidate.tipo === preferredType
    )
    .sort(
      (left, right) =>
        left.orden - right.orden
    );

  if (preferredCandidates.length > 0) {
    return preferredCandidates[0];
  }

  return [...candidates].sort(
    (left, right) =>
      left.orden - right.orden
  )[0];
}

export class ConfirmacionBuilderPurchasesRepository {
  async upsertItemPurchase(
    itemId: number,
    data: ConfirmacionBuilderPurchaseInput,
    userId?: number | null
  ) {
    return prisma.$transaction(async (tx) => {
      const item = await tx.reservaItem.findUnique({
        where: {
          id: itemId
        },
        select: {
          id: true,
          idReserva: true,
          esOpcional: true,

          servicio: {
            select: {
              idProveedor: true,

              tipo: {
                select: {
                  nombre: true,
                  codigo: true
                }
              }
            }
          },

          preciosSeleccionados: {
            select: {
              idReservaColumnaSeleccionada: true,
              precioCotizado: true,
              precioConfirmado: true
            }
          },

          compraProveedorItem: {
            select: {
              idCompraProveedor: true
            }
          }
        }
      });

      if (!item) {
        return null;
      }

      if (!item.servicio.idProveedor) {
        return "PROVEEDOR_NOT_FOUND" as const;
      }

      const pricesWithValue =
        item.preciosSeleccionados.filter(
          (price) =>
            price.precioConfirmado !== null ||
            price.precioCotizado !== null
        );

      if (!pricesWithValue.length) {
        return "PRICE_COLUMN_NOT_FOUND" as const;
      }

      const columnIds = [
        ...new Set(
          pricesWithValue.map(
            (price) =>
              price.idReservaColumnaSeleccionada
          )
        )
      ];

      const selectedColumns =
        await tx.reservaColumnaSeleccionada.findMany({
          where: {
            idReserva: item.idReserva,

            id: {
              in: columnIds
            }
          },

          select: {
            id: true,
            tipoSnapshot: true,
            orden: true
          }
        });

      const candidates: PriceCandidate[] =
        selectedColumns.map((column) => ({
          columnId: column.id,

          tipo:
            column.tipoSnapshot as ColumnType,

          orden:
            column.orden
        }));

      const preferredColumnType =
        getPreferredColumnType(
          item.servicio.tipo?.nombre ?? null,
          item.servicio.tipo?.codigo ?? null,
          item.esOpcional
        );

      const selectedColumn =
        selectApplicableColumn(
          candidates,
          preferredColumnType
        );

      if (!selectedColumn) {
        return "PRICE_COLUMN_NOT_FOUND" as const;
      }

      const purchaseData = {
        idProveedor:
          item.servicio.idProveedor,

        idReservaColumnaSeleccionada:
          selectedColumn.columnId,

        codigoConfirmacionProveedor:
          data.codigoConfirmacionProveedor
            ?.trim() || null,

        estado:
          data.estado,

        fechaConfirmacion:
          data.fechaConfirmacion
            ? toDateOnly(
                data.fechaConfirmacion
              )
            : null,

        tipoCancelacion:
          data.tipoCancelacion,

        fechaLimiteCancelacion:
          data.fechaLimiteCancelacion
            ? toDateOnly(
                data.fechaLimiteCancelacion
              )
            : null,

        totalPagado:
          data.totalPagado === null
            ? null
            : new Prisma.Decimal(
                data.totalPagado
              ),

        monedaCodigo:
          data.monedaCodigo.toUpperCase(),

        notaAdministrativa:
          data.notaAdministrativa
            ?.trim() || null,

        updatedBy:
          userId ?? null
      };

      if (item.compraProveedorItem) {
        await tx.compraProveedor.update({
          where: {
            id:
              item.compraProveedorItem
                .idCompraProveedor
          },

          data:
            purchaseData
        });
      } else {
        const compra =
          await tx.compraProveedor.create({
            data: {
              idReserva:
                item.idReserva,

              codigoInterno:
                buildCompraProveedorCode(
                  item.idReserva,
                  item.id
                ),

              ...purchaseData,

              createdBy:
                userId ?? null
            }
          });

        await tx.compraProveedorItem.create({
          data: {
            idCompraProveedor:
              compra.id,

            idReservaItem:
              item.id
          }
        });
      }

      return tx.reserva.findUnique({
        where: {
          id: item.idReserva
        },

        include:
          includeConfirmacionBuilderDetail
      });
    });
  }
}

export const confirmacionBuilderPurchasesRepository =
  new ConfirmacionBuilderPurchasesRepository();