import { Router } from "express";

import { authenticate } from "@/core/middleware/authenticate";
import { validateBody, validateParams } from "@/core/middleware/validate-request";
import { asyncHandler } from "@/core/utils/async-handler";
import { liquidacionController } from "@/modules/liquidacion/controller/liquidacion.controller";
import {
  confirmacionComercialSchema,
  liquidacionReservaIdParamSchema
} from "@/modules/liquidacion/validator/liquidacion.validator";

export const liquidacionRouter = Router();

liquidacionRouter.use(authenticate);
liquidacionRouter.post(
  "/reserva/:id/confirmacion-comercial",
  validateParams(liquidacionReservaIdParamSchema),
  validateBody(confirmacionComercialSchema),
  asyncHandler(liquidacionController.registerConfirmacionComercial)
);
liquidacionRouter.post(
  "/reserva/:id/recalcular",
  validateParams(liquidacionReservaIdParamSchema),
  asyncHandler(liquidacionController.recalculate)
);
liquidacionRouter.post(
  "/reserva/:id/cerrar",
  validateParams(liquidacionReservaIdParamSchema),
  asyncHandler(liquidacionController.close)
);
