/* erp-tour-operator/backend/src/modules/reserva/index.ts */

import { Router } from "express";

import { authenticate } from "@/core/middleware/authenticate";
import { validateBody, validateParams, validateQuery } from "@/core/middleware/validate-request";
import { asyncHandler } from "@/core/utils/async-handler";
import { reservaController } from "@/modules/reserva/controller/reserva.controller";
import {
  reservaCancelSchema,
  reservaConfirmacionItemSchema,
  reservaFilterSchema,
  reservaIdParamSchema,
  reservaItemIdParamSchema,
  reservaUpdateSchema
} from "@/modules/reserva/validator/reserva.validator";

export const reservaRouter = Router();

reservaRouter.use(authenticate);
reservaRouter.get("/", validateQuery(reservaFilterSchema), asyncHandler(reservaController.list));
reservaRouter.get("/:id", validateParams(reservaIdParamSchema), asyncHandler(reservaController.getById));
reservaRouter.put(
  "/:id",
  validateParams(reservaIdParamSchema),
  validateBody(reservaUpdateSchema),
  asyncHandler(reservaController.updateOperational)
);
reservaRouter.patch(
  "/:id/items/:itemId/confirmacion",
  validateParams(reservaItemIdParamSchema),
  validateBody(reservaConfirmacionItemSchema),
  asyncHandler(reservaController.registerItemConfirmation)
);
reservaRouter.patch(
  "/:id/cancelar",
  validateParams(reservaIdParamSchema),
  validateBody(reservaCancelSchema),
  asyncHandler(reservaController.cancel)
);
