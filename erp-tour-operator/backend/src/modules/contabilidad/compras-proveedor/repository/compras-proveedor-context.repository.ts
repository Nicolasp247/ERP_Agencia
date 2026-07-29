// erp-tour-operator/backend/src/modules/contabilidad/compras-proveedor/repository/compras-proveedor-context.repository.ts

import {
  Prisma,
  type ProveedorReservaEstadoFinanciero
} from "@prisma/client";

import {
  getPreferredColumnType,
  selectApplicableColumn,
  toColumnType
} from "@/modules/contabilidad/compras-proveedor/repository/compras-proveedor.helpers";

export function decimalOrNull(
  value: number | null | undefined
) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  return new Prisma.Decimal(value);
}

export function getInitialFinancialState(
  fechaPrevistaCobro:
    | string
    | Date
    | null
    | undefined
): ProveedorReservaEstadoFinanciero {
  return fechaPrevistaCobro
    ? "PAGO_PROGRAMADO"
    : "SIN_PAGAR";
}

export async function findItemContext(
  tx: Prisma.TransactionClient,
  itemId: number
) {
  return tx.reservaItem.findUnique({
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
          idReservaColumnaSeleccionada:
            true,

          precioCotizado: true,
          precioConfirmado: true
        }
      }
    }
  });
}

export type ProviderPurchaseItemContext =
  NonNullable<
    Awaited<
      ReturnType<typeof findItemContext>
    >
  >;

export async function findApplicableColumn(
  tx: Prisma.TransactionClient,
  item: ProviderPurchaseItemContext
) {
  const pricesWithValue =
    item.preciosSeleccionados.filter(
      (price) =>
        price.precioConfirmado !== null ||
        price.precioCotizado !== null
    );

  if (!pricesWithValue.length) {
    return null;
  }

  const columnIds = [
    ...new Set(
      pricesWithValue.map(
        (price) =>
          price.idReservaColumnaSeleccionada
      )
    )
  ];

  const columns =
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

  const preferredType =
    getPreferredColumnType(
      item.servicio.tipo?.nombre,
      item.servicio.tipo?.codigo,
      item.esOpcional
    );

  return selectApplicableColumn(
    columns.map((column) => ({
      id: column.id,
      tipo: toColumnType(
        column.tipoSnapshot
      ),
      orden: column.orden
    })),
    preferredType
  );
}