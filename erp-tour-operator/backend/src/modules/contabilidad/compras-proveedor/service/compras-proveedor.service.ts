// erp-tour-operator/backend/src/modules/contabilidad/compras-proveedor/service/compras-proveedor.service.ts

import { AppError } from "@/core/errors/app-error";

import type {
  ComprasProveedorCancelInput,
  ComprasProveedorCreateInput,
  ComprasProveedorPaymentCreateInput,
  ComprasProveedorPaymentUpdateInput,
  ComprasProveedorPaymentVoidInput,
  ComprasProveedorReplaceInput,
  ComprasProveedorUpdateInput
} from "@/modules/contabilidad/compras-proveedor/dto/compras-proveedor.dto";

import {
  toCompraProveedorDetail,
  toCompraProveedorHistory
} from "@/modules/contabilidad/compras-proveedor/mapper/compras-proveedor.mapper";

import { comprasProveedorReadRepository } from "@/modules/contabilidad/compras-proveedor/repository/compras-proveedor-read.repository";
import { comprasProveedorRepository } from "@/modules/contabilidad/compras-proveedor/repository/compras-proveedor.repository";

export class ComprasProveedorService {
  async getById(
    proveedorReservaId: number
  ) {
    const record =
      await comprasProveedorReadRepository.findById(
        proveedorReservaId
      );

    if (!record) {
      throw new AppError(
        404,
        "PROVEEDOR_RESERVA_NOT_FOUND",
        "Reserva de proveedor no encontrada"
      );
    }

    return toCompraProveedorDetail(
      record
    );
  }

  async getHistoryByItem(
    itemId: number
  ) {
    const records =
      await comprasProveedorReadRepository.findByItemId(
        itemId
      );

    return toCompraProveedorHistory(
      records
    );
  }

  async createForItem(
    itemId: number,
    data: ComprasProveedorCreateInput,
    userId?: number
  ) {
    const result =
      await comprasProveedorRepository.createForItem(
        itemId,
        data,
        userId ?? null
      );

    if (!result) {
      throw new AppError(
        404,
        "RESERVA_ITEM_NOT_FOUND",
        "Servicio confirmado no encontrado"
      );
    }

    if (result === "PROVIDER_NOT_FOUND") {
      throw new AppError(
        400,
        "RESERVA_ITEM_WITHOUT_PROVIDER",
        "El servicio debe tener un proveedor"
      );
    }

    if (result === "PRICE_COLUMN_NOT_FOUND") {
      throw new AppError(
        400,
        "PROVIDER_BOOKING_PRICE_COLUMN_NOT_FOUND",
        "El servicio debe tener un precio registrado en una columna de la confirmación"
      );
    }

    if (result === "ACTIVE_RESERVATION_EXISTS") {
      throw new AppError(
        409,
        "ACTIVE_PROVIDER_RESERVATION_EXISTS",
        "El servicio ya tiene una reserva de proveedor vigente. Debes corregirla, cancelarla o reemplazarla."
      );
    }

    return this.getById(
      result.id
    );
  }

  async update(
    proveedorReservaId: number,
    data: ComprasProveedorUpdateInput,
    userId?: number
  ) {
    const result =
      await comprasProveedorRepository.update(
        proveedorReservaId,
        data,
        userId ?? null
      );

    if (!result) {
      throw new AppError(
        404,
        "PROVEEDOR_RESERVA_NOT_FOUND",
        "Reserva de proveedor no encontrada"
      );
    }

    if (result === "RESERVATION_NOT_ACTIVE") {
      throw new AppError(
        409,
        "PROVEEDOR_RESERVA_NOT_ACTIVE",
        "Una reserva cancelada o reemplazada no puede modificarse"
      );
    }

    return this.getById(
      result.id
    );
  }

  async cancel(
    proveedorReservaId: number,
    data: ComprasProveedorCancelInput,
    userId?: number
  ) {
    const result =
      await comprasProveedorRepository.cancel(
        proveedorReservaId,
        data,
        userId ?? null
      );

    if (!result) {
      throw new AppError(
        404,
        "PROVEEDOR_RESERVA_NOT_FOUND",
        "Reserva de proveedor no encontrada"
      );
    }

    if (result === "RESERVATION_NOT_ACTIVE") {
      throw new AppError(
        409,
        "PROVEEDOR_RESERVA_NOT_ACTIVE",
        "La reserva ya no está vigente"
      );
    }

    return this.getById(
      result.id
    );
  }

  async replace(
    proveedorReservaId: number,
    data: ComprasProveedorReplaceInput,
    userId?: number
  ) {
    const result =
      await comprasProveedorRepository.replace(
        proveedorReservaId,
        data,
        userId ?? null
      );

    if (!result) {
      throw new AppError(
        404,
        "PROVEEDOR_RESERVA_NOT_FOUND",
        "Reserva de proveedor no encontrada"
      );
    }

    if (result === "RESERVATION_NOT_ACTIVE") {
      throw new AppError(
        409,
        "PROVEEDOR_RESERVA_NOT_ACTIVE",
        "Solo una reserva vigente puede ser reemplazada"
      );
    }

    return this.getById(
      result.id
    );
  }

  async createPayment(
    proveedorReservaId: number,
    data: ComprasProveedorPaymentCreateInput,
    userId?: number
  ) {
    const result =
      await comprasProveedorRepository.createPayment(
        proveedorReservaId,
        data,
        userId ?? null
      );

    if (!result) {
      throw new AppError(
        404,
        "PROVEEDOR_RESERVA_NOT_FOUND",
        "Reserva de proveedor no encontrada"
      );
    }

    return this.getById(
      result.idProveedorReserva
    );
  }

  async createRefund(
    proveedorReservaId: number,
    data: Omit<
      ComprasProveedorPaymentCreateInput,
      "tipo"
    >,
    userId?: number
  ) {
    return this.createPayment(
      proveedorReservaId,
      {
        ...data,
        tipo: "REEMBOLSO"
      },
      userId
    );
  }

  async updatePayment(
    paymentId: number,
    data: ComprasProveedorPaymentUpdateInput,
    userId?: number
  ) {
    const result =
      await comprasProveedorRepository.updatePayment(
        paymentId,
        data,
        userId ?? null
      );

    if (!result) {
      throw new AppError(
        404,
        "PROVEEDOR_RESERVA_PAGO_NOT_FOUND",
        "Movimiento financiero no encontrado"
      );
    }

    if (result === "PAYMENT_VOIDED") {
      throw new AppError(
        409,
        "PROVEEDOR_RESERVA_PAGO_VOIDED",
        "Un movimiento anulado no puede modificarse"
      );
    }

    return this.getById(
      result.idProveedorReserva
    );
  }

  async voidPayment(
    paymentId: number,
    data: ComprasProveedorPaymentVoidInput,
    userId?: number
  ) {
    const result =
      await comprasProveedorRepository.voidPayment(
        paymentId,
        data,
        userId ?? null
      );

    if (!result) {
      throw new AppError(
        404,
        "PROVEEDOR_RESERVA_PAGO_NOT_FOUND",
        "Movimiento financiero no encontrado"
      );
    }

    if (
      result === "PAYMENT_ALREADY_VOIDED"
    ) {
      throw new AppError(
        409,
        "PROVEEDOR_RESERVA_PAGO_ALREADY_VOIDED",
        "El movimiento ya se encuentra anulado"
      );
    }

    return this.getById(
      result.idProveedorReserva
    );
  }
}

export const comprasProveedorService =
  new ComprasProveedorService();