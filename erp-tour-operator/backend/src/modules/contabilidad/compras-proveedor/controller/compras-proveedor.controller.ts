// erp-tour-operator/backend/src/modules/contabilidad/compras-proveedor/controller/compras-proveedor.controller.ts

import type {
  Request,
  Response
} from "express";

import { ok } from "@/core/utils/api-response";
import { getRequestUserId } from "@/core/utils/request-user";

import {
  comprasProveedorCancelSchema,
  comprasProveedorCreateSchema,
  comprasProveedorPaymentCreateSchema,
  comprasProveedorPaymentUpdateSchema,
  comprasProveedorPaymentVoidSchema,
  comprasProveedorListQuerySchema,
  comprasProveedorRefundCreateSchema,
  comprasProveedorReplaceSchema,
  comprasProveedorUpdateSchema
} from "@/modules/contabilidad/compras-proveedor/dto/compras-proveedor.dto";

import { comprasProveedorService } from "@/modules/contabilidad/compras-proveedor/service/compras-proveedor.service";

export class ComprasProveedorController {
  list = async (
    req: Request,
    res: Response
  ) => {
    const query =
      comprasProveedorListQuerySchema.parse(
        req.query
      );

    const data =
      await comprasProveedorService.list(
        query
      );

    res.json(ok(data));
  };

  getById = async (
    req: Request,
    res: Response
  ) => {
    const data =
      await comprasProveedorService.getById(
        Number(
          req.params.proveedorReservaId
        )
      );

    res.json(ok(data));
  };

  getHistoryByItem = async (
    req: Request,
    res: Response
  ) => {
    const data =
      await comprasProveedorService.getHistoryByItem(
        Number(req.params.itemId)
      );

    res.json(ok(data));
  };

  createForItem = async (
    req: Request,
    res: Response
  ) => {
    const body =
      comprasProveedorCreateSchema.parse(
        req.body
      );

    const data =
      await comprasProveedorService.createForItem(
        Number(req.params.itemId),
        body,
        getRequestUserId(req)
      );

    res.status(201).json(ok(data));
  };

  update = async (
    req: Request,
    res: Response
  ) => {
    const body =
      comprasProveedorUpdateSchema.parse(
        req.body
      );

    const data =
      await comprasProveedorService.update(
        Number(
          req.params.proveedorReservaId
        ),
        body,
        getRequestUserId(req)
      );

    res.json(ok(data));
  };

  cancel = async (
    req: Request,
    res: Response
  ) => {
    const body =
      comprasProveedorCancelSchema.parse(
        req.body
      );

    const data =
      await comprasProveedorService.cancel(
        Number(
          req.params.proveedorReservaId
        ),
        body,
        getRequestUserId(req)
      );

    res.json(ok(data));
  };

  replace = async (
    req: Request,
    res: Response
  ) => {
    const body =
      comprasProveedorReplaceSchema.parse(
        req.body
      );

    const data =
      await comprasProveedorService.replace(
        Number(
          req.params.proveedorReservaId
        ),
        body,
        getRequestUserId(req)
      );

    res.status(201).json(ok(data));
  };

  createPayment = async (
    req: Request,
    res: Response
  ) => {
    const body =
      comprasProveedorPaymentCreateSchema.parse(
        req.body
      );

    const data =
      await comprasProveedorService.createPayment(
        Number(
          req.params.proveedorReservaId
        ),
        body,
        getRequestUserId(req)
      );

    res.status(201).json(ok(data));
  };

  createRefund = async (
    req: Request,
    res: Response
  ) => {
    const body =
      comprasProveedorRefundCreateSchema.parse(
        req.body
      );

    const {
      tipo: _tipo,
      ...refundData
    } = body;

    const data =
      await comprasProveedorService.createRefund(
        Number(
          req.params.proveedorReservaId
        ),
        refundData,
        getRequestUserId(req)
      );

    res.status(201).json(ok(data));
  };

  updatePayment = async (
    req: Request,
    res: Response
  ) => {
    const body =
      comprasProveedorPaymentUpdateSchema.parse(
        req.body
      );

    const data =
      await comprasProveedorService.updatePayment(
        Number(req.params.pagoId),
        body,
        getRequestUserId(req)
      );

    res.json(ok(data));
  };

  voidPayment = async (
    req: Request,
    res: Response
  ) => {
    const body =
      comprasProveedorPaymentVoidSchema.parse(
        req.body
      );

    const data =
      await comprasProveedorService.voidPayment(
        Number(req.params.pagoId),
        body,
        getRequestUserId(req)
      );

    res.json(ok(data));
  };
}

export const comprasProveedorController =
  new ComprasProveedorController();