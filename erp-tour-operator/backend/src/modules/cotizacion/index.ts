import { Router } from "express";

import { authenticate } from "@/core/middleware/authenticate";
import { validateBody, validateParams, validateQuery } from "@/core/middleware/validate-request";
import { asyncHandler } from "@/core/utils/async-handler";
import { cotizacionController } from "@/modules/cotizacion/controller/cotizacion.controller";
import {
  cotizacionFilterSchema,
  cotizacionIdParamSchema,
  cotizacionSchema
} from "@/modules/cotizacion/validator/cotizacion.validator";

export const cotizacionRouter = Router();

cotizacionRouter.use(authenticate);
cotizacionRouter.get("/", validateQuery(cotizacionFilterSchema), asyncHandler(cotizacionController.list));
cotizacionRouter.get("/:id", validateParams(cotizacionIdParamSchema), asyncHandler(cotizacionController.getById));
cotizacionRouter.post("/", validateBody(cotizacionSchema), asyncHandler(cotizacionController.create));
cotizacionRouter.put(
  "/:id",
  validateParams(cotizacionIdParamSchema),
  validateBody(cotizacionSchema),
  asyncHandler(cotizacionController.update)
);
cotizacionRouter.post(
  "/:id/discard",
  validateParams(cotizacionIdParamSchema),
  asyncHandler(cotizacionController.discard)
);
cotizacionRouter.post(
  "/:id/convert-to-reserva",
  validateParams(cotizacionIdParamSchema),
  asyncHandler(cotizacionController.convertToReserva)
);
