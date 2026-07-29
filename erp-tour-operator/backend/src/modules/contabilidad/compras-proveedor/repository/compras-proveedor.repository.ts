// erp-tour-operator/backend/src/modules/contabilidad/compras-proveedor/repository/compras-proveedor.repository.ts

import type {
  ComprasProveedorCancelInput,
  ComprasProveedorCreateInput,
  ComprasProveedorPaymentCreateInput,
  ComprasProveedorPaymentUpdateInput,
  ComprasProveedorPaymentVoidInput,
  ComprasProveedorReplaceInput,
  ComprasProveedorUpdateInput
} from "@/modules/contabilidad/compras-proveedor/dto/compras-proveedor.dto";

import { comprasProveedorCancelRepository } from "@/modules/contabilidad/compras-proveedor/repository/compras-proveedor-cancel.repository";
import { comprasProveedorCreateRepository } from "@/modules/contabilidad/compras-proveedor/repository/compras-proveedor-create.repository";
import { comprasProveedorPaymentsRepository } from "@/modules/contabilidad/compras-proveedor/repository/compras-proveedor-payments.repository";
import { comprasProveedorReplaceRepository } from "@/modules/contabilidad/compras-proveedor/repository/compras-proveedor-replace.repository";
import { comprasProveedorUpdateRepository } from "@/modules/contabilidad/compras-proveedor/repository/compras-proveedor-update.repository";

export class ComprasProveedorRepository {
  createForItem(
    itemId: number,
    data: ComprasProveedorCreateInput,
    userId?: number | null
  ) {
    return comprasProveedorCreateRepository.createForItem(
      itemId,
      data,
      userId
    );
  }

  update(
    proveedorReservaId: number,
    data: ComprasProveedorUpdateInput,
    userId?: number | null
  ) {
    return comprasProveedorUpdateRepository.update(
      proveedorReservaId,
      data,
      userId
    );
  }

  cancel(
    proveedorReservaId: number,
    data: ComprasProveedorCancelInput,
    userId?: number | null
  ) {
    return comprasProveedorCancelRepository.cancel(
      proveedorReservaId,
      data,
      userId
    );
  }

  replace(
    proveedorReservaId: number,
    data: ComprasProveedorReplaceInput,
    userId?: number | null
  ) {
    return comprasProveedorReplaceRepository.replace(
      proveedorReservaId,
      data,
      userId
    );
  }

  createPayment(
    proveedorReservaId: number,
    data: ComprasProveedorPaymentCreateInput,
    userId?: number | null
  ) {
    return comprasProveedorPaymentsRepository.create(
      proveedorReservaId,
      data,
      userId
    );
  }

  updatePayment(
    paymentId: number,
    data: ComprasProveedorPaymentUpdateInput,
    userId?: number | null
  ) {
    return comprasProveedorPaymentsRepository.update(
      paymentId,
      data,
      userId
    );
  }

  voidPayment(
    paymentId: number,
    data: ComprasProveedorPaymentVoidInput,
    userId?: number | null
  ) {
    return comprasProveedorPaymentsRepository.void(
      paymentId,
      data,
      userId
    );
  }
}

export const comprasProveedorRepository =
  new ComprasProveedorRepository();