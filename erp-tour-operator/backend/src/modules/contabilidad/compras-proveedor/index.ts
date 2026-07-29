// erp-tour-operator/backend/src/modules/contabilidad/compras-proveedor/index.ts

import { Router } from "express";
import { z } from "zod";

import { authenticate } from "@/core/middleware/authenticate";
import { validateParams } from "@/core/middleware/validate-request";
import { asyncHandler } from "@/core/utils/async-handler";

import { comprasProveedorController } from "@/modules/contabilidad/compras-proveedor/controller/compras-proveedor.controller";

const itemParamsSchema = z.object({
  itemId: z.coerce
    .number()
    .int()
    .positive()
});

const bookingParamsSchema = z.object({
  proveedorReservaId: z.coerce
    .number()
    .int()
    .positive()
});

const paymentParamsSchema = z.object({
  pagoId: z.coerce
    .number()
    .int()
    .positive()
});

export const comprasProveedorRouter =
  Router();

comprasProveedorRouter.use(
  authenticate
);

comprasProveedorRouter.get(
  "/",
  asyncHandler(
    comprasProveedorController.list
  )
);

comprasProveedorRouter.get(
  "/items/:itemId",
  validateParams(itemParamsSchema),
  asyncHandler(
    comprasProveedorController
      .getHistoryByItem
  )
);

comprasProveedorRouter.post(
  "/items/:itemId",
  validateParams(itemParamsSchema),
  asyncHandler(
    comprasProveedorController
      .createForItem
  )
);

comprasProveedorRouter.get(
  "/reservas/:proveedorReservaId",
  validateParams(
    bookingParamsSchema
  ),
  asyncHandler(
    comprasProveedorController.getById
  )
);

comprasProveedorRouter.put(
  "/reservas/:proveedorReservaId",
  validateParams(
    bookingParamsSchema
  ),
  asyncHandler(
    comprasProveedorController.update
  )
);

comprasProveedorRouter.post(
  "/reservas/:proveedorReservaId/cancelar",
  validateParams(
    bookingParamsSchema
  ),
  asyncHandler(
    comprasProveedorController.cancel
  )
);

comprasProveedorRouter.post(
  "/reservas/:proveedorReservaId/reemplazar",
  validateParams(
    bookingParamsSchema
  ),
  asyncHandler(
    comprasProveedorController.replace
  )
);

comprasProveedorRouter.post(
  "/reservas/:proveedorReservaId/pagos",
  validateParams(
    bookingParamsSchema
  ),
  asyncHandler(
    comprasProveedorController.createPayment
  )
);

comprasProveedorRouter.post(
  "/reservas/:proveedorReservaId/reembolsos",
  validateParams(
    bookingParamsSchema
  ),
  asyncHandler(
    comprasProveedorController.createRefund
  )
);

comprasProveedorRouter.put(
  "/pagos/:pagoId",
  validateParams(
    paymentParamsSchema
  ),
  asyncHandler(
    comprasProveedorController.updatePayment
  )
);

comprasProveedorRouter.post(
  "/pagos/:pagoId/anular",
  validateParams(
    paymentParamsSchema
  ),
  asyncHandler(
    comprasProveedorController.voidPayment
  )
);