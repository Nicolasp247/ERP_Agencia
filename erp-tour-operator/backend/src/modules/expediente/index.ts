/* erp-tour-operator/backend/src/modules/expediente/index.ts */

import { Router } from "express";

import { authenticate } from "@/core/middleware/authenticate";
import { validateBody, validateParams, validateQuery } from "@/core/middleware/validate-request";
import { asyncHandler } from "@/core/utils/async-handler";
import { expedienteController } from "@/modules/expediente/controller/expediente.controller";
import {
  expedienteFilterSchema,
  expedienteIdParamSchema,
  expedienteSchema
} from "@/modules/expediente/validator/expediente.validator";

export const expedienteRouter = Router();

expedienteRouter.use(authenticate);

expedienteRouter.get(
  "/",
  validateQuery(expedienteFilterSchema),
  asyncHandler(expedienteController.list)
);

expedienteRouter.get(
  "/:id",
  validateParams(expedienteIdParamSchema),
  asyncHandler(expedienteController.getById)
);

expedienteRouter.post(
  "/",
  validateBody(expedienteSchema),
  asyncHandler(expedienteController.create)
);

expedienteRouter.post(
  "/:id/itinerarios",
  validateParams(expedienteIdParamSchema),
  asyncHandler(expedienteController.createItineraryVersion)
);

expedienteRouter.put(
  "/:id",
  validateParams(expedienteIdParamSchema),
  validateBody(expedienteSchema),
  asyncHandler(expedienteController.update)
);

expedienteRouter.post(
  "/:id/discard",
  validateParams(expedienteIdParamSchema),
  asyncHandler(expedienteController.discard)
);

expedienteRouter.post(
  "/:id/convert-to-reserva",
  validateParams(expedienteIdParamSchema),
  asyncHandler(expedienteController.convertToReserva)
);